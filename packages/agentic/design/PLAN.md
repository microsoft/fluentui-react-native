# Flex-first theming and structured appearance

**Status:** Implemented with a transitional Win32 host-theme adapter

**Issues:** [#4264](https://github.com/microsoft/fluentui-react-native/issues/4264),
[#4270](https://github.com/microsoft/fluentui-react-native/issues/4270)

**Primary package:** `@fluentui-react-native/design`

## Outcome

Make one `ThemeProvider` support both legacy Fluent `Theme` authoring and
Flex-first authoring without eagerly constructing both models.

New theme authors use a `FlexThemeReference`, parallel to `ThemeReference`,
that resolves one stable `FlexTokens` object for each resolved appearance.
Modern consumers read that object through `useThemeState().tokens`;
`useThemeState` is the single new consumption API and the temporary
`useFlexTokens` API is removed. Legacy consumers keep the same
`ThemeReference`, `ThemeProvider`, `ThemeContext`, and `useTheme` API. When the
active source is Flex-first, the existing `useTheme` hook lazily projects Flex
tokens into a complete legacy `Theme` without requiring a consumer change.

Appearance becomes a structured, orthogonal model:

- the requested scheme is separate from the resolved scheme;
- resolved scheme is always `light` or `dark`;
- high contrast and elevated interface level are independent axes;
- source invalidation and system appearance changes produce coherent context
  snapshots and predictable object identity.

## Scope

- Add the Flex-first reference/source, context contract, provider behavior, and
  lazy conversion paths required by #4264, with `useThemeState` as the only
  modern hook.
- Add the structured appearance model, platform resolution, subscription
  ownership, invalidation, and compatibility adapters required by #4270.
- Preserve current `ThemeReference`, `ThemeProvider`, `useTheme`,
  `AppearanceOptions`, and legacy package behavior while migration is in
  progress.
- Update tightly coupled platform themes, framework hooks, tests, and shims
  needed to prove the new contract.

## Non-goals

- Generate new light, dark, or high-contrast Flex default values; #4263 owns
  those values. This plan establishes the appearance-aware lookup contract.
- Derive interaction colors at runtime; #4268 owns that behavior.
- Re-author the Apple theme in Flex tokens; #4261 consumes this contract after
  it lands.
- Add all Storybook appearance controls. #4269 owns the UI, but its separate
  Flex-provider wording must be updated to use the unified provider defined
  here.

## Architectural decisions

1. **One provider and one effective theme boundary.** Do not add a public
   `FlexThemeProvider`. `ThemeProvider` accepts either authoring model.
2. **Legacy consumers remain API-compatible.** Existing imports, provider
   props, reference construction, raw context use, and `useTheme()` calls keep
   working. Flex-to-legacy projection is an internal implementation detail of
   `useTheme`; legacy consumers do not opt into a new hook or compat module.
3. **Two compatibility contexts, one boundary resolver.** Keep the public raw
   `ThemeContext` shape for direct legacy consumers such as
   `packages/deprecated/theming-react-native/src/ThemeLayer.tsx`. Add an
   internal source context, publish both from the same `ThemeProvider`, and
   make both hooks use one boundary-selection routine. This avoids broadening
   `ThemeContext` while preventing modern and legacy hooks from selecting
   different nested providers.
4. **The provider publishes metadata, not converted models.** A Flex provider
   publishes its source, revision, and appearance snapshot without resolving
   Flex tokens or a legacy Theme. Hooks trigger model construction.
5. **Sources expose only their authored model.** A legacy source resolves
   `Theme`; a Flex source resolves `FlexTokens`. The design runtime owns
   cross-model conversion and `ThemeState`.
6. **Identity is keyed by source revision and resolved appearance.** Requested
   `system` and requested `light` share tokens and `ThemeState` while both
   resolve to light. The full requested/resolved pair remains available from
   an appearance hook.
7. **Caches never mutate author-owned objects.** Replace the symbol attached to
   `Theme` with external `WeakMap` state so frozen and sealed inputs work.
8. **Reverse conversion is automatic for `useTheme`.** Do not require global
   registration or an `enableLegacyThemeCompat()` side effect.
9. **Reverse mapping is explicitly lossy.** The canonical mapping YAML owns
   reverse choices, fallbacks, and omission reasons. A complete
   appearance-specific legacy base plus optional author fallback fills values
   that Flex cannot represent.
10. **The modern root excludes the legacy-consumption graph.** The design root
    exports `useThemeState`, `ThemeProvider`, `FlexThemeReference`, and their
    modern types. It includes only the existing Theme-to-Flex adapter required
    for `useThemeState` to consume legacy providers. It does not reach
    `useTheme`, Flex-to-Theme projection, complete legacy defaults, or legacy
    token payloads.
11. **An inner provider is a complete boundary.** Theme values and appearance
    requests do not implicitly inherit from a parent provider. Precedence is
    provider override, then source option, then the selected platform source
    and documented fallback.
12. **Platform listeners are subscription-scoped.** No listener is installed
    at module import, and each platform factory removes its old listener in the
    same change that adopts the new appearance source.

## Current state and constraints

- `ThemeProvider` resolves `ThemeReference.theme` eagerly and copies the raw
  `Theme` into `ThemeContext`.
- `useThemeState` calls `useTheme`, converts the Theme through
  `flexTokensFromTheme`, and caches the result by defining a non-configurable
  symbol on the Theme object.
- `useFlexTokens` is a temporary context-free API used only by tests in the
  current tree. Remove it rather than turning it into a second modern hook.
- `flex-token-map.yaml` and `flex-from-theme.json` define only the
  legacy-to-Flex direction. The current projection has 169 Flex destinations
  backed by 91 unique Theme paths; 31 Theme paths feed multiple Flex
  destinations, so mechanical inversion is ambiguous.
- A valid legacy `Theme` needs colors, typography, shadows, spacing,
  components, and host metadata. The current projection cannot reconstruct all
  of them.
- `buildUseTokens` memoizes by legacy Theme root identity. A source
  invalidation must therefore produce a new root, even when recipe merging
  would otherwise return an existing base object.
- The design package is `sideEffects: false`. The reverse converter and legacy
  baseline must not become reachable from the modern root import graph.
- Android and iOS theme construction currently read appearance more than once,
  allowing colors and shadows from different snapshots.
- macOS high contrast uses mutable module state and a light/dark-only memoized
  base. Windows reads high contrast but does not subscribe to its change event.
  Win32 exposes only a host-theme string, not structured appearance.
- Eighteen tests call `useFlexTokens()` outside React render: sixteen component
  tests plus `colorStyles.test.ts` and `branchedStyle.test.ts`. Removing the
  temporary API must be atomic with their migration to either
  `useThemeState().tokens` in a rendered probe or direct defaults in pure tests.

## Target architecture

```text
                              +--------------------------+
                              | ThemeAppearanceSource    |
                              | stable snapshot + events |
                              +------------+-------------+
                                           |
                                           v
+--------------------+          +--------------------------+
| ThemeReference     |          | FlexThemeReference       |
| kind: legacy       |          | kind: flex               |
| resolveTheme()     |          | resolveFlexTokens()      |
+----------+---------+          +-------------+------------+
           |                                  |
           +----------------+-----------------+
                            v
                 +-----------------------+
                 | ThemeProvider         |
                 | source + revision +   |
                 | appearance metadata   |
                 +-----------+-----------+
                             |
              +--------------+----------------+
              |                               |
              v                               v
     +------------------+            +---------------------+
     | useThemeState    |            | useTheme            |
     | modern hook      |            | legacy hook         |
     +--------+---------+            +----------+----------+
              |                                 |
     legacy -> Flex only                Flex -> legacy only
     when modern hook asks              when legacy hook asks
              |                                 |
              +---------------+-----------------+
                              v
                    design-owned runtime cache
```

### Public appearance model

Add to `src/theming/appearance.types.ts`:

```ts
export type ThemeColorScheme = 'light' | 'dark';
export type ThemeContrast = 'standard' | 'highContrast';
export type ThemeInterfaceLevel = 'base' | 'elevated';

export interface ThemeAppearanceRequest {
  colorScheme: ThemeColorScheme | 'system';
  contrast: ThemeContrast | 'system';
  interfaceLevel: ThemeInterfaceLevel | 'system';
}

export type ThemeAppearanceOptions = Partial<ThemeAppearanceRequest>;

export interface ResolvedThemeAppearance {
  colorScheme: ThemeColorScheme;
  contrast: ThemeContrast;
  interfaceLevel: ThemeInterfaceLevel;
}

export interface ThemeAppearanceState {
  requested: Readonly<ThemeAppearanceRequest>;
  resolved: Readonly<ResolvedThemeAppearance>;
}
```

Use `interfaceLevel` because the iOS source already exposes
`userInterfaceLevel()`. Legacy `darkElevated` maps to
`{ colorScheme: 'dark', interfaceLevel: 'elevated' }`; high contrast maps to the
contrast axis without erasing the resolved scheme.

Add a subscription contract:

```ts
export interface ThemeAppearanceSourceSnapshot {
  colorScheme?: ThemeColorScheme | null;
  contrast?: ThemeContrast;
  interfaceLevel?: ThemeInterfaceLevel;
}

export interface ThemeAppearanceSource {
  getSnapshot(): ThemeAppearanceSourceSnapshot;
  subscribe(listener: () => void): () => void;
}
```

`getSnapshot` returns the same object until a semantic value changes.
Subscriptions are ref-counted and install native listeners only while used.

`ThemeState` exposes the resolved values that affect token and style output:

```ts
export interface ThemeState {
  readonly tokens: FlexTokens;
  readonly appearance: Readonly<ResolvedThemeAppearance>;
  /** @deprecated Use appearance.contrast. */
  readonly highContrast: boolean;
  readonly themeStyles: Record<symbol, unknown>;
}
```

Add `useThemeAppearance(): ThemeAppearanceState` for consumers that need to
distinguish an explicit request from a system-resolved value. Keeping the
request off `ThemeState` allows equivalent resolutions to share one style
cache.

Keep `AppearanceOptions` and `ThemeOptions` source-compatible and mark them
deprecated. Pure adapters translate every old member, including
`darkElevated`, `highContrast`, and `dynamic`, without changing the existing
fallback behavior.

### Theme source contract

Add discriminated sources in `src/theming/themeSource.ts`:

```ts
interface ThemeSourceBase {
  readonly revision: number;
  readonly appearanceOptions?: ThemeAppearanceOptions;
  readonly fallbackAppearance?: Partial<ResolvedThemeAppearance>;
  readonly appearanceSource?: ThemeAppearanceSource;
  addOnThemeChanged(listener: OnThemeChange): void;
  removeOnThemeChanged(listener: OnThemeChange): void;
}

export interface LegacyThemeSource extends ThemeSourceBase {
  readonly kind: 'legacy';
  resolveTheme(appearance: ResolvedThemeAppearance): Theme;
}

export interface FlexThemeSource extends ThemeSourceBase {
  readonly kind: 'flex';
  resolveFlexTokens(appearance: ResolvedThemeAppearance): FlexTokens;
  resolveLegacyFallback?(appearance: ResolvedThemeAppearance): Theme | PartialTheme | undefined;
}

export type ThemeSource = LegacyThemeSource | FlexThemeSource;
```

The source does not create `ThemeState` and does not implement the conversion
for the model it did not author.

### Flex-first reference

Add `src/theming/flexThemeReference.ts`:

```ts
export type PartialFlexTokens = {
  color?: Partial<SemanticColorTokenValues> & {
    hover?: Partial<InteractiveColorOverrides>;
    pressed?: Partial<InteractiveColorOverrides>;
  };
  shadow?: Partial<SemanticShadows>;
  fontWeight?: Partial<SemanticFontWeights>;
  fontFamily?: Partial<SemanticFontFamilies>;
  fontSize?: Partial<SemanticFontSizes>;
  lineHeight?: Partial<SemanticLineHeights>;
  borderRadius?: Partial<SemanticBorderRadii>;
  spacing?: Partial<SemanticSpacing>;
  strokeWidth?: Partial<SemanticStrokeWidths>;
};

export type FlexThemeInput = FlexTokens | PartialFlexTokens | ((appearance: ResolvedThemeAppearance) => FlexTokens | PartialFlexTokens);

export type FlexThemeRecipe = PartialFlexTokens | ((parent: FlexTokens, appearance: ResolvedThemeAppearance) => PartialFlexTokens);

export interface FlexThemeReferenceOptions {
  base?: FlexThemeInput | FlexThemeReference;
  appearance?: ThemeAppearanceOptions;
  fallbackAppearance?: Partial<ResolvedThemeAppearance>;
  appearanceSource?: ThemeAppearanceSource;
  legacyFallback?: Theme | PartialTheme | ((appearance: ResolvedThemeAppearance) => Theme | PartialTheme);
}

export class FlexThemeReference implements FlexThemeSource {
  readonly kind: 'flex';
  readonly revision: number;

  constructor(options?: FlexThemeReferenceOptions, ...recipes: FlexThemeRecipe[]);

  resolveFlexTokens(appearance: ResolvedThemeAppearance): FlexTokens;
  resolveLegacyFallback(appearance: ResolvedThemeAppearance): Theme | PartialTheme | undefined;
  update(...recipes: FlexThemeRecipe[]): void;
  invalidate(): void;
  addOnThemeChanged(listener: OnThemeChange): void;
  removeOnThemeChanged(listener: OnThemeChange): void;
}
```

`PartialFlexTokens` is shape-aware rather than recursively partial so opaque
React Native colors and platform objects remain leaves.

Resolution order is:

1. the appearance-aware default supplied by the design package;
2. base input;
3. recipes in declaration order.

Until #4263 supplies distinct generated defaults,
`getDefaultFlexTokens(appearance)` may return the current defaults for every
appearance. Authors can still provide appearance-specific bases or recipes;
this change must not invent new token values.

Within one revision, `resolveFlexTokens` returns the same object for the same
resolved appearance. It does not construct other appearances.

### Modern entry point and bundle boundary

Add explicit named root exports for the modern authoring path:

```ts
export { FlexThemeReference, ThemeProvider } from './theming/modern';
export type {
  FlexThemeReferenceOptions,
  ResolvedThemeAppearance,
  ThemeAppearanceOptions,
  ThemeAppearanceState,
  ThemeSource,
} from './theming/modern';
export { themedStyleSheetFactory, useThemeState } from './useThemeState';
```

`./theming/modern` is a narrow internal barrel that does not export or import
`ThemeReference`, `useTheme`, the reverse projection, or the complete legacy
base. Existing legacy consumers continue importing their unchanged APIs from
`@fluentui-react-native/design/theming` or the compatibility packages.
Modern bundles that need to construct an existing legacy source can import
`ThemeReference` from the narrow `@fluentui-react-native/design/theming/legacy-source`
subpath without loading the legacy consumption graph.

The root `useThemeState` graph includes `flexTokensFromTheme` so it can load an
existing legacy provider. That forward adapter is the only legacy-loading
implementation required by the modern API. The Flex-to-legacy graph remains
reachable only from the legacy `useTheme` entry point.

### Legacy ThemeReference evolution

Make `ThemeReference` implement `LegacyThemeSource` additively:

- add `kind: 'legacy'`, a monotonic `revision`, and
  `resolveTheme(appearance)`;
- pass the resolved appearance as an optional second recipe argument;
- resolve parent references with the same appearance;
- cache appearance-aware resolutions independently;
- increment revision and clear all caches in the base `invalidate()` so
  subclasses cannot bypass revision management;
- avoid permanent parent listeners when no consumer is subscribed; compare
  parent revision on resolution and subscribe to the parent only while this
  reference has listeners.

The old constructor, one-argument recipes, `theme`, `update`, `invalidate`,
and listener methods remain supported. The old `theme` accessor retains its
current single-slot compatibility behavior; the new provider uses
`resolveTheme`. Existing platform factories migrate away from appearance reads
inside old recipes before relying on the appearance-aware cache.

### Context and provider compatibility

Keep the public raw context:

```ts
export const ThemeContext: React.Context<Theme>;
```

Add an internal/publicly typed source context value:

```ts
export interface ThemeSourceContextValue {
  readonly source: ThemeSource;
  readonly sourceRevision: number;
  readonly appearance: ThemeAppearanceState;
  readonly publishedLegacyTheme: Theme | undefined;
}
```

`ThemeProvider` accepts `ThemeSource` and optional appearance overrides:

```ts
export interface ThemeProviderProps extends React.PropsWithChildren {
  theme: ThemeSource;
  appearance?: ThemeAppearanceOptions;
  appearanceSource?: ThemeAppearanceSource;
  fallbackAppearance?: Partial<ResolvedThemeAppearance>;
}
```

The provider subscribes with `useSyncExternalStore` to source revision and the
selected appearance source. It must not resolve a converted model while
rendering.

- For a legacy source, it resolves the authored Theme needed to preserve direct
  raw-context consumers, publishes that Theme to `ThemeContext`, and records
  the same identity in `publishedLegacyTheme`. It does not construct Flex
  tokens.
- For a Flex source, it publishes `undefined` to the raw context and records
  `publishedLegacyTheme: undefined`. It constructs neither Flex tokens nor a
  legacy Theme.

Both hooks call one internal `useThemeBoundary` routine:

1. Read both contexts.
2. If a raw Theme exists and differs from `publishedLegacyTheme`, a nearer
   foreign `ThemeContext.Provider` is the effective boundary. Wrap that Theme
   as an implicit legacy source for both hooks.
3. Otherwise use the source context.
4. If neither exists, return the existing module-level defaults.

This preserves deprecated `ThemeLayer` and direct raw providers while ensuring
`useTheme` and `useThemeState` cannot select different effective sources.
Tests must cover every outer/inner combination.

An inner `ThemeProvider` fully replaces the outer source. Appearance precedence
inside that boundary is:

1. `ThemeProvider` override;
2. source option;
3. selected appearance source;
4. documented fallback (`light`, `standard`, `base` unless a compatibility
   factory preserves a different existing default).

Do not inherit requested axes from a parent provider in this change.

### Lazy runtime and identity

Add a design-owned runtime cache, external to authored objects:

```ts
WeakMap<
  ThemeSource | Theme,
  {
    revision: number;
    byAppearance: Map<
      AppearanceKey,
      {
        flexTokens?: FlexTokens;
        legacyTheme?: Theme;
        themeState?: ThemeState;
      }
    >;
  }
>;
```

`AppearanceKey` contains resolved color scheme, contrast, and interface level.
When the observed source revision changes, replace the entry and its
`byAppearance` map.

The laziness contract is source-relative. No provider constructs a converted
model, but a hook may need the source's authored model in order to produce the
view it requested:

| Active source | Provider mount                                                                         | `useThemeState`                                  | `useTheme`                                                      |
| ------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| Legacy        | Resolve only the authored Theme needed by raw-context compatibility; do not build Flex | Lazily project Theme to Flex                     | Return the authored Theme                                       |
| Flex          | Resolve neither model                                                                  | Resolve authored Flex tokens; do not build Theme | Resolve authored Flex tokens, then lazily project them to Theme |

This is the implementable form of #4264's construction requirement. A literal
rule that Flex tokens may only be resolved by a ThemeState hook would make the
user-required Flex-to-legacy bridge impossible. The invariant is that neither
provider mount nor an unrelated hook constructs the alternate model.

| Event                                                  | Flex tokens / legacy Theme          | ThemeState and styles       |
| ------------------------------------------------------ | ----------------------------------- | --------------------------- |
| Same source, revision, and resolved appearance         | Same object                         | Same object and registry    |
| Explicit light changes to system while system is light | Same object                         | Same object                 |
| Resolved appearance changes                            | Distinct cached object for that key | Distinct state and registry |
| Appearance toggles back within one revision            | Reuse prior key entry               | Reuse prior state           |
| Source invalidates or updates                          | Clear all appearance entries        | New state and registry      |
| Two sources return equal or identical input objects    | Do not share source caches          | Do not share state          |
| Frozen or sealed author input                          | Never modify it                     | External cache only         |
| No provider                                            | Existing default Flex tokens        | Existing default state      |

Each newly materialized legacy model must have a fresh root for its
source/revision/appearance entry. This prevents `buildUseTokens` from reusing a
stale memoized result after invalidation.

`useThemeState` must read the effective boundary directly rather than call the
public `useTheme` hook:

- legacy source: lazily run `flexTokensFromTheme` once for the cache entry;
- Flex source: obtain the authored token object from
  `resolveFlexTokens`;
- create the design-owned `ThemeState` and `themeStyles` registry once.

`useThemeState().tokens` is the sole modern token-consumption path. Delete
`src/tokens/useFlexTokens.ts` and its root export rather than maintaining two
hooks with overlapping semantics.

`useTheme` performs the symmetric operation:

- legacy source: return the source's authored Theme;
- Flex source: resolve Flex tokens and lazily run `themeFromFlexTokens` once;
- no source: preserve the current `undefined` behavior so
  `useFluentTheme` retains its default fallback.

### Flex-to-legacy projection

Advance `flex-token-map.yaml` to a second schema version. For each reversible
entry, record:

- the legacy Theme path used for the existing read direction;
- the canonical Flex source for the write direction;
- interaction-state fallback to the rest value where required;
- any value transform;
- an explicit omission reason for non-reversible candidates.

Generate and validate both:

- `flex-from-theme.json`;
- `theme-from-flex.json`.

The checker must fail for ambiguous reverse destinations, invalid fallback
paths, missing omission reasons, or drift between YAML and either generated
projection. The 31 currently ambiguous legacy destinations require explicit
canonical choices; first-wins or lexical inversion is not allowed.

`themeFromFlexTokens` builds a complete Theme in this order:

1. appearance-specific complete legacy compatibility base;
2. `FlexThemeReference.legacyFallback`, preserving `components`, custom legacy
   colors, `name`, `host.palette`, `host.colors`, and platform-only values;
3. generated Flex projection, making mapped Flex values authoritative;
4. compatibility `host.appearance` metadata.

Move or refactor the complete legacy default value builders currently owned by
`packages/theming/default-theme` into a lazy
`getDefaultLegacyTheme(appearance)` implementation under
`src/theming/compat`. `default-theme` then wraps or re-exports those builders.
Expose that builder through a narrow `theming/compat/defaults` subpath so
default-theme does not also load the reverse converter.
Do not import `default-theme` from design and do not attempt to build a complete
Theme from alias-token mappings alone.

Keep the reverse converter and legacy base behind a
`@fluentui-react-native/design/theming/compat` subpath. The legacy `useTheme`
module imports them statically so conversion always works. The root
`useThemeState` graph may reach `flexTokensFromTheme`, because loading an
existing legacy provider is part of the modern API's compatibility contract,
but it must not reach the reverse converter, complete legacy defaults,
`useTheme`, or legacy token payloads. Do not add global converter
registration.

## Platform appearance ownership

| Platform          | Source and subscription                                                                                      | Migration requirement                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default / Android | React Native `Appearance` supplies scheme; contrast is standard and interface level is base unless injected. | Pass one resolved snapshot into colors and shadows; remove the second read in `androidShadows.ts`.                                                                      |
| macOS             | `Appearance` plus `AccessibilityInfo` high-contrast state and event.                                         | Remove mutable `platformUtils.macos` state; key the Apple base by scheme and contrast; unsubscribe when unused.                                                         |
| iOS               | `Appearance` plus an Apple-theme-injected source for `NativeAppearanceAdditions.userInterfaceLevel()`.       | Keep the experimental native dependency out of design; pass one snapshot to palette, alias-token, and shadow builders.                                                  |
| Windows           | `Appearance` plus `AppTheme.isHighContrast` and `highContrastChanged`.                                       | Subscribe to both sources and stop returning high contrast as a color scheme.                                                                                           |
| Win32 / Office    | A source-specific adapter created by `createOfficeTheme`.                                                    | Extend the native event/constants with structured high-contrast and scheme fields. Do not infer high contrast from `Theme.name` or keep process-global host appearance. |

The Win32 portion of #4270 is not complete until the native contract supplies a
structured high-contrast signal. If that cannot land in the same change, keep
the existing string adapter isolated behind the Office source, document it as
transitional, and leave that acceptance item open.

Compatibility helpers in `platformUtils.*` delegate to the new resolver and
handle `null` and `undefined` identically. Keep `getCurrentAppearance`,
`isHighContrast`, and `setIsHighContrast` temporarily, deprecated, until their
callers migrate.

## Implementation plan

### Phase 0: Lock contracts and baselines

1. Record the API and identity decisions above in tests before changing
   behavior.
2. Inventory the reverse collisions and require an explicit canonical choice
   for each.
3. Capture the current design bundle baseline and add three scenarios:
   a root-only modern Flex consumer, a modern consumer loading a legacy
   provider, and a Flex provider with a legacy `useTheme` consumer. The first
   two must exclude the Flex-to-legacy graph; the third demonstrates its
   intentional incremental cost.
4. Update #4264's `useFlexTokens` deliverable and acceptance wording to use
   `useThemeState().tokens` and record removal of the temporary hook.
5. Update #4269's plan to use one `ThemeProvider`; do not implement a separate
   Flex context path.

**Gate:** API review confirms the context compatibility algorithm,
`ThemeReference.theme` compatibility behavior, reverse-collision choices, and
the Win32 native-contract owner.

### Phase 1: Add structured appearance without changing consumers

**Add**

- `src/theming/appearance.types.ts`
- `src/theming/appearance.ts`
- `src/theming/appearanceSource.ts`
- platform-specific appearance-source files

**Modify**

- `src/theming/types/Theme.types.ts`
- `src/theming/platformUtils*.ts`
- `src/theming/index.ts`

Implement normalization, resolution, stable appearance keys, compatibility
adapters, and subscription-refcounted platform snapshots. Preserve the old
exports and behavior through adapters.

**Tests**

- request normalization and legacy adapter matrices;
- concrete resolution for all axes;
- stable snapshots and subscribe/unsubscribe behavior;
- explicit `FURN_RN_PLATFORM` runs for default, macOS, Windows, and Win32 so
  the package's default macOS Jest platform does not hide other
  implementations.

### Phase 2: Build reverse mapping and the complete lazy legacy base

**Modify**

- `src/tokens/mappings/flex-token-map.yaml`
- `scripts/token-mappings/check-mappings.cjs`
- `scripts/codegen.cts`
- mapping validator tests
- `packages/theming/default-theme` value-builder ownership

**Add**

- generated `src/tokens/mappings/theme-from-flex.json`
- `src/theming/compat/themeFromFlexTokens.ts`
- `src/theming/compat/defaultLegacyTheme.ts`
- `src/theming/compat/index.ts`
- `./theming/compat` package export

Land the reverse projection, lossiness diagnostics, complete lazy legacy base,
and converter before any Flex source can reach the public provider.

**Gate:** mapping checks prove deterministic forward and reverse artifacts;
converter tests return runtime-valid Themes for light, dark, high contrast, and
elevated-dark compatibility inputs; the modern bundle scenario does not reach
compat modules.

### Phase 3: Add sources, references, and runtime caches

**Add**

- `src/theming/themeSource.ts`
- `src/theming/flexThemeReference.ts`
- `src/theming/themeRuntime.ts`
- `src/theming/modern.ts`
- focused source, reference, frozen-input, and identity tests

**Modify**

- `src/theming/themeReference.ts`
- `src/theming/index.ts`
- `src/index.ts`

Implement the discriminated source contracts, `FlexThemeReference`,
appearance-aware legacy resolution, external caches, revision behavior, and
new-root guarantees. Prepare the narrow modern barrel, but keep the new
provider path out of the package root until Phase 4 can land atomically.

**Gate:** resolver-spy tests prove no eager construction, stable per-appearance
identity, toggle-back reuse, invalidation replacement, source isolation, and no
author-object mutation.

### Phase 4: Activate the unified provider and symmetric hooks atomically

**Modify**

- `src/theming/context.ts`
- add `src/theming/useTheme.ts` to isolate the legacy import graph
- `src/theming/ThemeProvider.tsx`
- `src/useThemeState.ts`
- `src/theming/index.ts`
- `src/index.ts`
- related design tests
- delete `src/tokens/useFlexTokens.ts` and its root export
- migrate the eighteen non-render `useFlexTokens()` test call sites
- manual `ThemeState` literals in design styling tests and Switch tests

Split neutral context/boundary selection from the legacy hook so
`useThemeState` cannot reach the reverse converter. Switch the provider and
`useThemeState`, remove `useFlexTokens`, and update all affected tests in one
change.

Use `defaultFlexTokens` directly in pure style-function tests that only need
defaults. Use a rendered probe under the same provider for tests intended to
assert active themed values.

**Required matrices**

- Flex-only, legacy-only, both nested in both orders, direct raw Theme context,
  and neither present;
- provider alone, modern hook only, legacy hook only, then both hooks, with
  resolver call counts;
- provider prop replacement without a stale frame;
- same and changed appearance, invalidation, remount, frozen inputs, and
  stylesheet creation counts;
- a themed style factory branching on `ThemeState.appearance.contrast`.

**Gate:** #4264's laziness, precedence, identity, and unchanged-rendering
criteria pass together. No intermediate commit may expose a Flex provider
without automatic legacy conversion.

### Phase 5: Move platform themes to one appearance snapshot

Migrate one platform at a time. Remove each factory's old listeners in the same
change that injects or adopts its new appearance source.

**Default and Android**

- update `createDefaultTheme`, `createAndroidTheme`, `androidTheme`, and
  `androidShadows`;
- preserve each factory's current default request explicitly.

**Apple**

- update `createAppleTheme.ios`, `createAppleTheme.macos`, Apple color/shadow
  builders, and macOS memoization;
- inject iOS interface level from apple-theme;
- move macOS high-contrast ownership to the subscribed source.

**Windows and Win32**

- subscribe to Windows high contrast;
- update `createOfficeTheme` and the Office native contract or keep a clearly
  blocked transitional adapter;
- remove Theme-name high-contrast inference from the completed path.

**Legacy token selection**

- update `src/tokens/legacy/getTokens.ts`,
  `getTokens.ios.ts`, and `getTokens.android.ts` to consume compatibility
  appearance adapters;
- preserve elevated-dark behavior as an interface-level mapping.

**Gate:** one platform test matrix verifies the same appearance API and a new
`ThemeState` after semantic changes on default, macOS, Windows, and Win32.

### Phase 6: Migrate consumers and compatibility surfaces

1. Keep `packages/framework/framework/src/useFluentTheme.ts` behavior, but add
   coverage proving it receives a projected legacy Theme under a Flex source
   and its default only when no provider exists.
2. Verify `buildUseTokens` and `buildUseStyling` see a new Theme root after
   source invalidation.
3. Keep shim packages as explicit deprecated re-exports; do not publish new
   Flex APIs from shims.
4. Hoist or memoize the `ThemeReference` created inside
   `apps/tester-core/src/FluentTesterApp.tsx` so source identity survives
   renders.
5. Move Storybook's Flex option onto the unified provider and expose the
   structured appearance options when #4269 is implemented.
6. Add API documentation, migration examples for both authoring models, the
   nesting/precedence table, and the reverse-conversion lossiness contract.
7. Add changesets for every changed published package.

### Phase 7: Final validation

Run through owning workspace scripts:

1. design formatting, mapping check, lint, build, and tests;
2. explicit design test runs with `FURN_RN_PLATFORM` for every affected
   platform;
3. agentic component tests;
4. affected framework, default-theme, Apple, Android, Windows, Win32, tester,
   and Storybook tests;
5. root `yarn format:check`, `yarn build`, `yarn lage test`,
   `yarn lage lint`, `yarn bundle-size`, `yarn check-publishing`, and
   `yarn change:check`.

After any large source move or public export change, run
`yarn lage test --no-cache` once and validate repository links.

## Acceptance mapping

### Issue #4264

| Acceptance criterion                                                           | Planned evidence                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------ |
| Flex authoring without constructing a legacy Theme for modern consumers        | Flex provider plus modern hook resolver-spy test |
| `useThemeState().tokens` reads the active source and defaults only when absent | Provider matrix and no-provider test             |
| Flex-authored legacy Theme constructed only when a legacy hook asks            | Provider-only and modern-only call-count tests   |
| Legacy-authored Flex projection constructed only when a modern hook asks       | Provider-only and legacy-source tests            |
| Stable ThemeState and stylesheet identity                                      | Source/revision/appearance identity matrix       |
| Defined provider nesting and precedence                                        | All source/raw-context nesting permutations      |
| Existing agentic rendering unchanged                                           | Component snapshots plus rendered token probes   |
| Repository validation and changesets                                           | Phase 7 gates                                    |

### Issue #4270

| Acceptance criterion                                  | Planned evidence                                        |
| ----------------------------------------------------- | ------------------------------------------------------- |
| Requested and resolved schemes are distinct           | Appearance normalization tests and `useThemeAppearance` |
| Resolved scheme is always concrete                    | Resolver type and runtime matrix                        |
| Contrast and interface level are independent axes     | Structured appearance tests and legacy adapters         |
| ThemeState exposes component-facing values            | `ThemeState.appearance` style-factory test              |
| Consistent platform API                               | Explicit default/macOS/Windows/Win32 test runs          |
| No Theme-name high-contrast inference                 | Win32 native/adapter gate                               |
| Null and undefined compatibility                      | `getCurrentAppearance` adapter matrix                   |
| System change creates the right ThemeState            | Mock appearance-source invalidation tests               |
| Existing `AppearanceOptions` consumers migrate safely | Legacy token and platform-theme test suites             |
| Repository validation and changesets                  | Phase 7 gates                                           |

## Risks and decision gates

| Risk or gate                                                   | Resolution                                                                  |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Reverse mapping selects the wrong Flex value for a legacy path | Review all 31 collisions and encode canonical choices in YAML               |
| Flex cannot represent component recipes or host metadata       | Preserve them through lazy `legacyFallback`                                 |
| A complete legacy base creates a design/default-theme cycle    | Move ownership into design compat; default-theme wraps it                   |
| Legacy compat inflates modern bundles                          | Split the module graph and enforce three bundle scenarios                   |
| Source invalidation reuses a legacy root                       | Force one new root per revision/appearance cache entry                      |
| Direct raw Theme providers split the hooks                     | Use the shared boundary-selection algorithm and full nesting matrix         |
| Requested state multiplies style caches                        | Key models and ThemeState only by resolved appearance                       |
| Platform events double-invalidate during migration             | Switch listener ownership atomically per platform                           |
| Win32 has no structured native appearance                      | Extend the native payload or leave the relevant #4270 item open             |
| Distinct generated Flex defaults are not ready                 | Keep default lookup pluggable and leave value generation to #4263           |
| ThemeReference parent listeners leak                           | Make parent subscription consumer-scoped and compare parent revision lazily |

## Research provenance

This plan reconciles independent long-context investigations by GPT-5.6 Sol
and Claude Opus 5, followed by reciprocal reviews of the complete reports.
Disagreements about eager provider state, context compatibility, cache keys,
legacy defaults, reverse mapping, and appearance precedence were resolved
against the current repository and both issue acceptance contracts.
