# React Native Desktop Storybook Runtime

`@fluentui-react-native/storybook-desktop-runtime` provides the on-device
React Native UI, authenticated Storybook readiness bridge, theme host, Metro
configuration, and platform chrome used by
`@fluentui-react-native/storybook-desktop`.

Consumers normally install and invoke `storybook-desktop`; this package is
separate so the CLI package stays peer-free and receives the runtime workspace
locator.

Driver-backed Metro validates the parent's versioned manifest handoff and
loads its owner-private bridge-only data module; attachment credentials never
enter the app bundle. Test config evaluation only in controlled fixture roots.

Win32 test generations reset the preview subtree and its scroll position while
preserving the surrounding desktop chrome preferences.
The macOS and Win32 story decorators use a scrollable viewport that centers
small stories without clipping oversized stories behind the chrome.
Windows retains its existing non-scrolling, centered story container.

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
