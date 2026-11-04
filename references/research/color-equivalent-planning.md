# Source-preserving Office, Fluent 2, and Flex theming plan

November 1, 2026. **Research and proposed implementation plan; no production mappings or runtime APIs changed.**
Reciprocal review reconciliation is recorded at the end.

## Objective and success criteria

Recalculate correspondence from source values and consumer semantics, **without existing mapping baselines**.
Office-backed agentic components must preserve the applicable host palette's colors; Fluent-backed Flex consumers
must preserve approved Win32 Fluent 2 presentation choices; genuine x3 Flex themes must retain their current output.

These are separate contracts: sharing a token vocabulary does not make Office, Fluent 2, and x3 the same design system.
Exactness applies only to explicitly covered source/component/slot/state/context combinations. Token-only
compatibility must never be advertised as source fidelity.

Success means a complete source inventory, reviewed consumer-specific mappings and loss records, optional theme
extensions with unchanged profile-free behavior, and native qualification before a fidelity release. Non-goals are
nearest-color mapping, a second provider, a general component-traits framework, font restructuring, implicit
component redesign, and synthesizing a recoverable OfficePalette from flattened Flex tokens.

## 1. Completed color value analysis

The reproducible catalogs and methodology are in `color-equivalents/README.md`.

| Artifact                                            | Measured scope                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `color-equivalents/office-color-values.yaml`        | 181 fields: 167 active in 58 families, plus 14 quarantined deprecated fields; 34 families have hover/pressed |
| `color-equivalents/fluent2-win32-color-values.yaml` | 87 color groups, four native appearances, 600 authored state values                                          |
| `color-equivalents/flex-color-values.yaml`          | 119 color keys, cool/warm x light/dark, including material colors                                            |
| `color-equivalents/specificity-analysis.yaml`       | Source hashes, equality classes, candidate relationships, provisional pair probes, public-type gaps          |

**Observed:** Office's four applications x four theme identifiers x three regions produce 48 effective contexts
and 8,688 field cells. Shared is a partial layer, not a fourth region. Values are reconstructed from
`office_colors.json` and `office_app_overrides.json`; the supplied layers cannot establish precedence for future
overlapping host exports. HC application contexts inherit Mso only as a snapshot reconstruction convention.
Retain every context identity even when complete palettes happen to have identical values.

**Observed:** Fluent inputs are the installed public
`@fluentui-react-native/design-tokens-win32@0.53.0/{colorful,black,darkgray,hc}/tokens-aliases.json`,
not web values, generated completed aliases, or existing Office conversion results. Missing states remain absent.
Selected, brandHover/brandPressed/brandSelected, and transparentStroke.disabled remain distinct.

**Observed:** Flex data comes directly from CSS pinned at `206e890b645fb450ad7c5df2ff981765349a2b58`.
Captured component usage cites `flex-1.5.0-206c4996` / x3 source `334d3b82`. These are different source records;
the similar prefixes do not establish revision equivalence. Reconcile affected component usage before promotion.
The 480 absent interaction-fallback cells are represented as null, not invented runtime values.

### Reading the evidence correctly

Office families contain state-ordered values, provenance rows, declared alternate names, and context-specific
equal-value observations. The only declared Office alternate names are TextSubtle, Accent, and AccentSubtle.
Resolved Fluent JSON does not expose its original reference graph. Equal hover/pressed values therefore remain
observations, not inferred authored aliases. State-specific Office columns are flagged for independent binding.

Hex normalization preserves alpha and transparent RGB. System names remain symbolic: `Window` may compare with
`PlatformColor(Window)`, but neither becomes an invented RGB value. Composited comparisons require a named backdrop,
layer order, and renderer assumptions. No contrast or perceptual-distance result is claimed by this catalog.

Every family has provisional Flex candidates or a no-direct-equivalent rationale. A candidate is not approval:
scalar collisions partly reflect the analyst's candidate choices. Whole-vector differences may reflect missing
or inapplicable states rather than a numerical mismatch. The report now separates authored rest-pair differences,
and explicitly marks a single-pair probe insufficient. Source values, not candidate guesses, are the baseline.

## 2. Specificity gaps and concrete witnesses

The following numerical evidence is independently reproduced from the source JSON; consumer bindings are cited
relative to `packages/agentic/components/src/components`.

