# React Native Desktop Storybook

`@fluentui-react-native/storybook-desktop` integrates React Native Storybook
with the neutral `@fluentui-react-native/desktop-test` lifecycle and
`@fluentui-react-native/desktop-driver`. It provides configuration, static
story discovery, isolated CSF test callbacks, CLI commands, and an optional
smoke lifecycle.

## Quick start

Use the `storybook` and `desktop-test` integration in the app workspace. Keep
app identity and story package discovery in the app's `desktop.config.mts`;
keep native stages in declared workspace scripts.

```sh
yarn storybook manifest --macos
yarn storybook bundle --macos
yarn storybook smoke --macos --mode stories-and-tests
```

Read [integration](references/integration.md) for app wiring and
[commands](references/commands.md) for stage selection. Use
[story-tests](references/story-tests.md) to author inline `wdio` callbacks.
The [reference index](references/README.md) routes platform, readiness, and
troubleshooting tasks.
Package agents should start from [AGENTS.md](AGENTS.md).

## Responsibilities

- This package owns Storybook-specific configuration, story extraction,
  authenticated channel orchestration, isolated callback execution, and
  platform-specific Storybook lifecycles.
- `@fluentui-react-native/desktop-test` owns general app/suite configuration,
  native lifecycle composition, WDIO suites, and aggregate reporting.
- `@fluentui-react-native/storybook-desktop-runtime` owns the on-device bridge,
  Metro integration, theme host, and chrome.

For the app, native build and Metro workflows, use the consuming Storybook
workspace's own README and `AGENTS.md`.
