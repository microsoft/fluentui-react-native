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
| `src/elementregistry.*`          | Element identity, revalidation fingerprints, and bounded retention        |
| `src/events.*`                   | WinEvent window notifications, bounded event log, and command journal     |
| `src/settlement.*`               | Bounded provider calls and the unsettled-mutation quarantine              |
| `src/input.*`                    | Physical/accessibility activation, keyboard, pointer, wheel, and recovery |
| `src/inputauthority.*`           | Desktop-session and integrity checks that gate physical input             |
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

Unpackaged launch also accepts a server-owned `workingDirectory`, which must
be an existing absolute directory. Packaged activation rejects that override.
The helper validates and honors the server-owned `launchTimeoutMs`.

Snapshots expose required-form state from cached `UIA_IsRequiredForFormPropertyId`
with provider defaults disabled. A missing, unsupported, or non-Boolean native
value remains unsupported rather than becoming `false`.
Accessibility help text uses cached `UIA_HelpTextPropertyId` with defaults
disabled. An explicit empty string is supported; absent or non-string values
remain unsupported.

Attach accepts an owner-generated nonce-bound lease, or an exact title
qualified by the canonical executable or AUMID. Title-only attach, zero
matches, and multiple qualified matches fail.
Leases record ownership, PID, process start, executable, and the primary window.
Attached apps survive WebDriver deletion; launched apps are closed only by
their exact recorded process identity.

Unpackaged arguments use the standard `CommandLineToArgvW` quoting rules.
Launch ownership requires a non-preexisting window from the exact created
process or a verified descendant, plus a matching canonical executable or
AUMID and a process start after the launch request. Reused packaged processes
fail with guidance to use attach mode. Cancellation, launch failure, session
cleanup, and helper disposal close only causally owned processes and retain
the lease when forced termination cannot be proven.

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

Another absolute pointing device on the same desktop, such as a remote-desktop
or virtual-machine viewer, can move the cursor back to its own position shortly
after an injected move. Element clicks therefore confirm that the pointer
reached the target (retrying that placement, which presses nothing), then
inject the press and release as one `SendInput` batch whose events each carry
the target coordinate. The batch is never interleaved with other input, so the
press cannot land under a cursor that another source moved. Explicit pointer
actions also carry their coordinate on every press and release.

Keyboard actions inject a character that the foreground keyboard layout types
with one unmodified key, such as `s` on a US layout, as that virtual key, as a
user's press would. Applications then observe its key and code, so key-based
handlers such as type-ahead match it. Other characters, dead-key characters,
and letters while Caps Lock is on are injected as Unicode packets. Element
`sendKeys` text always uses Unicode packets.

Windows and Win32 share implementation but retain distinct endpoint and
renderer capabilities. Minimized-window capture remains unsupported rather
than changing app state through an implicit restore.

Window activation treats a foreground window owned by the target window as
already active, as macOS does for application activation. Reactivating the
owner would light-dismiss an open popup with input that no user produced. A
physical press on the owner still activates it.

A subtree walk retries while its root remains available if a descendant
becomes unavailable, or if a closing popup island's provider reports a UI
Automation timeout or an unspecified failure. Only an unavailable root is a
stale element.

### Window events and identity

Window lifecycle comes from out-of-context `SetWinEventHook` notifications
(foreground, menu, dialog, minimize, object create/destroy/show/hide, and name
change) received on one dedicated message-loop thread. The callback only records
a bounded entry and never calls UI Automation or COM. The log keeps the newest
512 events, and `windowEvents` returns up to 512 events with the last 64 helper
commands (128 are retained), the tracked windows, the window publication, and the
retention counters below. A tracked window that the platform reports destroyed
publishes `window-closed` once; `closeWindow` publishes none for the id it
closed.

Events are advisory. When a hook cannot be installed, `windowEvents` reports
`observing: false` with `registrationFailures`, and `IsWindow` polling, which is
authoritative for liveness, takes over. Windows reuses window handles, so a
tracked id also records the owning thread and window class and is retired when
either differs. A recycled handle of the same class on the same thread whose
destroy notification was never delivered is indistinguishable. Event delivery
across integrity levels is untested.

### Input authority

