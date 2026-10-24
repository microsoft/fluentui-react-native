---
id: design.remaining-work
kind: instruction-reference
owner_paths:
  - packages/agentic/design
---

# Remaining work

Open work for the theming and appearance contract. Completed work is removed rather than marked done; the resulting
behavior is documented in `theming.md`, `tokens.md`, and `entry-points.md`.

## Structured Win32 appearance

- **Issue:** [#4270](https://github.com/microsoft/fluentui-react-native/issues/4270)
- **Outcome:** Win32 resolves color scheme and contrast from structured Office host fields, with no high-contrast
  inference from a theme name.
- **Current state:** `createOfficeTheme` in `@fluentui-react-native/win32-theme` accepts `colorScheme` and
  `isHighContrast` from host-theme events and `initialIsHighContrast` from module constants. When both are absent, its
  transitional `getOfficeAppearance` fallback still maps the `HighContrast` host-theme name to high contrast.
- **Done when:** the Office native module is confirmed to supply both fields, the name-based fallback is removed, and
  Win32 tests cover scheme and contrast changes.

## Deprecated appearance APIs

- **Issue:** [#4270](https://github.com/microsoft/fluentui-react-native/issues/4270)
- **Outcome:** consumers use the structured appearance model, and the single-union compatibility surface can be retired.
- **Current state:** `AppearanceOptions`, `ThemeOptions`, `getCurrentAppearance`, `isHighContrast`, and
  `setIsHighContrast` are still exported from the `theming` subpath and re-exported by
  `@fluentui-react-native/theming-utils`. Only `ThemeState.highContrast` is marked deprecated. About 44 files outside
  this package still use them, including v1 component tokens, the Apple and default platform themes, and the tester app.
- **Done when:** the remaining APIs are marked deprecated, repository callers use `ThemeState.appearance`,
  `useThemeAppearance`, or the appearance adapters, and the APIs are removed in a release that permits the break, or
  are kept with a documented reason.

## Appearance-specific default tokens

- **Issue:** [#4263](https://github.com/microsoft/fluentui-react-native/issues/4263)
- **Outcome:** default Flex tokens vary by resolved color scheme, contrast, and interface level.
- **Current state:** the generated x3 defaults vary by color scheme and color tone. The pinned x3 sources define no
  high-contrast or elevated values, so those appearances use the light or dark defaults, and high contrast only
  suppresses derived interaction states. Authors must supply appearance-aware bases or recipes for high-contrast or
  elevated values.
- **Done when:** x3 publishes, or the owner approves, high-contrast and elevated values, the defaults generator emits
  them, and `FlexThemeReference` selects them by the resolved appearance without changing its laziness or identity
  guarantees.
- **Review draft:** repository-only `packages/agentic/design/refactoring.md` coordinates package reorganization,
  tone-aware interactive colors, verified x3 defaults, and the legacy compatibility gates. It is an explicitly
  requested review artifact, not a second open-work index; remove the draft and this pointer when its durable contract
  has moved into the owning references.

## Flex authoring migration guide

- **Outcome:** theme authors have a worked migration from `ThemeReference` recipes to `FlexThemeReference`, including
  `legacyFallback` for values Flex cannot represent.
- **Current state:** `theming.md` documents both authoring models, provider precedence, and reverse-projection loss. The
  repository's user documentation covers `ThemedRoot` but still teaches custom themes only through `ThemeReference`.
- **Done when:** the user documentation includes the migration example and links to this package's theming reference.

## Dependent work owned by other packages

- `@fluentui-react-native/storybook-desktop-runtime` still offers fixed light, dark, and high-contrast legacy themes;
  [#4269](https://github.com/microsoft/fluentui-react-native/issues/4269) moves Storybook to the unified provider with
  structured appearance controls.
- `@fluentui-react-native/apple-theme` still authors a legacy `Theme`;
  [#4261](https://github.com/microsoft/fluentui-react-native/issues/4261) re-authors it on Flex tokens.
