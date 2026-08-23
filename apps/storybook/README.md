# Agentic Components Storybook

Native Storybook for agentic Fluent UI React Native components and linked standalone native
packages. It runs on React Native macOS and React Native Windows with Fabric.

## What this app owns

- on-device Storybook rendering in `liteMode`;
- theme selection around every preview;
- shared story discovery from `desktop.config.ts`;
- generated Storybook and desktop-test runtime files;
- persistent on-device Run current, Run all, and Cancel controls;
- native macOS and Windows test hosts; and
- platform orchestration and ignored artifacts.

The reusable desktop automation implementation lives in
[`packages/agentic/desktop-driver`](../../packages/agentic/desktop-driver/README.md).

## Layout

```text
apps/storybook/
  desktop.config.ts          Shared stories, tests, host, readiness, and platform targets
  wdio.conf.ts               Projection of the shared config into WebdriverIO
  app.json                   react-native-test-app identity and resources
  index.js                   AppRegistry entry
  src/
    main.ts                  Storybook config using the shared story projection
    preview.tsx              Decorators and preview configuration
    StorybookApp.tsx         Native app shell
    StorybookTheme.tsx       Persistent theme host
    DesktopTestControls.tsx  On-device test controls
    useDesktopTestHost.ts    Channel-backed host lifecycle
  desktop-tests/
    fake-scene.json          Deterministic fake backend scene
    generated/               Ignored manifest, WDIO spec, and RN runtime projection
  scripts/                   Windows generation, launch, registration, and session ownership
  windows-tests/             Temporary legacy WinAppDriver regression harness
```

`src/storybook.requires.ts`, `desktop-tests/generated/`, native projects, bundles, and artifacts
are generated and ignored.

## Story discovery and generation

`desktop.config.ts` is the single source of truth for story roots. `src/main.ts` uses
`toStorybookStories()` from the desktop-driver config entry, and desktop generation applies the
same globs.

```sh
yarn workspace @fluentui-react-native/agentic-components-storybook prebuild
```

Prebuild:

1. force-builds the desktop-driver package when its ignored output is absent;
2. generates the desktop manifest, inline WDIO spec, and RN runtime projection transactionally;
3. validates the fake scene and config fingerprint; and
4. generates `storybook.requires.ts`.

## Run on macOS

Requires Xcode, Command Line Tools, and CocoaPods.

From `apps/storybook`:

```sh
# Generate the Xcode project/workspace and install pods
yarn pods:macos

# Start Metro
yarn start

# In another terminal, build and launch
yarn macos
```

Optional checks:

```sh
yarn bundle:macos
yarn macos:build
```

Use `pods:macos:update` when CocoaPods reports that generated local podspec inputs changed.

Only `macos/Podfile` is hand-authored. Do not patch generated Pods, projects, workspaces,
DerivedData, or lockfiles.

The app bundle ID is `com.microsoft.fluentui.agenticstorybook`, used by desktop attach mode.

## Run on Windows

Requires Visual Studio 2022 with the React Native Windows workload and Windows SDK prerequisites.

From `apps/storybook`:

```powershell
yarn windows:info
yarn windows
```

Other workflows:

```powershell
yarn windows:build       # build without deployment
yarn windows:offline     # Release app with embedded JS bundle
yarn windows:agent:start # leave host, Metro, and app ready
yarn windows:agent       # run the temporary legacy smoke suite too
yarn windows:agent:stop  # stop exact session-owned processes
```

Windows orchestration:

- resolves the desktop project config as JSON;
- starts the config-driven desktop host;
- waits for atomic host-ready JSON;
- validates URL, service ID, stories, and manifest digest;
- verifies port ownership belongs to the launcher process tree;
- records exact process IDs in `artifacts/windows/agent-session.json`; and
- cleans up only those recorded resources.

The desktop is a real shared resource. Input requires an unlocked interactive session.

## Desktop host

