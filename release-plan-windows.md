# Desktop packages release plan: Windows lane

This file is the Windows machine's part of the release plan for `desktop-driver`, `desktop-test` and `desktop-mcp`.
It is self-contained for the Windows work. The overall plan, the release scope and the macOS lane are in
[release-plan.md](./release-plan.md). Review IDs (P1-3, P2-23 and so on) refer to findings in
[release-review.md](./release-review.md); line numbers there were recorded at `2fa16ddb8`, so confirm each location
before editing.

- **Branch:** `user/jasonvmo/driver-release`, shared with the macOS machine.
- **Goal:** fix the Windows-only defects, verify the shared TypeScript fixes on Windows, and qualify Windows Fabric
  and Win32 Paper at the candidate SHA that the macOS lane declares.
- **The macOS lane** owns shared TypeScript, Swift, packaging, changesets, CI and most documentation. Check section 11
  of `release-plan.md` for the SHAs of shared changes you must verify, and for the candidate SHA.

## 1. Setup

1. Sync the branch (the macOS lane pushes the plan files in its Phase 0):

   ```powershell
   git fetch origin
   git switch user/jasonvmo/driver-release
   git pull --ff-only
   yarn install --immutable
   yarn build
   ```

2. Read these before changing code:
   - `AGENTS.md` at the repository root, `packages/agentic/desktop-driver/AGENTS.md` and
     `packages/agentic/desktop-test/AGENTS.md`.
   - The native component skill, `.github/skills/implement-native-component/SKILL.md`. It applies to every C++
     change.
   - `packages/agentic/desktop-driver/references/contributing.md` (native change rules and validation order) and
     `native/windows/README.md`.
   - `packages/agentic/desktop-test/references/native-qualification.md`, sections "Neutral Windows application
     ownership", "Windows fixture and hosted selection", "Windows Fabric and Win32 Paper" and "Cleanup and endpoint
     limits".
3. Confirm the toolchain: Visual Studio with the C++ desktop workload and Windows SDK, and Windows App Runtime 1.8
   registered for the user (Windows Fabric). Record the OS caption, build number and architecture:
   `(Get-CimInstance Win32_OperatingSystem).Caption`, `.BuildNumber`, `$env:PROCESSOR_ARCHITECTURE`.

## 2. Rules

**Git:**

- Never force-push, never amend a pushed commit, and never rebase shared history. `git pull --rebase` is fine for
  your own unpushed commits. Only the macOS lane merges `origin/main` into the branch.
- Make small commits that touch only the files you own, and push after each finished item.
- If a pull conflicts in a file the macOS lane owns, keep its version and redo your change on top, or ask through
  the mailbox.

**Files you own:**

- `packages/agentic/desktop-driver/native/windows/**`, including `native/windows/README.md` and
  `DesktopDriverHost.vcxproj`.
- `packages/agentic/desktop-test/src/ownership.ts`, `src/windowsOwnership.test.ts` and `src/signals.ts`.
- `packages/agentic/desktop-driver/src/native/nativeDriver.ts` (only the P3-DRV-11 rename sites) and the win32 gate in
  `src/native/nativeCache.test.ts`. Start these **only after** the macOS lane posts the SHAs for R1-DRV-3 and
  R1-DRV-7 in its section 11; those touch the same files.
- The Windows and Win32 sections of the `current-status.md` files of `desktop-driver`, `desktop-test` and
  `storybook-desktop`.
- New changeset files that you create (section 6), and this file.

Everything else belongs to the macOS lane. For a change in a macOS-owned file (for example, a Windows ownership
`reason` value in `native/PROTOCOL.md`), send the exact change through the mailbox.

**Messages:** use the macOS↔Windows mailbox in the workflow repository,
`workstreams/engineering/react-native/fluent/agentic-authoring/infrastructure-readiness/desktop-test-driver/handoff/`,
following its `PROTOCOL.md` (one file per message, named `YYYYMMDDTHHMMSSZ-<from>-to-<to>-<slug>.md`). Record
progress only in section 9 of this file.

**Repository rules:**

- No barrel exports. Regular expressions stay linear-time, and no values are spliced into code that runs, tests
  included (R-SCAN-001, R-SCAN-002).
- Each helper behavior change needs a native self-test. If a protocol message or error changes, the macOS lane
  updates `native/protocol.json` and `native/PROTOCOL.md` together; send it the change.
- Displayed text never enters an error message, and unsupported is never reported as `false`.
- Report every check as passed, failed, skipped, not run or unsupported. JavaScript tests don't qualify native
  behavior, and a hosted skip is not a pass.

## 3. R0: Windows fixes before #4509 merges

### W-R0-1. Initialize UI Automation before `HasWindowContent` (P1-3)

