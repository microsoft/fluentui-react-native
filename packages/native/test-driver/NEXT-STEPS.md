# Next steps: proving the Windows backend

> Continuation brief for an agent picking this work up on a **Windows** machine.
>
> Read [`PLAN.md`](./PLAN.md) first — it is the specification and the source of truth for every
> decision. [`README.md`](./README.md) is the contract this package currently ships. This file
> only covers what is left to do and what is known to be unproven.

## 1. Where the work stands

`@fluentui-react-native/desktop-driver` is implemented end to end on the host side. The neutral
core, the WebdriverIO integration, the single-driver host, the Storybook integration, and the CLI
all exist and are covered by tests. The agentic-components Button stories carry the proof-of-concept
story tests, and `apps/storybook` consumes the package.

**What has actually been proven:**

- 102 package tests pass, including a portable-command-matrix contract suite and an end-to-end run
  of the real Button story plans against the `fake` backend.
- Root `yarn build`, `yarn lage test lint --no-cache` (157 tasks), `yarn constraints`,
  `yarn check-publishing`, `knip`, `align-deps`, `lint-lockfile`, and `yarn format:check` are green.
- `apps/storybook` bundles for both macOS and Windows, and the Button stories are present in both
  bundles.
- Two rounds of independent code review, with eight defects found and fixed.

**What has never run, anywhere:**

- Any real platform backend. `mac2`, `windows`, and `novawindows` have **never been constructed**.
  `startAppiumHostedDriver` in `src/driver-host/backends.ts` has never executed.
- Any WebdriverIO session against a real application.
- The loopback HTTP paths. The development sandbox blocked `listen` on `127.0.0.1`, so the driver
  host, the W3C server, and the loopback test service have only ever been exercised in-process
  through `createRouteDispatcher`. `yarn desktop:test:fake` has never completed a session on any
  machine.

Treat every capability mapping and lifecycle assumption below as **unverified against a real
driver** until you have observed it yourself.

## 2. State of the tree

- Branch: `user/jasonvmo/test-driver`, based on `1e4aa2875 initial test-driver standup`.
- **Everything is uncommitted.** Run `git status` before touching anything and preserve unrelated
  worktree edits.
- A changeset exists at `.changeset/desktop-driver-initial.md`.
- Generated and ignored, safe to delete and regenerate: `apps/storybook/desktop-tests/generated/`,
  `apps/storybook/artifacts/`, `apps/storybook/dist/`, `apps/storybook/windows/` build output.

New and changed files worth knowing about:

| Path                                                                       | Role                                      |
| -------------------------------------------------------------------------- | ----------------------------------------- |
| `packages/native/test-driver/src/**`                                       | The package                               |
| `apps/storybook/wdio.conf.ts`                                              | The only place platform selection happens |
| `apps/storybook/desktop-tests/fake-scene.json`                             | Scene for the `fake` backend              |
| `apps/storybook/desktop-tests/test-service.mjs`                            | Host-side loopback run service            |
| `apps/storybook/desktop-tests/desktop-driver.mjs`                          | CLI wrapper (see note in §3)              |
| `apps/storybook/src/DesktopTestControls.tsx`                               | On-device Run current / Run all / Cancel  |
| `packages/agentic-components/src/components/button/button.stories.tsx`     | Inline plan + linked spec                 |
| `packages/agentic-components/src/components/button/button.desktop.spec.ts` | The shared spec                           |

## 3. Environment setup

Prerequisites:

- **Visual Studio 2022** with the React Native Windows build workloads.
- **WinAppDriver 1.2.1**. Install it, or set `WINAPPDRIVERPATH`. The default probe path is
  `%ProgramFiles(x86)%\Windows Application Driver\WinAppDriver.exe`.
- **Developer Mode** enabled (required by WinAppDriver).
- **Node 22.18+**, ideally 24. This is not optional: `wdio.conf.ts` and every `*.desktop.spec.ts`
  are TypeScript loaded directly by Node's type stripping. There is no `ts-node` or `tsx` in the
  loader path.
