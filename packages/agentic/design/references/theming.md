---
id: design.theming
kind: instruction-reference
owner_paths:
  - packages/agentic/design/src/theming
  - packages/agentic/design/src/types
  - packages/agentic/design/src/flex/flexThemeReference.ts
  - packages/agentic/design/src/flex/useThemeState.ts
  - packages/agentic/design/src/fluent
---

# Theming

One `ThemeProvider` supports both legacy Fluent `Theme` authoring and Flex-first authoring without eagerly constructing
both models. Modern consumers read Flex tokens through `useThemeState`; legacy consumers keep `useTheme` and the raw
`ThemeContext`, and receive a lazily projected `Theme` when the active source is Flex-authored.

## Authoring models

| Source               | Kind     | Resolves                                        | Import from                                                                                      |
| -------------------- | -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `FlexThemeReference` | `flex`   | One `FlexTokens` object per resolved appearance | `@fluentui-react-native/design`                                                                  |
| `ThemeReference`     | `legacy` | One legacy `Theme` per resolved appearance      | `@fluentui-react-native/design/theming` or `@fluentui-react-native/design/theming/legacy-source` |

`FlexThemeReference` accepts `base`, `appearance`, `fallbackAppearance`, `appearanceSource`, and `legacyFallback`
options followed by recipes. It merges the design package's x3 default Flex token description for the resolved
`colorTone`, then the base input, then recipes in declaration order, and resolves the result once per appearance. A base
may be a function of the resolved appearance, which always has a concrete `colorTone`. A recipe receives the accumulated
authored description and the resolved appearance. `PartialFlexTokens` is shape-aware so opaque React Native colors stay
leaves. `tokens.md` describes the defaults.

Each color is authored as a value, a `[light, dark]` tuple, or `flexColor` options with explicit states and an
interaction type, and replaces the previous color atomically. Each resolved color is an `InteractiveColor` with `rest`,
`hover`, and `pressed`. Omitted states of interactive tokens are derived from rest with the `color-lib` interaction
algorithm on first read; no import, provider setting, or registration is required. `flex-colors.md` owns the authoring,
resolution, and merge rules and the migration from flat colors.

```ts
import { FlexThemeReference } from '@fluentui-react-native/design';

const theme = new FlexThemeReference({
  appearance: { colorScheme: 'system' },
  base: { color: { surfaceNeutralNear: ['#ffffff', '#1f1f1f'] } },
});
```

`ThemeReference` keeps its constructor, one-argument recipes, `theme` accessor, `update`, `invalidate`, and listeners.
Recipes also receive the resolved appearance as an optional second argument, and `resolveTheme(appearance)` caches
each appearance independently.

Both references expose a monotonic `revision`. `update` and `invalidate` increment it, clear every cached appearance,
and notify listeners. A reference built on a parent reference subscribes to that parent only while it has listeners, and
otherwise compares the parent's revision when it resolves.

## Providers and boundaries

`ThemeProvider` takes `theme` (either source) and optional `appearance`, `appearanceSource`, and `fallbackAppearance`.
It subscribes to the source revision and the selected appearance source and publishes metadata, not converted models:

- for a legacy source, it resolves the authored `Theme` and publishes it to the raw `ThemeContext`;
- for a Flex source, it publishes `undefined` to the raw context and resolves neither model.

A `ThemeProvider` is a complete boundary: it does not inherit a parent's source or appearance requests. Each axis
resolves from the provider prop, then the source option, then the selected appearance source, then the fallback
(`light`, `standard`, and `base` unless a source or provider supplies another fallback).