Before physical input the helper evaluates the desktop it would inject into and
refuses with `input-unavailable` when the session is not active, the session is
locked, the process is not on `WinSta0`, the input desktop is not `Default`
(lock screen, UAC prompt, screen saver), or the input desktop cannot be opened
and the cursor cannot be read. The message names the cause. The helper re-reads
the environment on every operation (about 0.2 ms), so a lock or disconnect after
an earlier success is noticed.

User Interface Privilege Isolation is checked against the target's process for
click and focus, and against the foreground window's process for keyboard
actions. A target at a higher integrity level than the helper, or whose token
cannot be read because access is denied, is unavailable; other read errors defer
to the later window and element checks. A click is refused as
`element-not-interactable` when another application's window covers the click
point. A `SendInput` call that injects fewer events than requested fails as
`input-failed` and names UIPI, a secure desktop, or blocked input.

`click` mode `auto` falls back to accessibility activation when physical input
is unavailable, and an explicit `physical` request reports `input-unavailable`.
Element `sendKeys` and the physical `clear` fallback activate the target window
and verify keyboard focus before sending, which is stricter than the macOS
`clear`; `performActions` activates only when the foreground belongs to another
application. The helper has no `uiAccess` manifest, and the occlusion check
detects only windows of other applications.

### Element identity and retention

An element id comes from a process-wide monotonic counter and is never reused,
so a dropped id can only fail as `stale-element`. Each retained record carries a
fingerprint of process id, control type, `AutomationId`, and class name, and the
helper revalidates the live element against it before every action. The name is
excluded because it legitimately changes. A conflict exists only when a value
known on both sides differs, and the fingerprint is a precondition, not proof:
an element whose `AutomationId` legitimately changed is treated as replaced.

Retention is a generation-based LRU capped at 20,000 elements. Exceeding the cap
evicts the least recently used records down to 90 percent of it, never the
observation in progress, and stamps ancestors so a retained record never loses
its parent. A replaced parent erases its subtree. Elements without a runtime id
mint a new id per observation and are bounded only by the cap. `windowEvents`
reports a `retention` object with the retained count, the limit, and the
helper's working set and private bytes. The `stale-element` message says the
window closed, a different element reused its native identity, or the helper
released it to bound retained memory.

### Hit testing

`hitTest` resolves the topmost window at a screen point. When no window owns the
point the result is no element, and nothing is registered. A window of another
process, or a hit element that belongs to another process, is returned as a
synthetic `external-window` element ("External desktop window") instead of
registering a foreign tree, so a test can tell that it landed outside the
application.

### Provider failures, hangs, and large trees

Provider errors carry the named UI Automation result, for example "The UI
Automation element is not enabled (0x80040200)". A disabled element fails as
`element-not-interactable`. A live window whose provider does not answer fails
as `automation-failed` ("did not respond (0x80131505)") and does not quarantine.
Against an application whose UI thread is blocked, reads fail after about two
seconds and an element click after about five, while `windows`, `closeWindow`,
and `closeApplication` keep answering.

A subtree walk is bounded to 5,000 nodes and fails with `tree-too-large` beyond
that. `find` walks the same bounded subtree, so a window with more than 5,000
nodes cannot be searched from its root; a scoped search walks only the scope's
subtree. On the Win32 fixture a read costs about 0.4 ms per node: 4,900 nodes
take 1.9 to 2.2 seconds, and a 10,000-item tree fails after 3.8 to 4.3 seconds.
Reads are not incremental yet. Bounding them needs per-level reads with
completeness fields, an FDR1 and Node type change that must land with macOS (see
[the plan](../../references/remaining-work.md)).

### Unsettled mutations

UI Automation mutations (`SetFocus`, `Invoke`, `Toggle`, `Select`,
`Expand`/`Collapse`, `DoDefaultAction`, and `SetValue`) run on a bounded worker
with a five-second deadline because a suspended or busy application can stall
its UI thread indefinitely. A deadline does not cancel the provider call: the
application can still apply the effect later. The helper therefore reports
`mutation-indeterminate` and quarantines its session instead of treating the
timeout as a rejection, so nothing replays the call or interleaves new input
with a late effect. A UI Automation or RPC timeout that the provider itself
reports from a mutation is treated the same way, because the call reached the
application and its effect is unknown. An explicit rejection, such as a disabled
element, is an ordinary error and does not quarantine.