- **Yarn 4** in pnpm mode, as configured by `.yarnrc.yml`.
- An **interactive desktop session**. UI Automation cannot run headless.

Two environment notes carried over from the macOS machine:

- `DEVELOPER_DIR` is macOS-only. Ignore it.
- Check whether `YARN_GLOBAL_FOLDER` is set in your environment. On the origin machine it pointed
  outside the repository and made `yarn install` fail in the link step. If it is set and points
  somewhere unexpected, unset it so Yarn uses the repo-local `globalFolder` from `.yarnrc.yml`.

Then, from the repository root:

```powershell
yarn install
yarn build
```

> **Note on the CLI wrapper.** `apps/storybook` invokes the CLI through
> `desktop-tests/desktop-driver.mjs` rather than the `desktop-driver` bin. The package declares
> `webdriverio` as an optional peer dependency, which makes Yarn virtualize the workspace, and the
> pnpm linker does not materialize a virtualized workspace's `bin`. If you find a cleaner fix,
> take it, but do not drop the peer-dependency declaration to get the bin back — the peer contract
> is deliberate.

## 4. Step one: reproduce the green baseline

No application or native driver needed. This confirms the port is sound before you touch anything.

```powershell
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver test     # expect 102 passing
yarn workspace @fluentui-react-native/desktop-driver lint

cd apps\storybook
yarn desktop:doctor --platform windows
yarn desktop:generate
```

`desktop:generate` must report exactly two stories and this digest:

```
components-button--default      inline   button-default
components-button--interaction  spec     button-interaction
digest: a28a8ae58b3a45dc2756b3ff9d2161ca1ba71f6e13b4f17d1308b4354ac0e3bf
```

**The digest must match the macOS value byte for byte.** It is the portability gate: it is a
SHA-256 over the story ids, tags, and plans. A different digest means the two platforms are not
running the same tests, and that is a failure, not a curiosity.

## 5. Step two: the first real loopback run

```powershell
cd apps\storybook
yarn desktop:test:fake
```

This is the first time the driver host, the W3C HTTP server, the launcher/worker split, the
`browser.desktop` augmentation, and the generated spec will run over a real socket with a real
WebdriverIO session. It needs no application and no native driver.

Expect to shake out problems here, and fix them here rather than while also fighting native
tooling. Things most likely to bite:

- The driver host is spawned as `node <host-main.js> <config>` from
  `src/driver-host/client.ts`. Path handling and the stdout ready-handshake have never run on
  Windows.
- Node type stripping must load `wdio.conf.ts` and `button.desktop.spec.ts`.
- The generated spec uses `import ... with { type: 'json' }`.
- `sessionStrategy: 'suite'` groups both specs into one worker and one warm session; confirm you
  get one worker, not two.

When this passes, the harness is sound and every later failure is genuinely about Windows.

## 6. Step three: the real Windows backend

This is the actual remaining work. Follow the order; each step has something specific to confirm.

### 6a. Get the app running

```powershell
cd apps\storybook
yarn windows:agent:start      # channel server + Metro + build + launch, records PIDs
```

Confirm the channel server sees the new story. The `Interaction` story is **new**, and adding a
story changes Metro's `require.context` catalog, so Metro and the app may need a restart before it
appears:

```powershell
yarn storybook:control list
```

You must see both `components-button--default` and `components-button--interaction`. If
`components-button--interaction` is missing, stop and fix that first — every desktop test selects
stories through this channel.

### 6b. Run the shared suite in attach mode

```powershell
$env:DESKTOP_TEST_WINDOW_TITLE = 'AgenticStorybook'
yarn desktop:test:windows
```

Then verify the single most important invariant: **the Storybook app is still running after the
run finishes.** That is PLAN.md success criterion 6 and the whole point of attach mode.

## 7. Known gaps and unverified assumptions

These are ordered by how likely they are to block you. The first is a genuine missing feature, not
a risk.

