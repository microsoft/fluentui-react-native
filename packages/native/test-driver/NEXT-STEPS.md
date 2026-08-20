# Next steps

> Continuation brief. Read [`PLAN.md`](./PLAN.md) first — it is the specification and the source
> of truth for every decision, and §16 now records which of its open decisions are closed and on
> what evidence. [`README.md`](./README.md) is the contract this package ships. This file covers
> only what is left to do and what remains unproven.

## 1. Where the work stands

`@fluentui-react-native/desktop-driver` is implemented end to end, and the **Windows path now runs
against a real application**.

**Proven on Windows** (Windows 11 26200, Node 24.15, `appium@3.2.0`,
`appium-windows-driver@5.1.9`, `webdriverio@9.24.0`, WinAppDriver 1.2.1, RNW 0.81.32):

- 129 package tests pass, including the portable-command contract suite, the window-discovery
  selection rules, and the doctor probes.
- `desktop:generate` produces the digest `a28a8ae5…e0e3bf`, **byte-identical to the macOS value**.
  The portability gate holds.
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
  the Storybook channel, and the on-device controls report `Ready` — meaning the app received the
  announcement and reached the service's health endpoint with the announced token. A run requested
  over the service API spawned the WebdriverIO runner and **passed** `components-button--default`
  against the live app.
- `apps/storybook` builds and launches on Windows with **Visual Studio 2026** (18.8); RNW 0.81 did
  not object.

**Still unproven anywhere:**

- **Every interaction.** The machine used for this work stayed locked for the whole session, and a
  locked workstation refuses all synthetic input. `click`, `setValue`, `clearValue`, and keyboard
  input have therefore never been observed to work against the Storybook app. See §3 and §7.1.
- **macOS.** Nothing in this round ran on macOS. The Mac2 attach capabilities, the WDA ownership
  model, and every macOS prerequisite remain as they were.
- **NovaWindows.** `appium-novawindows-driver` is still not installed and has never been
  constructed.
- **The on-device buttons.** Everything behind them is proven (see above), but **Run current test**,
  **Run all tests**, and **Cancel** have never been pressed, because pressing anything needs the
  synthetic input a locked session refuses.

## 2. State of the tree

- Branch: `user/jasonvmo/test-driver`.
- Generated and ignored, safe to delete and regenerate: `apps/storybook/desktop-tests/generated/`,
  `apps/storybook/artifacts/`, `apps/storybook/dist/`, `apps/storybook/windows/`, and
  `apps/storybook/node_modules/.generated/`.

## 3. Unlock the workstation first

This is the single most important line in this file.

