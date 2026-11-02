---
'@fluentui-react-native/design': minor
---

Add the component traits vocabulary to the `@fluentui-react-native/design/styling` entry point. The `Traits` type and its
facet types describe a component's typography, geometry, interaction channels, hover, and focus visuals. The new helpers
are `functionalTypography`, `getRadiusStyleValue`, `getStrokeWidthStyleValue`, `channelStatePriority`, and
`resolveHoverMode`.

Flex border radius values now follow the Flex specs in every theme, including themes built from a Fluent `Theme`:
`borderRadius` is 4, 8, 12, 16, 24, 28, and 9999 from `base100` to `circular`. The Fluent fallback radius override and
the mapping between `borderRadius.base200` and the legacy `components.Button.tokens.borderRadius` are removed, so a
legacy Theme keeps its own Button radius.
