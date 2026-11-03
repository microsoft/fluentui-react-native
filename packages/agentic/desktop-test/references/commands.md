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

For macOS RN Test App projects, run bundle before `prep`; CocoaPods embeds only
resources present during pod installation. Changing the renderer requires
rerunning `prep`. See [platform setup](platforms.md).

The Storybook `csf-wdio` suite does not support generic `--list`. Discover story
IDs with the Storybook integration's manifest/CLI, then select authored tests
with its test filter. Use `storybook-desktop` smoke commands for a complete
owned Storybook lifecycle.