| Gap                                  | Evidence                                                                                                                                                                                 | Required distinction                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Shared token, different control use  | Button secondary hover and subtle hover read `backgroundNeutralSubtle.hover` (`button/button.styles.ts`). Office Colorful TaskPane needs BkgCtlHover `#fff7f0` versus BkgHover `#d2d2d2` | Standard-action versus transparent-action presentation                                          |
| Static versus interactive foreground | Text and Button read foregroundNeutralPrimary. HC Text is WindowText, while TextRest is ButtonText                                                                                       | Static text versus control content, even when standard-scheme values agree                      |
| Equal rest, different interaction    | Mso Colorful emphasis fill is `#d83b01 / #a22c01 / #6c1e01`; on-switch fill is `#d83b01 / #ea6115 / #a22c01`                                                                             | Preserve both source identities; this alone does not prove a shared Flex-token collision        |
| Fluent HC breaks normal equality     | brandBackground and compoundBrandBackground1 normally share their triplet. HC rest is ButtonFace versus Highlight; brandBackgroundStatic uses Window                                     | Component role and source variant, not normal-color equality                                    |
| Region and composition               | Colorful TaskPane Bkg is `#e6e6e6`, BkgTextBox is `#ffffff`; on TaskPaneCard rest can agree while interaction differs                                                                    | Region surface versus control paint; transparent rest exposes parent, not an opaque copied fill |
| Parent and child interactions        | Colorful TaskPaneCard ordinary link rest is `#d83b01`, parent-hovered link rest `#6c1e01`                                                                                                | Parent context is independent of child hover/press                                              |
| Shared border keys                   | Button primary/secondary both use strokeNeutralTransparent, while Office provides separate StrokeCtlEmphasis/StrokeCtl families                                                          | Background/foreground/stroke bundles, not fill-only replacement                                 |
| Theme name is not region scheme      | VeryDark TaskPane is dark, but TaskPaneCard has Bkg `#d2d2d2`, Text `#262626`                                                                                                            | Preserve region and host variant; do not infer every role's scheme from the name                |
| Radius-token collision               | Button S/M/L uses base200/base300/base400; other inputs and surfaces share those tokens                                                                                                  | Scoped control-radius profile, not global radius mutation                                       |

**Observed:** `OfficePalette` declares 137 fields; 44 snapshot fields are absent, including 36 active fields.
The generated list includes text-entry, parent-context hyperlink, selected/inverse focus, stripe, scrollbar, and
badge roles. A TypeScript addition does not prove native delivery. Six deprecated legacy-Android fields remain
declared; do not add other deprecated fields just to reach 181.

**No universal counterpart:** selected-text foreground/background, parent-context links, stripe patterns,
notification semantics, slider buffer, scrollbar frame/gutter, fixed-brand and inverted contexts, and Fluent
severe/out-of-office families. Some can become specific presentation bindings; some lack consumers or require
component geometry changes. Do not equate a red notification badge with danger or substitute expression colors
for an absent semantic family.

**Presentation gates:** a filled checked checkbox, selected-tab indicator versus filled tab, Office inner focus
border versus universal focus ring, and an Office outline-button equivalent need component contract decisions.
The source metadata does not prove that Office has no possible checked rendering; it simply does not authorize
the initial checked-fill analogy. Keep absence of evidence distinct from evidence of absence.

## 3. Mapping method and promotion rules

1. Inventory actual FURN consumers as `(component, part, presentation, state path) -> token and interaction source`.
   Keep captured Flex intent, current FURN behavior, and V1 Win32 Fluent component bindings as separate evidence.
   Existing cross-system conversion tables remain excluded.
2. Resolve a source context: source system/version, host variant, region, application where known, and structured
   appearance. Unknown native metadata stays unknown. Do not conflate VeryDark with darkgray, WhiteColors with
   TaskPane, or region with interfaceLevel.
3. Assign source fields using documented semantics and approved component contracts, then inspect full
   bg/fg/stroke/focus/text-selection bundles. Validate every state the consumer actually reads.
4. Classify relationships as exact scoped equivalence; role-equivalent but source-valued; rest-equal/state-divergent;
   consumer-specific collision; applicability mismatch; composition/geometry mismatch; unavailable capability;
   or no semantic counterpart. Never choose by nearest hex value.
