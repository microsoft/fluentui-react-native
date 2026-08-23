# Source module map

This directory contains the implementation of `@fluentui-react-native/desktop-driver`. Consumer
documentation lives at the package root. These README files describe maintainer boundaries,
dependency direction, and extension points.

Read the package [`AGENTS.md`](../AGENTS.md) and the nearest submodule `AGENTS.md` before changing
code or documentation.

## Module boundaries

| Directory                             | Responsibility                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| [`core/`](./core/README.md)           | Runtime-neutral session shapes, loopback values, and result classification    |
| [`config/`](./config/README.md)       | Project schema, config loading, resolution, fingerprints, and projections     |
| [`protocol/`](./protocol/README.md)   | React-Native-safe channel constants, payload types, and decoders              |
| [`storybook/`](./storybook/README.md) | Static CSF discovery, manifest validation, IDs, and generated specs           |
| [`server/`](./server/README.md)       | Storybook host, run coordinator, runner subprocess, and native WebDriver host |
| [`wdio/`](./wdio/README.md)           | WDIO config, lifecycle service, commands, readiness, and standalone sessions  |
| [`cli/`](./cli/README.md)             | JSON command-line parsing and command dispatch                                |
| [`platforms/`](./platforms/README.md) | Explicit non-portable macOS and Windows execute extensions                    |
| [`testing/`](./testing/README.md)     | In-process fake session used by package integration tests                     |

Root modules such as `types.ts`, `errors.ts`, `lifecycle.ts`, `artifacts.ts`, `ownership.ts`, and
`process-supervisor.ts` are shared implementation contracts. They must not import WDIO, Storybook,
Appium, or a React Native platform fork.

## Dependency direction

```text
protocol
   ↓
core and root contracts
   ↓
config and storybook discovery
   ↓
server clients / WDIO integration
   ↓
server composition and CLI
```

The enforced rules are:

- `protocol/` has no Node, Storybook, WDIO, Appium, or server dependency;
- `core/` and `platforms/` do not import WDIO or server implementation;
- `server/` does not import the WDIO service layer;
- Appium driver imports stay in `server/webdriver/backends.ts`; and
- package barrels use explicit named exports rather than wildcard exports.

`import-boundaries.test.ts` guards these constraints.

## Testing

Tests are colocated where practical. The package-level contract tests additionally exercise:

- the fake W3C backend;
- actual repository Button stories and linked specs;
- generated manifest/spec behavior;
- config and protocol compatibility; and
- package lifecycle and reporting.

Use the declared workspace commands from the repository root:

```sh
yarn workspace @fluentui-react-native/desktop-driver format
yarn workspace @fluentui-react-native/desktop-driver lint
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver test
```
