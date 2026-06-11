# Agentic Modernization — Staging & Execution Plan

This is the unified execution plan for the five new packages under `packages/agentic/`, derived from the per-package plans. Goal (from [`PLAN.md`](./PLAN.md)): modernize furn and enable authoring fluent-themed React Native components with agents.

## The five packages

| Package | Path | Role |
|---|---|---|
| [`agentic-concepts`](./agentic-concepts/PLAN.md) | `packages/agentic/agentic-concepts/` | **Leaf vocabulary** — concept types, component catalog, agent skill docs, the pinning **spec** |
| [`agentic-tokens`](./agentic-tokens/PLAN.md) | `packages/agentic/agentic-tokens/` | **Fluent Modern token layer** — x3-design primitives→generics; `createTokens(theme)`, `useTokens()`, derived interaction |
| [`agentic-analyzer`](./agentic-analyzer/PLAN.md) | `packages/agentic/agentic-analyzer/` | **Refactor safety net** — sentinel theme + reverse-map, RNTL harness, pinning, per-platform jest |
| [`agentic-components`](./agentic-components/PLAN.md) | `packages/agentic/agentic-components/` | **Fluent Headless + Modern components** — three forms (`X`/`useX`/`renderX`), no compose/customize |
| [`agentic-authoring`](./agentic-authoring/PLAN.md) | `packages/agentic/agentic-authoring/` | **Distributable agent + skills (+ optional MCP)** — sits on top of all four |

✅ **Both previously-locked sources received & incorporated:** `Fluent Headless and Fluent Modern.docx` (repo root) defines the Headless→Modern strategy and the three-forms component model; the **x3-design token skills** (`~/dev/fluent-design/plugins/tokens/skills/{core,interaction,textstyle}`) define the primitives→generics token model now adopted by `agentic-tokens`.

## How they intersect (the seams)

- **State vocabulary** is defined once in `agentic-concepts`. In `agentic-tokens` interaction states (hover/pressed) are **derived from rest generics** (OKLCH deltas, precomputed for RN), *not* enumerated as suffixed slots — components declare `interaction.applies-to` per category.
- **Pinning** splits: `agentic-concepts` = the **spec** (per-component scenario matrix + assertion contract); `agentic-analyzer` = the **mechanism** (sentinel theme, RNTL, per-platform jest); `agentic-components` = runs the same matrix to prove **v1→new parity**. Because interaction is derived, analyzer pins catch both rest-token and delta-formula regressions.
- **Token migration** is a chain: `agentic-concepts` catalogs *current* usage → `agentic-tokens` maps it to the x3-design `--gnrc-*` generics → `agentic-analyzer`'s reverse-map *proves* resolved values are preserved → `agentic-components` consumes via `useTokens()`.
- **Authoring** ships `agentic-concepts`' skill docs (in the x3-design `SKILL.md` format), generates the three-forms Headless component + Modern token styling, uses `agentic-tokens`' generic vocabulary, and drives `agentic-analyzer` for pin-tests.

## Dependency graph

```
agentic-concepts ──────────────┬───────────────┬──────────────┐
   (leaf: types/catalog/skills) │               │              │
                                ▼               ▼              ▼
agentic-tokens ──► agentic-analyzer ──► agentic-components ──► agentic-authoring
 (semantic slots)   (pin v1 + verify)    (new flat comps)      (skills/MCP; last)
        └───────────────► (sentinel theme injection point) ◄──┘
```

Key principle: **pin v1 behavior BEFORE refactoring anything.** The analyzer + concepts pinning spec must exist and baseline the current components first, so every later change is guarded.

## Cross-cutting setup (applies to every package)

- Add each new package's `tsconfig.json` to the **root `tsconfig.json` `references`** so it joins the unified `tsgo -b` build (per `AGENTS.md`).
- Dev deps (tsgo/jest/eslint/prettier) come automatically via `scripts/dynamic.extensions.mts`.
- **`@testing-library/react-native` is new to the repo** — introduced by `agentic-analyzer`; thread it through align-deps / dynamic extensions and add a catalog entry.
- **Platform forks:** keep `.ios/.android/.win32/.macos/.windows` splits; never co-load multiple RN forks in one program (per `AGENTS.md` Compatibility Notes). `globalTokens` is a static JSON (not theme-injectable) → analyzer sentinelizes it via jest module mocking.
- Each package needs a changeset on first publish-relevant change (`yarn change`).

## Staged execution

