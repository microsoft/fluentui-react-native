# Agentic Components Storybook

On-device [Storybook](https://storybook.js.org/) test app (Storybook for React Native v10) for
`@fluentui-react-native/components` and linked standalone native packages. It loads every
`*.stories.(ts|tsx)` file from the agentic components package plus the standalone Callout
package. FocusZone stories are agentic primitive stories, while its standalone native package
remains linked so they run in the Fabric and Paper hosts.

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

Use `yarn storybook build-driver --macos` to build the signed Swift helper in
isolation. `yarn storybook smoke --macos --mode stories-and-tests` traverses the
catalog, writes a nonce-bound lease for the exact launched bundle, and runs the
same component-authored plans through the native macOS provider.

For repeatable local TCC identity, configure an Apple Development or reusable
local development certificate:

```sh
FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="FURN Desktop Driver Development" \
  yarn storybook smoke --macos --mode stories-and-tests
```

The helper is a direct child of the Storybook/Node supervisor, so macOS privacy
authorization can be attributed to the terminal or IDE that owns that process
tree. Use `yarn desktop-driver doctor --platform macos --permissions` to inspect
the exact helper, signer, designated requirement, parent PID, Accessibility,
PostEvent, and Screen Recording state. Standalone
`yarn storybook run --macos` applies the same enlistment-specific xcconfig used
by smoke so its bundle identity does not fall back to the generated app default.

> `react-native-safe-area-context` note: Storybook's UI imports it, but its native module is
> iOS-only (UIKit) and uses a Yoga API that doesn't compile for react-native-macos 0.81. It is
> therefore not installed; the shared Metro helper aliases the import to a JS-only stub, so no
> native module is needed.

## Running on Windows

The Windows app also uses `react-native-test-app`. Its generated Win32 project uses React Native
Windows 0.81's New Architecture and Fabric renderer. The Callout and FocusZone packages are
autolinked as Windows Fabric native libraries; their Paper implementations remain available on
their supported legacy endpoints.

```powershell
# from this directory
# Traverse the complete story catalog
yarn storybook smoke --windows --mode stories

# Traverse the complete catalog, then run authored desktop-e2e plans
yarn storybook smoke --windows --mode stories-and-tests

# Individual development stages
yarn storybook build-driver --windows
yarn storybook prep --windows
yarn storybook build --windows
yarn storybook run --windows
```

`stories` is the default smoke mode. Requires Visual Studio 2022 with the React Native Windows build prerequisites. The generated
solution, `ExperimentalFeatures.props`, registrations, and build outputs are git-ignored. The shared smoke command
bundles the Windows catalog, generates the solution, starts the platform-scoped channel server, builds and registers the Debug app, starts Metro,
launches the exact app window, renders every indexed story, optionally runs the component-authored plans, and stops only the processes it recorded.
The authored plans use the source-built native Windows helper and attach to the
exact app process launched by the smoke lifecycle. After traversal, the Windows
Fabric lifecycle restarts only that owned app and rewrites its lease before
running authored tests against the warm Metro bundle. Logs are written
beneath `artifacts/windows/smoke-logs`.
The full Accordion story module remains excluded on Windows because registering
it in the driver-enabled catalog still fail-fasts the RNW 0.81 host. A
Windows-only Accordion consumer regression lives in the already-stable
FocusVisual story module and is omitted from broad traversal, so it runs last
in the authored phase immediately before app cleanup. Callout remains excluded
from Windows because its Fabric story surface also fail-fasts. Win32 continues
to exercise Callout through its Paper endpoint.

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

# Build the Windows helper shared by Windows Fabric and Win32 Paper
yarn storybook build-driver --win32

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

Nine ListItem stories and seven Accordion stories declare no Win32 support
because those components terminate the current REX 0.81.1 host with fail-fast
code `0xC0000409`; the files remain discoverable and the generated manifest
records each exclusion explicitly. macOS includes all of them, while Windows
includes Accordion Default and all ListItem stories. The three standalone
Callout stories run through the same Paper `RCTCallout` implementation as the
portal chrome.
Run `yarn storybook-server --win32` with this endpoint so the server and app
load the Win32 module catalog. Unsupported Accordion and ListItem selections
render a safe platform message, while the generated manifest drives the
143-story supported sweep.
`yarn storybook smoke --win32` defaults to `--mode stories` and verifies the package-owned desktop regions, resize
handles, addon surface, the complete supported-story sweep, host liveness, and ownership-safe cleanup. The
`stories-and-tests` mode then runs the component-authored plans through the
same source-built Windows helper used by the Fabric endpoint. Logs are written
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

For the native desktop-driver control plane, use the combined supervisor:

```sh
yarn storybook build-driver --macos
yarn storybook build-driver --windows
yarn storybook driver --windows
yarn storybook manifest --windows
yarn storybook instance --windows
```

`driver` runs the Storybook channel/MCP listener and a separate W3C WebDriver
listener in the same Node process. `instance` reports the enlistment-specific
ports and target identity. The generated manifest contains the exact platform
catalog, relocatable source paths, serializable story-test plans, and platform
and portable-plan digests plus the verified helper and trusted application
descriptor. macOS uses the native Swift provider, Windows and Win32 use the native C++
provider, and the fake host remains limited to package tests.

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
selectors. The current cohort covers 16 stories across 13 components and the
FocusZone primitive. Generate and reconcile every platform catalog with:

```sh
yarn storybook manifest --all
```

### Platform support and variants

Use `supportedPlatforms` when the story itself is supported on only a subset of
desktop endpoints. Use a test's `platforms` when the same test body applies to
only a subset. Use `platformVariants` when one logical test has genuinely
different `requires` or `steps`; a variant completely replaces both fields
rather than merging them. Use `traversePlatforms` only when a story must remain
testable but cannot participate in the broad render sweep; those plans run
after normally traversed stories so cleanup follows immediately.

```tsx
desktopDriver: {
  supportedPlatforms: ['macos', 'windows', 'win32'],
  traversePlatforms: ['macos', 'windows', 'win32'],
  version: 1,
  tests: [
    {
      id: 'pointer-activation',
      requires: ['focus', 'physical-click'],
      steps: [
        { action: 'click', target: { testId: 'story-button' } },
        { expect: { state: 'focused', target: { testId: 'story-button' }, value: true } },
      ],
      platformVariants: {
        macos: {
          requires: ['physical-click'],
          steps: [
            { action: 'click', target: { testId: 'story-button' } },
            { expect: { state: 'exists', target: { testId: 'story-button' }, value: true } },
          ],
        },
      },
    },
  ],
} satisfies DesktopStoryTests
```

App-level package patterns remain the outer loadability boundary for modules
that crash or cannot compile on an endpoint. A story declaration may narrow
that boundary but cannot widen it. Smoke traversal uses the generated manifest,
so a declared unsupported story is omitted deliberately even if the raw
Storybook index can load its module. Manual sidebar selection renders a safe
platform-support message without invoking the unsupported story.

### Accessibility expectations

Every authored semantic test should assert the public native contract rather
than React props or implementation slots:

| Component category | Minimum real-platform assertions                                                |
| ------------------ | ------------------------------------------------------------------------------- |
| Action             | role, accessible name, enabled state                                            |
| Toggle             | action minimums plus checked or mixed state before and after activation         |
| Text input         | role, accessible name, enabled/read-only state where exposed, and value changes |
| Selection item     | role, accessible name, selected or checked state                                |
| Disclosure         | button role, accessible name, and expanded state                                |
| Informational      | semantic role, accessible name when meaningful, and displayed state             |

These assertions complement package Jest tests and do not replace manual
VoiceOver, Narrator, or NVDA validation.

Platform variants should record verified native normalization rather than
fabricate web parity. On the current Windows and Win32 hosts, React Native
exposes Switch as a `button`; Windows Fabric exposes Divider as a named `group`,
while Win32 Paper and macOS expose it as `separator`. Win32 Paper does not
currently expose selected state for Card, MenuItem, or Tab, or checked state
for Radio and Switch, so those variants assert role, name, and enabled state
without fabricating unavailable values.

### Focus and survival tests

The `focus` capability means that the provider can set and read actual keyboard
focus. Use the portable `focus` action for focus-visual and crash regressions;
it works without global physical input. Pointer activation remains a separate
contract: Windows and Win32 normally move focus after a click, while React
Native macOS intentionally does not on ordinary mouse-down. Use `pause` for a
fixed, abortable delay; the focus-crash regressions preserve the original
3,000 ms post-focus window.

The eleven regressions formerly owned by the Windows Jest smoke harness are
now component-authored plans. The FocusVisual consumer regression mounts
Accordion last on Windows; the full Accordion module remains macOS-only, and
Win32 excludes Accordion and ListItem through explicit platform policy.

### Results, quarantine, and evidence

Runs with failures report `failed`; runs with no executed passing test report
`incomplete`, so an all-skipped suite is never green. Set
`FURN_STORYBOOK_REQUIRED_CAPABILITIES` to a comma-separated capability list and
`FURN_STORYBOOK_REQUIRE_COMPLETE_TESTS=1` on authoritative interactive runners.
Missing required capabilities then produce an infrastructure error, while
ordinary hosted-runner limitations remain explicit skips.

A temporary quarantine is static test metadata with `owner`, `issue`, and
`expires`. Quarantined tests have their own result status, do not count as
passing coverage, and fail after the expiry date. The repository policy is
zero automatic retries; investigate the first failure or use a reviewed,
expiring quarantine.

Each run writes `run.json`, `junit.xml`, `events.ndjson`, `host.json`, per-test
`result.json`, and bounded failure evidence. Windows and Win32 smoke lifecycles
also write `ownership.json` after cleanup. CI retains Storybook artifacts for
14 days. Screenshots are diagnostic evidence, never deterministic assertions,
and must be reviewed before sharing because they can contain application data.

The legacy `@react-native-windows/automation` Jest harness was retired by
#4294 on August 31, 2026. The Desktop Driver Storybook pipeline is the only
supported story-test path.
