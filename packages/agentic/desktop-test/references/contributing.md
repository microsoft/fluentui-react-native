---
id: desktop-test.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Contributing

Configuration and host adapters live in `src/config.ts` and `src/adapters.ts`;
CLI stages are composed in `src/cli.ts`; process ownership is in
`src/supervisor.ts`; shared native service, recovery, authority, descriptor and
settled shutdown composition lives in the real `src/driverService.ts` module
(also used by the Storybook channel child); reports are implemented in `src/reporting/`; and WDIO
session wiring is in `src/wdio/`. The `./jasmine` entry (`src/jasmine/`) holds the
declaration helpers and the selection adapter that WDIO Jasmine suites use; input
lane accounting is in `src/reporting/lane.ts`. Descriptor validation and per-case
decisions come from `@fluentui-react-native/desktop-driver/authoring`, not from
copies here.

`src/config.ts` is also loaded from source through the CommonJS prebuild fallback
that Storybook uses for `desktop.config.mts`, which cannot resolve desktop-driver's
`.js` specifiers. Its runtime imports are therefore Node built-ins, sibling `.ts`
modules and the leaf `@fluentui-react-native/desktop-driver/authoring/input`; import
everything else from desktop-driver as types only. The storybook-desktop
`sourceConfig` test guards this.

The service factory resolves recovery before calling `createTarget(host, recovery)`.
The second argument exposes the same owner-only storage and exact-incarnation
probe used by settlement. Integration-specific sibling records share the stable
`settlement-<sha256(endpoint,targetId)>-` prefix; listener ports, rotating nonces,
and report/service incarnations must not affect it.

Add contract coverage for schema, lifecycle, reporting protocol, and failure
paths. Do not move Storybook-specific story extraction into this package.
The package-boundary contract exercises the built public entry points with a
loader that rejects React, React Native, and Storybook imports; keep its
standalone consumer and negative fixtures representative of package manifests
and runtime imports. Pass the loader as a `pathToFileURL(...).href` URL to
Node's `--experimental-loader`; a native Windows drive path is not a valid ESM
loader specifier.

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` from the package.
Run consumer suites when changing public configuration or lifecycle behavior.
If native output or ownership changes, qualify on the affected operating
system; JavaScript contracts alone do not qualify native behavior.

The opt-in generic native MCP/WDIO consumer is
`yarn test nativeRunner.contract --runInBand`, with
`FURN_NATIVE_DRIVER_TEST=1` and an explicitly provisioned
`FURN_NATIVE_HANDOFF_APP_PATH` (signed AppKit bundle on macOS, plain Win32
fixture executable on Windows). Follow [native qualification](native-qualification.md#generic-attach-only-mcpwdio-handoff)
for readiness, hosted capability gates, safe private storage and evidence.
`yarn test nativeRunnerSupport` checks host selection and readiness without
starting a native helper. `yarn test contracts -t agent-interrupt-cli` tests
semantic CLI interrupts with a protected fake-host service; it is not physical
console qualification.