Start the channel/MCP/test host:

```sh
yarn desktop:host:macos
# or
yarn desktop:host:windows
```

Metro remains separate (`yarn start`). The app reads host and port from the generated runtime
projection, not copied constants.

The host provides:

- Storybook WebSocket control;
- MCP documentation endpoints;
- manifest-constrained desktop test requests;
- live per-test progress;
- cancellation; and
- host-ready/closing lifecycle.

There is no second test URL or bearer token.

### Console control

```sh
yarn storybook:control
yarn storybook:control select components-button--default
yarn storybook:control args components-button--default '{"appearance":"primary"}'
yarn storybook:smoke
```

These commands delegate to the packaged desktop-driver CLI and common config.

## Write stories

Add `*.stories.tsx` next to the component under `packages/agentic/components/src`, or add an
explicit standalone package root to `desktop.config.ts`.

Stories should expose stable `testID` values for native automation. Do not select controls by
visible text, layout order, or generated native class name.

See the Button stories for the canonical component example:

- `packages/agentic/components/src/components/button/button.stories.tsx`
- `packages/agentic/components/src/components/button/button.desktop.spec.ts`

## Desktop story tests

A story opts in with:

- an inline `parameters.desktopTest` plan; or
- a linked colocated `*.desktop.spec.ts`.

Generate and run:

```sh
yarn desktop:generate
yarn desktop:test:fake
yarn desktop:test:macos
yarn desktop:test:windows
```

The app's normal `test` task runs both protocol unit tests and the fake WDIO suite:

```sh
yarn test
```

Attach is the default so an on-device run never terminates the app that requested it. Set
`DESKTOP_TEST_APP` only when the run should own a separately launched application.

The desktop host must be running for real macOS or Windows story tests because tests navigate
through the channel.

## On-device controls

`DesktopTestControls` renders:

- **Run current test** only for story IDs in the generated tested-story list;
- **Run all tests** for the full manifest; and
- **Cancel** for the active run.

`useDesktopTestHost` accepts only:

- the generated protocol version;
- the generated manifest digest;
- the current service identity;
- the current request ID; and
- increasing status sequence numbers.

A host restart, closing event, protocol mismatch, or digest mismatch clears stale app state.

## Storybook channel and MCP

The configured loopback endpoint serves:

- WebSocket Storybook events;
- `GET /index.json`;
- synchronous story selection;
- channel event broadcast; and
- `POST /mcp`.

To register the MCP endpoint:

```sh
npx mcp-add --type http --url "http://localhost:7007/mcp" --scope project
```

Use the actual configured host-ready URL when the port changes.

## Artifacts

Desktop test artifacts:

```text
artifacts/desktop-tests/<run-id>/
```

Windows orchestration artifacts:

```text
artifacts/windows/
```

Artifacts may contain private accessibility source, screenshots, logs, and application text. Keep
them ignored and review before sharing.

WinAppDriver screenshots are not reliable for WinAppSDK Composition content. Use a real desktop
capture tool for visual evidence and keep UI Automation as the deterministic assertion path.

## Temporary legacy Windows harness

`yarn windows:test` and `yarn windows:agent` still use
`@react-native-windows/automation`/WinAppDriver for historical focus/crash coverage.

That temporary path requires WinAppDriver 1.2.1. Install it at
`C:\Program Files (x86)\Windows Application Driver\WinAppDriver.exe` or set `WINAPPDRIVERPATH`.

It is not the target architecture. Removal criteria are tracked in
[`desktop-driver/NEXT-STEPS.md`](../../packages/agentic/desktop-driver/NEXT-STEPS.md). Do not remove
it before NovaWindows proves equivalent attach, focus, crash, ownership, cleanup, and CI evidence.

## Validation

```sh
yarn format
yarn lint
yarn test
yarn bundle:macos
yarn bundle:windows
```

When manifests, generated inputs, or project references change, also run the root `yarn build`.
