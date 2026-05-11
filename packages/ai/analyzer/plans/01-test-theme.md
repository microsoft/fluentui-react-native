---
title: Analyzer — Test Theme & Style-to-Token Resolver
status: ready
parallelizable: true
blockedBy: [00-setup]
permissions:
  allow:
    - "Bash(yarn:*)"
    - "Bash(npm:*)"
    - "Bash(npx:*)"
    - "Bash(node:*)"
    - "Bash(tsgo:*)"
    - "Bash(tsc:*)"
    - "Bash(jest:*)"
    - "Bash(eslint:*)"
    - "Bash(ls:*)"
    - "Bash(find:*)"
    - "Bash(grep:*)"
    - "Bash(rg:*)"
    - "Bash(cat:*)"
    - "Bash(head:*)"
    - "Bash(tail:*)"
    - "Bash(wc:*)"
    - "Bash(mkdir:*)"
    - "Bash(cp:*)"
    - "Bash(mv:*)"
    - "Bash(touch:*)"
    - "Bash(git status)"
    - "Bash(git diff:*)"
    - "Bash(git log:*)"
    - "Bash(git show:*)"
---

# Test Theme & Style-to-Token Resolver

## Context

Package: `@fluentui-react-native/analyzer` at `packages/ai/analyzer/`. The setup brief (`00-setup.md`) has created the directory skeleton and shared types in `src/types.ts`. You are filling in `src/theme/`.

The goal is to allow an agent rendering a FluentUI RN component to ask: "for each style property on each slot, **which theme token produced this value?**" There is no existing tooling for this in the repo — token resolution is a one-way pure function from theme → style object.

### Theme shape (verified)

Canonical `Theme` lives at `packages/theming/theme-types/src/Theme.types.ts`. Top-level fields:

- `colors` — `ThemeColorDefinition` (background, bodyText, subText, disabledText, plus an extended Palette)
- `typography` — `{ families, sizes, weights, variants }` (sizes: caption/secondary/body/subheader/header/hero/heroLarge; variants: 13 v1 + 18 v2)
- `spacing` — `{ s2, s1, m, l1, l2 }` (px strings)
- `shadows` — base alias tokens (shadow2/4/8/16/28/64, brand variants), each `{ ambient: ShadowValue, key: ShadowValue }`
- `components` — `Record<string, Record<string, unknown>>` (per-component token overrides)
- `host` — `{ appearance, palette?, colors? }`

The default mock used by some legacy utilities is `packages/utils/test-tools/src/mockTheme.ts` — read it for reference but **do not** depend on it; you are producing a different kind of theme (unique sentinel values per token).

Token resolution flows through `packages/framework/use-styling/src/buildUseStyling.ts` and ends with a plain RN style object on each slot (e.g., Button root receives `{ style: ViewStyle, android_ripple?: { color } }` — see `packages/components/Button/src/Button.styling.ts`).

## Deliverables

All under `packages/ai/analyzer/src/theme/`.

### 1. `createTestTheme.ts` — unique-sentinel theme

```ts
import type { Theme } from '@fluentui-react-native/theme-types';
export function createTestTheme(): Theme;
```

For **every leaf token** in the theme, the value must be unique and reverse-mappable to its path. Strategies per type:

- **Colors** — encode the token path into a deterministic hex via a path → 24-bit hash, formatted `#RRGGBB`. Guarantee no collisions within the produced theme (regenerate or salt on collision; assert in a test).
- **Numbers** (font sizes, weights, line heights, shadow x/y/blur) — use a monotonically increasing counter, but keep them in plausible ranges (e.g., 100–999 for sizes, 100–900 step 100 for weights) so React Native doesn't reject them.
- **Strings** (font families, spacing px values) — embed the path: e.g., `'8px /*spacing.s1*/'` is fine because RN tolerates trailing whitespace, but cleaner is a registry-based approach (see §2) where the *value* is a plain string and a side-table records the mapping. Pick whichever is simpler — registry preferred.
- **Shadow values** — each `{ x, y, blur, color }` gets unique numerics for x/y/blur and a unique color via the color strategy.
- **`components`** — populate entries for every component name reachable from `@fluentui/react-native`. The simplest viable approach is to build this on-demand: the `useTokens` lookup goes through `theme.components[name]` — return a Proxy-backed object that synthesizes a unique value for every property access and records the mapping in the registry.

