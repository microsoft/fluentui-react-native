---
id: desktop-test.native-qualification
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
  - packages/agentic/desktop-driver
  - packages/agentic/desktop-driver-mcp
  - packages/agentic/storybook-desktop
---

# Native descriptor-path qualification

Use this runbook to qualify the desktop foundation against the combined
integration commit, not an individual track branch. The macOS procedure is
parameterized by renderer; Windows Fabric and Win32 Paper require a Windows
machine and must remain **Not run** on macOS. The
[Windows parameters](#windows-fabric-and-win32-paper) substitute the endpoint
and identity values. Deterministic fake-host results
and Storybook callback smoke results are supporting evidence, not proof of the
real descriptor path.

Run the `yarn storybook`, `yarn desktop-driver`, and `yarn desktop-test`
commands below from `apps/storybook`, where their scripts are declared.

## Neutral macOS application ownership

The package's opt-in AppKit contract builds the signed native helper and the
isolated fixture described in the
`packages/agentic/desktop-driver/native/macos/README.md` provider guide.
From the repository root, under the exclusive native-validation lock:

```sh
FURN_NATIVE_DRIVER_TEST=1 yarn workspace @fluentui-react-native/desktop-test test --runInBand applicationOwnership.contract
```

Set `FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY` to the provisioned stable
identity. The suite covers supervisor/session separation, durable owner/app
identities, launch-capable discovery, exact external-app exclusion and
preservation, stale identities, direct-child causality, and post-launch
cancellation. Publication-failure coverage uses a real launched application
with an injected durable-publication rejection. Two separate Node owners are
killed after native acquisition: one before publishing the acquired identity,
the other after publishing it. Both leave a fenced claim, a surviving native
app and a bounded known descendant; replacement remains refused even after
the recorded owner and helper exit. The tests verify exact native identities
and executable paths before operator cleanup, prove the descendant survives
the primary process, and remove only the unchanged fixture claim after all
recorded processes exit. These are native AppKit scenarios, not fake-host
evidence or automatic recovery.

The ready crash-owner fixture retires with exit code 1 after two minutes if
the parent cannot perform exact cleanup. Its portable `--retirement-probe`
executes the same wait with a short deadline without acquiring a claim or
starting a helper/application. The AppKit fixture requests its own termination
after five minutes, and its `/bin/sleep 300` descendant already has a finite
lifetime. Neither deadline clears a claim or authorizes guessed PID cleanup;
native identity verification is still required by the parent.

Its evidence is written to the desktop-test package's
`artifacts/desktop/application-ownership-*/evidence.json`. The separate physical mutex
case requires explicit `FURN_NATIVE_PHYSICAL_INPUT_TEST=1` and effective native
permissions; a skipped case does not qualify input exclusion.

When Accessibility is unavailable, the non-positive safety subset can still
qualify native OS-owner inspection, pre-spawn/LaunchServices rejection settlement
and claim reuse, and exact cleanup after rejected launch:

```sh
FURN_NATIVE_DRIVER_TEST=1 yarn workspace @fluentui-react-native/desktop-test test --runInBand applicationOwnership.contract --testNamePattern 'kernel owner identity|failed native'
```

Record the actual AX rejection and exact primary-process cleanup. Passing this
subset is not positive supervisor lifetime, external-app preservation,
application exclusion, physical-input or renderer qualification.

An Accessibility trust flag alone is insufficient: record actual AX calls and
failures, including `kAXErrorAPIDisabled`, without resetting TCC or changing
privacy permissions. AppKit results support only the generic backend. They are
not Fabric/Paper signing or TCC-responsibility qualification, do not qualify
arbitrary descendants, and do not replace the per-renderer/descriptor gates
below. Windows launched-application resource/survivor qualification must run on
Windows; macOS and ordinary hosted smoke cannot establish it.

`containment: "uncontained"` is deliberate for both macOS launch kinds.
An exact primary-process exit is not proof that arbitrary descendants exited.
The native ownership cases do not qualify descendant containment.
The crash cases qualify a known descendant and the interrupted acquisition
publication boundary, not arbitrary descendant discovery, filesystem
power-loss behavior, Metro/channel survivors or transparent service restart.

The PR Windows setup action runs the **desktop-driver** native suite, not this
package's application-resource contracts. The Windows/Win32 E2E and Storybook
smoke jobs do not exercise failed packaged-launch survivor journaling/recovery.
Those jobs are insufficient for that acceptance gate; portable schema tests
must not be presented as Windows native qualification.

## Neutral Windows application ownership

The Windows provider fixture suite is opt-in and needs an eligible interactive
session and the exclusive native-validation lock:

```powershell
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn workspace @fluentui-react-native/desktop-driver test --runInBand applicationOwnership.contract
```

It exercises native read-only inspection, exact 100 ns start/session/executable
checks, ambiguity, cross-helper application exclusion, and five contained fixture
launch/close cycles. Its additional input-mutex case requires
`FURN_NATIVE_PHYSICAL_INPUT_TEST=1`. A skipped physical case is not input
qualification. The Win32 fixture is supporting provider evidence, not Windows
Fabric or REX application qualification.

For actual consumer qualification, first explicitly build the helper, prepare
the Windows Fabric packaged app and its own Metro instance, and bundle the
Win32 Paper REX app. Set `FURN_OWNERSHIP_WINDOWS_APPLICATION` and
`FURN_OWNERSHIP_WIN32_APPLICATION` to JSON application descriptors resolved from
the owning app's canonical config. The Windows descriptor must identify the
registered AUMID and exact title; the REX descriptor includes the verified
`ReactTest.exe`, working directory, bundle/component arguments, and exact title.
These are trusted test inputs, not WebDriver capabilities. Do not select another
worktree's Metro or fabricate an application identity.

Under the exclusive lock and connected/unlocked desktop gate:

```powershell
$env:FURN_NATIVE_DRIVER_TEST = '1'
$env:FURN_NATIVE_APPLICATION_OWNERSHIP_TEST = '1'
$env:FURN_NATIVE_PHYSICAL_INPUT_TEST = '1'
yarn workspace @fluentui-react-native/desktop-test test --runInBand windowsApplicationOwnership.contract
```

The suite requires a verified prebuilt helper and both explicit descriptors.
Supervisors use the native per-user private-store default. An arbitrary project
directory is not necessarily a safe replacement: native ancestor-owner/ACL
checks still apply, and a refused root must not be repaired or bypassed merely
to run this suite.
Separately on Windows Fabric packaged and Win32 Paper REX it checks:

- Five consecutive supervisor launches/teardowns, exact application and claim
  evidence, two borrowed sessions per launch, unchanged window identifiers
  during inspection, cross-service exclusion, and no surviving old incarnation.
- Start/session/executable mismatch rejection without signalling the app.
- A journaled acquired application in a child owner; identity-verified,
  literal-PID helper/owner fault injection; a live-owner fence; then real
  supervisor startup recovery of the exact old application and claim.
  Windows remains `uncontained` and must actually survive helper death; REX's
  Job Object must drain instead.
- Physical-input mutex contention across the two real endpoint helpers, with
  explicit cancellation and release. Run this only under the physical-session
  gate; semantic activation does not establish it.

Three paired launches on each endpoint also prove that winning controllers have
distinct exact incarnations, an unpinned descriptor refuses multiple matches,
another helper cannot attach to either pinned winner, and closing one winner
preserves the other. A multi-instance packaged host may start two distinct
processes; that is not an exclusion failure. When activation instead returns
the same incarnation, a refused contender must not clean up the winner. Record
whether that shared-incarnation activation race was actually induced rather
than treating two distinct winning processes as proof of the losing path.

Evidence is written to the desktop-test package's
`artifacts/desktop/windows-application-ownership-*/evidence.json`, including
source/helper identities, endpoint descriptors, process evidence and case
outcomes. Also record the registered app build, renderer, session kind, exact
commands, and before/after process audits in the Windows ledger. Keep private
machine paths in ignored artifacts, not public evidence.

The crash-owner helper is a contract fixture, not a second production service
factory. Unknown resources/effects, unleased launches, legacy/unverified claims,
and interrupted recovery are fenced rather than force-reclaimed. This suite
does not qualify mixed Storybook service-graph recovery, arbitrary uncontained
descendants, or a new protected-agent recovery API.

## Parameters and prerequisites

Record these for every renderer run:

| Parameter   | Value                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `COMMIT`    | Exact `git rev-parse HEAD`; final acceptance uses the coordinator's combined F2/F3/F4/F5 SHA.                             |
| `APP`       | Agentic Components Storybook / `ReactTestApp`; record the exact bundle identifier from the run.                           |
| `OS`        | `sw_vers -productVersion` and `uname -m`.                                                                                 |
| `ENDPOINT`  | `macos`; the renderer is `fabric` or `paper`.                                                                             |
| `SELECTION` | Exact story/test selector and actual selected count from `run.json`; do not infer selection from an environment variable. |
| `ARTIFACT`  | Workspace-relative `apps/storybook/artifacts/desktop/<run-id>/run.json`; retain only approved, redacted summaries.        |

1. Obtain the exclusive `native-desktop-validation` lock. Run one interactive
   desktop workload at a time; do not overlap physical-input runs.
2. Explicitly build the native helper and run its noninteractive preflight:

   ```sh
   yarn storybook build-driver --macos
   yarn desktop-driver doctor --platform macos --permissions
   ```

   Record the exact helper artifact, signing mode, designated requirement, and
   Accessibility, PostEvent, and ScreenCapture preflight values. Do not use
   `--prompt`, change OS permissions, or treat a semantic `activate` as proof
   of physical input. If a capability is unavailable, mark its case skipped
   or not run.

3. Check static discovery without launching the native app:

   ```sh
   yarn storybook manifest --macos
   yarn storybook test --macos --list
   ```

   Use the generated manifest's exact story IDs and test names; do not guess
   slugging or test names.

## Per-renderer app pass

Run Fabric and Paper as separate passes. Bundle before `prep` so CocoaPods
embeds the current JavaScript resources; switching renderers always requires a
new `prep`.

```sh
# Fabric
yarn storybook bundle --macos
yarn storybook prep --macos
yarn storybook smoke --macos --mode stories-and-tests

# Paper; complete the Fabric run and cleanup before switching
yarn storybook bundle --macos --paper
yarn storybook prep --macos --paper
yarn storybook smoke --macos --paper --mode stories-and-tests
```

`smoke` traverses the declared stories and, in `stories-and-tests` mode, runs
the selected static and authored callbacks. It does not expose a `--test`
filter. `STORYBOOK_SMOKE_STORY` and `STORYBOOK_SMOKE_TAG` can request focused
coverage, but always read the terminal `run.json` counts and work selection:
the provisional run recorded below supplied a story environment selector yet
still selected 211 callbacks. For a strict callback subset, keep the app and a
non-agent driver running and use the supported filtered command:

```sh
yarn storybook test --macos --story '<story-id-glob>' --test '<test-name-glob>'
```

Do not use `storybook test` against an agent-served instance; it has no grant.
Manifest-backed `smoke` also uses a non-agent driver session; it has no
`--agent` option or descriptor-grant input. Qualify its driver-backed
traversal separately from the protected descriptor path below.
For every run record selected, executed, passed, failed, skipped, unsupported,
incomplete, retries, flaky count, and the cleanup result. Empty work is not a
pass.

## Real descriptor-path pass

Perform this after the app pass, independently for Fabric and Paper. Use one
supervisor path at a time; do not start `storybook driver --agent` and
`desktop-test serve --agent` concurrently.

1. Start either the Storybook driver or the Storybook target via
   `yarn desktop-test --target macos serve --agent`. For the Storybook driver,
   use `yarn storybook driver --macos --agent` for Fabric or
   `yarn storybook driver --macos --paper --agent` for Paper. The desktop-test
   target must likewise be configured for the selected renderer. This owns
   Metro and the Storybook channel; wait for its structured ready record,
   including the private descriptor name. Do not print, copy to artifacts, or
   expose the descriptor grant.
2. In a separate shell, launch the prepared app with
   `yarn storybook run --macos` for Fabric or
   `yarn storybook run --macos --paper` for Paper. Use the same renderer
   selection as the driver. Keep the driver service running. Confirm the app
   connects to the instance from the driver's readiness record before opening
   an MCP session.
3. Connect `desktop-driver-mcp` using its default
   `agent-connection.json` descriptor. Confirm the adapter verified the native
   service identity before any grant is used. Use a real MCP client and the
   public tools; do not substitute a direct unprotected driver URL.
4. Run the following cases against the real descriptor and native service.
   Fault-injection cases must intercept the adapter-to-service transport while
   retaining the real descriptor, verified service, and native helper. Record
   the injected dispatch point and whether a mutation was applied; never retry
   an ambiguous mutation.

   Keep the public operation request ID separate from the runtime's internal
   selection request ID. Reusing the public ID replays its recorded outcome,
   including a rejected `bridge-unavailable` result; it is not a new readiness
   probe. A new ID is safe only after a rejected, effect-none result. Match
   render-fault injections to the actual correlated runtime message and retain
   its epoch, preview generation, and internal request ID. Write live
   fault-control files atomically; a partially written control file is a harness
   failure, not evidence about the service.

| Case                           | Stimulus                                                                                                    | Required evidence                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same-port replacement          | Replace the protected service on the same port after opening a session.                                     | Old incarnation/session and references are rejected; the next call re-verifies discovery; no old mutation is replayed.                                |
| Grant revocation               | Revoke the active parent or delegated grant during a connection.                                            | Protected access fails closed, authority is rediscovered, and there is no fallback to an unprotected service.                                         |
| Dispose during open            | Hold acquisition after dispatch, begin MCP disposal, then release acquisition.                              | Late session is deleted; no new open is admitted; drain completes or remains explicitly uncertain.                                                    |
| Failed delete                  | Inject transport loss before and after DELETE dispatch.                                                     | Session cleanup responsibility remains; replacement opens are blocked until deletion is confirmed or authoritative invalidation occurs.               |
| Ambiguous create               | Drop the session-create response after the service may have created the session.                            | The connection becomes `session-uncertain`; no repeated create or guessed session ID; disposal revokes and drains the child grant.                    |
| Resource invalidation          | Replace the service or preview context after reading a resource.                                            | Old resource identifiers cannot be used; fresh discovery and observation are required.                                                                |
| Story quarantine and recovery  | Cause an unknown-effect story transition, then perform the trusted recovery path.                           | Later story mutations are quarantined until authoritative recovery and a verified current marker.                                                     |
| Protected args refusal         | Attempt story args through the protected service.                                                           | `story-args-unsupported`, no native effect, and no argument values in output, diagnostics, or logs.                                                   |
| Failed-cleanup claim retention | Force owned-resource cleanup failure in `desktop-test serve --agent`, then attempt replacement.             | `interactive.lock` and workload ownership remain; replacement is refused until exact-owner cleanup is proved.                                         |
| Launch-mode discovery          | Connect to launch-capable and attach-only targets.                                                          | Advertised modes match target policy; attach-only targets never launch or terminate the external app.                                                 |
| Live cleanup and restart       | Fail cleanup, restart the service, and reconnect through its descriptor.                                    | Exact cleanup state and new service incarnation are reported; restart alone is not recovery proof.                                                    |
| Attached-app preservation      | Start the app externally, connect without launch ownership, then stop the agent service.                    | The same app process incarnation and bundle remain running after service/session cleanup.                                                             |
| F4 post-dispatch cancellation  | Cancel only after native dispatch is observed.                                                              | Result is applied, rejected, or indeterminate from settlement evidence; timeout is not treated as no effect.                                          |
| F4 readiness/render faults     | Delay readiness and inject correlated error/render faults.                                                  | No stale readiness is accepted; old preview resources are invalidated.                                                                                |
| F4 lost-context fencing        | Lose the bridge context, observe a fresh preview reference, and attempt a preview mutation before recovery. | The fresh preview cannot bypass lost-context fencing; chrome remains usable. A newly observed reference is not readiness proof.                       |
| F4 lost-context recovery       | Relaunch or otherwise establish a new authenticated bridge epoch after context loss.                        | Recovery requires correlated readiness and a verified marker; old context is not resumed. A same-incarnation restart alone remains relaunch-required. |
| F4 secondary windows           | Exercise a secondary window through its registered identity.                                                | Window identity and cleanup remain exact; no first-match behavior.                                                                                    |
| F4 physical input              | Perform the native pointer/keyboard case only with fresh helper permissions.                                | Record actual physical result separately from semantic activation; otherwise mark skipped/not run.                                                    |
| F3 startup/shutdown/survivors  | Fail service startup and shutdown with Metro/channel/helper resources alive.                                | Readiness is typed; survivors are reconciled by exact resource identity; failed cleanup retains the workload claim.                                   |
| F5 ingress bypass              | Try anonymous and foreign-authority HTTP/WS select, prepare, and args mutations.                            | Native preview and marker are unchanged; protected args neither mutate nor leak values.                                                               |
| F5 owned selection/reset       | Use authorized driver selection and reset through the authenticated epoch client.                           | Correlated readiness and markers settle; stale preview resources are invalidated.                                                                     |
| F5 channel lifetime            | Leave agent mode idle beyond upstream's 20-second timeout.                                                  | Owned 10-second JSON heartbeat keeps the channel connected.                                                                                           |
| F5 manifest smoke              | Run manifest-backed non-agent smoke separately from the protected descriptor pass.                          | One driver session is used and released before authored tests; there is no fallback to HTTP mutation routes. This is not protected-ingress evidence.  |
| F5 legacy separation           | Exercise the non-agent legacy channel separately.                                                           | Results are labeled unprotected/legacy and are not counted as protected-ingress evidence.                                                             |

The F3/F4/F5 cases are integration gates, not claims about the F15 baseline.
Run them only on the combined source that contains those tracks. Until then,
record them as **Not run**.

## Windows Fabric and Win32 Paper

The procedure is the same with these substitutions. `--paper` is invalid on
Windows: `--windows` is always Fabric and `--win32` is always Paper.

| Parameter | Windows Fabric (`--windows`)                                                                                               | Win32 Paper (`--win32`)                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `OS`      | `(Get-CimInstance Win32_OperatingSystem).Caption`, `.BuildNumber`, and `$env:PROCESSOR_ARCHITECTURE`.                      | Same.                                                                                                                       |
| `APP`     | React Native Test App host, window title `Agentic Components Storybook`; record the resolved AUMID or executable identity. | `rex` host component `AgenticStorybook`, window title `Agentic Components Storybook (Win32)`; record the resolved identity. |
| Bundle    | Development Metro bundle; a Metro reload replaces the bridge.                                                              | Production bundle (`bundle --dev false`); there is no Metro reload path.                                                    |
| Prereqs   | Windows App Runtime 1.8 registered for the user (CI installs it).                                                          | None beyond the build.                                                                                                      |
| App pass  | `yarn storybook prep --windows`, then `yarn storybook smoke --windows --mode stories-and-tests`.                           | `yarn storybook smoke --win32 --mode stories-and-tests`.                                                                    |

- Run `yarn storybook build-driver --windows` (or `--win32`) and
  `yarn desktop-driver doctor --platform windows --permissions` (or
  `--platform win32`). The Windows permission preflight reports **Unsupported**;
  record that, not a pass.
- Physical pointer input needs the target window to become foreground. When the
  machine cannot grant foreground, record the physical case as **Failed** or
  **Skipped** and rerun the smoke with
  `FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES=keyboard,physicalClick,wheel`,
  reporting both runs.
- Win32 cannot lose context through a Metro reload. Use external app
  termination instead: kill the app between calls for the fence case and
  during an in-flight `select` for quarantine. Record the Metro-reload variant
  as **Unsupported** on Win32.
- Quarantine of an attached app lifts through the application-exit probe,
  which runs when a new session opens for the unheld target. A relaunch
  observed inside the original session stays `target-quarantined`.
- After a same-port service replacement, story mutations against the existing
  app return `relaunch-required`; recovery needs an app relaunch.
- An externally stopped `storybook run` exits nonzero and writes a failed
  `run.json`. Record it as expected for that case; it is not a driver failure.
- Win32's production bundle embeds the instance it connects to. Before
  `run --win32` against an agent-served instance, rebundle with that
  instance's environment as described in
  `@fluentui-react-native/storybook-desktop/references/platforms/win32.md`;
  a stale bundle never reaches the channel.
- A console Ctrl+C to `desktop-test serve --agent` used to leave the CLI idle
  after every resource settled, with its claim still `active` and `run.json`
  `incomplete`. That is fixed; record whether the CLI now exits by itself. If
  it stays idle, prove the owner and resources as in
  [cleanup](#cleanup-and-endpoint-limits), and end only that process.
- If `storybook run --windows` fails while enabling Developer Mode, do not
  change that OS setting for qualification. An already installed, verified
  app can instead be launched by its exact AUMID resolved from the built
  AppxManifest and the matching registered package. Record both the failed
  launch command and this narrower launch path.
- Windows smoke uses separate story-traversal and post-relaunch test phases.
  Trace session creation/deletion for each phase: one traversal session per
  phase, its confirmed deletion before the next phase or authored session,
  and no controller fallback to HTTP selection. The deliberately unprotected
  orchestrator itself uses the legacy HTTP selection route; distinguish
  those nested driver-owned calls from controller fallback. Do not mistake
  authored-test sessions for traversal sessions.

## Cleanup and endpoint limits

After each bounded pass, stop only resources owned by that run and record:

- owned app, driver, channel, and Metro process IDs are gone;
- reported service ports have no listeners;
- the exact per-user `interactive.lock` is absent, or retained with its
  verified owner and unresolved cleanup reason;
- the private descriptor was removed and its grant revoked;
- no externally owned app was stopped.

If cleanup is uncertain, do not remove the lock or start another workload.
Report a blocked question to the coordinator. Release the native lock only
after cleanup evidence is recorded.

On a macOS-only machine, record **Windows Fabric** and **Win32 Paper** as
**Not run**, with no measurements inferred from macOS. On Windows, also confirm
that no `%LOCALAPPDATA%\Microsoft\FluentUIReactNative\desktop-test\workload\interactive.lock` and no
`%LOCALAPPDATA%\com.microsoft.fluentui-react-native.desktop-driver\agent-connection.json`
remain, that the channel, Metro, and WebDriver ports reported by the driver
have no listeners, and that no app process from the run survives. Hosted physical-input
or capture skips are skips, not passes. Keep descriptor-path results separate
from smoke/WDIO and deterministic fake-host results in all three package
status ledgers.
