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

Add contract coverage for schema, lifecycle, reporting protocol, and failure
paths. Do not move Storybook-specific story extraction into this package.
The package-boundary contract exercises the built public entry points with a
loader that rejects React, React Native, and Storybook imports; keep its
standalone consumer and negative fixtures representative of package manifests
and runtime imports.

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` from the package.
Run consumer suites when changing public configuration or lifecycle behavior.
If native output or ownership changes, qualify on the affected operating
system; JavaScript contracts alone do not qualify native behavior.