### 7.1 Attach-by-title has no window discovery — implement this

**This will almost certainly fail on the first run.** `src/wdio/capability-map.ts` sets
`appium:appTopLevelWindow` only when the target already carries a `windowHandle`. The default
config in `apps/storybook/wdio.conf.ts` supplies a `title`, and nothing converts a title, identity,
or PID into a native window handle. The session will attach to the root desktop and fail to find
`~agentic-storybook-button`.

PLAN.md §7.2 item 2 calls for exactly this. Implement it:

1. Create a root session (`appium:app: 'Root'`).
2. Locate the top-level window by title or owning PID.
3. Read its `NativeWindowHandle`, convert to hex.
4. Create the real session with `appium:appTopLevelWindow` set to that hex handle.

`describeAttachResolution()` in `capability-map.ts` already encodes the precedence rule (PID and
handle are exact; identity and title are queries). Honour it, and **reject an ambiguous match**
rather than picking the first window — attaching to the wrong window is how an automated run
damages something it does not own. Emit the `windowDiscovered` lifecycle event, which is currently
declared in `src/types.ts` but never emitted.

### 7.2 `ms:forcequit: false` — verify empirically

An earlier revision used an invented capability name (`appium:forceQuitApps`) that Appium silently
ignored, leaving the "attach never terminates the app" guarantee unenforced. It is now
`ms:forcequit: false` for the `windows` backend and `appium:shouldCloseApp: false` for
`novawindows`, matching each driver's real constraint table. **Confirm behaviourally**, not by
reading capabilities back: end a session and check the app is still alive.

### 7.3 `browserName: ''`

