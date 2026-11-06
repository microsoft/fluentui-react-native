---
id: desktop-test.reporting
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Reporting and artifacts

Each run writes `artifacts/desktop/<run-id>/` by default:

| Artifact       | Contents                                                         |
| -------------- | ---------------------------------------------------------------- |
| `events.jsonl` | Versioned, source-attributed journal                             |
| `run.json`     | Tests, attempts, selected work, failures, evidence, final status |
| `junit.xml`    | Test outcomes, infrastructure errors, and incomplete work        |
| `commands/`    | Bounded, redacted stdout/stderr logs with source attribution     |

Command output is redacted before it is logged or reported. Redaction covers the
secrets the harness registers and the values of environment variables whose
names contain `nonce`, `token`, `password`, `secret`, or `authorization`, when
the value is at least 8 characters long. Shorter values such as `true` or `0`
are flags, not credentials, and redacting them would rewrite machine-readable
output. Register a shorter credential explicitly with the reporter's
`addSecret`.

Stderr and test progress are live without verbose mode. Failed commands replay
the collected output. GitHub Actions grouping and annotations are rendered by
the supervisor; child output cannot issue workflow commands. Upload the full
run directory in an always-run artifact step.

Statuses preserve failures, retries, flaky tests, skips, unsupported
capabilities, and unfinished work. A zero worker exit cannot override failed
assertions or incomplete work. Optional suites can be skipped without being
labelled passed.

## CLI reporters

Select `--reporter auto|plain|github-actions|json|ndjson`; `--json` aliases
`--reporter json`. The mode is resolved from the CLI flag, `DESKTOP_REPORTER`,
the config's `reporting.reporter` (or legacy `reporting.console`), then `auto`.
The default `auto` mode uses GitHub Actions rendering only when
`GITHUB_ACTIONS=true`.

`json` writes one compact, bounded run summary rather than the full result.
`ndjson` writes run metadata, bounded canonical-event projections, a suppressed
event count, and the same summary as its final record. `--events` selects
`milestones` (default), `progress`, or `all`; `DESKTOP_EVENTS` can select the
same level for delegated commands. Event selection is valid only with NDJSON.
The summary is capped at 4 KiB and includes counts, up to 10 problems, omission
counts, and links to the authoritative `run.json`, `events.jsonl`, JUnit, and
command logs. Structured output suppresses normal human stderr. If stdout
closes, the run continues to persist its result and records a reporting
diagnostic.

SIGINT and SIGTERM cancel owned work; one-shot structured runs finish with an
`incomplete` summary instead of reporting cancellation as an infrastructure
failure. Long-lived readiness commands retain their single readiness document;
one that fails before readiness writes the summary instead.

The supervisor owns rendering. Delegated producers inherit the selected mode
and report into the parent journal; they do not create a second result
directory or render a duplicate summary.

Story-specific readiness, authenticated channel events, and callback execution
are owned by `@fluentui-react-native/storybook-desktop`.

## Persisted read queries

The direct `@fluentui-react-native/desktop-test/reporting/run-queries` entry
exports `DesktopRunQueryService`, `DesktopRunQueryClient`, and their request and
response contracts. This is a harness-local read API, not a management listener,
MCP tool, or execution/recovery API. Its credentials are distinct from driver
control grants. Connecting a reader only binds a credential; it never creates
a workload, producer, controller session, or application.

The collector atomically replaces `run.json` with an active snapshot after each
batch of events (coalesced within a JavaScript turn). Active snapshots have
`terminal: false` and cannot have a passing status. Only successful final
report persistence after producer/output accounting sets `terminal: true`.
Terminal means collection finished, not that coverage passed. A crashed
collector leaves its last snapshot nonterminal. Legacy reports lacking the
marker remain incomplete in queries, even if they say `passed`. Existing
`finishedAt` is the snapshot observation time until the terminal marker is set.
Persisted tests, work, failures, retries, and skips remain the authoritative
source; page size and worker exit codes do not decide coverage.

Trusted host code registers exact collector `{ runId, root, expiresAt }`
records and an optional `textArtifacts` relative-path allowlist, then issues a
read grant with exact `runIds`, an expiry, and optional `artifacts` permission:

```ts
import { DesktopRunQueryService } from '@fluentui-react-native/desktop-test/reporting/run-queries';

const queries = new DesktopRunQueryService(registeredSecrets);
queries.registerRun({
  runId: reporter.runId,
  root: reporter.root,
  expiresAt: retentionDeadline,
  textArtifacts: ['commands/build.log'],
});
const credential = queries.issueGrant({
  runIds: [reporter.runId],
  expiresAt: readerDeadline,
  artifacts: true,
});
const client = queries.connect(credential);
const status = await client.query({ operation: 'status', runId: reporter.runId });
```

Registration and grant issuance are **trusted operator/host operations**, never
model-facing inputs. Credentials stay in the host/client binding; requests and
persisted results contain no credentials. Host restart requires explicit
re-registration of retained runs and fresh grants, never execution replay.
The host must register all relevant secrets (including credentials for any
external integration); `addSecret` can update the read redactor. The collector
redacts before persistence, and queries redact again before clipping text.

Readers submit only an opaque run ID, a declared operation, and its bounded
parameters. `status` returns complete counts and terminal/coverage state.
`tests`, `work`, `failures`, and `artifacts` return pages with a default limit of
10 and maximum of 25, capped at 16 KiB. Page IDs do not expose producer IDs or
paths. Text fields are capped at 1 KiB after redaction. `omissions.items` counts
all items absent from that page (including preceding pages);
`omissions.textBytes` counts redacted UTF-8 bytes clipped within returned items.
Opaque `nextCursor` values are bound to the grant, run, collection, and exact
snapshot; a changed snapshot requires a new first page. The last 256 cursors
per grant are retained; older, forged, or cross-grant cursors fail explicitly.

Artifact listing and content both require artifact permission. Listing exposes
only allowlisted artifacts recorded by the collector, with opaque artifact
IDs and descriptions, never paths. `artifact` accepts that ID, not a path,
URL, filename, or command. Content reads return at most 4 KiB of UTF-8 text
with explicit omitted byte counts; binary/invalid UTF-8 is rejected. Raw
`run.json` must be queried structurally, not allowlisted as a text artifact.
Allowlist entries use canonical forward-slash relative paths on every OS;
aliases such as `./run.json` cannot bypass the structural-only rule.
Inputs over 64 MiB for canonical results or 1 MiB for a text artifact fail
explicitly rather than parsing a truncated result as passing. Symlinks, hardlinks,
replaced roots, missing files, malformed results, unauthorized scope, and
expired credentials or retention all fail closed.

`revokeGrant` affects already connected clients. `forgetRun` immediately removes
query authority, including old grants if the host later re-registers that ID.
Retention expiry is checked on every read before any
projection, even if the files remain on disk. This API never deletes collector
files; the host/operator owns filesystem retention cleanup. No reader can
extend retention, enumerate roots, create a grant, or restart a run.
