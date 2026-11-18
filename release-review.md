# Release review: desktop-driver, desktop-test, desktop-mcp

| Item             | Value                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date             | 2026-11-18                                                                                                                                                                                     |
| Reviewed source  | `2fa16ddb8` (`main` after #4510), branch `user/jasonvmo/driver-release`                                                                                                                        |
| Release vehicle  | "Version Packages" PR #4509 (head `2e7891cbc`): `desktop-driver` 0.5.4, `desktop-test` 0.3.1, `desktop-mcp` 0.1.1, `desktop-driver-mcp` 0.1.5                                                  |
| Currently on npm | `desktop-driver` 0.5.3, `desktop-test` 0.3.0 (both published 2026-11-16), `desktop-mcp` 0.1.0 (published 2026-11-17, see P0-1)                                                                 |
| Scope            | `packages/agentic/desktop-driver` (TypeScript and native Swift/C++ helpers), `packages/agentic/desktop-test`, `packages/agentic/desktop-mcp`: about 100k lines including tests and native code |
| Mode             | Read-only static review. Nothing in the repository was edited, built, or tested. Validation status is listed at the end.                                                                       |

Paths are relative to the package directory named in each section, and line numbers are at `2fa16ddb8`.
`native/macos/.../X.swift` is short for `native/macos/Sources/DesktopDriverHost/X.swift`. Findings
marked **Verified** were confirmed by hand against the code, the npm registry, or a standalone experiment. All other
findings come from careful reading of the code and carry the reviewer's confidence rating.

## Summary

**Verdict: do not merge #4509 as it stands.**

- **P0:** the `desktop-mcp` 0.1.0 already on npm cannot be installed and used (P0-1).
- **P1:** #4509 also ships a breaking `desktop-test` API change as a patch, and there are six P1 code defects.
  Every P1 has a small, local fix.

The architecture and the documented invariants hold up well. The reviewers confirmed:

- loopback-only binding, with Origin, Host and Sec-Fetch checks before authentication
- constant-time secret comparison and authentication before the body is read
- strict zod schemas that reject out-of-range budgets instead of clamping them
- bounded journals, references and results
- exact PID and start-time ownership that fails closed
- idempotent admission for management requests
- no `export *` barrels, linear-time regexes on external text (except two in the macOS build tooling, P3-DRV-9), and
  no spliced code in generated WDIO configuration

The problems are concentrated in the following areas:

- release mechanics (P0-1, P1-1)
- one WebdriverIO default that can send a mutation twice (P1-2)
- crash and lock-recovery edges in the native helpers (P1-3 to P1-7)
- lifecycle and cleanup paths that fail closed but cannot recover without manual work

| Severity            | Count | Meaning                                                      |
| ------------------- | ----: | ------------------------------------------------------------ |
| P0                  |     1 | Broken for consumers now                                     |
| P1                  |     7 | Fix, or explicitly accept and document, before merging #4509 |
| P2                  |    30 | Fix soon after the release, or before wider adoption         |
| P3                  |    76 | Minor defects and hardening                                  |
| Documentation drift |   ~40 | Documentation that contradicts the code                      |

## Release checklist

1. **Fix the version bump in #4509.** Change `desktop-test` to a `minor` bump (0.4.0), or restore compatibility
   shims, and add migration notes (P1-1). Clean up the changelog text (P3-PKG-6).
2. **Land the P1 fixes,** or record each one as a known limitation in the owning `current-status.md`:
   - P1-2: one option change
   - P1-3: one call
   - P1-4 and P1-5: input validation, plus always running input recovery
   - P1-6: refuse unreadable geometry
   - P1-7: add the ownership guard, or document the parity gap
3. **Make sure the publish run cannot fail on known test flakes.** `.ado/azure-pipelines.publish.yml` runs
   `yarn lage buildci` (build, test and lint) before packing, and the #4349 flakes have identifiable causes (P2-10).
4. **Merge #4509, then smoke-test the published packages from a clean directory:**
   ```sh
   npm install @fluentui-react-native/desktop-mcp@0.1.1
   node -e "import('@fluentui-react-native/desktop-mcp')"
   npx -p @fluentui-react-native/desktop-mcp desktop-mcp --help
   ```
   Run the same check for `desktop-test --help` and `desktop-driver --help`.
5. **Deprecate the broken version.**
   ```sh
   npm deprecate @fluentui-react-native/desktop-mcp@0.1.0 "Requires desktop-test exports that 0.3.0 does not provide; use >=0.1.1"
   ```
   Once `desktop-mcp` 0.1.1 is live, also consider deprecating `desktop-driver-mcp`, which already describes itself as
   deprecated.
6. **Add release guards** (P0-1 follow-ups):
   - an install smoke test of the packed tarballs against the registry versions of dependencies that are not being
     republished
   - a rule that a new public package cannot publish ahead of its workspace dependencies' unreleased changes
7. **Schedule the P2 fixes and the documentation fixes.**

## P0: release blocker

### P0-1. The published `desktop-mcp@0.1.0` cannot be imported or run (Verified)

- **Evidence:**
  - `npm view @fluentui-react-native/desktop-mcp@0.1.0 dependencies` pins `desktop-test` `0.3.0` and
    `desktop-driver` `0.5.3`.
  - The published `lib/` imports `@fluentui-react-native/desktop-test/supervisor-connection` (5 sites) and
    `/control` (3 sites). Neither subpath exists in `desktop-test@0.3.0`'s `exports`.
  - A clean `npm install @fluentui-react-native/desktop-mcp@0.1.0` on Node 24.18 followed by `import()` fails with
    `ERR_PACKAGE_PATH_NOT_EXPORTED`: `./supervisor-connection` is not defined by `exports` in the
    `desktop-test` package manifest when imported by `desktop-mcp/lib/connection.js`.
    The `desktop-mcp` executable loads the same module graph.
- **Root cause:**
  - #4510 introduced the package at version `0.1.0`.
  - The ADO publish pipeline packs every public package whose version is not yet on npm, on every `main` build
    (`.ado/azure-pipelines.publish.yml`, step "Pack public packages (new versions only)"). So `desktop-mcp` published
    as soon as #4510 merged.
  - The `desktop-driver` and `desktop-test` changes that it needs are still waiting in #4509.
  - Because `workspace:*` is published as an exact version, the new package pinned the old dependency versions.
  - Two guards that exist do not catch this case:
    - `check-publishing` (`scripts/src/tasks/checkPublishingTask.ts`) only blocks dependencies on private packages and
      checks that peer dependencies propagate to dependents.
    - `publish-dry-run-pack` (`.github/workflows/pr.yml`) packs the tarballs but never installs them.
  - The `neutral-boundary` fixture also redirects imports to workspace entry points, so a pinned version or a
    missing subpath cannot fail it.
- **Impact:** every user of `desktop-mcp@latest` gets a server that fails at startup. The `desktop-driver-mcp@0.1.4`
  compatibility shim is not affected: it depends only on `desktop-driver@0.5.3`.
- **Suggestions:**
  - Ship 0.1.1 through #4509, and deprecate 0.1.0 (checklist steps 4 and 5).
  - Process: keep a new public package `"private": true` until the Version Packages PR that introduces it, or fail
    packing when a packed package has a workspace dependency with unreleased changes or pending changesets that is not
    packed in the same run.
  - Add an install smoke test to `publish-dry-run-pack`: install the new tarballs together with the registry versions
    of everything else, import every `exports` subpath, and run each executable with `--help`.

## P1: fix before merging #4509

### P1-1. `desktop-test` 0.3.1 is a breaking change released as a patch (Verified)

- **Evidence:** comparing the exports at `49216e359` (the source of 0.3.0) with `HEAD`:
  - The root export `claimDesktopWorkload` was removed (`src/index.ts:1`). The 0.3.0 `CHANGELOG.md:14` documents it
    as API.
  - `DesktopIntegration` lost `run`, `resources`, and `supportsAgent`, and gained `contribute(request)`
    (`src/integration.ts`). Configuration validation now rejects the old fields with "Unknown integration field".
    `serve` with an integration now requires a hosted-driver contribution.
  - `DesktopSupervisorOptions.integration.resources` is no longer read; resources now come from `integrationPlan`
    (`src/supervisor.ts`, `startResources`).
  - `registerDesktopProcessDisposal` changed from returning `() => void` to returning `Promise<() => void>`
    (`src/processControl.ts:28`).
  - `DesktopSupervisor.runner` is now the `DesktopCommandRunner` interface, with optional `close` and `terminate`,
    instead of `NodeDesktopCommandRunner`.
  - Every `desktop-test` changeset is `patch`, and none of them mentions a removal.
  - The repository's own history bumped `desktop-test` 0.3.0 as a minor for a schema change.
- **Impact:**
  - Consumers on `^0.3.0` receive 0.3.1 automatically. They then get an ESM link error on `claimDesktopWorkload` or a
    configuration validation failure for custom integrations, and a synchronous caller of
    `registerDesktopProcessDisposal` receives a Promise in place of its unregister callback.
  - In-repo consumers pin exact versions, so they are unaffected.
- **Suggestion:**
  - Change `.changeset/desktop-workload-authority.md` (or add a changeset) to `"@fluentui-react-native/desktop-test": minor`.
  - Add a migration note: `DesktopIntegration.run`/`resources` become `contribute()` returning
    `{ resources, driver, workload, managedWorkload, attachedWorkload }`, `claimDesktopWorkload` is removed, and
    `registerDesktopProcessDisposal` is now async.
  - The `desktop-driver` changes are additive (`DesktopConnectionBinding`), so a patch bump is correct there.

### P1-2. `connectDesktopWebdriver` keeps WebdriverIO's automatic retries, so failed mutations and launches can be sent again (Verified)

- **Location:** `desktop-driver/src/wdio/DesktopWebdriver.ts:171-191`. The function is used by
  `src/agent/DesktopAgent.ts:148`, `src/cli/createDesktopDriverCommand.ts:431`, and
  `storybook-desktop/src/testing/runWdioTests.ts:288`.
- **Evidence:**
  - `remote({ ...connectionOptions(url), ...grant, capabilities, logLevel })` sets neither `connectionRetryCount` nor
    `connectionRetryTimeout`.
  - WebdriverIO 10.1 defaults to 3 retries (`webdriver/build/node.js:151-153`). `_request` retries every WebDriver
    error response except `stale element reference`, `detached shadow root`, `move target out of bounds`,
    `element click intercepted`, `element not interactable`, `invalid element state`, and messages containing
    `invalid session id` (`node.js:2407-2413`, `2551-2597`).
  - `desktop-test` deliberately sets `connectionRetryCount: 0` (`desktop-test/src/wdio/configuration.ts:100-101`).
- **Impact:**
  - A click or `sendKeys` that fails with `timeout` or `unknown error` after the input was applied is sent again, so the
    input is delivered twice.
  - When the effect is unknown, the retries hit the quarantine, and the caller sees that error in place of the
    original failure and its `data.mutation`.
  - A `POST /session` launch that reaches the 120 s deadline can relaunch the application up to 3 times.
  - This contradicts the driver's own rule that only a mutation known to have had no effect may be retried.
- **Suggestion:**
  - Set `connectionRetryCount: 0` and a `connectionRetryTimeout` longer than the target's launch deadline in
    `connectDesktopWebdriver`.
  - Set both explicitly in `attachDesktopWebdriver` too.
  - Add a contract test that a click that fails is sent exactly once.

### P1-3. The Windows helper dereferences a null UI Automation client and crashes on `windows` (Verified)

- **Location:** `desktop-driver/native/windows/src/automation.cpp:477-494`; `driver.cpp:638-648`;
  `application.cpp:1961-1968`. The caller is `src/server/SessionManager.ts:458-463`.
- **Evidence:**
  - `HasWindowContent` copies `automation_` and `contentWalker_`, then calls `automation->ElementFromHandle(...)` on a
    worker thread.
  - It is the only `Automation` entry point that does not call `Initialize()`. The others call it at lines 997, 1006,
    1194, 1228, 1247 and 1324.
  - `ApplicationManager::Windows` calls it for any visible, untitled, owned `WS_EX_TOOLWINDOW`/`WS_POPUP` window, and
    `SessionManager` lists windows immediately after attach or launch.
- **Impact:**
  - Attaching to an application that already shows a Callout or flyout, or listing windows before any
    `find`/`snapshot`/`observe` call, crashes the helper with an access violation that nothing catches.
  - Every retry crashes the same way while the popup stays open, and applications launched under the job object die
    with the helper.
  - The self-test injects a fake `hasContent` (`selftest.cpp:1552`), so the tests never reach this path.
- **Suggestion:**
  - Call `Initialize()` at the top of `HasWindowContent`, or before running the `windows` command, and guard against a
    null client.
  - Add a self-test that runs the real `windows` command with an untitled tool popup that the application owns.

### P1-4. A large wheel delta crashes the macOS helper while it holds the physical-input lock (Verified)

- **Location:** `desktop-driver/native/macos/Sources/DesktopDriverHost/Input.swift:181-182`;
  `desktop-driver/src/protocol/actions.ts:132-134`.
- **Evidence:**
  - The helper computes `Int32(clamping: Int((-deltaY).rounded()))`. Swift's `Int(Double)` traps when the magnitude is
    2^63 or more, which happens before the clamp runs.
  - Node checks only `typeof action.deltaY === 'number'`, so a JSON value such as `1e300` reaches the helper inside
    `withPhysicalInput`.
- **Impact:** any WebDriver client can crash the session's helper, either deliberately or through a test bug. The crash
  happens while the helper holds the input lock, which leads to P1-5.
- **Suggestion:**
  - In `validateAction`, reject non-finite values and values outside the device range for `x`, `y`, `deltaX` and
    `deltaY`.
  - In Swift, clamp the `Double` before converting it.
  - Add a self-test with an out-of-range delta.

### P1-5. After a helper dies holding the input lock, every later helper fails with `input-busy` (Verified)

- **Location:** `desktop-driver/native/macos/Sources/DesktopDriverHost/InputLock.swift:88-118`;
  `desktop-driver/src/hosts/native/NativeDesktopHost.ts:499-504`.
- **Evidence:**
  - Only an orderly `release()` deletes the owner record.
  - When a later acquisition with `.fail` policy finds a dead owner, it throws `input-busy` ("Run the helper with
    --release-input") and leaves the record in place.
  - Node's `recoverInput()` returns early when its own record of pressed keys and buttons is empty. That record stays
    empty for `activate`, `closeWindow`, `setWindowRect`, wheel-only or move-only actions, and keyboard `clear`. In
    those cases `--release-input`, the only path that adopts a dead owner, never runs.
- **Impact:** a single helper death during one of these commands blocks physical input for that user, across every
  service, until someone runs `--release-input` by hand. P1-4 is one way to trigger it.
- **Suggestion:** after any unexpected helper exit, always run `--release-input`; with an empty record it still adopts
  and deletes the owner record. Alternatively, record why the lock was taken, so that an owner that held the lock only
  for focus can be adopted safely.

### P1-6. macOS pointer actions land at screen position (0,0) when the origin's geometry can't be read (Verified code path)

- **Location:** `desktop-driver/native/macos/Sources/DesktopDriverHost/Driver.swift:729-752`;
  `Accessibility.swift:692`; `Application.swift:82-95`.
- **Evidence:**
  - `readSnapshot` sets `screenRect = readableFrame ?? .zero`.
  - `resolveActionPoint` returns `snapshot.screenRect.midX + x`, `midY + y` without checking the geometry.
  - For the viewport origin, `currentFrame()` falls back to `lastKnownFrame ?? .zero`.
  - The macOS README notes that Fabric remounts briefly return AX failures, which is exactly when this path runs.
- **Impact:** a following `pointerDown`/`pointerUp` clicks the top-left corner of the main display (the Apple menu),
  outside the application under test. W3C requires `move target out of bounds` in this case.
- **Suggestion:** require readable geometry with a positive area for element and viewport origins. Otherwise fail with
  effect `none`, and never fall back to `.zero`.

### P1-7. macOS `performActions` has no target-ownership guard (Windows has one)

- **Location:** `desktop-driver/native/macos/Sources/DesktopDriverHost/Driver.swift:229-235, 658-728`. Compare
  `native/windows/README.md:357-361, 377-378`.
- **Evidence:**
  - `pointerDown` and scroll are posted wherever the resolved point falls, and keys go to whichever application is
    frontmost.
  - There is no hit-test against the owner, no foreground check, and no activation step. The Windows helper refuses
    `pointerDown` and scroll over windows it hasn't leased, and activates the leased application first.
  - `references/current-status.md:72` claims that physical input refuses an obscured target.
- **Impact:** raw action sequences with wrong coordinates, or sent after focus has moved, act on applications the driver
  does not own. The two providers behave differently for the same test. Confidence that the guard is missing is high;
  confidence in the severity is medium.
- **Suggestion:**
  - Before `pointerDown` or scroll, hit-test and require the owner to be a leased process. Before key events, require
    or establish a leased frontmost application. Refuse with effect `none`.
  - If that is out of scope for this release, correct `current-status.md` and document the gap as a known limitation.

## P2: fix soon after the release

### Packaging and public API

- **P2-1. CommonJS `require()` of every package fails (Verified).**
  - `exports["…"].default` points to `./src/*.ts`, so
    `require('@fluentui-react-native/desktop-driver/client')` fails with
    `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`. `import` works.
  - This is the repository-wide convention (`framework-base`, `components` and `storybook-desktop` do the same), and it
    exists for Metro. These Node-only packages have no React Native consumer, though, and CommonJS consumers such as
    `wdio.conf.cjs` or CJS Jest setups that use the `/testing` fakes get a confusing error.
  - Suggestion: add a `"node"` (or `"require"`) condition that resolves to `./lib/*.js` ahead of `default`. Keep the
    TypeScript source behind a custom condition for in-repo tooling, and confirm that in-repo Jest resolution still
    works.
- **P2-2. No `engines` field (Verified).**
  - The driver README asks for Node 22.19 or later (for a repository checkout), and the repository root declares
    `^22.19.0 || ^24.0.0 || >=26.0.0`. Consumers get no such signal.
  - The code uses `fs.globSync` (`desktop-test/src/config.ts`), `AbortSignal.any`, `--import` in `NODE_OPTIONS`, and
    loads `.mts` configuration files through type stripping.
  - Older Node versions fail late and cryptically.
  - Suggestion: add the root range to all three packages, and add an early version check in each `config/cli.cjs`.
- **P2-3. New `desktop-test` public subpaths are undocumented, and one exposes internals.**
  - `./runner-connection` exports `createDesktopRunnerBroker`, `requestDesktopRunnerWorker`,
    `connectVerifiedDesktopRunner`, and the names of the credential environment variables
    (`src/wdio/runnerConnection.ts:16-19, 55, 189, 326`).
  - `./control`, `./supervisor-connection`, `./managed-host`, and the new root exports `createDesktopRunContext`,
    `acquireHostedDesktopDriver`, `publishDesktopHostManagement`, `desktopHostReady` and `formatDesktopHostReady` have no
    reference documentation.
  - The `neutral-boundary` fixture, which checks "every public library entry", leaves out `./runner-connection`.
  - Decide before the 0.4.0 contract is set: document the supported members, or keep them internal.
    `storybook-desktop` already imports `./runner-connection`.

### desktop-driver (TypeScript)

- **P2-4. Server shutdown waits on client sockets, so input release and app cleanup can hang (Verified, including a
  Node experiment).**
  - Location: `src/server/createDesktopDriverServer.ts:147-152, 186-199, 1370-1373`.
  - `runCleanup` awaits `server.close()` before `deleteAll()` and host disposal.
  - Responses sent while the server is shutting down omit `Connection: close`.
  - No `closeIdleConnections()`/`closeAllConnections()` call, `headersTimeout`, `requestTimeout`, or `maxConnections`
    is set, and Node stops enforcing request timeouts after `close()`.
  - In Node 24.18, an HTTP server whose client reused a keep-alive socket was still answering with
    `Connection: keep-alive` 4 s after `close()` (26 responses), and `close()` had not completed.
  - Impact: a polling client, or a partial request from any local process, blocks cleanup indefinitely. Keys or
    buttons left pressed by an aborted `performActions` stay pressed, launched applications and helpers stay alive, and
    `desktop-test`'s `driverService.close()` waits with no deadline.
  - Suggestion: track in-flight handlers rather than sockets, send `Connection: close` during shutdown, call
    `closeIdleConnections()` and then `closeAllConnections()` after a short grace period, and set explicit timeouts as
    `desktop-test/src/supervisorConnection.ts` does.
- **P2-5. CLI defaults override the documented environment variables (Verified).**
  - Location: `src/cli/createDesktopDriverCommand.ts:258, 276-277, 297`.
  - `.default('if-missing')` and `.default('release')` make the option always explicit, so the resolver never reads
    `FURN_DESKTOP_DRIVER_BUILD_POLICY` or `FURN_DESKTOP_DRIVER_CONFIGURATION`.
  - With `BUILD_POLICY=never`, `resolve-driver` still compiles on a cache miss, and `doctor` checks `release` while
    in-process consumers resolve `debug`.
  - This contradicts `references/native-helpers.md` ("An explicit API or CLI option takes precedence").
  - Suggestion: drop the commander defaults (state the default in the help text) and add tests with the environment
    variables set.
- **P2-6. An empty `FURN_DESKTOP_DRIVER_CACHE_ROOT` makes the working directory the native store.**
  - Location: `src/native/nativeDriver.ts:374`; `filesystem.ts:101`.
  - `?? process.env[...]` keeps `''`, and `path.resolve('')` returns the current directory, so a build writes
    `<cwd>/v1/{artifacts,staging,locks,...}`. Other variables treat an empty value as unset.
  - Suggestion: treat empty or whitespace `FURN_DESKTOP_DRIVER_*` values as unset, and reject an explicit empty
    `cacheRoot`.
- **P2-7. A stale build lock is reclaimed only when it was taken on the same host by a process that is now dead.**
  - Location: `src/native/filesystem.ts:239-265`.
  - After a killed build, a hostname change (common on macOS), PID reuse, or a cache shared between machines makes
    every later build time out after 120 s until someone deletes `v1/locks/<key>` by hand.
  - `release()` and reclaiming a stale lock don't check ownership, so two waiters can delete each other's locks.
  - The documentation says waiters reclaim a stale lock.
  - Suggestion: record a random token or the process start time, reclaim after a longer stale period regardless of
    host, release only when the token matches, and name the lock path in the error.
- **P2-8. A spawn failure from descriptor exhaustion (EMFILE) crashes Node.**
  - Location: `src/native/boundedCommand.ts:41-45, 99`; `src/hosts/native/NativeHostProcess.ts:133-163`;
    `NativeDesktopHost.ts:506-518`; `src/cli/createDesktopDriverCommand.ts:512-547`.
  - `child.stdout.on(...)` runs before `once('error')` is attached. On EMFILE, `stdout` is undefined, which throws, and
    the asynchronous `'error'` event is then unhandled. The reviewer reproduced this with `ulimit -n 64`.
  - `authorityHelper.ts` already does this correctly.
  - Suggestion: attach the error listener immediately after `spawn` and guard against missing stdio.
- **P2-9. Duplicate or late answers from the helper are ignored, but the documentation says they fail the transport.**
  - Location: `src/hosts/native/NativeHostProcess.ts:336-351, 462-470`.
  - If a `cancelled` message (effect `none`) is followed by a real `response` (applied), Node keeps the `none` verdict
    and does not quarantine the target.
  - Suggestion: keep a bounded set of settled request IDs and fail with `invalid-message`.
- **P2-10. The known #4349 flakes have identifiable causes.**
  - `src/native/boundedCommand.test.ts:22-34` sends SIGTERM 300 ms after spawn, before the child has installed its
    handler when the machine is loaded. The result is `SIGTERM` instead of `SIGKILL`.
  - `src/authority/macosPrivateStorage.ts` spawns `/bin/ls -lde` once per ancestor directory. That is about 32
    processes per journaled mutation, about 64 per W3C click, and about 130 sequential spawns in the slow test against
    a 10 s timeout.
  - Suggestion: have the child print `ready` after installing its handler and assert `SIGKILL` only after that.
    Check all the paths with a single `ls -lde a b c` call.
  - This matters for the release because the publish pipeline runs the whole test suite.
- **P2-11. `perform` can't target action names that `observe` rewrites.**
  - Location: `src/operations/projection.ts:340-347`; `text.ts:93-100`; `act.ts:53-57, 391`.
  - `observe` lists `safeToken(name)` (other characters become `_`, cut at 48), but `performNamedAction` matches the raw
    name. For example, "Open in tab" is listed as `Open_in_tab`, and performing it fails with `action-not-published`.
  - Suggestion: match on the token, and refuse with `action-not-unique` when two names collapse to the same token.
- **P2-12. `observeDelta` can issue references whose provider records were already released.**
  - Location: `src/operations/observe.ts:241-242, 354, 480`; `sampling.ts:185-186`.
  - When the observation store refuses a large sample, the nodes are released before `deltaPage` issues references
    for the added nodes, so those references fail as `ref-stale`.
  - Suggestion: issue the first page's references before the release, or fall back to `mode: "fresh"`.
- **P2-13. Read-path failures pass provider and orchestrator messages to agents.**
  - Location: `src/operations/envelope.ts:162-169`; `sampling.ts:93`; `check.ts:216`; `act.ts:174-183`;
    `story.ts:110-111, 187-191`; `sequence.ts:83-92`.
  - This violates the AGENTS.md rule that displayed text never enters an error message, and the statement in
    `operations.md:285-288`.
  - `executor.test.ts:79-91` encodes the leak, with a window title in the expected message.
  - Suggestion: rebuild messages from fixed text per error code, as `providerFailure` already does.
- **P2-14. The story runner executes plans from the service without validating them.**
  - Location: `src/runner/StoryTestRunner.ts:72, 199-209, 295-361`.
  - The `switch` in `performAction` has no `default`, so an unknown action passes, and a test with `steps: []` passes.
  - Suggestion: run `validateDesktopStoryTests` on each selected entry, and add `default: throw`.
- **P2-15. A second `setArgs` step in the same test always fails.**
  - Location: `src/runner/StoryTestRunner.ts:345-346, 633-637`;
    `src/server/createDesktopDriverServer.ts:750-752, 777-778`.
  - The args route sets `session.story = null`, so the next `getCurrentStory()` call returns `null`.
  - Suggestion: pass the story ID the runner already selected.
- **P2-16. The standard `timeouts` capability is accepted without validation and then ignored.**
  - Location: `src/protocol/capabilities.ts:8-20, 136-145`; `src/server/SessionManager.ts:500-504`.
  - Sessions always start with `implicit: 0`, and `timeouts: "abc"` is accepted even though W3C requires
    `invalid argument`.
  - Suggestion: validate it with the `POST /timeouts` validator and apply it at session creation.

### Native helpers

- **P2-17. Element `sendKeys` types the W3C NULL key and unmapped special keys as private-use characters, and doesn't
  hold modifiers (both platforms).**
  - Location: `native/windows/src/input.cpp:21-46, 526-545`; `native/macos/.../Input.swift:221-235`.
  - For example, `Keys.chord(CONTROL, "a")` types `a` followed by a U+E000 character and reports success.
  - Suggestion: implement the W3C modifier state, or reject unmapped U+E000 to U+E05D values with `invalid-params`.
- **P2-18. Windows capture never recovers after the Direct3D device is lost (RDP reconnect, TDR).**
  - Location: `native/windows/src/capture.cpp:61-63, 119, 149, 210-214`.
  - Suggestion: on `DEVICE_REMOVED` or `DEVICE_RESET`, drop the device and retry once.
- **P2-19. macOS `launchTimeoutMs` is applied to each launch phase.**
  - Location: `native/macos/.../Application.swift:362-372, 1267-1276, 1354-1383`.
  - Node's deadline therefore always fires first. The cancelled launch must then settle within 2 s, but it makes AX
    reads without checking for cancellation. If settling takes longer, the helper is killed and the application is
    left running with ownership `unknown`.
  - Suggestion: use one absolute deadline with a margin under Node's deadline, and check for cancellation between AX
    calls.
- **P2-20. Unsigned clock subtraction can crash the macOS helper.**
  - Location: `native/macos/.../Support.swift:152-153`; `WindowEvents.swift:188-199, 225-236`.
  - The helper reads the clock twice around a check, and `diagnostic()` reads `now` before taking the lock, so the
    subtraction can underflow. Inside the input lock this also leads to P1-5.
  - Suggestion: read the clock once, or use saturating subtraction.
- **P2-21. Unreadable geometry and state are reported as definite values.**
  - Location: `native/macos/.../Accessibility.swift:525, 533, 692-699, 1040`;
    `native/windows/src/automation.cpp:1622, 1630`.
  - Unreadable geometry becomes a zero-sized `rect`, and window rectangles can come back as all zeros.
  - Page source writes unsupported `enabled`/`visible` as `"false"` on both platforms.
  - This contradicts the rule "never report unsupported as false" and the macOS `README.md:357`.
- **P2-22. A macOS physical double-click probably registers as two single clicks.**
  - Location: `native/macos/.../Input.swift:165-171, 354-368`.
  - The helper never sets `mouseEventClickState`, and the authored `doubleClick` step is two separate element clicks
    (`src/runner/StoryTestRunner.ts:305-309`).

### desktop-test

- **P2-23. Windows crash recovery can never accept a real supervisor claim (Verified).**
  - Location: `src/ownership.ts:330-335`; `src/services.ts:316`; `src/supervisor.ts:77`.
  - Recovery requires `resource.id === 'webdriver'`, but the scope records `${runId}:webdriver`. Only the synthetic
    test claim passes.
  - The reconciliation that `README.md:83`, `references/lifecycle.md:250` and `current-status.md` advertise is
    therefore unreachable after any crash. It fails closed, leaving a lock that has to be removed by hand.
  - Suggestion: match `${record.owner.runId}:webdriver` together with the driver-service identity, and add a test that
    feeds a claim written by the real scope into recovery.
- **P2-24. Supervisor-owned launch ignores scope cancellation.**
  - Location: `src/supervisor.ts:251-264`; `src/applicationOwnership.ts:501-505`.
  - `createDesktopApplicationHost(...)` is called without a `signal`, unlike Storybook (`retainedApplication.ts:31-35`).
  - Pressing Ctrl+C during a slow launch can't cancel it. The 60 s drain then gives up and the claim is retained.
  - Suggestion: pass `signal: options.signal`.
- **P2-25. Acquisitions abandoned at shutdown are recorded as settled before they exist.**
  - Location: `src/services.ts:166-177, 297-303, 356-362, 372-385`.
  - After the drain deadline, disposal runs on an entry whose acquisition is still in flight, and `settled` is
    published to the claim.
  - When the late result arrives, its service is never closed. This contradicts `lifecycle.md:141`.
- **P2-26. A stale `interactive.lock` blocks all runs, and the error gives no recovery guidance.**
  - Location: `src/ownership.ts:130-138, 243-260`.
  - The owner is never checked for liveness, and the contention error prints only the file path.
  - On Windows, the recovery message hides the path entirely, and no CLI command wraps `inspectDesktopWorkloadClaim`.
  - Suggestion: print the owner's PID, start time, run and target together with the inspection result, and document
    the manual procedure. Automatic reclaim is tracked separately in #4451.
- **P2-27. An interrupted WDIO suite is recorded as `failed`, not the documented `incomplete`.**
  - Location: `src/commands.ts:281-283, 329, 337`; `config/launcher.cjs:8-11`; `src/reporting/transport.ts:123-129`;
    `src/reporting/results.ts:353`.
  - WDIO's `shutdown()` deletes the sessions under running specs, and killed workers are reported as disconnected
    producers. This contradicts `commands.md:52-57`, `lifecycle.md:96-97` and `reporting.md:157-159`.
  - Only a `prep` interrupt has a contract test.

### desktop-mcp and workload management

- **P2-28. In supervisor mode, `desktop-mcp` stays bound to the first descriptor it reads.**
  - Location: `desktop-test/src/supervisorConnection.ts:228-234, 379-391`; `desktop-mcp/src/server.ts:125`.
  - After `serve` restarts, every tool, including the driver tools, reports that the service is unavailable until the
    MCP client restarts the adapter. Driver-only mode recovers on its own.
  - Suggestion: rebind to the new instance while keeping the admission records, or at least return a distinct reason
    and document that the adapter must be restarted.
- **P2-29. Leaked management principals fill a 32-slot limit that never expires, and driver tools need a slot too.**
  - Location: `desktop-test/src/control.ts:185, 244, 326-337`; `desktop-mcp/src/cli.ts:43-50`;
    `workloadController.ts:22-27`.
  - SIGHUP, a crash, or the MCP SDK's escalation from SIGTERM to SIGKILL skips disposal. After 32 unclean exits, every
    new session fails until `serve` restarts.
  - The `capacity` error is reported as `service-unavailable`.
  - Suggestion: take a principal only for `desktop_workload`, add an idle lease, and report `capacity` as itself.
- **P2-30. Workload results expose application text, stack traces and absolute paths to the model.**
  - Location: `desktop-test/src/reporting/runQueries.ts:294-298, 322-339`; `results.ts:438, 445`.
  - Result items carry `failure.error.message`, and the `junit.xml` artifact embeds `JSON.stringify(failure)`,
    including the stack.
  - `present()` redacts only secrets and the run root. This contradicts `management.md:61-62`.
  - Suggestion: strip stack traces and replace the project and home roots with placeholders, or document these fields
    as untrusted.

## P3: minor defects and hardening

### Packaging and release

| ID       | Issue                                                                                                                                                                                                                                                                               | Suggestion                                                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P3-PKG-1 | The tarballs ship tests: 450 test files in `desktop-driver@0.5.3` (1,118 files, 7.7 MB unpacked) and 175 in `desktop-test@0.3.0`, plus compiled tests, source maps, `jest.config.cjs` and `tsconfig.json`.                                                                          | Use the negated `files` patterns that `desktop-mcp` already uses (`check-package-contents` supports them).                                                          |
| P3-PKG-2 | Test-only sources compile into `lib/` and ship: `desktop-driver/src/native/windows/win32FixtureSupport.ts`, `fakeAuthorityHelper.ts`. The exports can't reach them, and the fixture sources they build are not shipped.                                                             | Rename or move them to test-support files that are excluded from the package.                                                                                       |
| P3-PKG-3 | `desktop-test` resolves `@wdio/cli`, `@wdio/local-runner` and `@wdio/<framework>-framework` from the consumer at run time (`src/wdio/run.ts:58-69, 95`), but lists them only as devDependencies.                                                                                    | Declare them as optional `peerDependencies`. The runtime error message is already clear. `check-publishing` will then require dependents to declare the same peers. |
| P3-PKG-4 | `desktop-driver` has a hard dependency on `webdriverio`, which only `src/wdio/DesktopWebdriver.ts` imports. A clean install of `desktop-mcp` pulls in 261 packages.                                                                                                                 | Make it an optional peer dependency for `/wdio` users. This also avoids two copies of WebdriverIO. Peers propagate to dependents, as in P3-PKG-3.                   |
| P3-PKG-5 | `"author": ""` in `desktop-driver/package.json`.                                                                                                                                                                                                                                    | Remove the field or fill it in.                                                                                                                                     |
| P3-PKG-6 | #4509 changelogs: `desktop-mcp` 0.1.1 repeats "Updated dependencies [2fa16dd]" five times and doesn't mention that 0.1.0 is broken. The `desktop-driver` 0.5.4 entry describes `desktop-test` features (shared changeset text). The docs-only #4507 entry appears in four packages. | Edit the Version Packages PR text, and use one changeset per package in future.                                                                                     |

### desktop-driver (TypeScript)

| ID        | Issue                                                                                                                                                                                                            | Location                                                                                      | Suggestion                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| P3-DRV-1  | Client disconnect doesn't cancel session creation, implicit waits, or runner preemption. An orphaned session keeps the target `target-busy`.                                                                     | `src/server/createDesktopDriverServer.ts:457-461, 521-528, 1105`; `SessionManager.ts:309-319` | Pass `context.signal` through; check the signal before preempting; use `AggregateError`.                           |
| P3-DRV-2  | A journal publish that lands after its deadline makes the target refuse every mutation until restart, with no quarantine shown.                                                                                  | `src/server/settlementJournal.ts:119-141, 197-213`                                            | Treat an unknown publish as possibly stored, or raise a journal quarantine.                                        |
| P3-DRV-3  | `recoverTarget` lifts a quarantine for any `evidence` value other than an exact `'application-exited'`.                                                                                                          | `src/server/SessionManager.ts:195-212`                                                        | Reject anything other than `application-exited` or `operator`.                                                     |
| P3-DRV-4  | Target registration ignores unknown or misspelled fields (a misspelled `launchMode` allows both launch and attach) and doesn't validate the enum fields.                                                         | `src/server/TargetRegistry.ts:18-37`                                                          | Reject unknown keys and validate `platformName`, `endpoint` and `renderer`.                                        |
| P3-DRV-5  | Element `css/{name}` and session-level `shadow` routes return `unknown command` (404) instead of the documented `unsupported operation`.                                                                         | `src/server/createDesktopDriverServer.ts:1022, 1241-1243`                                     | Classify them as unsupported and add tests.                                                                        |
| P3-DRV-6  | Scope failures return `401 unauthorized` with several different messages; the documentation says the message is constant.                                                                                        | `src/server/createDesktopDriverServer.ts:394, 415, 418, 466`                                  | Use a distinct code with `data.reason`, or document the behavior.                                                  |
| P3-DRV-7  | `revokeAndDrain` reports success without draining once `close()` has begun (affects direct embedders).                                                                                                           | `src/server/createDesktopDriverServer.ts:170-176`                                             | Keep the revocation listener until cleanup finishes.                                                               |
| P3-DRV-8  | One principal can use up the service-wide limit of 4,096 grants, and leaked children are never reclaimed.                                                                                                        | `src/authority/grants.ts:120`                                                                 | Add a cap per parent and/or reclaim idle children.                                                                 |
| P3-DRV-9  | Regular expressions on `codesign`/`security` output are polynomial (R-SCAN-001); 120,000 characters took 958 ms.                                                                                                 | `src/native/macos/buildMacOSDriver.ts:262, 343`                                               | Use `startsWith` and parse; use `[ \t]*`.                                                                          |
| P3-DRV-10 | Tests splice values into `node -e` and into a generated helper (R-SCAN-002).                                                                                                                                     | `src/native/nativeDriver.test.ts:96-99`; `nativeCache.test.ts:24-44`                          | Pass values through `argv` or a JSON file.                                                                         |
| P3-DRV-11 | Publish and quarantine renames have no retry on Windows for antivirus `EPERM`/`EACCES`/`EBUSY`.                                                                                                                  | `src/native/nativeDriver.ts:181-189, 248, 303, 468`                                           | Retry briefly on win32.                                                                                            |
| P3-DRV-12 | Cancelling a build leaves orphaned compiler processes; staging, trash and diagnostics in the native store are never cleaned up.                                                                                  | `src/native/boundedCommand.ts:41, 85-92`; `nativeDriver.ts:274-312`                           | Kill the process group (POSIX) or tree (`taskkill /T`); clean up while holding the lock.                           |
| P3-DRV-13 | The cache root is trusted by its location alone: no owner or permission check, and the helper is spawned later without hashing it again.                                                                         | `src/native/nativeDriver.ts:412-449, 694-718`                                                 | On POSIX, require a user-owned root that is not group- or world-writable, and document it.                         |
| P3-DRV-14 | A host-event subscriber that throws tears down the helper, or throws uncaught from `setImmediate`.                                                                                                               | `src/hosts/native/NativeDesktopHost.ts:567-584`; `NativeHostProcess.ts:304-313, 386-393`      | Wrap each listener call in try/catch.                                                                              |
| P3-DRV-15 | The one-shot handshake `hello` isn't validated: a missing field becomes `internal` instead of `handshake-failed`.                                                                                                | `src/native/nativeDriver.ts:598-647`                                                          | Use `validateHelperMessage`.                                                                                       |
| P3-DRV-16 | macOS signature verification runs `codesign`, `security` and `xcrun` from `PATH`, and Yarn puts `node_modules/.bin` first.                                                                                       | `src/native/macos/buildMacOSDriver.ts:105-109, 224-365`                                       | Use absolute `/usr/bin/...` paths.                                                                                 |
| P3-DRV-17 | Helper processes for recovery, permissions and authority get SIGTERM only. The authority helper reports failure before its child exits, and the recovery error embeds raw stderr, which can include a typed key. | `src/hosts/native/NativeDesktopHost.ts:512-548`; `src/native/authorityHelper.ts:52-61`        | Escalate to SIGKILL, settle only after exit, and use fixed messages.                                               |
| P3-DRV-18 | The `reason`/`nativeCode` allowlist accepts lowercase prose (for example "confidential report for payroll q3").                                                                                                  | `src/operations/envelope.ts:29, 128`; `journal.ts:34, 125-127`                                | Allow only kebab-case tokens.                                                                                      |
| P3-DRV-19 | `neutralizeText` misses invisible code points: U+E0100 to U+E01EF, U+FE00 to U+FE0F, U+00AD, U+034F, U+115F, U+1160, U+180E, U+3164 and U+FFA0.                                                                  | `src/operations/text.ts:7-55`                                                                 | Cover `Default_Ignorable_Code_Point`.                                                                              |
| P3-DRV-20 | Unsupported `focused`, `selected`, `required` and `visible` states look the same as `false` in the projection.                                                                                                   | `src/operations/projection.ts:363-400`                                                        | Emit `?focused`-style flags, as `?enabled` already does.                                                           |
| P3-DRV-21 | `story` reports refusals made before dispatch (effect `none`) as `story-not-ready`.                                                                                                                              | `src/operations/story.ts:158-176, 203`                                                        | Keep the original reason.                                                                                          |
| P3-DRV-22 | A cancelled `sequence` is journaled as `ok`, skips its closing observation without an `observationError`, and is replayed from the ledger.                                                                       | `src/operations/sequence.ts:108-111, 143-150`; `executor.ts:63-105`                           | Journal it as cancelled, and don't record cancellations with effect `none`.                                        |
| P3-DRV-23 | Capturing failure evidence activates windows (a recorded mutation that can dismiss popups or quarantine the target).                                                                                             | `src/artifacts/failureEvidence.ts:57-84`                                                      | Use `getWindowTree(windowId)`, skip it when quarantined, and document it.                                          |
| P3-DRV-24 | The lane verdict and input masks come from client capabilities, which an attached session may lack, so a lane run with skips reports `passed`.                                                                   | `src/runner/StoryTestRunner.ts:109, 131-134, 524-532`                                         | Read the mode from `GET furn/input`.                                                                               |
| P3-DRV-25 | `subtractDesktopInputReceipts` drops decreasing counts, which hides undeclared input after `reloadSession()`.                                                                                                    | `src/authoring/input.ts:95-101`                                                               | Throw on a decrease, or compare session IDs.                                                                       |
| P3-DRV-26 | Plan validation gaps: `keys` values aren't validated, artifact names have no length limit (`ENAMETOOLONG`), and names made only of non-ASCII characters all collapse to `-`.                                     | `src/authoring/storyTests.ts:129-181`; `src/artifacts/ArtifactManager.ts:61, 125`             | Use `isSingleWebDriverKeyValue`, cap names, and add a hash suffix.                                                 |
| P3-DRV-27 | Plan actions behave differently from their names: `doubleClick` is two clicks, an untargeted `scroll` happens at (0,0), and `requires: ['physical-click']` ignores `furn:clickMode`.                             | `src/runner/StoryTestRunner.ts:305-341, 515-536`                                              | Use pointer actions, scroll at the window centre, and check the click mode.                                        |
| P3-DRV-28 | Infrastructure failures (`unauthorized`, artifact `EPERM`) are classified as test failures, and results are lost if `writeRunResult` throws.                                                                     | `src/runner/StoryTestRunner.ts:76-113, 316-353, 437, 489-508`                                 | Reclassify them, and persist or log the results before throwing.                                                   |
| P3-DRV-29 | Runner cancellation takes effect only between requests; evidence capture after a cancel has no time limit.                                                                                                       | `src/runner/StoryTestRunner.ts:230-236, 679-702`                                              | Pass the signal to client calls and put a time limit on evidence capture.                                          |
| P3-DRV-30 | Capability validation is lazy across `firstMatch` entries, and `alwaysMatch: null` / `firstMatch: null` are accepted.                                                                                            | `src/protocol/capabilities.ts:46-47, 68-75`                                                   | Validate every candidate first.                                                                                    |
| P3-DRV-31 | Client hardening: responses are read with `response.text()` with no size limit and no timeout; `newSession` isn't validated; `errorStatuses["constructor"]` hits the object prototype; IDs aren't URL-encoded.   | `src/client/DesktopDriverClient.ts:98-106, 126, 194-196, 417`; `src/protocol/errors.ts:36`    | Use `Object.hasOwn`, validate `sessionId`, apply `encodeURIComponent`, and add an optional timeout and size limit. |
| P3-DRV-32 | The fake host differs from native behavior: every click moves focus, and `helpText` isn't clipped.                                                                                                               | `src/hosts/fake/FakeDesktopHost.ts:534-538`; `observeTree.ts:227`                             | Make the fake match native behavior.                                                                               |

### Native helpers

| ID        | Issue                                                                                                                                                                   | Location                                                                  | Suggestion                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| P3-WIN-1  | A pattern query that fails with `E_FAIL` is treated as "absent", so activation falls through to a different pattern.                                                    | `native/windows/src/automation.cpp:110-122, 1430-1475, 1544-1552`         | Classify it as `Failed`.                                             |
| P3-WIN-2  | A live process whose executable was renamed or moved returns `invalid-params` with no `data.reason`.                                                                    | `native/windows/src/application.cpp:213-231, 275, 1916`                   | Return `application-identity-unknown`.                               |
| P3-WIN-3  | A failed `CreateProcessW` is reported as `applicationSettlement: "exited"`.                                                                                             | `native/windows/src/application.cpp:1481-1491, 1637-1651`                 | Report `exited` only when a process was created.                     |
| P3-WIN-4  | `pause` and pointer-move durations are silently capped at 30 s, while Node accepts any non-negative value.                                                              | `native/windows/src/driver.cpp:85-92`                                     | Reject values above the cap.                                         |
| P3-WIN-5  | Hardening gaps: no `SetDefaultDllDirectories` or `/DEPENDENTLOADFLAG:0x800`, no `SetErrorMode` (a WER dialog keeps a dead helper alive), and Control Flow Guard is off. | `native/windows/src/main.cpp:157-160`; `DesktopDriverHost.vcxproj:62-74`  | Add the load flag and `SetErrorMode`; consider `/guard:cf`.          |
| P3-WIN-6  | Byte truncation can split UTF-8 sequences in errors and diagnostics.                                                                                                    | `native/windows/src/host.cpp:18, 30-32`                                   | Use `BoundedText`.                                                   |
| P3-MAC-1  | `windows` fails the whole listing if one window closes while it is being serialized.                                                                                    | `native/macos/.../Driver.swift:337-347`                                   | Skip records that go stale.                                          |
| P3-MAC-2  | A closed window ID can be re-bound to a new window with the same title; `closeWindow` reports success even when a sheet vetoes the close.                               | `native/macos/.../Application.swift:953-975`; `Driver.swift:129-143`      | Require evidence that it's the same window, and confirm destruction. |
| P3-MAC-3  | A launch cancelled before it starts carries no `applicationSettlement: "not-started"`, so `desktop-test` marks it uncertain.                                            | `native/macos/.../Host.swift:212-223`                                     | Send `not-started`.                                                  |
| P3-MAC-4  | The pre-existing-process check uses the stale `NSWorkspace` cache, contrary to the README.                                                                              | `native/macos/.../Application.swift:371-398, 1258, 1283`                  | Use kernel enumeration.                                              |
| P3-MAC-5  | Extreme accessibility geometry traps in `String(Int64(number))` or produces infinity, which isn't valid JSON.                                                           | `native/macos/.../Accessibility.swift:1083-1088`; `Support.swift:260-272` | Clamp or validate the values.                                        |
| P3-MAC-6  | Exit can't be proven when another user's process reuses the PID.                                                                                                        | `native/macos/.../ApplicationIncarnation.swift:77-85`                     | Compare the start time before the user check.                        |
| P3-MAC-7  | Keyboard fidelity: E018/E019 use US key codes, and shortcuts are posted as key code 0 plus a Unicode string.                                                            | `native/macos/.../Input.swift:197-214, 331-335, 453-454`                  | Map through the current layout; add Cmd+C and Cmd+V fixtures.        |
| P3-MAC-8  | The 64-level ancestor limit classifies deeply nested elements as belonging to another window.                                                                           | `native/macos/.../Accessibility.swift:127, 214-270`                       | Return unknown at the limit.                                         |
| P3-MAC-9  | State grows without bound: `watchedElements` is never pruned, and per-incarnation lock files are never deleted.                                                         | `native/macos/.../WindowEvents.swift:333-341`; `ApplicationLock.swift:32` | Prune them.                                                          |
| P3-MAC-10 | `find`, `tree` and `source` throw `no-such-lease`, which Node can't translate; `observe` uses `no-such-window`.                                                         | `native/macos/.../Driver.swift:160-166, 264-275`                          | Use `no-such-window` everywhere.                                     |

### desktop-test

| ID        | Issue                                                                                                                                         | Location                                                             | Suggestion                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| P3-TST-1  | Claim creation isn't atomic in its content (`writeFileSync` with `wx`), and every errno, including EACCES, is reported as contention.         | `src/ownership.ts:130-138, 544`                                      | Write a temp file, publish it with `linkSync`, and report contention only on EEXIST. |
| P3-TST-2  | Releasing a claim on Windows has no retry for transient sharing violations.                                                                   | `src/ownership.ts:204, 363`                                          | Reuse the bounded retry used for replacement.                                        |
| P3-TST-3  | The claim grows without bound in a long-lived `serve`; recovery refuses claims over 1 MiB.                                                    | `src/ownership.ts:154-176`; `src/applicationOwnership.ts:354`        | Prune settled records with no effect.                                                |
| P3-TST-4  | A registered disposal can't be withdrawn, so an owned service that fails on its own is always fenced as a lost producer.                      | `src/processControl.ts:90-93`; `config/process-lifeline.mjs:100-106` | Send `disposed` after cleanup, or add a withdrawal frame.                            |
| P3-TST-5  | Lifeline request IDs (`pid-size-Date.now()`) can collide.                                                                                     | `config/process-lifeline.mjs:89`                                     | Use a monotonic counter.                                                             |
| P3-TST-6  | SIGBREAK isn't handled on Windows.                                                                                                            | `src/signals.ts:10`                                                  | Treat it as an interrupt.                                                            |
| P3-TST-7  | Supervisor discovery discards every original error.                                                                                           | `src/managedHost.ts:163-166`                                         | Attach a sanitized `cause`.                                                          |
| P3-TST-8  | `/workloads` reads the request body before authenticating the principal, so a local process can hold the 64 request slots.                    | `src/supervisorConnection.ts:408-420, 516-518`                       | Look up the principal first.                                                         |
| P3-TST-9  | One failed `prepare` fences management and leaves the claim locked after `serve` exits.                                                       | `src/control.ts:347, 443-447`                                        | Fence only when cleanup is uncertain.                                                |
| P3-TST-10 | A second interrupt doesn't reach managed-workload processes.                                                                                  | `src/runContext.ts:44-58`; `src/managedWdio.ts:54-71`                | Register managed runners with the host's `terminate()`.                              |
| P3-TST-11 | A leftover supervisor descriptor blocks `serve --agent` with an opaque discovery error.                                                       | `src/supervisorConnection.ts:131, 694-696`                           | Report a non-secret "record exists" reason and document removal.                     |
| P3-TST-12 | Managed accessible runs on a masked host don't record `host-masked`.                                                                          | `src/managedWdio.ts:62`                                              | Pass `'host-masked'`.                                                                |
| P3-TST-13 | `connectDesktopSupervisor` drops the original error when cleanup also fails.                                                                  | `src/supervisorConnection.ts:289-299`                                | Throw `AggregateError`.                                                              |
| P3-TST-14 | Fallback redaction removes "Bearer" but keeps the token (`Authorization: [REDACTED] fdg1...`); `protocol.test.ts:126` locks in this behavior. | `src/reporting/protocol.ts:298-304`                                  | Include `(?:Bearer\|Basic\|Token)\s+` in the prefix, keeping the pattern linear.     |
| P3-TST-15 | Failures over the 1 MiB IPC limit are dropped instead of clipped, so the real error is lost.                                                  | `src/reporting/transport.ts:244`; `src/wdio/reporter.ts:40-49, 134`  | Clip the message, stack and causes, with a marker.                                   |
| P3-TST-16 | Error chains deeper than 20 are stored but later rejected, which makes the run `report-invalid`.                                              | `src/reporting/protocol.ts:281-296, 322`                             | Cap the depth in `serializeReportError`.                                             |
| P3-TST-17 | Run-query reads on Windows have no `O_NOFOLLOW`, leaving a gap between `lstat` and `open`.                                                    | `src/reporting/runQueries.ts:393`                                    | Compare `fstat` with `lstat`, or document the limitation.                            |
| P3-TST-18 | Secrets registered in a delegated process aren't applied to WDIO worker events at the parent.                                                 | `src/reporting/session.ts:86-87, 116`                                | Forward secrets to the parent, or sanitize in the workers.                           |
| P3-TST-19 | The run-query secret set grows without bound and is re-sorted on every query.                                                                 | `src/reporting/runQueries.ts:175-186`                                | Remove the token on `revokeGrant`.                                                   |
| P3-TST-20 | `timeoutMs` is ignored for mocha and cucumber suites.                                                                                         | `src/wdio/configuration.ts:105`                                      | Map it to each framework's options, or reject it.                                    |

### desktop-mcp

| ID       | Issue                                                                                                                                   | Location                                              | Suggestion                                                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| P3-MCP-1 | There is no SIGHUP handler; failed cleanup still exits with code 0; nothing is written to stderr when `desktop_workload` can't connect. | `src/cli.ts:43-50`; `src/workloadController.ts:22-27` | Handle SIGHUP, set `exitCode = 1` when cleanup fails, and log the fixed diagnostic.                                                            |
| P3-MCP-2 | The 12-line README is too thin for an npm page: no MCP client registration example, prerequisites or tool list.                         | `README.md`                                           | Add a registration snippet using `npx -p @fluentui-react-native/desktop-mcp desktop-mcp` (a bare `npx desktop-mcp` resolves an unscoped name). |

## Documentation drift

The following documentation contradicts the code at `2fa16ddb8`. Each item names the document location, then the code
that contradicts it.

**desktop-driver**

- `references/getting-started.md:41-44` says the package is not published and should be declared with `workspace:*`.
  It is on npm at 0.5.3.
- `references/native-helpers.md` makes four claims the code doesn't match:
  - **Runtime:** an answer sent twice fails the transport. `NativeHostProcess.ts:349` ignores it.
  - **Immutable cache model:** waiters reclaim a stale lock. `filesystem.ts:258-262` also requires the same host and a
    dead PID.
  - **Configuration:** environment variables apply unless a CLI option is explicit. The CLI defaults make every option
    explicit (P2-5).
  - Input recovery is bounded to 5 s. That holds only while the helper honors SIGTERM.
- `references/protocol.md` makes three claims the code doesn't match:
  - CSS values and shadow roots return `unsupported operation`; they return `unknown command`.
  - `unauthorized` always has a constant message; it doesn't.
  - W3C capability matching is complete; `timeouts` is ignored.
- `references/service.md` makes three claims the code doesn't match:
  - `revokeAndDrain` confirms that sessions closed. It doesn't after `close()` has begun.
  - Shutdown stops accepting requests and then cleans up. Cleanup waits for every socket first (P2-4).
  - The `readConnectionDescriptor(storage, name, verifyService)` signature omits the `binding` and `addSecret`
    parameters added in #4510.
- `README.md:158` says `/authority` holds macOS storage. It also exports Windows storage, the service verifiers and
  both application probes.
- `references/operations.md` makes four claims the code doesn't match:
  - **Line 126:** invisible characters are escaped. P3-DRV-19 lists those that are not.
  - **Lines 169-171:** the delta base must match the native walk limits. `scopeKey` omits `deadlineMs`.
  - **Lines 285-288:** provider messages are not passed on. P2-13 shows they are.
  - **Lines 322-325:** an `indeterminate` failure quarantines the target. `act.ts:334-346` doesn't.
- `references/service.md:290` describes `./agent` as bounded. `DesktopAgent.describe`, `find` and `check` are
  unbounded.
- `references/remaining-work.md:297` still says `desktop-driver-mcp` implements the tools, and `:168` says the timeout
  wrapper can return before aborted work settles; it now waits.
- `references/test-integration.md:254-255` says glob matching is linear. The comment at `StoryTestRunner.ts:573-575`
  says it is O(value × pattern). The `ArtifactManager` `redact` option is undocumented and can't be reached from
  `DesktopWebdriverRunOptions`.
- `references/current-status.md:72` says macOS physical input refuses an obscured target (see P1-7).
- `native/macos/README.md` makes five claims the code doesn't match:
  - **Line 103:** the fixture's minimum is "matching the helper" at 11.0. The helper targets 14.0.
  - **Lines 574-582:** minimized windows and empty crops fail with `capture-failed`. The code returns
    `unsupported-operation`.
  - **Line 290:** a closed window ID is never revived by title. P3-MAC-2 shows that it can be.
  - **Line 357:** an unreadable state is never a definite answer. P2-21 shows otherwise.
  - **Line 264:** `launchTimeoutMs` is one bound. The helper applies it per phase.
- `native/windows/README.md` makes three claims the code doesn't match:
  - **Line 560:** `DoDefaultAction` is a counted mutation. The code never calls it.
  - **Line 215:** `sendKeys` always uses Unicode packets. Special keys are sent as virtual keys.
  - **Lines 503-505:** only an unimplemented pattern moves on to the next. `E_FAIL` also does (P3-WIN-1).
- `native/PROTOCOL.md` makes two claims the code doesn't match:
  - The list of Windows ownership `reason` values is incomplete. Missing are `identity-user-mismatch`,
    `application-lock-unavailable`, `application-preexisting`, `no-matching-application`, `application-window-missing`,
    `application-recovery-unsettled` and `application-exited`.
  - Malformed input fails the transport. The Windows helper ignores binary frames and unknown message types.

**desktop-test**

- `README.md:83`, `references/lifecycle.md:250` and `current-status.md` advertise reconciling a Windows survivor. That
  path can't be reached (P2-23).
- `references/lifecycle.md:141` says late resources are disposed (see P2-25).
- `lifecycle.md:52-54` says a readiness receipt names the same process. The producer PID is self-reported.
- `references/lifecycle.md:134-136` and `commands.md:58-61` describe inspecting a stale lock by hand but give no
  procedure. `commands.md:58-60` also leaves out the descriptors left behind after a third interrupt.
- `references/commands.md:52-57`, `lifecycle.md:96-97` and `reporting.md:157-159` say an interrupted suite is recorded
  as `incomplete` (see P2-27). `commands.md:59` says a second interrupt force-kills managed runs (see P3-TST-10).
- `references/reporting.md` makes three claims the code doesn't match:
  - **Lines 149-151:** summary record IDs are never clipped and carry `truncated: true`. `results.ts:191-226` clips
    them at 96 bytes and has no such field.
  - **Lines 106-110 and 152-153:** a full backlog stops console output, and failed results are never suppressed.
    `collector.ts:542` drops individual items.
  - **Lines 53-55:** a spec that fails to import is reported as passed. This is probably stale with Jasmine 6.3.
- `references/management.md:61-62` says no application text or paths reach the model (see P2-30). It also says new
  connections fail with `capacity`, which `desktop-mcp` reports as `service-unavailable`.
- `references/configuration.md:61` says `timeoutMs` bounds each test; that is true only for Jasmine.
- `CHANGELOG.md:14` and the changesets still present `claimDesktopWorkload` as API (see P1-1).

**desktop-mcp**

- `references/connection.md:136-157` doesn't say that the adapter must be restarted after `serve` restarts (see P2-28).
- `references/tools.md` (`desktop_workload`) doesn't tell the model to close or relinquish its session before `run`.
  The adapter refuses such runs, as recorded in `current-status.md`.

## Test gaps

**desktop-driver**

- **Shutdown and connections:**
  - `close()` with an open keep-alive connection or a partial request
  - the body size limits (`maxBodyBytes` and the 64 KiB operations limit)
  - a client disconnecting during `POST /session` or a runner handoff
- **Journal and recovery:** a journal publish that lands after its deadline, and `recoverTarget` with an invalid
  `evidence` value.
- **WebdriverIO adapter:**
  - a click that fails is sent exactly once (P1-2)
  - the lane verdict for an attached session without `furn:inputMode`
- **Runner:** two `setArgs` steps, an unknown action, empty `steps`, and `unauthorized` partway through a run.
- **Protocol:** the `timeouts` capability, later `firstMatch` entries, and pointer, wheel and `none` action validation
  (`protocol/actions.test.ts` covers only key code points).
- **Operations:**
  - `perform` with a name containing spaces
  - `observeDelta` when the cache is full
  - prose in `reason` filtering
  - variation selectors in `neutralizeText`
  - cancelling a `sequence` partway through
- **Native resolution and the CLI:**
  - environment variable precedence, and empty `FURN_DESKTOP_DRIVER_*` values
  - an EMFILE spawn failure
  - a duplicate or late helper `response`
  - stale locks after a hostname change or PID reuse
  - `nativeCache.test.ts` skips every cache test on win32
- **Windows helper:**
  - the real `windows` command with an uninitialized `Automation`
  - capture after the device is removed
  - `sendKeys` with `\uE000` or `\uE009a\uE000`
  - `E_FAIL` pattern fallthrough
  - a `CreateProcessW` failure
- **macOS helper:**
  - out-of-range wheel and coordinate values
  - origins whose geometry can't be read
  - SIGTERM during `activate`, `closeWindow`, wheel or `clear`, followed by recovery
  - `record` and `diagnostic` running concurrently
  - a launch cancelled while queued

**desktop-test**

- Feeding a claim written by the real supervisor into `recoverWindowsDesktopWorkloadClaim`. Today's test uses a
  synthetic `id: 'webdriver'`.
- An owned acquisition that outlives the drain and then resolves.
- The signal reaching a supervisor-owned launch.
- Claim creation failures (ENOSPC, EACCES, a partial file), the growth bound, and Windows unlink retries.
- Interrupting a WDIO suite; only `prep` is covered today.
- Events over 1 MiB, error chains deeper than 20, and a credential after an auth scheme in redaction.
- A portable test of generic `serve --agent` publication. It runs today only with `mock-management-loader`.
- **Packaging:**
  - an install test of the packed tarballs (the `neutral-boundary` loader redirects to workspace entry points, so the
    P0-1 class of failure can't be caught)
  - `standalone-consumer.mjs` leaves out `./runner-connection`

**desktop-mcp**

- The CLI shutdown path from stdin end or SIGTERM to `DELETE /connection` and process exit.
- `WorkloadController` error mapping for `busy`, `conflict`, `stale-cursor` and `capacity`.
- A supervisor restart or replacement while the adapter is connected.
- The 32-principal limit.

## Validation status

| Check                                                                                                     | Result                                                                                                              |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Clean `npm install @fluentui-react-native/desktop-mcp@0.1.0` plus `import()` (Node 24.18, temp directory) | Failed: `ERR_PACKAGE_PATH_NOT_EXPORTED` (P0-1)                                                                      |
| `require('@fluentui-react-native/desktop-driver/client')` from the same install                           | Failed: `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`; `import()` passed (P2-1)                                     |
| Published tarball inventory (`npm pack` of driver 0.5.3, test 0.3.0, mcp 0.1.0)                           | 1,118, 402 and 45 files; tests shipped in the first two (P3-PKG-1)                                                  |
| Export-name comparison, `49216e359` against `HEAD` (source-level script)                                  | `desktop-test` removals found (P1-1); `desktop-driver` additive only                                                |
| WebdriverIO 10.1 retry logic (installed `webdriver/build/node.js`)                                        | Confirmed the default of 3 retries and the exclusion list (P1-2)                                                    |
| Node `server.close()` with an in-flight keep-alive request (standalone script)                            | `close()` not complete after 4 s; 26 keep-alive responses (P2-4)                                                    |
| `gh pr checks 4509`                                                                                       | 19 checks passed; "Check for Changesets" skipped                                                                    |
| Package `format`, `lint`, `build`, `test`; `yarn lage buildci`                                            | Not run (read-only review)                                                                                          |
| Native helper builds, self-tests, endpoint qualification                                                  | Not run. The Windows C++ was reviewed statically on macOS and not compiled; JS tests don't qualify native behavior. |

## Method

Nine reviewers each read one part of the packages in full, along with its tests and owning references, against the
package `AGENTS.md` invariants and the repository rules (R-REPO-001, R-SCAN-001, R-SCAN-002). The packaging, public
API and release-mechanics review was done separately against the npm registry and #4509. The P0 finding, all seven P1
findings, and P2-1, P2-2, P2-4, P2-5 and P2-23 were then checked by hand against the code, the registry or a
standalone experiment.

| Area                                                                         | Main files                                                                                                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| desktop-driver W3C server and authority                                      | `src/server/*`, `src/authority/*`                                                                                                                      |
| desktop-driver agent operations                                              | `src/operations/*`, `src/agent/*`                                                                                                                      |
| desktop-driver native resolution, host process, CLI, entry points            | `src/native/**`, `src/hosts/native/*`, `src/host/types.ts`, `src/cli/*`, `src/index.ts`, `src/storybook.ts`                                            |
| desktop-driver protocol, client, WDIO, authoring, runner, artifacts, testing | `src/protocol/*`, `src/client/*`, `src/wdio/*`, `src/authoring/*`, `src/runner/*`, `src/artifacts/*`, `src/testing/*`, `src/hosts/fake/*`              |
| macOS Swift helper                                                           | `native/macos/**`, `native/PROTOCOL.md`, `native/protocol.json`                                                                                        |
| Windows C++ helper                                                           | `native/windows/**`                                                                                                                                    |
| desktop-test lifecycle and ownership                                         | `ownership`, `applicationOwnership`, `processControl`, `services`, `driverService`, `hostedDriver`, `managedHost`, `runContext`, `config/*.mjs`/`.cjs` |
| desktop-test supervisor, control, CLI, config, and desktop-mcp               | `supervisor`, `supervisorConnection`, `control`, `cli`, `commands`, `config`, `integration`, all of `desktop-mcp`                                      |
| desktop-test reporting, WDIO, Jasmine                                        | `src/reporting/*`, `src/wdio/*`, `src/jasmine/*`                                                                                                       |
