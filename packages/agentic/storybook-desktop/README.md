# React Native Desktop Storybook

Reusable CLI and configuration for Fluent UI React Native desktop test apps. Together with the companion runtime, it provides:

- the macOS and Windows Lite UI shell;
- the Win32 Paper desktop chrome and Callout-backed pop-outs;
- a Fluent theme toolbar and preview decorator;
- Metro and Babel configuration for the repo's pnpm-linked desktop hosts; and
- the standalone Storybook channel and MCP server;
- generated platform Story Manifests and authenticated runtime readiness; and
- an embedded W3C Desktop Driver listener in the same server process; and
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
  createWindowsSmokeOptions,
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
      smoke: createWindowsSmokeOptions({
        windowTitle: 'My Storybook',
      }),
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
  },
  "storybook": {
    "testIDPrefix": "my-storybook"
  }
}
```

The app's `src/main.ts` becomes a small adapter:

```ts
import config from '../storybook.config.ts';

export default config.getStorybookConfig();
```

The returned `DesktopStorybookConfig` resolves package roots lazily and exposes app identity, display name, the custom
`storybook.testIDPrefix` field, package metadata, resolved story packages, and generated story globs for CLI and test
orchestration. A config-level `testIDPrefix` remains available as an explicit override for consumers that do not store
Storybook identity in `app.json`.

## CLI and API

The `storybook-desktop` binary loads `storybook.config.ts`, `.mts`, `.js`, `.mjs`, or `.cjs` from the current package.
Use `.mts` when the consuming package otherwise defaults JavaScript files to CommonJS. Select a target with a short
platform option, or omit it to use `FURN_STORYBOOK_PLATFORM` and then the host default:

```sh
storybook-desktop server --win32
storybook-desktop build-driver --windows
storybook-desktop build-driver --macos
storybook-desktop driver --windows
storybook-desktop manifest --windows
storybook-desktop instance --windows
storybook-desktop prep --macos
storybook-desktop bundle --windows
storybook-desktop build --macos
storybook-desktop run --windows
storybook-desktop smoke --win32 --mode stories
storybook-desktop smoke --windows --mode stories-and-tests
```

Use `--config <path>` for a differently named configuration file.
`build-driver` builds only the source-shipped native helper. `prep` first
ensures that helper, then installs CocoaPods on macOS or generates the React
Native Test App solution on Windows; Win32 prep now ensures the shared Windows
helper. `bundle` generates the selected
story catalog and routes to `rnx-cli bundle`. `build` and `run` route to `rnx-cli` by default using native project names
derived from the app manifest. The config supplies default macOS workspace/scheme and Windows solution arguments from
the app key, and reads the macOS bundle identifier directly from `app.json`. Win32 has no native project to build, so
its default build and run operations are unsupported until the consumer provides a prebuilt-host launch command.

Set `platformOptions.macos.nativeDriver.macosSigningIdentity` to use a stable
macOS code-signing identity. When omitted, the source build uses an ad hoc
signature and TCC permissions may need to be granted again after a rebuild.
The shared standalone macOS `run` command applies the enlistment-specific
xcconfig, matching the bundle identity used by `driver` and `smoke`.

`server` loads the same config, selects the matching platform catalog, and derives the app-owned Storybook config
directory automatically. It accepts `--host` and `--port`; the separate `storybook-server` binary is a convenience
alias for this subcommand. Consumer package scripts should forward arguments rather than define one server alias per
platform. See [`src/cli/README.md`](src/cli/README.md) for the recommended minimal scripts and development, E2E, CI,
and agent workflows.

`manifest` statically extracts the selected platform's stories and serializable
`parameters.desktopDriver` plans. `manifest --all` writes every configured
platform manifest plus `story-manifest.catalog.json`, and fails unless the
catalog-set and raw portable-plan digests reconcile. Each endpoint retains its
own resolved platform-manifest digest. `instance` prints the enlistment-specific channel, Metro, and driver
identity. `driver` starts the Storybook channel/MCP server and the W3C Desktop
Driver listener on separate loopback ports in one Node process. It resolves the
verified native helper before starting Metro and registers a process-backed
target. The deterministic fake host remains test-only.

Component authors tag portable plans with `desktop-e2e`. Story-level
`supportedPlatforms` narrows catalog membership, test `platforms` selects an
unchanged subset, and `platformVariants` completely replaces one endpoint's
requirements and steps. `traversePlatforms` keeps a supported story out of the
broad render sweep and schedules its authored tests last. Plan extraction evaluates only the inline
static `desktopDriver` literal and supports TypeScript `satisfies`; dynamic
values fail with source context instead of being omitted.

Run the resulting plans through the consuming app's Desktop Driver CLI:

```sh
yarn desktop-driver stories list \
  --url http://127.0.0.1:<driver-port> \
  --target <target-id>

yarn desktop-driver stories run \
  --url http://127.0.0.1:<driver-port> \
  --target <target-id> \
  --tag desktop-e2e \
  --artifacts artifacts/<platform>/desktop-driver
