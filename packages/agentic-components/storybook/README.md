# Agentic Components Storybook

On-device [Storybook](https://storybook.js.org/) app (Storybook for React Native v10) for
`@fluentui-react-native/components`. It loads every `*.stories.(ts|tsx)` file from the
library source (`../src`) so new component stories appear automatically.

It runs in Storybook **liteMode**, which mocks out the heavy default on-device UI
(`@storybook/react-native-ui`). This avoids the `react-native-reanimated` /
`react-native-gesture-handler` / `@gorhom/bottom-sheet` / `react-native-svg` native dependency
chain, which does not bundle cleanly with this repo's Metro + Babel + pnpm-linker toolchain
(Reanimated's Babel plugin crashes when Metro bundles Reanimated from source).

## Layout

```
storybook/
  .rnstorybook/        Storybook config (main.ts, preview.tsx, index.tsx)
  StorybookApp.tsx     Root component -> renders the Storybook UI
  index.js             AppRegistry entry
  app.json             react-native-test-app manifest
  metro.config.js      rnx-kit metro config wrapped with withStorybook (liteMode)
  babel.config.js      @react-native/babel-preset
  react-native.config.js
```

> `StorybookApp.tsx` is intentionally not named `App.tsx`: on a case-insensitive macOS
> filesystem `App` collides with `app.json` during Metro resolution.

The `.rnstorybook/storybook.requires.ts` file is **generated** (git-ignored) from the
`main.ts` stories glob by the `withStorybook` metro wrapper when Metro starts, or on demand via:

```sh
yarn workspace @fluentui-react-native/agentic-components-storybook storybook-generate
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
Windows' New Architecture and Fabric renderer.

```powershell
# from this directory
# 1. Generate the Fabric Windows solution
yarn windows:generate

# 2. Start Metro (also generates storybook.requires)
yarn start

# 3. In another terminal, build and launch the Windows app
yarn windows
```

Requires Visual Studio 2022 with the React Native Windows build prerequisites. The generated
solution, `ExperimentalFeatures.props`, and build outputs are git-ignored and can be regenerated
with `yarn windows:generate`.

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
(`.rnstorybook/index.tsx` calls `getStorybookUI({ enableWebsockets: true, host, port })`).

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

> We run the channel server standalone (via `@storybook/react-native/node`'s `createChannelServer`)
> rather than through `withStorybook`, because the bundler-agnostic `withStorybook` only starts it in
> entry-point-swapping mode (`STORYBOOK_ENABLED=true`), which conflicts with this app's in-app
> integration.

## Writing stories

Add a `*.stories.ts(x)` file next to a component in `../src/components/<name>/`. See
`../src/components/button/button.stories.ts` for the CSF format:

```ts
import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from './button';

const meta: Meta<typeof Button> = { title: 'Components/Button', component: Button };
export default meta;

export const Default: StoryObj<typeof Button> = {};
```