### Stage 0 — Scaffolding & contracts (all packages, parallel)
Create all five package folders with `package.json` + `tsconfig.json`, add to root `references`, confirm they join `tsgo -b` as empty packages. Lock the shared contracts: the **state vocabulary** (`agentic-concepts`), the `CommonTokens` **interface** (`agentic-tokens`, provisional), the pinning **assertion contract** (concepts ↔ analyzer seam), and the component **file-template** (`agentic-components` ↔ `agentic-authoring` golden template).

### Stage 1 — Foundation: concepts + analyzer harness
- `agentic-concepts`: concept types, component catalog (7 families), skill docs, pinning spec.
- `agentic-analyzer`: sentinel theme + reverse-map (theme namespace), RNTL `renderWithTheme`, extraction helpers; then `globalTokens` sentinel via jest mock.
- **Milestone:** baseline-pin the existing v1 components (value + semantic snapshots) — the safety net is live *before* any refactor.

### Stage 2 — Tokens (Fluent Modern layer)
- `agentic-tokens`: model `prmt-*` primitives + `--gnrc-*` generics (color `variant-role-modifier`, scalars, spacing, shadow, `textstyle-*` bundles) → `createTokens(theme)` producer (rest values, light/dark; HC/PlatformColor via `theme.host`) → JS port of the OKLCH **derived interaction** (deltas + lightness curve + inverse rule), precomputed for RN → `useTokens()` + the furn→generic crosswalk.
- Resolve the open decisions: primitives source-of-truth (port x3 vs project existing theme), interaction precompute mechanism, radius ramp (no x3 generic yet).
- **Milestone:** analyzer validates every generic resolves uniquely and every derived hover/pressed matches the algorithm; pin the v1 components' equivalent token references.

### Stage 3 — New components (pattern-setters)
- `agentic-components`: build **Button** end-to-end as the three forms (`Button`/`useButton`/`renderButton` + `useButtonStyles`) + the shared `hooks/`/`tokens/`/`styles/`/`helpers/`; gate on analyzer parity with `ButtonV1`. Then **Text** + **Switch/Checkbox**. Integrate the real `agentic-tokens` (swap the stub; rest + derived interaction); re-run pinning to confirm zero value drift.
- **Milestone:** Button/Text/Switch reach pinned parity with their v1 counterparts; the three-forms template is locked.

### Stage 4 — Long tail + authoring
- `agentic-components`: migrate Link, Checkbox, FAB, CompoundButton, ToggleButton, … each as the same file set + platform splits, gated by analyzer parity.
- `agentic-authoring`: ship `new-component`/`register-tester`/`changeset`/`lint-package` skills (in the x3-design `SKILL.md` format) + `.agents`+`.claude` transclusion stubs; then `token-lookup`/`pin-tests`/`e2e-scaffold`; then the optional MCP server; then distribution (`init`/`postinstall`, multi-runtime adapters).
- **Milestone:** an agent can scaffold a new flat component end-to-end, with pinning, from the skills/MCP.

## Watch items (no longer blocked)

- Per-platform pinning will surface **new** snapshots for previously-untested platforms (first-run churn).
- `agentic-components` `Text` flat-rule decision (render RN `Text` via shared `textStyles` vs a narrow exception) — recommend pure-flat.
- **RN has no runtime OKLCH** → interaction states are precomputed at theme-build time (RN = a "pre-compiled environment" per the x3-design interaction skill).

## Open decisions for you

Resolved:

- ✅ **Token source-of-truth** — adopt the x3 _structure_, map _values_ from the furn themes + v1 component mappings (project-first).
- ✅ **Interaction precompute** — ship precomputed values from `agentic-tokens`; the OKLCH algorithm lives in `agentic-analyzer` (validates them; reused by the tokens build-time generator).
- ✅ **Radius** — furn-local radius ramp derived from current v1 component usage.

Still open:

1. **Build the analyzer + pin v1 first** (recommended — guards everything), or build new components in parallel and backfill pins?
2. **Component scope for v1:** the catalog covers 7 families first (Button, Checkbox, Switch, Radio/RadioGroup, Tab/TabList, Link, Text) — confirm that first slice and the Button/Text/Switch pattern-setter order.
3. **`agentic-tokens` object shape** — nested (`color.background.neutral.subtle`) + flat alias, or flat-only.
4. **`agentic-authoring` distribution target & runtimes** (Claude only, or also Copilot/Cursor) and whether the **MCP server** is in-scope now or later.

## Provenance

Authored from five parallel investigation agents (one per workstream), each grounded in the current repo (framework/composition, v1 components, theming, jest/test setup). Token + authoring specifics are now grounded in the received sources: `Fluent Headless and Fluent Modern.docx` (repo root) and the x3-design token skills (`~/dev/fluent-design/plugins/tokens/skills/`).
