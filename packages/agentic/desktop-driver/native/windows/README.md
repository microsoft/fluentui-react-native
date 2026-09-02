# Windows native provider

The Windows provider is a source-built C++20 x64 helper shared by React Native
Windows Fabric and React Native Win32 Paper. It implements the private FDR1
protocol over stdio and has no listener, managed runtime, Windows App SDK, or
third-party native dependency.

## Source layout

| Source                           | Responsibility                                                            |
| -------------------------------- | ------------------------------------------------------------------------- |
| `DesktopDriverHost.vcxproj`      | Warning-clean MSBuild project, C++20, static CRT                          |
| `src/host.*`                     | FDR1 request loop, cancellation, and command dispatch                     |
| `src/application.*`              | Launch/attach leases, process and window ownership                        |
| `src/automation.*`               | UI Automation tree, lookup, state, and opaque identities                  |
| `src/input.*`                    | Physical/accessibility activation, keyboard, pointer, wheel, and recovery |
| `src/inputlock.*`                | Session-local cross-process physical-input mutex                          |
| `src/capture.*`                  | HWND Windows Graphics Capture, D3D11, WIC PNG output                      |
| `src/framing.*` and `src/json.*` | Bounded FDR1 framing and JSON                                             |
| `src/driver.*`                   | Command surface and normalized provider results                           |
| `src/selftest.*`                 | Native parsing, state, cancellation, geometry, and recovery checks        |

The Node build coordinator is
`../../src/native/windows/buildWindowsDriver.ts`; runtime adaptation is under
`../../src/hosts/native`.

## Toolchain and build

Requirements:

- Windows 11 x64;
- Visual Studio 2022 with **Desktop development with C++**;
- an installed MSVC x64 platform toolset;
- a Windows 10 or Windows 11 SDK.

Build from any consumer that can resolve the package:

```powershell
desktop-driver build-driver --platform windows
desktop-driver build-driver --platform win32
```

Both endpoints resolve the same provider. The coordinator uses `vswhere.exe` to
locate Visual Studio, selects the newest installed MSVC toolset and Windows SDK,
and invokes the checked-in project with:

- x64 platform;
- Debug or Release configuration;
- `/MT` static runtime;
- no restore;
- external intermediate and output directories;
- generated source/build identity outside the package.

No CMake, NuGet restore, .NET runtime, or Windows App SDK is required by the
helper.

## Application identity

Launch requires:

- `aumid` for a packaged app or `executablePath` for an unpackaged app;
- an exact `windowTitle`;
- optional fixed, server-owned arguments.

Attach accepts an owner-generated nonce-bound lease, or an exact title only
when it resolves to one live process/window. Zero or multiple matches fail.
Leases record ownership, PID, process start, executable, and the primary window.
Attached apps survive WebDriver deletion; launched apps are closed only by
their exact recorded process identity.

## Automation behavior

The helper provides:

- UI Automation lookup by `testID`, role, accessible name, and text;
- normalized element state with explicit unsupported values;
- live opaque window and element identity;
- physical SendInput click, keyboard, pointer, and wheel actions;
- accessibility activation where the control exposes a supported pattern;
- window activation and hit testing;
- complete source/tree output;
- occlusion-independent window capture and scaled element crops through
  Windows Graphics Capture and WIC;
- exact input release on cancellation, teardown, or restricted crash recovery.

Physical input requires an unlocked interactive desktop and compatible user
session/integrity. The helper advertises capability unavailability instead of
fabricating a pass.

Windows and Win32 share implementation but retain distinct endpoint and
renderer capabilities. Minimized-window capture remains unsupported rather
than changing app state through an implicit restore.

## Verification and tests

Run package tests first, then the opt-in native contract:

```powershell
yarn test
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn test --runInBand
```

The contract builds and resolves the helper, validates cache reuse and
handshakes, runs the native self-test, exercises malformed-frame recovery, and
verifies shared Windows/Win32 selection.

Real qualification must run against the target React Native app. Use an
interactive runner for physical click, keyboard, wheel, multi-window, capture,
and 100/150/200 percent DPI checks. Hosted capability skips are not a physical
input pass.

See [Native helpers](../../references/native-helpers.md) for cache and
verification policy, [CI integration](../../references/ci-integration.md) for
runner requirements, and [PLAN.md](../../PLAN.md) for unfinished Windows
qualification.
