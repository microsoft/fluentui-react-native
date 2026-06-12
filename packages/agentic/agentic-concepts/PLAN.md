# @fluentui-react-native/agentic-concepts

> Status: **Plan** (package not yet created). Part of the `packages/agentic/` modernization — see [`../STAGING.md`](../STAGING.md).

## Purpose

The shared **vocabulary** of furn: a small, framework-agnostic set of TypeScript concept types, a machine-readable component **catalog**, and agent-facing **skill docs** that teach a human or an agent how to read the existing v1 (composition-framework) components and author new ones with consistent states, appearance, interactions, accessibility, and token usage.

This is the dependency-light **leaf** package the other agentic workstreams build on. It owns _concept definitions, the component inventory, and prose_. It does **not** own runtime styling, the new token object (→ `agentic-tokens`), or the test harness (→ `agentic-analyzer`).

## Identity

- **npm:** `@fluentui-react-native/agentic-concepts`
- **path:** `packages/agentic/agentic-concepts/`
- **kit type:** types + docs (no runtime UI). Must be added to the root `tsconfig.json` `references`.

## Findings that shape it

Every v1 component follows one regular shape (`compose<TType>({ ...stylingSettings, slots, useRender })`) reducible to a small concept set:

- **States** = interaction (`hovered|pressed|focused`, from `usePressableState`) × semantic (`disabled|checked|toggled|selected|required|visited`). These become _nested token layers_ selected by a `lookup` predicate and `applyTokenLayers`.
- **Appearance** = `appearance` × `size` × `shape` × `labelPosition` (per-family enums; defaults are platform-specific).
- **Interactions** = press (`useOnPressWithFocus`), keyboard (`useKeyProps` → macOS `validKeys*` vs Win32/Windows `keyDownEvents`), toggle/selection (`useAsToggleWithEvent`, `useSelectedKey`), focus (`useViewCommandFocus`, `FocusZone`).
- **Accessibility** = roles (`button`/`checkbox`/`switch`/`radio`/`tab`/`link`), `getAccessibilityState`, label-from-first-string-child, `accessibilityActions`, pos/setSize.
- **Common token references** = color families (neutral/brand/compound/ghost/default/status foreground·background·stroke·icon·focus), typography variants (legacy `bodyStandard` **and** modern `body1` coexist), `globalTokens` ramps (size/corner/stroke/font), and the `borderStyles`/`layoutStyles`/`fontStyles` mixins.
- Current tests use bare `react-test-renderer` snapshots; there is **no** sentinel theme and `@testing-library/react-native` is not yet a dependency.

## Proposed structure

```
agentic-concepts/
  package.json  tsconfig.json  README.md  PLAN.md
  src/
    index.ts            # re-exports all concept types
    states.ts           # VisualState union; InteractionState / SemanticState (mirrors IPressableState)
    appearance.ts       # Appearance / ControlSize / ControlShape / LabelPosition + per-family aliases
    interactions.ts     # InteractionConcept (press/toggle/select/keyboard/focus)
    accessibility.ts    # A11yConcept (role/states/labelSource/actions/setSemantics)
    tokens.ts           # TokenReference catalog: maps current furn token usage -> x3-design --gnrc-* generics (background/foreground/stroke/surface roles+modifiers, scalars, textstyle bundles)
    component-shape.ts   # ConceptualComponent descriptor (the component "anatomy" type)
    pinning.ts          # PINNING-TEST SPEC: per-component scenario matrix + assertion contract (typed data)
  catalog/
    components.json     # machine-readable inventory: per component -> concepts/states/tokens it uses
  skills/               # natural-language, agent-consumable (SKILL.md format aligned with agentic-authoring)
    SKILL.md  understanding-v1.md  states.md  appearance.md  interactions.md
    accessibility.md  tokens.md  authoring-checklist.md
```

**Types vs prose:** `src/` is the small, stable, importable vocabulary (kept a true leaf — re-state the unions rather than importing from `composition`/`use-tokens` to avoid cycles). `skills/` is the teaching payload `agentic-authoring` ships. `catalog/components.json` is the bridge both the analyzer (iterate) and the authoring agent (query) consume.

## Key exports

`VisualState`, `InteractionState`, `SemanticState`; `Appearance`/`ControlSize`/`ControlShape`/`LabelPosition`; `InteractionConcept`, `A11yConcept`, `TokenReference`, `ConceptualComponent`; and the pinning **spec** types (`PinScenario`, `PinAssertionContract`).

## Pinning-tests ownership

`agentic-concepts` owns the **spec** (a generated, capped per-component prop matrix + the assertion contract: a11y tree, resolved style/token set per slot, structural snapshot). `agentic-analyzer` owns the **mechanism** (sentinel theme, `@testing-library/react-native` harness, per-platform jest). `agentic-components` runs the same matrix to prove v1→new parity. Interim safety net: keep/extend existing `react-test-renderer` snapshots until the analyzer harness lands.

## Dependencies & intersections

- **No** dependency on framework/component/testing packages (stays a leaf).
- **agentic-tokens:** `TokenReference` here = the _old→new mapping input_; tokens defines the future object, concepts catalogs current usage. Share the **state vocabulary**.
- **agentic-analyzer:** concepts = spec/data; analyzer = mechanism.
- **agentic-components:** concepts is the authoring contract; new components satisfy the same `ConceptualComponent` + matrix.
- **agentic-authoring:** ships `skills/` as the agent payload (same `SKILL.md` format).

## Open questions

- Type duplication vs coupling (re-stating component unions risks drift → add a catalog-vs-source drift check, likely in analyzer).
- Encode per-platform concept deltas (Win32 two-tone focus, Android ripple) as explicit catalog data? (Recommend yes.)
- Matrix-explosion cap / "conceptually significant" pruning rule.
- Typography: map the legacy/v9 variants onto the x3-design `textstyle-*` bundles (`agentic-tokens` owns the taxonomy; concepts catalogs the mapping). Note interaction states are _derived_ (rest token + delta), not enumerated — the catalog records rest tokens + which categories get `interaction.applies-to`.

## Phased plan

0. **Scaffold** package (types/docs only), add to root `references`, verify it joins `tsgo -b`.
1. **Concept types** (`states`/`appearance`/`interactions`/`accessibility`/`tokens`/`component-shape`).
2. **Component catalog** for the 7 studied families (Button, Checkbox, Switch, Radio/RadioGroup, Tab/TabList, Link, Text).
3. **Skill docs** (file-path-anchored examples).
4. **Pinning spec** (matrix + assertion contract as typed data); coordinate seam with analyzer.
5. **Integration & cross-checks** (consumers wire in; add catalog-vs-source drift check).
