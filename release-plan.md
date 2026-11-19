# Desktop packages release plan

This plan gets `desktop-driver`, `desktop-test` and `desktop-mcp` ready to release through the Version Packages PR
#4509. It is based on [release-review.md](./release-review.md), the desktop driver program issue #4435, and the open
issues under #4275.

- **Branch:** `user/jasonvmo/driver-release` (shared by the macOS and Windows machines).
- **macOS lane:** this file. It owns shared TypeScript, Swift, packaging, changesets, CI, documentation and the macOS
  qualification.
- **Windows lane:** [release-plan-windows.md](./release-plan-windows.md). It owns the Windows C++ helper, the Windows
  ownership code, and the Windows and Win32 qualification.
- **Review IDs** (P0-1, P1-3, P2-23, P3-WIN-5 and so on) refer to findings in `release-review.md`. Line numbers in the
  review were recorded at `2fa16ddb8`. Confirm each location before editing.

## 1. What this release is

The release is a **0.x preview** with known limitations, not the production release gated by #4345.

| Package                                          | npm today            | #4509 today  | Target after this plan                   |
| ------------------------------------------------ | -------------------- | ------------ | ---------------------------------------- |
| `@fluentui-react-native/desktop-driver`          | 0.5.3                | 0.5.4        | 0.5.4 (patch; changes are additive)      |
| `@fluentui-react-native/desktop-test`            | 0.3.0                | 0.3.1        | **0.4.0** (minor; breaking, P1-1)        |
| `@fluentui-react-native/desktop-mcp`             | 0.1.0 (broken, P0-1) | 0.1.1        | 0.1.1 (fixes the broken 0.1.0)           |
| `@fluentui-react-native/desktop-driver-mcp`      | 0.1.4                | 0.1.5        | 0.1.5 (dependent bump)                   |
| `storybook-desktop`, `storybook-desktop-runtime` | 0.4.6, 0.3.8         | 0.4.7, 0.3.9 | Dependent bumps; qualified through smoke |

**In scope:**

- Every P0 and P1 finding (R0, section 4).
- The P2 and P3 findings that are cheap, affect consumers directly, or break a documented invariant or a repository
  rule (R1, section 5).
- The documentation drift listed in the review (section 6).
- Changeset and changelog corrections (section 7).
- Qualification on macOS, Windows and Win32 at one candidate commit (section 9).

**Out of scope** (these stay with their tracking issues; see section 8):

- #4345, the production gate: 100 runs over 14 days, the TCC matrix, signing and notarization.
- #4348 (DPI and capture), #4349 (required CI and flake budget), and #4451 (the support matrix).
- The full #4441 native qualification checklist. This release runs the subset in section 9 and records the rest as
  not run.

The README and `current-status.md` of each package must say that the packages are a preview, are ESM-only (P2-1),
and list the known limitations that remain.

## 2. Sequence

