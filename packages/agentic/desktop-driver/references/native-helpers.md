---
id: desktop-driver.native-helpers
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Native helpers

- **R-DRIVER-001:** Build or provision native helpers explicitly on the target operating system. Installation never compiles or downloads a helper; CI builds it, runs `doctor`, then pins prebuilt-only resolution before app preparation or tests.

The package ships checked-in native source and builds one small helper on the
target operating system. Native binaries are not published in npm, compiled
during installation, or downloaded automatically.

Applications that only need helper build, resolution, or verification can
import those functions from
`@fluentui-react-native/desktop-driver/native`. This entry maps directly to
the helper implementation and avoids loading the package root and its
WebdriverIO integration.

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

| CLI/API option          | Environment variable                          | Default                   |
| ----------------------- | --------------------------------------------- | ------------------------- |
| `buildPolicy`           | `FURN_DESKTOP_DRIVER_BUILD_POLICY`            | `if-missing`              |
| `cacheRoot`             | `FURN_DESKTOP_DRIVER_CACHE_ROOT`              | User-level platform cache |
| `helperPath`            | `FURN_DESKTOP_DRIVER_HELPER_PATH`             | None                      |
| `installRoot`           | `FURN_DESKTOP_DRIVER_INSTALL_ROOT`            | None                      |
| `macosSigningIdentity`  | `FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY`  | Ad hoc signing            |
| `configuration`         | `FURN_DESKTOP_DRIVER_CONFIGURATION`           | `release`                 |
| Disabled input features | `FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES` | None                      |

An explicit API or CLI option takes precedence over its environment variable.
WebDriver capabilities cannot set any of these values.

Default stores:

```text
Windows: %LOCALAPPDATA%\Microsoft\FluentUIReactNative\desktop-driver\native
macOS:   ~/Library/Caches/com.microsoft.fluentui-react-native.desktop-driver/native
```

CI may use a job-local cache root, but should restore only artifacts built for
the matching provider, architecture, source, toolchain, configuration, and
signing identity. A cache root inside the driver package, `node_modules`, or a
pnpm store is rejected with `invalid-configuration`.

GitHub Actions examples:

```text
Windows: $RUNNER_TEMP\furn-desktop-driver-native
macOS:   $RUNNER_TEMP/furn-desktop-driver-native
```

Build the helper explicitly, run `doctor` against that cache, then set
`FURN_DESKTOP_DRIVER_BUILD_POLICY=never` before application preparation or
smoke so later phases cannot compile implicitly.

Source resolution is anchored in the driver's own package, not the caller's
working directory or direct dependencies. Windows staging paths use a short
unique directory name to stay within MSBuild's path-length limits; immutable
artifact identities and the shared cache layout are unchanged. The Windows
source digest covers the project and the items it declares, and the build runs
from those sources staged there, never in the package.

Hosted runners that cannot provide authoritative global input may set
`FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES=keyboard,physicalClick,wheel`.
The Node host masks those capabilities and rejects direct use while leaving
the verified native helper unchanged. Interactive self-hosted runners should
not set this policy.

## Immutable cache model

```text
<cache-root>/v1/
  artifacts/<provider>-<architecture>/<compatibility>/<build>/<artifact>/
  fixtures/win32/<digest>/
  selections/<compatibility>/
  locks/
  staging/
  diagnostics/
  trash/
```

- The compatibility key covers provider, architecture, configuration, source,
  coordinator, protocol, and macOS signing identity.
- The build fingerprint adds the actual toolchain fingerprint.
- The artifact ID hashes the built executable.
- `fixtures/` holds test-only executables that the opt-in native contract
  builds, keyed by fixture source and toolchain. Resolution never selects them,
  and they are not published.
- Builds publish through same-volume staging and atomic rename.
- Cross-process directory locks prevent duplicate publication. A lock is stale
  when its heartbeat stops; waiters reclaim it, and keep waiting for up to 60
  minutes while the heartbeat is fresh.
- Failed build logs are copied to immutable diagnostics before staging cleanup.
- A cache selection or artifact collision is quarantined under `trash` only
  when it fails an integrity check. A transient verification failure keeps it
  and is retryable, so an artifact that may be in use is never replaced.

Never edit an artifact or selection in place. Rebuild and allow the resolver to
publish a new immutable selection.

## Verification

Every artifact is checked before use:

