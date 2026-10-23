---
id: desktop-test.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Contributing

Configuration and host adapters live in `src/config.ts` and `src/adapters.ts`;
CLI stages are composed in `src/cli.ts`; process ownership is in
`src/supervisor.ts`; reports are implemented in `src/reporting/`; and WDIO
session wiring is in `src/wdio/`.

Add contract coverage for schema, lifecycle, reporting protocol, and failure
paths. Do not move Storybook-specific story extraction into this package.

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` from the package.
Run consumer suites when changing public configuration or lifecycle behavior.
If native output or ownership changes, qualify on the affected operating
system; JavaScript contracts alone do not qualify native behavior.
