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
| `serve --json`                   | Start the real driver listener and required services |

`serve` reports the actual URL and target, then waits for an owned stop.
Clients create sessions explicitly. JSON mode keeps stdout machine-readable
and sends diagnostics to stderr.

For macOS RN Test App projects, run bundle before `prep`; CocoaPods embeds only
resources present during pod installation. Changing the renderer requires
rerunning `prep`. See [platform setup](platforms.md).

The Storybook `csf-wdio` suite does not support generic `--list`. Discover story
IDs with the Storybook integration's manifest/CLI, then select authored tests
with its test filter. Use `storybook-desktop` smoke commands for a complete
owned Storybook lifecycle.
