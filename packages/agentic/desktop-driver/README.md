# React Native Desktop Driver

`@fluentui-react-native/desktop-driver` is a W3C WebDriver Classic-compatible
remote end for automating React Native desktop applications. It drives macOS,
React Native Windows Fabric, and React Native Win32 Paper without Appium and
provides one portable WebdriverIO and story-test contract across those
endpoints.

The package contains the client-neutral WebDriver service, typed clients,
WebdriverIO integration, serializable test plans, bounded agent operations,
evidence management, native-helper source and build tooling, and deterministic
fake hosts for contract tests. It does not depend on Storybook, React, or React
Native.

## Supported targets

| Endpoint                    | Operating system  | Architecture            | Native implementation                                       |
| --------------------------- | ----------------- | ----------------------- | ----------------------------------------------------------- |
| React Native macOS Fabric   | macOS 14 or later | Apple Silicon (`arm64`) | Swift, AXUIElement, Quartz Event Services, ScreenCaptureKit |
| React Native Windows Fabric | Windows 11        | `x64`                   | C++20, UI Automation, SendInput, Windows Graphics Capture   |
| React Native Win32 Paper    | Windows 11        | `x64`                   | Same Windows helper and protocol                            |

V1 permits one active WebDriver session per physical target. Native builds run
only on the target operating system. Installation never compiles or downloads a
helper.

## Start here

For a repository checkout, use Node 22.12 or later and Yarn 4:

```sh
yarn
yarn workspace @fluentui-react-native/desktop-driver build
```

Build the native helper explicitly on the machine that will run it:

```sh
# Windows or Win32
desktop-driver build-driver --platform windows

# macOS; use a stable identity for repeatable privacy authorization
desktop-driver build-driver --platform macos \
  --macos-signing-identity "Apple Development: Developer Name (TEAMID)"
```

Then resolve the verified helper, register a controlled application target, and
start the loopback service:

```ts
import { createDesktopDriverServer, NativeDesktopHost, resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver';

const artifact = await resolveNativeDesktopDriver({
  platform: 'windows',
});
const host = new NativeDesktopHost({
  application: {
    executablePath: 'C:\\apps\\MyReactNativeApp.exe',
    windowTitle: 'My React Native App',
  },
  artifact,
  endpoint: 'windows',
});
const service = await createDesktopDriverServer({
  targets: [
    {
      endpoint: 'windows',
      host,
      id: 'my-react-native-app',
      platformName: 'windows',
      renderer: 'fabric',
    },
  ],
});

console.log(service.url);
// Keep the service alive while tests run, then await service.close().
```

Connect through the sanctioned WebdriverIO surface:

```ts
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';

const desktop = await connectDesktopWebdriver({
  platformName: 'windows',
  targetId: 'my-react-native-app',
  url: service.url,
});

try {
  const button = await desktop.browser.$('~save-button');
  await button.click();
} finally {
  await desktop.delete();
  await service.close();
}
```

The example launches the registered application. Use `launchMode: 'attach'`
only when another trusted owner supplies and maintains the application
lifecycle. The standalone `desktop-driver serve` command intentionally exposes
a fake target for protocol and integration tests; it is not a native service
shortcut.

See [Getting started](references/getting-started.md) for installation,
toolchains, first builds, and diagnostic commands.

## Documentation

| Guide                                               | Use it for                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Getting started](references/getting-started.md)    | Initial setup, package development, first helper build, and troubleshooting                    |
| [Architecture](references/architecture.md)          | Package layers, process boundaries, request flow, and ownership                                |
| [Service integration](references/service.md)        | Embedding the remote end, registering targets, launch/attach behavior, and clients             |
| [Native helpers](references/native-helpers.md)      | Build and resolution policy, cache layout, verification, and configuration                     |
| [macOS native provider](native/macos/README.md)     | Swift implementation, signing, TCC permissions, diagnostics, and native qualification          |
| [Windows native provider](native/windows/README.md) | C++ implementation, toolchain, application identity, capture, and native qualification         |
| [Test integration](references/test-integration.md)  | WebdriverIO, authored story plans, fake harnesses, artifacts, and native tests                 |
| [CI integration](references/ci-integration.md)      | Package gates, native jobs, real-app smoke, signing, and artifacts                             |
| [Security model](references/security.md)            | Loopback boundary, registered targets, helper trust, process ownership, and sensitive evidence |
| [WebDriver contract](references/protocol.md)        | Supported W3C routes, capabilities, elements, errors, and Storybook extensions                 |
| [Native wire protocol](native/PROTOCOL.md)          | Private framed stdio protocol between Node and the native helper                               |
| [Remaining work](PLAN.md)                           | Qualification and release work that is not complete                                            |
| [Changelog](CHANGELOG.md)                           | Versioned package changes                                                                      |

Contributors and coding agents start with [AGENTS.md](AGENTS.md).

## Public entry points

| Export       | Purpose                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------- |
| Package root | Native-helper build/resolution, `DesktopHost`, server, low-level client, and common types |
| `/authoring` | Serializable story plans, selectors, capabilities, and result types                       |
| `/wdio`      | WebdriverIO connection, custom commands, assertions, and story-plan runner                |
| `/client`    | Low-level typed W3C client                                                                |
| `/server`    | Embeddable remote end, session manager, and target registry                               |
| `/agent`     | Bounded JSON-safe inspection, action, and evidence API                                    |
| `/artifacts` | Confined, atomic evidence persistence                                                     |
| `/runner`    | Plan selection, sharding, execution, and result classification                            |
| `/storybook` | Story manifest and orchestration contracts, without a Storybook dependency                |
| `/testing`   | Fake host, fake Storybook orchestrator, and protocol harnesses                            |
| `/cli`       | Embeddable Commander command and CLI runner                                               |

The service implements native application semantics rather than pretending to
be a browser. Unsupported browser features return `unsupported operation`
instead of fabricated success.
