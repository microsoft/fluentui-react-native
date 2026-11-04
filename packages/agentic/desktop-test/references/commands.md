---
id: desktop-test.commands
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Commands

Expose `desktop-test` from the consumer workspace and run through that
workspace's declared script.

| Command                          | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `build-driver`                   | Explicitly build or verify the native helper         |
| `prep`, `bundle`, `build`, `run` | Run the selected target adapter stage                |
| `test --suite <name> --list`     | Resolve groups without launching a target            |
| `test --suite <name>`            | Run the selected WDIO suite                          |
| `serve --reporter json`          | Start the real driver listener and required services |
| `serve --agent`                  | Also require grants and publish an agent descriptor  |

Global reporter options are `--reporter auto|plain|github-actions|json|ndjson`
and `--json` (an alias for `--reporter json`). Mode precedence is CLI flag,
`DESKTOP_REPORTER`, config, then `auto`. `auto` selects GitHub Actions rendering
when `GITHUB_ACTIONS=true`, otherwise plain output.

One-shot JSON commands emit a bounded summary; `--json` no longer prints the
complete `run.json`. NDJSON starts with run metadata, emits milestone records
by default, then ends with the same summary. Use `--events progress|all` for
more detail; `DESKTOP_EVENTS` propagates a level to delegated commands. The
default is `milestones`. Structured modes keep normal stderr empty. The full
results and logs remain under the returned artifact paths.

`serve` reports the actual URL and target after readiness, then waits for an
owned stop. Long-lived JSON mode emits only that readiness document. Clients
create sessions explicitly.

`serve --agent` makes the service require a grant on every route, issues one
grant for the target, and publishes it with the service URL and the helper's
description of this process as a private connection descriptor, which the
Desktop Driver MCP adapter reads. The record is `agent-connection.json` under
the platform's private storage root unless `--descriptor <name>` or
`--root <path>` say otherwise; the readiness document adds its
`agentDescriptor` name, and the grant never appears in output or artifacts.
Stopping `serve` removes the descriptor before revoking the grant. Ordinary
WDIO clients cannot connect to a service started with `--agent`, and targets
served by an imported integration, such as Storybook, reject it. A target with
`host.ownership: "external"` accepts only attach sessions, which suits an
application someone else started.

For macOS RN Test App projects, run bundle before `prep`; CocoaPods embeds only
resources present during pod installation. Changing the renderer requires
rerunning `prep`. See [platform setup](platforms.md).

The Storybook `csf-wdio` suite does not support generic `--list`. Discover story
IDs with the Storybook integration's manifest/CLI, then select authored tests
with its test filter. Use `storybook-desktop` smoke commands for a complete
owned Storybook lifecycle.
