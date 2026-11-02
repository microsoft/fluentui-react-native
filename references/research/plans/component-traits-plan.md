# Component Traits Research and Decision Plan

## Status

- **Research status:** round 2 complete. Both rounds used independent research by two models followed by reciprocal
  review. Round 2 re-examined the plan after the owner clarified that traits are per-component runtime values.
- **Implementation status:** pilot implemented on `user/jasonvmo/design-rework` (uncommitted). See
  [Execution Status](#execution-status) for what was built, measured, and validated, and the items that need owner review.
- **Decision status:** every decision has an owner answer. Each is **Accepted** (built as answered) or **Revised** (built
  with an adjustment recorded under the decision and in [Execution Status](#execution-status)).
- **Evidence labels:** **Observed** means read in the repository (cited as `path:line`); **Inferred** means reasoned from
  observed evidence; **Proposed** means a recommendation; **Unverified** means reported by one model and not reproduced.

## Execution Status

Built from the owner answers below. Durable guidance now lives in the package references; this section records the
pilot for review.

### What was built

| Area             | Result                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vocabulary       | `packages/agentic/design/src/styling/traits.types.ts`, exported as types from `@fluentui-react-native/design/styling` ([D-03](#d-03-type-entry-point)), with `Traits<Part, Variant, Size>` ([D-04](#d-04-type-name-and-shape)) and a geometry facet ([D-07](#d-07-initial-runtime-facets)) |
| Helpers          | Design `./styling`: `functionalTypography`, `channelStatePriority`, `resolveHoverMode`, `getRadiusStyleValue`, `getStrokeWidthStyleValue`. Components `src/common`: `getFocusVisualOptions` and the test-only `traitConformance.ts`                                                        |
| Checker          | `scripts/spec-contracts/traits.cjs` parses `spec/traits.ts` as syntax only; `common.cjs` and `check-spec-contracts.cjs` enforce strict SPEC front matter, the optional `traits`/`traits-schema` link, and the literal grammar. 26 `node --test` cases                                      |
| Pilot            | Button, ListItem, Tag, Badge, Card, and Input ([D-14](#d-14-pilot-cohorts) option 3) each declare `spec/traits.ts`, link it from `SPEC.md`, cite it as requirement evidence, consume it in styles and the focus hook, and have a traits conformance test block                             |
| Behavior changes | Button and Card strokes keep their rest or selected color while hovered and pressed ([D-17](#d-17-current-behavior-and-research-mismatches)); Flex radius values follow the Flex specs in every theme ([D-21](#d-21-fluent-large-button-radius))                                           |
| Guidance         | New components reference `components.agentic.traits` (`packages/agentic/components/references/traits.md`); updates to contracts, styles, focus, tests, boundaries, exports, the package `AGENTS.md`, design `styling.md`, both component skills, and remaining work in each package        |

### Bundle measurements

Root `yarn bundle-size`, compared with the committed baseline ([D-12](#d-12-bundle-budgets): recorded, not gated). The
baseline was not updated.

| Scenario                            | Modules (macOS / Windows) | Raw bytes (macOS / Windows)     | Attribution                                                                                                                                          |
| ----------------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components-button`                 | +5 / +5                   | 74.70k / 74.62k (+1.07k each)   | Design +4 modules, +395 B (the four styling helpers); components +1 module, +678 B (traits constant, split stroke factory, consumption). Gzip +369 B |
| `components-catalog`                | +10 / +10                 | 231.60k / 231.52k (+2.29k each) | Design +4 modules, +403 B; components +6 modules, +1,882 B (six traits constants, split factories, consumption). Gzip +1,085 B                       |
| `design-theme-state`                | 0                         | −198 B                          | Fluent fallback radius override and `cornerRadius*` imports removed ([D-21](#d-21-fluent-large-button-radius))                                       |
| `design-themed-root`                | 0                         | −199 B                          | Same as above                                                                                                                                        |
| `design-theme-state-legacy-source`  | 0                         | −196 B / −198 B                 | Same as above                                                                                                                                        |
| `design-legacy-theme`, `-from-flex` | 0                         | −72 B                           | Reverse Button `borderRadius` mapping removed                                                                                                        |
| Other design scenarios              | 0                         | 0                               | —                                                                                                                                                    |

### Validation

| Check                                                                                                 | Result                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Components `yarn format`, `lint`, `build`, `test`                                                     | Passed: 24 contracts, 26 checker tests, 66 Jest suites (835 tests)                                                                                                                                                                                                                                                                                                                |
| Design `yarn format`, `lint`, `build`, `test`                                                         | Passed: 43 suites (510 tests)                                                                                                                                                                                                                                                                                                                                                     |
| `yarn check-agent-instructions`                                                                       | Passed                                                                                                                                                                                                                                                                                                                                                                            |
| Design trait and radius suites with `FURN_RN_PLATFORM` set to ios, android, windows, macos, and win32 | Passed on all five: 6 suites (48 tests) each                                                                                                                                                                                                                                                                                                                                      |
| Components pilot suites with `FURN_RN_PLATFORM` set to ios, android, windows, and win32               | Failed, as at the baseline. The package's Jest platform is macOS, and the same macOS-only expectations fail at `HEAD` without this change (native focus ring, macOS fonts, the macOS MenuButton host). No new failure causes; Windows matches the baseline exactly, and on iOS the Button and Tag suites now report their macOS-only failures instead of crashing the Jest worker |
| Root `yarn oxfmt --check`; `yarn clean-lage-cache` then `yarn lage buildci`                           | Passed: 176 tasks, none failed                                                                                                                                                                                                                                                                                                                                                    |
| Native and Storybook qualification ([D-18](#d-18-native-validation))                                  | Not run. Button and Card stroke paint and Flex radius values changed, so macOS and Windows runs are needed before merge                                                                                                                                                                                                                                                           |

### Needs owner review

1. **`Size` generic** ([D-04](#d-04-type-name-and-shape)): `Traits<Part, Variant, Size>` adds a required size axis so
   radius can scale by size. Pass `never` for a missing axis.
2. **Geometry scope** ([D-07](#d-07-initial-runtime-facets)): only radius and stroke width are traits. Control heights,
   padding, and icon sizes stay in code until the retrofit shows which scales repeat. Shapes (circular, square, Input's
   underline corners) and parent-matching radii (Card's overlay and padding-none content) stay structural and read the
   root trait.
3. **Hover `component` mode:** `hovered` is pushed into the state source unless the mode is `suppressed`, so
   `component` paints hover through the component's own hierarchy rather than suppressing it.
4. **Input channels:** Input declares `contents.stroke: 'authored'` and `textInput.foreground: 'rest'`, so it has no
   `hover` facet; its focus visual is `custom-always-visible`.
5. **Bundle baseline:** `apps/bundle-size/baseline.json` is unchanged. Updating it with `yarn bundle-size:update` would
   accept the increases above.
6. **Native qualification:** see Validation.

## Objective

Define how per-component traits work in the agentic component workflow:

- authored for each component while its spec is built, and reviewed with the contract;
- consumed by production code, either to select which helper to call or as helper parameters;
- typed by one shared vocabulary defined upstream in `@fluentui-react-native/design`;
- valued by each component, never by a central registry.

The result must keep reviewed contracts authoritative, preserve theme caching and public APIs, add no runtime bytes to
components that do not consume a facet, and keep platform differences and missing evidence explicit.

## Owner Direction (Settled)

The owner clarified the goal after round 1:

> The goal is for the traits to be set for each component as part of the spec building process. These could be new
> fields in the yaml frontmatter of the spec or it could be a defined constant object defined for each component (or
> both). The idea is to either have the traits determine which helpers to call, or to have traits passed as parameters
> to helpers to determine how things should be handled. The traits type being defined in agentic/design was simply to
> have a common upstream location for definition purposes, but the traits themselves would be part of each individual
> component.

This plan treats the following as settled and does not reopen them:

1. Trait values are authored during spec building, one set per component.
2. Production code consumes trait values.
3. The shared type lives in design; the values live with each component.
4. Both consumption styles are allowed: traits that select helpers and traits passed to helpers as parameters.

Still open: which allowed storage form to use, exact file locations, the type entry point, which facets are consumed at
runtime first, helper shapes, and rollout. These are the decisions below.

## Executive Recommendation

**Proposed.** Both reviewers agree unless a split is noted. Where an owner answer differs, the answer governs; see
[Execution Status](#execution-status).

1. **Storage:** each component has one private, data-only TypeScript constant as the single source of trait values. Its
   SPEC frontmatter links to that file with a flat key. A nested YAML `traits:` block with a mirrored constant and
   checked parity remains the documented alternative ([D-01](#d-01-value-storage)).
2. **Type:** a type-only `Traits<Part, Variant>` vocabulary in design, built from per-facet records. The entry point is
   split: a new type-only `./traits` subpath (Opus; this plan's lean) or type exports from `./styling` (Astra)
   ([D-03](#d-03-type-entry-point)).
3. **Validation:** `satisfies` checks keys and domains at build time. The contract checker reads the constant as syntax
   only, rejects anything that is not literal data, rejects nullish values, and validates frontmatter keys exactly
   ([D-05](#d-05-validation-split)).
4. **Consumption:** hybrid. Structural alternatives are explicit imports chosen during authoring. Narrow facets are
   passed as parameters to helpers bound once at module scope inside the existing `ThemeState` caches
   ([D-06](#d-06-consumption-model)).
5. **First runtime facets:** typography, then interactive color channels. Hover and focus are runtime facets that map
   onto existing mechanisms. Geometry, accessibility, anatomy, presentation, base layers, and research dispositions stay
   authoring-only for now ([D-07](#d-07-initial-runtime-facets)).
6. **Pilot:** a typography cohort (Button and ListItem), then a channel cohort (Tag and Button)
   ([D-14](#d-14-pilot-cohorts)).
7. **Rollout:** incremental. A component adopts traits when it adopts a trait-consuming helper or its contract changes.
   A required gate comes later. Retrofitting the whole catalog needs separate justification
   ([D-15](#d-15-rollout-and-gating)).

Round-1 rejections still hold: no global traits registry or interpreter, no complete background-to-layer function, no
blanket "macOS has no hover" policy, no font-tree restructuring, no general border renderer, and no public vocabulary
for accessibility or anatomy. The narrow type-only design vocabulary is the one exception the owner directed.

## How to Use This Plan

- [Decisions for Owner Review](#decisions-for-owner-review) starts with an index table, then groups decisions by topic.
- Each decision lists options, the recommendation, reviewer positions, and an empty **Answer** block.
- To decide, write under **Answer** and change **Status** to Accepted, Rejected, or Revised.
- Sections before the decisions hold the evidence and architecture. Sections after them hold phases, validation, risks,
  and success criteria, all contingent on the answers.

## Changes From Round 1

| Area                                 | Round 1                                                            | Round 2                                                                          | Kind of change     |
| ------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------ |
| Purpose                              | Authoring metadata that may guide code                             | Runtime values, set during spec building, consumed by helpers                    | Owner direction    |
| Production imports                   | Prohibited for the full metadata                                   | Required for consumed facets; private and per component                          | Reversed           |
| Type ownership                       | Private to components tooling; only helper request types in design | Shared vocabulary in design; values in each component                            | Reversed (owner)   |
| Public design `./traits`             | Rejected because it carried accessibility and anatomy              | Narrow type-only vocabulary is a candidate; accessibility and anatomy excluded   | Narrow exception   |
| Storage                              | Prototype a TypeScript module versus a YAML or JSON companion      | Constant only, linked from flat frontmatter; YAML plus parity is the alternative | Revised            |
| Checker                              | Schema validation, unspecified                                     | Syntax-only literal reader, exact frontmatter keys, nullish rejection            | Made specific      |
| Typography helper                    | First measured experiment                                          | First runtime facet with a trait-typed helper                                    | Promoted           |
| Static channels                      | Phase 5 candidate                                                  | Second runtime facet; split factories first                                      | Promoted           |
| Hover                                | Contract metadata first                                            | Runtime facet whose values come from contract review                             | Promoted           |
| Focus                                | Reference the shared policy                                        | Runtime facet mapped to existing `useFocusVisuals` options                       | Promoted, narrowly |
| Borders, radius, size scales         | Authoring metadata                                                 | Authoring-only at first                                                          | Unchanged          |
| Accessibility, anatomy, presentation | Authoring metadata                                                 | Authoring-only; parts become type keys                                           | Unchanged          |
| Assessment envelope                  | `Assessment<T>` with dispositions and evidence references          | Evidence stays in contract companions; runtime object holds consumed values only | Reversed           |
| Global interpreter, layer function   | Rejected                                                           | Rejected                                                                         | Unchanged          |
| Pilot                                | Six components and sentinels                                       | Two cohorts; other components act as sentinels                                   | Narrowed           |
| Naming                               | `ComponentTraits`                                                  | `Traits` (both reviewers)                                                        | Revised            |

Round-1 decision IDs map to this plan as follows. Round-1 D-01 (purpose) is settled by the owner and has no successor.

| Round 1 | Topic                     | Round 2                                                                           |
| ------- | ------------------------- | --------------------------------------------------------------------------------- |
| D-02    | Storage format            | [D-01](#d-01-value-storage), [D-02](#d-02-constant-location-and-frontmatter-link) | Accepted |
| D-03    | Ownership                 | [D-03](#d-03-type-entry-point)                                                    | Accepted |
| D-04    | Required facets           | [D-08](#d-08-omission-and-required-facets)                                        | Revised  |
| D-05    | Source authority          | [D-26](#d-26-source-authority)                                                    | Accepted |
| D-06    | Mismatches                | [D-17](#d-17-current-behavior-and-research-mismatches)                            | Accepted |
| D-07    | macOS hover               | [D-19](#d-19-macos-hover-policy)                                                  | Revised  |
| D-08    | Fluent Large radius       | [D-21](#d-21-fluent-large-button-radius)                                          | Accepted |
| D-09    | Font-token restructuring  | [D-22](#d-22-font-token-restructuring)                                            | Accepted |
| D-10    | Typography helper API     | [D-09](#d-09-typography-helper)                                                   | Accepted |
| D-11    | Bundle budgets            | [D-12](#d-12-bundle-budgets)                                                      | Accepted |
| D-12    | Naming                    | [D-04](#d-04-type-name-and-shape)                                                 | Accepted |
| D-13    | Primitive scope           | [D-24](#d-24-primitives)                                                          | Accepted |
| D-14    | Trait-driven test helpers | [D-25](#d-25-trait-assisted-tests)                                                | Accepted |
| D-15    | Presentation              | [D-23](#d-23-presentation-and-base-layers)                                        | Accepted |
| D-16    | Base-layer helpers        | [D-23](#d-23-presentation-and-base-layers)                                        | Accepted |
| D-17    | High-contrast hover       | [D-20](#d-20-high-contrast-hover-feedback)                                        | Accepted |
| D-18    | Research redistribution   | [D-27](#d-27-research-redistribution)                                             | Accepted |
| D-19    | Rollout                   | [D-15](#d-15-rollout-and-gating)                                                  | Accepted |

## Research Method and Provenance

**Models.** Astra 6 (`gpt-6-astra`) and Opus 5.5 (`claude-opus-5.5`), each run at maximum reasoning effort with the
long-context tier. The agent tool has no separate output-token setting, so the long-context tier is the closest
available match to "max tokens."

**Round 1.** Each model researched the seed plan independently, then reviewed the other's report. The reconciled
result replaced the seed.

**Round 2.** Each model received the owner clarification and the round-1 plan, then answered six question groups
independently:

- A, storage and source of truth;
- B, type design in design;
- C, consumption model;
- D, a per-trait re-evaluation;
- E, workflow integration;
- F, plan revision.

Each model then critiqued the other's report.

**Reciprocal review outcome**

- Opus checked 61 of Astra's claims and refuted none. It changed its recommendations to constant-only storage and a
  type-only `./traits` entry point, retracted runtime domain arrays and importing the traits file in Node, and widened
  its channel domain.
- Astra confirmed most of Opus's evidence, including the reproduced bundle baselines. It refuted three claims: that
  TypeScript error TS2367 bans module-scope trait comparisons, that YAML storage is necessary, and that generated data
  must lose literal typing. It rated Opus's helper byte deltas and a general per-module Metro cost as unverifiable, and
  changed its own entry-point recommendation to `./styling`.
- The models therefore crossed over on the entry point, which remains a genuine split.

**Boundaries.** Neither model changed source, ran a bundle update, or staged files. The private-source rule applies: no
private source bodies or mechanically transformed private tables are copied into this plan, and the local Flex research
files are cited only as synthesized evidence.

## Evidence Summary

### Contract and checker (Observed)

| Fact                                                                                                                     | Evidence                                                                              |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Frontmatter is parsed by a flat regex. Nested YAML children are dropped silently; duplicate keys overwrite.              | `packages/agentic/components/scripts/spec-contracts/common.cjs:45-56`                 |
| The checker asserts exact values for the eight existing frontmatter keys but never rejects unknown keys.                 | `packages/agentic/components/scripts/spec-contracts/check-spec-contracts.cjs:510-523` |
| An exact-key validator exists, but it is applied to `source.json`, not to frontmatter.                                   | `check-spec-contracts.cjs:26-35`                                                      |
| Companion links follow a `./spec/<file>` pattern.                                                                        | `check-spec-contracts.cjs:519-523`; `src/components/button/SPEC.md:1-10`              |
| `canonicalize` exists in the checker utilities but is not exported.                                                      | `common.cjs:66-78`                                                                    |
| `@babel/core` is already a components devDependency.                                                                     | `packages/agentic/components/package.json:63`                                         |
| Design already parses source with Babel and tests that type files contain only type-only statements.                     | `packages/agentic/design/src/test/compatibility/importBoundaries.test.ts:245-260`     |
| Files named `types.ts` fall under the `@rnx-kit/type-definitions-only` lint rule.                                        | `scripts/configs/oxlint/oxlint.config.ts:29-31`                                       |
| All 24 current frontmatters parse identically under the `yaml` package 2.9.1, which components cannot currently resolve. | Reported by Opus and confirmed by Astra (Observed in review)                          |

### Runtime boundaries (Observed)

| Area             | Mechanism                                                                                        | Evidence                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Style caching    | Each module-scoped factory owns a private `Symbol` and caches its definition per `ThemeState`    | `packages/agentic/design/src/styling/branchedStyle.ts:242-258`                             |
| Theme identity   | Cache scope is source identity, revision, and resolved appearance                                | `packages/agentic/design/src/theming/themeRuntime.ts:20-39`                                |
| Color laziness   | Interactive envelopes expose enumerable, memoized getters; spreading one evaluates them          | `packages/agentic/design/src/flex/colors/interactiveColor.ts:16-47`                        |
| Color conversion | Hovered and pressed nodes are built when the theme definition is built, not at first hover       | `packages/agentic/design/src/flex/styling/colorStyles.ts:64-109`                           |
| Focus visuals    | Shared hook separates native and custom policy; callers pass options                             | `packages/agentic/components/src/common/useFocusVisuals.ts:34-42`                          |
| Keyboard gating  | Input and Dropdown pass a keyboard-gated `focusVisible`                                          | `src/components/input/useInput.ts:54-61`; `src/components/dropdown/useDropdown.ts:279-282` |
| Dependency rules | Styling helpers belong in design `src/styling`; library-private items in components `src/common` | `packages/agentic/components/references/source-boundaries.md:28-30`                        |
| Framework Base   | Must not depend on design or components                                                          | `packages/framework-base/AGENTS.md:30-31`                                                  |

### Type-checking and bundling facts (Observed by reviewers)

- `as const satisfies Traits<…>` reports unknown keys (TS2353), wrong domain values (TS2322), and missing required keys
  (TS2741).
- `strictNullChecks` is off, so `null` and `undefined` pass `satisfies`. The checker must reject them.
- TS2367 fires only when comparing disjoint literal types. It does not ban module-scope comparisons on a trait value.
- esbuild and the Babel React Native preset both erase `import type` and `satisfies`, so the shared type costs zero
  bytes.
- Metro folds constants within one file and folds `Platform.OS`, but does not fold object-property reads, keeps export
  getters, and does not tree-shake. A module-scope ternary between two helpers keeps both helpers in Metro and in
  esbuild.
- Bundle baselines reproduced exactly by both models:

  | Scenario | macOS raw | Windows raw | macOS gzip | Windows gzip |
  | -------- | --------- | ----------- | ---------- | ------------ |
  | Button   | 73,626    | 73,547      | 21,384     | 21,342       |
  | Catalog  | 229,314   | 229,238     | 63,682     | 63,628       |

- The bundle-size fixture measures macOS and Windows only (`apps/bundle-size/scenarios.json:2`). There is no Win32
  esbuild baseline.

### Repetition that supports the first facets (Observed)

| Pattern                    | Evidence                                                                                                                                                                                                                    | Conclusion                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Functional typography      | 27 functional-family reads: 26 style files plus `useListboxItemStyles.ts:34-42`; Button `button.styles.ts:260-288` and ListItem `list-item.styles.ts:208-271` are nearly identical                                          | Strongest helper candidate                         |
| Typography exceptions      | Avatar initials omit line height (`avatar.styles.ts:139-155`); ProgressBar omits weight (`progress-bar.styles.ts:49-51,77-79`); Input uses line height for layout but not for the editor (`input.styles.ts:77-104,251-287`) | Domains need `omit`, `layout-only`, and `unowned`  |
| Interaction-state builders | 13 three-state builders plus one disabled-only builder (Tag foreground, `tag.styles.ts:99-104`); Button appends states while ListItem and MenuItem use exclusive branches                                                   | Candidate helper; benchmark before adopting        |
| Static versus interactive  | Tag background is interactive while its foreground is static (`tag.styles.ts:56-58`; `tag.test.tsx:187-209`)                                                                                                                | Channel participation is per part and per property |
| Authored states            | Input authors its own stroke states (`input.styles.ts:162-213`)                                                                                                                                                             | Channel domain needs `authored`                    |

### Counterexamples that block component-wide flags

- Avatar initials deliberately omit line height.
- Input uses line height for control layout while the native editor receives font size without it.
- Icon is unstyled and keeps intrinsic glyph metrics.
- Tag animates its background but keeps its foreground static.
- Button and Card currently animate stroke, which the synthesized research describes differently.
- Badge changes border width between tint and outline appearances.
- Input's underline is a dedicated rendered part.
- Card nested content can own a background without owning foreground roles.
- Switch uses foreground semantic colors for the track stroke and thumb fill.
- MenuItem can stay focusable while disabled on some platforms.
- A background token does not uniquely determine foreground, stroke, disabled, or emphasis roles.
- Avatar's decorative-icon hiding depends on instance props (`src/components/avatar/useAvatar.ts:46-63`).

## Architecture

### Lifecycle

1. **Spec building.** The contract skill writes the component's traits constant next to `SPEC.md` and its companions,
   with each nontrivial value traceable to a reviewed requirement. Unresolved questions stay in the contract
   companions as prose; the constant holds no placeholders or invented defaults.
2. **Review.** The constant is reviewed with the SPEC, token bindings, and platform obligations. Review status stays
   draft until that review completes.
3. **Implementation.** The authoring skill reads the constant, identifies the consumer of each field, and binds each
   facet to a helper at module scope.
4. **Runtime.** Helpers read facet values while building cached theme definitions. Live props and interaction state are
   resolved per render, as today.
5. **Change.** Changing a consumed value is a behavior change: it needs contract review, and the tests change in the
   same pull request ([D-16](#d-16-changing-a-consumed-trait)).

### Storage (Accepted)

One private constant per component is the only source of values. The SPEC frontmatter links to it:

```yaml
traits: ./spec/traits.ts
traits-schema: 1
```

The constant is literal data checked against the shared type:

```ts
// packages/agentic/components/src/components/button/spec/traits.ts, as implemented.
import type { Traits } from '@fluentui-react-native/design/styling';

import type { ButtonAppearance, ButtonSize } from '../button.types';

export const buttonTraits = {
  typography: { content: { lineHeight: 'token', weight: 'regular' } },
  channels: {
    root: { background: 'interactive', stroke: 'rest' },
    content: { foreground: 'interactive' },
  },
  hover: { base: 'enabled' },
  focusVisual: 'platform',
  geometry: { root: { radius: { small: 'base200', medium: 'base300', large: 'base400' }, strokeWidth: 'thin' } },
} as const satisfies Traits<'root' | 'content', ButtonAppearance, ButtonSize>;
```

Rules:

- The constant is data only: no calls, identifiers, spreads, computed keys, getters, or casts.
- It is never exported from the package root, a component subpath, or under an `_unstable` name.
- It is not embedded in `*.styles.ts`, which contains executable code, or in `*.types.ts`, which must stay type-only.
- Requirement IDs, evidence, review dates, explanations, and platform qualification stay in the contract companions.
  The runtime object holds only values that some helper consumes.
- Independent axes stay independent. Do not merge appearance, size, shape, and selection into one synthetic variant
  string, and do not use `keyof <Component>State` as the part union.

**Alternative (documented, not recommended).** A nested `traits:` YAML block is the normative source, a mirrored
constant feeds runtime, and the checker enforces parity by comparing parsed YAML with the syntax-parsed literal. This
requires:

- landing a real YAML parser in the checker before any `traits:` block exists, because today's parser silently drops
  nested content;
- a `yaml` devDependency in components, because pnpm strict mode prevents resolving it now;
- exporting or reimplementing canonical comparison;
- reviewing every value twice.

Independently authored YAML and constants, and flattened value keys in frontmatter, are both rejected.

### Shared type (Accepted; revised by D-04 and D-07)

A type-only vocabulary in design, built from per-facet records. The implemented file,
`packages/agentic/design/src/styling/traits.types.ts`, adds a `Size` axis and a geometry facet to the round-2 shape:

```ts
// Round-2 proposal; see the implemented file for the final shape.
export type LineHeightMode = 'token' | 'omit' | 'layout-only';
export type WeightMode = 'regular' | 'semibold' | 'unowned';
export type TypographyTraits = { lineHeight: LineHeightMode; weight: WeightMode };

export type ChannelMode = 'unowned' | 'rest' | 'interactive' | 'authored';
export type ChannelTraits = { background?: ChannelMode; foreground?: ChannelMode; stroke?: ChannelMode };

export type HoverMode = 'enabled' | 'suppressed' | 'component';
export type HoverTraits<Variant extends string> = {
  base: HoverMode;
  byAppearance?: Partial<Record<Variant, HoverMode>>;
};

export type FocusVisualMode = 'platform' | 'custom-always-visible';

export type Traits<Part extends string, Variant extends string> = {
  typography?: Partial<Record<Part, TypographyTraits>>;
  channels?: Partial<Record<Part, ChannelTraits>>;
  hover?: HoverTraits<Variant>;
  focusVisual?: FocusVisualMode;
};
```

Shape rules:

- Generic arguments are required. A default of `string` would disable key checking.
- No generic `byAxis` envelope. It invites a merge engine; each facet names its own axis where one is needed.
- Accessibility, anatomy, presentation, base layers, and research dispositions are not in the type.
- Framework Base never imports the type.
- `Traits` is distinct from iOS `accessibilityTraits`; document the distinction where the type is defined. No existing
  `Traits` identifier conflicts.
- Whether facet parts are `Partial` or exact is part of [D-08](#d-08-omission-and-required-facets).

### Consumption (Proposed; hybrid)

| Model                    | When to use                                                                                                   | Example                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Trait selects the helper | Structurally different algorithms. Select by explicit import during authoring, not by a module-scope ternary. | Editor versus label typography; `LayoutStableText`; an underline part |
| Trait is a parameter     | Narrow facets read by one helper                                                                              | `functionalTypography(tokens, role, buttonTraits.typography.label)`   |

Rules:

- Bind one factory per immutable configuration at module scope. A single shared factory that receives different trait
  objects later would return the first caller's cached result, because its `Symbol` cache ignores the new argument.
- Resolve trait-driven styling inside the existing `ThemeState` caches. Traits never enter per-render cache keys, and
  there is no separate traits cache.
- Prefer explicit imports over module-scope ternaries; both bundlers keep both branches of a ternary.
- Passing literal arguments instead of the trait object disconnects the call site from the traits constant. If that
  form is chosen for bundle size, add a conformance test that ties the call site to the constant.
- Preserve color-envelope laziness: copy envelope references instead of spreading them. A static channel should avoid
  building interactive nodes at all, not just hide them.
- Hover suppression changes paint only. Callbacks and behavioral hover, such as MenuItem submenu navigation, are kept.

### Validation split (Proposed; both reviewers agree)

| Layer             | Checks                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript build  | Keys, domains, and required members through `satisfies`; helper signatures                                                             |
| Contract checker  | Frontmatter exact key set, duplicate rejection, CRLF normalization, link path; literal-only grammar; nullish rejection; schema version |
| Focused tests     | Invalid fixtures read as text and never imported; helper style parity; cache behavior                                                  |
| Behavior tests    | Expected behavior written independently from the contract, never generated from the traits constant                                    |
| Import boundaries | The type entry point stays type-only; traits constants are not re-exported; no checker code enters production                          |

The checker reads the constant with `@babel/core` `parseSync` and inspects syntax. It never imports or evaluates the
file. Allowed: type-only imports, one literal constant, `as const`, and `satisfies`. Rejected: calls, identifiers,
spreads, computed keys, getters, casts, `null`, and `undefined`. Components without traits keep passing until the
required gate ([D-15](#d-15-rollout-and-gating)).

No runtime domain arrays are added to design; TypeScript owns the domains.

### Ownership

| Artifact                            | Owner                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `Traits` type vocabulary            | Design `./styling`, type exports ([D-03](#d-03-type-entry-point))         |
| Trait values                        | Each component, private constant                                          |
| Styling helpers that consume facets | Design `./styling` ([D-09](#d-09-typography-helper))                      |
| Library-private policy              | Components `src/common`                                                   |
| Non-styling hooks                   | Framework Base, only after several consumers and without importing traits |
| Checker, grammar, fixtures          | Components `scripts/spec-contracts`                                       |
| Primitive behavior                  | Primitive `CONTRACT.md`; no traits ([D-24](#d-24-primitives))             |

## Trait Catalog

### Disposition summary

| Candidate                   | Disposition             | Proposed domain or consumer                                                                    | Round 1 → round 2                 |
| --------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------- |
| Typography                  | **Runtime, first**      | Per part: `lineHeight: token \| omit \| layout-only`; `weight: regular \| semibold \| unowned` | Measured helper → runtime facet   |
| Selected-weight reservation | Structural              | `LayoutStableText`, chosen during authoring                                                    | Unchanged                         |
| Interactive channels        | **Runtime, second**     | Per part and property: `unowned \| rest \| interactive \| authored`                            | Metadata → runtime facet          |
| Hover feedback              | **Runtime**             | `base` plus per-appearance overrides: `enabled \| suppressed \| component`                     | Contract metadata → runtime facet |
| Focus visual                | **Runtime, narrow**     | `platform \| custom-always-visible`, mapped to `useFocusVisuals`                               | Reference → runtime facet         |
| Focus target, delegation    | Authoring-only          | Contract prose                                                                                 | Unchanged                         |
| Borders                     | Split                   | Stroke participation is in `channels.stroke`; geometry is authoring-only                       | No border renderer                |
| Corner rounding             | Authoring-only at first | Token bindings in `tokens.yaml`                                                                | Unchanged                         |
| Size scales                 | Authoring-only at first | Per-component tables                                                                           | Unchanged                         |
| Accessibility               | Authoring-only          | Contract companions, existing hooks and resolvers                                              | Unchanged; excluded from type     |
| Anatomy                     | Authoring-only          | Parts appear only as type keys                                                                 | Unchanged                         |
| Presentation                | Authoring-only          | Lexical facts derived by tooling                                                               | Unchanged                         |
| Base layers                 | Authoring-only          | Explicit bindings in `tokens.yaml`                                                             | Unchanged                         |
| Research dispositions       | Authoring-only          | Advisory input to channel values                                                               | Unchanged                         |
| Decorative icon attachment  | Not a trait             | Standalone helper candidate                                                                    | Unchanged                         |
| Token gaps                  | Tooling                 | Optional normalized gap IDs                                                                    | Unchanged                         |
| Motion                      | Deferred                | Possible narrow shared-loop follow-up                                                          | Deferred                          |
| Elevation                   | Deferred                | No consumer                                                                                    | Deferred                          |

### Typography (runtime, first)

**Observed**

- Button and ListItem contain nearly identical functional typography definitions.
- All 27 functional-family reads use the `functional` family; no content-family consumer exists.
- Avatar initials omit line height, ProgressBar omits weight, and Input uses line height for layout but not for the
  native editor.
- Accordion headers are semibold (`accordion.styles.ts:75-78`).
- Selected-weight changes use `LayoutStableText` in Button, Tab, ListItem, ListboxItem, and MenuItem
  (`renderButton.tsx:14-19`).

**Proposed facet:** per part, `{ lineHeight: 'token' | 'omit' | 'layout-only'; weight: 'regular' | 'semibold' |
'unowned' }`.

- `token` includes the role's token line height.
- `omit` emits no line height.
- `layout-only` keeps line height out of the text style; the component uses it for layout itself.
- `unowned` emits no `fontWeight`, so caller and platform defaults apply.
- The semantic role and size-to-role map stay in code and `tokens.yaml`. The role is passed as an argument, not stored
  in traits.
- Selected weight and label reservation are structural: chosen during authoring through `LayoutStableText`, not a facet.

**Consumer:** `functionalTypography(tokens, role, typographyTraits)` in design `./styling`, called inside existing
module-scoped themed factories, with no new cache ([D-09](#d-09-typography-helper)).

### Interactive channels (runtime, second)

**Observed**

- Tag background is interactive while its foreground is static.
- Button's background factory also owns `borderColor` with interactive levels (`button.styles.ts:36-92,127-131`), and
  Card's surface factory does the same (`card.styles.ts:42-67`).
- ListItem's same-key hovered and pressed entries read the token's `.hover` and `.pressed` values
  (`list-item.styles.ts:59-84`; `colorStyles.ts:84-87`), and its test expects the hover value
  (`list-item.test.tsx:105-107`). Its foreground is therefore interactive.
- Input authors explicit focus, error, read-only, and boundary states for its stroke.
- The color factory handles `backgroundColor`, `borderColor`, and `color`, not arbitrary native color properties.

**Proposed facet:** per part, per property, `'unowned' | 'rest' | 'interactive' | 'authored'`.

- `unowned`: the part does not paint this property.
- `rest`: static; only the rest value is read.
- `interactive`: hover and pressed values are selected from the token envelope.
- `authored`: the component authors its own states, as Input does.

**Consumer:** start with the existing split-factory pattern that Tag uses. Add a static-channel option to the color
converter only when a real consumer needs it ([D-10](#d-10-static-channel-support)).

**Testing rule:** `interactive` means the channel selects an interaction state. It does not guarantee visibly different
values in every theme, because fixed colors, explicit equal states, and high-contrast fallback may resolve to the same
output.

### Hover feedback (runtime)

**Observed**

- Current agentic Button and Checkbox contracts declare hover behavior on macOS and Windows.
- Existing hooks track and forward hover. Suppressing paint must not suppress caller handlers or behavioral hover.
- V1 macOS evidence is per component and per appearance. The V1 subtle button comment says subtle buttons "have a hover
  state (unlike most buttons in macOS)" (`packages/components/Button/src/ButtonColorTokens.macos.ts:77`).
- Explicit high-contrast interaction states can still differ; only omitted derived states fall back to rest.

**Proposed facet:** `{ base: 'enabled' | 'suppressed' | 'component'; byAppearance?: … }`.

- `component` means the component owns a specific hover hierarchy and the shared helper does not apply.
  **Implemented:** state sources push `hovered` unless `resolveHoverMode` returns `suppressed`, so `component` still
  pushes it and the component's own hierarchy decides the paint.
- Omission must never silently mean feedback. When any channel is `interactive`, `hover` is required
  ([D-08](#d-08-omission-and-required-facets)).
- Removing `hovered` from a shared factory suppresses hover for every appearance using that factory. Per-appearance
  suppression needs the source-based interaction helper ([D-11](#d-11-interaction-source-helper)). **Implemented:**
  Button and Tag gate `hovered` per appearance in their existing state-source builders; the shared helper remains a
  benchmark follow-up.
- Values come from contract review ([D-19](#d-19-macos-hover-policy), [D-20](#d-20-high-contrast-hover-feedback)).

### Focus visual (runtime, narrow)

**Observed**

- `useFocusVisuals` already separates native and custom policy; current policy prefers native focus visuals on Windows
  and macOS and custom visuals on Win32.
- Input and Dropdown pass keyboard-gated `focusVisible`.

**Proposed facet:** `focusVisual: 'platform' | 'custom-always-visible'`, mapped to existing `useFocusVisuals` options.

- The mapping must preserve keyboard gating and focus eligibility.
- Delegated or absent focus is authoring-only: such components do not call the hook, so there is nothing to
  parameterize.
- Add an alias only with defined semantics; do not invent a new focus engine.

### Borders, rounding, and size scales (authoring-only at first)

**Observed**

- Button keeps thin root geometry across appearances; Tag uses width zero; Badge varies width by appearance
  (`badge.styles.ts:145-157`); Input has a dedicated underline part (`input.styles.ts:289-317`).
- Size-to-radius ramps differ between components (`button.styles.ts:204-242`, `badge.styles.ts:184-220`).
- Flex default radii and Fluent fallback radii differ, so Button already rounds less on Fluent without a branch.
- Fluent Button radii are 4/4/6 for Small/Medium/Large; the inspected V1 desktop baseline uses 4px at every size.
- Opus measured +137 bytes on Button for moving geometry into a runtime object, with no shared helper to consume it.

**Proposed:** keep geometry in `tokens.yaml` bindings and focused tests. Stroke participation lives in
`channels.stroke`. A component may later consume a local geometry facet when a demonstrated helper exists. No general
border renderer, padding helper, or per-corner vocabulary.

### Accessibility, anatomy, presentation, and base layers (authoring-only)

- **Accessibility:** roles, state ownership, raw-prop-presence conditions, actions, and platform projection stay in the
  contract and in existing hooks and resolvers. Action names depend on instance props (`src/components/button/useButton.ts:67-69`), so a static
  trait cannot replace them. Native qualification requires invoking real UIA patterns or AX custom actions.
- **Anatomy:** parts appear only as type keys for facet records.
- **Presentation:** derive lexical facts, such as family and fill weight, in tooling; author only non-derivable intent.
- **Base layers:** `spec/tokens.yaml` remains the authoritative binding profile. A complete
  `backgroundToken → palette` runtime function stays rejected. No universal `emphasis` role is established.

### Decorative icon attachment (standalone helper)

Several style hooks attach icon size, color, and decorative accessibility in similar ways (`useButtonStyles.ts:23-38`).
Avatar's hiding depends on instance props, so this is not a static trait. Treat it as a separately measured helper
after deciding whether the existing decorative encodings are interchangeable.

### Motion and elevation (deferred)

No current component consumes `tokens.shadow` or `tokens.motion`
(`packages/agentic/design/references/remaining-work.md:57-63`). Switch has motion literals, and some components share
animation loops. Defer a motion token system; a narrow shared-loop helper may be a later experiment
([D-28](#d-28-motion-and-elevation)).

## Helpers

| Helper                    | Status      | Notes                                                                                                                  |
| ------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `functionalTypography`    | New, first  | Design `./styling`; omits unowned weight; includes line height only for `token`; keeps editor, initials, glyph metrics |
| Static-channel support    | Conditional | Split factories first; converter option only for a real consumer                                                       |
| Interaction-source helper | Candidate   | `appendInteractionStates` or `interactionPriority`; must handle appended and exclusive-branch forms                    |
| Focus visual mapping      | Existing    | Reuse `useFocusVisuals` options                                                                                        |
| Decorative icon helper    | Candidate   | Independent of traits                                                                                                  |

**Placement split.** Opus first suggested incubating the typography helper in components `src/common`; Astra objected,
citing the rule that styling helpers belong in design `src/styling` (`source-boundaries.md:28-30`). Opus accepted the
objection. Recommendation: design `./styling`.

**Exploratory bundle deltas (Unverified).** Opus reported these measurements. Astra could not reproduce them because the
prototype inputs were not preserved. Treat them as direction only and re-measure with checked-in prototypes.

| Prototype                                          | Button raw | Catalog raw |
| -------------------------------------------------- | ---------- | ----------- |
| Typography helper, literal arguments               | −69        | −803        |
| Typography helper, trait-object argument           | +57        | −571        |
| Interaction helper                                 | +25        | −299        |
| Interaction helper with hover trait                | +74        | −126        |
| Metro approximation (typography, Button / catalog) | −206       | −87         |

One Metro example module carried 151 bytes of wrapper overhead; that is not a general per-module cost.

## Workflow Integration

### Contract skill (owns the traits constant)

1. Identify candidate facets while building the spec.
2. Write the traits constant before implementation and link it from the frontmatter.
3. Trace each nontrivial value to an existing or newly reviewed requirement.
4. Classify disagreements with current implementation or research instead of resolving them automatically.
5. Keep unresolved items in contract prose; never write placeholder values.
6. Review the constant with the SPEC, token bindings, and platform obligations; keep review status draft until done.

### Authoring skill (consumes the constant)

1. Order becomes types → traits → state → styles.
2. Identify the consumer of each runtime field; bind static policy at module scope.
3. Keep live props, interaction state, and user-style precedence in their current pipeline stages.
4. Add independent behavior and type assertions.
5. Treat a changed consumed value as a behavior change.

### New components before the vocabulary exists

A draft cannot import types that do not exist yet. Phase 1 lands the vocabulary before any component draft uses it.
If a draft needs a facet the vocabulary lacks, it records the need in SPEC prose and requests a vocabulary change; it
does not define local look-alike types.

### References to update

- Components: `references/contracts.md`, a new `references/traits.md`, `higher-order-components.md`,
  `styles-and-tokens.md`, `types-and-slots.md`, `tests-and-stories.md`, and `source-boundaries.md`.
- Design: `references/styling.md` and `references/entry-points.md`.
- Skills: contract authoring steps 5–8 and component authoring order.
- An eval case for the contract skill that writes and links a traits constant.

## Decisions for Owner Review

### Decision index

Reviewer column: **Agree** means both models reached the same recommendation (after review where noted); **Split**
names each model's final position. Status column: the outcome after the owner answer and execution.

| ID   | Topic                                    | Recommendation                                                         | Reviewers                                                   | Round 1    | Status   |
| ---- | ---------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- | -------- |
| D-01 | Value storage                            | Constant only, linked from frontmatter                                 | Agree (Opus changed after review)                           | D-02       | Accepted |
| D-02 | Constant location and link               | `spec/traits.ts`                                                       | Split: Opus `spec/traits.ts`; Astra `<component>.traits.ts` | D-02       | Accepted |
| D-03 | Type entry point                         | `./traits`, type-only                                                  | Split: Opus `./traits`; Astra `./styling`                   | D-03       | Accepted |
| D-04 | Type name and shape                      | `Traits<Part, Variant>` facet records                                  | Agree                                                       | D-12       | Revised  |
| D-05 | Validation split                         | `satisfies` plus a syntax-only checker                                 | Agree                                                       | —          | Accepted |
| D-06 | Consumption model                        | Hybrid, bound factories, explicit imports                              | Agree                                                       | —          | Accepted |
| D-07 | Initial runtime facets                   | Typography, channels, hover, focus                                     | Agree on scope; split on geometry later                     | —          | Revised  |
| D-08 | Omission and required facets             | Declared facets are complete; hover required with interactive channels | Agree                                                       | D-04       | Accepted |
| D-09 | Typography helper                        | Design `./styling`; measure signature                                  | Agree                                                       | D-10       | Accepted |
| D-10 | Static-channel support                   | Split factories first                                                  | Agree (Opus changed after review)                           | —          | Accepted |
| D-11 | Interaction-source helper                | Benchmark before adopting                                              | Agree                                                       | —          | Accepted |
| D-12 | Bundle budgets                           | Zero bytes for types; measured gates for helpers                       | Agree                                                       | D-11       | Accepted |
| D-13 | Workflow ownership                       | Contract skill writes; authoring skill consumes                        | Agree                                                       | —          | Accepted |
| D-14 | Pilot cohorts                            | Typography: Button + ListItem; channels: Tag + Button                  | Agree after review                                          | —          | Accepted |
| D-15 | Rollout and gating                       | Incremental; gate later                                                | Agree after review                                          | D-19       | Accepted |
| D-16 | Changing a consumed trait                | Behavior change with tests in the same pull request                    | Agree                                                       | —          | Accepted |
| D-17 | Current-behavior and research mismatches | Classify before writing values                                         | Agree                                                       | D-06       | Accepted |
| D-18 | Native validation                        | Risk-based for touched behavior                                        | Agree                                                       | —          | Accepted |
| D-19 | macOS hover policy                       | Contract review per component and appearance                           | Agree                                                       | D-07       | Accepted |
| D-20 | High-contrast hover feedback             | Per component and appearance                                           | Agree                                                       | D-17       | Accepted |
| D-21 | Fluent Large Button radius               | Keep 6px unless parity is required                                     | Agree                                                       | D-08       | Revised  |
| D-22 | Font-token restructuring                 | Helper over current tree                                               | Agree                                                       | D-09       | Accepted |
| D-23 | Presentation and base layers             | Authoring-only                                                         | Agree                                                       | D-15, D-16 | Accepted |
| D-24 | Primitives                               | No traits in pilot; future non-styling metadata left open              | Agree on pilot; split on permanence                         | D-13       | Accepted |
| D-25 | Trait-assisted tests                     | Action helpers; expected behavior independent                          | Agree                                                       | D-14       | Accepted |
| D-26 | Source authority                         | Reviewed contract governs                                              | Agree                                                       | D-05       | Accepted |
| D-27 | Research redistribution                  | Keep synthesized files with citations                                  | Agree                                                       | D-18       | Accepted |
| D-28 | Motion and elevation                     | Defer                                                                  | Agree on deferral; Astra keeps loop follow-up               | —          | Accepted |

### Storage and type

#### D-01: Value storage

**Status:** Accepted.

**Options**

1. Constant only: a private TypeScript literal is the single source; frontmatter holds a flat link.
2. Nested YAML `traits:` block is normative; a mirrored constant feeds runtime; the checker enforces parity.
3. YAML only, with a generated data module for runtime.
4. YAML and constant authored independently.

**Recommendation:** Option 1. Keep Option 2 as the documented alternative if values must be readable in the SPEC
itself. Option 3 needs a generator, a deterministic `--check`, and a typed loading path. Reject Option 4.

**Reviewers:** both now recommend Option 1. Opus first recommended Option 2, then changed after review: a single source
avoids drift and needs no new dependency. Astra confirmed Option 2 is feasible (24 frontmatters parse identically) and
that Option 3 does not inevitably lose literal typing, but needs extra machinery.

**Answer:** Approved, option #1

>

#### D-02: Constant location and frontmatter link

**Status:** Accepted.

**Options**

1. `src/components/<component>/spec/traits.ts`, linked as `traits: ./spec/traits.ts`.
2. `src/components/<component>/<component>.traits.ts`, linked as `traits: ./<component>.traits.ts`.

Both use `export const <camelName>Traits` and an optional `traits-schema: 1` key.

**Recommendation:** Option 1. It matches the `./spec/…` companion pattern and keeps contract-skill writes inside
`SPEC.md` and `spec/`. The cost is that `spec/` would then contain one production module. Verify that no lint, test, or
packaging rule treats `spec/` as documentation-only before adopting.

**Reviewers:** split. Opus prefers Option 1; Astra prefers Option 2, which keeps production code out of `spec/`.

**Answer:** Approved, option #1

>

#### D-03: Type entry point

**Status:** Accepted (option 2). The vocabulary is `src/styling/traits.types.ts`, exported as types from `./styling`; no entry point was added.

**Options**

1. A new type-only `@fluentui-react-native/design/traits` subpath, with the vocabulary in a file named `types.ts` so the
   `@rnx-kit/type-definitions-only` rule applies, plus an import-boundary test like the existing shared-types test.
2. Type exports from the existing `@fluentui-react-native/design/styling` entry point.

**Recommendation:** Option 1. It matches "common upstream location," is easy to find, can be enforced as type-only, and
keeps `./styling` focused on runtime helpers. Both options cost zero runtime bytes.

**Reviewers:** split, and the models swapped positions during review. Opus now prefers Option 1. Astra now prefers
Option 2: no export-map change, fewer entry points, and the first facets are styling policies.

**Answer:** Go with option #2 for right now, I may want to rework the export entries so don't add a new one for now

>

#### D-04: Type name and shape

**Status:** Revised. `Traits<Part, Variant, Size>`: a required `Size` axis was added so geometry can scale by size. Needs owner review.

**Options**

1. `Traits<Part, Variant>` built from per-facet records.
2. `ComponentTraits<Part, Variant>` with the same shape.
3. A `parts` record plus a generic `byAxis` refinement envelope.

**Recommendation:** Option 1. Generic arguments are required. Document the difference from iOS
`accessibilityTraits`. Reject Option 3 because it invites a merge engine.

**Reviewers:** agree on Option 1 after review. Astra originally proposed Option 3; Opus originally proposed the name
`ComponentTraits`.

**Answer:** Approved, option 1

>

#### D-05: Validation split

**Status:** Accepted.

**Options**

1. TypeScript `satisfies` for keys and domains; a syntax-only checker for grammar, nullish values, and frontmatter.
2. Runtime domain arrays in design shared with a checker that imports the traits file.
3. TypeScript only.

**Recommendation:** Option 1, with `@babel/core` parsing, exact frontmatter keys, duplicate rejection, and CRLF
normalization. Reject Option 2 because it adds runtime values to design and evaluates component files. Option 3 misses
`null` and `undefined` while `strictNullChecks` is off.

**Reviewers:** agree. Opus retracted Option 2 after review.

**Answer:** Approved, option #1

>

### Consumption and helpers

#### D-06: Consumption model

**Status:** Accepted.

**Options**

1. Hybrid: structural alternatives through explicit imports chosen during authoring; narrow facets passed as parameters.
2. Traits select helpers at runtime through module-scope conditionals.
3. Traits are parameters to a small number of general helpers.

**Recommendation:** Option 1, with one bound factory per immutable configuration, resolution inside existing
`ThemeState` caches, no traits in per-render cache keys, and no separate traits cache.

**Reviewers:** agree on Option 1. Astra showed that TS2367 does not ban module-scope comparisons; the case against
Option 2 is bundle retention and clarity, not a compiler rule.

**Answer:** Approved, option #1

>

#### D-07: Initial runtime facets

**Status:** Revised. Option 2 is built as radius and stroke-width geometry only; size scales are a follow-up in the components remaining work. Needs owner review.

**Options**

1. Typography, channels, hover, and focus visual at runtime; everything else authoring-only for now.
2. Option 1 plus geometry (borders, radius, size scales) at runtime.
3. Typography only until the first pilot completes.

**Recommendation:** Option 1, adopted in phases: typography first, channels second. Allow a local geometry facet later
when a demonstrated helper consumes it.

**Reviewers:** agree on Option 1 for the start. Astra considers geometry runtime-capable locally later; Opus measured a
137-byte Button cost for runtime geometry with no shared consumer.

**Answer:** Option 2 as geometry cost should be less when applied across the whole library

>

#### D-08: Omission and required facets

**Status:** Accepted. Input has no `interactive` channel and no `hover` facet.

**Options**

1. Facets are optional; a declared facet must list every part that consumes it; `hover` is required whenever any
   channel is `interactive`.
2. Every facet is required, with explicit `not-applicable` values.
3. Every facet and part is optional, and omission means a default.

**Recommendation:** Option 1. Omission means "this component does not consume the facet," never a default behavior. The
checker enforces the hover rule and rejects nullish values.

**Reviewers:** agree that omission must not silently mean feedback or a default.

**Answer:** Approved, option #1

>

#### D-09: Typography helper

**Status:** Accepted. `functionalTypography(tokens, role, typographyTraits)`.

**Options**

1. `functionalTypography(tokens, role, typographyTraits)` in design `./styling`.
2. A literal-argument signature such as `functionalTypography(tokens, role, lineHeight, weight)`.
3. Incubate in components `src/common` first.
4. A family-aware general helper.

**Recommendation:** Option 1 in design `./styling`. Measure Option 2 with checked-in prototypes; adopt it only if the
saving is material and a conformance test ties call sites to the constant. Reject Option 3 per the source boundaries.
Defer Option 4 until a content-family consumer exists.

**Reviewers:** agree on placement after review. Opus's unverified measurement favored literal arguments (−803 versus
−571 catalog bytes).

**Answer:** Approved, option #1

>

#### D-10: Static-channel support

**Status:** Accepted. Button and Card build separate stroke factories and state sources.

**Options**

1. Use the existing split-factory pattern (as Tag does) first.
2. Add a static-channel option to the color converter now.

**Recommendation:** Option 1. Add Option 2 when a real consumer needs it, and make sure it avoids building unused
interactive nodes.

**Reviewers:** agree on Option 1 after review; Opus originally wanted Option 2.

**Answer:** Approved, option #1

>

#### D-11: Interaction-source helper

**Status:** Accepted. The benchmark is a follow-up in the components remaining work.

**Options**

1. Benchmark a shared helper against the 13 three-state builders before adopting it.
2. Adopt the helper during the channel pilot.
3. Do not pursue it.

**Recommendation:** Option 1. The helper must preserve both the appended form (Button) and the exclusive-branch form
(ListItem, MenuItem). Leave Tag's disabled-only builder alone.

**Reviewers:** agree on Option 1.

**Answer:** Approved, option #1

>

#### D-12: Bundle budgets

**Status:** Accepted (option 3). Measurements are in [Execution Status](#bundle-measurements); the baseline was not updated.

**Options**

1. No raw-byte increase in any affected scenario or platform.
2. Allow a bounded single-consumer increase when the catalog decreases.
3. Record measurements without a gate.

**Recommendation:** The type and the frontmatter link must add zero bytes. For helpers, choose between Options 1 and 2
after re-measuring with checked-in prototypes. Add a minimal-consumer Metro measurement. Any accepted regression needs
explicit approval and a reviewed baseline update.

**Reviewers:** agree that budgets must come from reproducible measurements.

**Answer:** Use option 3, record measurements and attribution.

>

### Rollout and lifecycle

#### D-13: Workflow ownership

**Status:** Accepted. Both component skills were updated.

**Options**

1. The contract skill writes and reviews the traits constant; the authoring skill consumes it.
2. The authoring skill writes the constant during implementation.

**Recommendation:** Option 1, so values are set during spec building as the owner directed.

**Reviewers:** agree.

**Answer:** Approved, option 1

>

#### D-14: Pilot cohorts

**Status:** Accepted (option 3). All six components were piloted in order.

**Options**

1. Typography: Button and ListItem. Channels: Tag and Button. Input, Card, Badge, Avatar, and Icon act as sentinels.
2. Button and Tag only.
3. Button first, then ListItem, Tag, Badge, Card, and Input in sequence.

**Recommendation:** Option 1. A helper needs two consumers to show payoff. ListItem is excluded from Win32 Storybook
(`apps/storybook/AGENTS.md:35-39`), so that lane cannot be reported as native qualification.

**Reviewers:** agree on Option 1 after review; Opus proposed Option 2 and Astra Option 3.

**Answer:** Go for option #3, multiple consumers are required to see payoffs and ensure the design works

>

#### D-15: Rollout and gating

**Status:** Accepted (option 2). The six-component pilot is in this change; the retrofit and the required gate are tracked in the components remaining work.

**Options**

1. Incremental: adopt traits when a component adopts a trait-consuming helper or its contract changes; require traits
   for new or changed contracts later; retrofit the catalog only with separate justification.
2. Batch retrofit of every component, followed by a required gate.
3. Pilot only, with no gate.

**Recommendation:** Option 1.

**Reviewers:** agree after review; Opus first proposed Option 2.

**Answer:** The goal is to do option 2, but pilot set in this PR, with other components following in separate PRs.

>

#### D-16: Changing a consumed trait

**Status:** Accepted. Recorded as a package `AGENTS.md` invariant and in `traits.md`.

**Options**

1. Treat it as a behavior change: contract review, updated tests in the same pull request, and a changeset.
2. Treat it as a refactor when tests still pass.

**Recommendation:** Option 1. Accepted divergences remain valid trait evidence.

**Reviewers:** agree.

**Answer:** Approved, option 1

>

#### D-17: Current-behavior and research mismatches

**Status:** Accepted. Button and Card strokes were made static as implementation defects; the other items keep current behavior.

Classify each item as accepted local behavior, missing divergence documentation, contract defect, implementation
defect, or unqualified, before writing trait values:

- ListItem foreground and background are interactive (consistent with research listing ListItem as `bg.fg`);
- Button and Card stroke are interactive, unlike the research categories (`references/research/flex-research.yaml:701-718`);
- Card disabled background;
- Badge appearance-dependent border width;
- Button and Avatar decorative accessibility encodings;
- MenuItem and ListboxItem literals with empty `tokenGaps`;
- Fluent Large Button radius (see D-21).

**Recommendation:** current reviewed behavior stays authoritative until contract review decides otherwise. Write trait
values that describe current behavior and record classifications in the contracts.

**Reviewers:** agree.

**Answer:** Generally agree. Divergences should generally be for native vs web or platform reasons and should be documented. Button and card strokes being interactive seems like a bug.

>

#### D-18: Native validation

**Status:** Accepted. Native qualification for the stroke and radius changes has not been run.

**Options**

1. Risk-based native qualification for behavior a pull request touches.
2. Full native qualification for every traits adoption.
3. JavaScript tests only.

**Recommendation:** Option 1. Style-parity refactors need JavaScript parity tests and Storybook smoke runs; paint,
hover, focus, or accessibility changes need per-platform native qualification. JavaScript tests are not native
qualification. Use `FURN_RN_PLATFORM` to run Jest against non-default platforms.

**Reviewers:** agree.

**Answer:** Approved, option 1

>

### Behavior policy

#### D-19: macOS hover policy

**Status:** Accepted (option 1). macOS hover review is a follow-up in the components remaining work.

**Options**

1. Keep current agentic contract behavior.
2. Adopt selected V1 per-component and per-appearance conventions.
3. Adopt a broad macOS hover-suppression policy.

**Recommendation:** choose between Options 1 and 2 per component through contract review; express the result in the
`hover` facet. Reject Option 3 without more evidence.

**Reviewers:** agree.

**Answer:** Use option 1, macOS hover behavior is more nuanced and should be handled seperately

>

#### D-20: High-contrast hover feedback

**Status:** Accepted. Recorded in `traits.md` for contract review.

**Options**

1. Accept rest-equivalent feedback when no explicit state exists.
2. Author explicit high-contrast interaction states.
3. Add another treatment, such as a border, where the contract requires visible feedback.

**Recommendation:** decide per component and appearance. Do not infer a universal answer from derived-color fallback.

**Reviewers:** agree.

**Answer:** agree

>

#### D-21: Fluent Large Button radius

**Status:** Revised by the owner answer. Flex radius values follow the Flex specs in every theme; the Fluent fallback override and the reverse Button radius mapping were removed, and a Fluent radius look is tracked as a future theme setting in the design remaining work.

**Options**

1. Keep the current 6px result.
2. Change shared Fluent `base400` to 4px, affecting every consumer.
3. Introduce a control-specific radius role.
4. Add a theme setting.
5. Add a component-specific override.

**Recommendation:** Option 1 unless V1 parity is required. If parity is required, investigate Option 3 before Options 4
and 5. Avoid Option 2.

**Reviewers:** agree.

**Answer:** I had previously realigned the application of radius to match fluent. This was a mistake, for now the flex token values for radius should match flex specs and usage in agentic/components should the flex specs. Mapping to v1/fluent look and feel should be a theme setting in the future.

>

#### D-22: Font-token restructuring

**Status:** Accepted (option 2).

**Options**

1. Keep the current token tree.
2. Add typed helpers over the current tree.
3. Add a grouped compatibility view.
4. Replace the public tree.

**Recommendation:** Option 2, through `functionalTypography`. Consider Options 3 or 4 only through a separate RFC.

**Reviewers:** agree.

**Answer:** Agree. #2

>

#### D-23: Presentation and base layers

**Status:** Accepted.

**Options**

1. Authoring-only: derive lexical presentation facts in tooling; keep explicit bindings in `tokens.yaml`; validate
   pairing rules in tooling or tests.
2. A definition builder with explicit overrides.
3. Disabled-state synthesis by fill weight.
4. A complete background-to-layer runtime function.

**Recommendation:** Option 1. Consider Options 2 or 3 only after mismatch classification and measurement. Reject
Option 4.

**Reviewers:** agree.

**Answer:** agree

>

### Scope and process

#### D-24: Primitives

**Status:** Accepted (option 1). No primitive declares traits.

**Options**

1. No traits in primitives during the pilot; leave future non-styling metadata open.
2. Exclude primitives permanently.
3. Include primitives in the same type.

**Recommendation:** Option 1. Components may pass trait-derived props into primitives, but primitives never read
traits. Primitives have no frontmatter (`src/primitives/icon/CONTRACT.md:1`), and the checker scans only
`src/components` (`common.cjs:7,58-64`).

**Reviewers:** agree on the pilot; Opus leaned toward Option 2, Astra toward leaving future metadata open.

**Answer:** agree for the pilot. option #1

>

#### D-25: Trait-assisted tests

**Status:** Accepted. `src/common/traitConformance.ts` and per-component conformance blocks.

**Options**

1. Shared action and readout helpers; expected behavior written independently.
2. Generate expected behavior from traits.
3. No helpers.

**Recommendation:** Option 1, plus conformance tests that tie helper call sites to the traits constant. Reject
Option 2.

**Reviewers:** agree.

**Answer:** agree

>

#### D-26: Source authority

**Status:** Accepted.

**Options**

1. The reviewed FURN contract, including its traits constant, is authoritative; research is advisory.
2. Synthesized research is the default and FURN records overrides.

**Recommendation:** Option 1. A contradiction between prose, token bindings, and traits is a contract defect to review,
not something resolved by whichever file executes.

**Reviewers:** agree.

**Answer:** agree

>

#### D-27: Research redistribution

**Status:** Accepted.

**Options**

1. Keep the existing synthesized research files with labels and rule-ID citations.
2. Publish only a further-summarized rule catalog.
3. Restrict or remove the research files.

**Recommendation:** Option 1. Do not copy private source bodies or mechanically transformed tables into traits
constants, contracts, or production code.

**Reviewers:** agree.

**Answer:** agree

>

#### D-28: Motion and elevation

**Status:** Accepted. Follow-up in the components remaining work.

**Options**

1. Defer both; allow a later narrow shared-loop helper experiment.
2. Defer both with no follow-up.
3. Add motion and elevation facets now.

**Recommendation:** Option 1.

**Reviewers:** agree on deferral; Astra keeps the shared-loop follow-up.

**Answer:** agree, add as a follow up later

>

## Phased Plan

**Execution:** phases 0 to 4 ran as one change, with the D-14 answer replacing the two cohorts by the six-component
pilot and the D-17 and D-21 answers bringing the stroke and radius behavior changes forward from phase 7. Phases 5 and
6 follow as separate pull requests (D-15) and are tracked in the components remaining work. Phase 4's contract-skill dry
run has not been done; `references/agents/evals/cases/agentic-contract-traits-constant.json` describes it.

### Phase 0: Decisions and classification

**Deliverables**

- answers to D-01 through D-08 and D-14;
- D-17 classifications for the pilot components, without behavior changes;
- the bundle-budget method from D-12.

**Exit gate:** no unresolved contradiction can silently change pilot behavior.

### Phase 1: Vocabulary and checker

**Deliverables**

- the type-only vocabulary at the D-03 entry point, with an import-boundary test;
- checker support: exact frontmatter keys, duplicate rejection, CRLF normalization, the `traits` link, the
  syntax-only literal reader, and nullish rejection;
- invalid fixtures read as text;
- authoring and contract reference updates for the vocabulary;
- a changeset for design.

**Exit gate:** all 24 existing contracts still pass, invalid fixtures fail with clear messages, and bundle-size
scenarios show zero byte change.

### Phase 2: Typography cohort (Button, ListItem)

**Deliverables**

- traits constants written through the contract skill;
- `functionalTypography` in design `./styling`, bound at module scope;
- style-parity, cache, and type tests;
- inline-versus-helper and trait-versus-literal measurements with checked-in prototype inputs.

**Exit gate:** identical styles, one definition build per factory per theme state, and the D-12 budget met.

### Phase 3: Channel cohort (Tag, Button)

**Deliverables**

- channel, hover, and focus-visual facets for the cohort;
- split factories first; a converter option only if D-10 changes;
- the D-11 interaction-source benchmark;
- tests for preserved callbacks, preserved keyboard gating, and no eager envelope evaluation.

**Exit gate:** identical paint and behavior, and the D-12 budget met.

### Phase 4: Workflow integration

**Deliverables**

- contract and authoring skill updates;
- component and design reference updates, including the new `references/traits.md`;
- an eval case for writing and linking a traits constant.

**Exit gate:** `yarn check-agent-instructions` passes, and a dry run of the contract skill produces a valid constant.

### Phase 5: Incremental adoption

Adopt traits when a component adopts a trait-consuming helper or its contract changes. Run the decorative icon helper
experiment separately.

### Phase 6: Required gate

After the pilot shows payoff, require traits for new and substantively changed contracts. Retrofitting the catalog
needs separate justification.

### Phase 7: Separately authorized behavior changes

macOS hover, high-contrast feedback, Card or Badge divergences, and Fluent Large radius. Each needs contract re-review,
updated evidence, focused tests, per-platform native qualification, and a changeset.

## Validation Protocol

### Contract and tooling

```sh
yarn workspace @fluentui-react-native/components check:spec-contracts
yarn check-agent-instructions
```

Cover unknown, duplicate, and nested frontmatter keys; CRLF files; missing or wrong links; non-literal syntax; nullish
values; unsupported schema versions; and components without traits.

### Types and components

```sh
yarn test <component>
yarn build
```

Cover:

- TS2322, TS2353, and TS2741 cases for invalid constants;
- every affected appearance and independent axis;
- omitted versus false controlled props;
- user-style precedence and unrelated accessibility state;
- callback counts and event forwarding with hover paint suppressed;
- static versus interactive channels;
- text wrapping, scaling, and intrinsic-metric omissions;
- selected-label reservation.

Run platform-specific token checks with `FURN_RN_PLATFORM=<platform> yarn test <name>`.

### Cache and initialization

- one theme definition build per bound factory per `ThemeState`;
- separate bound factories for different trait configurations;
- no trait identity in per-render cache keys;
- no registry growth across instances or interaction changes;
- no eager color-envelope evaluation introduced by spreading.

### Bundle size

```sh
yarn bundle-size
```

Record raw bytes as the primary metric, plus gzip and retained modules, for the Button and catalog scenarios on macOS
and Windows. Compare inline with helper consumers and literal with trait-object arguments. Win32 has no esbuild
baseline. Measure Metro separately with a minimal consumer; do not infer Metro behavior from esbuild.

### Native qualification

For behavior a change touches, run each supported desktop target separately through the Storybook desktop workflow:
pointer hover and press, keyboard activation and callback counts, focus target and ring exclusivity, UIA and AX action
invocation, role and state projection, text geometry, and custom-theme and high-contrast behavior. Report passed,
failed, skipped, unsupported, and not run separately.

### Final acceptance

Run the owning packages' format, lint, build, and tests, add changesets, then:

```sh
yarn clean-lage-cache
yarn lage buildci
```

## Risks and Mitigations

| Risk                                                     | Mitigation                                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Trait values drift from contract prose                   | One source; contract review of the constant; contradictions treated as contract defects |
| A nested YAML block is silently ignored                  | Exact frontmatter keys; land a real parser before any nested block                      |
| `null` or `undefined` passes type checks                 | Checker rejects nullish values                                                          |
| Checker executes component code                          | Syntax-only parsing; fixtures read as text                                              |
| Shared factory returns another component's cached styles | One bound factory per immutable configuration                                           |
| Module-scope selection keeps both helpers                | Explicit imports for structural alternatives                                            |
| Literal arguments drift from the constant                | Conformance tests                                                                       |
| Helper exceeds the duplication it replaces               | Two-consumer pilots and measured budgets                                                |
| Omitted facet silently means feedback                    | Required hover with interactive channels; omission never means a default                |
| Hover suppression breaks callbacks or submenus           | Paint-only suppression; behavior tests                                                  |
| Focus mapping loses keyboard gating                      | Map onto existing options; Input and Dropdown tests                                     |
| Static channel still evaluates interactive envelopes     | Avoid building unused nodes; laziness tests                                             |
| Type entry point gains runtime code                      | `types.ts` lint rule and import-boundary test                                           |
| Drafts need types that do not exist yet                  | Vocabulary lands first; drafts request additions instead of defining local types        |
| Metro retention guessed from esbuild                     | Separate Metro measurement                                                              |
| Catalog retrofit churn before payoff                     | Incremental adoption; separate justification for retrofit                               |
| Traits and tests share the same wrong assumption         | Expected behavior written independently                                                 |

## Rejected Directions

Still rejected from round 1:

- a global runtime traits registry or interpreter;
- a complete `backgroundToken → foreground, stroke, disabled` function;
- a public vocabulary for accessibility or anatomy;
- a blanket "macOS has no hover" policy;
- immediate font-tree restructuring;
- a general border renderer;
- treating visible color inequality as the definition of interaction participation;
- generating implementation and expected tests from the same record;
- retrofitting every component before a pilot shows value.

Newly rejected in round 2:

- independently authored YAML values and constants;
- flattened trait-value keys in frontmatter;
- a generic `byAxis` refinement envelope;
- runtime domain arrays in design;
- importing or evaluating traits files in the checker;
- module-scope ternaries as the way traits select helpers;
- a single shared factory that receives different trait objects;
- traits in per-render cache keys or a separate traits cache;
- traits constants in `*.styles.ts` or `*.types.ts`, or exported publicly or as `_unstable`;
- Framework Base importing the traits type.

## Success Criteria

The traits effort succeeds only if:

- each component's trait values are set and reviewed during spec building and consumed by helpers without a second copy;
- the shared type adds zero runtime bytes and stays type-only;
- each adopted helper has at least two real consumers and meets the agreed bundle budget;
- reviewed contracts remain the behavioral authority;
- public APIs and `_unstable` pipeline contracts are unchanged unless separately reviewed;
- theme cache identity and color laziness remain correct;
- exceptions such as intrinsic text metrics, static channels, authored states, and private parts stay expressible;
- platform differences are explicit and natively qualified where behavior changes;
- missing evidence and open decisions stay visible instead of being hidden behind defaults.