- **Defect:** `Automation::HasWindowContent` (`native/windows/src/automation.cpp`, around lines 477-494) copies
  `automation_` and `contentWalker_` and calls `automation->ElementFromHandle(...)` on a worker thread without
  calling `Initialize()`. Every other `Automation` entry point calls `Initialize()` first. `ApplicationManager::Windows`
  (`application.cpp`, around lines 1961-1968) calls it for any visible, untitled, owned `WS_EX_TOOLWINDOW` or
  `WS_POPUP` window, and `driver.cpp` (around lines 638-648) runs it for the `windows` command. `SessionManager` lists
  windows right after attach or launch, so attaching to an app that already shows a Callout or flyout crashes the
  helper with an access violation, and every retry crashes the same way.
- **Fix:** call `Initialize()` at the top of `HasWindowContent` (or before the `windows` command runs), and fail with
  `automation-failed` instead of dereferencing a null client.
- **Self-test:** the current self-test injects a fake `hasContent` (`selftest.cpp`, around line 1552), so it never
  reaches this path. Add one that runs the real `windows` command in a fresh helper, before any `find`, `snapshot` or
  `observe`, against an application that owns an untitled tool or popup window.
- **Qualification:** Q7 in section 7.

### W-R0-2. Clamp wheel and pointer values before integer conversion (P1-4, Windows part)

- **Defect:** `native/windows/src/input.cpp` (around lines 426-438) computes
  `static_cast<DWORD>(static_cast<int>(-RoundToPixel(deltaY)))`. `RoundToPixel` (`geometry.cpp:20-25`) maps
  non-finite values to 0 but returns `std::llround(value)` as `long` with no range check, which is undefined for large
  values; the `int` cast is undefined too.
- **Fix:** clamp the `double` to a safe range before rounding, and clamp to the target integer range before each
  cast. Audit the other places a protocol `double` becomes an integer (pointer coordinates through
  `ClientDipsToPhysicalPoint`, rectangles, durations) and apply the same rule.
- **Self-test:** send wheel deltas of `1e300` and `-1e300` and a pointer move to `x: 1e300` straight to the helper.
  Each is clamped or refused with `invalid-params`, and the helper keeps running.
- **Also verify** the macOS lane's Node validation (R0-5 in `release-plan.md`): on Windows, a W3C wheel action with
  `deltaY: 1e300` is refused with `invalid argument` before it reaches the helper.

### W-R0-3. Recover an abandoned input mutex with an empty ledger (P1-5, Windows parity)

- **Background:** the macOS lane changes `NativeDesktopHost.recoverInput()` so that `--release-input` runs after
  every unexpected helper exit, even with an empty pressed-input record. A non-zero exit from `--release-input` makes
  Node reject with `input-recovery-failed`.
- **Windows today:** the lock is a named mutex (`native/windows/src/inputlock.cpp`, around lines 52-96). After a
  helper dies holding it, the next acquirer with the `Fail` policy gets `WAIT_ABANDONED`, releases the mutex, and fails
  `input-busy` once; after that the mutex is healthy. `ReleaseInputFromLedger()` (`main.cpp`, around lines 61-90)
  deliberately uses a non-acquiring `PhysicalInputScope()` for an empty ledger, so recovery doesn't touch the mutex.
- **Fix:** for an empty ledger, try the mutex with a **zero timeout**:
  - `WAIT_ABANDONED`: adopt it and release it, which clears the abandoned state.
  - `WAIT_OBJECT_0`: release it at once.
  - `WAIT_TIMEOUT` (a live helper holds it): do nothing.
  - Physical input unavailable: do nothing.
- **Result:** in every case, exit 0 with `{"releasedKeys":0,"releasedButtons":0}`. Recovery must never wait for a
  live holder and must not add failures on hosted runners or the masked lane.
- **Self-tests** (use the existing test mutex-name hook in `inputlock.cpp`): an abandoned mutex is adopted and the
  next `Fail`-policy acquire succeeds; a mutex held by another live thread returns promptly without being taken; an
  empty ledger with physical input unavailable exits 0.
- **Verify the Node change on Windows** once the macOS lane posts its SHA: run the desktop-driver unit tests, and the
  kill test in Q7.

### W-AUDIT-1. Check pointer origins for a zero-rectangle fallback (P1-6 parity)

On macOS, pointer actions land at screen position (0,0) when an origin's geometry can't be read. Check the Windows
pointer origin resolution (`driver.cpp` and `input.cpp`) for element and viewport origins: an unreadable or empty
rectangle must be refused with `move target out of bounds` and effect `none`, never converted to (0,0). Record the
result in section 9. Fix it, with a self-test, only if Windows has the same defect.

### W-VERIFY. Shared TypeScript fixes on Windows