5. Promote a global token substitution only when all affected consumers agree within the declared scope.
   Otherwise add a narrowly named presentation role or retain the binding as unsupported. Selected/checked/mixed,
   disabled, focus, parent context, and interaction are independent axes.
6. Emit a reviewed binding ledger containing source paths, consumer evidence, scope, state availability, composition,
   fallback policy, confidence, decision status, and reverse losses. Require a witness for each claimed collision.

Represent state availability as authored value, authored reference, absent-in-source, not applicable,
unknown, or undelivered-by-host. Those states must not collapse into one null/default rule. Compatibility fallback,
when approved, is recorded separately from source evidence.

Keep Office and Fluent adapters one-way for fidelity. Reverse Flex-to-legacy projection remains explicitly lossy,
with canonical choices and omitted candidates recorded. Do not promise Flex-to-Office reconstruction.
Equal fields may share generated constants for storage, never semantic selectors or independent override identity.

## 4. Proposed theme extension

**Recommendation:** optional, data-only presentation bindings and scoped shape settings beside tokens.
Keep generic Flex tokens for unambiguous uses. Admit each additional role only with a real consumer and a
specificity witness. Use a small declaration-backed vocabulary, not arbitrary selectors and not a prematurely
frozen universal control taxonomy.

Illustrative architecture, not a final TypeScript API:

```ts
type ColorBinding = { token: SemanticColorName; state?: 'rest' | 'hover' | 'pressed' } | { value: ColorValue };

type PaintBundle = {
  background?: ColorBinding;
  foreground?: ColorBinding;
  stroke?: ColorBinding | 'no-stroke';
};

type Presentation = {
  states: { rest: PaintBundle; hover?: PaintBundle; pressed?: PaintBundle };
  disabled?: PaintBundle;
  focus?: { inner?: ColorBinding; outer?: ColorBinding };
  textSelection?: { background: ColorBinding; foreground: ColorBinding };
};

type ThemeProfile = {
  presentations?: Partial<Record<ReviewedPresentationId, Presentation>>;
  rounding?: Partial<
    Record<
      ReviewedShapeRole,
      {
        small: RadiusReference;
        medium: RadiusReference;
        large: RadiusReference;
      }
    >
  >;
};

type ExtendedFlexThemeDescription = {
  tokens: FlexTokenDescription;
  colorTone?: ColorTone;
  profile?: ThemeProfile;
};
```

`ReviewedPresentationId` denotes a semantic presentation/part, not a component import. Start with standard action,
emphasis action, transparent action, and static/control text distinctions. Admit switch, text-entry, selection and
other presentations as evidence warrants. Selected/checked/parent combinations select presentations through the
component's existing state logic; do not create a second interaction state machine.

Design owns structural types, validation and resolution. Components own anatomy, states, role selection and default
bindings. Source adapters emit normalized data. No generic component knows an Office field or Fluent alias name;
design never imports components. A declaration mechanism and naming ownership are an API gate, not implemented here.

### Explicit source colors and paired remapping

Default token references reuse existing lazy InteractiveColor objects where possible. Mixed-state references support
real behavior such as transparent rest but subtle hover. Office/Fluent literal bindings never invoke x3 derivation.
Do not introduce a blanket `explicit` mode that silently makes every missing state rest: only approved compatibility
fallbacks can do that. Missing required states block that presentation's exactness claim.

Loud-to-Heavy and subtle-to-soft are scoped presentation choices. Replace the coherent bg/fg/stroke bundle and
review its disabled/focus/interactions, not just its fill. A universal preset inferred from background weight is unsafe:
cross-role tokens and consumer-specific strokes have exceptions. A bounded, reviewed preset may expand to a complete
bundle later. Button already uses BrandHeavy; Loud-to-Heavy is a requested capability, not a diagnosed current bug.

### Rounding

Preserve current Flex S/M/L token references by default. Allow an action-control shape override without changing
global base200/base300/base400. V1 Win32 Button supplies evidence for a 4/4/4 rounded-button profile; it does not
establish every input/surface radius or Office's intended values. Explicit square/circular component shapes win,
and focus geometry follows the effective radius. Broader item/surface/indicator groups require separate evidence.

### Authoring, merge, revisions, and compatibility

