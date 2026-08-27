# React Native Desktop Storybook

Reusable CLI and configuration for Fluent UI React Native desktop test apps. Together with the companion runtime, it provides:

- the macOS and Windows Lite UI shell;
- the Win32 Paper desktop chrome and Callout-backed pop-outs;
- a Fluent theme toolbar and preview decorator;
- Metro and Babel configuration for the repo's pnpm-linked desktop hosts; and
- the standalone Storybook channel and MCP server; and
- a Commander CLI and matching API for serving, native preparation, bundling, builds, launches, and smoke tests.

The React Native implementation lives in the companion
`@fluentui-react-native/storybook-desktop-runtime` package. Keeping its React
and React Native peers out of this package gives the CLI a physical Yarn
workspace locator, so `storybook-desktop` and `storybook-server` binaries work
with Yarn's pnpm linker instead of resolving through an unmaterialized virtual
workspace path.

Consuming apps own their native identity in `app.json`, story globs, generated `storybook.requires` file, component
dependencies, and exceptional platform automation. A root `storybook.config.ts` declares which packages supply stories
and overrides only platform behavior that cannot use the shared defaults:

```ts
import {
  createWindowsSmokeCommand,
  createWin32RunCommand,
  createWin32SmokeCommand,
  makeDesktopStorybookConfig,
} from '@fluentui-react-native/storybook-desktop/config';

const win32Host = {
  component: 'MyStorybook',
  windowTitle: 'My Storybook (Win32)',
} as const;

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
    windows: {
      smoke: {
        command: createWindowsSmokeCommand({
          windowTitle: 'My Storybook',
        }),
      },
    },
    win32: {
      run: createWin32RunCommand(win32Host),
      smoke: {
        command: createWin32SmokeCommand({
          ...win32Host,
          testIDPrefix: 'my-storybook',
        }),
      },
    },
  },
});
```

The corresponding React Native Test App manifest supplies native identity:

```json
{
  "name": "MyStorybook",
  "displayName": "My Storybook",
  "macos": {
    "bundleIdentifier": "com.example.my-storybook"
  }
}
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
storybook-desktop server --win32
storybook-desktop prep --macos
storybook-desktop bundle --windows
storybook-desktop build --macos
storybook-desktop run --windows
storybook-desktop smoke --win32
```

Use `--config <path>` for a differently named configuration file. `prep` installs CocoaPods on macOS, generates the
React Native Test App solution on Windows, and is a no-op for the prebuilt Win32 host. `bundle` generates the selected
story catalog and routes to `rnx-cli bundle`. `build` and `run` route to `rnx-cli` by default using native project names
derived from the app manifest. The config supplies default macOS workspace/scheme and Windows solution arguments from
the app key, and reads the macOS bundle identifier directly from `app.json`. Win32 has no native project to build, so
its default build and run operations are unsupported until the consumer provides a prebuilt-host launch command.

`server` loads the same config, selects the matching platform catalog, and derives the app-owned Storybook config
directory automatically. It accepts `--host` and `--port`; the separate `storybook-server` binary is a convenience
alias for this subcommand. Consumer package scripts should forward arguments rather than define one server alias per
platform. See [`src/cli/README.md`](src/cli/README.md) for the recommended minimal scripts and development, E2E, CI,
and agent workflows.

`createWindowsSmokeCommand` supplies a package-owned Fabric lifecycle that bundles the Windows catalog, prepares and
builds the generated app, registers and launches its Debug package, starts the channel server and Metro, traverses every story, and stops only
the processes it recorded. `createWin32SmokeCommand` bundles and launches the configured REX host, verifies the shared
desktop chrome, resize handles, and addon surface through the configured test-ID prefix, traverses every story, and
performs the same ownership-safe cleanup. Consumers provide only native identity, title, test-ID prefix, and optional
required story IDs.
Artifacts are written beneath the consuming app's `artifacts/windows` or `artifacts/win32` directory.

`smoke` can also use a complete consumer command or the generic reusable lifecycle. The generic lifecycle starts the shared
channel server and Metro, builds and launches the app, selects every indexed story, runs the configured app stop
command, and terminates only the server processes it started. macOS uses the package's bundle-ID-based stop command by
default. Other generic platform lifecycles require an explicit `smoke.stop`, while consumers can replace the complete
smoke command when native process ownership needs platform-specific handling. Prefer the package-owned Windows and
Win32 command factories over app-local lifecycle scripts.

Each reusable smoke run derives a stable instance ID from the canonical consuming-project root. That ID suffixes the
configured macOS bundle identifier and seeds separate Storybook and Metro ports, with occupied-port probing before
launch. The CLI supplies a generated Xcode configuration containing `PRODUCT_BUNDLE_IDENTIFIER` and `RCT_METRO_PORT`;
the Metro helper serializes the matching Storybook port into a generated runtime polyfill. This lets separate
enlistments run the same app concurrently without selecting or stopping one another. Generated instance files live
under the consuming app's `storybook-desktop.generated` and `macos/.storybook-desktop` directories and should be
ignored. The runtime module intentionally uses a visible directory because Metro's Windows file map excludes hidden
cache directories.

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
`/config` subpath. `server()` runs the foreground server until it is stopped, so supervisors should invoke it as a
dedicated task rather than await it before another operation.

The app integrates its generated Storybook view with the shared runtime:

```tsx
import { createDesktopStorybookApp } from '@fluentui-react-native/storybook-desktop-runtime';

import { view } from './storybook.requires';

export default createDesktopStorybookApp(view, {
  testIDPrefix: 'my-storybook',
});
```

Use `createDesktopStorybookPreview()` from the runtime package in the app's `preview.tsx`. Metro configuration is exposed
from `@fluentui-react-native/storybook-desktop-runtime/metro`; Babel, server, config, and CLI helpers are exposed from the
corresponding `@fluentui-react-native/storybook-desktop` subpaths.
