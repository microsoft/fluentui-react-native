# Agentic Components Storybook (react-native-macos)

On-device [Storybook](https://storybook.js.org/) app (Storybook for React Native v10) for
`@fluentui-react-native/agentic-components`. It loads every `*.stories.(ts|tsx)` file from the
library source (`../src`) so new component stories appear automatically.

It runs in Storybook **liteMode**, which mocks out the heavy default on-device UI
(`@storybook/react-native-ui`). This avoids the `react-native-reanimated` /
`react-native-gesture-handler` / `@gorhom/bottom-sheet` / `react-native-svg` native dependency
chain, which does not bundle cleanly with this repo's Metro + Babel + pnpm-linker toolchain
(Reanimated's Babel plugin crashes when Metro bundles Reanimated from source).

## Layout

```
storybook/
  src/                 Storybook config, root component, and generated story index
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
pod install --project-directory=macos

# 2. Start Metro (also generates storybook.requires)
yarn start

# 3. In another terminal, build & launch the macOS app
yarn macos
```

Requires Xcode + CocoaPods.

> Xcode 26 / Apple Clang 21 note: React Native 0.81 pins `fmt` 11.0.2, which fails to compile
> under the stricter `consteval` checks. `macos/Podfile` includes a `post_install` patch that
> disables fmt's compile-time format-string checking (ABI-safe), re-applied on every `pod install`.

> `react-native-safe-area-context` note: Storybook's UI imports it, but its native module is
> iOS-only (UIKit) and uses a Yoga API that doesn't compile for react-native-macos 0.81. It is
> therefore not installed; `metro.config.js` aliases the import to a JS-only stub in
> `src/storybook-mocks/`, so no native module is needed.

## Agent-driven macOS verification

The app includes a lockfile-pinned
[`agent-device`](https://github.com/callstack/agent-device) CLI and uses the unique macOS bundle
identifier `com.microsoft.AgenticStorybook`. Run commands from this directory so the checked-in
`agent-device.json` selects macOS by default.

After starting Metro and launching the app as described above:

```sh
# Read the installed, version-matched workflow before automating the app
yarn agent-device --version
yarn agent-device help workflow
yarn agent-device help react-native

# Attach to the frontmost Storybook app
yarn agent-device:attach

# Discover the accessible Storybook UI, interact, verify, and end the session
yarn agent-device snapshot -i
yarn agent-device press 'label="Disabled"' --settle
yarn agent-device close
```

Use `yarn agent-device:open` to reopen the built debug app and attach to it. The open/attach scripts
also bind the session to Metro at `127.0.0.1:8081`, allowing
`yarn agent-device metro reload` to reuse that connection. First use can require macOS
Accessibility, Screen Recording, or Input Monitoring approval for the agent-device helper. Run
`yarn agent-device:doctor` during initial setup or when a command reports an unhealthy toolchain,
helper, app, or Metro connection.

For MCP-capable agents, `yarn agent-device:mcp` starts the official stdio server. Prefer the
repository-pinned CLI or this MCP server over an unpinned global or `npx ...@latest` install.

## Bundling (no native toolchain required)

You can produce the JS bundle without Xcode. This also generates `storybook.requires` first:

```sh
yarn bundle:macos   # -> writes index.macos.jsbundle
```

## Agent interaction (WebSocket channel + MCP)

The running app can be driven by external agents through a standalone Storybook channel server
(`storybook-server.cjs`, default `127.0.0.1:7007`):

```sh
yarn storybook-server   # WebSocket: ws://127.0.0.1:7007/   MCP: http://127.0.0.1:7007/mcp
```

Run it alongside `yarn start` + `yarn macos`. The on-device app connects to it automatically
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
