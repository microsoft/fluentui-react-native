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

One `ThemedRoot` wraps the entire app, including the theme toolbar and Storybook
chrome. The default Flex, light, dark, and high-contrast choices update both the
story and chrome without replacing the Storybook instance. The chrome adapter
reads `useThemeState` and maps its color tokens to the upstream Storybook theme,
while retaining upstream LiteUI on macOS/Windows and the desktop Win32 layout.
Native styles retain their original tokens. Storybook's JavaScript color
utilities cannot consume opaque colors such as high-contrast `PlatformColor`
values, so the chrome adapter warns and substitutes contrasting fixed colors
from the selected theme for those values.

Both `background.content` and `background.preview` use `surfaceNeutralFar`.
Upstream LiteUI and its inner StoryView paint the canvas with `content`, even
when the surrounding desktop layout uses `preview`. Keeping those roles aligned
prevents the stock Default Flex, light, and dark canvases from matching the
Secondary Button's `backgroundNeutralSubtle` fill. Explicit story background
overrides still take precedence; component tokens and interaction colors are
unchanged.

It does not own W3C routing, WebdriverIO, test execution, evidence persistence,
or native accessibility/input/screenshot providers. Those responsibilities
belong to `@fluentui-react-native/desktop-driver`.
