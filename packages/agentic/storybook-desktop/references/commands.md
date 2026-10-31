---
id: storybook-desktop.commands
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Commands

Use the consumer application's declared `storybook` script.

The CLI reads `desktop.config.mts`, `.ts`, `.mjs`, `.js`, or `.cjs` from the
current package unless `--config <path>` is supplied. Select exactly one
`--macos`, `--windows`, or `--win32` endpoint. Without an option, selection
uses `FURN_STORYBOOK_PLATFORM`, then the host default; Win32 is never selected
implicitly. Put global options such as `--verbose` before the subcommand.

| Command                                       | Purpose                                           |
| --------------------------------------------- | ------------------------------------------------- |
| `manifest --<platform>`                       | Validate static story-plan extraction             |
| `driver --<platform>`                         | Own Metro, Storybook channel, and driver services |
| `instance --<platform>`                       | Inspect the active instance's ports and target    |
| `test --<platform> --list`                    | Discover authored executable story-test IDs       |
| `test --<platform> --test <glob>`             | Run matching isolated story callbacks             |
| `smoke --<platform> --mode stories`           | Build/bundle/launch, traverse stories, clean up   |
| `smoke --<platform> --mode stories-and-tests` | Traverse stories and execute callbacks            |

macOS defaults to Fabric. `--paper` selects Paper for a macOS command; rerun
`prep` after switching because the project and Pods are shared. The endpoint
and target remain `macos`. `--paper` is invalid for Windows and Win32.

`prep` ensures the native helper before native dependency/project generation.
`bundle` extracts the selected catalog and routes to the RN bundler.
`build` compiles without launch; `run` builds and launches. `build-driver`
builds only the source-shipped helper.

The smoke `stories` mode is the renderability gate and owns service startup,
app launch, complete traversal, and cleanup. `stories-and-tests` then runs
legacy plans and selected callbacks grouped by story. Explicit selectors that
match no tests fail. Use `STORYBOOK_SMOKE_STORY` and `STORYBOOK_SMOKE_TAG`
for focused smoke cases.

`test` runs callbacks against an already running app and driver; `smoke` owns
the complete app lifecycle. The generic smoke path needs a platform stop
command, except macOS, whose bundle-ID stop is supplied. Prefer the shared
`createWindowsSmokeOptions`, `createWin32SmokeCommand`, and
`createWin32RunCommand` factories instead of copying app lifecycle scripts.
The Windows Fabric smoke restarts its exact owned app after traversal before
running authored tests against the warm Metro bundle.

Smoke runs derive an instance identity from the canonical consumer-project
root. The identity coordinates app bundle identity, Storybook/driver ports,
Metro, generated runtime identity, and exact process cleanup. Windows RN Test
App retains its required Metro port 8081; do not run concurrent Metro-backed
Windows smokes.

The TypeScript API exposes the same operations through `DesktopStorybookCli`.
Higher-level supervisors should inject their shared reporter, runner, and
services so runs join one owned lifecycle.

Use `desktop-driver stories list` for runtime story IDs. Static manifest
discovery is not a replacement for querying the running catalog. Generic
`desktop-test --list` does not apply to `csf-wdio` story suites; use the
Storybook test-list command instead.

CLI options are package-owned. Do not substitute an unregistered agent tool
name or invoke package internals directly.
