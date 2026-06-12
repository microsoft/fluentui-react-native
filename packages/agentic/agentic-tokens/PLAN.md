# @fluentui-react-native/agentic-tokens

> Status: **Plan** (package not yet created). Part of the `packages/agentic/` modernization — see [`../STAGING.md`](../STAGING.md).
>
> ✅ **Sources received & incorporated.** This plan now adopts the **x3-design Fluent token model** (`~/dev/fluent-design/plugins/tokens/skills/{core,interaction,textstyle}/SKILL.md` + the `*.yaml` token files) and the **Fluent Headless / Fluent Modern** strategy (`Fluent Headless and Fluent Modern.docx`, repo root). `agentic-tokens` is the **Fluent Modern** styled layer for React Native.

## Purpose

A platform-neutral **semantic token layer** (the "Fluent Modern" tokens) that new headless components author against, instead of reaching into `theme.colors.*` and the static `globalTokens` JSON. It implements the x3-design two-layer model adapted to React Native:

- **Primitives** (`prmt-*`) — raw, themeless base values (color stops, spacing steps, font sizes). Stable referenceable names only.
- **Generics** (`--gnrc-*`) — the **semantic layer** components consume: each maps a primitive to a role and carries light + dark values. Components consume generics, **never primitives**.

## Identity

- **npm:** `@fluentui-react-native/agentic-tokens`
- **path:** `packages/agentic/agentic-tokens/`
- Add to root `tsconfig.json` `references`.

## The token model (adopted from x3-design)

### Generic color tokens — `--gnrc-color-{variant}-{role}-{modifier}`

In RN we expose these as a typed object (working convention: camelCase of the generic name, e.g. `colorBackgroundNeutralSubtle`).

- **variant** (usage context): `surface`, `background`, `foreground`, `stroke`, `fixed`
- **role** (palette family): `neutral`, `brand`, `danger`, `success`, `warning`
- **modifier** (qualifier within role):
  - background / stroke: `heavy`, `loud`, `soft`, `subtle`, `transparent`, `disabled` (role-dependent subset)
  - foreground: `primary`, `secondary`, `tertiary`, `onloud`, `disabled`
  - surface (neutral): `farther`, `far`, `near`, `nearer`, `translucent`
  - stroke also: `focus-inner`, `focus-outer`
  - fixed: `white`, `black` (theme-invariant)

Examples: `--gnrc-color-background-neutral-subtle`, `--gnrc-color-foreground-brand-onloud`, `--gnrc-color-stroke-focus-outer`, `--gnrc-color-surface-neutral-translucent`.

### Scalars — `--gnrc-{type}-{modifier}`

- `--gnrc-font-weight-{regular|medium|semibold|bold}` (variable axis 420/550/600/625)
- `--gnrc-stroke-width-{thin|thick|thicker}`

### Spacing — `--gnrc-spacing-{component|layout}-base-{step}`

- `component-base-{50,100,150,200,250,300,400,500,600,700}`
- `layout-base-{100,200,400,450,500,600,700,800,1000,1200}`

### Shadow — `--gnrc-shadow-{lowest|lower|low|high|higher|highest}`

### Typography — text styles (`textstyle-{set}-{role}[-{size}][-strong]`)

Text styles **bundle five generics** (`font-family`, `font-weight`, `font-size`, `line-height`, `letter-spacing`) — they cannot be a single token. Sets: `functional` (sans UI ramp), `content`, `content-expressive`, `content-editorial` (serif). Roles per `textstyle.yaml` (display/pagetitle/title/subtitle/body/caption/h1–h5/paragraph/…). `optical_size` axis (36 display / 8 body) resolves to null on static platform fonts (iOS SF Pro, Android Roboto) — relevant for RN. We expose each text style as a resolved `{ fontFamily, fontWeight, fontSize, lineHeight, letterSpacing }` object.

> **Gap:** the x3-design generics do **not** yet define corner-radius tokens. furn currently uses `globalTokens.corner.*`. **Open decision** (below): keep a furn-local radius ramp until x3-design adds radius generics, or propose radius generics upstream.

## Interaction states are DERIVED, not enumerated (key RN adaptation)