Keep existing token recipes and their callback arguments unchanged. Prefer an explicitly branded full-theme recipe
for ordered token/profile patches. Prototype parent-profile inheritance, source overrides, ordered patches, reset,
and `update` behavior before freezing its signature. A constructor-only alternative needs documented update limits.

Merge maps by reviewed presentation ID, replacing an individual presentation atomically. Partial scope means
changing selected IDs, not retaining stale hover colors under a new rest. Merge S/M/L shape members deliberately.
`undefined` means no override; removal needs an explicit reset semantic. Profile-free descriptions preserve behavior.

Resolve full descriptions for the selected appearance without weakening today's complete-token contract.
Any new function-valued full-description API must cover HC/elevated selection and prove compatibility; do not
casually widen `tokens` to a function in isolation.

Keep one provider and current source kinds. `legacy` versus `flex` is authoring model, not design identity.
Optional identity/provenance metadata is diagnostic only; styles must not branch on system or host theme names.
Region is a distinct source/configuration boundary, not elevation. Application may already be implicit in a live
host palette; catalog axes do not automatically become public provider props.

Caches remain external and keyed by source, revision, resolved appearance. Profile-only, host-variant and region
updates invalidate even when color scheme stays unchanged. Every new ThemeState owns a fresh style registry.
Author-owned data is immutable; resolving/merging/rest-reading must not derive interactive colors. Old custom
token-only sources remain valid, with compatibility defaults. Optional ThemeState profile access avoids breaking
existing object literals. Preserve parent revision synchronization with and without active subscribers.

Provider behavior is source-dependent: legacy providers resolve their authored Theme; Flex providers resolve
neither model eagerly. Each hook constructs only the model it returns. Keep source payloads, native acquisition,
legacy projection, and compositing out of the modern root graph except existing allowed dependencies.

**Mixed-tree gate:** `legacyFallback` alone does not guarantee original Office colors under a Flex source:
the existing reverse projection overlays mapped Flex values after the fallback. Preserve original legacy sources
or explicit boundaries during rollout. Any source-preserving projection mode needs a separately reviewed precedence
contract and V1 tests; do not silently change existing projection authority.

**Preferred first transport after reciprocal review:** add an optional source-level profile resolver for both
authoring kinds, using the same cached authored snapshot as token/Theme resolution. Existing custom sources need
not implement it. Enhance existing Office legacy producers first: V1 receives its original Theme, while agentic
consumers receive compatible generic tokens plus qualified presentations. Avoid duplicate palette acquisition
and reverse projection in mixed trees. New Flex-native producers remain opt-in, not the only fidelity path.
Reading initial native constants again is not current-state recovery after missed host events; that remains a
native capability gate.

Design owns the source-neutral identifier namespace; consumer contracts declare use and validate slot/state schemas.
Avoid component type imports, module-augmentation dependency cycles, mutable registration, and arbitrary role ceilings.
Checked-on/off and selected/unselected presentations each retain their own disabled and focus bundles. Office
Colorful TaskPaneCard disabled-off track/thumb is `#ffffff / #d2d2d2`, versus disabled-on
`#d2d2d2 / #ffffff`: one shared disabled branch cannot represent both.
Source-native literals are context-resolved ColorValue values, not tuples selected again by a region heuristic.
Ready-made authoring may select tuples before profile resolution. Preserve authoritative host scheme and explicit
paint for light islands; do not infer a new per-region scheme solely from luminance.

## 5. Phases, ownership, and gates

| Phase                           | Owner                                          | Deliverable and exit gate                                                                                                                                                                                                      |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0 Evidence                     | Design research + component owners             | Reconcile source pins; extract consumer/slot/state inventory; validate V1 Fluent bindings; finish column-level candidates. No provisional analogy promoted without evidence                                                    |
| P1 Host qualification contract  | Win32 theme + Office native owners             | Confirm palette names, application/region association, White/VeryDark/DarkGray relation, active field availability, HC symbols, structured appearance and update behavior. Distinguish missing types from missing exports      |
| P2 Binding ledger               | Design + component owners                      | Approve exact scopes, no-equivalent cases, presentation/geometry gates and reverse losses. P0 prerequisite; Office entries also need P1 for live claims                                                                        |
| P3 Theme API                    | Design                                         | Prototype profile/types/authoring/merge/cache/accessor; update package references and changeset. P2 supplies minimal role evidence; profile-free and token-only sources remain unchanged                                       |
| P4 Pilot consumers              | Components                                     | Text and Button first, then switch/input and selection controls. Reviewed component contracts precede source changes. Exact x3 default-state parity and source-backed bundles required                                         |
| P5 Source themes                | Design themes + win32-theme                    | Existing legacy producers gain optional same-snapshot profiles; opt-in Fluent Flex description and later Office Flex source. P3 and corresponding P4 consumers required; capabilities and appearance selection remain explicit |
| P6 Native release qualification | Office/Win32 + accessibility + desktop testing | Compare actual host/native controls, HC, source changes and mixed trees. P1/P5 required. Publish supported matrix and exclusions before fidelity claims                                                                        |

