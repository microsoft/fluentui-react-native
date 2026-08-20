# Next steps

> Continuation brief. Read [`PLAN.md`](./PLAN.md) first — it is the specification and the source
> of truth for every decision, and §16 now records which of its open decisions are closed and on
> what evidence. [`README.md`](./README.md) is the contract this package ships. This file covers
> only what is left to do and what remains unproven.

## 1. Where the work stands

`@fluentui-react-native/desktop-driver` has a functional end-to-end implementation, and the
**Windows path now runs against a real application**. Two independent package reviews on
2026-08-20 found correctness and contract-enforcement gaps that must be closed before treating the
implementation as release-ready; see §7.3.

**Proven on Windows** (Windows 11 26200, Node 24.15, `appium@3.2.0`,
`appium-windows-driver@5.1.9`, `webdriverio@9.24.0`, WinAppDriver 1.2.1, RNW 0.81.32):

- 129 package tests pass, including the portable-command contract suite, the window-discovery
  selection rules, and the doctor probes.
- Before linked-spec hashing, `desktop:generate` produced `a28a8ae5…e0e3bf` on both platforms. The
  new macOS executable-content digest is `7067b710…24b92`; regenerate on Windows and compare it
  before treating portability as proven; see §7.3.
- `yarn desktop:test:fake` completes a real loopback run: driver-host spawn, W3C HTTP server,
  launcher/worker split, one warm session for the whole suite, `browser.desktop`, artifacts, JUnit.
- The **real Windows backend runs**. `startAppiumHostedDriver` constructs `WindowsDriver`, spawns
  and reaps WinAppDriver, and serves W3C sessions on loopback. PLAN §16 decision 1 is closed.
- **Attach-mode window discovery works** end to end: a root-desktop session enumerates top-level
  windows, the configured title selects exactly one, the handle and owning pid are recorded as
  `external`, and `windowDiscovered` is emitted. Verified against Notepad and against the Storybook
  app.
- **Attach never terminates the app.** Verified behaviourally, not by reading capabilities back.
- The portable command matrix answers against a real application: `getPageSource`, accessibility-id
  lookup, `isDisplayed`, `isEnabled`, `isSelected`, `getText`, `getValue`, `waitForDisplayed`,
  `takeScreenshot`, `browser.desktop.getSessionInfo`, `isFocused` (both the `true` and the `false`
  case), and `scrollIntoView`.
- The shared suite selects stories through the channel, resolves every `testID` in the live
  Storybook app, and **two of the six shared tests pass against it**: the inline `button-default`
  plan (visible, enabled, text) and the `Button interaction` state-and-label test.
- **`desktop-driver serve` works end to end on Windows.** The service starts, announces itself over
  the Storybook channel, and the on-device controls report `Ready`. **All three on-device controls
  were pressed and verified against the real Windows backend**: _Run current test_ ran only the
  selected story and the device rendered `passed: 1 passed, 0 failed`; _Run all tests_ sequenced
  both stories; _Cancel_ is disabled when idle, enabled while running, and moved a running run to
  `cancelled` within two seconds. Use `yarn desktop:service:windows`, not `yarn desktop:service` —
  see §7.2.
- `apps/storybook` builds and launches on Windows with **Visual Studio 2026** (18.8); RNW 0.81 did
  not object.

**Still unproven anywhere:**

- **macOS.** Nothing in this round ran on macOS. The Mac2 attach capabilities, the WDA ownership
  model, and every macOS prerequisite remain as they were.
- **NovaWindows.** `appium-novawindows-driver` is still not installed and has never been
  constructed.

**Blocked by an application bug, not by the harness:**

Four of the six shared tests press the Button, and they fail because **clicking the agentic
`Button` crashes the Storybook app** — see §7.1. Clicking works: the same session clicks the
Storybook shell's own `Pressable` controls without incident.

## 2. State of the tree

- Branch: `user/jasonvmo/test-driver`.
- Generated and ignored, safe to delete and regenerate: `apps/storybook/desktop-tests/generated/`,
  `apps/storybook/artifacts/`, `apps/storybook/dist/`, `apps/storybook/windows/`, and
  `apps/storybook/node_modules/.generated/`.

## 3. Unlock the workstation first

