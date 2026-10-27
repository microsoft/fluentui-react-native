`FluentUI Tester` is the test app that we use to test our FluentUI components during development. It uses the [react-native-test app](https://github.com/microsoft/react-native-test-app) under the covers, and loads the fluent-tester bundle.

## `FluentUI Tester` instructions to launch each platform's test app

- [iOS and Android](../legacy-mobile/README.md)
- [macOS](./docs/macos.md)
- [Windows](./docs/windows.md)
- [Win32](./../win32/README.md)

## End-to-end tests

The macOS and Windows end-to-end tests run from this directory through `desktop-test`. Run `e2eprep` once per
renderer or native change, then `e2etest`:

```sh
yarn e2eprep:macos && yarn e2etest:macos
yarn e2eprep:windows && yarn e2etest:windows
```

`e2eprep` builds the desktop driver helper, bundles, prepares, and builds the app; `e2etest` runs the `legacy` suite
from [`apps/E2E`](../E2E/README.md), which covers prerequisites, suites, and debugging failures. For the harness
itself, see the `@fluentui-react-native/desktop-test` package guide at `packages/agentic/desktop-test/README.md`.
