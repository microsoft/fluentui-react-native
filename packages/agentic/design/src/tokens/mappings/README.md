# Flex token mapping maintenance

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

## Internal consistency

Run the offline-only consistency check from the repository root:

```sh
yarn workspace @fluentui-react-native/design check:mappings
```

The check validates the mapping schema, both generated projections,
`nonFluentFlexTokens` coverage, forward interaction fallback ownership,
canonical reverse collisions, reverse rest fallbacks, reverse transforms, and
every YAML destination against `FlexTokens` or `UnsupportedFlexTokens`.
`scripts/codegen.cts` regenerates both projection files and then runs the check
before generating token constants. The package Jest suite exercises the same
validator.

## Pinned x3 source

`upstream-pin.json` records the exact `x3-design/fluent-design` commit and source
paths used by the mapping. Exact source copies live under
`scripts/token-mappings/__fixtures__/x3`, outside the runtime source tree.
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

## Updating the pin

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
