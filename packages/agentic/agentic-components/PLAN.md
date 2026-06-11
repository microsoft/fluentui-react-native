# @fluentui-react-native/agentic-components

> Status: **Plan** (package not yet created). Part of the `packages/agentic/` modernization — see [`../STAGING.md`](../STAGING.md).
>
> ✅ Informed by **Fluent Headless / Fluent Modern** (`Fluent Headless and Fluent Modern.docx`, repo root) and the **x3-design token model** (via `agentic-tokens`).

## Purpose

A flat component library that recreates the v1 components in the modern Fluent structure, applying the **Fluent Headless → Fluent Modern** strategy to React Native:

- **Headless layer** — stable, public, **unstyled** primitives that own behavior, ARIA/accessibility, keyboard handling, and semantic structure. **No pixels, no design props.** Each component ships **three forms** (matching the docx): the primitive component `X`, the stable hook `useX`, and the render function `renderX`.
- **Modern layer** — the headless primitive **plus tokens** (`agentic-tokens`), native-first and lightweight. Styling is a *swappable concern* layered on top of the same headless behavior.

It deliberately avoids `compose`/`customize`/`buildProps`/`stylingSettings`. Components depend only on shared sibling dirs (`hooks/`, `tokens/`, `styles/`, `helpers/`) and `agentic-tokens` — **never on each other**.

## Identity

- **npm:** `@fluentui-react-native/agentic-components`
- **path:** `packages/agentic/agentic-components/`
- Add to root `tsconfig.json` `references`. Keep `.ios/.android/.win32/.macos/.windows` splits; never co-load multiple RN forks in one program (per `AGENTS.md`).

## The pattern (Headless three-forms + Modern styling; NO compose/customize)

For each component `X`, mirroring the headless `Button`/`useButton`/`renderButton` triple and v9's hook order:

1. **`X.types.ts`** — `XProps` (RN-prop-extended + variant props) and `XState` (`ComponentState` analog: defaulted variants + computed flags + resolved `slots`/`rootProps` + interaction state).
2. **`useX(props, ref): XState`** — **HEADLESS behavior.** Normalizes props/defaults, runs shared behavior hooks (`usePressable`, `useControllableState`, focus), assembles accessibility props and semantic slots. **No styling, no token reads.** (Replaces v1 `useX.ts` + the `lookup` function — lookup logic becomes plain boolean flags on state.)
3. **`renderX(state): JSX` ** — **HEADLESS render.** Pure function over resolved slots; plain RN JSX (no slot interception / no `@jsxImportSource` pragma).
4. **`useXStyles(state)`** — **MODERN styling.** Reads `useTokens()` + the component-local `tokens/xTokens.ts` map (which declares `interaction.applies-to`), resolves generic tokens (incl. **derived** hover/pressed for the active rest token), and writes RN style objects onto `state.<slot>.style`. Variant/state selection is plain `state.flag ? a : b`.
5. **`X.tsx`** — the **Modern primitive**: `forwardRef` shell calling `useX → useXStyles → renderX`. Also re-export the **unstyled** form (`useX` + `renderX`) for headless consumers. User `style`/props merged **last** via `helpers/mergeStyles`.
6. **`index.ts`** — barrel exporting all three forms + types.

Because behavior (headless) is separated from styling (modern), the styled layer is swappable and the accessibility/keyboard/semantics stay identical regardless of styling — the core Fluent Headless thesis, applied to RN.

Explicitly **not used:** `compose`, `.customize`, `.compose`, `buildProps`, `stylingSettings`, `useSlots`, `applyTokenLayers`, the `framework-base` jsx-runtime. Customization happens through the theme/tokens + ordinary props.

## Proposed structure (flat)

```
agentic-components/
  package.json  tsconfig.json  babel.config.js  jest.config.cjs  eslint.config.js
  src/
    index.ts                         # barrel: every component's X / useX / renderX + types
    hooks/      usePressable.ts  useFocusState.ts  useControllableState.ts  useTokens.ts  index.ts
    tokens/     buttonTokens.ts  …   # per-component map: variant×state -> generic names + interaction.applies-to
    styles/     borderStyles.ts  layoutStyles.ts  textStyles.ts  focusStyles.ts  index.ts
    helpers/    mergeStyles.ts  mergeProps.ts  getNativeProps.ts  index.ts
    Button/     Button.tsx  useButton.ts  renderButton.tsx  useButtonStyles.ts  Button.types.ts  index.ts
    Text/  Switch/  Checkbox/  Link/  …
```

