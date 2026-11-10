# Windows native provider

The Windows provider is a source-built C++20 x64 helper shared by React Native
Windows Fabric and React Native Win32 Paper. It implements the private FDR1
protocol over stdio and has no listener, managed runtime, Windows App SDK, or
third-party native dependency.

## Source layout

| Source                           | Responsibility                                                            |
| -------------------------------- | ------------------------------------------------------------------------- |
| `DesktopDriverHost.vcxproj`      | MSBuild project, C++20, warning level 4, static CRT                       |
| `src/host.*`                     | FDR1 request loop, cancellation, and command dispatch                     |
| `src/application.*`              | Launch/attach leases, process and window ownership                        |
| `src/automation.*`               | UI Automation tree, lookup, state, and opaque identities                  |
| `src/observation.*`              | Bounded `observe` sampler, request parsing, and response shaping          |
| `src/elementregistry.*`          | Element identity, revalidation fingerprints, and bounded retention        |
| `src/events.*`                   | WinEvent window notifications, bounded event log, and command journal     |
| `src/settlement.*`               | Bounded provider calls and the unsettled-mutation quarantine              |
| `src/input.*`                    | Physical/accessibility activation, keyboard, pointer, wheel, and recovery |
| `src/inputauthority.*`           | Desktop-session and integrity checks that gate physical input             |
| `src/inputlock.*`                | Session-local cross-process physical-input mutex                          |
| `src/capture.*`                  | HWND Windows Graphics Capture, D3D11, WIC PNG output                      |
| `src/framing.*` and `src/json.*` | Bounded FDR1 framing and JSON                                             |
| `src/driver.*`                   | Command surface and normalized provider results                           |
| `src/privatestorage.*`           | Owner-only record storage behind the `--private-storage` mode             |
| `src/serviceidentity.*`          | Process and loopback-listener checks behind `--service-identity`          |
| `src/applicationincarnation.*`   | Recorded-process liveness check behind `--application-incarnation`        |
| `src/winsecurity.*`              | Scoped handles and SID helpers shared by the authority modes              |
| `src/selftest.*`                 | Native parsing, state, cancellation, geometry, and recovery checks        |
| `src/authoritytests.*`           | Self-test cases for the authority modes                                   |
| `src/observationtests.*`         | Self-test cases for bounded observation and pinned records                |

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
- warning level 4, without `/WX`, Control Flow Guard, or `/sdl`, so a warning
  does not fail the build;
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
matches, and multiple qualified matches fail. Attach fails closed: a lease's
process must be in the helper's session and match the lease's executable or
AUMID, and an unleased attach fails as ambiguous when any titled candidate's
identity cannot be read rather than skipping it.
Leases record ownership, PID, process start, executable, the primary window,
and `containment`. Attached apps survive WebDriver deletion and helper
disposal (`external`); launched apps are closed only by their exact recorded
process identity.

Unpackaged arguments use the standard `CommandLineToArgvW` quoting rules.
Launch ownership requires a non-preexisting window from the exact created
process or a verified descendant, plus a matching canonical executable or
AUMID and a process start after the launch request. Reused packaged processes
fail with guidance to use attach mode. Cancellation, launch failure, session
cleanup, and helper disposal close only owned processes and retain the lease
when forced termination cannot be proven.

