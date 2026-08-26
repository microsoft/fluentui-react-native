# React Native Desktop Storybook

Reusable on-device Storybook runtime for Fluent UI React Native desktop test apps. It provides:

- the macOS and Windows Lite UI shell;
- the Win32 Paper desktop chrome and Callout-backed pop-outs;
- a Fluent theme toolbar and preview decorator;
- Metro and Babel configuration for the repo's pnpm-linked desktop hosts; and
- the standalone Storybook channel and MCP server.

Consuming apps own their native identity, story globs, generated `storybook.requires` file, component dependencies, and
platform automation. The app integrates its generated Storybook view with the shared runtime:

```tsx
import { createDesktopStorybookApp } from '@fluentui-react-native/storybook-desktop';

import { view } from './storybook.requires';

export default createDesktopStorybookApp(view, {
  testIDPrefix: 'my-storybook',
});
```

Use `createDesktopStorybookPreview()` from the app's `preview.tsx`. The Node configuration helpers are exposed from the
`/metro`, `/babel`, and `/server` subpaths so native test apps can keep their root configuration files minimal while
still passing an app-owned Storybook config path.
