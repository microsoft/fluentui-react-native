# Design package reorganization and evolution

**Status:** Proposed; documentation only. Owner-approved decisions below supersede the initial review recommendations.
Only the remaining implementation gates require further decisions.

**Scope:** Reorganize `@fluentui-react-native/design`, add tone-aware appearance, separate Flex policy from color
algorithms, and introduce authored and resolved interactive colors with verified Flex defaults. Preserve legacy
theming consumers, including consumers outside this repository. Modern/Flex authoring changes are intentionally
breaking and require a coordinated migration.

This owner-requested review draft is a narrow exception to R-PKGDOC-009. [Remaining work](references/remaining-work.md)
remains the package's open-work index; it should point here rather than duplicate the implementation checklist. Once
implemented, move the durable contract into the owning references and remove this draft and its pointer. This draft
is repository-only, not part of the published package inventory.

## 1. Success criteria and compatibility boundary

- Flex implementation belongs in `src/flex/`; legacy Fluent implementation in `src/fluent/`; shared types in
  `src/types/`; test and validation collateral in `src/test/`.
- One `ThemeProvider` continues to serve both authoring models. A Flex provider publishes metadata without resolving
  either model; hooks construct only the model they return. Legacy raw-context behavior remains supported.
- Existing legacy packages, exported names, public subpaths, constructors, recipe behavior, context identities,
  deprecated appearance APIs, and legacy-authored values remain compatible.
- `ColorTone` is `'cool' | 'warm'`, defaults to `'cool'`, and participates in top-level appearance and every applicable
  cache identity. No OS tone signal or `'system'` tone is invented.
- Interactive colors have distinct input and output contracts. Explicit states win; missing supported states are
  calculated lazily and automatically for Flex consumers, at most once per state and resolved entry. Unmappable rest
  colors fall back to that same rest value. No author-owned object is mutated.
- Default Flex values use current x3 sources, pinned to an immutable revision when refreshed, with an explicit native
  adaptation ledger. Omit hover/pressed defaults wherever the dynamic APIs reproduce them from `[light, dark]` rest
  colors. Mapping coverage, value parity, algorithm conformance, and contrast are separate checks.
- The modern Flex graph includes the raw algorithms needed for automatic interaction colors, but remains free of
  legacy projection/default payloads and test helpers. Legacy Fluent consumers retain their existing graph and
  behavior; the engine is not injected through shared provider utilities.
- Close the non-color gaps, including missing motion/spacing roles and layered/dark shadows, without changing legacy
  Fluent types.
- Consumer code, generated mappings, component token references, authoring instructions, and migration examples
  change together. No component interaction or accessibility redesign is included.

### Confirmed legacy and Flex ownership

**Confirmed by the owner:** legacy consumers use legacy Fluent themes and the existing legacy provider entry points.
Preserve `ThemeReference`, legacy platform factories, raw `ThemeContext`, compatibility packages, and their existing
values. The Flex refactor must not change those consumers. No additional provider is required.

Agentic/Flex consumers are in rapid development: adopt current x3 values, including intentional visual changes, without
an opt-in historical preset or a separate default-activation approval. Do not gate those changes on preserving legacy
visuals beneath an implicit Flex root; that is not the legacy consumption model in scope.

If an application deliberately mixes legacy consumers with a Flex-authored source, keep mapped Flex values
authoritative in its legacy projection. Do not introduce author-touched-path side channels or historical palette
overlays to make the two hooks disagree about the selected source.

## 2. Evidence and work that must be reconciled

The baseline inspected for this proposal is `cfa4c66257b7a00d9d828c81da7c36d2e0043c5b`.
**Observed** describes that checkout or an explicitly identified verification. **Proposed** describes future behavior;
it is not an implementation claim.