`ThemedRoot` is a `View` wrapped in a `ThemeProvider`. With no `theme`, it inherits the nearest boundary's source,
requested appearance, appearance source, and fallback, overriding only the fields it sets; with no boundary it uses a
default `FlexThemeReference`. An explicit `theme` starts a new configuration. The outermost root also provides
`RootContext` and input-modality tracking; `RootInputBoundary` attaches popup or window content to the same scene.
User-facing examples are in the repository's
[theming basics](https://github.com/microsoft/fluentui-react-native/blob/main/docs/pages/Theming/Basics.md).

`useThemeState`, `useThemeAppearance`, and `useTheme` select the same effective boundary. A nearer raw
`ThemeContext.Provider` whose `Theme` differs from the one published by the nearest `ThemeProvider` becomes an implicit
legacy boundary for all of them, which keeps deprecated `ThemeLayer` and direct context providers working.

## Consumption and laziness

| Hook                 | Returns                                                          | Without a boundary           |
| -------------------- | ---------------------------------------------------------------- | ---------------------------- |
| `useThemeState`      | `ThemeState`: `tokens`, resolved `appearance`, and `themeStyles` | The default state            |
| `useThemeAppearance` | The requested and resolved appearance                            | The default appearance state |
| `useTheme`           | The legacy `Theme` (from the `theming` subpath)                  | `undefined`                  |

`ThemeState.highContrast` is deprecated; use `appearance.contrast`.

| Active source | Provider mount                     | `useThemeState`                   | `useTheme`                             |
| ------------- | ---------------------------------- | --------------------------------- | -------------------------------------- |
| Legacy        | Resolves the authored `Theme` only | Projects `Theme` to Flex once     | Returns the authored `Theme`           |
| Flex          | Resolves neither model             | Resolves the authored Flex tokens | Projects Flex tokens to a `Theme` once |

Caches are external `WeakMap`s keyed by source, revision, and resolved appearance; author-owned objects are never
mutated. Consumers of the same source, revision, and resolved appearance share one `FlexTokens`, `ThemeState`, and
`themeStyles` registry; a requested `system` and a requested `light` share them while both resolve to light. Toggling
back to an appearance reuses its entry within a revision, and a revision change replaces every entry, so each new
`ThemeState` owns a new style registry and each projected legacy `Theme` has a new root.

## Appearance

A request has `colorScheme` (`light`, `dark`, or `system`), `contrast` (`standard`, `highContrast`, or `system`), and
`interfaceLevel` (`base`, `elevated`, or `system`), plus an optional `colorTone` (`cool` or `warm`). The resolved
appearance is always concrete. `colorTone` is a design choice rather than a platform setting, so appearance sources never
supply it: it resolves from the provider or root request, then the source's `appearance` option, then the fallback
appearance, then `cool`. A nested `ThemedRoot` inherits it with the other requested axes, and a raw legacy
`ThemeContext` boundary resolves to `cool`. Caches key a warm appearance separately; cool keeps the existing
`colorScheme|contrast|interfaceLevel` key, and the complete legacy defaults do not vary by tone. A
`ThemeAppearanceSource` provides a stable `getSnapshot()` and a `subscribe()` that installs native listeners only while
subscribed; create one with `createThemeAppearanceSource`.

| Platform       | Platform appearance source                                                                    |
| -------------- | --------------------------------------------------------------------------------------------- |
| Default        | React Native `Appearance` for the color scheme                                                |
| macOS          | `Appearance` plus `AccessibilityInfo` high contrast and its change event                      |
| Windows        | `Appearance` plus `AppTheme.isHighContrast` and its change event                              |
| iOS            | `@fluentui-react-native/apple-theme` injects the native interface level                       |
| Win32 (Office) | `@fluentui-react-native/win32-theme` adapts Office host-theme events; see `remaining-work.md` |

`appearanceOptionsFromLegacy` and `appearanceOptionFromResolved` translate the deprecated `AppearanceOptions` union,
including `darkElevated`, `highContrast`, and `dynamic`. `getCurrentAppearance`, `isHighContrast`, and
`setIsHighContrast` remain for existing callers.

## Legacy projection and bundle boundary

The package root exports only the modern authoring and consumption APIs. It reaches the forward Theme-to-Flex adapter,
which `useThemeState` needs for legacy sources, and the Flex interaction policy with the raw `color-lib` interaction
algorithm, but not `useTheme`, the reverse converter, the complete legacy defaults, or legacy token payloads. The legacy
`ThemeReference`, `useTheme`, and `ThemeProvider` graphs reach neither Flex nor `color-lib`. An app that pairs a legacy
`ThemeReference` with `useThemeState` reaches the forward adapter and, through the default theme state, the x3 defaults
and the interaction policy with `color-lib/interaction`, but not `FlexThemeReference`, `color-lib/compositing`, or the
compatibility projection. `entry-points.md` lists every subpath.

`themeFromFlexTokens` in `theming/compat` builds a complete `Theme` in this order:

1. the appearance-specific complete legacy base from `getDefaultLegacyTheme`;
2. the source's `legacyFallback`, which preserves component recipes, custom colors, and host metadata that Flex cannot
   represent;
3. the generated Flex projection, so mapped Flex values are authoritative;
4. `host.appearance` metadata derived from the resolved appearance.

The reverse projection is intentionally lossy; `tokens.md` describes how the mapping chooses one canonical Flex value per
legacy path. A layered shadow keeps only its first and last layers as `ambient` and `key`, and motion tokens have no
legacy path. The `apps/bundle-size` `design-*` scenarios guard this module boundary.
