# Project configuration

This module implements the common `desktop.config.ts` contract.

## Public entries

- `@fluentui-react-native/desktop-driver/config` exports the data-only schema,
  `defineDesktopConfig()`, and `toStorybookStories()`. This entry has no Node dependency and may be
  loaded by Storybook configuration tooling.
- `@fluentui-react-native/desktop-driver/config/node` loads TypeScript, JavaScript, or JSON config,
  resolves paths and environment overrides, loads generated manifests, and creates WDIO/server
  projections.

## Resolution

All relative paths resolve from the config file. Existing inputs are canonicalized with
`realpath`; generated and artifact paths must remain inside `rootDir`. Every platform block is
validated even when another platform is selected.

Precedence is:

1. explicit loader option;
2. declared environment override;
3. selected platform config;
4. base config; and
5. package default.

`serializeResolvedDesktopProject()` reports source labels such as
`environment:DESKTOP_TEST_APP` or `application.manifest:displayName`, but never environment values.

## Generation contract

The config fingerprint covers schema version, normalized story sources, and generated-output
location. `story-tests.manifest.json` stores that fingerprint and fails loading after config drift.

Generation validates the fake scene, writes the React Native runtime projection and generated WDIO
spec to temporary files, then renames the manifest last as the commit marker.

## Adding fields

- Reject unknown keys until the schema explicitly supports them.
- Bump `DESKTOP_CONFIG_SCHEMA_VERSION` when defaults, merge rules, or path semantics change.
- Keep platform overrides from changing discovery inputs so Windows and macOS generate the same
  manifest.
- Update config tests, README examples, and the config fingerprint when a field affects discovery.