1. **Phase 0, setup (macOS, before any edits).**
   - Fast-forward the branch to `origin/main`. The branch tip `2fa16ddb8` is an ancestor of `origin/main`
     `1352fe041` (#4508), so this needs no force-push:
     `git fetch origin && git merge --ff-only origin/main && git push`.
   - Commit and push the two plan files (and the review, if the owner decides to publish it; see section 3).
   - Open a **draft** PR from the branch to `main`, so hosted CI runs on every push.
   - Tell the Windows machine to start (section 3).
2. **Phase 1, R0 fixes.** Both lanes work in parallel. The macOS lane lands the shared TypeScript changes that the
   Windows lane must verify (P1-2, P1-4 validation, P1-5 recovery) first, and posts their commit SHAs in section 11.
3. **Phase 2, R1 fixes and the documentation pass.** Both lanes in parallel. Anything that outgrows its time box is
   documented as a known limitation and moved to R2.
4. **Phase 3, candidate and qualification.**
   - The macOS lane merges `origin/main` into the branch if `main` has moved (a merge commit, never a rebase),
     waits for both lanes to report "R0 and R1 done", and declares a **candidate SHA** in section 11.
   - Both machines run their qualification at that SHA.
   - A fix found during qualification produces a new candidate. Rerun only the gates whose inputs changed, and say
     which gates were carried forward and why.
5. **Phase 4, merge the fix PR.**
   - Remove `release-plan.md`, `release-plan-windows.md` and `release-review.md` from the branch. First move the
     deferred items into follow-up issues (section 8).
   - Mark the PR ready, get review, and merge it once all required checks pass.
   - Merging publishes nothing new. The package versions don't change until #4509 merges.
6. **Phase 5, verify the automatically regenerated #4509.**
   - The changesets bot regenerates #4509 after the fix PR merges; do not edit or recreate it. Check its versions against section 1, check every
     desktop changelog entry against section 7, and confirm the packed-tarball install smoke (R1-PKG-2) passed on it.
   - Then merge #4509. Until then, **do not merge #4509**. Add a PR comment that links this plan's outcome.
7. **Phase 6, after publishing.** Run the npm smoke (Q11) on macOS and Windows, deprecate `desktop-mcp@0.1.0`, and
   decide whether to deprecate `desktop-driver-mcp`.

## 3. Coordination between the two machines

**Git rules (both machines):**

- Work only on `user/jasonvmo/driver-release`. Never force-push, never amend a pushed commit, and never rebase
  shared history. Use `git pull --rebase` only for your own local commits that are not pushed yet.
- Make small commits that touch only files your lane owns. Push after each finished item, so the other lane picks it
  up early.
- Only the macOS lane merges `origin/main` into the branch.
- If a pull brings a conflict in a file the other lane owns, keep the other lane's version and redo your change on
  top. If that isn't possible, stop and ask through the mailbox.
- Each lane adds **new** changeset files for its fixes (unique names, for example
  `.changeset/windows-helper-release-fixes.md`). Only the macOS lane edits the existing changeset files.

**File ownership:**

| Area                                                                                                                    | Owner                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `desktop-driver/native/windows/**`, including `native/windows/README.md`                                                | Windows                                                                                 |
| `desktop-test/src/ownership.ts`, `src/windowsOwnership.test.ts`, `src/signals.ts`                                       | Windows                                                                                 |
| `desktop-driver/src/native/nativeDriver.ts` lines for P3-DRV-11, and the win32 gate in `src/native/nativeCache.test.ts` | Windows, **after** the macOS lane pushes P2-6 and P3-DRV-10, which touch the same files |
| Windows and Win32 sections of the `current-status.md` files (driver, test, storybook-desktop)                           | Windows                                                                                 |
| `release-plan-windows.md`                                                                                               | Windows                                                                                 |
| Everything else in the three packages, `desktop-driver/native/macos/**`, `native/PROTOCOL.md`, `native/protocol.json`   | macOS                                                                                   |
| `.changeset/*` (existing files), `.github/workflows/pr.yml`, `scripts/**`, `package.json` files                         | macOS                                                                                   |
| `release-plan.md`                                                                                                       | macOS                                                                                   |

If the Windows lane needs a change in a macOS-owned file (for example, a Windows reason in `native/PROTOCOL.md`), it
sends the exact change through the mailbox, and the macOS lane applies it.

**Status and messages:**

- Each lane records progress only in its own file: section 11 here, and the status section of
  `release-plan-windows.md`. Record the item ID, the commit SHA and the result.
- For questions and handoffs, use the macOS↔Windows mailbox in the workflow repository:
  `workstreams/engineering/react-native/fluent/agentic-authoring/infrastructure-readiness/desktop-test-driver/handoff/`.
  Follow its `PROTOCOL.md`: one file per message, named `YYYYMMDDTHHMMSSZ-<from>-to-<to>-<slug>.md`.
- **Decision for the owner before Phase 0:** pushing `release-review.md` and these plans makes the crash and
  denial-of-service findings public on a public repository. If they should stay private, keep the review out of the
  branch and share it through the workflow repository instead; the plans then cite review IDs only. In that case,
  replace the `release-review.md` links in both plan files with plain text before pushing, because
  `yarn lage test-links` checks top-level Markdown links.

**Repository rules that apply to every change:**

- No barrel exports (R-REPO-001). A changeset for every published package changed (R-REPO-003).
- Regular expressions stay linear-time, and no values are spliced into code that runs, tests included (R-SCAN-001,
  R-SCAN-002).
- Every Swift or C++ change follows the
  [native component skill](.github/skills/implement-native-component/SKILL.md) and the driver's
  [contributing guide](packages/agentic/desktop-driver/references/contributing.md): update `native/protocol.json` and
  `native/PROTOCOL.md` together, and add a native self-test for each behavior change.
- Follow the package `AGENTS.md` invariants, including: displayed text never enters an error message, and unsupported
  is never reported as `false`.
- Report every check as passed, failed, skipped, not run or unsupported. JavaScript tests do not qualify native
  behavior, and a hosted skip is not a pass.

## 4. R0: fix before merging #4509

Every item here must be fixed, or, where an item allows it, explicitly accepted and documented, before #4509 merges.
Each fix needs the tests listed with it. The lane column says who does the work.

### R0-1. Make `desktop-test` a minor release with migration notes (P1-1). macOS lane

- Change `.changeset/desktop-workload-authority.md` so `@fluentui-react-native/desktop-test` is `minor` (0.4.0).
  `desktop-driver` stays `patch`, because its changes are additive.
- Write the migration notes in that changeset, so they land in the 0.4.0 changelog:
  - `claimDesktopWorkload` was removed from the root export.
  - `DesktopIntegration.run`, `resources` and `supportsAgent` were replaced by `contribute(request)`, which returns
    `{ resources, driver, workload, managedWorkload, attachedWorkload }`. Configuration validation now rejects the
    old fields with "Unknown integration field", and `serve` with an integration needs a hosted-driver contribution.
  - `DesktopSupervisorOptions.integration.resources` is no longer read; resources come from `integrationPlan`.
  - `registerDesktopProcessDisposal` now returns `Promise<() => void>`.
  - `DesktopSupervisor.runner` is now the `DesktopCommandRunner` interface, with optional `close` and `terminate`.
- Remove any pending changeset text that presents `claimDesktopWorkload` as API. Leave the published 0.3.0 entry in
  `desktop-test/CHANGELOG.md:14` alone; the 0.4.0 migration note supersedes it.
- **Check:** `yarn change:check` passes. The version preview in section 7 shows `desktop-test` 0.4.0, and
  `storybook-desktop`, `desktop-mcp` and `desktop-driver-mcp` take dependent bumps that pin 0.4.0.

### R0-2. Correct the changelog text (P3-PKG-6). macOS lane

See section 7. #4509's text is regenerated on every push to `main`, so fix the source changesets on this branch, not
the #4509 description.

### R0-3. Turn off WebdriverIO's automatic retries in `connectDesktopWebdriver` (P1-2). macOS lane

- **Change** `desktop-driver/src/wdio/DesktopWebdriver.ts`: pass `connectionRetryCount: 0` and a
  `connectionRetryTimeout` longer than the target's launch deadline to `remote()` in `connectDesktopWebdriver`, and set
  both explicitly in `attachDesktopWebdriver`. Follow `desktop-test/src/wdio/configuration.ts:100-101`, which already
  uses `connectionRetryCount: 0` and `min(launchTimeoutMs + 15000, 2^31 - 1)`.
- This also covers `src/agent/DesktopAgent.ts`, the `desktop-driver` CLI, and
  `storybook-desktop/src/testing/runWdioTests.ts`, which all call the function.
- **Tests:**
  - A contract test in which the driver fails a click with `timeout` or `unknown error`. Assert that the request is
    sent exactly once and that the caller sees the original error and its `data.mutation`.
  - The same for a `POST /session` launch that hits its deadline: one launch only.
- **Windows lane:** confirms the change on Windows Fabric and Win32 smoke (section 9).

### R0-4. Initialize UI Automation before `HasWindowContent` (P1-3). Windows lane

Windows C++ only; see [release-plan-windows.md](./release-plan-windows.md) item W-R0-1. It must include a self-test
that runs the real `windows` command against an untitled `WS_EX_TOOLWINDOW` or `WS_POPUP` window that the
application owns, without the injected `hasContent` fake.

### R0-5. Reject out-of-range pointer and wheel values (P1-4). macOS lane, with a Windows part

- **Node, macOS lane:** in `desktop-driver/src/protocol/actions.ts` (`validateAction`, around lines 120-137), reject
  values of `x`, `y`, `deltaX` and `deltaY` that are not finite or are outside one shared limit, with
  `invalid argument`. Use the signed 32-bit range unless a smaller device limit is justified. Note that
  `JSON.parse('1e309')` produces `Infinity`, so non-finite values do reach validation.
- **Swift, macOS lane:** in `native/macos/Sources/DesktopDriverHost/Input.swift:181-182`, clamp the `Double` before
  converting it to an integer. Do the same anywhere else a protocol `Double` becomes `Int` (search for `Int(` on
  pointer, wheel and duration values).
- **C++, Windows lane:** `native/windows/src/input.cpp:433-438` casts `-RoundToPixel(deltaY)` to `int` and then to
  `DWORD`. `RoundToPixel` (`geometry.cpp:20-25`) maps non-finite values to 0 but returns `std::llround` as `long`
  without a range check, which is undefined for large values. Clamp before converting (item W-R0-2).
- The helpers must clamp on their own even though Node validates first, because the helper protocol is also reached
  directly (self-tests, `--release-input`, future clients).
- **Tests:**
  - `src/protocol/actions.test.ts`: pointer and wheel cases for `Infinity`, `-Infinity`, values just inside and just
    outside the limit, and a `none` action. Today it covers only key code points.
  - A macOS self-test that sends a wheel delta of `1e300` straight to the helper and expects a clamped, successful
    scroll or `invalid-params`, but never a crash.
- If the protocol schema gains an explicit bound, update `native/protocol.json` and `native/PROTOCOL.md` together.

### R0-6. Always run input recovery after an unexpected helper exit (P1-5). macOS lane, with a Windows part

- **Node, macOS lane:** `desktop-driver/src/hosts/native/NativeDesktopHost.ts`, `recoverInput()` (around line 499)
  returns early when both `potentialKeys` and `potentialButtons` are empty. Remove that early return so that
  `--release-input` runs after **every** unexpected helper exit, including an empty pressed-input record. Keep the
  existing 5 s bound and SIGTERM handling.
- **Constraint, both helpers:** a non-zero exit from `--release-input` rejects with `input-recovery-failed`, so the
  change makes recovery visible in cases that were silent before. An empty-record recovery must succeed as a no-op
  when physical input is unavailable (hosted runners, the masked lane, macOS without Accessibility permission) and
  when a **live** helper holds the lock. It must never wait for a live holder.
- **Swift, macOS lane:** confirm that `--release-input` with an empty record adopts and deletes a dead owner record
  (`InputLock.swift:88-118`) and meets the constraint above, and add a self-test that proves it. Improve the
  `input-busy` message so it names the owner PID and the recovery command.
- **Windows, Windows lane (W-R0-3):** the Windows lock is a named mutex. After an abandoned mutex, the next acquirer
  fails `input-busy` once and the mutex is then healthy. `ReleaseInputFromLedger()` in `native/windows/src/main.cpp`
  deliberately doesn't take the mutex for an empty ledger, so the Node change is harmless on Windows but doesn't clear
  the one spurious failure. The Windows lane verifies the Node change on Windows and adds parity with a zero-timeout
  try: adopt and release an abandoned mutex, release one it got normally, and do nothing when a live helper holds it.
- **Tests:**
  - Node: a unit test in which the fake helper exits unexpectedly with an empty pressed-input record, and
    `--release-input` still runs.
  - Native, both platforms: kill the helper with SIGKILL (Windows: `TerminateProcess`) while it holds the lock during
    `activate` or a wheel-only action. The next helper acquires physical input without manual recovery.

### R0-7. Refuse pointer actions when the origin's geometry can't be read (P1-6). macOS lane

- **Change** `native/macos/Sources/DesktopDriverHost/Driver.swift` (`resolveActionPoint`, around lines 729-752),
  `Accessibility.swift` (`readSnapshot`, around line 692) and `Application.swift` (`currentFrame()`, around lines
  82-95):
  - For element and viewport origins, require readable geometry with a positive area.
  - Otherwise fail with `move target out of bounds` and effect `none`. Never fall back to `.zero` or to an earlier
    frame for a pointer target.
- **Test:** self-tests for an element whose frame can't be read and for a viewport with no readable frame. Both are
  refused with effect `none`, and no event is posted.
- **Windows lane (W-AUDIT-1):** check that the Windows helper's pointer origin resolution has no zero-rectangle
  fallback, and report the result. Fix it only if it has the same defect.

### R0-8. Add a target-ownership guard to macOS `performActions` (P1-7). macOS lane

- **Preferred:** in `Driver.swift:229-235, 658-728`, match the Windows helper
  (`native/windows/README.md:357-361, 377-378`):
  - Before `pointerDown` or a scroll, hit-test the resolved point and require that the window under it belongs to a
    leased process.
  - Before key events, require that a leased application is frontmost, or activate it first as Windows does.
  - Otherwise refuse with effect `none`, and document the new refusal in `native/PROTOCOL.md`,
    `native/protocol.json` and `native/macos/README.md`.
- **Time box:** one working day. If the guard doesn't fit, take the fallback and move the guard to R2 under #4441.
- **Fallback:** correct `desktop-driver/references/current-status.md` (around line 70, "macOS physical input"): the
  element click refuses an obscured target, but raw `performActions` has no ownership guard. Add the limitation to
  the README's known limitations.
- **Tests (preferred path):** native self-tests for a `pointerDown` over a window the helper doesn't own and for keys
  while another application is frontmost; both refused or activated as documented. Then the macOS physical smoke in
  section 9 must still pass, because the guard can refuse legitimate actions if it is wrong.

### R0-9. Make the publish run independent of the known `boundedCommand` flake (P2-10). macOS lane

- The ADO publish build runs `yarn lage buildci`, including every test, on **Linux** before it packs. A flaky test can
  block the publish of #4509.
- **Change** `desktop-driver/src/native/boundedCommand.test.ts:20-34` ("terminates a process that ignores the
  termination request"). Today SIGTERM can arrive before the child installs its handler, so the child exits with
  `SIGTERM` instead of `SIGKILL`. Make the child signal that its handler is installed (for example by printing
  `ready`), and make the assertion depend on that signal rather than on timing. Keep the child's code a fixed string;
  don't splice values into it (R-SCAN-002).
- **Check:** Q3 in section 9.

### R0-10. Release the broken `desktop-mcp@0.1.0` replacement safely (P0-1)

`desktop-mcp` 0.1.1 ships through #4509 with exact pins on `desktop-test` 0.4.0 and `desktop-driver` 0.5.4. Before
#4509 merges, the packed-tarball install smoke (Q5) must pass on macOS, Windows and Linux. After publishing, run the
npm smoke (Q11) and deprecate 0.1.0:

```sh
npm deprecate @fluentui-react-native/desktop-mcp@0.1.0 "Requires desktop-test exports that 0.3.0 does not provide; use >=0.1.1"
```

The deprecation needs an npm owner of the package; check with `npm owner ls @fluentui-react-native/desktop-mcp`.
The automated guard is R1-PKG-2.

## 5. R1: fix before release unless the time box runs out

These are cheap, affect consumers directly, or break a documented invariant or a repository rule. Fix them in this
release. If one grows beyond about half a day, stop, document it as a known limitation in the owning
`current-status.md`, and move it to R2 (section 8). Each fix needs a test that fails without it.

### Packaging and public API (macOS lane)

- **R1-PKG-1. Declare the Node range (P2-2).** Add the root range
  `"engines": { "node": "^22.19.0 || ^24.0.0 || >=26.0.0" }` to `desktop-driver`, `desktop-test`, `desktop-mcp` and
  `desktop-driver-mcp`. Add an early version check with a clear message to each `config/cli.cjs`. The packages use
  `fs.globSync`, `AbortSignal.any`, `--import` in `NODE_OPTIONS`, and `.mts` configuration loaded through type
  stripping.
- **R1-PKG-2. Add a packed-tarball install smoke to CI (P0-1 follow-up).**
  - In `.github/workflows/pr.yml`, job `publish-dry-run-pack` (ubuntu, part of the required `pr` aggregate), add a
    step after "Pack packages" that runs when `has-tarballs` is true.
  - The step installs the packed tarballs of the Node-only desktop packages (`desktop-driver`, `desktop-test`,
    `desktop-mcp`, `desktop-driver-mcp`) in an empty temporary directory, together with the registry versions of
    every dependency that isn't packed. It then imports every library `exports` subpath, resolves the managed
    service launcher without running it, and runs each `bin` with `--help`.
  - Implement it as a checked-in script (for example under `scripts/src/tasks/`) that reads the subpaths from each
    packed `package.json` at run time. Don't generate `node -e` strings from values (R-SCAN-002). Skip React Native
    packages, which can't be imported in Node.
  - `yarn lage pack` packs only versions that are not on npm, so the step does nothing on ordinary PRs and runs on
    Version Packages PRs such as #4509. Prove the script locally against the version preview from section 7 (Q5).
  - Process rule for later (R2): a new public package must not publish before its workspace dependencies' unreleased
    changes. Record it in `references/agents/repository/release.md` now.
- **R1-PKG-3. Stop shipping tests (P3-PKG-1, P3-PKG-2).**
  - Use negated `files` patterns, as `desktop-mcp` already does: `!src/**/*.test.ts` and `!lib/**/*.test.*` in
    `desktop-driver` and `desktop-test`.
  - Exclude the test-only sources compiled into `lib/` (`src/native/windows/win32FixtureSupport.ts`,
    `fakeAuthorityHelper.ts`) and other test-only fixtures, and decide whether `jest.config.cjs` and `tsconfig.json`
    belong in the tarball.
  - Keep everything under `native/` that a consumer needs to build the helpers from source, and the `src/` files that
    the `default` export condition points to.
  - `check-package-contents` (part of `buildci`) honors negated patterns. Check the result with `npm pack --dry-run`
    and with the helper source build in Q5.
- **R1-PKG-4. Fill in `"author"` in `desktop-driver/package.json` (P3-PKG-5),** matching the other packages.
- **R1-PKG-5. Document the integration subpaths (P2-3).**
  - In `desktop-test`, document `./control`, `./supervisor-connection`, `./managed-host` and `./runner-connection` as
    integration subpaths for first-party integrations (`storybook-desktop`, `desktop-mcp`) that may change in any
    release. They can't be removed, because those packages import them.
  - Document the new root exports `createDesktopRunContext`, `acquireHostedDesktopDriver`,
    `publishDesktopHostManagement`, `desktopHostReady` and `formatDesktopHostReady`, or mark them internal.
  - Add `./runner-connection` to `desktop-test/fixtures/neutral-boundary/standalone-consumer.mjs` and to the entry
    list that `src/packageBoundary.test.ts` checks.
- **R1-PKG-6. Document consumer prerequisites.** `desktop-test` resolves `@wdio/cli`, `@wdio/local-runner` and
  `@wdio/<framework>-framework` from the consumer at run time (P3-PKG-3). Say so in its README with an install
  command. Optional peer dependencies are R2. State that all three packages are ESM-only (P2-1).

### desktop-driver TypeScript (macOS lane)

- **R1-DRV-1. Don't let open sockets block shutdown cleanup (P2-4).** In
  `src/server/createDesktopDriverServer.ts`:
  - Release input and dispose hosts and sessions without waiting for `server.close()` to finish.
  - Send `Connection: close` while shutting down, call `closeIdleConnections()`, then `closeAllConnections()` after a
    short grace period, and set `headersTimeout` and `requestTimeout` as `desktop-test/src/supervisorConnection.ts`
    does.
  - Test: `close()` with an open keep-alive connection, and with a partial request, finishes within the bound and
    releases input.
- **R1-DRV-2. Let environment variables apply when no CLI option is given (P2-5).** In
  `src/cli/createDesktopDriverCommand.ts`, drop the commander defaults for the build policy and configuration, and
  state the defaults in the help text. Test with `FURN_DESKTOP_DRIVER_BUILD_POLICY` and
  `FURN_DESKTOP_DRIVER_CONFIGURATION` set.
- **R1-DRV-3. Treat empty `FURN_DESKTOP_DRIVER_*` values as unset (P2-6).** Fix `src/native/nativeDriver.ts:374` and
  `src/native/filesystem.ts:101`, and reject an explicit empty `cacheRoot`. Push this early: the Windows lane edits
  the same file for P3-DRV-11.
- **R1-DRV-4. Don't crash Node when `spawn` fails with EMFILE (P2-8).** Attach the `'error'` listener immediately after
  `spawn` and guard against missing stdio in `src/native/boundedCommand.ts`,
  `src/hosts/native/NativeHostProcess.ts`, `src/hosts/native/NativeDesktopHost.ts` and
  `src/cli/createDesktopDriverCommand.ts`, as `authorityHelper.ts` already does. Test with an injected spawn whose
  child has no stdout and emits `error`.
- **R1-DRV-5. Keep provider and displayed text out of error messages (P2-13).** Rebuild read-path error messages from
  fixed text per error code, as `providerFailure` does: `src/operations/envelope.ts`, `sampling.ts`, `check.ts`,
  `act.ts`, `story.ts` and `sequence.ts`. Change `executor.test.ts:79-91`, which expects a window title in the
  message.
- **R1-DRV-6. Make the story runner fail on bad plans (P2-14, P2-15).** In `src/runner/StoryTestRunner.ts`, validate
  each selected entry with `validateDesktopStoryTests`, add `default: throw` to `performAction`, fail an empty
  `steps`, and pass the selected story ID to the next `setArgs` instead of calling `getCurrentStory()`.
- **R1-DRV-7. Follow the code-scanning rules (P3-DRV-9, P3-DRV-10).** Make the `codesign` and `security` output
  regular expressions in `src/native/macos/buildMacOSDriver.ts:262, 343` linear-time. Stop splicing values into
  `node -e` and into the generated helper in `src/native/nativeDriver.test.ts:96-99` and
  `src/native/nativeCache.test.ts:24-44`; pass them through arguments, the environment, or fixed fixture files. Push
  this early: the Windows lane edits `nativeCache.test.ts` afterward.
- **R1-DRV-8. Cut the process count in macOS private-storage checks (P2-10, second half).**
  `src/authority/macosPrivateStorage.ts` spawns `/bin/ls -lde` once per ancestor directory. Check all paths with one
  call. This is a macOS CI flake, not a Linux publish risk.

### macOS helper (macOS lane)

- **R1-MAC-1. Remove the unsigned clock underflow (P2-20).** In `Support.swift:152-153` and
  `WindowEvents.swift:188-199, 225-236`, read the clock once or use saturating subtraction. It can crash the helper
  inside the input lock and cause P1-5.

### desktop-test (macOS lane)

- **R1-TST-1. Pass the scope signal to the supervisor-owned launch (P2-24).** Add `signal: options.signal` to the
  `createDesktopApplicationHost(...)` call in `src/supervisor.ts:251-264`, as Storybook does
  (`retainedApplication.ts:31-35`). Test that the signal reaches the launch.
- **R1-TST-2. Redact the credential after an auth scheme (P3-TST-14).** `src/reporting/protocol.ts:298-304` removes
  "Bearer" and keeps the token. Fix it and the expectation in `protocol.test.ts:126`.

### desktop-mcp (Windows lane for this R1 batch)

- **R1-MCP-1. Report capacity and exits accurately (P2-29, P3-MCP-1).**
  - Map `capacity` to its own reason in `WorkloadController` instead of `service-unavailable`, and add mapping tests
    for `busy`, `conflict`, `stale-cursor` and `capacity`.
  - In `src/cli.ts`, handle SIGHUP, exit non-zero when cleanup fails, and write a message to stderr when
    `desktop_workload` can't connect. This also reduces leaked management principals.
  - Test the shutdown path from stdin end or SIGTERM to `DELETE /connection` and process exit.
  - An idle lease for principals, and taking a principal only for `desktop_workload`, are R2.
- **R1-MCP-2. Say when the supervisor has restarted (P2-28).** Return a distinct reason when the supervisor instance
  that the adapter bound to is gone, and document in `references/connection.md` that the adapter must be restarted
  after `serve` restarts. Rebinding automatically is R2.
- **R1-MCP-3. Treat workload results as untrusted (P2-30).** At minimum, document in `desktop-test`
  `references/management.md` and `desktop-mcp` `references/tools.md` that result items and the `junit.xml` artifact
  can contain application text, stack traces and absolute paths, and correct the contrary claim at
  `management.md:61-62`. If it fits the time box, strip stacks from result items and replace the project and home
  roots with placeholders.
- **R1-MCP-4. Write a usable npm README (P3-MCP-2).** Cover prerequisites (Node range, a running
  `desktop-test serve --agent` or `desktop-driver` agent service), an MCP client registration example, the tool
  list, the "relinquish before `desktop_workload` run" rule, and links to the references.

### Windows lane

Detailed in [release-plan-windows.md](./release-plan-windows.md):

- **W-R1-1:** P2-23, Windows crash recovery rejects every real supervisor claim (`desktop-test/src/ownership.ts`).
- **W-R1-2:** P3-TST-2 and P3-TST-6, Windows claim-release retries and SIGBREAK.
- **W-R1-3:** P3-DRV-11, rename retries for antivirus `EPERM`, `EACCES` and `EBUSY`, and the win32 `nativeCache` tests.
- **W-R1-4:** P3-WIN-5, `SetErrorMode` and DLL search hardening (Control Flow Guard is optional).
- **W-R1-5:** P2-18, recover capture after the Direct3D device is lost (time boxed; otherwise a known limitation).
- **W-R1-6:** the stale `interactive.lock` contention message (P2-26), if it fits.

## 6. Documentation pass

Fix every documentation drift item in `release-review.md` ("Documentation drift"). Where the code was fixed above,
make the documentation match the fix. Where it wasn't, describe the actual behavior or record a known limitation.

| Document                                                                                                                                                            | Owner   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `desktop-driver`: `README.md`, `references/*.md` (getting-started, native-helpers, protocol, service, operations, remaining-work, test-integration, current-status) | macOS   |
| `desktop-driver/native/macos/README.md` (5 items) and `native/PROTOCOL.md` (2 items, including the Windows ownership `reason` values)                               | macOS   |
| `desktop-driver/native/windows/README.md` (3 items)                                                                                                                 | Windows |
| `desktop-test`: `README.md`, `references/{lifecycle,commands,reporting,management,configuration}.md`                                                                | macOS   |
| `desktop-mcp`: `README.md`, `references/{connection,tools}.md`                                                                                                      | macOS   |
| Windows and Win32 sections of each `current-status.md`                                                                                                              | Windows |

Also:

- `desktop-driver/references/getting-started.md:41-44` must say the package is published to npm, and show how to
  install it.
- Each README gets a short "Preview status" note: 0.x, ESM-only, supported platforms, and a link to the known
  limitations in `current-status.md`.
- The stale-lock procedures (`desktop-test` `lifecycle.md:134-136`, `commands.md:58-61`) must give the manual steps,
  including the descriptors left behind after a third interrupt.
- The Windows survivor reconciliation that `desktop-test` `README.md:83` and `lifecycle.md:250` describe becomes
  true with W-R1-1. If W-R1-1 is deferred, correct those lines instead.
- An interrupted WDIO suite is recorded as `failed` (P2-27) and a second interrupt doesn't reach managed runs
  (P3-TST-10). Correct `commands.md`, `lifecycle.md` and `reporting.md` unless they are fixed.
- Run `yarn lage test-links` after the pass.

## 7. Changesets and changelogs (macOS lane, R0-1 and R0-2)

`.changeset/config.json` uses the default `@changesets/cli/changelog`, so a changeset's text is copied into the
changelog of **every** package it lists. Shared changesets therefore put `desktop-test` features into the
`desktop-driver` changelog (P3-PKG-6).

1. **Split the shared changesets** so each desktop package gets text about its own change. Today these list more than
   one package:
   - `desktop-workload-authority.md`: `desktop-driver`, `desktop-test` (becomes `desktop-test` minor, R0-1).
   - `desktop-mcp-supervisor.md`: `desktop-mcp`, `desktop-driver-mcp`.
   - `status-topic-sections.md`: `desktop-driver`, `desktop-driver-mcp`, `desktop-test`, `storybook-desktop`.
   - `neutral-windows-smoke.md`, `owned-macos-storybook-smoke.md`, `quiet-lifelines-fence.md`:
     `desktop-test`, `storybook-desktop`.
   - `retained-windows-storybook.md`: `desktop-test`, `native-core`, `storybook-desktop`.
   - Leave the entries for non-desktop packages (`components`, `native-core`, `storybook-desktop-runtime`) with their
     current text unless it is wrong for them.
2. **Add a `desktop-mcp` entry that explains 0.1.1:** 0.1.0 was published before the `desktop-test` and
   `desktop-driver` versions it needs and cannot start; 0.1.1 pins `desktop-test` 0.4.0 and `desktop-driver` 0.5.4.
   The repeated "Updated dependencies" lines come from the changelog generator and can stay.
3. **Add changesets for this plan's fixes.** The macOS lane adds new files for its `desktop-driver`, `desktop-test`
   and `desktop-mcp` fixes. The Windows lane adds its own new files (section 3). Write user-facing text: what
   changed and what a consumer must do.
4. **Preview the result** at the candidate SHA, in a separate worktree so the main checkout isn't touched:

   ```sh
   git worktree add /tmp/furn-release-preview <candidate-sha>
   cd /tmp/furn-release-preview
   yarn install --immutable
   yarn change:check
   yarn changeset:version
   git --no-pager diff --stat
   ```

   Check every desktop `CHANGELOG.md` and `package.json` against section 1. Keep the worktree for Q5, then remove
   it with `git worktree remove --force /tmp/furn-release-preview`.

## 8. R2: deferred, with tracking

Before Phase 4 removes the plan files, file one follow-up issue per package under #4275. List the deferred review IDs
in each, link the evidence, and link the existing tracking issue where one applies. Any R1 item that ran out of time
moves here.

| Deferred items                                                                                                                                                                                                                                    | Tracking                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Native fidelity and fail-closed reporting: P2-17 (`sendKeys` modifiers and NULL key), P2-19, P2-21, P2-22, P3-MAC-1 to P3-MAC-10, P3-WIN-1 to P3-WIN-4 and P3-WIN-6, the native test gaps                                                         | #4441                                        |
| Capture: P2-18 (if not done in W-R1-5), P3-DRV-23                                                                                                                                                                                                 | #4348                                        |
| Production hardening: P2-7 (stale build lock), P3-DRV-12, P3-DRV-13, P3-DRV-16, P3-DRV-17, signing and notarization                                                                                                                               | #4345                                        |
| CI and flakes: required native CI, the flake budget, any remaining macOS slowness after R1-DRV-8                                                                                                                                                  | #4349                                        |
| Support matrix and consumer shape: P2-1 (a `node`/`require` export condition), P2-26 contention diagnostics and automatic reclaim, P3-PKG-3 (optional peer dependencies), P3-PKG-4 (`webdriverio` as an optional dependency), Node version matrix | #4451                                        |
| desktop-driver protocol and operations: P2-9, P2-11, P2-12, P2-16, P3-DRV-1 to P3-DRV-8, P3-DRV-14, P3-DRV-15, P3-DRV-18 to P3-DRV-22, P3-DRV-24 to P3-DRV-32                                                                                     | New `desktop-driver` follow-up               |
| desktop-test lifecycle and reporting: P2-25, P2-27, P3-TST-1, P3-TST-3 to P3-TST-5, P3-TST-7 to P3-TST-13, P3-TST-15 to P3-TST-20                                                                                                                 | New `desktop-test` follow-up                 |
| desktop-mcp: P2-28 automatic rebinding, P2-29 idle leases and per-tool principals, P2-30 stripping (if not done)                                                                                                                                  | New `desktop-mcp` follow-up                  |
| Release process: no new public package publishes ahead of its dependencies' unreleased changes (P0-1)                                                                                                                                             | `release.md` now, enforcement in a follow-up |

The known-limitations list in each `current-status.md` must name every deferred item that a consumer can hit.

## 9. Qualification

Run every gate at the candidate SHA (Phase 3), except Q1 and Q3, which also run while fixing. The procedures come from
`desktop-test/references/native-qualification.md` and `desktop-driver/references/contributing.md`; follow them for
anything not spelled out here.

**Rules:**

- Report each gate as passed, failed, skipped, not run or unsupported, with the platform, endpoint, SHA, input lane
  (physical, or accessible with physical input masked) and the command.
- Physical-input runs need a logged-in, unlocked console session with the required permissions, and must be
  serialized per desktop. If physical input isn't possible, rerun with
  `FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES=keyboard,physicalClick,wheel` and report both runs.
- Stop Metro and other services by PID only. After each app run, confirm that no app, helper, listener, descriptor
  or claim survives.
- JavaScript tests don't qualify native behavior, and a hosted skip is not a pass.

| Gate | What                                                                     | macOS                 | Windows / Win32               | Linux             |
| ---- | ------------------------------------------------------------------------ | --------------------- | ----------------------------- | ----------------- |
| Q1   | Package `format`, `lint`, `build`, `test` for changed packages           | macOS lane            | Windows lane                  | CI `js` job       |
| Q2   | `yarn clean-lage-cache` then `yarn lage buildci`; `yarn lage test-links` | macOS lane            | Windows lane                  | CI `js` job       |
| Q3   | `boundedCommand` flake stress                                            | macOS lane            | Windows lane                  | CI `js` job       |
| Q4   | Native helper build, `doctor` and self-tests                             | macOS lane            | Windows lane (both endpoints) | n/a               |
| Q5   | Packed-tarball install smoke, including a helper source build            | macOS lane            | Windows lane                  | R1-PKG-2 on #4509 |
| Q6   | Storybook smoke, stories and tests                                       | Fabric, Paper         | Windows Fabric, Win32 Paper   | n/a               |
| Q7   | Targeted native checks for R0 fixes                                      | macOS lane            | Windows lane                  | n/a               |
| Q8   | Generic attach-only MCP/WDIO handoff (`nativeRunner.contract`)           | macOS lane            | Windows lane (Win32 fixture)  | n/a               |
| Q9   | Descriptor-path MCP pass with the packed `desktop-mcp`                   | macOS lane            | Windows lane                  | n/a               |
| Q10  | Hosted PR checks on the candidate                                        | macOS lane reads them | —                             | —                 |
| Q11  | #4509 checks, then the npm smoke after publishing                        | macOS lane            | Windows lane                  | —                 |

The Windows commands are in [release-plan-windows.md](./release-plan-windows.md). The macOS commands follow.

### Q1 to Q3: repository checks

- **Q1:** in each changed package, `yarn format`, `yarn lint`, `yarn build` and `yarn test`. Use `yarn test <name>`
  while iterating.
- **Q2:** at the candidate, `yarn clean-lage-cache && yarn lage buildci`, then `yarn lage test-links`.
- **Q3:** in `packages/agentic/desktop-driver`, run the test 30 times while the machine is busy (for example during
  a parallel `yarn build`) and require 30 passes:

  ```sh
  for i in $(seq 30); do yarn test boundedCommand || break; done
  ```

### Q4: macOS native helper

```sh
yarn storybook build-driver --macos
yarn desktop-driver doctor --platform macos --permissions
cd packages/agentic/desktop-driver
FURN_NATIVE_DRIVER_TEST=1 FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="<identity>" yarn test --runInBand
```

The self-tests must include the new R0-5, R0-6, R0-7, R0-8 and R1-MAC-1 cases.

### Q5: packed-tarball install smoke

In the preview worktree from section 7 (after `yarn changeset:version`):

```sh
yarn build
yarn lage pack
mkdir -p /tmp/furn-consumer && cd /tmp/furn-consumer && npm init -y
npm install <worktree>/_packed/*/fluentui-react-native-desktop-{driver,test,mcp,driver-mcp}-*.tgz
```

Then, from `/tmp/furn-consumer`:

- Run the R1-PKG-2 smoke script: every `exports` subpath of the four packages imports, and each `bin` prints
  `--help`.
- Check that `npm ls` resolves `desktop-test` 0.4.0 and `desktop-driver` 0.5.4 from the tarballs, not from the
  registry.
- Build the helper from the shipped `native/` sources into an empty cache, then check it (`doctor` never builds):

  ```sh
  npx desktop-driver resolve-driver --platform macos --cache-root /tmp/furn-consumer-cache
  npx desktop-driver doctor --platform macos --cache-root /tmp/furn-consumer-cache
  ```

  Add `--macos-signing-identity "<identity>"` to both if unsigned builds are refused. Then repeat `resolve-driver`
  with `FURN_DESKTOP_DRIVER_CACHE_ROOT` and `FURN_DESKTOP_DRIVER_BUILD_POLICY=never` set and only `--platform`, to
  check R1-DRV-2 and R1-DRV-3 from the consumer's side.

- Record the tarball file counts and sizes, and confirm that no tests ship (R1-PKG-3).

Keep the tarballs; the Windows lane needs the same set (send them through the mailbox or rebuild them at the same
SHA).

### Q6: macOS Storybook smoke

```sh
# Fabric
yarn storybook bundle --macos
yarn storybook prep --macos
yarn storybook smoke --macos --mode stories-and-tests
# Paper
yarn storybook bundle --macos --paper
yarn storybook prep --macos --paper
yarn storybook smoke --macos --paper --mode stories-and-tests
```

Run each on the physical lane, or report the masked rerun as described above.

### Q7: macOS targeted checks for the R0 fixes

Through a real W3C session on a fixture or Storybook app:

- **P1-4:** a wheel action with `deltaY: 1e300` is refused with `invalid argument`, and the helper stays alive.
- **P1-5:** kill the helper with `kill -9 <pid>` during `activate` or a wheel-only action. A new session's physical
  input then works without running `--release-input` by hand.
- **P1-6:** covered by the self-test in Q4. Note any manual reproduction during a Fabric remount.
- **P1-7 (preferred path):** with another application's window over the target, a raw `pointerDown` is refused with
  effect `none`. With another application frontmost, a key action activates the leased application or is refused,
  as documented.
- **P1-2:** covered by the contract test. Also check the driver log for exactly one request per failed click in a
  deliberately failing story test.

### Q8: generic attach-only MCP/WDIO handoff

```sh
FURN_NATIVE_DRIVER_TEST=1 FURN_NATIVE_HANDOFF_APP_PATH=<FurnOwnershipFixture.app> \
  yarn workspace @fluentui-react-native/desktop-test test nativeRunner.contract --runInBand
```

### Q9: descriptor-path MCP pass with the packed `desktop-mcp`

1. Start a protected service: `yarn storybook driver --macos --agent` (or
   `yarn desktop-test --target macos serve --agent`).
2. Register `/tmp/furn-consumer/node_modules/.bin/desktop-mcp` from Q5 as an MCP server in an MCP client, so the
   tested binary is the one that will be published.
3. Follow the retained handoff sequence recorded in `storybook-desktop/references/current-status.md`: select a story
   (marker-verified) and observe; confirm an attached runner is refused while the session is held; relinquish; run
   one attached case; reopen and select; close; run one managed `desktop_workload` case.
4. Stop the service with Ctrl+C. Confirm a terminal lifecycle report and that no process, listener, descriptor or
   claim remains.
5. Also confirm the R1-MCP-1 and R1-MCP-2 behavior: restart `serve` while the adapter is connected and check for the
   distinct restart reason; close the client and check that the adapter exits and releases its principal.

### Q10: hosted checks

On the draft PR at the candidate, all required jobs pass: `js`, `macos`, `macos-storybook`, `macos-paper-storybook`,
`windows`, `windows-storybook`, `win32`, `win32-storybook`, `check-changesets`, `publish-dry-run-pack`, `test-links`
and the `pr` aggregate. Report the advisory `macos-storybook-physical` and `win32-storybook-physical` results
separately; a skip there is not a pass.

### Q11: #4509 and after publishing

- **Before merging #4509:** its versions match section 1, its desktop changelog text matches section 7, and its
  `publish-dry-run-pack` job ran the install smoke on the new tarballs and passed.
- **After publishing**, on macOS and on Windows, in an empty directory:

  ```sh
  npm init -y
  npm install @fluentui-react-native/desktop-mcp@0.1.1 @fluentui-react-native/desktop-test@0.4.0 @fluentui-react-native/desktop-driver@0.5.4
  npx desktop-mcp --help
  npx desktop-test --help
  npx desktop-driver --help
  ```

  Then run the R1-PKG-2 smoke script against the installed packages, deprecate `desktop-mcp@0.1.0` (R0-10), and
  decide whether to deprecate `desktop-driver-mcp` in favor of `desktop-mcp`.

## 10. Exit criteria

- [ ] R0-1 to R0-10 are done, each with its tests. P1-7 took the preferred path, or its limitation is documented.
- [ ] Each R1 item is done, or is documented as a known limitation and listed in section 8.
- [ ] The documentation pass is done, and `yarn lage test-links` passes.
- [ ] The version preview matches section 1, and each desktop changelog describes only its own package.
- [ ] Q1 to Q10 passed at the candidate on every platform in the table, or each exception is recorded with its reason
      and accepted by the owner.
- [ ] The follow-up issues are filed, and the plan and review files are removed from the branch.
- [ ] The fix PR is merged.
- [ ] #4509 is regenerated, passes its checks including the install smoke, and is merged.
- [ ] Q11 passed on macOS and Windows, `desktop-mcp@0.1.0` is deprecated, and the `desktop-driver-mcp` decision is
      recorded.
- [ ] #4435 and the workstream record the outcome, with links to the evidence.

## 11. macOS lane status

Owned by the macOS machine. Update after each item: status (not started, in progress, done, deferred, blocked), the
commit SHA, and a note.

**Candidate SHA:** not declared yet.

**Shared changes the Windows lane must verify:** post the SHAs here when pushed.

| Change                                                         | SHA         | Windows verified                                                                                                              |
| -------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| R0-3 (P1-2) retry options                                      | `6fb97096e` | WebdriverIO 12/12 passed; candidate Q6 smoke not run.                                                                         |
| R0-5 (P1-4) Node validation                                    | `22423f29d` | Windows parser and loopback W3C refusal checks passed at `9130fe983`; candidate Q7 pending.                                   |
| R0-6 (P1-5) Node recovery                                      | `9130fe983` | Windows lifecycle checks and native physical mutex fixture (5/5 ownership tests) passed; candidate helper-exit check pending. |
| R0-9 (P2-10) `boundedCommand` readiness                        | `2aab0b03e` | Windows pre-candidate Q3 passed 30/30 at `419e1c05b`.                                                                         |
| R1-DRV-3 (P2-6) and R1-DRV-7 (P3-DRV-10), before W-R1-3 starts | `f17cb7689` | W-R1-3 landed at `a966c71a5`; all 15 cache tests passed on Windows.                                                           |

| Item                                  | Status      | Commit      | Notes                                                                                                                                                             |
| ------------------------------------- | ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0 setup and draft PR            | done        | `302ce30bb` | Draft #4515 open; Windows kickoff in the workflow mailbox.                                                                                                        |
| R0-1 desktop-test minor and migration | done        | `960e9b90b` | `yarn changeset status` resolves 0.4.0; generated changelog and pins will be checked in the candidate preview.                                                    |
| R0-2 changelog text                   | done        | `6b53b1686` | Package-specific source entries are split; candidate changelog preview pending.                                                                                   |
| R0-3 P1-2 WebdriverIO retries         | done        | `6fb97096e` | Fake-host launch and connected/attached click contracts passed on macOS and Windows. Native Storybook smoke awaits a candidate SHA.                               |
| R0-5 P1-4 Node and Swift              | done        | `22423f29d` | macOS helper self-test passed 491/491. Windows verification is separate.                                                                                          |
| R0-6 P1-5 Node and Swift              | done        | `9130fe983` | macOS helper self-test passed 502/502; Node lifecycle tests and pre-candidate buildci passed.                                                                     |
| R0-7 P1-6                             | done        | `545c3f99c` | macOS fresh-geometry checks and shared W3C mapping. Signed native suite passed; physical AppKit mutex case passed (1 selected, 12 skipped) with verified cleanup. |
| R0-8 P1-7                             | done        | `b8dafc50a` | macOS signed physical fixture and 526/526 self-checks passed. Hosted macOS physical Storybook timed out before test execution.                                    |
| R0-9 P2-10 boundedCommand             | done        | `2aab0b03e` | macOS and Windows pre-candidate Q3 each passed 30/30. Windows evidence is recorded at `00d522188`.                                                                |
| R1-PKG-1, 3, 4, 5, 6                  | done        | `5240d619f` | Node range, tarball inventory, author, first-party entries and WDIO prerequisites. Desktop-test boundary tests passed 13/13.                                      |
| R1-PKG-2 packed-install gate          | done        | `da9bdc841` | Implemented at `1eb3f9814`; macOS preview verified 40 imports, service launcher resolution, four CLI help checks and a helper source build. Candidate Q5 pending. |
| R1-DRV-3 and R1-DRV-7                 | done        | `f17cb7689` | Focused cache and signing tests and full portable desktop-driver suite passed. Stable signing not run.                                                            |
| R1-DRV-1 and R1-DRV-2                 | done        | `b3a53a665` | Bounded listener shutdown at `1cd698fe1`; native CLI reads env defaults unless explicitly overridden.                                                             |
| R1-DRV-4, 5, 6, 8                     | done        | `6960276e4` | Spawn handling `a2fa3424a`, safe agent errors `6960276e4`, story-plan validation `35bc73063`, batched macOS ACL reads `8461d032b`.                                |
| R1-MAC-1                              | done        | `c80e0338f` | Saturating macOS helper clock intervals.                                                                                                                          |
| R1-TST-1, R1-TST-2                    | done        | `732110b06` | Retained startup cancellation and auth credential redaction; 603 portable desktop-test tests passed.                                                              |
| R1-MCP-1 to R1-MCP-4                  | done        | `d0db23b93` | Behavior at `2464459fe`; 53 MCP package tests passed on Windows. Docs landed; workload result stripping deferred to R2.                                           |
| Documentation pass (macOS-owned)      | in progress |             | Published-package setup and workload interruption / recovery guidance updated.                                                                                    |
| Version preview (section 7)           | in progress | `7cb813140` | Pre-candidate macOS preview and packed helper source build passed. Windows version wrapper portability and final preview pending.                                 |
| Q1 to Q3                              | not run     |             |                                                                                                                                                                   |
| Q4 macOS helper                       | not run     |             |                                                                                                                                                                   |
| Q5 macOS packed install               | not run     |             |                                                                                                                                                                   |
| Q6 macOS Fabric                       | not run     |             |                                                                                                                                                                   |
| Q6 macOS Paper                        | not run     |             |                                                                                                                                                                   |
| Q7 macOS targeted checks              | not run     |             |                                                                                                                                                                   |
| Q8 macOS handoff                      | not run     |             |                                                                                                                                                                   |
| Q9 macOS MCP pass                     | not run     |             |                                                                                                                                                                   |
| Q10 hosted checks                     | not run     |             |                                                                                                                                                                   |
| Follow-up issues filed                | not started |             |                                                                                                                                                                   |
| Q11 #4509 and npm smoke (macOS)       | not run     |             |                                                                                                                                                                   |