| Observed surface                                                                        | Evidence in this package                                                                                                                                                 | Consequence                                                                                            |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Shared providers and consumption-time conversion already exist                          | `src/theming/ThemeProvider.tsx:19-53`, `src/theming/themeRuntime.ts:17-72`, `src/theming/useTheme.ts:16-46`                                                              | Preserve the architecture rather than adding another provider                                          |
| Appearance keys currently have three axes                                               | `src/theming/appearance.types.ts:1-39`, `src/theming/appearance.ts:16-81`                                                                                                | Tone must reach normalization, interning, reference caches, state caches, and legacy projection caches |
| Rest values and partial `color.hover`/`color.pressed` maps are separate                 | `src/tokens/flex.types.ts:208-281`, `src/theming/flexThemeReference.ts:22-45`                                                                                            | The new model changes types, merge rules, mappings, styles, tests, and consumers                       |
| Every appearance starts from the same hand-authored default table                       | `src/tokens/defaultTokens.ts:69-392`, `src/theming/flexThemeReference.ts:137-143`, [open defaults work](references/remaining-work.md#appearance-specific-default-tokens) | Reformatting that table does not establish x3 correctness                                              |
| color-lib owns Flex classification and bulk token operations                            | `src/color-lib/interaction.ts:26-125`, `src/color-lib/interaction.ts:172-194`, `src/color-lib/interaction.ts:255-316`                                                    | Separate semantic policy from numerical algorithms                                                     |
| Pairings and contrast audits are already test-only                                      | `src/testing/color-validation/pairings.ts:15-21`, `src/testing/color-validation/validation.ts:1-35`                                                                      | Relocate their ownership, not duplicate them in Flex runtime                                           |
| Reverse projection has canonical collisions, transforms, and legacy fallback precedence | `src/theming/compat/themeFromFlexTokens.ts:75-110`, `src/tokens/mappings/flex-token-map.yaml:74-99`                                                                      | Preserve these policies while regenerating paths                                                       |
| Bundle assertions match current directory substrings                                    | `apps/bundle-size/scenarios.json:14-52` in the repository                                                                                                                | Update positive and negative assertions with moves, or they become vacuous                             |

There is overlapping, unlanded default-theme/codegen work for #4263. Before implementation, inspect its actual branch
and reconcile reusable legacy-payload generation, appearance selection, and bundle evidence. Its platform-derived
Flex defaults are not proof of x3 parity and are not present merely because a workstream records them. Do not build a
second competing generator or merge that work blindly.

### Demonstrated duplication

| Candidate                                                                                                              | Proposed treatment                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Guarded object-path traversal in `src/utilities/objects.ts:8-57` and `src/theming/compat/themeFromFlexTokens.ts:22-63` | Share the traversal primitive; preserve distinct overwrite and missing-value policies                          |
| Interactive membership in types, runtime arrays, YAML state mappings, and fixtures                                     | Derive or validate membership against one canonical mapping inventory; retain independent value fixtures       |
| Public `ThemeState` and internal `RuntimeThemeState` structure                                                         | One type-only definition in `src/types/`; no new runtime dependency cycle                                      |
| Similar partial-color inputs and duplicated conformance-color test setup                                               | Use the new authored-input contract and a shared test-only fixture builder                                     |
| Repeated warm reference-backdrop constant                                                                              | Keep one algorithm-owned constant, not a semantic-token lookup                                                 |
| Revision/appearance cache boilerplate                                                                                  | Normalize keys centrally; extract storage mechanics only if it keeps modern and legacy runtime graphs separate |

Do not merge `ThemeReference` and `FlexThemeReference` just because they have similar caches. Do not pool every color
literal or generated payload into one eagerly reachable module without measured bundle evidence. Preserve existing
root versus legacy meanings of similarly named font types instead of renaming a legacy API during this move.

## 3. Target ownership and dependency direction

```text
src/
  types/                       Shared, type-only appearance, color and state contracts
  theming/                     Shared providers, boundaries, appearance sources and runtime identity
  flex/
    tokens.types.ts            Authored and resolved Flex contracts
    flexThemeReference.ts      Modern source and recipe resolution
    colors/                    flexColor, lazy resolution, token classification and metadata
    defaults/                  Provenance-bearing generated defaults and native adaptations
    adapters/                  Lightweight legacy Theme-to-Flex conversion
    styling/                   Flex-aware color style factories
  fluent/
    types/                     Legacy Theme, palette, typography and shadow contracts
    themeReference.ts          Legacy authoring and merge behavior
    useTheme.ts                Legacy consumption
    compat/                    Reverse projection and complete legacy defaults
    tokens/                    Legacy alias, shadow and global payloads
    styling/                   Legacy token builders and themed stylesheet
    ...                        Legacy pipeline helpers and platform utilities
  color-lib/                   Raw parsing, conversion, compositing and interaction algorithms
  styling/                     Shared state/style utilities and public styling facade
  tokens/
    mappings/                  Existing canonical YAML, projections and upstream pin
    ...                        Existing generated platform global entry points
  test/
    fixtures/                  Mock themes and conformance fixtures
    color-validation/          Pairings, bulk audits and contrast validation
  utilities/                   Small, genuinely shared runtime primitives
```

Keep `src/tokens/mappings/flex-token-map.yaml` at its current canonical path during this work. Its location is embedded
in scripts, rules, contracts, and source references; moving it is not required to move Flex runtime ownership. Treat
generated platform globals separately from semantic Flex defaults. Move platform variants and their platform-specific
tests together.

**Allowed dependencies:** shared types are runtime-free; raw algorithms depend on shared types, not Flex token names;
Flex runtime uses the necessary raw interaction algorithms, shared utilities, and generated defaults automatically.
Shared theming selects the appropriate consumption path without installing a color engine on the legacy path; legacy
consumption may reach complete legacy defaults. The modern forward adapter can reference legacy types without loading
legacy runtime payloads. Test helpers can depend on production code; production cannot depend on `src/test/` or the
public `testing` entry point.

Physical folders need not become public subpaths. Preserve explicit, named entry-point exports; do not introduce
`export *` barrels, global engine registration, or a second source of theme truth.

### Public entry-point preservation

Retain every current export-map key and its `types`, `react-native`, `import`, and `default` resolution semantics:

```text
.
./theming
./theming/legacy-source
./theming/compat
./theming/compat/defaults
./tokens/global
./tokens/legacy
./color-lib
./styling
./styling/stylesheet
./styling/tokens
./testing
./package.json
```

Entry-point targets may follow moved implementations, or remain thin named facades. Do not produce separate contexts,
constructors, or mutable singletons through old and new entry points. Retain the six compatibility packages documented
in [Entry points](references/entry-points.md); inventory actual exports as well as documentation, including
`hcAliasTokens`.

Compatibility covers supported package specifiers, not arbitrary private `src/` or `lib/` deep imports. Inventory such
imports before moving files and document this distinction. Modern root and color-lib API changes must be called out
explicitly; retaining a subpath does not imply preserving every modern signature behind it.

## 4. Appearance and ColorTone

**Proposed shared type:**

```ts
export type ColorTone = 'cool' | 'warm';
```

Add `appearance.colorTone` to the existing top-level appearance configuration accepted by theme sources,
`ThemeProvider`, and `ThemedRoot`. Resolved modern appearance always has a concrete tone. Omitted tone means cool,
with no platform listener or automatic tone inference.

Tone precedence is explicit provider/root override, then source option, then the configured fallback tone, then cool.
An inheriting `ThemedRoot` retains the enclosing request; an explicit theme starts a complete boundary, as today.
Keep scheme, contrast, and interface-level precedence unchanged. Preserve the distinction between an omitted tone
request and an explicitly requested cool tone until fallback resolution.

Legacy-facing functions must continue accepting existing three-field appearance literals. Normalize missing tone at
the boundary rather than making every external `ResolvedThemeAppearance` argument suddenly require a fourth field.
Keep `colorTone` optional on the existing exported compatibility type, and introduce a strict normalized modern output
type. Widening function parameters alone does not preserve external declarations of the old type. Compile
representative external-style calls before finalizing the new name. Do not add tone to the old `AppearanceOptions`
union. Its reverse conversion remains intentionally lossy.

Update request keys, resolved interning, source/reference caches, compatibility-default caches, `ThemeState`, recipes,
and style registry identity. Preserve existing cool `themeAppearanceKey` strings if that exported utility's consumers
depend on them; a distinct warm suffix can distinguish tone without changing historical cool keys. Missing and explicit
cool inputs must converge on the same resolved identity.

A tone-only transition selects a distinct state without mutating the previous one. Returning to a previously resolved
appearance may reuse its state within the same revision; every new state owns a fresh style registry. `update()` and
`invalidate()` still replace all revision-scoped entries. Raw legacy-context boundaries retain their current boundary
semantics: absent tone resolves to cool rather than introducing new inheritance across an implicit legacy boundary.
Cover that behavior explicitly.

Rename the raw interaction option from `variant: 'default' | 'bebopWarm'` to `colorTone: 'cool' | 'warm'`.
The vocabulary-only change must preserve numerical behavior and the warm reference-backdrop solve. Separately
reconcile any algorithm changes needed to reproduce current x3 sources rather than freezing the older pin's output.
Palette selection and interaction algorithm selection use the same resolved tone. Verify warm provenance alongside
cool; freshness is approved, but unverified values are not.

## 5. Authored and resolved Flex colors

### Public contracts

Use the requested input/output split. Accept readonly tuples as well as ordinary tuples so `as const` authoring works;
the package must not mutate either.

```ts
import type { ColorValue } from 'react-native';

export type ColorTuple = readonly [light: ColorValue, dark: ColorValue];
export type ColorEntry = ColorValue | ColorTuple;
export type InteractiveColorType = 'standard' | 'inverted' | 'fixed';

export type InteractiveColorOptions = {
  rest: ColorEntry;
  hover?: ColorEntry;
  pressed?: ColorEntry;
  type?: InteractiveColorType;
};

export type InteractiveColor = {
  readonly rest: ColorValue;
  readonly hover: ColorValue;
  readonly pressed: ColorValue;
};

export declare function flexColor(value: ColorEntry | InteractiveColorOptions, colorType?: InteractiveColorType): InteractiveColorOptions;
```

`flexColor` is a small, pure input normalizer. Its second argument defaults to standard; an explicit
`value.type` wins. It does not resolve appearance, derive colors, or attach caches to its argument. Recognize tuples
and option objects with precise guards; opaque native color objects are leaves, not option bags.

**Selected output scope:** every Flex color resolves to an `InteractiveColor`, giving consumers and generated
projections one `.rest/.hover/.pressed` access pattern. Every color accepts `ColorEntry | InteractiveColorOptions`.
Keep the canonical interaction-eligibility inventory separate: ineligible tokens expose explicit states when supplied,
otherwise equal rest values and never run derivation. A uniform envelope does not make a disabled, focus, fixed, or
decorative role newly interactive.

Default definitions and legacy adapters explicitly provide the correct inverted metadata for existing heavy/loud/
onloud roles. Do not silently override the documented standard default of a newly authored `flexColor` entry by
guessing from its name. Export token-aware classification from the Flex implementation for callers that need it.
Keep interaction eligibility, inversion, and fixed behavior separate.

### Resolution rules

1. A single `ColorValue` applies to either scheme. A tuple selects light at index zero and dark at index one.
2. Explicit hover and pressed values are authoritative independently, including native values. Only `undefined`
   denotes absence.
3. Rest is available without executing interaction algorithms. Each omitted state gets its own lazy, memoized getter;
   pressed derives from rest, never from hover. Reading one state must not calculate the other.
4. Standard and inverted use the reviewed scheme-dependent direction rules. Fixed promises a scheme-independent
   derivation policy, but the current implementation does not define one. For derivable literals, require explicit
   fixed states until that policy has authoritative evidence and review; do not silently choose light-mode mathematics
   or equate fixed with disabled. The unmappable, ineligible, and high-contrast rest-fallback rules still apply.
5. In high contrast, explicit states remain authoritative and missing states deliberately resolve to rest rather than
   applying standard/warm fallback math. Light/dark tuples do not encode high-contrast or elevated alternatives;
   appearance-aware defaults, bases, or recipes supply those.
6. If the selected rest value is `PlatformColor`, another opaque/dynamic native color, or any other value the raw
   parser cannot map, an omitted hover or pressed state returns that exact rest value directly. This is an approved
   resolution policy, not an error, warning, or requirement to supply explicit states. Preserve native object identity
   and do not inspect or fabricate channels. Explicit states still win. Direct raw APIs retain their structured
   unresolvable results for callers and test audits that need them.
7. Cache only package-owned normalized descriptors and resolved entries. Frozen output envelopes may hold memoized
   state in closures. Never mutate or freeze caller-owned native objects.

An authored dynamic native color can still follow the OS appearance rather than a forced theme scheme. Document that
distinction and recommend explicit scheme tuples where the author needs theme-controlled selection.

### Automatic dynamic colors for Flex

**Confirmed by the owner:** Flex consumers receive the dynamic interaction APIs automatically. The Flex resolver
synchronously imports and calls the required raw algorithm modules; no source-level deriver option, extra author
import, provider setting, registration, or missing-engine error exists. The public `/color-lib` entry point remains
available for direct algorithm use, but it is not an opt-in requirement for theme authors.

Keep evaluation lazy even though the necessary code is bundled. Provider mount, rest reads, and explicit state reads
must not calculate omitted states. Omit each generated default hover/pressed value independently when the built-in
algorithm can reproduce the current x3 reference from the selected rest color, scheme, tone, and token metadata.
Author concise `[light, dark]` rest tuples; keep an explicit state only for a genuine source exception or another
non-derivable authored override. Unmappable rest values need no duplicate interaction fields.

This intentionally changes the old modern-root color-lib exclusion, not the legacy API contract. Update the design
package invariants, contributing guidance, and bundle scenarios when implementing it. Keep unrelated color utilities,
test audits, and legacy payloads out of the Flex graph where tree shaking permits; do not hide the added algorithm
cost behind a lazy getter claim.

Use the raw API's structured unresolvable result for the approved rest fallback. Do not broadly catch unexpected
algorithm errors and turn them into rest values. Invalid authoring inputs and unsupported fixed-literal semantics
still require explicit errors; native/unmappable colors do not.

### Merge and recipe rules

Color tokens are atomic replacement leaves. A replacement requires rest; omitted interactions belong to the new rest
and must not inherit stale explicit states from an earlier layer. Arrays and opaque colors also remain atomic.
`undefined` means no override. Preserve existing non-color merge behavior unless a separately reviewed requirement
changes it.

Keep defaults, base, and recipe ordering. Recipes receive accumulated readonly authored descriptions plus normalized
appearance; merge those descriptions before producing resolved getter objects. Parent references supply their
descriptions internally, not appearance-bound outputs. Provide a small pure selector for authored rest/explicit tuple
values where recipes need an appearance-specific value. This is an intentional modern recipe API break and needs a
worked migration.

Do not accept resolved `FlexTokens` as ordinary authoring input or pass resolved entries through generic deep merge,
spread, `Object.assign`, or serialization. Own enumerable getters are invoked by `Object.assign`; copying a getter
does not preserve its laziness. A `WeakSet` brand alone cannot prove that an entry's captured appearance, revision,
algorithm policy, and token context are valid for reuse. Do not add that hidden coercion layer.

## 6. Raw algorithms, Flex policy, and test collateral

| Responsibility                                                                                        | Owner                                                                                         |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Literal parsing, RGBA/OKLCH conversion, compositing, contrast math, cool/warm interaction transforms  | `src/color-lib/`                                                                              |
| Interactive token membership, deep/inverted classification, semantic background/stroke policy         | `src/flex/colors/`                                                                            |
| The `InteractiveColorOptions` resolver and lazy `InteractiveColor` envelopes                          | `src/flex/colors/`                                                                            |
| Default foreground/background pairings, WCAG audits, bulk fixture generation, known conformance cases | `src/test/`                                                                                   |
| Mathematical reference backdrops required by the warm transform                                       | Raw algorithm, passed generic compositing intent; not test pairings or semantic-token lookups |

Raw functions accept numerical/color inputs, state, scheme, tone, direction, and genuinely required compositing
context; they do not inspect Flex token spelling. The Flex resolver uses those functions automatically and applies
high-contrast suppression and unmappable-rest fallback. Move test-only bulk operations rather than advertising them
as a new production API.

Move token-aware APIs such as inverse-token classification to Flex exports. Treat changed color-lib signatures and
the removed variant vocabulary as modern API migration work; add a deprecated compatibility wrapper only if the
legacy inventory demonstrates a real obligation. Do not retain semantic policy inside the raw implementation merely
to preserve an undocumented modern signature.

## 7. Default values and immutable x3 evidence

### Approved current-source target and verified evidence

**Confirmed by the owner:** use current x3 color source values. Agentic components are in rapid development, and
modern value changes are approved; do not preserve the older pin merely to avoid them. Refresh to current upstream
main during implementation, record the resulting immutable revision and blob identities, and reconcile differences.
Drift review documents the change; it is not a new approval gate for adopting current values.

On 2026-10-23, authenticated read-only metadata checks reverified
`x3-design/fluent-design@206e890b645fb450ad7c5df2ff981765349a2b58` as current main, committed 2026-09-11. Its tree includes:

| Current source                                          | Blob SHA                                   |
| ------------------------------------------------------- | ------------------------------------------ |
| `dev/web/flex-themes/css/semantic.css`                  | `4c9f3e0a70bdbb8b7183d2db15254d9427d8e6ab` |
| `dev/web/flex-themes/css/interaction-fallback.css`      | `c69ff3145f4f9b1228a694a3e7ba8b1a65d2c032` |
| `dev/web/flex-themes/css/warm/semantic.css`             | `dfe8416dffb4b215777d0270c3fe40a5d631ee2c` |
| `dev/web/flex-themes/css/warm/interaction-fallback.css` | `6dbe4a963fd197cac7fabf35cf6c801f68aa1f4c` |
| `dev/web/flex-tokens/mappings.json`                     | `33c7a100a200d52d48f35faae5adf9f6282e462a` |
| `dev/web/flex-tokens/tokens.json`                       | `49bec466b835c0df87c879f399a29fc60db6b426` |

The split light/dark semantic and interaction companions also exist for cool and warm at this revision. Include all
required sources in the refreshed pin and compare derived states against their reference values; do not confuse
omitting runtime defaults with omitting source evidence.

The checked-in runtime pin is still the historical `d334acf5cbad813f2b7cd554da942b09a7ff8f10` until implementation.
Its earlier offline check passed in `offline-snapshot` mode with three matching integrity entries and no drift.
That result is historical local-integrity evidence, not parity with the current target. These metadata checks did not
copy private source bodies, change the runtime pin, or verify every current default value.

### Access and reference procedure

Use the token and component references in `https://github.com/x3-design/fluent-design` as needed, at immutable
identities. This internal source requires authenticated access, not an unauthenticated public link probe:

1. For an internal source, select an existing authorized **Microsoft EMU** GitHub identity using `gh auth switch`.
   Verify the repository and exact commit with read-only REST GETs. Do not diagnose a public-identity 404 as missing
   upstream evidence.
2. For tokens, resolve current upstream main, refresh the design pin and source identities above, then inspect that
   revision's token, semantic, interaction, and warm companions. Resolve source variables and scheme/tone overrides
   before comparing values. Recheck main when implementation begins rather than treating today's target as permanent.
3. For components, use `@fluentui-react-native/components/references/contract-sources/flex-x3.md`, the
   `flex-authoring` profile, the matching `flex-components:<name>` source, and
   `@fluentui-react-native/components/spec-source-lock.json`. Read shared, usage, and relevant platform companions.
   Modern source and component changes are approved: refresh affected source locks and contracts through their
   workflow where current tokens require it. Do not combine releases accidentally or promote contracts without review.
4. The Node drift tool reads `GITHUB_TOKEN`/`GH_TOKEN`; switching the `gh` account alone does not authenticate that
   process. Supply approved command-scoped credentials without printing, persisting, or committing them. Restore the
   public GitHub identity before public-repository operations, including on failure.
5. Respect R-REPO-004: source access is not permission to copy or mechanically transform private source bodies or token
   tables into this public repository. Confirm permitted data publication before extending snapshots or emitting
   derived payloads. Keep private reports/logs local; publish original documentation and permitted provenance only.

Durable maintenance instructions belong in [Tokens](references/tokens.md); component contracts retain their own
source-adapter workflow rather than acquiring a second copy of it here.

### Completeness and generation gate

Build a coverage ledger for **every supported Flex destination**, not just interactive colors. Record source commit,
path, role, scheme/tone, native representation, explicit versus computed state, adaptation reason, and unsupported or
platform-owned cases. Never label a missing role complete because it inherited rest.

The reviewed generator must resolve source variables and overrides, preserve alpha, normalize units deliberately, and
emit deterministic, provenance-bearing defaults in `src/flex/defaults/`. Emit `[light, dark]` rest colors plus the
required type/role metadata for each tone, omitting each hover/pressed field that the automatic dynamic implementation
reproduces correctly. Keep explicit exceptions only where needed. Compare resolved outputs, not authored-field
presence, when testing completeness. Preserve complete current interaction reference data in permitted test-only
evidence so derivation is checked independently of the generator. Use `flexColor` and tuple helpers to keep authored
definitions concise without forcing helper calls around every generated literal.

Explicitly resolve these known gaps:

- Cool and warm palettes need independently verified rest and interaction data. Warm algorithm vectors are not proof
  of a complete warm palette.
- The historical interaction fixture had ten cool-table cases using the warm path. Revalidate them against current
  sources; retain an explicit state only where current source values cannot be reproduced by the approved dynamic
  policy. Do not carry stale exceptions forward automatically or omit real source exceptions.
- Adopt current x3 brand values alongside the rest of the current palette. Record and qualify visual changes; a
  separate brand-approval gate is no longer required.
- **Approved:** close non-color gaps across fonts, weights, line heights, spacing, radii, strokes, motion, and shadows.
  Extend the modern contract/mapping for missing motion-duration/easing roles and `componentBase800` where current
  sources define them; do not leave them deferred merely because the old contract omitted them.
- **Approved:** support the current layered shadows and dark overrides with a modern representation that preserves
  all source layers and valid native behavior. Keep legacy `ShadowToken` unchanged and document any lossy legacy
  projection or platform-specific adaptation explicitly; do not silently truncate modern shadows.
- The selected x3 semantic evidence does not define native high-contrast/elevated defaults. Preserve platform-owned
  behavior and document any base-appearance reuse; do not synthesize purported x3 values.
- Re-evaluate historical dark-pressed contrast failures against current values and keep any remaining failures visible
  as audit outcomes, separate from matching the design source.

Extend pin/drift tooling to all approved source IDs and validate generated value parity independently of
`check:mappings`. Repeated generation must be byte-for-byte stable. Reuse compatible existing codegen work after
reconciliation, but do not substitute platform-package equivalence for the requested x3 evidence.

## 8. Legacy adapters and consumer migration

### Conversion guarantees

Forward conversion preserves legacy-authored rest, hover, pressed, native colors, and existing missing-value fallback
ownership. Replacing the modern token representation must not silently change the forward adapter's fallback values;
if a new modern-only policy is desired, isolate and review it separately.

Reverse conversion keeps its existing order: complete legacy base, `legacyFallback`, authoritative mapped Flex values,
then legacy appearance metadata. Preserve canonical collision choices, omitted candidates, transforms, complete legacy
values Flex cannot represent, and lazy loading. If the published converter accepts old flat token inputs, retain a
compatibility input normalization path rather than accidentally breaking legacy consumers through a modern type move.

The YAML remains canonical. Update its destinations and the generator/validator to understand per-token
`.rest/.hover/.pressed` paths, then regenerate both projections. Do not hand-edit JSON projections or weaken validation
to accept unresolved new paths.

### Migration order and concrete surfaces

1. Update the design color-style factory internally so existing key-based `colorStyleDef` declarations keep their
   interaction precedence. Keep the shared state factory independent of per-color representation.
2. Migrate direct interactive reads in Input and ListboxItem, then remaining component, story, and test reads.
   Migrate all scalar color reads to `.rest`, including static roles now using the uniform envelope. Inventory all
   direct accesses, not just the old override maps.
3. Migrate Storybook chrome and theme fixtures, including `testing` exports and consumers re-exporting `mockTheme`.
   Keep `/testing` as the public spelling even though implementation moves to `src/test/`.
4. Component owners revise affected token references, including Accordion, Button, and Input `spec/tokens.yaml`,
   through their contract workflow. An import/path migration does not authorize a component behavior change or
   automatic contract promotion.
5. Update [Theming](references/theming.md), [Tokens](references/tokens.md), [Styling](references/styling.md),
   [Color library](references/color-lib.md), [Testing](references/testing.md), [Entry points](references/entry-points.md),
   [Contributing](references/contributing.md), the package quick start, component styles-and-tokens instructions,
   and repository theming basics.

Representative modern migration:

```ts
// Before
const rest = tokens.color.backgroundBrandLoud;
const hover = tokens.color.hover.backgroundBrandLoud ?? rest;

// After
const { backgroundBrandLoud } = tokens.color;
const rest = backgroundBrandLoud.rest;
const hover = backgroundBrandLoud.hover;
```

Read only the states a style path needs. Destructuring both hover and pressed eagerly reads both getters; this is
valid when needed, but not evidence of interaction-time laziness.

Illustrative input authoring, not x3 default values:

```ts
const brand = flexColor({
  rest: ['#345678', '#abcdef'],
  hover: ['#234567', '#bcdef0'],
  pressed: ['#123456', '#cdef01'],
  type: 'inverted',
});
```

For the normal automatic-derivation case, the author only supplies rest colors and any required classification:

```ts
const brand = flexColor(['#345678', '#abcdef'], 'inverted');
```

No deriver configuration or separate dynamic-color import is required. The migration guide must also show explicit
state exceptions, tuple selection, atomic replacement, automatic unmappable-rest/high-contrast fallback, recipe
migration, `legacyFallback`, and how legacy Fluent themes/provider usage remains unchanged. Do not remove deprecated
appearance APIs as incidental cleanup.

## 9. Delivery phases, ownership, and exit criteria

| Phase                                           | Owner and work                                                                                                                                                                           | Prerequisite                                              | Exit gate                                                                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Resolve remaining gates and overlap          | Apply owner-approved decisions; reconcile existing default-theme/codegen work, fixed semantics, and source publication permissions                                                       | This review draft                                         | Current-source adoption, automatic Flex derivation, native rest fallback, and non-color gap closure are not reopened as approval gates  |
| 1. Capture compatibility                        | Design and compatibility-package owners record public symbol/type fixtures, external-style imports, legacy Fluent runtime/default snapshots, and bundle baselines                        | Phase 0                                                   | Baselines cover legacy themes/provider entry points, raw contexts, native colors, fallback ownership, and every export condition        |
| 2. Mechanical organization                      | Move owned implementations and platform tests; update entry targets, references, generators' fixed source paths, and bundle positive/negative controls; deduplicate demonstrated helpers | Phase 1                                                   | No behavior or exported legacy-name change; no vacuous import boundary tests                                                            |
| 3. Tone and automatic engine                    | Add compatible tone normalization and cache keys; wire required raw algorithms into Flex only; update import invariants and conformance coverage                                         | Phase 2                                                   | Tone-only transitions, three-field legacy calls, automatic Flex imports, and legacy graph isolation behave as specified                 |
| 4. Interactive representation                   | Implement authored/resolved contracts, atomic color replacement, automatic lazy states, recipe semantics, adapters, and regenerated YAML projections; migrate consumers coherently       | Phase 3 and fixed semantics where applicable              | Existing default values first survive a representation-only migration; no stale states, eager copying, or legacy fallback changes       |
| 5. Current x3 defaults and non-color completion | Refresh to current x3, generate rest-first cool/warm defaults and necessary explicit exceptions, extend non-color contracts and layered shadows                                          | Source publication gate and stable Phase 4 representation | Resolved values match current sources; derivable state fields are absent; approved gaps are closed; legacy Fluent themes stay unchanged |
| 6. Release and qualification                    | Update owning references, consumer guidance and changesets; inspect packed artifacts, bundles, and affected native stories                                                               | Phases 2-5                                                | Modern migration is complete, legacy contract holds, validation and native limitations are explicit                                     |

Upstream investigation and compatibility capture can proceed independently. Activate current Flex defaults once
their permitted provenance, resolved-value checks, and implementation qualification pass; no historical-Flex visual
preservation or additional modern-default approval is required. Keep mechanical moves separate from value changes
so regressions can be attributed and reviewed.

## 10. Validation and acceptance

Use existing declared scripts. Focused test names below select related existing files; add colocated coverage for the
new contracts rather than inventing an unconfigured runner.

| Scope                           | Commands                                                                                                                                                                                                    | Required evidence                                                                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| This documentation change       | Root `yarn format:check` scoped to edited files; `yarn check-agent-instructions`; configured Markdown link checks; `yarn change:check`; final cache-cleared aggregate for the changed instruction reference | Valid navigation, formatting and an empty changeset for a no-release package change                                                                             |
| Appearance/runtime iteration    | In design: `yarn test appearance flexThemeReference themeReference useThemeState useTheme ThemedRoot`                                                                                                       | Tone keys, normalized defaults, boundary precedence, subscriptions, revisions, state identity, fresh style registries                                           |
| Color/adapter iteration         | In design: `yarn test colorLib colorStyles validation flexTokenMappings flexTokensFromTheme themeFromFlexTokens objects`                                                                                    | Automatic derivation, explicit-state precedence, unmappable-rest identity, frozen inputs, atomic replacement, conformance and projection policies               |
| Types                           | In design: `yarn build`                                                                                                                                                                                     | Public legacy three-axis calls, readonly tuples, authored recipe types and uniform output envelopes; Jest alone does not check types                            |
| Mapping/provenance              | In design: `yarn check:mappings`; `yarn gen:upstream-drift --offline`; authenticated current-source drift when refreshing the pin                                                                           | Valid mappings, current resolved default-value coverage, omitted derivable fields, non-color completeness, snapshot integrity and explicit online/offline modes |
| Owning implementation package   | In design: `yarn format`, `yarn lint`, `yarn build`, `yarn test`, `yarn check:mappings`                                                                                                                     | Full package acceptance after focused iteration                                                                                                                 |
| Migrated consumers              | Declared build/lint/test scripts in affected component, Storybook runtime, platform-theme and compatibility packages                                                                                        | No remaining old interactive accesses; state precedence and external-style imports preserved                                                                    |
| Distribution and graphs         | Root `yarn bundle-size`, `yarn check-package-contents`, `yarn check-publishing`, `yarn lage test-links` after moves                                                                                         | Actual retained-module boundaries, positive controls, valid packed export targets and documentation links                                                       |
| Final implementation acceptance | Root `yarn clean-lage-cache`, then `yarn lage buildci`                                                                                                                                                      | One final cache-cleared aggregate; rerun failed downstream checks after fixes                                                                                   |
| Native qualification            | Existing affected Storybook/native test workflows on supported platforms and renderers                                                                                                                      | Visual states, tone/scheme/contrast/elevation transitions, opaque/system colors and legacy/Flex coexistence                                                     |

Add explicit zero-call/one-call derivation assertions: provider mount and rest access derive nothing; hover derives only
hover; repeated hover access derives once; an explicit state never invokes the engine. Include regression tests proving
that copying/merging a parent token does not read its getters. A normal `FlexThemeReference` must derive omitted states
without configuration. For unmappable values, both omitted states must return the identical rest value, while
explicit states still win; an unexpected algorithm failure must not be swallowed as that fallback. Distinguish raw
API diagnostics, approved unmappable-rest fallback, high-contrast suppression, and invalid-authoring errors.

Test every default state against the current source after native normalization. Independently assert that each
derivable hover/pressed field is absent from runtime definitions, with any retained explicit exception documented.
Cover cool/warm, light/dark, inversion, native values, and the approved motion, spacing, and layered/dark shadow gaps.

Import guards must forbid `/fluent/` compatibility payloads and `/test/` from the modern root, while allowing the
lightweight forward adapter and required raw color algorithms. Flex-state scenarios must positively require automatic
interaction modules; legacy-only scenarios must protect their existing graph and avoid acquiring the engine through
shared utilities. Reverse-projection and direct color-lib scenarios positively require their expected modules.
Test `flexColor` as a pure normalizer, not as a promise that the Flex runtime is engine-free. Review measured bundle
deltas before updating baselines. Bundle measurement is not included in `buildci`; add lightweight import-direction
assertions to the package test suite so ordinary CI also protects the dependency rules.

This change does not implement or natively qualify the refactor. R-VALID-003 exempts plans; the original navigation
edit also changed an instruction reference and therefore required a cache-cleared aggregate. Subsequent plan-only
amendments require documentation checks, not a repeat product build or native run. Later implementation requires the
focused and native evidence above, not merely the documentation checks. Record checks as passed, failed, skipped,
not run, or unsupported; JavaScript tests and bundles are not native qualification.

## 11. Confirmed decisions and remaining implementation gates

The owner's 2026-10-23 follow-up settles these decisions:

| Confirmed decision                                             | Implementation requirement                                                                                                        |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Legacy consumers use legacy Fluent themes and the old provider | Preserve that path; current Flex defaults need no legacy implicit-root visual-compatibility gate                                  |
| Dynamic interaction APIs are automatic for Flex                | Wire required algorithms into the Flex runtime; remove deriver injection and missing-engine configuration                         |
| Default interactions should be derived wherever possible       | Emit `[light, dark]` rest colors and classification, omitting each reproducible hover/pressed default independently               |
| Platform/native/unmappable rest colors are valid               | Omitted states return the rest value directly, preserving identity and requiring no explicit override or warning                  |
| Current x3 values are preferred over old modern values         | Refresh current upstream identities and adopt the values, including brand changes; qualify rather than block the approved changes |
| Non-color gaps are approved                                    | Implement missing current motion/spacing roles and layered/dark shadows while preserving legacy types                             |

Only these implementation gates remain:

| Gate                                   | Required evidence                                                                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fixed derivation for mappable literals | Obtain an authoritative scheme-independent rule; until then require explicit fixed states                                                              |
| Source publication                     | Confirm permitted publication before adding private-source snapshots or derived payloads; current-source adoption itself is approved                   |
| Native non-color adaptations           | Define and qualify renderer/unit/shadow behavior and document lossy legacy projections; this is implementation detail, not another scope-approval gate |

## 12. Reciprocal-review provenance and reconciliation

Two independent investigations used **GPT-6 Astra** (`gpt-6-astra`) and **Claude Opus 5.5**
(`claude-opus-5.5`), each configured with `reasoning_effort: max` and `context_tier: long_context`. Each model then
reviewed the other's complete report in its original thread. Full reports and critiques are private session artifacts,
not copied source material or published package content.

The complete independent reports are `astra-independent-report.txt` and `opus-independent-report.txt`; their
reciprocal critiques are `astra-cross-review.txt` and `opus-cross-review.txt` in the private session artifacts.
The owner subsequently resolved several product decisions in section 11; that follow-up takes precedence over the
initial model recommendations. No new reciprocal-review round is claimed for these owner-directed amendments.
Reconciliation and the subsequent decisions are recorded explicitly:

| Reviewed disagreement                          | Resolution and rationale                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Uniform versus interactive-only envelopes      | Uniform outputs match the requested consumption model and simplify projection paths; eligibility remains separate so static roles never derive |
| Resolved-parent versus authored-parent recipes | Merge authored descriptions before resolving; avoid eager getters and appearance-bound output reuse                                            |
| Deriver injection and missing-engine errors    | Superseded by owner decision: Flex always includes dynamic derivation; unmappable colors intentionally return rest                             |
| Fixed equals standard-light mathematics        | Rejected as unsupported; explicit fixed states work while computed semantics remain gated                                                      |
| Touched-path legacy projection                 | Rejected by both reviewers; authoritative projection remains, and the owner confirmed that legacy users stay on legacy themes/provider         |
| Required tone on old exported appearance types | Rejected as a legacy type break; retain optional compatibility fields and strict normalized modern outputs                                     |
| Helper default versus token-name inference     | Preserve the requested standard default; generated defaults/adapters supply reviewed inverted metadata explicitly                              |
| Source/table mismatch totals                   | Do not adopt unverified zero-match claims; concrete counterexamples were found during reciprocal review                                        |
| Shape change before consumer migration         | Rejected as an unbuildable intermediate phase; migrate the representation and consumers atomically, with value changes separate                |
| Old pin and non-color scope gates              | Superseded by owner decision: adopt current x3 values and close non-color gaps, recording immutable provenance and native adaptations          |

The remaining fixed-derivation and publication gates are explicit. Primary implementation evidence and the owner's
confirmed decisions take precedence over either model's speculation.
