# Theme token sources

`source-matrix.json` maps the cross-platform appearance model to the
platform-specific Fluent token packages. `source-adapters.json` records
intentional source-name substitutions for platform schemas that differ from
the canonical mapping.

The design package prebuild reads those JSON inputs and
`flex-token-map.yaml`, then writes:

- platform-specific lazy Flex default definitions;
- raw legacy alias, shadow, and global token modules;
- a tree-shakeable subset of globals used by compatibility themes;
- direct Theme-to-Flex and Flex-to-Theme projectors; and
- `source-lock.json`, containing the resolved package versions and input
  hashes.

Runtime and test code must consume the generated TypeScript rather than import
files from a `design-tokens-*` package. Run
`yarn workspace @fluentui-react-native/design prebuild` after changing the
matrix, adapters, mapping, or token package versions.

Win32 maps Colorful to light/base, Black to dark/base, and DarkGray to
dark/elevated. Its shared high-contrast source is generated for legacy host
themes but is not included in ordinary modern defaults.