P1 can proceed in parallel with P0. Fluent-only work can proceed while Office host evidence is blocked, but neither
lane bypasses its consumer contracts. Extend beyond pilots only after the role design demonstrates value.

Exact mode rejects missing required capabilities for the requested presentation, with a precise diagnostic.
It need not reject unrelated supported components. Explicit compatibility mode may use documented whole-bundle
fallbacks, marks them uncovered, and makes no exactness claim. Production failure behavior needs owner approval.

Rollout is additive and opt-in. Removing a profile restores existing token-only behavior. Leave existing
`createOfficeTheme`, `fluentTheme`, and reverse projection semantics intact until migration is separately approved.
For implementation, keep unfinished package work indexed in design's `references/remaining-work.md`; do not
create a competing package PLAN.md.

## 6. Validation and unresolved decisions

Implementation gates:

- Reconstruct every Office snapshot cell and every raw Fluent authored state; preserve original symbolic names.
  Verify all Flex contexts and consumed fallback variables, not just the union of keys.
- Exact equality for covered bundles; independently assert source-to-consumer semantics so expected values are
  not generated solely from the mapping under test.
- Unchanged x3 style output for cool/warm x light/dark and all supported component states. Test selected+hover,
  checked/mixed, disabled, focus, parent-hover/selected, and text selection independently.
- Profile-only invalidation, nested resets, immutable inputs, token-only custom sources, lazy conversion and
  zero source-native derivation. A derived state computes once; a rest-only path computes none.
- Bundle graph and measured size/time/allocation comparisons, including legacy-only and Flex-only entry points.
- Native Office/Win32 host updates, qualified regions/application overrides, actual HC palettes, border/focus/radius
  geometry, and composed colors. JavaScript equality is not native or accessibility certification.
- Contrast uses actual adjacent/composed colors and applicable text/non-text criteria. Report source-inherited
  failures separately; preserving them does not establish accessibility conformance or permit silent recoloring.
- Owning package scripts, mapping consistency, consumer tests, and cache-cleared buildci; changesets and reference
  updates accompany production API changes.

| Decision gate                               | Blocks                  | Evidence/decision needed                                                                              |
| ------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| Source pin reconciliation                   | Mapping promotion       | Re-extract relevant usages at the pin, or approve and document mixed-version evidence                 |
| Host fields and identities                  | Exact Office source     | Live export/version evidence, named palette association and structured updates                        |
| Role declarations and authoring/reset API   | Theme API               | Pilot prototypes and ownership agreement; reject open-ended selectors and arbitrary role-count limits |
| Missing-state and unsupported-field policy  | Exact release           | Explicit exact versus compatibility semantics                                                         |
| Fluent black/darkgray/HC/elevated selection | Fluent theme product    | Owner selection; no inferred identity from names                                                      |
| Checked/selected/focus geometry             | Affected components     | Component contract review; color-only theming cannot resolve structural differences                   |
| Office and non-Button rounding              | Shape fidelity          | Authoritative measurements/design approval                                                            |
| Mixed V1/agentic projection                 | Shared source migration | Tested precedence and source preservation                                                             |

Stop a binding's promotion when required states, host capabilities, provenance, or component ownership remain
unresolved. Stop API rollout on eager derivation/conversion, stale style caches, forbidden bundle edges, or
changed profile-free behavior.

### Execution evidence

