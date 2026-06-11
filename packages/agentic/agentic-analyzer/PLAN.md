# @fluentui-react-native/agentic-analyzer

> Status: **Plan** (package not yet created). Part of the `packages/agentic/` modernization — see [`../STAGING.md`](../STAGING.md).

## Purpose

A test/analysis toolkit that lets us **safely refactor** v1 components by:

1. building a **sentinel theme** whose every leaf value is unique,
2. rendering components with **`@testing-library/react-native`** to capture accessibility trees, computed styles, and snapshots, and
3. **reverse-mapping** resolved style values back to the exact theme/token slot they came from — so a refactor that changes *which* token feeds a style is caught even when the final pixel value is unchanged.

Plus a strategy for **multiplexing jest per platform**.

## Identity

- **npm:** `@fluentui-react-native/agentic-analyzer`
- **path:** `packages/agentic/agentic-analyzer/`
- Introduces the repo's **first** dependency on `@testing-library/react-native` (must thread through `scripts/dynamic.extensions.mts` / align-deps). Add to root `tsconfig.json` `references`.

## Findings that shape it

- **Theme is injectable; values pass through untransformed.** `Theme` (theme-types) is delivered via context; `themedStyleSheet`/`buildUseTokens` cache **by theme object identity** and do no value parsing — so swapping a sentinel theme cleanly busts caches and unique values survive into `StyleSheet.create`. Sentinel feasibility is HIGH for everything reachable through the theme.
- **`globalTokens` is NOT injectable.** It's a static JSON import (`theme-tokens/src/tokens-global.ts` → `design-tokens-windows/.../tokens-global.json`). Sentinelizing it requires **jest module mocking**, not theme injection — the reverse map must span both the `theme.*` and `globalTokens.*` namespaces.
- **Current tests:** `react-test-renderer` + `toMatchSnapshot` (`Checkbox.test.tsx` etc.); `test-tools` exports `validateHookValueNotChanged` + `mockTheme`. No `@testing-library/react-native` anywhere yet.
- **Platform is fixed per package, one platform per jest run.** `scripts/configs/jest/jest.config.cjs` reads `projectManifest.furn.jestPlatform` (default `ios`) and calls `@rnx-kit/jest-preset(platform, …)`; `scripts/src/tasks/jest.ts` runs jest once. **No multiplexing** — each component is currently tested on exactly one platform.

## Proposed capabilities

1. **Sentinel theme + reverse map** — `createSentinelTheme(base?)` clones a real `Theme`, replacing every leaf with a unique type-valid sentinel (colors → reserved unique hex; spacing → unique `'NNNpx'`; numeric sizes/shadows → reserved integers; strings → reserved-but-valid pool), emitting a `SentinelMap: value → "colors.buttonBackground" | "spacing.m" | …`. `createSentinelGlobalTokens()` + a jest mock factory for `@fluentui-react-native/theme-tokens` covers the static namespace. `resolveStyleToSemantic(style)` walks a computed RN style and substitutes sentinels with semantic names.
2. **testing-library helpers** — `renderWithTheme(el, {theme?, platform?})`, `getAccessibilityTree(result)`, `getComputedStyles(result, query)`, `snapshotSemantic(result)` (snapshot with sentinel→semantic substitution; stable across pixel changes, sensitive to slot-source changes).
3. **Pinning** — `pinComponent(Component, scenarios)` producing **dual** snapshots: a *value* snapshot (catches visual regressions) + a *semantic* snapshot (catches silent token-source swaps). Drives the v1 state matrix (hovered/pressed/disabled/checked via `.customize`/state layers).
4. **Per-platform jest multiplexing** — `makeJestConfig(platform)` that takes the platform from `FURN_JEST_PLATFORM` (falling back to `furn.jestPlatform`), and a `multiplex` runner that, for a `furn.jestPlatforms: [...]` array, spawns one jest process per platform with platform-suffixed snapshot dirs (preserving the one-platform-per-process model the preset requires — and respecting the AGENTS.md "no multiple RN forks in one program" rule).
5. **OKLCH interaction algorithm (home + validator).** A JS port of the x3-design hover/pressed derivation — `--lightness-{hover,press}`/`--alpha-{hover,press}` deltas, the lightness curve `1 + clamp(0, (0.40 - L)/0.20, 1)`, and the `loud`/`heavy`/`onloud` inverse rule (per the `tokens-interaction` skill). This is the **single home** of the algorithm. Two consumers: (a) `agentic-analyzer` uses it to **validate** that `agentic-tokens`' shipped precomputed hover/pressed values match what the algorithm produces from the rest generics — a regression guard on both rest tokens and the formula; (b) `agentic-tokens`' build-time generator imports it (dev dependency only) to *produce* those precomputed values, so the runtime token output stays static and analyzer-free. Pin tests assert solid/inverse/transparent cases against the worked examples in the skill.

