# Getting started

This guide covers setup for package contributors and consumers who embed the
Desktop Driver service. Native application projects remain responsible for
their own build, installation, identity, and lifecycle policy.

## Requirements

All environments need:

- Node.js 22.12 or later;
- a package manager capable of installing the package and its WebdriverIO
  dependency;
- a real, logged-in desktop session for native input and window automation.

Repository contributors use the checked-in Node and Yarn versions:

```sh
# from the repository root
yarn
yarn workspace @fluentui-react-native/desktop-driver build
```

Do not install dependencies from the package directory. Run `yarn` at the
repository root only after a manifest changes or when a declared command
reports missing dependencies.

External consumers install the package as a development dependency:

```sh
yarn add --dev @fluentui-react-native/desktop-driver
```

The package is not published from this development branch yet. Until its first
release, repository consumers declare it with `workspace:*`. From the
monorepo, run its binary with:

```sh
yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver --help
```

The shorter `desktop-driver` commands in this documentation assume a consumer
where the package binary is already available.

The package contains JavaScript output, documentation, and `native/**` source.
It contains no native binary and has no install or postinstall build.

## Native toolchains

### Windows and Win32

Install:

- Windows 11 x64;
- Visual Studio 2022 with **Desktop development with C++**;
- the MSVC x64 toolset and a Windows 10 or 11 SDK.

The helper uses its checked-in MSBuild project. It does not require CMake,
NuGet restore, .NET, or the Windows App SDK.

### macOS

Install:

- macOS 14 or later on Apple Silicon;
- Xcode with its Swift toolchain and command-line tools;
- a reusable Apple Development or local code-signing identity when privacy
  authorization must survive rebuilds.

See [the macOS provider guide](../native/macos/README.md) before choosing a
signing or CI model.

## Build the package and helper

Build the TypeScript package first:

```sh
yarn workspace @fluentui-react-native/desktop-driver build
```

Build the native helper on its target operating system:

```sh
desktop-driver build-driver --platform windows
desktop-driver build-driver --platform win32
desktop-driver build-driver --platform macos
```

`windows` and `win32` select the same C++ helper. The default configurations
are Windows/Win32 x64 release and macOS arm64 release. Unsupported hosts,
cross-builds, and architectures fail before compilation.

The command prints a JSON `NativeDriverArtifact`, including the verified
executable path, artifact and source identities, provider, endpoints, features,
origin, and signing metadata.

## Resolve and diagnose

Normal service startup can resolve a compatible cache artifact or build one if
missing:

```sh
desktop-driver resolve-driver --platform windows
desktop-driver resolve-driver --platform macos
```

CI can prohibit an unexpected source build:

```sh
desktop-driver resolve-driver --platform windows --build-policy never
desktop-driver doctor --platform windows
```

`doctor` never builds. It resolves and verifies an existing helper and returns
JSON with `ready: true`, or a structured readiness error and a nonzero exit
code.

On macOS, inspect permissions from the exact verified helper:

```sh
desktop-driver doctor --platform macos --permissions
desktop-driver doctor --platform macos --permissions --prompt
```

The first command is noninteractive. `--prompt` is intentionally separate
because it may display Accessibility and Screen Recording authorization UI.

## First native service

Follow [Service integration](service.md) to:

1. resolve a helper;
2. construct a `NativeDesktopHost` with a controlled application descriptor;
3. register a target with `createDesktopDriverServer`;
4. connect using WebdriverIO or the typed client;
5. delete the session and close the service.

For a Storybook application, use
`@fluentui-react-native/storybook-desktop` as the owner of manifests, app
leases, Metro, the Storybook channel, and the embedded driver listener. The
generic driver package deliberately does not discover or launch Storybook
itself.

## Common setup failures

| Failure                                         | Action                                                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `toolchain-missing` on Windows                  | Install the Visual Studio C++ workload and a Windows SDK; rerun from a normal user desktop          |
| `unsupported-host` or `unsupported-platform`    | Build on the target OS using Windows x64 or macOS arm64                                             |
| `no-verified-prebuilt`                          | Build once, restore the configured cache/install root, or change `buildPolicy` from `never`         |
| `integrity-mismatch`                            | Do not edit cached output; rebuild and let the resolver quarantine the invalid selection            |
| macOS permission denial                         | Run noninteractive `doctor --permissions`, then follow the TCC guidance in the macOS provider guide |
| Session creation cannot identify one app/window | Correct the registered descriptor or owner-provided lease; never loosen it to “first match”         |
| Physical input is skipped or unavailable        | Use an unlocked interactive desktop with matching user/integrity authority                          |

For cache, helper overrides, and all supported environment variables, see
[Native helpers](native-helpers.md).
