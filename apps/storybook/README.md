# Agentic Components Storybook

On-device [Storybook](https://storybook.js.org/) app (Storybook for React Native v10) for
`@fluentui-react-native/components` and linked standalone native packages. It loads every
`*.stories.(ts|tsx)` file from the agentic library source (`../src`) plus the standalone
Callout package so its native stories run in the Fabric host.

It runs in Storybook **liteMode**, which mocks out the heavy default on-device UI
(`@storybook/react-native-ui`). This avoids the `react-native-reanimated` /
`react-native-gesture-handler` / `@gorhom/bottom-sheet` / `react-native-svg` native dependency
chain, which does not bundle cleanly with this repo's Metro + Babel + pnpm-linker toolchain
(Reanimated's Babel plugin crashes when Metro bundles Reanimated from source).

The app shell includes a persistent theme header above the Storybook UI. It can leave stories
unwrapped (`No theme`, the default) or apply the default light, dark, or high-contrast FURN Theme.
The selected Theme wraps the preview decorator, so it applies to every rendered story and remains
selected while navigating between stories.

The macOS, Windows Fabric, and Win32 Paper endpoints live in this workspace and
share the same entry point and generated story catalog. Win32 stays here rather
than in a sibling package so story discovery and agent control cannot drift.
Shared Storybook source remains platform-neutral; `metro.config.js` redirects
`react-native` imports to `@office-iss/react-native-win32` only while producing
the Win32 bundle.

## Layout

```
storybook/
  src/                 Storybook config, generated requires, and root component
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
yarn pods:macos

# Optional: verify a native build without launching the app
yarn macos:build

# 2. Start Metro (also generates storybook.requires)
yarn start

# 3. In another terminal, build & launch the macOS app
yarn macos
```

Requires Xcode + CocoaPods.

If `Pods` was generated against an older React Native macOS patch release and CocoaPods reports
that a local podspec such as `fmt` changed, refresh the local native dependencies:

```sh
yarn pods:macos:update
```

> `react-native-safe-area-context` note: Storybook's UI imports it, but its native module is
> iOS-only (UIKit) and uses a Yoga API that doesn't compile for react-native-macos 0.81. It is
> therefore not installed; `metro.config.js` aliases the import to a JS-only stub in
> `.storybook-mocks/`, so no native module is needed.

## Running on Windows

The Windows app also uses `react-native-test-app`. Its generated Win32 project uses React Native
Windows 0.81's New Architecture and Fabric renderer. The Callout package is autolinked as a
Windows Fabric native library; its Paper implementation remains built into the platform.

```powershell
# from this directory
# Generate when needed, build and register before Metro, then launch the Debug app
yarn windows

# Stop the Storybook server, Metro, and app processes owned by this session
yarn windows:agent:stop
```

Requires Visual Studio 2022 with the React Native Windows build prerequisites. The generated
solution, `ExperimentalFeatures.props`, and build outputs are git-ignored and can be regenerated
with `yarn windows:generate`.

The raw React Native Windows CLI path remains available as `yarn windows:cli`, but the declared
`windows` workflow avoids two failure modes in this app: CLI deployment can stall while enabling
Developer Mode, and starting Metro before the native build can make its watcher observe generated
AppPackages being rewritten. A manually launched Debug app has no embedded JavaScript bundle and
will remain on the loading screen unless Metro is already serving this workspace on port 8081.

For a non-deploying build with structured logs:

```powershell
yarn windows:info
yarn windows:build
```

Logs are written beneath `artifacts/windows/build-logs`.

The Debug app always loads from Metro; `react-native-test-app` does not automatically fall back
to an embedded bundle in Debug builds. To bundle, build, and launch a Release app that runs
without Metro:

```powershell
yarn windows:offline
```

The Release package embeds `dist/index.windows.bundle`. Storybook's optional color-picker image
is intentionally not packaged because the Yarn pnpm asset path exceeds Windows' deployment path
limit; controls and stories otherwise run from the embedded bundle. The command replaces this
app's current Debug registration with its Release layout; running `yarn windows` later deploys
the Debug app again.

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
yarn bundle:win32

# Launch the prebuilt Paper host
yarn win32
```

The host window title is `Agentic Components Storybook (Win32)` so automation
can distinguish it from the Windows Fabric app. The pinned REX 0.81.1 host runs
the resolved react-native-win32 0.81 release line. Runtime diagnostics are
written to the ignored `artifacts/win32/console.log`. For the development loop,
run `yarn start` and then `yarn win32:dev` in separate terminals.
`yarn bundle:win32:dev` produces a debuggable local bundle when Metro cannot be
kept running.

The current Storybook bundle contains regular expressions that use Unicode
properties unsupported by the V8 engine in REX 0.81.1. The Win32-only Babel plugin in
`scripts/transform-win32-unicode-regex.cjs` expands those expressions at bundle
time. Remove the workaround after the REX host accepts Unicode property
escapes; other platform bundles never load the plugin.

react-native-win32 intentionally leaves window width and height undefined, and
Storybook's mobile `LiteUI` drawer crashes the Paper host after those metrics
are supplied. The Win32 endpoint therefore uses desktop-only chrome in
`StorybookUI.win32.tsx` with the same conceptual structure as macOS and
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
Run `yarn storybook-server:win32` with this endpoint so the server exposes the
same 130-story index as the app; the ordinary `storybook-server` command keeps
the full macOS and Windows catalog. Use `yarn storybook:smoke:win32` for the
native sweep; its short settle interval prevents REX Paper teardown races
between rapid story transitions.

`yarn win32:ci` bundles the endpoint, starts the scoped channel server and REX
host without the direct-debugger listener, verifies the default desktop
regions, resizes both splitters, opens and dismisses both native pop-outs, runs
the 130-story sweep, verifies that the host remains alive, and stops only its
recorded process IDs. Logs are written beneath `artifacts/win32`.

### Windows agent workflow

The complete agent workflow starts the Storybook channel server and Metro, builds and launches the
app, selects representative stories, and verifies their stable native UI Automation selectors:

```powershell
yarn windows:agent
```

The command records the exact server, Metro, and app process IDs in
`artifacts/windows/agent-session.json`. Stop that session without affecting unrelated development
processes:

```powershell
yarn windows:agent:stop
```

Use `yarn windows:agent:start` to leave the app ready for manual or external agent interaction
without immediately running the smoke tests. WinAppDriver 1.2.1 is required for automation.
The RNW automation package is pinned to the same 0.81.32 release as the resolved
`react-native-windows` dependency. Set `WINAPPDRIVERPATH` when the executable is not installed at
`C:\Program Files (x86)\Windows Application Driver\WinAppDriver.exe`.

WinAppDriver 1.2.1 can attach to this WinAppSDK window and inspect its UI Automation tree, but its
screenshot endpoint does not reliably capture React Native Windows Composition content. Agents
that have a desktop screenshot tool should use it after selecting a story with
`storybook:control`; UI Automation remains the deterministic automated validation gate.

## Bundling (no native toolchain required)

You can produce the JS bundle without Xcode. This also generates `storybook.requires` first:

```sh
yarn bundle:macos     # -> writes dist/index.macos.jsbundle
yarn bundle:win32     # -> writes dist/index.win32.bundle
yarn bundle:windows   # -> writes dist/index.windows.bundle
```

## Agent interaction (WebSocket channel + MCP)

The running app can be driven by external agents through a standalone Storybook channel server
(`storybook-server.cjs`, default `127.0.0.1:7007`):

```sh
yarn storybook-server   # WebSocket: ws://127.0.0.1:7007/   MCP: http://127.0.0.1:7007/mcp
```

Run it alongside `yarn start` + `yarn macos` or `yarn windows`. The on-device app connects to it automatically
(`src/StorybookApp.tsx` calls `getStorybookUI({ enableWebsockets: true, host, port })`).

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

The declared helper wraps these endpoints:

```powershell
yarn storybook:control list
yarn storybook:control select components-button--default
yarn storybook:control args components-button--default '{"appearance":"primary"}'
yarn storybook:smoke
```

> We run the channel server standalone (via `@storybook/react-native/node`'s `createChannelServer`)
> rather than through `withStorybook`, because the bundler-agnostic `withStorybook` only starts it in
> entry-point-swapping mode (`STORYBOOK_ENABLED=true`), which conflicts with this app's in-app
> integration.

## Writing stories

Follow the package-level story authoring instructions in `../AGENTS.md`. Add a `*.stories.tsx` file next to its component
under `../src`; standalone native package story globs are listed explicitly in `src/main.ts`. See
`../src/components/button/button.stories.tsx` for the canonical higher-order component example.
