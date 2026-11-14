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
an executable path, AUMID, exact native process identity, or verified owner lease; a title alone is not an
identity. External ownership permits attach only and preserves the app.

`ownership: 'session'` (the default) keeps session-owned launch semantics.
`ownership: 'supervisor'` opts into one supervisor-owned launch; successive
sessions borrow the same application, and scope disposal closes its exact native
incarnation. macOS, Windows and Win32 use their own native identity/cleanup
backend; qualification is recorded separately for each renderer in
[current status](current-status.md).

For neutral macOS attach, set `ownership: 'external'` and an application
`processIdentity: { processId, processStartedAt }` plus exact `windowTitle`.
Use an identity captured from a native lease through the
`/application-ownership` API: the timestamp must retain all six kernel
fractional digits. Bundle/executable constraints are additional checks, not a
replacement for the identity. Exact identity cannot be combined with a legacy
`leasePath`/`leaseNonce`; Storybook's existing lease remains separate.

For Windows/Win32 exact attach, `processIdentity` additionally requires
`executablePath` and `interactiveSession: "windows-session:<id>"`, plus `aumid`
when packaged. Preserve all seven fractional creation-time digits (100 ns).
Capture this identity from a native lease or read-only native inspection, not
from `Date`, a title, an AUMID alone, or a guessed REX PID. The canonical
`ReactTest.exe` image plus PID/start/session identifies one REX incarnation.
Exact identity is external attach evidence, never launch/termination authority.

`commands` overrides individual `prep`, `bundle`, `build`, or `run` stages.
Each command has an executable and argument array; no shell-like string parsing
is performed. Arguments and environment entries must not contain NUL, which no
process can receive. Required services are declared in config and a service exit is a
failure even after readiness.

## Add a suite workspace

A separate suite references the app's canonical target using `use: { config,
target }`, and declares grouped spec globs, framework, hooks, retry policy, and
instance limits. `timeoutMs` bounds each test. `suiteTimeoutMs` bounds the whole
WDIO run, so a wedged launcher fails instead of hanging; by default it is
`timeoutMs` (60 seconds when unset) times 100, times the number of spec groups
and attempts, and at least five minutes. Install WDIO CLI, local runner, and the selected framework in
the suite workspace; the harness does not install test frameworks into app
workspaces.

The config schema rejects unknown fields, cycles, and unmatched spec patterns.
Spec paths resolve against the suite project's root; target references and
hooks resolve against their declaring config.

## Scope domains

A test can declare `scope` values so it runs only on some targets, such as one
renderer or product flavor. Domains are declared in config. `rn.renderer`
(`fabric`, `paper`) is built in and comes from the target's React Native host;
the `rn.*` keys are reserved for the framework. A consumer that is not React
Native, or that needs another dimension, lists its own keys in `testScopes`, each
with a non-empty list of allowed values, and each target sets its own value in
`testScope`:

```ts
export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  testScopes: { flavor: ['stable', 'preview'] },
  targets: {
    windows: {
      host: { kind: 'installed', application: { executablePath: 'C:\\apps\\Sample.exe', windowTitle: 'Sample' } },
      testScope: { flavor: 'preview' },
    },
  },
});
```

A `testScope` key that is not declared, a value outside its domain, or an attempt
to set an `rn.*` key is a configuration error. So is a test scoped on a key its
target does not supply: a typo or a missing value must not silently drop tests.

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