When the macOS lane posts each SHA, pull and confirm on Windows:

- **R0-3 (P1-2):** `connectDesktopWebdriver` sets `connectionRetryCount: 0`. The desktop-driver tests pass, and the
  Windows smoke (Q6) shows no duplicated requests after a failed click.
- **R0-5 (P1-4)** and **R0-6 (P1-5):** as described in W-R0-2 and W-R0-3.
- **R0-9 (P2-10):** the `boundedCommand` stress loop (Q3) passes on Windows. The test asserts `SIGKILL` only off
  win32; make sure the new readiness handshake works on Windows too.

Mark each one verified in the table in `release-plan.md` section 11 through the mailbox, or ask the macOS lane to
mark it.

## 4. R1: Windows fixes before release

Each item is time boxed. If an item can't be finished, record it as a known limitation in the Windows section of the
owning package's `current-status.md`, mark it deferred in section 9 with its tracking issue, and tell the macOS lane
so it adds the item to section 8 of `release-plan.md`.

### W-R1-1. Accept a real supervisor claim in Windows crash recovery (P2-23)

- **Defect:** `recoverWindowsDesktopWorkloadClaim` (`desktop-test/src/ownership.ts`, around lines 330-335) requires
  `resource.id === 'webdriver'`. The real service scope prefixes every resource ID with the run ID
  (`DesktopServiceScope.createResource`, `services.ts` around line 316, constructed with `reporter.runId` in
  `supervisor.ts` around line 77), so a real claim records `${runId}:webdriver`. Only the synthetic claim in
  `windowsOwnership.test.ts` (around line 443) passes. Recovery after a crash therefore always fails closed, and the
  lock must be removed by hand.
- **Fix:** accept the driver resource only when its ID is exactly `${record.owner.runId}:webdriver` (confirm the
  field name in the claim record), its identity is `driver-service:${targetId}:${targetInstanceId}` (written at
  `supervisor.ts` around line 276), and `serviceReady` is absent. Check every other resource-ID comparison in the
  recovery path for the same prefix assumption. Anything not proven stays fenced.
- **Tests:** replace or supplement the synthetic claim with one written by the real `DesktopServiceScope` and
  supervisor resource path, and feed it into recovery. Add a negative case: a `webdriver` resource from another run ID
  stays fenced. Keep the tests platform-neutral if the surrounding tests are, so CI covers them on every OS.
- **Docs:** `desktop-test` `README.md:83` and `references/lifecycle.md:250` (macOS-owned) describe this
  reconciliation. Tell the macOS lane when W-R1-1 lands, or that it was deferred, so it keeps or corrects those lines.
- **Qualification:** the crash-recovery run in Q7.

### W-R1-2. Retry claim release on sharing violations, and handle SIGBREAK (P3-TST-2, P3-TST-6)

- **Claim release:** the `fs.unlinkSync(filename)` calls in `ownership.ts` (around line 204 in `release()` and
  around line 363 in recovery) have no retry for a transient Windows sharing violation. `replaceFileAtomically`
  (around lines 520-540) already retries `EPERM`, `EACCES` and `EBUSY` ten times, 25 ms apart, on win32 only. Move
  that loop into a small local helper and use it for both unlinks. Keep the ownership content check immediately
  before the unlink, and don't retry any other error.
- **SIGBREAK:** `signals.ts:10` lists `SIGINT`, `SIGTERM` and `SIGHUP`. On win32, add `SIGBREAK` (Ctrl+Break) so it
  counts as an interrupt like the others. The exit status for the third interrupt already uses
  `os.constants.signals[signal]`.
- **Tests:** a unit test for the retry (a mocked `unlinkSync` fails with `EBUSY` twice and then succeeds; `ENOENT` is
  not retried), and a win32-gated test that emitting `SIGBREAK` calls `stop`.

### W-R1-3. Retry cache renames on Windows (P3-DRV-11)

**Start only after** the macOS lane posts the SHAs for R1-DRV-3 (P2-6) and R1-DRV-7 (P3-DRV-10) in section 11 of
`release-plan.md`. Pull them first; they change the same files.

- **Defect:** the publish and quarantine renames in `desktop-driver/src/native/nativeDriver.ts` (around lines
  181-189, 248, 303 and 468 before the macOS changes) fail at once when antivirus or the search indexer briefly holds
  the file (`EPERM`, `EACCES`, `EBUSY`).
- **Fix:** on win32 only, retry those renames a bounded number of times with a short delay, the same policy as
  `desktop-test`'s `replaceFileAtomically`. Use an async delay in async code. The cache must stay consistent if every
  retry fails: the old artifact stays published or the error is reported as today.
