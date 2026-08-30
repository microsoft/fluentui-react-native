# React Native Desktop Storybook Runtime

Peer-dependent React Native UI and service implementation used by
`@fluentui-react-native/storybook-desktop`.

Consumers should install and invoke `@fluentui-react-native/storybook-desktop`;
this package is separated so the CLI package remains peer-free and receives a
physical Yarn workspace locator.

The runtime owns the device side of the Desktop Driver Storybook contract:

- app and story-root native `testID` markers;
- app-manifest-derived test identity;
- nonce-authenticated runtime hello challenges;
- correlated story-ready and story-error events;
- request/run IDs and preview generations;
- keyed per-test remount and render-error isolation.

It does not own W3C routing, WebdriverIO, test execution, evidence persistence,
or native accessibility/input/screenshot providers. Those responsibilities
belong to `@fluentui-react-native/desktop-driver`.