```

The `driver` startup output and `instance` command report the driver port and
target identity. WebdriverIO is the sanctioned high-level runner; raw W3C and
typed client surfaces remain available for integration and conformance tests.

`createWindowsSmokeOptions` supplies a package-owned Fabric lifecycle that bundles the Windows catalog, prepares and
builds the generated app, registers and launches its Debug package, starts the channel server and Metro, traverses every story, and stops only
the processes it recorded. `createWin32SmokeCommand` bundles and launches the configured REX host, verifies the shared
desktop chrome, resize handles, and addon surface through the configured test-ID prefix, traverses every story, and
performs the same ownership-safe cleanup. `--mode stories` is the default renderability gate;
`--mode stories-and-tests` traverses the generated platform manifest and then runs every `desktop-e2e` authored plan through
the native provider. Storybook owns app launch and supplies an exact
nonce-bound process lease; WebDriver attaches and preserves the app until the
Storybook lifecycle performs final cleanup.
The reusable macOS lifecycle resolves the launched app by its isolated bundle
identifier and atomically records its PID, start time, executable, and nonce
before creating the attached WebDriver session.
Consumers provide only native identity, title, test-ID prefix, and optional required story IDs.
The Windows helper also records React Native Test App's Debug Metro port (`8081` by default), while Storybook and
Desktop Driver ports remain enlistment-specific.
Artifacts are written beneath the consuming app's platform artifact directory.
Authored runs include `run.json`, `junit.xml`, `events.ndjson`, `host.json`,
per-test results, and bounded failure evidence. The package-owned Windows and
Win32 lifecycles additionally persist `ownership.json` after cleanup.
`run.json` carries the shared catalog digest alongside portable-plan and
exact-platform digests so endpoint results can be reconciled without requiring
identical catalogs.

The Windows Fabric lifecycle restarts only its exact owned app after the full
catalog traversal, then rewrites the nonce-bound application lease and runs
authored tests against the warm Metro bundle. This avoids carrying accumulated
Fabric story state into the native test phase while preserving the same server,
ports, and process ownership.

`smoke` can also use a complete consumer command or the generic reusable lifecycle. The generic lifecycle starts the shared
channel server and Metro, builds and launches the app, selects every indexed story, runs the configured app stop
command, and terminates only the server processes it started. macOS uses the package's bundle-ID-based stop command by
default. Other generic platform lifecycles require an explicit `smoke.stop`, while consumers can replace the complete
smoke command when native process ownership needs platform-specific handling. Prefer the package-owned Windows and
Win32 command factories over app-local lifecycle scripts.

Each reusable smoke run derives a stable instance ID from the canonical consuming-project root. That ID suffixes the
configured macOS bundle identifier and seeds separate Storybook and Desktop Driver ports, with occupied-port probing
before launch. Generic and macOS lifecycles also use an enlistment-specific Metro port. The Windows React Native Test
App lifecycle reserves its required `8081` Metro port, so two Metro-backed Windows smoke runs cannot execute
concurrently. The CLI supplies a generated Xcode configuration containing `PRODUCT_BUNDLE_IDENTIFIER` and
`RCT_METRO_PORT`; the Metro helper serializes the matching Storybook port into a generated runtime polyfill. Separate
enlistments therefore never select or stop one another's app or owned services. Generated instance files live under the
consuming app's `storybook-desktop.generated` and `macos/.storybook-desktop` directories and should be ignored. The
runtime module intentionally uses a visible directory because Metro's Windows file map excludes hidden cache
directories.

The same operations are available without Commander:

```ts
import { DesktopStorybookCli } from '@fluentui-react-native/storybook-desktop/cli';
import config from './storybook.config.ts';

const storybook = new DesktopStorybookCli(config);
await storybook.bundle('macos');
await storybook.smoke('macos', { mode: 'stories-and-tests' });
```

Command runners are injectable through the constructor for higher-level automation and tests. `DesktopCommand`,
`DesktopPlatformOptions`, `createDesktopStorybookInstance()`, and the related configuration types are exported from the
`/config` subpath. `server()` runs the foreground server until it is stopped, so supervisors should invoke it as a
dedicated task rather than await it before another operation.

The app integrates its generated Storybook view with the shared runtime:

```tsx
import { createDesktopStorybookApp } from '@fluentui-react-native/storybook-desktop-runtime';

import { view } from './storybook.requires';

export default createDesktopStorybookApp(view);
```

Use `createDesktopStorybookPreview()` from the runtime package in the app's `preview.tsx`. Metro configuration is exposed
from `@fluentui-react-native/storybook-desktop-runtime/metro`; Babel, server, config, and CLI helpers are exposed from the
corresponding `@fluentui-react-native/storybook-desktop` subpaths.

When launched through `driver` or the reusable smoke lifecycle, the generated
runtime instance supplies the configured test-ID prefix, bridge nonce, target
identity, and manifest digests. The runtime exposes stable app/story root
markers and correlates each story selection or reset with a run ID and preview
generation.
