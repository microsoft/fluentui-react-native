# Native helpers

The package ships checked-in native source and builds one small helper on the
target operating system. Native binaries are not published in npm, compiled
during installation, or downloaded automatically.

Windows and Win32 share the C++ x64 provider. macOS uses the Swift arm64
provider. Both implement the private
[FDR1 framed stdio protocol](../native/PROTOCOL.md) behind the same
`DesktopHost` contract.

## Build commands

```sh
desktop-driver build-driver --platform windows
desktop-driver build-driver --platform win32
desktop-driver build-driver --platform macos
```

Common options:

```text
--architecture arm64|x64
--configuration debug|release
--cache-root <path>
--force
--macos-signing-identity <identity>
```

V1 validates the platform combination: Windows/Win32 require x64 and macOS
requires arm64. `build-driver` is an isolated source-build operation. It may
reuse an exactly compatible verified artifact unless `--force` is set, but it
never selects an explicit helper or managed install root.

See [native/windows/README.md](../native/windows/README.md) and
[native/macos/README.md](../native/macos/README.md) for provider toolchains and
behavior.

## Resolution order

`resolve-driver` and `resolveNativeDesktopDriver` select in this order:

1. exact `helperPath`;
2. compatible artifact beneath `installRoot`;
3. compatible artifact in the shared cache;
4. source build when `buildPolicy` is `if-missing`.

An invalid explicit helper or install root fails immediately. It never falls
through to a different artifact. `buildPolicy: 'never'` turns a cache miss into
`no-verified-prebuilt`.

```sh
desktop-driver resolve-driver \
  --platform windows \
  --helper-path D:\tools\furn-desktop-driver-host.exe

desktop-driver resolve-driver \
  --platform macos \
  --install-root /Library/Application\ Support/Contoso/desktop-driver \
  --build-policy never
```

The macOS helper path may name either
`FurnDesktopDriverHost.app` or its nested executable.

## Configuration

| CLI/API option         | Environment variable                         | Default                   |
| ---------------------- | -------------------------------------------- | ------------------------- |
| `buildPolicy`          | `FURN_DESKTOP_DRIVER_BUILD_POLICY`           | `if-missing`              |
| `cacheRoot`            | `FURN_DESKTOP_DRIVER_CACHE_ROOT`             | User-level platform cache |
| `helperPath`           | `FURN_DESKTOP_DRIVER_HELPER_PATH`            | None                      |
| `installRoot`          | `FURN_DESKTOP_DRIVER_INSTALL_ROOT`           | None                      |
| `macosSigningIdentity` | `FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY` | Ad hoc signing            |
| `configuration`        | `FURN_DESKTOP_DRIVER_CONFIGURATION`          | `release`                 |

An explicit API or CLI option takes precedence over its environment variable.
WebDriver capabilities cannot set any of these values.

Default stores:

```text
Windows: %LOCALAPPDATA%\Microsoft\FluentUIReactNative\desktop-driver\native
macOS:   ~/Library/Caches/com.microsoft.fluentui-react-native.desktop-driver/native
```

CI may use a job-local cache root, but should restore only artifacts built for
the matching provider, architecture, source, toolchain, configuration, and
signing identity.

## Immutable cache model

```text
<cache-root>/v1/
  artifacts/<provider>-<architecture>/<compatibility>/<build>/<artifact>/
  selections/<compatibility>/
  locks/
  staging/
  trash/
```

- The compatibility key covers provider, architecture, configuration, source,
  coordinator, protocol, and macOS signing identity.
- The build fingerprint adds the actual toolchain fingerprint.
- The artifact ID hashes the built executable.
- Builds publish through same-volume staging and atomic rename.
- Cross-process directory locks prevent duplicate publication.
- Corrupt cache selections and artifact collisions are quarantined under
  `trash`; in-use artifacts are never replaced.

Never edit an artifact or selection in place. Rebuild and allow the resolver to
publish a new immutable selection.

## Verification

Every artifact is verified before use:

- supported provider and architecture;
- real path and managed-path confinement;
- source, compatibility, build, and executable identities;
- macOS signature and recorded signing policy;
- FDR1 major/minor compatibility and helper identity;
- one-shot handshake before selection;
- the same handshake from the actual long-lived process before it receives
  native commands.

Explicit paths are trusted only as an operator selection; they still undergo
hash, platform, signature-policy, and handshake verification. An optional
organization-managed prebuilt must use the same artifact layout and be
provisioned out of band. The package does not define a downloader.

## Runtime

`NativeHostProcess` starts the verified executable with `--stdio`. Requests,
responses, binary payloads, events, cancellation, and cancellation
acknowledgements are correlated. Stderr is bounded diagnostic output.

If a command deadline expires, Node requests cancellation and waits for the
helper to settle before the session queue advances. If the helper dies while
input may be depressed, Node invokes the same verified binary in restricted
`--release-input` mode with only the recorded keys and buttons. Further
physical input must not proceed if release cannot be proven.

## Diagnostics

`doctor` uses prebuilt-only resolution:

```sh
desktop-driver doctor --platform windows
desktop-driver doctor --platform win32
desktop-driver doctor --platform macos
```

It prints JSON and exits nonzero for actionable readiness failures. macOS
permission probes are documented in the
[macOS provider guide](../native/macos/README.md).

For service target setup, see [Service integration](service.md). For CI cache
and native gating, see [CI integration](ci-integration.md).