The generated capabilities pin `browserName: ''` so WebdriverIO deterministically selects its
native command implementations on both platforms (see the README's portable-matrix section).
Verify Windows Driver accepts it, and that `browser.isMobile` is `true` so `getValue()` resolves to
the attribute path rather than `getElementProperty`.

### 7.4 `isFocused` and `scrollIntoView`

Both are delivered through `browser.desktop` because WebdriverIO implements them with a DOM script.

- `isFocused` uses `GET /session/:id/element/active`. Verify WinAppDriver implements it. If it does
  not, fall back to the UIA `HasKeyboardFocus` attribute — and if neither works, remove the command
  from the matrix in `src/capabilities.ts` and say so honestly rather than leaving a command in the
  portable set that one platform cannot deliver.
- `scrollIntoView` issues `execute('windows: scroll', { elementId })`. Verify the argument shape
  Windows Driver expects.

### 7.5 Screenshots and Composition content

WebDriver screenshots do not reliably capture WinAppSDK Composition content; the README documents
this and `src/platforms/windows.ts` exports `COMPOSITION_SCREENSHOT_CAVEAT`. Failure artifacts
currently call `browser.takeScreenshot()` unconditionally. Confirm whether captures are blank, and
if so wire an OS-level capture fallback. This is PLAN.md §7.2 item 8 and open decision 5.

### 7.6 Spec digest is never populated

`src/wdio/service.ts` reads `config.desktopSpecDigest` and writes it to `run.json.specDigest`, but
`createDesktopWdioConfig` never sets it, so it is always `undefined`. PLAN.md §14 requires both
platform jobs to record the shared spec manifest SHA in `run.json` so CI can compare them. Wire the
generated manifest's digest through the config factory. Small task, real gate.

### 7.7 NovaWindows is still an open decision

PLAN.md open decision 2 is unresolved: WinAppDriver is closed source and unmaintained, and
NovaWindows is the documented modern alternative. Once the suite passes on `windows`, run the
identical suite against `backend: 'novawindows'` and record startup and per-command timings for
both. Decide from evidence and write the decision into PLAN.md §16.

### 7.8 The Appium embedding itself

`startAppiumHostedDriver` uses `routeConfiguringFunction` and `server` from `appium/driver.js`.
That is a driver-author API, and the convenience `server` export is marked deprecated for Appium 4.
Confirm it works, then record the exact pinned versions. If it proves unstable, the local
`src/driver-host/w3c-server.ts` already exists as the maintained fallback host — that substitution
is a single-file change and no test should notice.

## 8. Step four: the on-device controls

```powershell
cd apps\storybook
yarn desktop:generate
yarn desktop:service          # prints a loopback URL and a per-boot token

# in another terminal, with the printed values
$env:DESKTOP_TEST_SERVICE_URL = '<url>'
$env:DESKTOP_TEST_SERVICE_TOKEN = '<token>'
yarn start
```

Then exercise **Run current test**, **Run all tests**, and **Cancel** in the app.

`test-service.mjs` spawns `yarn.cmd` on win32 and has a `child.on('error')` handler, but that path
has never executed. Verify a spawn failure surfaces as a failed run rather than hanging in
`running` forever.

## 9. Port and process hygiene

| Port      | Owner                                              |
| --------- | -------------------------------------------------- |
| 7007      | Storybook channel server                           |
| 7017      | Desktop test service (`DESKTOP_TEST_SERVICE_PORT`) |
| 8081      | Metro                                              |
| 4723      | WinAppDriver                                       |
| ephemeral | Driver host (allocated per run)                    |

**Do not run `yarn windows:test` (the legacy `@react-native-windows/automation` Jest smoke
harness) at the same time as the desktop-driver path.** PLAN.md §13 Phase 4 item 6 requires the two
to stay mutually exclusive until the new path reaches parity, at which point the legacy harness is
retired rather than kept alongside. Use `yarn windows:agent:stop` to stop only the PIDs recorded by
the session manifest; never kill by process name.

## 10. Constraints to preserve

- **Shared specs contain no platform branches and no platform imports.** `button.desktop.spec.ts`
  must keep running unchanged on macOS. If you need something Windows-only, put it in a separate
  `*.windows.spec.ts` and accept that it does not count toward shared coverage.
- **Elements are addressed only by `testID`**, through `byTestId()`. No XPath, class names, visible
  text, or layout order.
- **Attach never terminates anything.** Only `mode: 'launch'` may stop a process, and cleanup
  resolves the exact PIDs and ports in `ownership.json` — never a process name.
- **The story-plan schema stays closed.** Nothing the device sends may reach a command line, a
  module path, or arbitrary code.
- **`PACKAGE_VERSION` in `src/package-version.ts` is a literal** and a test fails if it drifts from
  `package.json`. It is a literal because Jest transpiles to CommonJS, where `import.meta` does not
  parse.
- **Keep `import.meta` modules out of the Jest graph.** `driver-host/client.ts`,
  `driver-host/host-main.ts`, and `cli/main.ts` resolve their own module URL;
  `wdio/service.ts` imports the client dynamically for exactly this reason.
- **Do not commit** `desktop-tests/generated/`, `artifacts/`, `dist/`, or the generated Windows
  solution.

## 11. Definition of done

From PLAN.md §3, these criteria remain unmet and are what this Windows work closes:

1. The same spec source passes on Windows and macOS with no platform branch or import.
2. `testID` resolves through the accessibility-ID strategy to the intended native element.
3. The full portable command subset works: wait, inspect, click, focus, clear/set value, read,
   scroll, source, screenshot.
4. Launch mode shuts down only what it launched.
5. Attach mode leaves the externally launched app running.
6. Unexpected termination fails the active test with process, endpoint, driver, and app diagnostics.
7. Storybook "Run current test" runs only the selected story and renders pass/fail.
8. Storybook "Run all tests" sequences every tested story and reports a summary.
9. CLI, testrunner, and standalone runs emit the same normalized events and artifact manifest.
10. No Appium CLI or multi-driver router process is started; Appium-derived packages are enumerated
    honestly.

Record the outcome of PLAN.md §16 open decisions 2, 5, 7, and 8 in `PLAN.md` as you resolve them.

## 12. Validation to run before handing back

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
turns out not to be deliverable on Windows, change the matrix and the documentation rather than
leaving either one aspirational.