Launch and attach require the helper's window station to be interactive. An
unpackaged launch is containment `job-object`: the helper creates the process
suspended, assigns it to a Job Object of its own with
`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE` and no breakaway, and only then resumes it,
so every descendant starts inside the job. A failed assignment ends the
suspended process and fails the launch as unsupported instead of running it
uncontained. Window discovery then accepts only windows of job members in the
helper's session. When the leased window belongs to a descendant, a launch root
that is still running stays in the job and ends with the lease; the helper does
not close or terminate it after a successful launch. Closing the lease posts
`WM_CLOSE` to the leased process's windows and waits up to 5 seconds for it to
exit, then ends the job and waits up to 3 seconds for it to drain; an undrained
job fails `cleanup-failed` and keeps the lease so the close can be retried. If
the helper exits without closing, the operating system ends the job. Descendants
are ended by the job, not asked to close, and an application that starts
children with `CREATE_BREAKAWAY_FROM_JOB` fails inside the job. A packaged
activation is containment `uncontained`: the Application Activation Manager
starts it outside any job the helper owns, so closing the lease ends only the
identity-verified process whose window the helper leased (the activated process
or a verified descendant); other processes the application starts are not ended.
Closing it posts `WM_CLOSE`, waits up to 5 seconds, then terminates the process
and waits up to 2 more seconds for it to exit; a cancelled close stops waiting
and keeps the lease. Activation passes `AO_NOERRORUI`, so a failed activation
reports an error instead of showing one, and the activated process must report
the requested AUMID before the helper trusts it as the launch root, tracks it,
or ends it. A lease is created only when the leased process's start time can be
read, because that start time is what later tells the same process from a reused
process id. The helper never places an attached application in a job.

## Automation behavior

The helper provides:

- UI Automation lookup by `testID`, role, accessible name, and text;
- normalized element state with explicit unsupported values;
- live opaque window and element identity;
- physical SendInput click, keyboard, pointer, and wheel actions;
- accessibility activation where the control exposes a supported pattern;
- named UIA actions with opaque keys and live pattern revalidation;
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

Activation shares the input queue of whichever thread holds the foreground,
moving to the new holder when the foreground changes during the attempt. When
Windows still keeps the foreground away, `window-activation-failed` names the
holder by opaque window handle and process id, never by title or class, and the
first matching cause: no foreground window, another window of the target
application, an elevated or unreadable holder, a holder that is not responding,
a refused input-queue attachment, or a holder that took the foreground back.
Only the target's process may take the foreground itself during activation
(`AllowSetForegroundWindow` with its process id); other processes keep the usual
restriction.

Restoring, moving, resizing, and activating a window wait on the thread that
owns it. Before each, the helper sends the window `WM_NULL` through
`SendMessageTimeoutW` with `SMTO_ABORTIFHUNG`; a window that does not answer
within 2 seconds fails as `automation-failed` with reason `target-non-response`
instead of holding the helper and the physical input lock. The restore and move
themselves are posted (`ShowWindowAsync`, `SWP_ASYNCWINDOWPOS`), activation does
not share the input queue of a thread that Windows reports as hung, and the
helper's own polling for these steps checks cancellation between polls. The
probe does not cover a window that stops answering after it: activation's
`SetForegroundWindow`, `SetActiveWindow`, and `BringWindowToTop` can then still
block. A probe that Windows refuses for another reason, such as User Interface
Privilege Isolation, does not judge the window and leaves it to the steps that
follow.

A subtree walk retries while its root remains available if a descendant
becomes unavailable, or if a closing popup island's provider reports a UI
Automation timeout or an unspecified failure. Only an unavailable root is a
stale element.

### Named accessibility actions

The helper advertises `accessibilityActions` and `performAccessibilityAction`.
`accessibilityActions` reads the live element's supported UIA patterns and
returns parallel `actions` and `keys` arrays. Names are in this provider order:
`Invoke`, `Toggle`, `Expand`, `Collapse`, `Select`, `AddToSelection`,
`RemoveFromSelection`, `ScrollIntoView`. Only actions of supported patterns
are listed; an element without them returns two empty arrays. Legacy
IAccessible default actions are not part of this named surface.

Each key is an HMAC-SHA256 of the fixed pattern-and-method identity under a
random process secret, truncated to 32 hexadecimal characters. It is not a
display-name lookup. `performAccessibilityAction` refreshes the element and
its available patterns, requires exactly one matching key, and resolves that
pattern's current interface before invoking its exact method. A missing or
ambiguous key fails with `element-not-interactable`, reason `action-changed`,
and effect `none`; an expired element is `stale-element`. Dispatch uses the
same bounded mutation worker, effect ledger, and lease-scoped quarantine as
accessibility clicks. Neither names nor keys enter the native command journal.

