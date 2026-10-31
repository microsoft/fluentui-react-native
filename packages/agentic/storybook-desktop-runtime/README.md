# React Native Desktop Storybook Runtime

`@fluentui-react-native/storybook-desktop-runtime` provides the on-device
React Native UI, authenticated Storybook readiness bridge, theme host, Metro
configuration, and platform chrome used by
`@fluentui-react-native/storybook-desktop`.

Consumers normally install and invoke `storybook-desktop`; this package is
separate so the CLI package stays peer-free and receives the runtime workspace
locator.

Read the [integration reference](references/integration.md) before wiring the
runtime into an app, and the [runtime contract](references/runtime-contract.md)
before changing bridge, Metro, theme, or chrome behavior. The
[reference index](references/README.md) lists all package guidance.
Agents should start from [AGENTS.md](AGENTS.md).

This package does not own W3C routing, WDIO suites, aggregate test execution,
or run reporting. Those belong to
`@fluentui-react-native/desktop-driver`,
`@fluentui-react-native/desktop-test`, and
`@fluentui-react-native/storybook-desktop`, respectively.