Click tries `Invoke`, `Toggle`, `SelectionItem`, `ExpandCollapse`, then
`LegacyIAccessible`. On Win32 controls `Invoke` is posted: the provider accepts
the call and the application applies the effect afterwards, so callers poll for
the visible result.

While quarantined, `click`, `clear`, `sendKeys`, `performActions`, `activate`,
and `setWindowRect` fail with `target-quarantined` before reaching the
application, for every window the helper drives, and the physical `clear`
fallback never runs after an unsettled `SetValue`. Observation commands,
`releaseActions`, application and window close, and `dispose` stay available so
the application can be re-observed and depressed input released. Reads remain
subject to their own timeouts. A late completion is reported in the refusal but
does not lift the quarantine, because its effect is still unverified. A stalled
read fails as `automation-failed` and does not quarantine.

The helper records each unsettled mutation against the lease of the application
it acted on, though the refusal stays session-wide while any record exists.
`closeApplication` ends the records of a launched application once it has
verified that the process exited, because nothing that application left in
flight can land any more, so the next session on the same helper can mutate. An
attached application keeps running, so its records stay and only restarting the
helper session ends them. A mutation whose lease cannot be resolved is recorded
without one, and no close releases it. The refusal says so: closing the launched
application ends the quarantine, otherwise restart the helper session once the
application is safe.

The quarantine lives in the helper process, so it ends with the helper. It does
not yet persist across helper restarts or provide an operator `recover`
operation; an unsettled call can still land after the helper exits. See
[the remaining-work plan](../../references/remaining-work.md).

## Verification and tests

Run package tests first, then the opt-in native contract:

```powershell
yarn test
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn test --runInBand
```

The contract builds and resolves the helper, validates cache reuse and
handshakes, runs the native self-test, exercises malformed-frame recovery, and
verifies shared Windows/Win32 selection. A second suite builds the test-only
Win32 fixture (`fixtures/win32` in the repository, not published) and drives it
through the helper: window events, owned popups, hung and stuck providers, large
trees, and bounded retention. `yarn test --runInBand win32Fixture` runs only
that suite. A third suite serves the same fixture through a grant-protected
Desktop Driver service with the helper behind it: unauthenticated requests reach
no helper call, sessions keep their owner, a revoked grant closes its
application, and a stuck call quarantines the target until the launched
application is closed. `yarn test --runInBand protectedService` runs only that
suite.

The helper self-test (`furn-desktop-driver-host.exe --self-test`) covers
settlement, element identity, retention, input authority, and event bookkeeping
against offscreen windows. Lock, disconnect, and integrity transitions are
exercised through injected state, not by changing the real desktop.

Real qualification must run against the target React Native app. Use an
interactive runner for physical click, keyboard, wheel, multi-window, capture,
and 100/150/200 percent DPI checks. Hosted capability skips are not a physical
input pass.

### Qualification status

This helper has passed the native self-test, the fixture contract, and a focused
React Native Win32 Paper smoke on Windows 11 x64 in an RDP session:
`yarn storybook smoke --win32 --mode stories-and-tests` with
`STORYBOOK_SMOKE_STORY` selecting the button, checkbox, input, and callout
authored tests rendered the full 176-story catalog and ran 5 authored tests (pointer activation,
toggle, keyboard input and clear, native popup) with no failures. Not yet
qualified: Windows Fabric (it needs a native build and packaged app
registration), DPI scaling beyond the machine's current setting, live lock,
disconnect, and integrity transitions, a hung React Native app, and menu popups.

CI must build this helper explicitly into a job-local cache, run the opt-in
native contract once for the shared Windows/Win32 provider, verify each
endpoint with `desktop-driver doctor`, and set
`FURN_DESKTOP_DRIVER_BUILD_POLICY=never` before Storybook prep or smoke. This
keeps compilation outside the app lifecycle and turns compatibility drift into
an actionable cache failure.

See [Native helpers](../../references/native-helpers.md) for cache and
verification policy, [CI integration](../../references/ci-integration.md) for
runner requirements, and
[microsoft/fluentui-react-native#4345](https://github.com/microsoft/fluentui-react-native/issues/4345)
for unfinished Windows qualification.
