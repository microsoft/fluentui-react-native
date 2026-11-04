# Color equivalence evidence

Source-first analysis for `../color-equivalent-planning.md`, dated November 1, 2026.
These artifacts are **research, not approved production mappings**. They do not change runtime themes.

Review corrections: 58 is the number of color families; only 34 have hover or pressed columns.
`state_specificity` flags additional Office columns for independent binding decisions. Whole-vector differences
include absent-state/applicability differences; compare the separate authored-rest-pair count before treating a
probe as a numerical collision. A single-pair probe is explicitly insufficient evidence. Scalar candidate
collisions are hypotheses generated from candidate lists, not independent proof of a runtime collision.

## What is cataloged

| Artifact                          | Contents                                                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `office-color-values.yaml`        | 58 state-grouped color families covering 167 active Office fields; 14 deprecated fields quarantined separately; 48 fully resolved snapshot contexts |
| `fluent2-win32-color-values.yaml` | 87 raw Win32 Fluent 2 alias groups, four source appearances, 600 authored state values                                                              |
| `flex-color-values.yaml`          | 119 runtime Flex color keys, directly read from cool/warm, light/dark pinned CSS, including material colors                                         |
| `specificity-analysis.yaml`       | Counts, SHA-256 source manifest, observational equality classes, candidate collisions, paired-color witnesses, public Office type gaps              |
| `catalog-colors.mjs`              | Reproducible, offline extraction and consistency verification                                                                                       |

The Office context product is four applications (Mso, Word, Excel, PowerPoint), four theme identifiers
(Colorful, VeryDark, Black, HighContrast), and three regions (TaskPane, TaskPaneCard, TaskPaneCard_VisualRefresh).
That is 8,688 resolved field values, **not 48 independent authored palettes**. Shared is a partial layer, not a fourth
region. Application high-contrast overrides are absent in the supplied snapshot, so those contexts inherit Mso.
The source set does not establish support for other regions, applications, or host releases.

Fluent values come from the installed public package `@fluentui-react-native/design-tokens-win32@0.53.0`,
specifically its `colorful`, `black`, `darkgray`, and `hc` `tokens-aliases.json` files. They are not web Fluent values,
not the generated completed FURN theme, and not values from another native platform. Fonts are explicitly excluded.
Raw package appearance names are retained; Office VeryDark and Fluent darkgray are **not** assumed identical.

Flex literal values come directly from the pinned semantic and interaction-fallback CSS at
`x3-design/fluent-design@206e890b645fb450ad7c5df2ff981765349a2b58`. The independently captured component usage
in `../flex-research.yaml` identifies a different release (`flex-1.5.0-206c4996`, source prefix `334d3b82`).
That version mismatch is an explicit gate before production mapping decisions.

## Reproduce and inspect

From the repository root, using the existing design workspace dependencies:

```powershell
node references\research\color-equivalents\catalog-colors.mjs
yarn oxfmt references\research\color-equivalents
node references\research\color-equivalents\catalog-colors.mjs --check
node --test references\research\color-equivalents\catalog-colors.test.mjs
```

If changing the generator, format it before generating so its recorded hash is current.
`--check` recomputes every catalog and compares parsed YAML, allowing harmless formatter differences.
It also verifies complete Office field coverage, uniqueness, complete Flex key coverage, candidate token existence,
four Fluent appearances, accepted color syntax, and lossless YAML round trips. It does not import generated JS/TS,
evaluate source code, execute mappings, fetch upstream packages, or modify files.

The source manifest hashes every numerical/usage input and the generator. Installed dependency changes produce a
visible version/hash diff on regeneration. This is snapshot reproducibility, not a claim that upstream is unchanged.
The seven focused tests independently reconstruct the Office inputs and raw Fluent states, and check provenance,
state identity, synthetic transparency, material/alpha preservation, and fixed parent-state witnesses.

## Schema and analysis method

1. **Keep source identities.** Office fields retain application, host theme, region, control family, state, declared
   alternate names, and value origin. Fluent keeps its authored group/state spelling, including `selected` and
   `brandHover`/`brandPressed`/`brandSelected`. Flex retains its CSS variable and runtime key.
2. **Resolve sparse Office layers.** Overlay base Shared, base region, application Shared, application region.
   The supplied Shared/region layers are disjoint, so they cannot prove native precedence in a future overlap.
   Treat this order as an extraction convention pending host qualification, not an invented platform guarantee.
3. **Group meaningful interaction families.** Reuse the Office-only state grouping in `../office-templates.yaml`;
   it is not a cross-system mapping. Its literal absent borders are marked `template.synthetic_absent_rest`.
   Keep static foreground, disabled, focused, selected, text-selection, and parent-context roles distinct.
