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
implicitly.

Global output options are `--reporter auto|plain|github-actions|json|ndjson`,
`--json` (an alias for JSON), and `--events milestones|progress|all` (NDJSON
only). The mode precedence is CLI flag, `DESKTOP_REPORTER`, config, then
`auto`. Global options may appear before or after a subcommand.

Plain and GitHub Actions output reports each step as one header with its
outcome and duration, and shows the end of a step's log only when it fails. The
`Render stories` and `Story tests` steps of a smoke run carry the counts in
their headers, such as `209 stories rendered` and
`101 of 101 story tests executed: 101 passed, 0 failed, 0 skipped`. A run that
executes no story tests says `no story tests executed (0 of N)`. Pass
`-v`/`--verbose` to stream command output live, with start markers and log
paths. The console format is described in
`@fluentui-react-native/desktop-test/references/reporting.md`.

| Command                                       | Purpose                                             |
| --------------------------------------------- | --------------------------------------------------- |
| `manifest --<platform>`                       | Validate static story-plan extraction               |
| `driver --<platform>`                         | Own Metro, Storybook channel, and driver services   |
| `driver --<platform> --agent`                 | Also require grants and publish an agent connection |
| `instance --<platform>`                       | Inspect the active instance's ports and target      |
| `test --<platform> --list`                    | Discover authored executable story-test IDs         |
| `test --<platform> --test <glob>`             | Run matching isolated story callbacks               |
| `test --<platform> --input accessible`        | Select accessible and `both` descriptor cases       |
| `test --<platform> --list --input physical`   | Preview a lane's selection and exclusions           |
| `driver --<platform> --input accessible`      | Start a driver that masks physical input            |
| `smoke --<platform> --mode stories`           | Build/bundle/launch, traverse stories, clean up     |
| `smoke --<platform> --mode stories-and-tests` | Traverse stories and execute callbacks              |

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

Windows and Win32 PowerShell smoke owners wait up to 75 seconds for each service
bridge to exit, allowing its 60-second cooperative shutdown budget to complete.
Nonzero exits and expired deadlines remain cleanup failures.

Storybook test and stories-and-tests smoke commands accept
`--input accessible|physical`. The lane filters `desktopIt` cases by their
resolved input, target platform, and scope. Without a flag the lane comes from
`DESKTOP_INPUT`, then from the driver instance a `test` attaches to; none of them
means compatibility mode, which runs every case as before. `driver --input`
starts the driver for that lane and records it for subsequent tests against the
instance. Each test session confirms its strict input policy before running;
the accessible policy rejects keyboard, pointer, and wheel input before
dispatch. An accessible driver also masks those host features as defense in
depth, but a test can attach to an unmasked driver.
Legacy callback collections are not eligible for input-lane runs. Input lanes
cannot be combined with an explicit non-`auto` click mode. See
[story tests](story-tests.md#run-an-input-lane).

On macOS, physical-lane `test` and `smoke` runs establish and verify a window
up to **1024 × 768 logical points** before traversal or callbacks. Its size is
clamped to the largest visible screen frame with a one-point inset on every
edge, and the window is centered there; equal-sized candidates prefer the
screen with more overlap with the current window. For example, a 1024 × 743
visible frame yields a 1022 × 741 window. The harness fails before tests if no
screen can host a positive window or the host does not establish the exact
requested rectangle, and includes the target and observed geometry in the
error. Accessible and compatibility runs do not resize the window. Native
occlusion checks remain authoritative; the harness does not hide Storybook
chrome or overlays.

The TypeScript API exposes the same operations through `DesktopStorybookCli`.
Higher-level supervisors should inject their shared reporter, runner, and
services so runs join one owned lifecycle. Injected services are borrowed: the
CLI stops its work through the scope signal but never closes that scope, which
stays with the supervisor that created it. A `DesktopStorybookCli` that creates
its own scope closes it when the command ends. Stage commands receive the scope
signal, so a stop or interrupt ends a running stage instead of waiting for it.

JSON mode emits one compact command result, or one readiness record for the
long-running `driver` and `server` commands. Their readiness records are
written only after Metro/Storybook services pass readiness checks. If one of
them fails before readiness, for example because another workload holds the
interactive lock, it writes the bounded failure summary instead, so
structured output is never empty.

`driver --agent` protects the embedded Desktop Driver with a grant authority.
Once the driver listens, the channel service publishes one private connection
descriptor for the Desktop Driver MCP adapter: `agent-connection.json` under
the platform's private storage root unless `--descriptor <name>` or
`--root <path>` say otherwise. Readiness waits for that publication and adds
`agentDescriptor`; stopping removes the descriptor before revoking the grant.
`desktop-test --target <name> serve --agent` routes here for a Storybook
target. Agent mode disables the channel's unauthenticated MCP endpoint, so
agents select stories through the adapter's `desktop_story`. On macOS the
command keeps the application lease naming the one running app instance, so
agents attach without `storybook test`. Nothing maintains a Windows or Win32
lease, so on those platforms the agent attaches by the app's verified identity
instead: a configured `nativeDriver.application` AUMID or executable path, or
else the desktop target's registered package AUMID (RN Test App) or REX
`ReactTest.exe`. Build and register the app once before `driver --agent`;
the command fails before starting services when it cannot verify an identity.
A platform whose smoke options declare a fixed Metro URL, such as
`createWindowsSmokeOptions` for the RN Test App Windows Debug host, which always
loads from port 8081, gets Metro on that port; the command fails when the port
is in use rather than serving a bundle the app never reads. `storybook test` refuses an
agent-served instance because WDIO holds no grant, and the fake driver
(`STORYBOOK_NATIVE_DRIVER_FAKE=1`) refuses agent mode. NDJSON
streams bounded report events and finishes one-shot runs with a summary.
Structured modes keep normal stderr empty.

The Node worker reporter is named `--test-reporter spec|tap|dot`. The former
`test --reporter spec|tap|dot` spelling remains as a deprecated one-cycle
alias; use the global `--reporter` for CLI output format.
The first SIGINT, SIGTERM, or SIGHUP stops owned work; a second one during
cleanup force-stops owned commands, and a third exits without cleanup.
Interrupted one-shot commands, such as a stage or story test, end with an
`incomplete` summary, while long-lived commands keep their single readiness
record. A standalone Storybook channel closes cleanly on the same signals.

Use `desktop-driver stories list` for runtime story IDs. Static manifest
discovery is not a replacement for querying the running catalog. Generic
`desktop-test --list` does not apply to `csf-wdio` story suites; use the
Storybook test-list command instead.

CLI options are package-owned. Do not substitute an unregistered agent tool
name or invoke package internals directly.
