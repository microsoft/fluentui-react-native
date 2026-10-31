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

Story-specific readiness, authenticated channel events, and callback execution
are owned by `@fluentui-react-native/storybook-desktop`.
