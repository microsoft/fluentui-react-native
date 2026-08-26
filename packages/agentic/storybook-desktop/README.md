# React Native Desktop Storybook

Reusable on-device Storybook runtime for Fluent UI React Native desktop test apps. It provides:

- the macOS and Windows Lite UI shell;
- the Win32 Paper desktop chrome and Callout-backed pop-outs;
- a Fluent theme toolbar and preview decorator;
- Metro and Babel configuration for the repo's pnpm-linked desktop hosts; and
- the standalone Storybook channel and MCP server; and
- a Commander CLI and matching API for native preparation, bundling, builds, launches, and smoke tests.

Consuming apps own their native identity, story globs, generated `storybook.requires` file, component dependencies, and
platform automation. A root `storybook.config.ts` declares which packages supply stories and can override package
patterns per platform:

```ts
import { makeDesktopStorybookConfig } from '@fluentui-react-native/storybook-desktop/config';

export default makeDesktopStorybookConfig({
  projectRoot: new URL('.', import.meta.url),
  storyPackages: [
    '@scope/components',
    [
      '@scope/native-component',
      {
        platforms: ['macos', 'windows'],
      },
    ],
  ],
  platformOptions: {
    macos: {
      nativeProject: {
        bundleIdentifier: 'com.example.my-storybook',
      },
      smoke: {
        stop: {
          command: 'osascript',
          args: ['scripts/stop-storybook.applescript'],
        },
      },
    },
    win32: {
      build: false,
      run: {
        command: 'node',
        args: ['scripts/run-win32.cjs'],
      },
    },
  },
});
```

The app's `src/main.ts` becomes a small adapter:

```ts
import config from '../storybook.config.ts';

export default config.getStorybookConfig();
```

The returned `DesktopStorybookConfig` resolves package roots lazily and exposes app identity, display name, package
metadata, resolved story packages, and generated story globs for CLI and test orchestration.

## CLI and API

The `storybook-desktop` binary loads `storybook.config.ts`, `.mts`, `.js`, `.mjs`, or `.cjs` from the current package.
Use `.mts` when the consuming package otherwise defaults JavaScript files to CommonJS. Select a target with a short
platform option, or omit it to use `FURN_STORYBOOK_PLATFORM` and then the host default:

```sh
storybook-desktop prep --macos
storybook-desktop bundle --windows
storybook-desktop build --macos
storybook-desktop run --windows
storybook-desktop smoke --win32
```

Use `--config <path>` for a differently named configuration file. `prep` installs CocoaPods on macOS, generates the
React Native Test App solution on Windows, and is a no-op for the prebuilt Win32 host. `bundle` generates the selected
story catalog and routes to `rnx-cli bundle`. `build` and `run` route to `rnx-cli` by default using native project names
derived from the app manifest. Win32 has no native project to build, so consumers configure its launch command and
leave `build` unsupported.

`smoke` can use a complete app-owned command or the reusable lifecycle. The reusable lifecycle starts the shared
channel server and Metro, builds and launches the app, selects every indexed story, runs the configured app stop
command, and terminates only the server processes it started. A `smoke.stop` command is required so the native
application can be shut down without broad process-name matching.

Each reusable smoke run derives a stable instance ID from the canonical consuming-project root. That ID suffixes the
configured macOS bundle identifier and seeds separate Storybook and Metro ports, with occupied-port probing before
launch. The CLI supplies a generated Xcode configuration containing `PRODUCT_BUNDLE_IDENTIFIER` and `RCT_METRO_PORT`;
the Metro helper serializes the matching Storybook port into a generated runtime polyfill. This lets separate
enlistments run the same app concurrently without selecting or stopping one another. Generated instance files live
under the consuming app's `.cache/storybook-desktop` and `macos/.storybook-desktop` directories and should be ignored.

The same operations are available without Commander:

```ts
import { DesktopStorybookCli } from '@fluentui-react-native/storybook-desktop/cli';
import config from './storybook.config.ts';

const storybook = new DesktopStorybookCli(config);
await storybook.bundle('macos');
await storybook.smoke('macos');
```

Command runners are injectable through the constructor for higher-level automation and tests. `DesktopCommand`,
`DesktopPlatformOptions`, `createDesktopStorybookInstance()`, and the related configuration types are exported from the
`/config` subpath.

The app integrates its generated Storybook view with the shared runtime:

```tsx
import { createDesktopStorybookApp } from '@fluentui-react-native/storybook-desktop';

import { view } from './storybook.requires';

export default createDesktopStorybookApp(view, {
  testIDPrefix: 'my-storybook',
});
```

Use `createDesktopStorybookPreview()` from the app's `preview.tsx`. The Node configuration helpers are exposed from the
`/metro`, `/babel`, `/server`, and `/cli` subpaths so native test apps can keep their root configuration files minimal
while still passing an app-owned Storybook config path.
