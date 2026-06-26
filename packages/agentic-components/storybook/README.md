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

## Bundling (no native toolchain required)

You can produce the JS bundle without Xcode. This also generates `storybook.requires` first:

```sh
yarn bundle:macos   # -> writes index.macos.jsbundle
```

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