- supported provider and architecture;
- real path and managed-path confinement;
- source, compatibility, build, and executable identities for cached artifacts;
- macOS signature and recorded signing policy;
- FDR1 major/minor compatibility and the helper's provider, architecture,
  build ID, and source digest;
- one-shot handshake before selection;
- the same handshake from the actual long-lived process before it receives
  native commands.

The handshake `features` list is recorded on the artifact for diagnostics.
Node does not verify it against an expected value.

Explicit paths are trusted only as an operator selection. Their platform,
macOS signature policy, protocol, and handshake are checked. The executable's
hash is recorded as the artifact identity and is not compared with an expected
value, and the build ID and source digest come from the helper's own
handshake, so they identify the helper without proving that it was built from
a particular source tree. An optional organization-managed prebuilt must use
the same artifact layout and be provisioned out of band. The package does not
define a downloader.

## Runtime

`NativeHostProcess` starts the verified executable with `--stdio`. Requests,
responses, binary payloads, events, cancellation, and cancellation
acknowledgements are correlated. Node checks the shape of every decoded helper
message before routing it. Malformed or unexpected output, such as a corrupt
frame, a response of the wrong shape, an answer sent twice, or a binary payload
identifier reused while the first is still pending, fails the transport. After
the first malformed frame the decoder drops its buffer and ignores later
output.

### Shutdown and cancellation

Every failure takes one terminal path: Node stops the helper, recovers input
the helper may have left depressed, and then rejects each pending request
once. This holds for a crash, a write failure, a malformed frame, a
cancellation timeout, and a crash while disposing.

If a command deadline expires, Node requests cancellation and waits for the
helper to settle before the session queue advances. The wait is bounded by
`cancellationTimeoutMs`, a whole number of milliseconds from 100 to 60000.
Values outside that range, or that are not integers, are rejected when the host
is created and are never clamped.

| Helper  | Default `cancellationTimeoutMs` | Why                                                                              |
| ------- | ------------------------------- | -------------------------------------------------------------------------------- |
| macOS   | 2000                            | The helper acknowledges cancellation promptly.                                   |
| Windows | 10000                           | A helper step can run for seconds before it reaches a point where it can unwind. |

A helper that does not settle in time is stopped with SIGTERM, then SIGKILL
after 2 seconds if it is still running, and every pending request is rejected.
On Windows, stopping the helper also ends the application under test, which is
why its default deadline is longer. Set the option on `NativeDesktopHost`, or
on the desktop-test service options that are passed to it.

`dispose` asks the helper to shut down and waits for it to acknowledge and
exit. When the caller's `AbortSignal` aborts a disposal the helper has not
acknowledged, the disposal is cancelled like any command and the helper is then
stopped: at once if it acknowledges the cancellation, otherwise when
`cancellationTimeoutMs` expires. Concurrent calls share one disposal, and an
abort from any of them cancels it. A helper that acknowledged but then lingers
for 2 seconds is stopped. Calling `dispose` on a host whose helper failed to
start, or that is already closed, resolves. After `dispose` starts, the host
starts no helper and aborts one that is still starting.

Node does not wait for stdio to close once the helper has exited. A grandchild
that inherited the pipes can hold them open indefinitely, so after the helper
exits Node waits at most 500 ms for the pipes to close and then destroys them.

On macOS and Linux the helper runs in its own process group, so Ctrl+C in the
terminal reaches Node, which cancels and disposes in order, instead of killing
the helper in the middle of a command. Node still owns the helper's lifetime:
it ends when stdin closes, and `dispose` and the failure path stop it.
Windows spawn behavior is unchanged.

Helper stderr is forwarded one line at a time. Bytes are decoded as UTF-8
across reads, each line is limited to 4096 characters, and at most 1 MiB is
forwarded over the life of the helper.

If the helper dies while input may be depressed, Node invokes the same verified
binary in restricted `--release-input` mode with only the recorded keys and
buttons, bounded to 5 seconds and 16 KiB of output. Further physical input must
not proceed if release cannot be proven.

The Windows helper also has three restricted one-shot modes, `--private-storage`,
`--service-identity`, and `--application-incarnation`. The `/authority` adapters
invoke them on the verified artifact to enforce owner-only private storage, to
verify a service's process and listener before a credential is sent, and to
prove a quarantined application's recorded process exited. See the
[Windows provider guide](../native/windows/README.md#authority-helper-modes).

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
