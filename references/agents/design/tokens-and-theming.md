---
id: design.tokens-and-theming
kind: instruction-reference
owner_paths:
  - packages/agentic/design
  - packages/theming
---

# Tokens, theming, and color utilities

- **R-DESIGN-001:** Use [flex-token-map.yaml](../../../packages/agentic/design/src/tokens/mappings/flex-token-map.yaml)
  as the canonical mapping from generic CSS and Fluent token sources to grouped React Native Flex token paths. When
  mapping an agentic component to an existing V1 component, use the Win32, macOS, or Windows implementation as the
  compatibility reference; use iOS only when the work explicitly targets iOS.
- **R-DESIGN-002:** Production code must not depend on `@fluentui-react-native/design/testing`.

## Tokens

Tokens are design-time values set through the theme or component customization, for example a brand color. v1 tokens
can also be props through `tokensThatAreAlsoProps`; see the [v1 recipe](../components/v1.md). Agentic token use is
covered by [styles and tokens](../components/agentic/styles-and-tokens.md).

## Theme-specific styles

Cache `StyleSheet.create` results that depend only on `ThemeState` with a module-scoped getter created by
`themedStyleSheetFactory`. Treat cached sheets as immutable, and apply props, interaction state, and user styles
separately so instances can share them.

## Color utilities

Runtime-safe parsing, conversion, compositing, contrast, and interaction generation live behind the opt-in
`@fluentui-react-native/design/color-lib` subpath. Keep its public exports narrow and add APIs only for demonstrated
production needs.

Color validation policy, semantic pairings, audit helpers, and conformance fixtures belong under
`packages/agentic/design/src/testing/`. Export them from `@fluentui-react-native/design/testing` when generally useful
to tests. Testing-only validation does not need bundle-size scenarios.

## Theme packages

Platform themes live in `packages/theming`: `android-theme`, `apple-theme` (iOS and macOS), `win32-theme`, and
`default-theme`, with shared `theme-tokens` and `theme-types`. Components require a `ThemeProvider` from
`@fluentui-react-native/design/theming`.
