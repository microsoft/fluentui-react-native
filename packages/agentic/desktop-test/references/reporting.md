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
failure. Long-lived readiness commands retain their single readiness document.

The supervisor owns rendering. Delegated producers inherit the selected mode
and report into the parent journal; they do not create a second result
directory or render a duplicate summary.

Story-specific readiness, authenticated channel events, and callback execution
are owned by `@fluentui-react-native/storybook-desktop`.