## Proposed structure

```
agentic-analyzer/
  package.json  tsconfig.json  README.md  PLAN.md
  src/
    index.ts
    sentinel/ createSentinelTheme.ts  sentinelGlobalTokens.ts  reverseMap.ts  allocator.ts
    render/   renderWithTheme.tsx  accessibility.ts  styles.ts  snapshot.ts
    pinning/  pinComponent.ts  states.ts
    jest/     makeJestConfig.cjs  multiplex.ts
    interaction/  oklch.ts  deltas.ts  derive.ts  validate.ts   # OKLCH hover/pressed algorithm (home + validator)
```

> The `interaction/` module is importable on its own (no test deps) so `agentic-tokens`' build-time generator can reuse it to precompute values, while `agentic-tokens`' runtime output carries no dependency on `agentic-analyzer`.

## Dependencies & intersections

- **agentic-concepts:** concepts owns *what to pin* (component catalog + scenario matrix + assertion contract); analyzer owns the *machinery* those specs call.
- **agentic-tokens:** analyzer's reverse map is the bridge proving a refactor from old refs → x3-design `--gnrc-*` generics preserves resolved values. `createTokens` is the sentinel injection point. Because hover/pressed are **derived** (OKLCH deltas, precomputed for RN), the analyzer must also assert each derived interaction value matches the algorithm — so pins catch both rest-token and delta-formula regressions.
- **agentic-components:** provides the parity gate — new components must reproduce v1's pinned a11y tree / styles / snapshots.
- Internal: reuse `Theme`/`useTheme` (theme-types), `ThemeProvider` (theme); may supersede `test-tools`' `mockTheme` as the sentinel base.

## Open questions

- `globalTokens` mocking: mock the `theme-tokens` package or the underlying `design-tokens-windows` JSON?
- Reserved-but-valid value pools for non-arbitrary leaves (font families/weights); avoid colliding color hexes.
- First multiplex run surfaces **new** snapshots for previously-untested platforms → expect churn / platform-specific failures unrelated to refactors.
- Platform-suffixed snapshot layout to avoid cross-platform `.snap` clobbering.
- RNTL output differs from `react-test-renderer` — pin in RNTL's format from the start, don't chase legacy snapshot parity.
- Confirm `@rnx-kit/jest-preset` honors an env-driven platform and that its `transformIgnorePatterns`/`transform` overrides still compose when wrapped.

## Phased plan

1. **Scaffold + deps:** create package, add `@testing-library/react-native`, get a trivial `renderWithTheme` passing for one component (Button, ios) under the existing preset.
2. **Sentinel theme + reverse map** over the theme namespace; prove `resolveStyleToSemantic` round-trips on a real component.
2b. **OKLCH interaction module** (`interaction/`) — port the deltas + lightness curve + inverse rule; unit-test against the skill's worked examples. Land this early: `agentic-tokens`' Stage-2 build depends on it to precompute hover/pressed, and the analyzer uses it to validate them.
3. **globalTokens sentinel + jest mock;** extend reverse map to `globalTokens.*`.
4. **Extraction + semantic snapshots** (`getAccessibilityTree`/`getComputedStyles`/`snapshotSemantic`).
5. **Pinning API + state matrix;** hand off to `agentic-concepts` to author per-component specs.
6. **Per-platform multiplex** (`makeJestConfig.cjs` + `multiplex` + suffixed snapshot dirs + `furn.jestPlatforms`).
7. **Harden + baseline:** align-deps/depcheck/dynamic-extensions integration; run a full multiplexed sweep to establish v1 baseline pins.