Catalog regeneration/check and seven independent reconstruction/state tests passed. Repository formatting passed
after formatting the supplied planning seed. Cache-cleared buildci passed 122 tasks but failed the Storybook
test task on unrelated timeouts. Its retry reduced this to one sourceConfig child-process timeout; the isolated
`yarn workspace @fluentui-react-native/storybook-desktop test sourceConfig` passed both tests.
The final `yarn lage buildci` passed: 8 tasks executed, 168 reused successful cache results, zero failed/pending/aborted.
`node references\research\color-equivalents\catalog-colors.mjs --check` and
`node --test references\research\color-equivalents\catalog-colors.test.mjs` passed after catalog corrections.
Native qualification and contrast validation were not run.

## 7. Reciprocal review provenance and reconciliation

The independent reports used `gpt-6-astra` and `claude-opus-5.5`, each with `max` reasoning and `long_context`.
Both received the same source-first brief after catalog generation, without access to the other's initial report.
Complete reports are preserved under session `1e16c2bc-addc-46a6-8281-5fadb9b17019`:
`astra-independent.txt`, `opus-independent-head.txt`, and `opus-independent-tail.txt`.
Opus's initial delivery began mid-report; its missing beginning was recovered in the same thread before cross-review.

Both original threads reviewed the complete peer report. Exact reviews are retained as
`astra-reviews-opus.txt` and `opus-reviews-astra.txt` in the same session artifacts.
The following dispositions resolve substantive differences:

| Disagreement or correction                                           | Disposition and evidence                                                                                                                                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eight closed roles versus arbitrary presentation IDs                 | Bounded design-owned semantic namespace, validated consumer declarations, evidence-driven refinements; no arbitrary eight-role limit                                                     |
| Global explicit mode means omitted state equals rest                 | Rejected by both reviews. Source-native states never derive; required missing states remain detectable; fallback requires explicit evidence/policy                                       |
| Silent downgrade versus render failure                               | Exact mode validates required capabilities per requested presentation/revision; compatibility falls back by whole bundle and exposes downgrade. Production default remains an owner gate |
| Constructor-only options versus theme recipes                        | Prefer branded ordered full-theme patches with parent inheritance and explicit resets, preserving token-recipe signatures; prototype before approval                                     |
| New Office Flex source versus preserving V1                          | Prefer same-snapshot profiles on existing legacy producers first. No global reversal of reverse-projection precedence                                                                    |
| Universal selected/disabled/focus role                               | Rejected: disabled-on/off track/thumb and HC selected-focus witnesses require qualified presentations                                                                                    |
| Fill-weight preset determines every foreground/stroke                | Rejected as universal. Tag/Button foreground exceptions and Fluent borders require role-specific complete bundles                                                                        |
| All rounding unknown                                                 | Fluent V1 Button supports 4/4/4; Office and other component shapes remain unqualified                                                                                                    |
| Parent-context link as first pilot                                   | Deferred: there is no current agentic Link consumer. Keep catalog evidence; a new component requires its own contract gate                                                               |
| 48 contexts versus 34 distinct complete palette vectors              | Both counts are valid and reviewers independently reproduced 34 vectors. Deduplicate storage if useful, but preserve all 48 source-selection/context paths                               |
| Checked Office presentation absent; dark links cannot be brand roles | Narrowed to insufficient ownership evidence. Different values do not disprove semantics; actual consumer conflicts do                                                                    |
| Every unchanged binding must preserve object identity                | Direct references preserve identity; mixed-state envelopes instead prove output equality, laziness and precedence                                                                        |
| Providers resolve nothing                                            | Corrected: legacy providers resolve authored Theme; neither source eagerly converts the unrequested model                                                                                |
| Source-inherited contrast failure passes accessibility               | Rejected. Mapping-regression and accessibility qualifications are independent                                                                                                            |

Fluent component HC bindings can bypass aliases: V1 Button uses ButtonFace/ButtonText where raw
neutralBackground1/neutralForeground1 contain Window/WindowText. The binding ledger must record component-owned
PlatformColor evidence separately; never fabricate alias equivalence merely to obtain the desired symbol.

Both reviews verified all eight relevant pinned CSS blob hashes. Review-driven catalog corrections include the
34 interactive-family count, applicability-aware rest comparisons, explicit insufficient-pair status, removal of
the unsupported BkgCtlSubtle-to-BrandHeavy candidate, correction of StrokeOver's HC rationale, and separate
state-column qualification flags. These changes do not approve any production mapping.
