# Desktop driver agent guidance

These instructions apply to `packages/agentic/desktop-driver` and all descendants.

Read, in order:

1. the repository root `AGENTS.md`;
2. this file;
3. [README.md](./README.md);
4. [DESIGN.md](./DESIGN.md);
5. the nearest submodule `README.md` and `AGENTS.md`; and
6. [NEXT-STEPS.md](./NEXT-STEPS.md) before starting work that may overlap remaining native proof.

## Purpose and boundaries

This package provides write-once WebdriverIO desktop tests for React Native macOS and Windows.

Preserve these invariants:

- shared tests use standard WebdriverIO plus the documented portable matrix;
- Appium and native driver objects remain implementation details;
- every listener is loopback-only;
- attach never grants application termination ownership;
- cleanup targets exact recorded resources, never process names;
- Storybook discovery is static and does not execute story modules;
- app-supplied values cannot become commands, paths, grep expressions, or code;
- Metro remains a separate explicit server;
- one desktop is one serial resource by default; and
- fake-backend success does not replace native proof.

## Configuration and use

Use one `desktop.config.ts` and project it through:

- `@fluentui-react-native/desktop-driver/config` for data-only types and Storybook stories;
- `@fluentui-react-native/desktop-driver/config/node` for loading and WDIO/server options;
- `@fluentui-react-native/desktop-driver/wdio` for test execution;
- `@fluentui-react-native/desktop-driver/protocol` in React Native; and
- `@fluentui-react-native/desktop-driver/server` for programmatic host startup.

Run package commands through the workspace:

```sh
yarn workspace @fluentui-react-native/desktop-driver format
yarn workspace @fluentui-react-native/desktop-driver lint
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver test
```

After file moves or export changes, also run a clean build, link checks, publishing checks, and pack
inspection. After Storybook-facing changes, use the declared `apps/storybook` scripts and run both
bundles.

## Code organization

Follow the module map in [`src/README.md`](./src/README.md).

- Do not add wildcard barrels.
- Keep protocol free of Node/runtime integration dependencies.
- Keep Appium imports in `src/server/webdriver/backends.ts`.
- Keep WDIO types out of core contracts.
- Keep entry-only `import.meta` behavior out of Jest-loaded modules.
- Reuse shared reporting, loopback, endpoint, and process helpers.
- Do not recreate removed `driver-host`, announced-service, or tokenized HTTP compatibility layers.

## Documentation ownership

Every behavior change must update the canonical document:

| Change                                                              | Required documentation                                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Install, quick start, public command, public export                 | `README.md`                                                             |
| Integration recipe or operating workflow                            | `USAGE.md`                                                              |
| Ownership, topology, protocol, lifecycle, security, module boundary | `DESIGN.md`                                                             |
| Unfinished native proof, release gate, open decision                | `NEXT-STEPS.md`                                                         |
| Internal module responsibility or dependency direction              | nearest `src/**/README.md`                                              |
| Storybook app workflow                                              | `apps/storybook/README.md` and its `AGENTS.md` when instructions change |

`suggestions.md` is a completed decision record. Do not add new backlog items or current
architecture prose there.

Keep `NEXT-STEPS.md` limited to unfinished work. Remove items when implemented and move the
implemented contract into `DESIGN.md` or the owning module README.

When adding a new submodule:

1. add a `README.md` describing responsibility, dependencies, invariants, and extension rules;
2. add an `AGENTS.md` when the submodule has special editing or validation constraints;
3. update `src/README.md`; and
4. update the package files allowlist if the README should ship.

## Validation discipline

- Start with the smallest package test that covers the behavior.
- Use fake E2E for package plumbing.
- Treat real macOS and Windows proof as a separate explicit gate.
- Preserve complete `run.json`, JUnit, lifecycle, ownership, and cleanup evidence.
- Never claim native compatibility from unit tests, fake runs, or bundles.
