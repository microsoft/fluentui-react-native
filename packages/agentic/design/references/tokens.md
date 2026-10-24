---
id: design.tokens
kind: instruction-reference
owner_paths:
  - packages/agentic/design/src/tokens
  - packages/agentic/design/src/flex/tokens.types.ts
  - packages/agentic/design/src/flex/defaults
  - packages/agentic/design/src/flex/adapters
  - packages/agentic/design/src/fluent/tokens
  - packages/agentic/design/scripts
---

# Tokens

## Token sources

- **R-DESIGN-001:** Use `src/tokens/mappings/flex-token-map.yaml` as the canonical mapping from generic CSS and Fluent
  token sources to grouped React Native Flex token paths. When mapping an agentic component to an existing V1
  component, use the Win32, macOS, or Windows implementation as the compatibility reference; use iOS only when the work
  explicitly targets iOS.

| Tokens                         | Entry point                                       | Source                                                                      |
| ------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------- |
| Flex semantic tokens           | `FlexTokens` from `@fluentui-react-native/design` | `src/flex/tokens.types.ts`; x3 defaults in `src/flex/defaults/`             |
| Platform global tokens         | `@fluentui-react-native/design/tokens/global`     | Generated into `src/tokens/global.generated.ts` and `src/tokens/generated/` |
| Legacy alias and shadow tokens | `@fluentui-react-native/design/tokens/legacy`     | `src/fluent/tokens/`, for legacy themes only                                |

`FlexTokens` groups `color` (one `InteractiveColor` with `rest`, `hover`, and `pressed` per semantic color; see
`flex-colors.md`), `shadow`, `fontWeight`, `fontFamily`, `fontSize`, `lineHeight`, `borderRadius`, `spacing`,
`strokeWidth`, and `motion`. Components read the active values from `useThemeState().tokens`; `theming.md` explains how
they are resolved.

Each shadow is a `FlexShadow`: an array of `{ x, y, blur, color }` layers in CSS `box-shadow` order, from the contour
layer to the key shadow, with offsets and blur in density-independent pixels. The tokens keep every source layer. An
authored shadow is one layered shadow or a `[light, dark]` tuple of them; `selectShadowEntry` selects the shadow for an
appearance. A shadow override replaces the whole entry, and an `undefined` entry keeps the base. A legacy
`{ ambient, key }` shadow is authored as `[ambient, key]`, and the former `ambient` and `key` are the first and last
layers. Motion durations are milliseconds, and each easing is an `[x1, y1, x2, y2]` tuple for `Easing.bezier`. Only
colors and shadows vary by color scheme.

The package's `prebuild` script (`codegen.cts`) generates the global token files from the platform
`@fluentui-react-native/design-tokens-*` packages and regenerates both mapping projections. Do not edit generated files;
change their inputs and rebuild.

## Default tokens

`src/flex/defaults/defaultTokens.generated.ts` holds the cool and warm x3 defaults, and `defaultTokens.ts` normalizes
them. `FlexThemeReference` merges the default for the resolved `colorTone` under its base and recipes. The x3 sources
define no high-contrast or elevated values, so those appearances use the light or dark default. Defaults do not
otherwise vary by contrast or interface level; see `remaining-work.md`. Tests that assert default values should read
them from `defaultFlexTokens` in the `testing` entry point rather than repeating literals.

The defaults are rest-first. The generator omits a hover or pressed state when the runtime interaction policy
reproduces its source value in both schemes, and authors the state otherwise, so changing the policy can change which
states are explicit. The coverage ledger, `coverage.generated.json` beside the generator in the package's
`flex-defaults` scripts directory, records for every Flex destination the x3 variable, each tone's light and dark
values, whether each interaction state is computed or explicit, and any native adaptation. Adaptations convert `rem` to
16 density-independent pixels, durations to milliseconds, `cubic-bezier()` to tuples, variable font weights to native
static weights, and relative `oklch` shadow alphas to `#rrggbbaa`. Opaque colors are emitted as `#rrggbb`.

Regenerate both files from the pinned snapshots, or verify that they are current:

```sh
yarn workspace @fluentui-react-native/design gen:flex-defaults
yarn workspace @fluentui-react-native/design gen:flex-defaults --check
```

The generator imports the interaction policy's TypeScript source and requires Node 22.18 or later. `--check` exits 1
when an output is stale. `src/flex/defaults/generateDefaults.test.ts` runs the check, and `x3Defaults.test.ts`
independently parses the pinned CSS to verify every resolved default for each tone and scheme, that each explicit state
differs from the policy's result, and that every x3 variable has a Flex destination.

## Flex token mapping

`flex-token-map.yaml` is the authoring source for the grouped Flex token contract
and both legacy conversion directions. `flex-from-theme.json` projects legacy
FURN `Theme` values into Flex destinations. `theme-from-flex.json` projects one
canonical Flex value back to each representable legacy Theme path.

The reverse projection is intentionally lossy. When several Flex roles share one
legacy Theme path, `reverse.canonical` names the selected source, lists every
omitted candidate, and records why that choice is stable. Interactive reverse
entries read the resolved color's `hover` or `pressed` state; for the
deprecated `FlatFlexTokens` input they fall back to rest when the state map has
no entry for that token. `reverse.transforms` owns any value conversion
required by a target path.

`src/flex/adapters/fluentFallbackTokens.ts` holds the forward adapter's
Fluent-native fallbacks, not the x3 defaults. `nonFluentFlexTokens` supplies
values for supported Flex destinations without a Theme source, and
`fluentFallbackFlexTokens` supplies mapped values a Theme omits. The adapter
never derives states: a state that neither the Theme nor a fallback supplies
equals rest. X3 default changes therefore never alter projected legacy themes.
Legacy
`{ ambient, key }` Theme shadows become `[ambient, key]` layers. A complete
legacy Theme also requires values that Flex cannot represent; those values are
supplied by the lazy compatibility base under `src/fluent/compat`.

### Internal consistency

Run the offline-only consistency check from the repository root:

```sh
yarn workspace @fluentui-react-native/design check:mappings
```

The check validates the mapping schema, both generated projections,
`nonFluentFlexTokens` coverage, forward interaction fallback ownership,
canonical reverse collisions, reverse rest fallbacks, reverse transforms, and
every YAML destination against `FlexTokens` or `UnsupportedFlexTokens`.
The codegen script regenerates both projection files and then runs the check
before generating token constants. The package Jest suite exercises the same
validator.

### Pinned x3 source

`upstream-pin.json` records the exact `x3-design/fluent-design` commit and source
paths used by the mapping. Exact source copies live in the package's script fixtures,
`token-mappings/__fixtures__/x3`, outside the runtime source tree.
The pin also records each source file's Git blob SHA so offline reports detect a
modified snapshot without contacting GitHub.

Generate a structured drift report with:

```sh
yarn workspace @fluentui-react-native/design gen:upstream-drift
```

The command fetches the pinned files through the GitHub REST API when available
and compares them with the checked-in snapshots. If the API is unavailable, it
reports `offline-fallback` mode and uses the snapshots. To guarantee that no
network request is made, pass `--offline`. To inspect a candidate revision
without changing the pin, pass `--ref <commit>`.

### Updating the pin

1. Change `commit` and `verifiedDate` in `upstream-pin.json`.
2. With `GITHUB_TOKEN` or `GH_TOKEN` authorized to read the x3 repository, run:

   ```sh
   yarn workspace @fluentui-react-native/design update:upstream-snapshots
   ```

   The command refreshes every snapshot listed in `files` and its `blobSha`.

3. Run `gen:upstream-drift --offline` and confirm that `hasDrift` is `false` and
   every `snapshotIntegrity` entry reports `matches: true`.
4. Run `gen:flex-defaults`, then `check:mappings` and the design package test
   suite. Review value changes in the coverage ledger, and update source-commit
   citations in code comments and references.
5. Commit the pin record, the refreshed snapshots, the regenerated defaults and
   ledger, and a changeset describing the upstream change together.