### 2. `tokenRegistry.ts` — bidirectional map

```ts
export interface TokenRegistry {
  /** Look up the token path that produced a given value. */
  lookup(value: unknown): string | undefined;
  /** Register a (path → value) mapping. Throws on collision. */
  register(path: string, value: unknown): void;
  /** Snapshot of all entries for debugging. */
  entries(): ReadonlyArray<{ path: string; value: unknown }>;
}
export function createTokenRegistry(): TokenRegistry;
```

`createTestTheme()` builds and attaches a registry — expose it via a second return-value or a `getTestThemeRegistry(theme)` helper. Whichever shape, document it clearly; downstream code needs both the theme and its registry together.

### 3. `resolveStyleToTokens.ts` — reverse mapper

```ts
import type { TokenRegistry } from './tokenRegistry';

export interface ResolvedStyleEntry {
  property: string;      // e.g., 'backgroundColor', 'paddingHorizontal'
  value: unknown;        // raw value present in the style object
  tokenPath?: string;    // registry hit, if any
}

export function resolveStyleToTokens(
  style: Record<string, unknown> | null | undefined,
  registry: TokenRegistry,
): ResolvedStyleEntry[];
```

- Flatten arrays (RN styles can be `[styleA, styleB]`).
- Skip `undefined`/`null` properties.
- Return entries in insertion order.

### 4. `extractStyles.ts` — tree walker for styles

```ts
import type { RenderNode, SlotPath } from '../types';

export interface ExtractedStyle {
  path: SlotPath;
  type: string;          // node type, e.g., 'View'
  testID?: string;       // forwarded if present (helps slot identification)
  style: Record<string, unknown> | undefined;
}

export function extractStyles(root: RenderNode): ExtractedStyle[];
```

Uses `walkTree` from `src/tree/walk.ts`. Returns the flat list of nodes that carry a `style` prop.

### 5. `mapComponentToTokens.ts` — top-level convenience

```ts
import type { ReactTestRenderer } from 'react-test-renderer';
import type { AnalyzerOutput } from '../types';
import type { ResolvedStyleEntry } from './resolveStyleToTokens';

export interface ComponentTokenMap {
  slots: Array<{
    path: SlotPath;
    type: string;
    testID?: string;
    entries: ResolvedStyleEntry[];
  }>;
}

export function mapComponentToTokens(
  renderer: ReactTestRenderer,
  registry: TokenRegistry,
): AnalyzerOutput<ComponentTokenMap>;
```

### 6. Tests

In `src/theme/*.test.ts`:

- `createTestTheme` — every color is unique; theme satisfies the `Theme` type (`tsc --noEmit` suffices, no runtime assertion needed beyond uniqueness).
- `resolveStyleToTokens` — for a hand-built style object using values from a known registry, returns the right `tokenPath` for each property.
- `extractStyles` — given a `RenderNode` literal with nested children carrying styles, returns the correct paths.
- **End-to-end** — render `<Button>Hello</Button>` (or any V1 component) wrapped in a `ThemeProvider` from `@fluentui-react-native/theme` using the test theme; call `mapComponentToTokens(renderer, registry)`; assert that the root slot's `backgroundColor` resolves to a token path that **starts with** `colors.` or `components.Button.`. Don't pin exact paths — the goal is to prove the reverse-map works, not to encode current Button styling.

## Done when

- [ ] All deliverables above implemented under `src/theme/` with tests.
- [ ] `src/theme/index.ts` re-exports the public API; `src/index.ts` already re-exports `./theme`.
- [ ] `yarn workspace @fluentui-react-native/analyzer build && test && lint` all pass.
- [ ] End-to-end test produces a non-empty token map for at least one real component.

## Open questions to resolve as you go

- **`theme.components` proxy** — the rendering machinery may iterate or destructure this; a Proxy that synthesizes unknown keys could blow up `Object.keys`. Decide on read trigger semantics early. If a Proxy is fragile, precompute entries for the set of components exported from `@fluentui/react-native` instead.
- **Variant-style tokens** — typography variants are objects, not scalars. The registry needs to track the *whole variant object* and its child fields. Pick a strategy (record at object-level, or at each leaf) and document it.
