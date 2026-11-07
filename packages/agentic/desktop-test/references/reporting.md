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

## Input lanes

A `test` run can execute one input lane (see [commands](commands.md#input-lanes)).
Its report records the lane, counts what the run left out before executing, and
holds every selected test to its declared outcome. `run.json` carries the lane as
`{ input, source, masking?, policyEnforced }`:

- `input`: `accessible` or `physical`.
- `source`: `option` for `--input`, `environment` for `DESKTOP_INPUT`, or `driver`
  when the lane was read from the driver instance a `test` attached to.
- `masking` (accessible only): `host-masked` when this command started the host
  with keyboard, physical click, and wheel disabled, or `verified-masked` when it
  attached to a host and verified that mask before running anything.
- `policyEnforced`: `true` when each worker session confirms its requested
  `furn:inputMode`; older reports may record `false`. The session refuses input
  outside the lane before dispatch. `masking` is an additional host-level
  safeguard, not the policy enforcement mechanism.

Each executed test attempt may include `input` in `run.json`: `receipts` counts
the mechanisms the session delivered, `undeclared` lists mechanisms the case
did not declare and therefore failed on, and `unused` lists declared input
requirements not exercised. These receipts describe deliveries, not whether an
application changed state or whether a platform/lane is qualified.

Tests that a lane, a `platforms` list, or a `scope` leaves out are not tests, so
they are never reported as skipped. A producer announces them in `selection`
events, and `run.json` sums them as `selection.excluded: { platform, scope, input }`.
A case counts once, under the first reason that applies in that order, and only if
it matched the user's own filters, such as a story filter. A `selection` event
with a `key` is counted once, so a retried worker that announces the same
exclusions again does not double them. A run whose producers reported none has no
`selection`.

A lane run promised to execute its whole selection, so its verdict is stricter:

- `failed`: a failed test or an infrastructure failure, as in any run.
- `incomplete`: a selected test was skipped at run time, was `unsupported` with no
  declaration (the host did not meet a `requires`), or no test executed. `optional`
  never excuses these, so a lane that runs nothing is not reported `skipped`.
- `passed`: otherwise. A test declared `unsupported` or `quarantine` is reported
  unsupported without making the run incomplete. Summaries count them as
  `N unsupported (N declared, N quarantined)` so an undeclared gap stands out.

`failed` outranks `incomplete`, which outranks `passed`. A run without a lane keeps
its existing verdict.

The plain and GitHub summaries show the lane and exclusions on one line, such as
`Selection: input accessible (policy-enforced, host-masked) from --input; excluded 4 by platform, 0 by scope, 12 by input`.
The JUnit file records the lane as the properties `desktop.input`,
`desktop.input.label`, and `desktop.input.source`, the exclusions as
`desktop.excluded.platform`, `desktop.excluded.scope`, and `desktop.excluded.input`,
and `desktop.declaredUnsupported` and `desktop.quarantined` when present. The label includes `policy-enforced` when the session confirmed that mode;
`physical pilot` still does not claim qualification.

A delegated command, which inherits its parent's collector, sends its exclusions to
the parent but not its lane, so the parent's `run.json` has no `lane`. The command
still holds its own cohort to the lane: a Storybook `test` reports an incomplete
cohort to the parent when a selected test has no declared gap and did not run.

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

On Windows, atomic replacement retries only `EPERM`/`EACCES` rename failures,
up to ten times at 25 ms intervals, without deleting the previous snapshot or
rewriting its temporary replacement. A recovered replacement records a warning
in the event journal. Exhaustion, other errors, and errors on other platforms
remain reporting failures even if later snapshots succeed. The same rule
applies to JUnit replacement; it does not retry native mutations or producer
handshakes.

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
parameters. `status` returns complete counts, terminal/coverage state, and the
run's input `lane` and `excluded` counts when it has them.
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
