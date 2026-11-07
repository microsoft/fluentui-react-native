---
id: desktop-test.commands
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Commands

Expose `desktop-test` from the consumer workspace and run through that
workspace's declared script.

| Command                              | Purpose                                              |
| ------------------------------------ | ---------------------------------------------------- |
| `build-driver`                       | Explicitly build or verify the native helper         |
| `prep`, `bundle`, `build`, `run`     | Run the selected target adapter stage                |
| `test --suite <name> --list`         | Resolve groups without launching a target            |
| `test --suite <name>`                | Run the selected WDIO suite                          |
| `test --suite <name> --input <lane>` | Run one input lane (`accessible` or `physical`)      |
| `serve --reporter json`              | Start the real driver listener and required services |
| `serve --agent`                      | Also require grants and publish an agent descriptor  |

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
owned stop. Long-lived JSON mode emits only that readiness document; a `serve`
that fails before readiness writes the bounded summary instead. For a
target served by an imported integration, `run` receives the output format,
writes its own readiness document, and calls `onReady` once it has.
Clients create sessions explicitly.

`serve --agent` makes the service require a grant on every route, issues one
grant for the target, and publishes it with the service URL and the helper's
description of this process as a private connection descriptor, which the
Desktop Driver MCP adapter reads. The record is `agent-connection.json` under
the platform's private storage root unless `--descriptor <name>` or
`--root <path>` say otherwise; the readiness document adds its
`agentDescriptor` name, and the grant never appears in output or artifacts.
Stopping `serve` removes the descriptor before revoking the grant. Ordinary
WDIO clients cannot connect to a service started with `--agent`. A target
served by an imported integration accepts `--agent` only when the integration
declares `supportsAgent`; its `run` receives the descriptor and root and
publishes the connection from the process that serves the driver. Storybook
does, through its `driver --agent` command; other integrations reject it. A
target with `host.ownership: "external"` accepts only attach sessions, which
suits an application someone else started.

For macOS RN Test App projects, run bundle before `prep`; CocoaPods embeds only
resources present during pod installation. Changing the renderer requires
rerunning `prep`. See [platform setup](platforms.md).

## Input lanes

`test --input accessible|physical` runs one input lane. `DESKTOP_INPUT` supplies
the lane when the flag is absent, and an empty or unknown value is an error. The
`accessible` lane starts the native host with keyboard, physical click, and wheel
disabled and runs the tests that need no physical input; the `physical` lane
runs tests that need it plus those that need neither. Tests declare which with
the [`./jasmine` helpers](wdio-suites.md#declare-input-and-scope-in-jasmine-specs).
A lane requires a Jasmine WDIO suite (or the Storybook suite, whose integration
applies the lane itself) and rejects `--list`, which resolves spec files without
regard to a lane. Without a lane every declared test runs, filtered by `platforms`
and `scope`. See [input lanes in reporting](reporting.md#input-lanes) for how a
lane run is judged.

An imported integration that serves its own driver receives the lane and owns
masking that driver. A host supplied through `hostFactory` is not masked by the
harness, so the suite verifies the mask before running anything.

The Storybook `csf-wdio` suite does not support generic `--list`. Discover story
IDs with the Storybook integration's manifest/CLI, then select authored tests
with its test filter. Use `storybook-desktop` smoke commands for a complete
owned Storybook lifecycle.
