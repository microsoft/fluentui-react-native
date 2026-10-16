---
id: repository.architecture
kind: instruction-reference
owner_paths:
  - packages
  - apps
---

# Repository architecture

FluentUI React Native is a monorepo of React Native components implementing Microsoft's Fluent Design System for
iOS, Android, macOS, Windows, and Win32. It is an alpha-stage library under active development.

## Layout

```text
apps/
  bundle-size/          Bundle-size measurement and baselines
  component-generator/  Component scaffolding tool
  E2E/                  Appium/WebdriverIO end-to-end tests for v0/v1 components
  fluent-tester/        FluentTester host for Android, iOS, macOS, and Windows
  storybook/            Agentic component Storybook for macOS, Windows, and Win32
  tester-core/          Shared FluentTester pages and registry
  win32/, win32-81/     Win32 FluentTester hosts
packages/
  agentic/components/   Modern agentic components and public primitives
  agentic/design/       Design tokens, theming, styling, and color utilities
  agentic/desktop-driver/            Desktop WebDriver test driver
  agentic/native-core/  Shared modern native components and TurboModules
  agentic/storybook-desktop*/        Reusable desktop Storybook CLI and runtime
  components/           Stable v0 and v1 components
  experimental/         v0/v1 components under development, including native-backed ones
  framework/            v1 framework: composition, framework, use-slots, use-styling, use-tokens, theme
  framework-base/       Shared component patterns, slots, hooks, accessibility, and JSX runtime
  deprecated/           v0 foundation frameworks (foundation-compose and related packages)
  theming/              Platform themes (android, apple, default, win32) and theme types and tokens
  shim/                 Compatibility entrypoints for moved packages such as Callout and FocusZone
  utils/, libraries/, codemods/, dependency-profiles/
scripts/                fluentui-scripts CLI, shared configs, and repository tasks
docs/                   Documentation site source
references/agents/      Shared agent references (this library)
```

## Component generations

The repository contains three component-authoring models plus native code that can accompany any of them:

- **v0:** `@uifabricshared/foundation-compose` settings-based components; maintenance-only.
- **v1:** `@fluentui-react-native/framework` `compose` and `compressible` components; maintenance-only. Many packages
  export both a legacy component and a `V1` component, for example `Button` and `ButtonV1`.
- **Agentic:** `packages/agentic/components`, built with framework-base patterns, reviewed contracts, and design
  tokens. New components use this model.
- **Native:** native views, TurboModules, and services. New modern native code belongs in native-core.

Use the [classification guide](../components/classification.md) to identify the model of the code you are changing.

## Shared concepts

- **Slots:** a slot is an inner component in the render tree, such as a Button's `root`, `icon`, and `content`. Slots
  enable composition and customization; components wrapping one native component typically have one slot.
- **Tokens:** design-time values set by the theme or by component customization. See
  [tokens and theming](../design/tokens-and-theming.md).
- **Platform files:** React Native resolves `.ios`, `.android`, `.macos`, `.windows`, and `.win32` variants. Document
  platform differences in the component's `SPEC.md`.
- **Themes:** components require a `ThemeProvider` from `@fluentui-react-native/design/theming`.