A locked Windows session still answers **every read**: the accessibility tree, element attributes,
`getText`, and screenshots all work, and window discovery succeeds. What it refuses is synthetic
input. `windows: click` and `windows: keys` fail with `SendInput API call failed. 0 inputs
succeeded`, and WinAppDriver's own `element/:id/click` throws `An unknown error occurred in the
remote end`. The result is a test run that looks like a product bug and is not one.

`doctor` reports `session-unlocked` as `unknown`, not `ok` or `missing`, and that is deliberate:
there is no signal Node can read without a native call. `LogonUI.exe` was tried and disproved — it
keeps running long after a session is unlocked, so it reported every unlocked machine as locked.
`OpenInputDesktop` is the correct check and needs an FFI dependency this package does not carry.

If clicks fail with the errors above, unlock the machine and stay logged in before looking any
further.

## 4. Environment setup

- **Visual Studio 2022 or 2026** with the React Native Windows build workloads. 2026 (18.8) was
  used successfully.
- **WinAppDriver 1.2.1.** Point `APPIUM_WAD_PATH` at `WinAppDriver.exe`. That is the only variable
  `appium-windows-driver` reads — the earlier reference to `WINAPPDRIVERPATH` was wrong and nothing
  ever consumed it. Release 1.2.1 ships as an MSI; `msiexec /a <msi> /qn TARGETDIR=<dir>` extracts
  it without a system-wide install.
- **Developer Mode** enabled.
- **Node 22.18+**, ideally 24: `wdio.conf.ts` and every `*.desktop.spec.ts` are loaded directly by
  Node's type stripping.
- **Yarn 4** in pnpm mode.
- An **interactive, unlocked desktop session**.

```powershell
yarn install
yarn build
```

## 5. Reproduce the proven baseline

```powershell
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver test     # expect 129 passing
yarn workspace @fluentui-react-native/desktop-driver lint

cd apps\storybook
yarn desktop:doctor --platform windows
yarn desktop:generate                                          # expect 7067b710…24b92 after P0
yarn desktop:test:fake                                         # expect 6 passing, one worker
```

The digest must match the macOS value byte for byte. A different digest means the two platforms are
not running the same tests, and that is a failure, not a curiosity.

## 6. Run against the real application

```powershell
cd apps\storybook
yarn windows:agent:start        # channel server + Metro + build + launch, records PIDs
yarn storybook:control list     # must list components-button--default and --interaction