4. **Preserve all authored state values.** Do not derive Office or Fluent hover/pressed values. Missing Fluent
   states stay absent; missing Flex fallback literals are `null`. The 480 absent Flex interaction cells are not
   480 missing runtime colors: many are noninteractive roles, and runtime state derivation is outside this catalog.
5. **Separate three meanings of alias.** Office metadata declares only `TextSubtle -> TextSecondary`,
   `Accent -> AccentDark`, and `AccentSubtle -> AccentLight`. `equal_value_state_sets`/`equal_value_states`
   record literal equality, not authored references. Cross-field equality classes are observations over the
   supplied context product, never permission to merge semantic identities.
6. **Preserve alpha and system colors.** Source literals remain unchanged in the value tables. Equality normalizes
   six-digit hex to opaque eight-digit hex and treats `Window` and `PlatformColor(Window)` as the same symbolic
   system name. It does not resolve system values or erase the RGB channels of transparent colors.
7. **Generate semantic candidates, not a nearest-color map.** Each Office family and Fluent alias has candidate
   Flex roles or an explicit no-direct-equivalent rationale. Candidates come from source usage, role/state names,
   and the captured Flex pairings. They are intentionally many-to-many and require review.
8. **Test specificity at presentation boundaries.** Scalar collisions are discovery hints. The paired probes
   preserve bg/fg triplets and include counterexamples and scope gates; they are not universal binding proofs.
   For child links, the parent background stays fixed in its own state through child hover/press.

For Office tables, `state_order` gives the column order for `value_sets` and `origin_sets`. Each row includes the
contexts to which it applies. This is storage deduplication only: different source identities are never merged.
Every family covers every context exactly once. `equal_value_state_sets.values` maps an equal state to the first
state with that value in that same row; it does not assert an alias across contexts.

## Findings available before reciprocal planning

**Observed: same rest does not imply the same interactive color.** In Mso Colorful TaskPaneCard, emphasis-button
background is `#d83b01 / #a22c01 / #6c1e01`; the on-switch background is
`#d83b01 / #ea6115 / #a22c01`. Their resting fill agrees but both interaction states differ. In Black, even their
rest differs (`#d83b01` versus `#ffffff`).

**Observed: a scalar foreground loses context.** In high contrast, static `Text` is `WindowText` while `TextRest`
is `ButtonText`. In the standard snapshots many static/control text fields happen to agree. Parent-hovered and
parent-selected hyperlinks add another independent context that a single generic brand foreground cannot encode.

**Observed: transparent is not a final background.** Colorful TaskPane's `Bkg` is `#e6e6e6` while its `BkgTextBox`
is `#ffffff`. On TaskPaneCard both rest at `#ffffff`, but their hover/pressed vectors differ.
Flex `backgroundNeutralTransparent` is an alpha shader above a region, not a synonym for either Office final fill.

**Observed: the public Office type is narrower than the snapshot.** `OfficePalette` currently declares 137 fields;
44 of the 181 snapshot fields are absent, including 36 nondeprecated fields. The missing list is machine-generated
in `specificity-analysis.yaml`; live host delivery is not established by this type comparison.

**Observed: value deduplication is unsafe as semantic deduplication.** Twenty Office cross-field equality classes
survive all 48 contexts. Some mix text, focus strokes, slider parts, or deprecated roles. Six Fluent full-state
equality classes likewise include cross-role matches such as inverted foreground and inner focus stroke.

**Inferred: token-value substitution alone cannot cover all presentations.** Candidate collisions, distinct
parent/selection/focus roles, opaque Office fills versus Flex shaders, and absent semantic families require more
information than one universal bg/fg-to-token table. The precise extension mechanism is a planning decision,
not established by the catalog.

**Open evidence gaps:** no live Office qualification; no resolved OS high-contrast palette; no provenance beyond
the supplied Office snapshot for its application exports; no native visual/contrast certification; no assumption
that a field omitted from the public type is delivered at runtime; no claim that an absent Fluent state aliases rest.

## External methodological references

The official Fluent color and token guidance distinguishes semantic aliases from literal colors and warns of platform
interaction differences. It is context only; its web token tables do not supply this catalog's Win32 values.
Accessibility evaluation must use actual composed foreground/background pairs rather than isolated token equality.

```text
https://fluent2.microsoft.design/color
https://fluent2.microsoft.design/design-tokens
https://fluent2.microsoft.design/color-tokens
https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
```

The reconciled architecture, mapping gates, implementation phases, and review provenance belong in
`../color-equivalent-planning.md`. Candidate annotations here remain hypotheses until that process and owner review
approve individual bindings.
