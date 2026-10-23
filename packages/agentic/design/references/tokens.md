---
id: design.tokens
kind: instruction-reference
owner_paths:
  - packages/agentic/design/src/tokens
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
| Flex semantic tokens           | `FlexTokens` from `@fluentui-react-native/design` | `src/tokens/flex.types.ts`; defaults in `src/tokens/defaultTokens.ts`       |
| Platform global tokens         | `@fluentui-react-native/design/tokens/global`     | Generated into `src/tokens/global.generated.ts` and `src/tokens/generated/` |
| Legacy alias and shadow tokens | `@fluentui-react-native/design/tokens/legacy`     | `src/tokens/legacy/`, for legacy themes only                                |

`FlexTokens` groups `color` (with `hover` and `pressed` overrides), `shadow`, `fontWeight`, `fontFamily`, `fontSize`,
`lineHeight`, `borderRadius`, `spacing`, and `strokeWidth`. Components read the active values from
`useThemeState().tokens`; `theming.md` explains how they are resolved. The defaults currently do not vary by
appearance; see `remaining-work.md`.

The package's `prebuild` script (`codegen.cts`) generates the global token files from the platform
`@fluentui-react-native/design-tokens-*` packages and regenerates both mapping projections. Do not edit generated files;
change their inputs and rebuild.

## Flex token mapping

`flex-token-map.yaml` is the authoring source for the grouped Flex token contract
and both legacy conversion directions. `flex-from-theme.json` projects legacy
FURN `Theme` values into Flex destinations. `theme-from-flex.json` projects one
canonical Flex value back to each representable legacy Theme path.

The reverse projection is intentionally lossy. When several Flex roles share one
legacy Theme path, `reverse.canonical` names the selected source, lists every
omitted candidate, and records why that choice is stable. Interactive reverse
entries fall back to their rest value when the authored hover or pressed map
does not override that token. `reverse.transforms` owns any value conversion
required by a target path.

`nonFluentFlexTokens` supplies values for supported Flex destinations without a
Theme source. A complete legacy Theme also requires values that Flex cannot
represent; those values are supplied by the lazy compatibility base under
`src/theming/compat`.

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

   The command refreshes the three snapshots and their `blobSha` values.

3. Run `gen:upstream-drift --offline` and confirm that `hasDrift` is `false` and
   every `snapshotIntegrity` entry reports `matches: true`.
4. Run `check:mappings` and the design package test suite.
5. Commit the pin record, all three refreshed snapshots, and a changeset
   describing the upstream change together.