- **Tests:** a unit test with a mocked rename that fails with `EPERM` and then succeeds, and one that fails with a
  non-retryable code.
- **`nativeCache.test.ts`:** the suite is skipped on win32 (`cacheTest`, around line 20) because its fake helper is a
  `#!/usr/bin/env node` script that Windows can't run directly. Enable it on win32 if a test-only change can launch the
  fake helper (for example, a `.cmd` wrapper) without changing production code. Otherwise keep the skip, add a
  comment with the reason, and record it as deferred to #4349 in section 9.

### W-R1-4. Harden the helper process (P3-WIN-5)

- **`main.cpp`:** at the start of `wmain` (around lines 157-160, before `winrt::init_apartment`), call
  `SetErrorMode(SEM_FAILCRITICALERRORS | SEM_NOGPFAULTERRORBOX | SEM_NOOPENFILEERRORBOX)`, so a crash ends the
  process instead of leaving it alive behind a Windows Error Reporting dialog, and
  `SetDefaultDllDirectories(LOAD_LIBRARY_SEARCH_SYSTEM32)`.
- **`DesktopDriverHost.vcxproj`:** in both the `Debug|x64` and `Release|x64` `<Link>` groups (around lines 46-74),
  add `<AdditionalOptions>/DEPENDENTLOADFLAG:0x800 %(AdditionalOptions)</AdditionalOptions>`. Control Flow Guard
  (`<ControlFlowGuard>Guard</ControlFlowGuard>`) is optional; add it only if the build and the smoke stay clean.
- Confirm that the helper's source digest (`src/native/windows/buildWindowsDriver.ts`) covers the `.vcxproj`, so
  existing caches rebuild.
- **Self-test:** assert that `GetErrorMode()` includes the flags above. Then the full Q4 and Q6 runs on both
  endpoints show that capture, UI Automation and WinRT activation still load.

### W-R1-5. Recover capture after the Direct3D device is lost (P2-18)

Time box: half a day. If it runs out, defer to #4348 and document the limitation.

- **Defect:** `native/windows/src/capture.cpp` (around lines 61-63, 119, 149 and 210-214) keeps one Direct3D device.
  After an RDP reconnect or a GPU timeout and reset, every capture fails until the helper restarts.
- **Fix:** on `DXGI_ERROR_DEVICE_REMOVED` or `DXGI_ERROR_DEVICE_RESET`, release the cached device and frame pool,
  create new ones, and retry the capture once. A second failure returns `capture-failed`.
- **Tests:** a self-test through a device-loss seam if one can be added without production-only branches. Otherwise
  verify by hand: connect over RDP, disconnect, reconnect, and capture. Record which one you did.

### W-R1-6. Make the lock contention message actionable (P2-26), if it fits

- **Defect:** when `interactive.lock` is held, the error (`ownership.ts`, around lines 130-138 and 243-260) prints
  only the file path, and on Windows the recovery message hides even that. Nothing tells the user how to check
  whether the owner is still alive.
- **Fix:** print the owner's PID, process start time, run ID and target, together with the result of
  `inspectDesktopWorkloadClaim`, and the lock path on every platform. Print no displayed application text. Don't add
  automatic reclaim; that is tracked in #4451.
- This code runs on macOS too, so the unit tests must pass on every platform. Send the final message to the macOS
  lane for the stale-lock procedures in `lifecycle.md:134-136` and `commands.md:58-61`.

## 5. Documentation (Windows-owned)