The x3-design model does **not** ship `…Hover`/`…Pressed` slots. Hover/pressed are computed from the **rest** token via OKLCH channel deltas (`interaction-deltas.yaml`): `--lightness-{hover|press}` (light `-0.03/-0.06`, dark `+0.03/+0.06`) and `--alpha-{hover|press}` for transparent/translucent, with a lightness curve that doubles the delta as `L → 0.20`, and an **inverse rule** (flip sign for `loud`/`onloud`/`heavy` tokens). `disabled` and `focus` are excluded from the algorithm.

**Web does this at runtime via OKLCH relative color. React Native cannot** (no relative-color/OKLCH at runtime) — so RN is a **"pre-compiled environment"** (the same bucket as iOS/Android/Figma in the skill). **Decision: `agentic-tokens` ships PRECOMPUTED hover/pressed values**, and the OKLCH derivation **algorithm lives in `agentic-analyzer`** (deltas + lightness curve + inverse rule) where it is used to **validate** that the precomputed values are correct. Therefore:

- `agentic-tokens` exposes concrete precomputed interaction values (no runtime OKLCH). These are generated at build/theme-creation time; the generator reuses the analyzer's OKLCH implementation as a **build-time/dev dependency** so the _runtime_ token output stays static with **zero analyzer dependency**, and there is a single source of the algorithm.
- `agentic-analyzer` re-derives the expected hover/pressed from the rest generics + `interaction-deltas` and asserts the shipped precomputed values match — a regression guard on both the rest tokens and the formula.
- Components declare which categories get interaction via an **`interaction.applies-to: [background, foreground, stroke]`** block (carried in each component's token map, see `agentic-components`). For a multi-state component (Selected/Checked/Expanded), hover/pressed derive from the **active rest token** for that state-axis value.
- API sketch: `tokens.color.backgroundNeutralSubtle` (rest) + `interactionState(token, 'hover'|'pressed')` returning the precomputed value; or a per-component resolved set keyed by `{state-axis × interaction-state}`.

## Source of truth (decision)

**Adopt the x3-design _structure_ (`prmt-`/`--gnrc-` naming, variant-role-modifier, scalars, textstyle bundles, derived interaction) but source the _values_ from the existing `@fluentui-react-native` themes and the token mappings already encoded in the v1 components** — i.e. project the current theme into the x3 generic surface rather than porting x3's `primitives.yaml`. The OLD→NEW table below is that projection. (Migrating the value base to x3 primitives later remains possible without changing the generic surface components author against.)

## Producer & consumption

- `createTokens(theme): CommonTokens` — resolves the full generic surface (rest values, light/dark) by **mapping from `theme.colors.*` / `theme.typography.*` / `globalTokens.*` per the OLD→NEW table**, and attaches the precomputed interaction variants for declared categories. Memoized per-theme (reuse `buildUseTokens`'s cache-by-theme-identity).
- `useTokens(): CommonTokens` over `useFluentTheme()` (no new provider).
- Components consume **generics only** (`tokens.color.foregroundNeutralPrimary`), never primitives, `theme.colors.*`, or `globalTokens.*`.

## OLD → NEW mapping (furn v1 → x3 generics)

| OLD (furn)                                                                    | NEW generic                                                                                   |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------- | ------ |
| `colors.neutralForeground1` / legacy `buttonText` / `bodyText`                | `color-foreground-neutral-primary`                                                            |
| `colors.neutralForeground2/3`                                                 | `color-foreground-neutral-secondary` / `-tertiary`                                            |
| `colors.neutralForegroundDisabled`                                            | `color-foreground-neutral-disabled`                                                           |
| `colors.neutralForegroundOnBrand` / `OnColor`                                 | `color-foreground-{neutral                                                                    | brand}-onloud` |
| `colors.neutralBackground1` / legacy `buttonBackground` / `defaultBackground` | `color-background-neutral-subtle`                                                             |
| `colors.brandBackground` (rest)                                               | `color-background-brand-heavy` (Primary button rest)                                          |
| `colors.brandBackgroundPressed`                                               | _(derived from `background-brand-heavy` via press delta — not a slot)_                        |
| `colors.subtleBackground*` / `ghost*`                                         | `color-background-neutral-transparent` (+ derived hover/press)                                |
| `colors.neutralStroke1/2/3` / `buttonBorder`                                  | `color-stroke-neutral-{soft                                                                   | subtle         | loud}` |
| `colors.strokeFocus1` / `strokeFocus2`                                        | `color-stroke-focus-inner` / `color-stroke-focus-outer`                                       |
| `colors.redForeground1` (Checkbox required)                                   | `color-foreground-danger-primary`                                                             |
| `variant: 'body1'` → `typography.variants.*`                                  | `textstyle-functional-body-medium` (+ `-strong`)                                              |
| `globalTokens.font.weight.semibold`                                           | `font-weight-semibold`                                                                        |
| `globalTokens.size80/120` (padding)                                           | `spacing-component-base-{…}`                                                                  |
| `globalTokens.stroke.width10/20`                                              | `stroke-width-thin` / `stroke-width-thick`                                                    |
| `globalTokens.corner.radius*`                                                 | furn-local radius ramp **derived from current v1 component usage** (no x3 generic exists yet) |

(Full crosswalk finalized during Stage 2; the `loud`/`heavy`/`onloud` inverse-rule names must be tracked so derived interaction uses the correct sign.)

## Dependencies & intersections

- **agentic-concepts:** shares the state vocabulary; its `TokenReference` catalog cites these generic names. The interaction model (rest + derived hover/press) replaces concepts' "state-suffixed slot" assumption.
- **agentic-analyzer:** `createTokens` is the sentinel injection point; the analyzer's reverse-map maps resolved values back to `--gnrc-*` names, and **must validate the precomputed interaction values** against the algorithm. Because hover/press are derived, the analyzer's pin tests catch both rest-token and delta-formula regressions.
- **agentic-components (Fluent Modern layer):** primary consumer via `useTokens()` + per-component `interaction.applies-to`.
- **agentic-authoring:** the generic taxonomy + the `interaction`/text-style skills are the vocabulary the authoring agent generates against; keep names 1:1 with the x3-design skills so guidance transfers.

## Decisions (resolved) & remaining questions

- ✅ **Source of truth** — adopt the x3 _structure_, map _values_ from the furn themes + v1 component token mappings (project-first; an x3-primitive value migration can follow later without changing the generic surface components author against).
- ✅ **Interaction** — ship **precomputed** values; the OKLCH algorithm lives in `agentic-analyzer` and validates them. The build-time generator reuses that implementation as a dev dependency, so runtime token output is static with **no analyzer dependency** and the algorithm has a single home.
- ✅ **Radius** — furn-local radius ramp **derived from current v1 component usage** (`globalTokens.corner.*`); revisit if x3 adds radius generics.
- ❓ **Object shape** — flat camelCase (`colorBackgroundNeutralSubtle`) vs nested (`color.background.neutral.subtle`). Recommend nested for authoring + a flat alias for ergonomics.
- ❓ **Theme-invariant + HC** — `fixed-white/black` stay invariant; map Win32 `PlatformColor`/high-contrast through `createTokens` per `theme.host`.

## Phased plan

1. **Primitives + generics types** — model `prmt-*` and `--gnrc-*` (color/scalar/spacing/shadow) as typed structures; bring in the text-style bundles.
2. **Producer (rest values)** — `createTokens(theme)` resolving every generic by mapping from `theme.colors/typography` + `globalTokens` + v1 component mappings (OLD→NEW table), light/dark; `useTokens()`.
3. **Precomputed interaction** — generate hover/pressed for declared categories using the OKLCH delta+curve+inverse implementation owned by `agentic-analyzer` (reused as a build-time dev dependency); ship the precomputed values; expose `interactionState(...)`. `agentic-analyzer` validates them against the algorithm.
4. **Text styles + radius** — resolve `textstyle-*` bundles (opsz → null on native fonts); settle radius (decision #3).
5. **Validation via analyzer** — sentinel theme asserts each generic resolves uniquely and each derived interaction value matches the algorithm; pin furn v1 equivalents.
6. **Adoption** — `agentic-components` authors against `useTokens()` + `interaction.applies-to`; feed the finalized taxonomy to `agentic-authoring`.
