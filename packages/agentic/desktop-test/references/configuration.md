---
id: desktop-test.configuration
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Configuration

## Add an application target

Define `desktop.config.mts` in the application workspace and export a
`defineDesktopConfig` value. Use `schemaVersion: 1`, a config-local
`projectRoot`, and a named `targets` map. The package README has a minimal
installed-app example.

Targets select `macos`, `windows`, or `win32` endpoints and describe an
`installed`, `react-native-test-app`, or `rex` host. Prefer an exact
application identity. A Windows installed target requires an exact title and
an executable path, AUMID, or verified owner lease; a title alone is not an
identity. External ownership permits attach only and preserves the app.

`commands` overrides individual `prep`, `bundle`, `build`, or `run` stages.
Each command has an executable and argument array; no shell-like string parsing
is performed. Required services are declared in config and a service exit is a
failure even after readiness.

## Add a suite workspace

A separate suite references the app's canonical target using `use: { config,
target }`, and declares grouped spec globs, framework, hooks, retry policy, and
instance limits. Install WDIO CLI, local runner, and the selected framework in
the suite workspace; the harness does not install test frameworks into app
workspaces.

The config schema rejects unknown fields, cycles, and unmatched spec patterns.
Spec paths resolve against the suite project's root; target references and
hooks resolve against their declaring config.

## Helper policy

`nativeDriver` accepts only `cacheRoot`, `helperPath`, and `installRoot`.
Native helper builds are never implicit in the harness. Explicitly run
`build-driver` or provision a verified helper before app preparation and test
execution. The low-level resolver's `if-missing` policy does not override this
harness policy.

## Cross-package ownership

`@fluentui-react-native/desktop-driver` owns helper and WebDriver configuration.
This package owns application and suite schemas; Storybook integration config
belongs to `@fluentui-react-native/storybook-desktop`.
