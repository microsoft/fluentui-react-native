---
id: design.testing
kind: instruction-reference
owner_paths:
  - packages/agentic/design/src/test
---

# Testing helpers

- **R-DESIGN-002:** Production code must not depend on `@fluentui-react-native/design/testing` or
  `@fluentui-react-native/design/testing/theme`.

`@fluentui-react-native/design/testing` is the test-only entry point for
fixtures and validation helpers associated with the design package. It exports:

- the x3 cool `defaultFlexTokens` and the default resolved appearance;
- `mockTheme` for tests that need a legacy-compatible theme;
- WCAG thresholds and canonical semantic color pairings;
- structured contrast audits and filters for failed or unresolvable pairs.

The color validation helpers build on `color-lib`, but are not designed for
component render paths or other production runtime code. Production consumers
that need parsing, conversion, interaction generation, compositing, or a direct
contrast ratio should import `@fluentui-react-native/design/color-lib`.
Color validation policy, semantic pairings, and audit helpers belong under
`src/test/color-validation`, and conformance fixtures under `src/test/fixtures`;
export them from the `testing` entry point when they are generally useful to
tests. `src/test/compatibility` holds the public-surface, legacy-runtime, and
import-boundary baselines. Testing-only validation is
intentionally omitted from production bundle-size scenarios.

```ts
import { defaultFlexTokens, getContrastFailures, validateContrastPairs } from '@fluentui-react-native/design/testing';

const failures = getContrastFailures(validateContrastPairs(defaultFlexTokens.color, 'light'));
```

## Theme helpers

`useThemeState` and `useThemeAppearance` throw when no theme is above the caller, so a test that renders a Flex
consumer needs a boundary. `@fluentui-react-native/design/testing/theme` exports the helpers that provide one. It is a
separate entry point because it imports `react-native` through `ThemeProvider`, while `./testing` stays free of
`react-native` for plain-Node Jest platforms and for `@fluentui-react-native/test-tools`, which re-exports `mockTheme`.

- `TestThemeProvider` is a `ThemeProvider` that defaults to one `FlexThemeReference` per mounted provider and an
  appearance source pinned to `light`, `standard`, and `base`, so results match `defaultFlexTokens` on every platform.
  It accepts `theme`, `appearance`, `appearanceSource`, and `fallbackAppearance` overrides.
- `createThemeWrapper(props)` returns a stable `wrapper` component for `render` and `renderHook` from
  `@testing-library/react-native`, or for wrapping a `react-test-renderer` tree.

```tsx
import { createThemeWrapper } from '@fluentui-react-native/design/testing/theme';

const { result } = renderHook(() => useThemeState(), { wrapper: createThemeWrapper({ appearance: { colorScheme: 'dark' } }) });
```

Agentic component tests render through the package-private `render` helper, which places a `ThemedRoot` around the
scene; see the components `tests-and-stories.md`.

The package's internal validation suite audits rest, hover, and pressed values
for both the cool and warm color tones. Its pinned conformance fixtures and the
bulk `getInteractionColorOverrides` helper under `src/test/fixtures` are
implementation evidence rather than public testing exports.
`x3InteractionConformance` and `x3WarmInteractionConformance` record each
tone's x3 rest, hover, and pressed values, and `x3CoolExplicitStates` records
the cool states the interaction policy does not reproduce, with the reason each
default authors them. The x3 default parity tests under `src/flex/defaults` are
described in `tokens.md`.

`validateContrastPairs` accepts a flat map of color values or resolved
`InteractiveColor` envelopes, which it audits at rest. To audit an interaction
state, pass a flat map of that state's values.