`hooks/usePressable` wraps `@fluentui-react-native/interactive-hooks` behind one seam; `styles/*` are the RN analog of the old `@fluentui-react-native/tokens` mixins; `tokens/xTokens.ts` maps variants/states → `agentic-tokens` **generic names** and declares `interaction.applies-to: [...]` so the styles hook resolves derived hover/pressed for the active rest token.

## Web/Headless → RN bridges

| Fluent web | RN replacement (in shared dirs) |
|---|---|
| Griffel `makeStyles`/`mergeClasses` | RN style objects + `helpers/mergeStyles` (user style wins last) |
| `--gnrc-*` CSS vars + OKLCH runtime interaction | `useTokens()` generic object + **precomputed** interaction from `agentic-tokens` (RN has no runtime OKLCH) |
| `react-aria`/`react-tabster`, focusgroup roving tabindex | RN `accessibility*` props + `interactive-hooks` (+ `FocusZone`) behind `hooks/` |
| native `popover`/`<dialog>`/anchor positioning | RN equivalents / existing furn Callout/Popover primitives (headless behavior only) |
| `slot.always` + jsx-runtime | render RN primitives directly; optional `helpers/getNativeProps` for prop filtering |

## First components (pattern-setters)

1. **Button** — full variant/icon/pressable/focus stack; locks the three-forms file template.
2. **Text** — minimal (no interaction/slots); validates `styles/textStyles` against the `textstyle-*` bundles; scales the pattern down.
3. **Switch** (or Checkbox) — controlled/uncontrolled + toggle state (multi-state interaction: hover/press derive from the **active** rest token) + `Animated.Value`; proves the hardest model.

## Dependencies & intersections

- **agentic-tokens (Modern layer)** — `styles/`/`tokens/` consume its generic surface via `useTokens` and declare `interaction.applies-to`. Code against an interface + local stub so the swap-in is mechanical.
- **agentic-concepts** — supplies the per-component spec (states/appearance/interactions/a11y/token refs); contribute the three-forms template back as the canonical authoring recipe.
- **agentic-analyzer** — the parity gate: each new component must reproduce its v1 counterpart's resolved styles (incl. derived interaction values), a11y tree, and snapshots.
- **agentic-authoring** — the scaffolding agent emits exactly this three-forms file set (its "golden template").
- Allowed leaf deps: `@fluentui-react-native/icon`, `interactive-hooks` (wrapped), `theme`.

## Open questions

- **`Text` flat-rule:** Button should render RN `Text` styled by shared `textStyles` (pure-flat) rather than import a sibling `Text` component — requires perfect typography parity from the `textstyle-*` bundles.
- **Headless vs Modern packaging:** one package exporting both unstyled (`useX`/`renderX`) and styled (`X`) forms, or split headless into its own entry/subpath later? (Recommend one package, two entry points: `.../headless` and the default Modern.)
- **Derived interaction parity:** the styles hook must request the right hover/pressed for the *active* rest token in multi-state components; confirm the analyzer pins these.
- Platform forks: keep per-platform files (`useButtonStyles.win32.ts`, ripple, two-tone focus, Win32 keyboard quirks).
- Animation parity (Switch `Animated.Value`) → `hooks/useSwitchAnimation`; confirm analyzer can pin animated styles.
- Memoization: replace v1 `buildProps`/`getMemoCache` with `useMemo` keyed on theme + state flags in `useXStyles`.

## Phased plan

0. **Scaffold & contracts:** create package, root `references`, empty `hooks/tokens/styles/helpers` with the `useTokens`/generic interface **stubbed**; publish the three-forms authoring-template doc (to concepts/authoring).
1. **Button exemplar** (X + useButton + renderButton + useButtonStyles) + shared dirs; wire analyzer pinning to assert parity with v1 `ButtonV1`; lock the template once green.
2. **Text + Switch/Checkbox;** extend shared dirs only as forced; pin against v1.
3. **agentic-tokens integration:** replace the stub with the real generic surface (rest + derived interaction); re-run pinning to confirm zero value drift.
4. **Long tail** (Link, Checkbox, FAB, CompoundButton, ToggleButton, …), each the same three-forms set + platform splits, gated by analyzer parity.
5. **Surface & docs:** finalize barrel, SPEC docs, register fluent-tester pages; hand the template to `agentic-authoring`.