The `observe` `actions` fact uses cached pattern-availability properties, so
listing actions adds no per-node provider calls to the bounded walk.

### Clear mechanisms

The helper advertises `strictClear`. `clear` writes an empty value through the
UIA Value pattern when the element exposes one that is not read-only, and
otherwise presses Ctrl+A and Delete after focusing the element. A request may
name `mechanism`: `semantic` only writes the value and fails
`element-not-interactable` with effect `none` when the pattern is missing or
read-only, and `keyboard` skips the write and takes the same input authority,
focus check, and physical input lock as the fallback. The value write uses the
bounded mutation worker, effect ledger, and lease-scoped quarantine, so a
`semantic` write that never settles is `mutation-indeterminate`. Every
successful clear returns `{ "mechanism": "semantic" | "keyboard" }`.

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
point, and so is a `performActions` `pointerDown` or `scroll` whose point is
covered by a window that neither belongs to a leased application nor is the
top-level window around one. Keys or buttons that `performActions` leaves down
keep the session's physical input lock until they are released, by
`releaseActions`, a later command, cancellation, or the helper's exit, so
another helper cannot interleave its input with them. A `SendInput` call that
injects fewer events than requested fails as `input-failed` and names UIPI, a
secure desktop, or blocked input.

`click` mode `auto` falls back to accessibility activation when physical input
is unavailable, and an explicit `physical` request reports `input-unavailable`.
Element `sendKeys` and the keyboard `clear` (the fallback, or a `keyboard`
mechanism) activate the target window and verify keyboard focus before sending
(a focus read that fails reports `automation-failed`, not
`element-not-interactable`), which is stricter than the macOS `clear`;
`performActions` activates only when the foreground belongs to another
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
evicts the least recently used unpinned records down to 90 percent of it, never
the observation in progress, a pinned record, or a pinned record's ancestors, so
a retained record never loses its parent to eviction. A replaced parent erases
its unpinned subtree. Elements without a runtime id mint a new id per
observation and are bounded only by the cap. `windowEvents` reports a
`retention` object with the retained count, the limit, and the helper's working
set and private bytes. The `stale-element` message says the window closed, a
different element reused its native identity, or the helper released it to
bound retained memory.

Records that `observe` emits are pinned: eviction never takes them, and they end
only through `releaseElements`, a replacement that reuses their native identity,
or their window ending (`closeWindow`, `closeApplication`, `dispose`, or a
destroy notification). `releaseElements` drops exactly the named records and
not their descendants, so a retained child keeps naming its released parent's
id, which then answers `stale-element`. A `tree`, `find`, or `snapshot` that
meets a pinned element returns its id and keeps the pin.

### Bounded observation

