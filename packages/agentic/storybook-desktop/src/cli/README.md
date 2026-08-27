# Desktop Storybook CLI integration

Consuming packages should expose the shared CLI rather than creating one script
per platform or wrapping individual implementation files. Keep package scripts
small so command arguments continue to reach the selected subcommand:

```json
{
  "scripts": {
    "storybook": "storybook-desktop",
    "storybook-server": "storybook-desktop server",
    "start": "rnx-cli start"
  }
}
```

With Yarn, arguments after a script name are appended to its command. The
server wrapper therefore supports the complete shared command directly:

```sh
yarn storybook-server --win32
yarn storybook-server --windows --host 127.0.0.1 --port 7100
```

Do not add `storybook-server:macos`, `storybook-server:windows`, or
`storybook-server:win32` aliases. The package also publishes a direct
`storybook-server` binary with the same platform and connection options.

## Platform selection

Every command that depends on the story catalog accepts exactly one of
`--macos`, `--windows`, or `--win32`. When no option is present, selection uses:

1. `FURN_STORYBOOK_PLATFORM`;
2. the host default (`macos` on macOS or `windows` on Windows).

Win32 is never selected implicitly because a Windows machine may contain both
the Windows Fabric app and a Win32 Paper host. Use `--win32` for one command or
set `FURN_STORYBOOK_PLATFORM=win32` for a multi-process workflow.

Prefer an explicit option for isolated commands:

```sh
yarn storybook bundle --windows
```

Prefer environment injection for workflows where the server, Metro, native
app, and test runner must all resolve the same platform:

```sh
FURN_STORYBOOK_PLATFORM=win32 yarn storybook-server
FURN_STORYBOOK_PLATFORM=win32 yarn start
FURN_STORYBOOK_PLATFORM=win32 yarn storybook run
```

Set the environment through the shell, CI matrix, or process supervisor using
the syntax appropriate for that environment. A `--config <path>` option may be
placed before the subcommand when the configuration does not use a standard
root filename.

## Command responsibilities

| Command  | Responsibility                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------- |
| `server` | Start the Storybook channel, REST control, and MCP server for the selected catalog.               |
| `prep`   | Install or generate native prerequisites. Run after checkout and when native dependencies change. |
| `bundle` | Generate the selected story catalog and produce its release JavaScript bundle through `rnx-cli`.  |
| `build`  | Build the selected native project without launching it.                                           |
| `run`    | Build and launch the selected native app or configured prebuilt host.                             |
| `smoke`  | Own the server, Metro, app launch, all-story traversal, app shutdown, and service cleanup.        |

The TypeScript API exposes the same operations through
`DesktopStorybookCli`. Use it when a test coordinator needs injected process
runners, structured lifecycle ownership, or composition with other tasks.

## Development workflows

### Metro-backed development

Use separate terminals or an ownership-aware process supervisor:

```sh
yarn storybook-server
yarn start
yarn storybook run
```

Run `yarn storybook prep` before the first native launch and after changes that
invalidate generated native projects or dependencies. The `run` command
includes the native build; use `build` when launch or deployment is not
desired.

When the host default is not the intended endpoint, select the same platform
for all three processes. A flag passed to `storybook-server` does not mutate
the parent shell, so use `FURN_STORYBOOK_PLATFORM` for the complete session
when Metro also performs platform-specific story generation.

### Bundle-backed development

For a host configured to load an embedded bundle:

```sh
yarn storybook bundle --windows
yarn storybook run --windows
```

The consuming config must make `run` launch the matching release or prebuilt
host, and the native manifest must package the bundle output. Bundling alone
does not change a Debug app into an offline app. Start `storybook-server` as a
separate process when the embedded app still needs external story control; no
Metro process is required.

## End-to-end tests

Use `smoke` for the standard renderability gate:

```sh
yarn storybook smoke --macos
```

It is preferable to a shell chain because it owns the exact server, Metro, app
identity, traversal, and cleanup. Consumer configuration should provide any
platform-specific app stop command or replace the complete smoke lifecycle
when native ownership cannot use the shared implementation.

For a broader E2E suite, let the test coordinator own the service processes:

1. Start `storybook server` and Metro with one platform environment.
2. Run or attach to the native app.
3. Wait for the server and app readiness contracts.
4. Execute tests through stable story IDs and native selectors.
5. Stop only the app and process IDs created by that test session.

Do not use unowned background shell processes in E2E scripts. Prefer the API or
a test-runner service that guarantees cleanup after setup, test, or teardown
failure.

## CI workflows

Set `FURN_STORYBOOK_PLATFORM` as a matrix value and keep stages as separate
commands:

```sh
yarn storybook prep
yarn storybook bundle
yarn storybook build
```

Separate stages provide clear failure attribution and allow native generation,
bundles, and build outputs to be cached independently. Run `smoke` only on a
runner that can launch and interact with the desktop session.

Avoid a script such as
`storybook-desktop bundle && storybook-desktop build` when callers need to
append a platform option: package-manager arguments reach only the final
command. Use the matrix environment for multi-command jobs or invoke each
command with its own explicit platform option.

## Agent workflows

Agents should use `smoke` for unattended validation because its bounded
lifecycle reports story progress and cleans up owned resources. For exploratory
interaction, an agent supervisor may start `server`, Metro, and `run`
separately, then use the REST or MCP surface to select and inspect stories.

The supervisor must record owned processes and preserve unrelated development
servers or app instances. Reusable smoke runs already derive isolated ports and
native identity from the consuming project root; custom agent workflows should
provide equivalent ownership rather than stopping processes by name or fixed
port.
