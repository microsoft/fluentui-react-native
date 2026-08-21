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

Follow the package-level story authoring instructions in the agentic components package. Add a `*.stories.tsx` file next
to its component under `packages/agentic/components/src`; standalone native package story globs are listed explicitly in
`src/main.ts`. See `packages/agentic/components/src/components/button/button.stories.tsx` for the canonical higher-order
component example.

## Desktop story tests

Story tests are written next to the components, run on Windows and macOS from the same source, and
are executed by [`@fluentui-react-native/desktop-driver`](../../packages/agentic/test-driver/README.md)
through the ordinary WebdriverIO testrunner. `wdio.conf.ts` holds all platform selection; the specs
contain none.

A story declares its test through `parameters.desktopTest`, either as a serializable inline plan or
as a link to a colocated spec. `packages/agentic/components/src/components/button/button.stories.tsx`
demonstrates both, with `button.desktop.spec.ts` as the linked spec.

```sh
# Regenerate the manifest and the compiled inline-plan spec (git-ignored)
yarn desktop:generate

# Report backends, the portable command matrix, and platform prerequisites
yarn desktop:doctor --platform macos

# Run against a Storybook app that is already running, leaving it running afterwards
yarn desktop:test:macos
yarn desktop:test:windows

# Run the same specs against the in-process contract backend, with no app or native driver
yarn desktop:test:fake
```

Attach is the default so a run never terminates the app it inspected. Set `DESKTOP_TEST_APP` to
launch a build instead; only then may the run stop the application. `DESKTOP_TEST_GREP` selects a
single story's tests by its `[story:<id>]` tag.

The channel server must be running (`yarn storybook-server`) before a macOS or Windows run, because
each test selects its story through it.

Artifacts — `run.json`, `events.ndjson`, `junit.xml`, per-test source, and screenshots — are written
under the ignored `artifacts/desktop-tests` directory. They can contain private screen content;
review before sharing.

### On-device controls

The app renders **Run current test**, **Run all tests**, and **Cancel** beneath the Storybook UI.
They send allowlisted run requests to a host-side service and render its progress; the device never
runs the test runner or native automation itself.

```sh
yarn desktop:generate
yarn desktop:service   # host-side; announces itself to the running app
```

There is nothing to copy and nothing to configure at build time. The service broadcasts its
loopback URL and per-boot token over the Storybook channel the app is already connected to, and
re-broadcasts on an interval, so reloading the app or restarting the service re-discovers it
without rebuilding the bundle. Until an announcement arrives the controls show
`Waiting for the desktop test service` and stay disabled.

This has to be a host-side process: the app is the subject of automation, so it cannot drive
itself, and a runner inside the app would die with the app and could never observe a crash,
an unexpected exit, or a timeout. The device only ever sends a story id that already exists in the
generated manifest, and the runner command comes entirely from `desktop:service` configuration.

### Relationship to the Windows Jest smoke harness

`yarn windows:test` and `yarn windows:agent` still use the older `@react-native-windows/automation`
Jest harness. The two paths use different ports and different commands and must not be run at the
same time; the desktop-driver path replaces the smoke harness once it reaches parity.
