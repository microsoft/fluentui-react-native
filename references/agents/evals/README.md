---
id: evals.index
kind: index
owner_paths:
  - references/agents
---

# Agent evaluation cases

Portable, sanitized case fixtures for evaluating how agents route and follow this repository's instructions. They are
inputs for a future evaluation framework, not instructions; agents performing ordinary work do not need to read them.
No runner or scoring framework is selected yet.

## Case fixtures

Each `cases/<case_id>.json` file contains:

| Field                        | Meaning                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `schema_version`             | `1`                                                                                                          |
| `case_id`                    | Kebab-case identifier matching the file name                                                                 |
| `split`                      | `development` cases may guide instruction changes; `holdout` cases are reserved for acceptance               |
| `task_mode`                  | `implement`, `maintain`, `review`, `plan`, `contract`, `optimize`, `toolchain`, or `security`                |
| `prompt`                     | The sanitized task given to the agent                                                                        |
| `expected.skills`            | Skills the agent should use                                                                                  |
| `expected.classification`    | `implementation_model`, `public_compatibility` labels, and `native_platforms`                                |
| `expected.required_reads`    | Instruction or contract files the agent should read                                                          |
| `expected.forbidden_actions` | Any of `edit-files`, `run-mutating-commands`, `create-component`, or `migrate-framework`                     |
| `assertions[]`               | `id`, `description`, `rule_ids`, and `source_refs`; each assertion cites at least one rule ID or source path |

`implementation_model` is one of `v0`, `v1-compose`, `v1-compressible`, `agentic-higher-order`, `agentic-primitive`,
`framework-base`, or `none`. `native_platforms` lists any of `ios`, `android`, `macos`, `windows`, and `win32`.
`source_refs` are repository paths without line numbers, so ordinary edits do not invalidate them.

Do not tune instructions against a holdout case. Once a holdout has informed a change, re-label it `development` and
add a new holdout.

## Execution results

Execution evidence stays local and is not committed. A result record should contain:

- `case_id`, the repository commit, and SHA-256 hashes of the instruction files in scope;
- client, client version, model, reasoning setting, and available tools;
- files actually read, skills invoked, and commands run with outcomes;
- per-assertion `pass`, `fail`, or `not-run`, with sanitized evidence;
- token and request usage where the client reports it, and elapsed time;
- known confounders, such as personal instructions, caching, or tool restrictions.

Do not record raw transcripts, credentials, private source bodies, or personal identifiers. Efficiency measurements are
reported, not used as pass/fail gates.

`yarn check-agent-instructions` validates the fixtures: schema, unique IDs, existing skills and paths, and defined rule
IDs.