`observe` implements the
[bounded observation contract](../PROTOCOL.md#bounded-observation) and is
advertised as `boundedObservation` in `hello` and `probe`. It walks the control
view breadth first from the window root, or from a tracked `rootId` of that
window. Each family of children is paged with the cached tree walker, one
sibling per provider call, so `maxVisited`, `maxBytes`, and `deadlineMs` take
effect between any two siblings, and no `TreeScope_Subtree` cache is built.
Only the root read may start after the deadline; a read that ends after it is
abandoned without a record, and a provider call already in flight is bounded by
the UI Automation connection and transaction timeouts (2 and 5 seconds).

Nodes carry the same role, name, automation id, scope, and facts as `snapshot`,
with `rect` window-relative. A password field (`UIA_IsPasswordPropertyId`) never
reports `value` or `text`. Strings are cut to `maxStringLength` UTF-16 code
units without splitting a surrogate pair and named in `clipped`. Requested
`actions` lists the supported named UIA operations, including an empty list
for an element without an action pattern.
An element reachable twice (the same runtime id) is emitted once under its first
parent; elements without a runtime id are never taken for duplicates.

A pinned record needs room in the 20,000-record table. When pinned records and
the observation in progress fill it, the sample ends with the `references`
truncation instead of evicting an id an agent holds, and is empty when even the
root has no room. Known deviations from the macOS provider: a `maxVisited` equal
to the tree size reports `visited` with `unvisited` 0 because the walk stops
before learning that nothing remains, and a root read that outlasts the deadline
reports `unvisited` 0 because no child is paged after it.

On the Win32 fixture's 10,000-item tree, a 5,000-node sample takes about 4.6
seconds (about 0.9 ms per node, since each sibling is a separate call) and
repeats with identical ids; a 50 ms deadline answers in about 50 ms with a
partial sample.

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
The walk first caches the whole subtree in one UI Automation transaction, which
a tree past the limit can outlast on a slower machine. When that cache fails,
the helper counts the subtree one child at a time, stopping after 5,001 nodes,
so an oversized tree still fails with `tree-too-large`; a tree within the limit
keeps the retry and `automation-failed` behavior above.
`tree` and `find` are not incremental; use `observe` for a budgeted, partial
read of a large tree.

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

The bounded wait checks the command's cancellation every 50 ms, as does the wait
for a whole-subtree cache, so these waits stop soon after a cancel even when the
provider hangs. UI Automation calls made directly, outside the bounded wait,
such as pattern queries, `ElementFromHandle`, `observe` paging, and the tree
walker, are bounded only by the client's 2-second connection and 5-second
transaction timeouts. A cancelled read simply stops waiting. A cancelled
mutation is abandoned and quarantined exactly like one that timed out, so its
effect is `unknown` and the refusal says it was cancelled before it settled.

Click tries `Invoke`, `Toggle`, `SelectionItem`, `ExpandCollapse`, then
`LegacyIAccessible`. On Win32 controls `Invoke` is posted: the provider accepts
the call and the application applies the effect afterwards, so callers poll for
the visible result. Only a pattern the element does not implement moves on to
the next one, and only an element without any of them is unsupported; a pattern
query that fails otherwise fails as `automation-failed`, and one for an element
that went away as `stale-element`. Named accessibility actions and a `semantic`
clear classify their pattern queries the same way.

While quarantined, `click`, `clear`, `sendKeys`, `performActions`,
`performAccessibilityAction`, `activate`,
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

### Mutation effects

Failed and cancelled mutating commands (`activate`, `clear`, `click`,
`closeWindow`, `performAccessibilityAction`, `performActions`, `releaseActions`,
`sendKeys`, `setWindowRect`)
report an FDR1 `effect`, so Node can tell a rejection from a mutation that may
have reached the application (see [PROTOCOL.md](../PROTOCOL.md)). Reads and
lifecycle commands carry none.

The driver owns an `EffectLedger` (`src/settlement.*`) that `Driver::Execute`
resets and scopes to each command. It counts only primary mutations, at the
point they are dispatched:

- each UI Automation pattern action and value write (`Invoke`, `Toggle`,
  `Select`, `AddToSelection`, `RemoveFromSelection`, `ScrollIntoView`,
  `Expand`/`Collapse`, `DoDefaultAction`, `SetValue`), bracketed by
  `RecordDispatching()` and `RecordSettled()`;
- each window restore and move that `setWindowRect` posts, bracketed the same
  way, so a window that stops answering before the change lands leaves the
  effect `unknown`;
- every key, button, and wheel event that `SendInput` inserts into the input
  stream, and a posted `WM_CLOSE`, through `RecordDelivered()`. `SendInput`
  reports only completed injection, not how the application handled the events,
  so any insertion, even part of a refused batch, counts toward `partial`.

A pattern call that succeeds counts toward `partial`. One that returns a UI
Automation rejection (`UIA_E_ELEMENTNOTENABLED`, `UIA_E_ELEMENTNOTAVAILABLE`,
`UIA_E_NOTSUPPORTED`, `UIA_E_INVALIDOPERATION`) or `E_INVALIDARG`, `E_NOTIMPL`,
`E_NOINTERFACE`, or `E_ACCESSDENIED` did nothing. Any other result, including
`E_FAIL` and RPC failures, stays unresolved, so the failure reports `unknown` and
Node quarantines the target, and `mutation-indeterminate` is always `unknown`.
That can quarantine a target that was not changed, but it never lets a possibly
applied mutation be retried as a rejection. `target-quarantined` refuses before
anything is dispatched, so it reports `none`.

`partial` means part of the command reached the application, not that the
application finished handling it. Node quarantines the target for `partial` as
well, and only an authoritative re-observation of the application can establish
what changed.

Focus, activation (including its restore and `SetForegroundWindow`), pointer
moves, `pointerCancel`, and the modifier and depressed-input releases that clean
up around counted input are idempotent and not counted. A queued mutating
request that is cancelled before it starts reports `none`, a queued read reports
no `effect`, and neither ever runs. A cancel for an id the helper does not hold
also reports `none` (a settled request already reported its effect). A new
provider-side mutation must record itself in the ledger, through
`CountedMutation` in `src/automation.cpp` or the `Record*` functions, and be
listed in `IsTrackedMutation`.

## Authority helper modes

Three restricted one-shot modes of the same executable back the Node `/authority`
adapters `createWindowsPrivateStorage`, `describeWindowsService`,
`createWindowsServiceVerifier`, and `createWindowsApplicationProbe` (see
[the security model](../../references/security.md#windows-private-storage-and-service-verifier)).
They are not FDR1. Each reads one JSON request from standard input (at most
128 KiB, a leading byte order mark ignored), writes one JSON line to standard
output, and exits 0 exactly when the answer has `"ok":true`. A malformed request
answers `{"ok":false,"reason":"request"}`. A failure carries a fixed `reason`
category and optionally a `detail` and a `win32` error code, never a path or a
record's contents. Record contents travel as canonical base64 on standard input,
never on a command line.

`--private-storage` handles `open`, `read`, `publish`, and `remove`. `open`
names the root or defaults it to a per-user folder under the local application
data folder, creates a missing root atomically with an owner-only protected
DACL, validates the root and every ancestor, and answers the root's volume and
file identity. The other operations carry that identity back and answer
`identity` when the root was replaced or removed, so a root that was swapped for
another valid one is never adopted. Reasons are `request`, `name`, `root`,
`ancestor`, `owner`, `dacl`, `reparse`, `links`, `type`, `volume`, `path`,
`identity`, `size`, `encoding`, `exists`, and `io`. Publication writes a
temporary file under the owner-only descriptor and renames it without replacing,
so an existing record answers `exists`. A crash between the two steps can leave a
temporary file of at most 16 KiB.

`--service-identity` handles `describe` and `verify`. `describe` answers the
identity of a live process of the current user in the current interactive
session, or `ok:false` with `process`, `user`, `session`, `exited`, or
`request`. `verify` takes a claim and a loopback URL and answers `ok:true` with
`verified:true`, or `verified:false` with the first check that failed: `url`,
`claim`, `start`, `image`, `session`, `listener`, `exited`, `process`, or
`user`. It holds the process open while it checks, and a listener counts only
when every listening TCP socket that can accept a connection to the address,
including a wildcard listener on the same port, belongs to the claimed process.

`--application-incarnation` takes exactly `{"pid":...,"startedAt":...}` and
answers `{"ok":true,"state":...}` for settlement recovery. It opens the process
for limited query and synchronization only. `exited` needs proof: the process id
names no process (`ERROR_INVALID_PARAMETER`), the process holding it has exited,
or it names a process created more than one second after `startedAt`. A creation
time within 10 ms is `running`; access denied, an earlier creation time, and
everything else are `unknown`.

## Verification and tests

Run package tests first, then the opt-in native contract:

```powershell
yarn test
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn test --runInBand
```

The contract builds and resolves the helper, validates cache reuse and
handshakes, runs the native self-test, checks that a malformed frame fails the
transport (the self-test also covers a non-object frame), and verifies shared
Windows/Win32 selection. A second suite builds the test-only Win32 fixture (`fixtures/win32` in the repository, not published) and drives it
through the helper: window events, owned popups, hung and stuck providers, large
trees, bounded retention, and application containment (a contained launch whose
descendant ends on close and when the helper is killed, and an external fixture
that survives attach, close, and disposal). `yarn test --runInBand win32Fixture` runs only
that suite. A third suite serves the same fixture through a grant-protected
Desktop Driver service with the helper behind it: unauthenticated requests reach
no helper call, sessions keep their owner, a revoked grant closes its
application, and a stuck call quarantines the target until the launched
application is closed. `yarn test --runInBand protectedService` runs only that
suite.

`yarn test --runInBand operations.contract` exercises the agent operation
routes against the same fixture. It activates the window and sends physical
pointer and keyboard input, so it requires an unlocked interactive desktop.
It covers cited and selector-based actions, ambiguity rejection, checks and
bounded waits, sequence stop behavior, paged window and element captures,
named Invoke/Toggle, privacy, and an unsettled named action whose late
completion does not lift quarantine. When
`FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES` disables input, as on
GitHub-hosted runners, this suite and the fixture suite skip the scenarios that
need a disabled feature or window capture; hosted Windows Graphics Capture
cannot create a capture item. Those skips are not a pass.

Three more suites drive only the authority modes against the real helper. They
need no application and never touch the per-user default root.
`privateStorage` checks byte-exact round trips, exclusive and concurrent
publication, a replaced or removed root, a junction root, a second hard link,
and an ACL that grants another principal access. `serviceIdentity` uses real
child processes and a loopback listener (IPv4 and, where the machine has it,
IPv6) to check `describe`, claims whose start time, image, or session differ, a
case-different image path, an address nobody serves, and an exited process.
`applicationIncarnation` probes a real child process at its recorded start, at a
much earlier and a later start, and after it exits. Run them with
`yarn test --runInBand privateStorage.contract`,
`yarn test --runInBand serviceIdentity.contract`, and
`yarn test --runInBand applicationIncarnation.contract`.

The helper self-test (`furn-desktop-driver-host.exe --self-test`) covers
settlement, element identity, retention, input authority, and event bookkeeping
against offscreen windows. Lock, disconnect, and integrity transitions are
exercised through injected state, not by changing the real desktop. It also
covers the authority modes: the record-name, base64, UTF-8, root, ancestor-ACL,
URL, and listener rules; an owner-only store in a scratch directory with its
tamper and race cases; and `describe` and `verify` against this process, a child
process, and a loopback listener. A case the machine cannot host prints an
`info` line and is skipped. Bounded observation is covered by a synthetic
provider (each truncation reason alone, duplicates, cycles, stale and unreadable
elements, a stalled read, cancellation, secure fields, clipping, and 300
randomized trees), by pinned-record registry cases, and by `observe` and
`releaseElements` against a real window. With
`FURN_DRIVER_SELF_TEST_OBSERVATIONS` set to a file path, the self-test writes
its synthetic samples there, and the native contract checks each one with the
Node validator.

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
registration), 200% and mixed-monitor DPI, live lock,
disconnect, and integrity transitions, a hung React Native app, and menu popups.

The agent operation routes have also passed against the plain Win32 fixture
at 100% and 150% scale: hit-tested physical click, keyboard type/clear,
semantic activation, named Invoke/Toggle, checks, sequences, and captures.
The status crop measured 440 x 20 and 660 x 30 pixels respectively; visual
inspection confirmed the whole status text was aligned in each crop.
`desktop-test serve --agent` and the no-argument MCP adapter were exercised
at both scales with an external fixture: owner-only default descriptor,
live service verification, resolved target identity, launch refusal, attach,
act/check, hash-verified capture resources, and descriptor removal while the
attached app survived. Shutdown used the CLI's stop handler through a
test-only IPC bridge, not a physical console Ctrl+C. These fixture results
do not qualify either React Native renderer's new agent-operation path.

Application containment passed the fixture contract and two launch probes
through `desktop-test serve --agent`: when the helper was killed, a REX
FluentTester launch on Win32 Paper (`job-object`) ended with it, and the
packaged Storybook app on Windows Fabric (`uncontained`) survived. The
foreground-refusal causes are self-tested only; a live Windows Fabric
physical click has not been rerun.

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