- **`desktop-driver/native/windows/README.md`:**
  - Line 560 says `DoDefaultAction` is a counted mutation, but the code never calls it. Describe the actual
    invocation path.
  - Line 215 says `sendKeys` always uses Unicode packets. Special keys are sent as virtual keys; say so.
  - Lines 503-505 say only an unimplemented pattern moves on to the next one. `E_FAIL` does too (P3-WIN-1, deferred
    to #4441); describe the current behavior.
  - Describe the W-R0 and W-R1 behavior changes: `windows` initializing UI Automation, value clamping, empty-ledger
    recovery, error mode and DLL search.
- **`native/PROTOCOL.md` (macOS-owned):** send the macOS lane the missing Windows ownership `reason` values after
  checking each one against `native/windows/src`: `identity-user-mismatch`, `application-lock-unavailable`,
  `application-preexisting`, `no-matching-application`, `application-window-missing`,
  `application-recovery-unsettled` and `application-exited`. Also confirm that the Windows helper ignores binary
  frames and unknown message types, so the macOS lane can correct the "malformed input fails the transport" claim.
- **Windows and Win32 sections of `current-status.md`** in `desktop-driver`, `desktop-test` and `storybook-desktop`:
  the latest result for each gate with a link to its evidence, and a known-limitations list that names every deferred
  Windows item a consumer can hit (at least P3-WIN-1 to P3-WIN-4 and P3-WIN-6, the Windows part of P2-21, and P2-18
  if deferred).
- Run `yarn lage test-links` after the edits.

## 6. Changesets (Windows lane)

Add new files only. Never edit the existing changesets; the macOS lane owns them. Write for users: what changed and
what a consumer has to do.

- `.changeset/windows-helper-release-fixes.md`: `@fluentui-react-native/desktop-driver` patch, for W-R0-1 to W-R0-3
  and any of W-R1-3 to W-R1-5 that land.
- `.changeset/windows-workload-recovery.md`: `@fluentui-react-native/desktop-test` patch, for W-R1-1, W-R1-2 and
  W-R1-6. The package still releases as a minor version because of R0-1; the highest bump wins.

Format:

```md
---
'@fluentui-react-native/desktop-driver': patch
---

Fix a Windows helper crash when listing windows before any other UI Automation request, clamp out-of-range wheel and
pointer values, and recover an abandoned physical-input lock after a helper crash.
```

Run `yarn change:check` after adding them.

## 7. Qualification on Windows

Run every gate at the **candidate SHA** that the macOS lane declares in section 11 of `release-plan.md`, except Q1
and Q3, which also run while fixing. Run Q4 to Q9 on both endpoints: Windows Fabric (`--windows`) and Win32 Paper
(`--win32`). If the candidate changes, rerun only the gates whose inputs changed, and record which gates were carried
forward and why.

**Rules:**

- Use a logged-in, unlocked console session (not a disconnected RDP session) for physical input, and run one
  physical-input workload at a time on the desktop. If the machine can't grant foreground, record the physical case
  as failed or skipped, rerun with `$env:FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES = 'keyboard,physicalClick,wheel'`,
  and report both runs.
- Stop processes by PID only (`Stop-Process -Id <pid>`), and only processes this run owns.
- Clear test environment variables between gates
  (`Remove-Item Env:FURN_* -ErrorAction SilentlyContinue`), so one gate's opt-ins don't leak into the next.
- After each app run, do the cleanup checks in section 8. If cleanup is uncertain, don't remove the lock and don't
  start another workload; ask through the mailbox.
- Keep private machine paths in ignored artifacts. Public evidence (PR text, status documents) uses relative or
  redacted paths.
- The helper is built for x64 only. On an ARM64 machine it runs under emulation; record the architecture.

### Q1 to Q3: repository checks

- **Q1:** in each package you changed, `yarn format`, `yarn lint`, `yarn build` and `yarn test`. Use
  `yarn test <name>` while iterating.
- **Q2:** at the candidate, from the repository root: `yarn clean-lage-cache`, then `yarn lage buildci`, then
  `yarn lage test-links`.
- **Q3:** run the `boundedCommand` test 30 times while the machine is busy (for example, `yarn build` running in a
  second terminal), and require 30 passes:

  ```powershell
  Set-Location packages\agentic\desktop-driver
  for ($i = 1; $i -le 30; $i++) {
    yarn test boundedCommand
    if ($LASTEXITCODE -ne 0) { "boundedCommand failed on run $i"; break }
  }
  ```

### Q4: native helper, doctor, self-tests and ownership contracts

```powershell
yarn storybook build-driver --windows
yarn storybook build-driver --win32
yarn desktop-driver doctor --platform windows --permissions   # the permission preflight is Unsupported: record that
yarn desktop-driver doctor --platform win32

$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn workspace @fluentui-react-native/desktop-driver test --runInBand   # includes --self-test and the Win32 fixture contract

$env:FURN_NATIVE_PHYSICAL_INPUT_TEST = '1'
yarn workspace @fluentui-react-native/desktop-driver test --runInBand applicationOwnership.contract
```

Then the consumer ownership suite, following "Neutral Windows application ownership" in
`desktop-test/references/native-qualification.md`. Prepare the Windows Fabric app with its own Metro and bundle the
Win32 Paper app first. Set `FURN_OWNERSHIP_WINDOWS_APPLICATION` (registered AUMID and exact title) and
`FURN_OWNERSHIP_WIN32_APPLICATION` (`ReactTest.exe`, working directory, bundle and component arguments, exact title)
to JSON descriptors resolved from each app's configuration. Don't make up an identity or use another worktree's
Metro.

```powershell
$env:FURN_NATIVE_DRIVER_TEST = '1'
$env:FURN_NATIVE_APPLICATION_OWNERSHIP_TEST = '1'
$env:FURN_NATIVE_PHYSICAL_INPUT_TEST = '1'
yarn workspace @fluentui-react-native/desktop-test test --runInBand windowsApplicationOwnership.contract
```

Evidence: `packages/agentic/desktop-test/artifacts/desktop/windows-application-ownership-*/evidence.json`. A skipped
physical case is not an input pass.

### Q5: packed-tarball install

Build the same tarballs as the macOS lane, at the same SHA, in a separate worktree. Follow section 7 of
`release-plan.md`, in PowerShell:

```powershell
$preview = "$env:TEMP\furn-release-preview"
git worktree add $preview <candidate-sha>
Set-Location $preview
yarn install --immutable
yarn changeset:version
yarn build
yarn lage pack

$consumer = "$env:TEMP\furn-consumer"
New-Item -ItemType Directory $consumer | Out-Null
Set-Location $consumer
npm init -y
$tarballs = @(
  'fluentui-react-native-desktop-driver-0.5.4.tgz',
  'fluentui-react-native-desktop-test-0.4.0.tgz',
  'fluentui-react-native-desktop-mcp-0.1.1.tgz',
  'fluentui-react-native-desktop-driver-mcp-0.1.5.tgz'
) | ForEach-Object { (Get-ChildItem "$preview\_packed" -Recurse -Filter $_).FullName }
npm install @tarballs
```

If a tarball isn't found, the versions differ from section 1 of `release-plan.md`; stop and report it. Then, in
`$consumer`:

- Run the R1-PKG-2 smoke script from the candidate (every `exports` subpath imports, and every `bin` prints `--help`).
- Run `npm ls` and confirm `desktop-test` 0.4.0 and `desktop-driver` 0.5.4 resolve from the tarballs.
- Build the helper from the shipped `native/` sources into an empty cache, then check it (`doctor` never builds):

  ```powershell
  npx desktop-driver resolve-driver --platform windows --cache-root "$env:TEMP\furn-consumer-cache"
  npx desktop-driver doctor --platform windows --cache-root "$env:TEMP\furn-consumer-cache"
  npx desktop-driver resolve-driver --platform win32 --cache-root "$env:TEMP\furn-consumer-cache"
  npx desktop-driver doctor --platform win32 --cache-root "$env:TEMP\furn-consumer-cache"
  ```

- Repeat `resolve-driver` with `$env:FURN_DESKTOP_DRIVER_CACHE_ROOT` and
  `$env:FURN_DESKTOP_DRIVER_BUILD_POLICY = 'never'` set and only `--platform`, to check R1-DRV-2 and R1-DRV-3.
- Confirm no tests ship (R1-PKG-3), and record the file counts and sizes.
- Keep `$consumer` for Q9. Afterward remove the worktree with `git worktree remove --force $preview`.

### Q6: Storybook smoke on Windows Fabric and Win32 Paper

Follow "Windows Fabric and Win32 Paper" in `desktop-test/references/native-qualification.md`.

```powershell
# Windows Fabric (needs Windows App Runtime 1.8). Title: "Agentic Components Storybook"
yarn storybook prep --windows
yarn storybook smoke --windows --mode stories-and-tests

# Win32 Paper (production bundle). Title: "Agentic Components Storybook (Win32)"
yarn storybook smoke --win32 --mode stories-and-tests
```

`--paper` is invalid on Windows. Record the OS, app identity, input lane, story and test counts, and the session trace
the reference asks for. On Win32, record the Metro-reload case as Unsupported. Don't change Developer Mode to make a
launch work; use the narrower launch path the reference describes.

### Q7: targeted checks for the R0 and R1 fixes

Through a real W3C session against the Storybook app or the Win32 fixture, on both endpoints:

- **P1-3 (W-R0-1):** with a Callout or flyout already open in the app, attach a fresh session and list windows
  (`getWindowHandles`) before any other request. The helper stays alive and returns the windows.
- **P1-4 (W-R0-2, R0-5):** a wheel action with `deltaY: 1e300` is refused with `invalid argument`; the helper stays
  alive.
- **P1-5 (W-R0-3, R0-6):** find the helper with
  `Get-CimInstance Win32_Process -Filter "Name = 'furn-desktop-driver-host.exe'"`, and stop it with
  `Stop-Process -Id <pid> -Force` during a wheel-only action or `activate`. A new session's first physical input
  works with no `input-busy` and no manual `--release-input`.
- **P1-2 (R0-3):** in a deliberately failing story test, the driver log shows exactly one request per failed click.
- **P2-23 (W-R1-1):** start a protected service with `yarn storybook driver --windows --agent`. Read the owner PID
  from the claim:
  `(Get-Content "$env:LOCALAPPDATA\Microsoft\FluentUIReactNative\desktop-test\workload\interactive.lock" | ConvertFrom-Json).owner`.
  Stop that PID with `Stop-Process -Id <pid> -Force`. Start the service again. It must reconcile the claim
  automatically: the recorded app is handled as the contract says (Windows Fabric is uncontained; a Win32 REX job
  object drains), the stale claim is replaced, and no manual lock removal is needed. Repeat with `--win32`.
- **W-R1-2:** press Ctrl+Break in the `serve` console. It stops gracefully, like Ctrl+C.

### Q8: generic attach-only MCP/WDIO handoff (Win32 fixture)

Follow "Windows fixture and hosted selection" in `native-qualification.md`. Build the fixture with the test-only
builder (this builds but doesn't launch anything):

```powershell
yarn workspace @fluentui-react-native/desktop-driver build
$support = (Resolve-Path packages\agentic\desktop-driver\lib\native\windows\win32FixtureSupport.js).Path
$fixture = node --input-type=module -e "import { pathToFileURL } from 'node:url'; const { fixtureExecutable } = await import(pathToFileURL(process.argv[1]).href); console.log(await fixtureExecutable());" $support

$env:FURN_NATIVE_DRIVER_TEST = '1'
$env:FURN_NATIVE_HANDOFF_APP_PATH = $fixture
yarn workspace @fluentui-react-native/desktop-test test nativeRunner.contract --runInBand
```

All five core modes must run and pass. Evidence: `packages/agentic/desktop-test/artifacts/desktop/f11/native-*/evidence.json`.

### Q9: descriptor-path MCP pass with the packed `desktop-mcp`

On each endpoint:

1. Start a protected service: `yarn storybook driver --windows --agent` (then `--win32`). For Win32, first rebundle
   against the agent-served instance as described in `storybook-desktop/references/platforms/win32.md`; a stale
   bundle never reaches the channel.
2. Register `$env:TEMP\furn-consumer\node_modules\.bin\desktop-mcp.cmd` from Q5 as an MCP server in an MCP client,
   so the tested binary is the one that will be published.
3. Follow the retained handoff sequence in `storybook-desktop/references/current-status.md`: select a story
   (marker-verified) and observe; confirm an attached runner is refused while the session is held; relinquish; run
   one attached case; reopen and select; close; run one managed `desktop_workload` case.
4. Stop the service with Ctrl+C. Record whether the CLI exits by itself, the terminal lifecycle report, and the
   section 8 cleanup checks.
5. Check R1-MCP-1 and R1-MCP-2: restart `serve` while the adapter is connected and look for the distinct restart
   reason; close the client and confirm the adapter exits and releases its principal.

### Q10: hosted checks

The macOS lane reads them. If a `windows`, `windows-storybook`, `win32` or `win32-storybook` job fails, investigate
it on this machine when asked.

### Q11: after publishing

In an empty directory:

```powershell
npm init -y
npm install @fluentui-react-native/desktop-mcp@0.1.1 @fluentui-react-native/desktop-test@0.4.0 @fluentui-react-native/desktop-driver@0.5.4
npx desktop-mcp --help
npx desktop-test --help
npx desktop-driver --help
```

Then run the R1-PKG-2 smoke script against the installed packages, and `resolve-driver` and `doctor` for both
endpoints as in Q5.

## 8. Cleanup checks and evidence

After each app run (Q4 consumer suite, Q6, Q7, Q8, Q9), record:

```powershell
Test-Path "$env:LOCALAPPDATA\Microsoft\FluentUIReactNative\desktop-test\workload\interactive.lock"            # expect False
Test-Path "$env:LOCALAPPDATA\com.microsoft.fluentui-react-native.desktop-driver\agent-connection.json"       # expect False
Get-CimInstance Win32_Process -Filter "Name = 'furn-desktop-driver-host.exe'" | Select-Object ProcessId      # expect none from this run
Get-NetTCPConnection -State Listen -LocalPort <driver, channel and Metro ports> -ErrorAction SilentlyContinue # expect none
```

Also confirm that no app process from the run survives and that no externally owned app was stopped. If the lock
remains, record its owner and cleanup reason rather than deleting it.

Record each gate like this, in the PR description or the tracking issue (with the evidence links), and summarize it
in section 9:

```md
- Gate: Q6 Win32 Paper
- Result: passed | failed | skipped | not run | unsupported
- SHA: <candidate> Worktree dirty: no
- OS: <caption> <build> <architecture>
- Endpoint and app: win32, Agentic Components Storybook (Win32), <resolved identity>
- Input lane: physical | accessible (physical input masked)
- Command: <exact command>
- Counts: <stories and tests passed, failed, skipped>
- Cleanup: lock absent, descriptor absent, no helper, no listeners, no surviving app
- Evidence: <artifact path or link>
- Notes: <anything unexpected, including skipped or unsupported cases>
```

## 9. Windows lane status

Owned by the Windows machine. Update after each item: status (not started, in progress, done, deferred, blocked),
the commit SHA, and a note. For deferred items, give the tracking issue.

**Candidate SHA qualified:** none yet.

**Windows R0:** All three fixes are implemented; both helper build commands and the native self-test passed.
Shared Node verification and Windows Fabric/Win32 Paper application qualification are separate gates.

**Windows toolchain:** Windows 11 Enterprise build 26300, AMD64; Visual Studio Enterprise 2026
18.11.12402.416 (Desktop development with C++, MSVC 14.51.36231), Windows SDK 10.0.26100.0,
Windows App Runtime 1.8 X64 8000.994.2142.0 registered. Node 26.13.0, Yarn 4.18.0.
The current session is active RDP, not a verified console session for physical qualification.

| Item                                          | Status      | Commit      | Notes                                                                                                                                       |
| --------------------------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Setup and toolchain recorded                  | done        | `302ce30bb` | Branch sync, immutable install (peer warnings), and root build passed.                                                                      |
| W-R0-1 P1-3 `HasWindowContent` initialization | done        | `31b960364` | Windows and Win32 helper builds and doctor passed; masked self-test passed 850/850. Candidate Q7 not run.                                   |
| W-R0-2 P1-4 value clamping                    | done        | `352f0a75c` | Both helper builds passed; masked self-test passed 858/858. W3C validation not run (shared SHA pending).                                    |
| W-R0-3 P1-5 empty-ledger recovery             | done        | `f4cefbdd2` | Both helper builds passed; masked self-test passed 862/862. Candidate helper-kill check not run.                                            |
| W-AUDIT-1 P1-6 pointer origin audit           | done        | `9e5e1c217` | Empty element and viewport geometry rejected with no input. Both builds and masked self-test (864/864) passed. W3C mapping handed to macOS. |
| W-VERIFY R0-3 (P1-2)                          | in progress | `6fb97096e` | WDIO retry tests passed (12/12) on Windows; candidate Q6 failed-click trace not run.                                                        |
| W-VERIFY R0-5 (P1-4)                          | not started |             |                                                                                                                                             |
| W-VERIFY R0-6 (P1-5)                          | not started |             |                                                                                                                                             |
| W-VERIFY R0-9 (P2-10)                         | not started |             |                                                                                                                                             |
| W-R1-1 P2-23 crash recovery                   | done        | `80c8b3443` | Real supervisor journal replay and wrong-run fence passed (43/43 ownership tests). Candidate Q7 not run.                                    |
| W-R1-2 P3-TST-2, P3-TST-6                     | done        | `c26c4bce6` | Format, lint, build and Windows ownership tests passed (48/48). Physical Ctrl+Break not run.                                                |
| W-R1-3 P3-DRV-11 and `nativeCache` on win32   | blocked     |             | Not run; waiting for both shared SHAs in the macOS section 11.                                                                              |
| W-R1-4 P3-WIN-5 hardening                     | done        | `9d99fdaf7` | Both helper builds and the masked self-test passed (865/865). The source digest includes the project. Candidate capture/smoke not run.      |
| W-R1-5 P2-18 capture device loss              | done        | `f3bf1767c` | Both helper builds and the masked self-test passed (869/869), including the device-loss seam. Live reconnect/candidate capture not run.     |
| W-R1-6 P2-26 contention message               | deferred    |             | Not run. Exact cross-platform owner diagnostics need the asynchronous supervisor probe; follow up in #4451.                                 |
| Documentation (section 5)                     | not started |             |                                                                                                                                             |
| Changesets (section 6)                        | not started |             |                                                                                                                                             |
| Q1 to Q3                                      | in progress | `9d99fdaf7` | Driver Q1 passed (1,262 passed, 100 skipped); desktop-test Q1 passed (594 passed, 37 skipped). Q3 baseline passed 30/30. Q2 not run.        |
| Q4 Windows helper and contracts               | not run     |             |                                                                                                                                             |
| Q4 Win32 helper and contracts                 | not run     |             |                                                                                                                                             |
| Q5 packed install                             | not run     |             |                                                                                                                                             |
| Q6 Windows Fabric                             | not run     |             |                                                                                                                                             |
| Q6 Win32 Paper                                | not run     |             |                                                                                                                                             |
| Q7 Windows targeted checks                    | not run     |             |                                                                                                                                             |
| Q7 Win32 targeted checks                      | not run     |             |                                                                                                                                             |
| Q8 Win32 fixture handoff                      | not run     |             |                                                                                                                                             |
| Q9 Windows MCP pass                           | not run     |             |                                                                                                                                             |
| Q9 Win32 MCP pass                             | not run     |             |                                                                                                                                             |
| Q11 npm smoke (Windows)                       | not run     |             |                                                                                                                                             |