$env:APPIUM_WAD_PATH = '<path>\WinAppDriver.exe'
yarn desktop:test:windows
```

The default attach title is `Agentic Components Storybook`, the app's real window title. Override it
with `DESKTOP_TEST_WINDOW_TITLE`, or use `DESKTOP_TEST_PID` / `DESKTOP_TEST_WINDOW` for an exact
match.

Afterwards, confirm the invariant that matters most: **the Storybook app is still running**. That is
PLAN success criterion 6 and the whole point of attach mode.

## 7. What is left, in priority order

### 7.1 Clicking the agentic `Button` crashes the app — the top item, and it is not a harness bug

This is the only thing standing between the shared suite and a green Windows run, and it is an
application defect. Reproduced repeatedly on an unlocked session:

- Clicking `agentic-storybook-button-interactive` (Interaction story) kills `ReactApp.exe` about
  **three seconds later**, with exception `0xc0000409` (fail-fast) in `ucrtbase.dll` in the
  Application event log.
- Clicking `agentic-storybook-button` (Default story, **no `onPress` at all**) kills it the same
  way, so the story's handler is not involved.
- Clicking the Storybook shell's own controls — `agentic-storybook-theme-light`,
  `agentic-storybook-theme-dark`, `addon-tab-controls`, and every `desktop-test-*` control — works
  and leaves the app running. Those are plain React Native `Pressable`s.

So the crash is in the agentic `Button` component's press path on React Native Windows, not in a
React Native pressable generally, not in the story, and not in the driver. The delay is what makes
it read like a harness fault: the click returns success, the next command fails with
`Currently selected window has been closed`, and every later test in the file fails with it too.

Next steps for whoever picks this up: get a stack for the fail-fast (enable WER local dumps or
attach a debugger before clicking), then narrow it inside `packages/agentic-components`. File it
there with the faulting module and exception code above. Once it is fixed, run
`yarn desktop:test:windows` and the four remaining shared tests should be the only thing left to
judge.

One related fact worth carrying: **a React Native Windows pressable exposes no `InvokePattern`**.
Queried through plain UI Automation it supports exactly one pattern, `ScrollItemPattern`, so no
driver can activate it through a UIA pattern and WinAppDriver falls back to synthetic mouse input
at the element's centre. That makes `click` on Windows structurally dependent on a real, unlocked,
interactive desktop, which is a CI constraint worth deciding about, and may be an RNW accessibility
gap worth reporting upstream.

### 7.2 The service runs whatever platform its own environment names

`desktop:service` starts `desktop-driver serve`, whose runner inherits the service process's
environment. `wdio.conf.ts` reads `DESKTOP_TEST_PLATFORM` and **defaults to `fake`**, so a plain
`yarn desktop:service` makes every on-device run execute against the contract fake: the buttons
work, the results say `passed`, and nothing ever touches the application. Use the explicit scripts:

```powershell
yarn desktop:service:windows     # or desktop:service:macos
```

That is how the on-device controls were verified below. If an on-device run passes suspiciously
fast, check the service console for `RUNNING in fake on fake`.

### 7.3 Test-driver correctness and consolidation review

Two independent read-only reviews were run in parallel on 2026-08-20: an Opus 5
correctness/lifecycle review and a GPT-5.6 Sol architecture/consolidation review. They agreed that
the package structure is sound, but several documented guarantees are not enforced by the current
implementation. Work through this backlog before macOS re-verification so both platforms are
measured with trustworthy lifecycle, portability, and reporting semantics.

#### P0 — restore safety and eliminate false greens

**Implementation status (2026-08-20):** the code changes below are complete for protected attach
capabilities, fail-closed platform termination, macOS target validation, linked-spec hashing and
manifest verification, non-empty/unique/static story discovery, shared-glob enforcement, observed
driver-host and attached-app liveness, window readiness, bounded PID-tree cancellation, awaited
service shutdown, and error-preserving cleanup. Focused unit tests and the real Storybook generator
pass. Remaining proof is platform-specific: re-run Windows cancellation and lifecycle observation,
verify macOS window readiness and attach behavior, and capture a backend-provided launched-app or
native-driver PID before claiming complete application-process telemetry.

1. **Make attach ownership fail closed everywhere.**
   - Reserve backend capability keys that control ownership or routing. Reject conflicting
     `backendCapabilities` overrides for Mac2, Windows, NovaWindows, and root-window discovery.
   - Refuse termination when ownership is absent or not `self`; `terminateLaunchedApp` currently
     permits unknown ownership. Apply the same guard to termination-shaped Windows extensions such
     as `windows: closeApp`.
   - Make macOS target validation backend-aware. Until Mac2 process/window discovery is implemented,
     require `identity` for attach and reject PID-, title-, or window-only targets instead of
     silently dropping them.

2. **Implement observed lifecycle and readiness rather than hook-derived state.**
   - Add a platform-neutral monitor for the driver host, app/native-driver PIDs, window, and session.
     Emit `processStarted`, `exitObserved`, `crashObserved`, and `monitorError` from observations,
     and make `waitForAppState` stop immediately on a terminal state.
   - Enforce `readiness.requireWindow` along with process, session, Storybook, and selector gates.
     A launch must not become `ready` merely because the WDIO `before` hook ran.
   - Record exact owned PIDs and endpoints so requested shutdown, normal exit, crash, lost process,
     and monitor failure remain distinguishable.

3. **Make the portability gate cover what executes.**
   - Include normalized entry metadata and each linked spec's SHA-256 in the manifest digest.
     Recompute and verify the digest when loading a manifest and when creating WDIO configuration.
   - Reject missing or unreadable story roots, an empty tested-story set, duplicate story IDs,
     malformed story source, unsupported `parameters` indirection that hides `desktopTest`, and
     `Run all` against an empty manifest. Do not generate a passing "nothing to run" spec.
   - Replace linked-spec substring checks with real test discovery and write generated outputs
     atomically only after validation succeeds.
   - Expand shared-spec globs before checking for platform-specific paths; inspecting the glob
     basename does not enforce the no-platform-branch contract.

4. **Make cleanup bounded, awaited, and process-tree-safe.**
   - Introduce one owned-process supervisor with graceful shutdown, a deadline, escalation, exact
     PID-tree termination, and aggregated cleanup errors.
   - Await active runs during service shutdown, delete driver sessions before closing transports,
     and preserve session/app/native-driver cleanup failures alongside the primary error.
   - Add tests for ignored graceful shutdown, descendants, Windows command-interpreter trees,
     session deletion failure, service stop during a run, and cleanup after a primary test failure.

#### P1 — make diagnosis, artifacts, and public commands truthful

1. **Normalize result classification and startup diagnosis.**
   - Map configuration, capability, ownership, driver-host, readiness, and runner-spawn errors to
     `infrastructureError`; preserve framework skips and cancellation instead of collapsing
     everything into `failed`.
   - Treat application crashes and driver/host failures distinctly, retain lifecycle evidence in
     either case, and ensure every startup/session/readiness failure writes events, `run.json`, and
     JUnit.
   - Wrap the whole WDIO `onPrepare` path, clear stale endpoint environment state before starting,
     publish the original failure, stop the host, and abort rather than letting workers report a
     misleading "endpoint not published" error.

2. **Fix report and artifact integrity.**
   - Return only files captured for the current test from `captureArtifacts`, not the cumulative run
     manifest.
   - Keep key redaction, but do not apply event payload's 100-item/2,000-character truncation to
     `run.json`.
   - For `sessionStrategy: 'spec'`, write per-worker results and merge once in the launcher; workers
     must not overwrite the shared `run.json` and `junit.xml`.
   - Add a trailing newline to JUnit and cover full reports with more than 100 results.

3. **Harden the Storybook executor.**
   - Run `Run all` through one owned WDIO invocation and warm session, preserving manifest order and
     per-story progress. Add a runner deadline and use the P0 process supervisor for cancellation.
   - Make `createDesktopWdioConfig` consume `DESKTOP_TEST_GREP` by default and document that filter
     as a required consumer contract so "Run current" cannot silently run every test.
   - Resolve Windows commands through `PATH`/`PATHEXT` rather than appending `.cmd` to every bare
     command.

4. **Correct backend and CLI claims.**
   - Do not advertise NovaWindows as available until its module resolves and the optional dependency
     and real-backend contract are verified.
   - Make `desktop-driver start` remain alive until explicitly stopped; its current endpoint is
     destroyed immediately after printing. Let `stories list` validate only Storybook channel
     options, not an unused app target.
   - Report a supplied `windowHandle` as `matchedBy: 'windowHandle'`, and preserve backend/transport
     failures during window discovery instead of turning every failure into "no matching window."

#### P2 — harden transport and runtime validation

1. Validate every nested runtime field: attach identifiers, launch directory/environment, readiness
   booleans and deadlines, test IDs, Storybook host/port/root/render timeout, fake scene, and numeric
   CLI values.
2. Give every Storybook HTTP request an abort signal bounded by the remaining operation deadline.
   Distinguish retryable responses from terminal errors.
3. Return a valid W3C error response for oversized request bodies without destroying the response
   socket; test malformed JSON and keep-alive reuse with real loopback requests.
4. Reject shared-but-acyclic object graphs only when they are truly cyclic; the serializer's visited
   set currently rejects valid plans that reuse one target object.
5. Add focused robustness coverage for stream errors, temporary-directory cleanup, startup buffer
   growth, long-lived service run retention, and missing desktop augmentation in story-plan steps.

#### P3 — consolidate after behavior is covered

1. Split the combined service internally into launcher and worker responsibilities with a validated
   published-endpoint/run-context codec. Keep the current exported service as a compatibility
   wrapper until a deliberate API revision.
2. Extract one internal loopback transport layer for deadlines, JSON parsing, body limits, shutdown,
   and loopback validation while keeping W3C and Storybook response schemas separate.
3. Use one process supervisor for driver hosts, runners, apps, and native drivers instead of
   separate cancellation and cleanup implementations.
4. Move `sanitizeNodeOptions`, CLI argument parsing, and direct-invocation detection out of
   `import.meta` entry modules so the pure behavior can be tested.
5. Consolidate the four loopback allowlists, duplicate `delay`, JSON response, and XML escaping
   helpers; centralize `DesktopErrorKind` to result-status mapping; remove the one-line
   `resolveAttachWindow` delegate.
6. Use bounded concurrency for per-window attribute reads, but never cache a window handle across
   runs. Keep build-time package-version generation as an optional low-priority cleanup because the
   current literal drift test is effective.

#### Open decisions and recommendations

| Open decision                                                  | Recommendation                                                                                                                                                                                                   |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can `backendCapabilities` expose an unsafe ownership override? | **No by default.** Keep protected keys non-overridable; add a separately named expert API only if a real use case justifies weakening the invariant.                                                             |
| Should public `terminateLaunchedApp` remain available?         | **Deprecate it in favor of owned lifecycle cleanup.** Until removal, require positively observed `self` ownership and fail closed.                                                                               |
| How should Windows descendant processes be terminated?         | **Prefer an owned Job Object or another tested PID-tree primitive.** A PID-targeted `taskkill /T` fallback is acceptable only with bounded, cross-version integration coverage; never terminate by process name. |
| What satisfies `requireWindow` on macOS?                       | **Require an identity-pinned session plus at least one observed app window.** Do not let session creation alone satisfy the gate.                                                                                |
| Should macOS attach types be platform-specific?                | **Add runtime backend validation now; move toward a discriminated platform target union in the next intentional public API revision.**                                                                           |
| What content belongs in the portability digest?                | **Hash direct linked spec bytes now.** Add transitive imported test modules later if deterministic module-graph hashing can be implemented without machine-specific paths.                                       |
| Are intentionally empty manifests supported?                   | **Fail by default.** If needed, add explicit `allowEmpty` and report `skipped`, never `passed`.                                                                                                                  |
| Parser or framework discovery for linked tests?                | **Use actual Mocha discovery for the documented default.** A syntax parser is acceptable only if it proves executable, non-skipped selection equivalently.                                                       |
| Is an app crash a test failure or infrastructure error?        | **Treat an app-under-test crash as `failed` with a distinct lifecycle reason; treat driver, host, monitor, or runner crashes as `infrastructureError`.**                                                         |
| Should WDIO startup use `SevereServiceError`?                  | **Yes inside the WDIO adapter** so launcher failures abort immediately; keep the core package independent of WDIO error types.                                                                                   |
| Is `Run all` isolated per story or one warm session?           | **Use one warm invocation/session**, matching PLAN and current documentation. Add an explicit isolation mode later only if consumers require it.                                                                 |
| Is NovaWindows currently supported?                            | **No.** Mark it unavailable until the optional dependency resolves, doctor verifies it, and the shared real-backend suite passes.                                                                                |
| Is `desktop-driver start` a foreground server or a probe?      | **Make it a foreground server** that lives until SIGINT/SIGTERM. Add daemonized `status`/`stop` only as a separate future feature.                                                                               |
| May the Storybook channel use a remote host?                   | **No for the first release.** Enforce numeric loopback addresses consistently; do not accept resolver-dependent `localhost` unless the contract is deliberately broadened.                                       |
| Should oversized W3C bodies return HTTP 413 or W3C 400?        | **Keep a W3C `invalid argument` 400 envelope** for client compatibility, but drain or pause safely so the response reaches the client.                                                                           |
| Should the launcher/worker split break the public service API? | **No immediate break.** Refactor behind the existing constructor and schedule any surface change with a versioned migration.                                                                                     |

#### Coverage gate for this backlog

Before considering P0/P1 complete, add direct coverage for `wdio/service.ts`, the
`DesktopTestService` HTTP/auth/SSE/cancellation surface, `wdio/config-factory.ts`, the real
`w3c-server.ts` HTTP boundary, `net.ts`, CLI lifecycle, manifest tampering, and full run-report
shapes. The existing fake-driver contract suite is valuable, but it does not cover the launcher,
worker, reporting, or process-lifecycle paths where these defects live.

### 7.4 Screenshots and Composition content — PLAN open decision 5

A capture of the Storybook window returned a PNG at exactly the window size (582×791) with varied
content, which argues that no Windows Graphics Capture fallback is needed. It was taken on a locked
desktop, though, and may simply be the lock screen. Repeat it unlocked, look at the image, and
record the result. `COMPOSITION_SCREENSHOT_CAVEAT` in `src/platforms/windows.ts` stands until then.

### 7.5 macOS re-verification

Three changes affect macOS and none has run there:

- `isFocused` now reads the `focused` attribute first and only falls back to the active-element
  route. Confirm Mac2 answers `focused`; the fallback covers it either way, but verify rather than
  assume.
- `scrollIntoView` now sends `macos: scroll` with a wheel delta instead of no delta at all.
- The run executor now wraps a Windows launcher in `cmd.exe`; the macOS path is unchanged but
  should be re-run once through `desktop:service:macos`.

Also re-run `desktop:generate` on macOS and confirm the digest still matches.

### 7.6 NovaWindows — PLAN open decision 2

Once the suite passes on `windows`, install `appium-novawindows-driver`, run the identical suite
against `backend: 'novawindows'`, and record startup and per-command timings for both. Two
capability details are unverified for it: whether it accepts `appium:appTopLevelWindow` in the same
form, and whether `appium:shouldCloseApp: false` genuinely keeps an attached window open.

### 7.7 The on-device controls — verified, with two caveats

All three controls were pressed on Windows and behaved correctly, so this section is a record
rather than a task:

```powershell
cd apps\storybook
yarn desktop:generate
yarn desktop:service:windows     # not `desktop:service`; see §7.2
```

No environment variables and no rebuild: the service broadcasts its URL, token, and manifest digest
over the Storybook channel every few seconds, and the controls pick up a restarted service with a
new token on their own. `desktop-test-status` reads `Ready` once the app has received an
announcement and reached the service, and it is readable through the driver without pressing
anything.

Observed: _Run current test_ ran only the selected story (`RUNNING in Windows on Windows`) and the
device rendered `passed: 1 passed, 0 failed` about sixteen seconds after the press; _Run all tests_
sequenced both stories in order; _Cancel_ was disabled when idle, enabled while running, and moved
the run to `cancelled: 0 passed, 1 failed` within two seconds.

The first caveat is timing, and it misleads: the runner prints a full `Spec Files: 1 passed` summary
after **each** story, so a "Run all" looks finished in the console while the next story is still
being spawned. The device is the honest indicator — it says `Running… N finished` until the whole
run resolves, and it updates about a second after the service does.

The second caveat is cleanup: the observed `cancelled` transition predates the bounded process-tree
supervisor added in P0. Re-run cancellation on Windows and confirm the command interpreter, WDIO,
driver host, and WinAppDriver descendants all exit before considering the behavioral proof current.

A spawn failure is already covered: the executor's `child.on('error')` handler turns it into a
reported run, and `serve.test.ts` asserts it. P1 in §7.3 changes its classification from a product
failure to `infrastructureError`.

### 7.8 The Button's accessible name

The interactive Button stories now set an explicit `accessibilityLabel`, because React Native
Windows publishes a Button whose label comes only from `content` with an empty UI Automation `Name`.
That was the minimal fix for the test fixture, but the underlying question belongs to the component:
should `Button` derive an accessible name from string `content` so every consumer gets one on
Windows? That is an `agentic-components` decision, not a desktop-driver one.

### 7.9 Enumeration cost

Enumerating 16 top-level windows takes about 5 s, nearly all of it inside one WinAppDriver XPath
query. It happens once per run and is currently fine. If a busier desktop makes it painful, narrow
the query rather than caching the handle: a cached handle is exactly how a later run attaches to the
wrong window.

## 8. Port and process hygiene

| Port      | Owner                                                |
| --------- | ---------------------------------------------------- |
| 7007      | Storybook channel server                             |
| 7017      | Desktop test service (`desktop-driver serve --port`) |
| 8081      | Metro                                                |
| 4724+     | WinAppDriver, chosen by `appium-windows-driver`      |
| ephemeral | Driver host (allocated per run)                      |

**Do not run `yarn windows:test` (the legacy `@react-native-windows/automation` Jest smoke harness)
at the same time as the desktop-driver path.** PLAN §13 Phase 4 item 6 requires the two to stay
mutually exclusive until the new path reaches parity, at which point the legacy harness is retired
rather than kept alongside. Use `yarn windows:agent:stop` to stop only the PIDs recorded by the
session manifest; never kill by process name.

## 9. Constraints to preserve

- **Shared specs contain no platform branches and no platform imports.** If you need something
  Windows-only, put it in a separate `*.windows.spec.ts` and accept that it does not count toward
  shared coverage.
- **Elements are addressed only by `testID`**, through `byTestId()`.
- **Attach must never terminate anything.** Protected capability keys and platform termination
  extensions now enforce this invariant in code. Only `mode: 'launch'` may stop a process, and
  cleanup resolves exact PIDs and ports in `ownership.json` — never a process name.
- **An ambiguous attach match is a failure**, never a first-match guess.
- **The story-plan schema stays closed.** Nothing the device sends may reach a command line, a
  module path, or arbitrary code.
- **`PACKAGE_VERSION` in `src/package-version.ts` is a literal** and a test fails if it drifts from
  `package.json`. It is a literal because Jest transpiles to CommonJS, where `import.meta` does not
  parse.
- **Keep `import.meta` modules out of the Jest graph.** `driver-host/client.ts`,
  `driver-host/host-main.ts`, and `cli/main.ts` resolve their own module URL; `wdio/service.ts`
  imports the client dynamically for exactly this reason.
- **The driver host starts with a clean loader environment.** `sanitizeNodeOptions` strips
  `--require`, `--import`, and `--loader` from the inherited `NODE_OPTIONS`; without it the
  testrunner's `tsx` hook breaks the platform driver's module resolution.
- **A Windows launcher is spawned through the command interpreter, not `shell: true`.** Node
  refuses to `spawn` a `.cmd` directly (`EINVAL`), and `shell: true` would join the runner's
  arguments unquoted. `buildInvocation` builds an explicit `cmd.exe /d /s /c` line with every
  argument quoted and rejects a value the interpreter cannot be given safely.
- **Do not commit** `desktop-tests/generated/`, `artifacts/`, `dist/`, or the generated Windows
  solution.

## 10. Definition of done

From PLAN §3, marked against what has actually been observed:

1. The same spec source passes on Windows and macOS with no platform branch or import — **not met**:
   it runs on Windows and two of six tests pass; the other four are blocked by the application
   crash in §7.1, not by the spec.
2. `testID` resolves through the accessibility-ID strategy to the intended native element — **met on
   Windows**.
3. The full portable command subset works — **met on Windows**, including `click`, which works
   against the Storybook shell's own controls. It crashes the app only on the agentic `Button`.
4. Launch mode shuts down only what it launched — **not verified**.
5. Attach mode leaves the externally launched app running — **met on Windows**.
6. Unexpected termination fails the active test with process, endpoint, driver, and app diagnostics
   — **not met**: startup errors carry useful detail, but no post-startup driver/app monitor emits
   the required exit, crash, lost-process, or monitor events; see §7.3.
7. Storybook "Run current test" runs only the selected story and renders pass/fail — **met on
   Windows**.
8. Storybook "Run all tests" sequences every tested story and reports a summary — **met on
   Windows**.
9. CLI, testrunner, and standalone runs emit the same normalized events and artifact manifest —
   **not met**: startup and infrastructure results are classified inconsistently, lifecycle events
   are incomplete, and per-test artifact attribution and multi-worker report merging need the P1
   work in §7.3.
10. No Appium CLI or multi-driver router process is started — **met**: the only processes are the
    node host and WinAppDriver.

## 11. Validation to run before handing back

```powershell
yarn workspace @fluentui-react-native/desktop-driver format
yarn workspace @fluentui-react-native/desktop-driver lint
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver test
yarn workspace @fluentui-react-native/agentic-components-storybook bundle:windows
yarn build          # root, when public types, manifests, or project references changed
yarn lage test lint
yarn lint-repo
```

Add a changeset entry if the package's public surface changes, and update `README.md` whenever the
portable command matrix, the capability mapping, or the prerequisites change. If a portable command
turns out not to be deliverable on a platform, change the matrix and the documentation rather than
leaving either one aspirational.
