# Agentic Components Storybook

On-device [Storybook](https://storybook.js.org/) test app (Storybook for React Native v10) for
`@fluentui-react-native/components` and linked standalone native packages. It loads every
`*.stories.(ts|tsx)` file from the agentic components package plus the standalone Callout
package so its native stories run in the Fabric host.

The reusable desktop CLI and configuration live in
`packages/agentic/storybook-desktop`, with peer-dependent React Native
implementation in `packages/agentic/storybook-desktop-runtime`. The runtime
runs Storybook in **liteMode**, which mocks out the heavy default on-device UI
(`@storybook/react-native-ui`). This avoids the `react-native-reanimated` /
`react-native-gesture-handler` / `@gorhom/bottom-sheet` / `react-native-svg` native dependency
chain, which does not bundle cleanly with this repo's Metro + Babel + pnpm-linker toolchain
(Reanimated's Babel plugin crashes when Metro bundles Reanimated from source).

The shared app shell includes a persistent theme header above the Storybook UI. It can leave stories
unwrapped (`No theme`, the default) or apply the default light, dark, or high-contrast FURN Theme.
The selected Theme wraps the preview decorator, so it applies to every rendered story and remains
selected while navigating between stories.

The macOS, Windows Fabric, and Win32 Paper native endpoints live in this workspace and
share the same entry point and generated story catalog. Story discovery and native identity stay
app-owned, while the platform-neutral UI, configuration helpers, and `storybook-desktop` CLI come
from the shared package. The app exposes only the shared CLI entry points; native lifecycle scripts
remain package-owned.

## Layout

```
storybook/
  src/                 Storybook adapters, generated requires, and shared-runtime integration
  storybook.config.mts App-owned package discovery, platform patterns, and native CLI settings
  index.js             AppRegistry entry
  app.json             react-native-test-app manifest
  metro.config.js      rnx-kit metro config wrapped with withStorybook (liteMode)
  babel.config.js      @react-native/babel-preset
  react-native.config.js
```

> `StorybookApp.tsx` is intentionally not named `App.tsx`: on a case-insensitive macOS
> filesystem `App` collides with `app.json` during Metro resolution.

The `src/storybook.requires.ts` file is **generated** (git-ignored) from the
`main.ts` stories glob by the `withStorybook` metro wrapper when Metro starts, or on demand via:

```sh
yarn workspace @fluentui-react-native/agentic-components-storybook prebuild
```

## Running on macOS

This app uses [`react-native-test-app`](https://github.com/microsoft/react-native-test-app),
matching the other test apps in this repo. Only the hand-written `macos/Podfile` is checked in;
`pod install` generates the Xcode project/workspace (and they are git-ignored).

```sh
# from this directory
# 1. Generate the Xcode project/workspace + install pods
yarn storybook prep --macos

# Optional: verify a native build without launching the app
yarn storybook build --macos

# 2. Start Metro (also generates storybook.requires)
yarn start

# 3. In another terminal, build & launch the macOS app
yarn storybook run --macos
```

Requires Xcode + CocoaPods.

Run `yarn storybook smoke --macos` for the complete server, Metro, build/launch, all-story traversal, and
ownership-safe shutdown lifecycle. The shared CLI hashes this enlistment's canonical project root,
uses that suffix in the native bundle identifier, and selects dedicated Storybook and Metro ports.
Parallel smoke tests from different enlistments therefore launch, drive, and stop only their own app
and services, even when the default ports are already occupied.

> `react-native-safe-area-context` note: Storybook's UI imports it, but its native module is
> iOS-only (UIKit) and uses a Yoga API that doesn't compile for react-native-macos 0.81. It is
> therefore not installed; the shared Metro helper aliases the import to a JS-only stub, so no
> native module is needed.

## Running on Windows

The Windows app also uses `react-native-test-app`. Its generated Win32 project uses React Native
Windows 0.81's New Architecture and Fabric renderer. The Callout package is autolinked as a
Windows Fabric native library; its Paper implementation remains built into the platform.

```powershell
# from this directory
# Traverse the complete story catalog
yarn storybook smoke --windows --mode stories

# Traverse the complete catalog, then run authored desktop-e2e plans
yarn storybook smoke --windows --mode stories-and-tests

# Individual development stages
yarn storybook prep --windows
yarn storybook build --windows
yarn storybook run --windows
```

`stories` is the default smoke mode. Requires Visual Studio 2022 with the React Native Windows build prerequisites. The generated
solution, `ExperimentalFeatures.props`, registrations, and build outputs are git-ignored. The shared smoke command
bundles the Windows catalog, generates the solution, starts the platform-scoped channel server, builds and registers the Debug app, starts Metro,
launches the exact app window, renders every indexed story, optionally runs the component-authored plans, and stops only the processes it recorded.
During Stage 1 the authored plans use the manifest-derived fake target; the full story traversal remains native. Logs are written
beneath `artifacts/windows/smoke-logs`.

Storybook's development bundle intentionally contains separate `pretty-format` and `react-is`
versions used by its internal tooling. They are excluded from the duplicate-module enforcement;
React, React Native, and application dependencies remain checked.

## Running on Win32

The Win32 endpoint uses the `@office-iss/react-native-win32` Paper renderer in
the prebuilt `@office-iss/rex-win32` host. It is separate from the React Native
Windows Fabric endpoint above and does not use a generated
`react-native-test-app` native project.

```powershell
# from this directory
# Produce dist/index.win32.bundle from the same story catalog as the other endpoints
yarn storybook bundle --win32

# Launch the prebuilt Paper host
yarn storybook run --win32

# Complete CI-ready bundle, native UX, and story traversal lifecycle
yarn storybook smoke --win32 --mode stories

# Run the same traversal followed by authored desktop-e2e plans
yarn storybook smoke --win32 --mode stories-and-tests
```

The host window title is `Agentic Components Storybook (Win32)` so automation
can distinguish it from the Windows Fabric app. The pinned REX 0.81.1 host runs
the resolved react-native-win32 0.81 release line. Runtime diagnostics are
written to the ignored `artifacts/win32/console.log`.

The current Storybook bundle contains regular expressions that use Unicode
properties unsupported by the V8 engine in REX 0.81.1. The Win32-only Babel plugin in
`packages/agentic/storybook-desktop/config/transform-win32-unicode-regex.cjs` expands those expressions at bundle
time. Remove the workaround after the REX host accepts Unicode property
escapes; other platform bundles never load the plugin.

react-native-win32 intentionally leaves window width and height undefined, and
Storybook's mobile `LiteUI` drawer crashes the Paper host after those metrics
are supplied. The Win32 endpoint therefore uses the shared package's desktop-only chrome with the same conceptual structure as macOS and
Windows: a persistent Sidebar on the left, story preview on the upper right,
and an Actions-first addon panel along the bottom. Local splitters resize the
sidebar width and addon height without reading global window dimensions.

Optional toolbar actions move Stories or Addons into
`Win32CalloutPortal`, which presents the same content in the platform's native
Paper `RCTCallout` window without relying on `@gorhom/portal`, window
dimensions, React Native animations, or mobile drawer gestures. Dismissing a
pop-out restores its default inline region. The toolbar stays hidden during the
normal persistent-sidebar layout and appears only after the Sidebar is hidden,
keeping the default story preview free of redundant navigation controls.

macOS and Windows continue to use upstream `LiteUI`. Keeping the full upstream
chrome there preserves its resizable sidebar, addon controls, responsive
layout, and future Storybook fixes. Moving those endpoints to the reduced
Win32 chrome would create a maintained fork and regress features without
solving a platform problem they currently have.

Nine ListItem stories and seven Accordion stories are omitted from the
Win32-generated catalog because those components terminate the current REX
0.81.1 host with fail-fast code `0xC0000409`; macOS and Windows continue to
include them. The three standalone Callout stories run through the same Paper
`RCTCallout` implementation as the portal chrome. All 130 included stories
render through the Win32 control-plane smoke sweep.
Run `yarn storybook-server --win32` with this endpoint so the server exposes the
same 130-story index as the app; the ordinary `storybook-server` command keeps the full macOS and Windows catalog.
`yarn storybook smoke --win32` defaults to `--mode stories` and verifies the package-owned desktop regions, resize
handles, addon surface, the complete 130-story sweep, host liveness, and ownership-safe cleanup. The
`stories-and-tests` mode then runs the component-authored plans through the Stage 1 manifest-derived fake target. Native
plan execution begins with the Stage 2 providers. Logs are written
beneath `artifacts/win32/smoke-logs`. A native `build --win32` operation is intentionally unsupported because this
endpoint uses the prebuilt REX host.

## Bundling (no native toolchain required)

You can produce the JS bundle without Xcode. This also generates `storybook.requires` first:

```sh
yarn storybook bundle --macos     # -> writes dist/index.macos.jsbundle
yarn storybook bundle --win32     # -> writes dist/index.win32.bundle
yarn storybook bundle --windows   # -> writes dist/index.windows.bundle
```

These scripts route to `storybook-desktop bundle --macos|--win32|--windows`. The binary can also
infer the target from `FURN_STORYBOOK_PLATFORM` or the host platform when no explicit option is
provided.

## Agent interaction (WebSocket channel + MCP)

The running app can be driven by external agents through the reusable standalone Storybook channel
server (`storybook-server`, default `127.0.0.1:7007`):

```sh
yarn storybook-server           # host-platform default
yarn storybook-server --win32   # explicit Win32 catalog
# WebSocket: ws://127.0.0.1:7007/   MCP: http://127.0.0.1:7007/mcp
```

For the Stage 1 desktop-driver control plane, use the combined supervisor:

```sh
yarn storybook driver --windows
yarn storybook manifest --windows
yarn storybook instance --windows
```

`driver` runs the Storybook channel/MCP listener and a separate W3C WebDriver
listener in the same Node process. `instance` reports the enlistment-specific
ports and target identity. The generated manifest contains the exact platform
catalog, relocatable source paths, serializable story-test plans, and platform
and portable-plan digests. The current provider is a deterministic fake host;
native Windows, Win32, and macOS providers are a later implementation stage.

The app exposes the shared JSON CLI as `yarn desktop-driver`. After the
supervisor and app are running, list or run the component-authored plans:

```sh
yarn desktop-driver stories list \
  --url http://127.0.0.1:<driver-port> \
  --target agenticstorybook-windows

yarn desktop-driver stories run \
  --url http://127.0.0.1:<driver-port> \
  --target agenticstorybook-windows \
  --tag desktop-e2e \
  --artifacts artifacts/windows/desktop-driver
```

Use `agent describe` for a bounded native tree and `agent screenshot` for a
confined evidence artifact. These commands and the programmatic agent API use
the same manifests, selectors, runner, and result schema as WebdriverIO.

Run it alongside `yarn start` and `yarn storybook run --macos|--windows`. The on-device app connects to it automatically
(`src/StorybookApp.tsx` creates the shared desktop Storybook app around the generated view).

- **WebSocket channel** (`ws://127.0.0.1:7007/`): agents connect and emit Storybook channel events
  to drive the app — e.g. `setCurrentStory` (`{ storyId }`) to switch story, and arg-update events
  to change controls — and receive state/events back. Host/port can be overridden with
  `STORYBOOK_WS_HOST` / `STORYBOOK_WS_PORT`.
- **MCP server** (`http://127.0.0.1:7007/mcp`): an MCP endpoint for AI agents, exposing tools like
  `list-all-documentation` and `get-documentation` to query component/story metadata, prop types,
  and usage snippets. Register it with an MCP client, e.g.:

  ```sh
  npx mcp-add --type http --url "http://localhost:7007/mcp" --scope project
  ```

- **REST control endpoints**:
  - `GET /index.json` returns the story index.
  - `POST /select-story-sync/<storyId>` selects a story and waits for `storyRendered`.
  - `POST /send-event` broadcasts a Storybook channel event.

> We run the channel server standalone (via `@storybook/react-native/node`'s `createChannelServer`)
> rather than through `withStorybook`, because the bundler-agnostic `withStorybook` only starts it in
> entry-point-swapping mode (`STORYBOOK_ENABLED=true`), which conflicts with this app's in-app
> integration.

## Writing stories

Follow the package-level story authoring instructions in `../../packages/agentic/components/AGENTS.md`. Add a
`*.stories.tsx` file next to its component; standalone native package story globs are listed explicitly in `src/main.ts`.
See `../../packages/agentic/components/src/components/button/button.stories.tsx` for the canonical higher-order component example.
Portable tests are static `parameters.desktopDriver` data with stable `testID`
selectors; Button, Checkbox, and Input demonstrate the initial contract.