A locked Windows session still answers **every read**: the accessibility tree, element attributes,
`getText`, and screenshots all work, and window discovery succeeds. What it refuses is synthetic
input. `windows: click` and `windows: keys` fail with `SendInput API call failed. 0 inputs
succeeded`, and WinAppDriver's own `element/:id/click` either throws `An unknown error occurred in
the remote end` or — worse — **reports success while doing nothing at all**.

The result is a test run that looks like a product bug and is not one.

```powershell
cd packages\native\test-driver
node ./src/cli/main.ts doctor --platform windows
```

`session-unlocked` must be `ok`. If it is `missing`, unlock the machine and stay logged in;
nothing about interaction testing works otherwise.

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
yarn desktop:generate                                          # digest a28a8ae5…e0e3bf
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

### 7.1 Finish the interaction verification — the top item

Four of the six shared tests press the Button, and none of them has ever been observed to pass.
Everything around them works: the story is selected, `agentic-storybook-button-interactive`
resolves, its state and label read correctly, and the status text
`agentic-storybook-button-interactive-status` reads `Not pressed` or `Pressed <n>` as ground truth.

Three facts to carry into that work, all measured:

1. **A React Native Windows pressable exposes no `InvokePattern`.** Queried through plain UI
   Automation, `agentic-storybook-button-interactive` supports exactly one pattern:
   `ScrollItemPattern`. There is no Invoke, so no driver can activate it through a UIA pattern —
   WinAppDriver has to fall back to synthetic mouse input at the element's centre. That makes
   `click` on Windows structurally dependent on a real, unlocked, interactive desktop, which is a
   constraint worth deciding about before this ever runs in CI. It may also be an RNW accessibility
   gap worth reporting upstream.
2. **A locked session turns that into an opaque failure.** WinAppDriver answers a click with
   `An unknown error occurred in the remote end`, and the app is untouched.
3. **`ReactApp.exe` fail-fast crashed twice during click attempts** — exception `0xc0000409` in
   `ucrtbase.dll`, recorded in the Application event log. It did not reproduce on a later click
   attempt, and both crashes happened while the workstation was locked, so this is an observation
   rather than a diagnosis. If it reproduces on an unlocked session it is an app or RNW bug found
   by this harness, not a harness bug, and it belongs in an `agentic-components` issue with the
   faulting module and exception code above.

Watch for the failure mode in §3: a click that resolves without changing anything is not a pass.

### 7.2 Screenshots and Composition content — PLAN open decision 5

A capture of the Storybook window returned a PNG at exactly the window size (582×791) with varied
content, which argues that no Windows Graphics Capture fallback is needed. It was taken on a locked
desktop, though, and may simply be the lock screen. Repeat it unlocked, look at the image, and
record the result. `COMPOSITION_SCREENSHOT_CAVEAT` in `src/platforms/windows.ts` stands until then.

### 7.3 macOS re-verification

Two changes affect macOS and neither has run there:

- `isFocused` now reads the `focused` attribute first and only falls back to the active-element
  route. Confirm Mac2 answers `focused`; the fallback covers it either way, but verify rather than
  assume.
- `scrollIntoView` now sends `macos: scroll` with a wheel delta instead of no delta at all.

Also re-run `desktop:generate` on macOS and confirm the digest still matches.

### 7.4 NovaWindows — PLAN open decision 2

Once the suite passes on `windows`, install `appium-novawindows-driver`, run the identical suite
against `backend: 'novawindows'`, and record startup and per-command timings for both. Two
capability details are unverified for it: whether it accepts `appium:appTopLevelWindow` in the same
form, and whether `appium:shouldCloseApp: false` genuinely keeps an attached window open.

### 7.5 The on-device buttons

The service and everything behind it are proven on Windows. With the app already running:

```powershell
cd apps\storybook
yarn desktop:generate
yarn desktop:service          # starts `desktop-driver serve` and announces over the channel
```

No environment variables and no rebuild: the service broadcasts its URL, token, and manifest digest
over the Storybook channel every few seconds, and the controls pick up a restarted service with a
new token on their own. When the app has received an announcement and reached the service, the
`desktop-test-status` element reads `Ready`, which is observable through the driver without pressing
anything:

```powershell
yarn desktop:generate; yarn desktop:test:windows   # any run attaches; read ~desktop-test-status
```

What remains is only the three presses — **Run current test**, **Run all tests**, and **Cancel** —
which need the synthetic input a locked session refuses. Confirm that a run started from the device
reports progress and that Cancel moves a running run to `cancelled` rather than leaving it in
`running`.

A spawn failure is already covered: the executor's `child.on('error')` handler turns it into a
failed run, and `serve.test.ts` asserts it.

### 7.6 The Button's accessible name

The interactive Button stories now set an explicit `accessibilityLabel`, because React Native
Windows publishes a Button whose label comes only from `content` with an empty UI Automation `Name`.
That was the minimal fix for the test fixture, but the underlying question belongs to the component:
should `Button` derive an accessible name from string `content` so every consumer gets one on
Windows? That is an `agentic-components` decision, not a desktop-driver one.

### 7.7 Enumeration cost

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
- **Attach never terminates anything.** Only `mode: 'launch'` may stop a process, and cleanup
  resolves the exact PIDs and ports in `ownership.json` — never a process name.
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
   it runs on Windows, and the interaction assertions are unverified.
2. `testID` resolves through the accessibility-ID strategy to the intended native element — **met on
   Windows**.
3. The full portable command subset works — **met on Windows except the interaction commands**.
4. Launch mode shuts down only what it launched — **not verified**.
5. Attach mode leaves the externally launched app running — **met on Windows**.
6. Unexpected termination fails the active test with process, endpoint, driver, and app diagnostics
   — **partly met**: driver-host startup failures now carry the host's own message and stack.
7. Storybook "Run current test" runs only the selected story — **partly met**: a single-story run
   requested over the service API selected exactly that story's spec and grep and passed on
   Windows; the on-device press itself is unverified.
8. Storybook "Run all tests" sequences every tested story — **not verified**.
9. CLI, testrunner, and standalone runs emit the same normalized events and artifact manifest —
   **met for the testrunner, standalone, and `serve` paths**.
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
