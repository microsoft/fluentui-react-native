---
id: desktop-test.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Current lifecycle and qualification status

**Work in progress, updated 2026-11-08.** Done means the listed implementation,
not full cross-platform qualification. This package is the intended neutral
workload host; the existing Storybook lifecycle takeover is transitional.
No new coordinator package, daemon, dynamic plugin loader, or package rename
is required now. Follow-up work is tracked in
[desktop driver improvements (#4435)](https://github.com/microsoft/fluentui-react-native/issues/4435)
and its sub-issues.

## Capability matrix

| Capability                                               | State              | Limit or next gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App/suite configuration and standalone installed-app use | Done               | Storybook is optional; runtime boundary and standalone-consumer contracts reject React, React Native, and Storybook imports/dependencies. Executable config is trusted operator code, not a sandbox.                                                                                                                                                                                                                                                                                                                                                                |
| Native service and helper composition                    | Done               | Generic supervisor and supervised Storybook child use the same real `driverService` factory, helper policy, authority and settled close.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Standalone WDIO/Jasmine execution                        | Done               | WDIO owns its session. Storybook CSF callbacks use a runner-owned session borrowed by a Node worker.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Required services, reporting, structured results         | Done               | One collector; bounded JSON/NDJSON summaries. Service-ready is not app/context-ready.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `serve --agent` descriptor publication                   | Done               | Protects driver routes; no automatic build/launch from MCP. Normal WDIO cannot use the agent-served path yet.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Cleanup failure fence                                    | Done, conservative | Failed or timed-out disposal retains the claim with an exact resource generation and unresolved effect; manual inspection is required. No automatic reclaim.                                                                                                                                                                                                                                                                                                                                                                                                        |
| Complete lifecycle settlement                            | Done, conservative | Guarded work settles before successful close; late acquisitions are disposed; required-service failures stop dependants; owned resources dispose in reverse order.                                                                                                                                                                                                                                                                                                                                                                                                  |
| Typed generic resource contributions                     | Done               | Static contribution plans validate IDs/dependencies and record readiness, generation, identity, ownership, and settled disposal through public `resources` and `ownership` subpaths.                                                                                                                                                                                                                                                                                                                                                                                |
| Durable quarantine wiring                                | Done               | Both native service paths use owner-only storage and exact-incarnation probes; restart is not recovery proof. Live endpoint qualification remains separate.                                                                                                                                                                                                                                                                                                                                                                                                         |
| Supervisor crash containment                             | Work in progress   | Cooperative Node service lifelines and correlated service readiness implemented; portable parent/wrapper crash, late-spawn, failed-withdrawal and stalled-child contracts. Live macOS survivors remain unqualified; no automatic reclaim. Windows: the helper's Job Object ends an unpackaged app it launched when the helper dies (qualified with REX); packaged launches are `uncontained` and survive in a fenced claim. Non-detached children are hard-terminated with a crashed owner (observed A/B), so the three crash-disposal contracts are skipped there. |
| Storybook resource contributions                         | Work in progress   | Current integration substitutes its CLI lifecycle; retain the channel/driver child until relocation is justified and qualified.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| MCP/WDIO handoff                                         | Work in progress   | Must await drain/deletion; attached-app handoff is independent of future supervisor-owned launch.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Supervisor-owned app lifetime                            | Work in progress   | Current session-owned launch/externally owned attach semantics remain; never silently retain or terminate another owner's app.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Cross-service/multi-target claims                        | Work in progress   | Configured aliases now have distinct registered IDs while retaining physical identity; exact-application exclusion and input-mutex qualification remain open.                                                                                                                                                                                                                                                                                                                                                                                                       |
| Bounded persisted run/status/artifact queries            | Done               | Harness-local read service/client; atomic snapshots, terminal evidence, scoped expiring grants, bounded pages and allowlisted opaque artifact IDs. No management transport.                                                                                                                                                                                                                                                                                                                                                                                         |
| Workload management/control API                          | Work in progress   | Future management selects only declared workload IDs, not commands/paths/environment; lifecycle/handoff gates still apply.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Automatic service reuse and per-user daemon              | Deferred           | Requires exact identity/config matching and evidence of need. Never adopt an unknown port occupant.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

See [lifecycle](lifecycle.md), [commands](commands.md), and
`@fluentui-react-native/desktop-driver/references/current-status.md` for the
native and driver boundaries.

## Historical consumer evidence

Migrated from the former root capability report. These results were recorded
before this update; they are not reruns or qualification of new cleanup behavior.

| Evidence window                           | Consumer/lane                            | Recorded result                                                                | Limit                                                         |
| ----------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Baseline report, `c84acb741` (2026-11-02) | FluentTester E2E, macOS Fabric           | 62/62 locally and hosted                                                       | No skips/retries recorded; not new lifecycle evidence         |
| Same report                               | FluentTester E2E, Windows Fabric         | 39/39                                                                          | Endpoint-specific historical result                           |
| Same report                               | FluentTester E2E, Win32                  | 201/201                                                                        | Endpoint-specific historical result                           |
| Same report                               | macOS Fabric Storybook smoke             | 280/280, including 81 callbacks                                                | Full smoke was not rerun for the November 4 update            |
| Same report, accumulated local runs       | Storybook attempts                       | 1,118 passed, 24 failed, 40 skipped                                            | Mixed runs; not a controlled reliability rate                 |
| `59dad9515`, 2026-11-04                   | Windows Storybook hosted native contract | Recorded 814 passed, 34 skipped                                                | Physical-input/capture skips do not qualify those paths       |
| This update                               | Portable cleanup contract                | Injected disposal failure retains the claim and refuses a replacement workload | Fake-host evidence only; Windows live cleanup remains not run |

The historical passing-attempt median was 52 ms (p90 2.2 s, max 9 s).
Single-test Storybook commands were recorded at about 4-4.6 s wall time;
full bundle/prep/build/launch at about 70-78 s. These are historical mixed-run
observations, not a benchmark of the proposed shared host. The original report
did not retain a portable raw-report locator; do not imply otherwise.

## Full-submission checklist

| Area            | Remaining evidence/work                                                                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| macOS           | Live failed-cleanup and service-restart cases; Paper separately; supervisor death with Metro/channel/helper survivors; exact attached-app preservation.                                                                                                                                                            |
| Windows / Win32 | Same-branch MCP restart/revocation/dispose/args tests; physical console Ctrl+C requalification of `serve --agent` after the idle-CLI fix; interactive input/capture rerun; naming launched (especially uncontained packaged) apps in the claim.                                                                    |
| Storybook       | Authenticated mutation ingress, context fencing/reconnect, consistent helper build policy. F6 now implements strict generated provenance and independent nonces; see the F6 evidence below for qualification limits.                                                                                               |
| Recovery        | Durable uncertainty is wired in both paths; live restart qualification, ledger and exact-resource reconciliation still precede automatic reclaim. The workload claim records a Node.js-clock start time, so it needs a helper-described start time before claim inspection can prove a live owner or a reused PID. |
| Concurrency     | No physical-input suites in parallel on one interactive desktop. Separate machines may qualify independent endpoints.                                                                                                                                                                                              |
| Reliability     | Establish the required repeated-run window rather than interpreting aggregate past successes as a pass.                                                                                                                                                                                                            |

Tracking: live macOS, Windows, and Win32 requalification
[#4441](https://github.com/microsoft/fluentui-react-native/issues/4441);
recovery [#4436](https://github.com/microsoft/fluentui-react-native/issues/4436)
and [#4442](https://github.com/microsoft/fluentui-react-native/issues/4442);
Storybook [#4437](https://github.com/microsoft/fluentui-react-native/issues/4437),
[#4443](https://github.com/microsoft/fluentui-react-native/issues/4443), and
[#4445](https://github.com/microsoft/fluentui-react-native/issues/4445);
application ownership [#4446](https://github.com/microsoft/fluentui-react-native/issues/4446)
(macOS) and [#4447](https://github.com/microsoft/fluentui-react-native/issues/4447)
(Windows); reliability window
[#4451](https://github.com/microsoft/fluentui-react-native/issues/4451).

For new evidence, append the date, exact commit, app/OS/renderer, command,
selection, passed/failed/skipped counts, cleanup outcome, and approved artifact
locator. Distinguish tests that actually ran from build/bundle or fake-host
checks. Keep measured text/operation costs in the driver status reference and
MCP discovery overhead in the adapter's status reference.

### Provisional F15 macOS evidence — 2026-11-06

**Provisional; exact source revision `388a60cc803ab78202a6f64f92e3f53b779c5c39`.**
App: Agentic Components Storybook / ReactTestApp (configured bundle ID
`com.microsoft.fluentui.agenticstorybook`). OS: macOS 27.2, arm64.

| Renderer       | Command and actual selection                                                                                                            | Result                                                    | Cleanup                                                                                                        | Artifact                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| macOS Fabric   | `STORYBOOK_SMOKE_STORY=components-button--default yarn storybook smoke --macos --mode stories-and-tests`; 211 selected/executed         | Passed 211, failed 0, skipped 0, unsupported 0; retries 0 | No owned app/driver/channel/Metro process; ports 21338/30029/45382 had no listeners; `interactive.lock` absent | `apps/storybook/artifacts/desktop/0f99740f-631b-444a-a705-76a9b4a761b7/run.json` |
| macOS Paper    | `STORYBOOK_SMOKE_STORY=components-button--default yarn storybook smoke --macos --paper --mode stories-and-tests`; 211 selected/executed | Passed 211, failed 0, skipped 0, unsupported 0; retries 0 | No owned app/driver/channel/Metro process; ports 21338/30029/45382 had no listeners; `interactive.lock` absent | `apps/storybook/artifacts/desktop/e82a83c2-a01d-41c0-b308-2551630e8b1e/run.json` |
| Windows Fabric | Not run — this machine is macOS-only                                                                                                    | Not run; 0 selected                                       | Not applicable                                                                                                 | None                                                                             |
| Win32 Paper    | Not run — this machine is macOS-only                                                                                                    | Not run; 0 selected                                       | Not applicable                                                                                                 | None                                                                             |

| Descriptor-path renderer | Command / selection                                 | Passed / failed / skipped / unsupported | Cleanup                                      | Artifact |
| ------------------------ | --------------------------------------------------- | --------------------------------------- | -------------------------------------------- | -------- |
| macOS Fabric             | Not run; no real descriptor consumed; selection N/A | 0 / 0 / 0 / 0; Not run                  | N/A for descriptor path; smoke cleanup above | None     |
| macOS Paper              | Not run; no real descriptor consumed; selection N/A | 0 / 0 / 0 / 0; Not run                  | N/A for descriptor path; smoke cleanup above | None     |

The Windows Fabric and Win32 Paper "Not run" rows above describe that macOS
host only. They are superseded, not erased, by the Windows-host section
"Windows Fabric and Win32 Paper qualification — 2026-11-06" at the end of this
file.

These are real native Storybook smoke runs through the non-agent WDIO path.
They do not demonstrate descriptor publication, service restart, failed
cleanup, or exact attached-app preservation. The `STORYBOOK_SMOKE_STORY`
environment value did not constrain the selection; the artifact reports 211
callbacks. The initial Fabric attempt failed before selection due to an
unsynchronized CocoaPods sandbox; `yarn storybook prep --macos` repaired the
generated project before the passing retry. See the runbook in
[`native-qualification.md`](native-qualification.md). The authoritative
descriptor-path and F2/F3/F4/F5 cases remain **Not run** until the combined
integration commit is available and the native lock is granted again.

## F15 combined-candidate macOS qualification — partial, 2026-11-06

**Exact tested source:** `3c780cfd1bccaf510ece080e4be2b516c645989a`.
App: Agentic Components Storybook / ReactTestApp, bundle identifier
`com.microsoft.fluentui.agenticstorybook`. OS: macOS 27.2, arm64.
This is a partial ledger for this exact candidate, not final acceptance. The
F5 reference-generation fix at
`2d8e8db001b64ebea85f0d6dce141f040fb5182d` is not in this tested source and
requires a new native qualification. The original accepted-reference probe
remains inconclusive and is not attributed to that fix.

**Commands and selection:** helper build and permission preflight were
`yarn storybook build-driver --macos` and
`yarn desktop-driver doctor --platform macos --permissions` (no `--prompt`).
The Paper descriptor pass used
`yarn storybook driver --macos --paper --agent` and
`yarn storybook run --macos --paper`; Fabric used
`yarn storybook driver --macos --agent` and
`yarn storybook run --macos`. Both used the MCP SDK stdio client with the
default private `agent-connection.json`; its exact inline client launch command
was not retained. Those app/driver `run.json` records each report zero selected
and zero executed WDIO tests; MCP operations are manual evidence, not suite
counts. The separate Paper legacy lane used
`yarn storybook smoke --macos --paper --mode stories-and-tests`: 319 selected,
308 executed/passed, 0 failed, 11 skipped, 0 unsupported/incomplete/retries/
flaky. Its artifact is
`apps/storybook/artifacts/desktop/a569510a-ac99-4ec9-8c78-4d8607bdaadd/run.json`.
Two additional 319/308/11 reports
(`8c6d031d-32e3-49c4-9e80-049202b74626` and
`e5117371-764c-45ff-8b14-97c5b7ec5036`) do not retain renderer metadata and
are not credited to Fabric or Paper.

The 24-case matrix is recorded without promoting partial evidence to passes.
`Not run` means no case-specific native evidence was retained; it is not a
skip or pass.

| Case                           | macOS Fabric | macOS Paper | Retained evidence / limitation                                                                                                                                                                                                                                                            |
| ------------------------------ | ------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same-port replacement          | Not run      | Partial     | Paper restart and rediscovery succeeded; explicit confirmation of old-session close was not retained.                                                                                                                                                                                     |
| Grant revocation               | Not run      | Pass        | Paper delegated-grant revocation and child drain were reported complete; private run record only.                                                                                                                                                                                         |
| Dispose during open            | Not run      | Not run     | No acquisition hold was injected.                                                                                                                                                                                                                                                         |
| Failed delete                  | Not run      | Not run     | No DELETE dispatch-loss injection was run.                                                                                                                                                                                                                                                |
| Ambiguous create               | Not run      | Not run     | No session-create response-loss injection was run.                                                                                                                                                                                                                                        |
| Resource invalidation          | Inconclusive | Partial     | Fabric had a separate preview-child stale-element rejection (`stale element reference`, `ref-region-changed`), but the earlier accepted handle's kind/identity was not retained. Paper's old-preview rejection lacks retained handle kind/generation.                                     |
| Story quarantine and recovery  | Not run      | Not run     | No unknown-effect transition/recovery injection was run.                                                                                                                                                                                                                                  |
| Protected args refusal         | Partial      | Pass        | Fabric final attempt returned `story-args-unsupported`, unchanged story, and no probe value in error/journal; an earlier recorded post-attempt unchanged-state assertion was false. Paper refusal was reported with no effect.                                                            |
| Failed-cleanup claim retention | Not run      | Not run     | No owned-resource cleanup failure was injected.                                                                                                                                                                                                                                           |
| Launch-mode discovery          | Partial      | Partial     | Only attach mode was discovered; no launch-capable target was exercised.                                                                                                                                                                                                                  |
| Live cleanup and restart       | Not run      | Partial     | Paper service restart/rediscovery ran; old-session close confirmation was not retained.                                                                                                                                                                                                   |
| Attached-app preservation      | Pass         | Pass        | The same ReactTestApp process survived agent-service shutdown; the qualification-launched app was stopped only after that check.                                                                                                                                                          |
| F4 post-dispatch cancellation  | Not run      | Not run     | No cancellation-after-native-dispatch injection was run.                                                                                                                                                                                                                                  |
| F4 readiness/render faults     | Not run      | Not run     | No delayed-ready, correlated error, or render-fault injection was run.                                                                                                                                                                                                                    |
| F4 lost-context fencing        | Not run      | Not run     | No lost-context mutation-fencing case was run.                                                                                                                                                                                                                                            |
| F4 lost-context recovery       | Not run      | Not run     | No new authenticated epoch recovery case was run.                                                                                                                                                                                                                                         |
| F4 secondary windows           | Not run      | Not run     | No secondary-window case was run.                                                                                                                                                                                                                                                         |
| F4 physical input              | Failed       | Not run     | Fabric returned `physicalInputApplied:false`; no retry. This is not a pass.                                                                                                                                                                                                               |
| F3 startup/shutdown/survivors  | Partial      | Partial     | Normal bounded shutdown and cleanup completed; injected startup/shutdown survivor reconciliation was not run.                                                                                                                                                                             |
| F5 ingress bypass              | Partial      | Partial     | Fabric anonymous/foreign HTTP select, prepare, and args returned 403 and preview stayed unchanged. The first two foreign-WS checks failed; a later attempt passed with no observer-message delta. Paper bypass checks were reported passed, but detailed status fields were not retained. |
| F5 owned selection/reset       | Partial      | Partial     | Selection/reset markers settled. Stale preview-reference identity and generation evidence is incomplete; see the MCP ledger.                                                                                                                                                              |
| F5 channel lifetime            | Pass         | Pass        | Fabric stayed open after 21,003 ms idle; Paper's 21-second check was reported connected.                                                                                                                                                                                                  |
| F5 manifest smoke              | Not run      | Partial     | Paper smoke passed 308/319 with 11 skipped; one-session/no-HTTP-fallback evidence was not retained. It is not protected-ingress evidence.                                                                                                                                                 |
| F5 legacy separation           | Not run      | Not run     | No separate legacy-channel behavior case was retained.                                                                                                                                                                                                                                    |

Fabric outcome totals: 2 Pass, 5 Partial, 1 Inconclusive, 1 Failed, 15 Not
run. Paper totals: 4 Pass, 8 Partial, 12 Not run. These are matrix-case
statuses, not WDIO counts. Windows Fabric and Win32 Paper are Not run because
this host is macOS-only.

The fresh doctor reported Accessibility, PostEvent, and ScreenCapture
preflight `true`, no permission prompt, console on/unlocked, and the arm64
release helper ad-hoc signed with designated requirement
`cdhash H"0d2e7a81dfd4695b7fb84aa1b3242f5e1773e8b4"`. Host load was 3.25 /
4.41 / 3.81 (1/5/15-minute averages). Per-renderer driver metadata is
`apps/storybook/artifacts/desktop/a58d2fdd-5584-47f4-8747-5307607b4c0d/run.json`
(Paper) and
`apps/storybook/artifacts/desktop/c15a35b9-7b8d-4edb-adba-84e3cd5a3023/run.json`
(Fabric); Fabric app launch is
`apps/storybook/artifacts/desktop/8fb9a576-cde8-470c-a8bb-a76b6d8fabc0/run.json`.
All report zero selected/executed automated work, so they do not increase the
matrix totals. Sanitized operation records and private captures are under
`f15-native-qualification-3c780cfd-20261106T0200/` in the machine-local log
root; they are not committed.

Retained retries/failures are not erased by later successes: Fabric's first
two foreign-WebSocket assertions failed before the final no-message-delta
attempt passed; an intermediate protected-args attempt recorded
`currentStoryUnchanged:false` before the final attempt recorded `true`; and the
first capture caller shape failed before the corrected call passed. No cause
is inferred from those retries. The Fabric physical-input attempt remained
failed and was not repeated.

At handoff, ports 21338/30029/45382 had no listeners, the workload lock and
default descriptor were absent, and the Fabric cleanup record showed its
service owner exited, grant revoked, descriptor removed, and attached app
preserved through service shutdown. Paper cleanup was reported, but its
process IDs were not retained, so PID-level Paper process exit is not
independently asserted here. No further native workload was started. No
product implementation was changed in this ledger update.

## F15 combined-candidate macOS requalification — partial, 2026-11-06

**Exact tested source:** `a19fd3e1e7b3f1f443a241b1571cb029162f4ef2`.
App: Agentic Components Storybook / ReactTestApp,
`com.microsoft.fluentui.agenticstorybook`; macOS 27.2 arm64. The exact helper
was rebuilt with `yarn storybook build-driver --macos`; fresh, nonprompting
`yarn desktop-driver doctor --platform macos --permissions` reported
Accessibility, PostEvent, and ScreenCapture as granted. No permission changes
were made. The arm64/release helper was ad-hoc signed with designated
requirement `cdhash H"0d2e7a81dfd4695b7fb84aa1b3242f5e1773e8b4"` and build
fingerprint
`b58e4d8692702fd1dfa16b73ac987d1738e6e17d16757cbc3c6007722b8e3869`.
Observed quiet host load was 2.49 / 5.27 / 5.47 (1/5/15-minute averages).

The descriptor pass used the default private `agent-connection.json` through
an MCP SDK stdio client. Manual MCP calls have no suite selection; each
companion Storybook driver `run.json` recorded 0 selected and 0 executed tests.
The separate manifest-backed, non-agent smoke command selected and executed
211 callbacks in each renderer. These are legacy-lane results, not
protected-ingress or no-HTTP-fallback evidence.

| Case                           | macOS Fabric                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | macOS Paper | Evidence and artifact                                                                                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same-port replacement          | Partial (recorded Failed at qualification; reclassified on contract review): the old client's first post-replacement `desktop_session.status` returned `adapter` / `service-unavailable`, the designed fail-closed rejection of the old incarnation; old session close then succeeded with no mutation replayed. Rediscovery on a later call was not demonstrated, because close is a no-op once invalid authority forgets the session. `desktop_observe.find` returned 0 matches, so no old-reference assertion was possible. | Not run     | Fabric private sanitized record: `fabric-same-port-replacement-final.json`; service runs: `apps/storybook/artifacts/desktop/414cf449-bfd4-4b9f-b630-63e86ebdd5c4/run.json` and `apps/storybook/artifacts/desktop/d732ae38-df56-4b81-a56c-2791bdbac5e8/run.json`.                              |
| Grant revocation               | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No live revocation case on this SHA.                                                                                                                                                                                                                                                          |
| Dispose during open            | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No acquisition hold was injected.                                                                                                                                                                                                                                                             |
| Failed delete                  | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No DELETE dispatch-loss injection was run.                                                                                                                                                                                                                                                    |
| Ambiguous create               | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No session-create response-loss injection was run.                                                                                                                                                                                                                                            |
| Resource invalidation          | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Passed      | Same-session preview-element refs were rejected after marker-settled select/reset; fresh find returned a distinct working alias and the old alias remained stale. Private records: `fabric-reference-sequence-retry.json`, `paper-reference-sequence.json`.                                   |
| Story quarantine and recovery  | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No unknown-effect transition/recovery injection.                                                                                                                                                                                                                                              |
| Protected args refusal         | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | Not attempted on this SHA.                                                                                                                                                                                                                                                                    |
| Failed-cleanup claim retention | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No forced owned-resource cleanup failure. A normal runner retry was blocked by the live prior claim, retained until its owner exited and empty resources were verified.                                                                                                                       |
| Launch-mode discovery          | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No launch-capable versus attach-only target comparison on this SHA.                                                                                                                                                                                                                           |
| Live cleanup and restart       | Partial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | Fabric old service stopped and replacement started on the same ports; the old adapter's next status failed with `service-unavailable`. App PID 26792 remained alive through service stop/restart.                                                                                             |
| Attached-app preservation      | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Not run     | Fabric app PID 26792 remained running after agent-service shutdown; it was stopped only after the check. Paper exact survival through service shutdown was not retained.                                                                                                                      |
| F4 post-dispatch cancellation  | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No dispatch-confirmed cancellation injection.                                                                                                                                                                                                                                                 |
| F4 readiness/render faults     | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No delayed-ready, correlated error, or render-fault injection.                                                                                                                                                                                                                                |
| F4 lost-context fencing        | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No lost-context mutation-fencing case.                                                                                                                                                                                                                                                        |
| F4 lost-context recovery       | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No new authenticated-epoch recovery case.                                                                                                                                                                                                                                                     |
| F4 secondary windows           | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No secondary-window case.                                                                                                                                                                                                                                                                     |
| F4 physical input              | Partial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | One corrected Fabric `desktop_act` physical-click request was issued. MCP returned success and sequence completion, but the client did not retain the nested action mechanism/disposition; no physical-input pass is claimed and it was not repeated. Paper physical input was not attempted. |
| F3 startup/shutdown/survivors  | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No injected startup/shutdown survivor reconciliation.                                                                                                                                                                                                                                         |
| F5 ingress bypass              | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not run     | No anonymous/foreign HTTP or WS mutation attempts on this SHA.                                                                                                                                                                                                                                |
| F5 owned selection/reset       | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Passed      | Same-session authorized select and reset both applied with marker verification; preview-element old/new identity checks passed.                                                                                                                                                               |
| F5 channel lifetime            | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Not run     | Fabric descriptor session remained open for 21,002 ms idle; subsequent status and close succeeded. No Paper idle interval on this SHA.                                                                                                                                                        |
| F5 manifest smoke              | Partial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Partial     | Non-agent `yarn storybook smoke --macos [--paper] --mode stories-and-tests` passed 211/211 with no skips or retries, but one-session/no-HTTP-fallback instrumentation was not retained. Separate from protected descriptor evidence.                                                          |
| F5 legacy separation           | Partial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Partial     | Non-agent smoke ran and was labeled separately as the legacy lane. No additional legacy-channel mutation trace was retained.                                                                                                                                                                  |

Fabric and Paper each passed the retained-preview element-reference sequence
and 211/211 separate legacy smoke callbacks. The same-port Fabric case was
recorded as Failed because its first post-replacement call returned
`service-unavailable`. Contract review reclassified it as Partial: that
response is the designed fail-closed rejection that
`packages/agentic/desktop-driver-mcp/src/server.test.ts` asserts before the next
call re-verifies discovery, but the native sequence ended with a close that does
not prove rediscovery. A native status call after the rejection remains
required. The
stale workload claim encountered on the first replacement attempt was not
removed until its exact owner was verified exited with no resources or
unresolved effects; the retry then started normally. On cleanup, owned app and
service PIDs were gone, ports 21338/30029/45382 had no listeners, the default
descriptor and workload lock were absent, and no external app was stopped.
The legacy run.json locators are
`apps/storybook/artifacts/desktop/a2475e8d-7ea9-465f-8461-b8f115cfcee5/run.json`
(Fabric) and
`apps/storybook/artifacts/desktop/87f0452f-5fd7-48eb-8494-a63202842521/run.json`
(Paper). Driver run records include the same-port attempt
`apps/storybook/artifacts/desktop/73563809-2d77-49cb-a297-c74fd57ecd36/run.json`,
blocked by the retained claim with 0 selected/executed tests.

Windows Fabric and Win32 Paper remain **Not run** on this macOS-only host.
Fault-injection cases remain Not run because no existing documented native
hook was exercised. The older `3c780cfd1bccaf510ece080e4be2b516c645989a`
ledger and its inconclusive probe remain unchanged and separate. The Windows
results that follow were recorded later on a Windows host; they do not change
these macOS results.

## Windows Fabric and Win32 Paper qualification — 2026-11-06

**Tested source:** the PR branch at `1f5333e25` plus two follow-up fixes from
this pass: `8458bde48` (a relaunched runtime reports `bridge-unavailable`
until its initial render) and `a6b89e924` (a reloaded runtime that
authenticates first retires the old bridge). Windows records started before
21:31Z predate both; `d558ed5d` includes only `8458bde48`; every later Windows
record and every Win32 record includes both. Host: Windows 11 Enterprise build
26300, AMD64, Node 26. Windows uses the React Native Test App host (window
title `Agentic Components Storybook`); Win32 uses the `rex` host, component
`AgenticStorybook` (window title `Agentic Components Storybook (Win32)`).
Windows App Runtime 1.8 was installed. The runbook is the Windows section of
[`native-qualification.md`](native-qualification.md).

Preflight: `yarn storybook build-driver --windows` and `--win32` succeeded.
`yarn desktop-driver doctor --platform windows --permissions` and
`--platform win32 --permissions` report that `--permissions` is
**Unsupported** on Windows; doctor otherwise passed. No OS privacy or input
setting was changed.

Each descriptor pass ran `yarn storybook driver --<endpoint> --agent`, then
`yarn storybook run --<endpoint>`, then connected the MCP SDK stdio client to
`desktop-driver-mcp` through the default private `agent-connection.json`.
Only one interactive workload ran at a time. Manual MCP calls have no suite
selection, so each driver and app `run.json` reports 0 selected and 0
executed tests; the cases are manual evidence in machine-local sanitized
records that are not committed.

### Smoke runs (legacy lane, not descriptor evidence)

Counts are selected / executed / passed / failed / skipped.

| Endpoint       | Command                                                   | Result                                                                                                                                                                                                                   | Artifact                                                                         |
| -------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Windows Fabric | `yarn storybook smoke --windows --mode stories-and-tests` | Failed: 202 / 202 / 202 / 0 / 0; the relaunch phase reported `relaunch-required`. This led to `8458bde48`.                                                                                                               | `apps/storybook/artifacts/desktop/2a80a82b-febc-40f8-85de-50c36f92f842/run.json` |
| Windows Fabric | Same                                                      | Failed: 206 / 206 / 205 / 1 / 0; the one failure is the physical-input test (foreground not acquired).                                                                                                                   | `apps/storybook/artifacts/desktop/9506772a-d3f9-4f53-966e-b6c75799b463/run.json` |
| Win32 Paper    | `yarn storybook smoke --win32 --mode stories-and-tests`   | Failed: 180 / 180 / 179 / 1 / 0; the one failure is a physical-pointer test, and 43 groups were not run.                                                                                                                 | `apps/storybook/artifacts/desktop/7a737861-c31b-4eeb-ac6d-b21b8a96739d/run.json` |
| Win32 Paper    | Same, with physical input disabled as on hosted runners   | Passed: 266 / 214 / 214 / 0 / 52.                                                                                                                                                                                        | `apps/storybook/artifacts/desktop/4ba5a00d-40d8-4a34-86f9-e564448623e2/run.json` |
| CI A/B         | The `win32-storybook` and `windows-storybook` job steps   | Win32 baseline failed at owned-service shutdown with 214 / 214 passed; the lifeline fix passed 266 / 214 / 214 / 0 / 52. Windows baseline failed 204 / 204 / 202 / 2; the readiness fix passed 312 / 234 / 234 / 0 / 78. | Baselines `47471c35-…` and `b7c67987-…`; fixes `047f5c3a-…` and `6cbfe8c5-…`     |

### Descriptor matrix

| Case                           | Windows Fabric | Win32 Paper | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | -------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same-port replacement          | Pass           | Pass        | The old client's next status returned `service-unavailable`; old refs returned `no-session`; rediscovery, close, and a new session succeeded. No old mutation replayed. The new session's first select returned `relaunch-required` (rejected, effect none); after an app relaunch, select and reset applied with marker verification.                                                                                                                                                       |
| Grant revocation               | Pass           | Pass        | After an external revoke (200), the next call and status returned `service-unavailable` ("authority is no longer valid"), and reopening on the same client was refused; a fresh connection opened and closed. Windows: the first attempt's post-revoke call was rejected by MCP input validation (the harness passed an unknown `budgets` key); the rerun passed.                                                                                                                            |
| Dispose during open            | Pass           | Pass        | The client was disposed while `POST /session` was held; the traffic shows the late session deleted and the grant revoked, and a fresh connection opened. Incarnation unchanged; no target quarantined.                                                                                                                                                                                                                                                                                       |
| Failed delete                  | Pass           | Pass        | After the injected DELETE failure (`service-unavailable`), the session was retained and an observe succeeded; the retried close matched. Windows: the first attempt recorded `sessionUsableAfterFailure: false`, and its traffic has no observe request after the failure; the rerun recorded `true`.                                                                                                                                                                                        |
| Ambiguous create               | Pass           | Pass        | With the create response dropped, open returned `service-unavailable`, status reported the session `uncertain`, and reopen and close returned `session-uncertain`; after the grant was revoked, a fresh connection opened. Incarnation unchanged.                                                                                                                                                                                                                                            |
| Resource invalidation          | Pass           | Pass        | See the reference evidence below. The immutable PNG resource stayed readable after reset with a matching capture digest.                                                                                                                                                                                                                                                                                                                                                                     |
| Story quarantine and recovery  | Pass           | Pass        | Windows: a Metro reload 15 ms into a select returned `story-not-ready` (indeterminate, quarantined), and later mutations returned `target-quarantined` while reads worked. Win32: an app kill 30 ms into a select did the same; after relaunch the same session stayed quarantined. On both, a new session ran the exit probe, lifted the quarantine, and select and reset applied.                                                                                                          |
| Protected args refusal         | Pass           | Pass        | `story-args-unsupported`; no value appeared in the response.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Failed-cleanup claim retention | Not run        | Not run     | No forced owned-resource cleanup failure was injected.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Launch-mode discovery          | Partial        | Partial     | Attach-only targets were observed and never launched or terminated the app; no launch-capable comparison was run.                                                                                                                                                                                                                                                                                                                                                                            |
| Live cleanup and restart       | Not run        | Not run     | Cleanup was not forced to fail. Same-port service restart and reconnection are recorded above but are not this case.                                                                                                                                                                                                                                                                                                                                                                         |
| Attached-app preservation      | Pass           | Pass        | The externally started app process stayed running through service shutdown and was stopped only afterward. Win32 was observed by process presence.                                                                                                                                                                                                                                                                                                                                           |
| F4 post-dispatch cancellation  | Pass           | Pass        | Aborts at 150 ms and 40 ms landed at 160/47 ms (Windows) and 156/49 ms (Win32). The journal shows the dispatch completed; replaying the request ID returned the recorded applied result, and the next mutation applied in the same session.                                                                                                                                                                                                                                                  |
| F4 readiness/render faults     | Not run        | Not run     | No readiness or render fault was injected through the descriptor path.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| F4 lost-context fencing        | Pass           | Partial     | Windows: in the in-flight run, a fresh preview root was observed while quarantined, preview mutations returned `target-quarantined`, and a chrome check passed. A quiet reload run on `a6b89e924` let the new runtime authenticate before the mutation, so it shows recovery rather than fencing. Win32 (production bundle): Metro reload has no effect (Unsupported); after app exit, select returned `bridge-unavailable` (rejected, effect none), but no fresh preview could be observed. |
| F4 lost-context recovery       | Pass           | Pass        | After a relaunch or reload, the old preview ref was `ref-stale`, and select and reset applied with marker verification; the old context was not resumed.                                                                                                                                                                                                                                                                                                                                     |
| F4 secondary windows           | Not run        | Not run     | Not attempted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| F4 physical input              | Failed         | Pass        | Windows: the descriptor `act` physical click was rejected ("The target window did not become the foreground window"; effect none), and the smoke physical test failed. Win32: the descriptor click applied with mechanism `physical-pointer`; separately, smoke 1's physical-pointer test failed and is retained. A semantic activation is not counted.                                                                                                                                      |
| F3 startup/shutdown/survivors  | Not run        | Not run     | Survivor reconciliation was not exercised.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| F5 ingress bypass              | Pass           | Pass        | HTTP `/select-story-sync`, `/send-event`, `/mcp`, and an unknown path returned 403; an anonymous WebSocket received only `furn:desktop:request-hello`; the leaf ref and region were unchanged.                                                                                                                                                                                                                                                                                               |
| F5 owned selection/reset       | Pass           | Pass        | Select and reset applied with marker verification in one session.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| F5 channel lifetime            | Pass           | Pass        | The session stayed usable after 21,010 ms (Windows) and 21,006 ms (Win32) idle.                                                                                                                                                                                                                                                                                                                                                                                                              |
| F5 manifest smoke              | Not run        | Not run     | The one-session instrumentation was not run; the smokes above are legacy-lane evidence.                                                                                                                                                                                                                                                                                                                                                                                                      |
| F5 legacy separation           | Not run        | Not run     | The non-agent smokes ran in separate workloads, but no legacy-channel trace labeled unprotected was retained.                                                                                                                                                                                                                                                                                                                                                                                |

**Counts.** Windows Fabric: 15 Pass, 1 Partial, 1 Failed, 7 Not run.
Win32 Paper: 15 Pass, 2 Partial, 7 Not run. `--permissions` is Unsupported
on both. Win32 Metro-reload fencing is Unsupported (production bundle).

**Reference evidence.** Each reference-sequence run used one session and
service incarnation 1 throughout.

- Windows (target `windows-f33cce69c1a7d0ae`): preview story-root `9z4z23`
  and child `9z4z66` became `ref-region-changed` after reset; window ref
  `9z4z1` (chrome) survived on `window-df4a4ab9-b2`; the fresh root `9z4z102`
  became stale after the second select (region 3).
- Win32 (target `win32-5e01f2ae23282f34`): preview refs `okdw21` and `okdw38`
  became stale after reset; window ref `okdw1` survived on
  `window-9951db02-b3`; the fresh root `okdw54` became stale after the second
  select.
- The matrix scripts' ref labeled "preview element" (`wbwm18`, `1roq21`) was
  actually sidebar chrome. It survived select and reset, which chrome may do;
  it is not staleness evidence.

**Run records** (`apps/storybook/artifacts/desktop/<id>/run.json`):

- Windows driver supervisors: `d558ed5d-4117-4afa-b69b-5fe2b7777e26`,
  `dc41f8c6-a7d0-4741-9a94-da88e3ab8619`, and the same-port replacement
  `102c54a5-417d-4266-acdd-eb83372292c4` (all passed). The lifecycle records
  `6424cc6f-6ffd-4ca1-83c0-8020f7817818` (passed),
  `a5e9d797-1bd9-4ea4-a106-2f23f75dbff0` (failed, `rnx-cli` ENOENT), and
  `e30e6500-105c-4055-a51d-a1f88d4f7f33` (failed) are retained attempts.
- Win32 driver supervisors: `80b2b8da-8428-4b90-a70a-d0ad9b6b5eae`,
  `9044e1fe-d81e-4c14-b078-5542d1ad62be`, and
  `2207ae33-ea4d-4b92-a4d8-5c3339a3faa0` (all passed). The app records
  `3a6ee6cd-…`, `e805a6b8-…`, `380063db-…`, `acc6cd02-…`, and `1dd7cdfe-…`
  report failed because the cases deliberately killed or externally stopped
  the app.

**Retained failures and deviations.**

- Windows, before `a6b89e924`: after a quiet Metro reload, select returned
  `story-not-ready` (indeterminate, quarantined) and later mutations returned
  `target-quarantined`. This led to the bridge-retirement fix; the same case
  on `a6b89e924` recovered.
- Windows: one matrix retry returned `bridge-unavailable` (rejected, effect
  none) for a select, and the harness then failed on its own argument error.
  The cause of that `bridge-unavailable` is not determined.
- Both matrix scripts requested a story list limit above 100, which schema
  validation rejected; the reference-sequence runs used a limit of 100.

**Cleanup.** After each pass, no owned app, driver, channel, or Metro process
remained; ports 8081, 8082, 6006, 7007, 4723, 17202, 29419, and 39225 had no
listeners; no `interactive.lock` or default `agent-connection.json` remained;
and the grant was revoked. Pre-existing unrelated processes were left
running.

**Still Not run on Windows and Win32:** failed-cleanup claim retention, live
cleanup and restart, F4 readiness/render faults, F4 secondary windows, F3
survivors, F5 manifest smoke, and F5 legacy separation. Hosted CI disables
physical input, so physical input is not qualified there.

## Windows follow-up qualification - 2026-11-07 UTC

Source: `386f0585edae2450ab22e6d359e2fe4db3399555` with repairs to the
package-boundary loader, link-check worker, and atomic reporting. Native/runtime
implementation was unchanged. Same Windows 11 Enterprise build 26300, AMD64
host; Node 26.13.0. The earlier matrix and every failed attempt above remain
historical evidence, not erased by this follow-up.

The seven previously Not run rows were exercised. All other rows retain their
earlier outcomes: **Windows Fabric 21 Pass, 2 Partial, 1 Fail; Win32 Paper
21 Pass, 3 Partial; neither has a Not run row.** This is not all-pass native
qualification: launch-capable discovery and separately registered secondary
windows remain Partial on both; fresh-preview lost-context fencing remains
Partial on Win32; Windows physical input remains Failed. Permission preflight
and Win32 Metro reload remain Unsupported. Hosted physical-input skips do not
change those results.

| Follow-up case                 | Windows Fabric | Win32 Paper | Evidence                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | -------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Failed-cleanup claim retention | Pass           | Pass        | Injected failure before the exact owned channel stop dispatched. The claim stayed fenced with channel generation 2 unresolved; replacement was refused before acquiring resources.                                                                                                                                       |
| Live cleanup and restart       | Pass           | Pass        | Original recorded stop callbacks settled, exact resources exited, descriptors disappeared, then retained owners/claims were reconciled. Fresh descriptor discovery in a new service incarnation selected and reset with marker verification. Restart alone was not used as cleanup proof.                                |
| F4 readiness/render faults     | Pass           | Pass        | Held a real correlated ready for 1,500 ms after native render and delivered a stale correlation first. Selection settled only after the real message; old preview refs expired. A correlated render error returned unknown-effect quarantine and fenced later mutations.                                                 |
| F4 secondary windows           | Partial        | Partial     | `native-callout--default` reported `Native window: Shown`; selection back to Button cleaned up in the same session. Only the registered primary window was addressed; this does not prove selection of a separately registered secondary window.                                                                         |
| F3 startup/shutdown/survivors  | Pass           | Pass        | Startup failed after a real typed service-ready receipt, and shutdown failed before the owned stop. Exact channel/helper survivors were reconciled through the recorded stop; Metro generation 1 settled, channel generation 2 retained the failed claim until cleanup was proved.                                       |
| F5 manifest smoke              | Pass           | Pass        | Instrumented manifest-backed smoke used one traversal session per phase and confirmed its DELETE before the next phase/authored session. All driver sessions were paired with successful deletes, without overlapping sessions or controller HTTP fallback. Overall smoke/report failures are retained below separately. |
| F5 legacy separation           | Pass           | Pass        | Non-agent smoke traced unprotected `/select-story-sync` requests nested inside driver-owned story calls. This is the explicitly configured legacy transport, not fallback from the controller and not protected-ingress evidence. No descriptor or grant was used by this lane.                                          |

### Ownership failures and reconciliation

`yarn desktop-test --target windows|win32 --reporter json serve --agent`
acquired real Metro, channel, native helper, and private descriptor resources.
Local instrumentation failed `running.stop` **before** dispatch for only the
recorded `storybook-channel` resource; the startup variant also threw after
the actual correlated `service-ready` receipt. The lock recorded
`service:storybook-channel:2`, generation 2, `disposal: failed`, and an
unresolved disposal effect. A second identical `serve --agent` command failed
with the workload-held diagnostic. It did not replace or steal the service.

Calling the saved original stop callback then settled the exact channel and
helper. On the corrected startup runs and Win32 shutdown run, instrumentation
also recorded `authority.revoke` returning true; no grant identifier or token
was logged. The descriptor disappeared and ports 8081, 17202, and 39225 were
free. The supervisor retained its failed claim and remained alive; only after
that resource proof was its exact process stopped and its exact stale claim
removed. This operator reconciliation is not an automatic recovery claim.
External app incarnations survived throughout and were stopped separately
only after preservation was checked.

| Endpoint / phase                           | Run ID                                 | Terminal result                                                                                                   |
| ------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Windows first secondary/fault harness      | `9adb8cc6-b2de-4e12-b833-31314c03f111` | Passed supervisor; initial harness failures retained.                                                             |
| Windows Metro/native-launch attempt        | `d2c2d92a-c561-4f57-8d71-9109c53a04b6` | Failed; Metro watch ENOENT during native build activity, followed by exact settled-resource/owner reconciliation. |
| Windows failed shutdown                    | `ed3d74cb-769f-4e9f-9ca6-7f00772e98c5` | Failed as injected; exact original stop subsequently settled.                                                     |
| Windows correlated readiness/render faults | `949dde01-8fa9-46b3-b6ee-9e2082eb0b56` | Passed supervisor and corrected MCP fault probe.                                                                  |
| Windows first startup failure              | `d729b429-89bc-44c4-9b06-13d3a00e0de6` | Failed; the local control-file reader crashed on a partial JSON write before reconciliation.                      |
| Windows corrected startup failure          | `ea10eb32-ad0f-462d-8384-7d824357e5b2` | Failed as injected; original stop, grant revocation, and resource exit were observed.                             |
| Win32 failed shutdown and MCP faults       | `509c46ef-d6ee-47d6-9fc5-4f9c475faa8a` | Failed as injected; original stop, grant revocation, and resource exit were observed.                             |
| Win32 startup failure                      | `f831f9d8-7335-4b98-8dad-5e8b6dade5e1` | Failed as injected; exact survivor reconciliation completed.                                                      |
| Windows fresh-service recovery             | `5cad63bb-2e67-4033-a3ac-84ec44f5553d` | Passed; new MCP session selected and reset with verified markers.                                                 |
| Win32 fresh-service recovery               | `dd134838-ca66-415c-afdb-828510739ef3` | Passed; new MCP session selected and reset with verified markers.                                                 |

Every artifact is `apps/storybook/artifacts/desktop/<run-id>/run.json`.
Manual descriptor operations are not suite selections: these lifecycle runs
have zero selected/executed tests, not passing test counts. The new Windows
service-ready incarnation was `dd5b8e7c-cca3-4fb6-9bf5-b6838b270f97`, MCP
session `fbbdadc4-aa0e-45a9-9862-124052bc5e4e`; Win32 used incarnation
`28c0beaf-ffb2-4161-a230-3b9edabe1c1e`, session
`0245de0c-c004-4c76-865d-7458b62f999f`. Their normal shutdowns removed the
lock and descriptor, revoked authority, released all owned native resources
and ports, and preserved the attached app.

The crashed first Windows startup run was **not** graceful cleanup: its
service and owner exited, leaving a stale descriptor and claim. Exact
process absence, no helper/listeners, and matching dead descriptor ownership
were established before removing those two stale files. Service-local
authority was invalidated by process exit; explicit grant revocation was
not observed on that attempt. The corrected probe retained the last valid
control during a partial write and used atomic updates.

### Correlated render evidence and retained harness failures

Both corrected probes used a real SDK stdio MCP client, default descriptor,
verified native service, and one uninterrupted driver session at incarnation

1. Session regions were 1 -> 2 -> 3; runtime preview generation is a separate
   identity, reported below.

| Endpoint | MCP session                            | Preview / chrome refs | Window identity       | Runtime epoch; delayed/error generations      | Measured held-selection duration |
| -------- | -------------------------------------- | --------------------- | --------------------- | --------------------------------------------- | -------------------------------- |
| Windows  | `46a48bed-5f9c-40c6-aac7-c2929461d222` | `0yoo23` / `0yoo1`    | `window-4124f4f1-1be` | `7a4241eb-dc2c-4c9e-b6c5-bd7e7142ec74`; 2 / 3 | 1,637 ms                         |
| Win32    | `a29dc7af-c96f-4b0a-a98f-2eae04d7f8c1` | `oyno25` / `oyno1`    | `window-5d019501-11b` | `a8a10ef6-7935-43c5-b198-79f4ced043bf`; 5 / 6 | 1,618 ms                         |

The old preview returned `ref-region-changed` after the delayed transition.
The injected correlated error returned `story-not-ready`, indeterminate,
effect unknown, quarantined. Chrome remained present and a later reset was
rejected `target-quarantined`, effect none. Neither faulted tree exposed a
fresh preview root, so this stimulus's fresh-preview mutation subcase is
Partial, not additional fencing proof. Windows retains its earlier distinct
successful fresh-preview fence probe; Win32 remains Partial.

Secondary-window probes used Windows session
`0ad62612-8bc5-4f9f-98f3-f987f9d0b4fb`, window `window-42ae1e0b-4`,
status ref `1kos1`, and Win32 session
`2d5302b1-e602-40b3-8536-66fad0f7d4a2`, window `window-5d019501-2`,
status ref `k0kf1`. Each changed region 2 -> 3 when selecting Button again.

Retained harness failures are not product diagnoses: initially matching the
public request ID against the runtime's different internal ID did not inject
the fault; repeatedly using the same public request ID replayed a cached
effect-none `bridge-unavailable`; a stale-ref `check` returns a failed check
envelope rather than necessarily an MCP error; finding a fresh preview after
render failure did not succeed; opening a new session before quarantined-app
exit correctly failed. The corrected probe retried with a new ID only after
proven rejected/effect-none responses and never retried an ambiguous mutation.

Windows app run `1885a5a3-0ba3-4206-8f8d-7894e77dc68a` failed at rnx-cli
Developer Mode enabling (2406); no OS setting was changed. Later Windows
launches used the exact already registered AUMID. The earlier app run
`cc9cebaf-9029-4a05-b234-5aaa96121886` passed. Win32 app runs
`177d3c9d-cbee-4387-a5bf-7ed135cc6811` and
`727752b3-427a-40e7-8cec-0e33cbef32d9` report failed because their externally
started apps were deliberately stopped after preservation/cleanup proof.

### Instrumented smoke and atomic-report follow-up

These are separate, explicitly **unprotected** non-agent workloads, with
`FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES=keyboard,physicalClick,wheel`
matching hosted restrictions. They do not replace the physical-input result
or descriptor-path evidence. Counts are selected / executed / passed /
failed / skipped; all rows have zero unsupported, incomplete, retries, flaky,
and groups not run.

| Endpoint / attempt                      | Command                                                   | Result                                                                                                     | Run ID                                 |
| --------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Win32 instrumented                      | `yarn storybook smoke --win32 --mode stories-and-tests`   | Pass: 266 / 214 / 214 / 0 / 52.                                                                            | `670a4dea-adad-4082-b597-56160040fcf5` |
| Windows first instrumented              | `yarn storybook smoke --windows --mode stories-and-tests` | Fail overall: 312 / 234 / 234 / 0 / 78; nine `EPERM` atomic-report rename failures.                        | `5ac696da-3ea3-47dc-ad90-1d4bf1110377` |
| Windows retry without live report reads | Same Windows command                                      | Fail overall: 312 / 234 / 234 / 0 / 78; fifteen `EPERM` atomic-report rename failures.                     | `a67d9961-40c9-4118-95bc-0bc988599ab7` |
| Windows with bounded reporting recovery | Same Windows command                                      | Pass: 312 / 234 / 234 / 0 / 78; one replacement recovered after one sharing retry, journaled as a warning. | `1825d9aa-2c25-4a2c-8524-ceadcf52ad68` |
| Win32 with bounded reporting recovery   | Same Win32 command                                        | Pass: 266 / 214 / 214 / 0 / 52; no sharing retry needed.                                                   | `8c6f58e1-3591-4f1b-b008-c52a718d3ca2` |

Artifacts are `apps/storybook/artifacts/desktop/<run-id>/run.json`.
The first Windows attempt overlapped live PowerShell reads of the projection;
the retry did not, so those reads are not an established explanation. The
exact holder of the conflicting Windows file handle was not identified.
Atomic replacement failed transiently while later replacements succeeded;
the collector correctly retained those failures, making otherwise successful
test runs fail.

A deterministic real Windows reader opened `run.json` without delete sharing
for 100 ms. The pre-fix collector failed the regression; the corrected
collector passed. Only Windows `EPERM`/`EACCES` renames are retried, at most
ten times with 25 ms spacing, retaining the old complete snapshot. Recovery
is journaled, not silently discarded; persistent conflicts, other errors,
and non-Windows failures still fail reporting. Neither native mutation nor
producer-handshake retries were added. Tests cover both recovery and
permanent-failure retention.

Win32 paired all 91 session creates with successful deletes. Traversal
`797fabc1-6291-4f06-9a10-87486c48d2dd` made 176 story calls; readiness
traversal `ce2d8587-3357-4765-8174-75d5e7527868` made one, then was
deleted before the first authored session. Both Windows attempts paired 112
creates/deletes; their story-phase traversals were
`3b691f62-dc41-4aef-96ab-a05e3115a47e` (233 calls) and
`e423ef0d-4c3b-4357-bbae-8eeb7dbcfd09` (232 calls), respectively.
Their post-relaunch readiness traversals were
`b64ede17-91b3-40c1-9554-88bb38857359` and
`e1b4b77a-28de-4bb4-8c2d-331d0e0cc20f` (eight calls each).
Each was deleted before authored-test session acquisition, without
overlapping sessions. Readiness retries are not test retries.

All 266 Win32 and 313 Windows internal legacy selections per run were nested
inside exactly one driver-owned story call. There was no controller HTTP
fallback. The non-agent orchestrator intentionally uses the legacy transport;
the presence of those nested requests is not evidence of protected-ingress
bypass. After every attempt, no owned app/helper/channel/Metro or listener
remained, the workload lock and default descriptor were absent, and no
external app was terminated.

The fixed Windows run again paired 112 creates/deletes: traversal
`beb044e6-d9c5-4ee4-bf77-57febd117123` made 233 calls, and readiness
traversal `690c6ae8-1bfd-49bb-8f7e-fa6253249a4e` made eight. The fixed
Win32 run paired 91 creates/deletes: traversal
`dccddd56-608c-4ad5-bdda-3aa4a0e2e753` made 176 calls, and readiness
traversal `c7233695-703d-4f70-ba6b-83d9d53bf1ba` made one. Both again
deleted the readiness traversal before acquiring an authored-test session.
Terminal reports have no failures. The Windows journal preserves its one
recovered write; this is reporting recovery, not a test or mutation retry.
After both fixed runs the exact owned processes were absent, all relevant
ports were free, and the per-user workload claim and default private
descriptor were absent. These non-agent lanes issued no descriptor grant.

A full desktop-test package test attempt during the Windows smoke failed
the `agent-cli` serve fixture (96 passed, four skipped, one failed).
It also acquires a workload; overlapping it was a qualification scheduling
error. Contention is a plausible explanation, but the retained child output
does not establish the cause. The attempt remains recorded separately from
the subsequent serial validation.

After both native workloads and their cleanup finished, `yarn test` passed
serially in desktop-test (97 passed, four skipped), desktop-driver
(813 passed, 72 skipped), desktop-driver-mcp (26 passed), and scripts
(76 passed). The desktop-test `agent-cli` fixture passed without a live
smoke workload; no product behavior was changed to suppress that failure.

## Windows application ownership and foreground follow-up - 2026-11-08 UTC

Source: `9d3e11516` (F16, stacked on
[#4468](https://github.com/microsoft/fluentui-react-native/pull/4468)) plus
the Windows application-ownership (F10-W,
[#4447](https://github.com/microsoft/fluentui-react-native/issues/4447)) and
foreground-diagnosis
([#4441](https://github.com/microsoft/fluentui-react-native/issues/4441))
helper changes. Same Windows 11 Enterprise build 26300, AMD64 host; Node
26.13.0. The console session was **disconnected** (RDP, `LogonUI` in the
session) for the launch and measurement cases below. Foreground, physical input,
Windows Graphics Capture, and retention require separate connected-session
evidence.

**Updated matrix: Windows Fabric 22 Pass, 1 Partial, 1 Fail; Win32 Paper
22 Pass, 2 Partial.** Launch-capable discovery moves from Partial to Pass on
both endpoints. Separately registered secondary windows (both), Win32
fresh-preview fencing, and Windows physical input keep their earlier results;
they need a connected, unlocked session.

| Case                      | Windows Fabric                                                                                                                                                                                                                  | Win32 Paper                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Launch-capable discovery  | Pass. `desktop_session` status listed `launchModes: ['launch']`; `open` launched the packaged app in 341 ms and `close` ended `ReactApp.exe`. Run `0876d93b-f689-47e5-8379-4c09d95d6cc9`.                                       | Pass. REX FluentTester (`apps/win32`) listed `['launch']`; `open` launched in 625 ms and `close` ended `ReactTest.exe`. Run `101c5916-027d-40cf-a26a-163535df4c03`. |
| Attach-only refusal       | Unchanged: Storybook targets are always attach-only and advertise only `attach`.                                                                                                                                                | Pass: the Storybook Win32 target refused `launch` before acquiring resources (run `411c5218`).                                                                      |
| Helper death after launch | Expected `uncontained`: killing the helper left the packaged `ReactApp.exe` running. The claim was fenced (`webdriver` disposal failed, one unresolved effect). The survivor was ended manually after its identity was checked. | Pass, `job-object`: killing the helper ended `ReactTest.exe` within 5 s. The claim was fenced the same way.                                                         |
| Agent MCP measurements    | Recorded in the adapter's status reference (run `caba9e12-d9da-42a0-8b06-7300940e8318`).                                                                                                                                        | Recorded there (run `5f75aac2-d74c-4969-aba3-bd8c925d5725`).                                                                                                        |

The launch-capable targets are not Storybook targets. Win32 used
`apps/win32/desktop.config.mts`. Windows used a temporary, uncommitted
`installed` host naming the registered Storybook package AUMID; the
committed Storybook targets are attach-only. Each probe used the SDK stdio
client and the default descriptor. In both crash variants the service exited
with code 1 and wrote a failed `run.json` naming the helper's unexpected
exit. Neither the claim nor the settlement journal names the surviving
uncontained application, because the journal records applications only for
mutations and quarantines. Recording a launched application as a claim
resource belongs to F11's retained-application handoff
([#4448](https://github.com/microsoft/fluentui-react-native/issues/4448)).

**Native contracts.** With `FURN_NATIVE_DRIVER_TEST=1`, `nativeDriver`
passed. While the session was still connected, `win32Fixture` passed 17 with
2 skipped, before review fixes. While disconnected, the three new
containment cases passed, but window capture and the 500-cycle retention
case failed. The retention case grew from 316 to 1,516 retained elements,
exactly three per cycle. A control run of the same case on the unchanged
helper failed identically while disconnected. After reconnection,
`FURN_NATIVE_DRIVER_TEST=1 yarn test win32Fixture --runInBand` passed all
11 cases, including capture and retention: retained elements stayed at 20
from cycle 100 through cycle 500.

**`serve --agent` interrupt.** Interrupting a Storybook `serve --agent` with
a console Ctrl+C three times (Win32 runs `411c5218` and `5f75aac2`, Windows
run `caba9e12`) settled every owned
resource. Metro, the channel, the helper, and the descriptor were gone, and
the ports were free. The claim then stayed `active` with no unsettled
resource or unresolved effect, `run.json` stayed `incomplete`, and the CLI
process stayed idle without exiting. Each time, the exact owner was ended
only after that proof, and then its stale claim was removed. The physical
console Ctrl+C case is otherwise out of scope for this pass.

The idle CLI had one cause on every platform: the CLI tracked the Storybook
integration's run in the service scope it lent to that run, and the run closed
the scope, so closing waited on itself. On macOS, a Storybook-integration
`serve` was still running 90 seconds after SIGINT, with its claim `active`.
Integrations now leave the borrowed scope to the CLI, the CLI waits for the run
outside the scope with a bound, and scope draining is bounded. With that fix the
same macOS `serve` exits promptly after SIGINT and leaves no owned process or
claim. A physical console Ctrl+C on Windows and Win32 still needs requalification.

**Reconciled claims.** Every stale or fenced claim in this pass was removed
by hand only after its owner was proved dead and its resources were proved
settled, or after the fenced launch probe's survivor was ended. Nothing
reclaims a claim automatically.

## Connected Windows physical-input follow-up - 2026-11-08 UTC

Source `fec94cec4995c7372b798877c5412ddcb156523b`; Windows 11 Enterprise
build 26300, AMD64, Node 26.13.0. With the console connected, the following
separate, non-agent smokes ran from `apps/storybook` with
`yarn storybook smoke --<endpoint> --mode stories-and-tests --input physical
--reporter json` and `STORYBOOK_SMOKE_STORY` set to the listed story.
Each had zero failures, skips, unsupported cases, incomplete work, retries,
or flaky cases. The totals include navigation work, not just authored tests.

| Endpoint       | Story and authored assertion                                      | Selected / executed / passed | Physical-click receipts | Run ID                                 |
| -------------- | ----------------------------------------------------------------- | ---------------------------- | ----------------------- | -------------------------------------- |
| Windows Fabric | `components-checkbox--default`: unchecked -> checked -> unchecked | 203 / 203 / 203              | 2                       | `ef1ed966-3be3-4cc1-b940-ac0afbb02155` |
| Win32 Paper    | `components-checkbox--default`: unchecked -> checked -> unchecked | 177 / 177 / 177              | 2                       | `54e6a815-21a4-418c-bfda-848e28549ffe` |
| Windows Fabric | `native-callout--default`: open, light-dismiss, recreate          | 203 / 203 / 203              | 3                       | `1e521138-f529-45a1-974e-74f90edd42ac` |
| Win32 Paper    | `native-callout--default`: open, light-dismiss, recreate          | 177 / 177 / 177              | 3                       | `44d9dd17-7132-4ebd-8b1e-18fa923ee355` |

Artifacts are `apps/storybook/artifacts/desktop/<run-id>/run.json`. The
Windows totals contain 202 navigation cases and one authored case; Win32
contains 176 and one. Popup interaction does not establish F4's separately
registered Storybook secondary-window identity.

The connected native fixture contract passed 11 tests under the per-user
claim; its retained-element counts were 20 and 23 at cycles 100 and 500.
The separate generic fixture probe passed exact secondary-handle switching
and minimized-capture refusal as described in the driver status reference.
Windows `doctor --permissions` remains Unsupported.

The real MCP descriptor path independently passed physical checkbox
transitions and target capture on both endpoints. Standalone agent driver
runs `af97fdb3-68de-4ce9-836e-935331528c8e` (Windows) and
`3294d66d-9332-4639-95fe-8d3047f47e46` (Win32) each ended with a
terminal passed lifecycle report and zero selected tests; the manual MCP
operations are not suite selections. The first Windows probe exhausted its
30 safe `bridge-unavailable`/effect-none attempts while the cold Metro bundle
was still building; the later probe passed after the app connected.

After MCP session close, Windows accepted an exact-app window close. On
Win32 the window closed but its exact REX process remained; it was stopped
only after identity verification. Both deliberately stopped Win32 app runs,
`665e6e85-f0ce-4612-a34d-f140d2bab433` and
`fc71d8fd-ffa4-464e-96ea-616d88d49e0e`, report failed, not graceful cleanup.
The standalone drivers were stopped by a session-local injected SIGTERM,
not physical Ctrl+C. Both owned app/service processes exited, the recorded
ports were free, and the per-user claim and default descriptor were absent.
The separate `serve --agent` interrupt limitation above is fixed but not yet
requalified on Windows.

## F6 generated manifest provenance — 2026-11-12

Implementation source: `efd6dadeda87344911fb4000fe293c686c678602`, with
resolved-case compatibility in `fa0681635` and the awaited shared workload
claim in `a5de740f01ca025bf548a923ae4561b36fc9872b`.
Generated driver manifests are strict version 3 and contain no secrets.
Version-1 private credentials use independent bridge and application attachment
nonces. The owner-private runtime module contains only bridge data and a
data-only `export default` statement. The parent's independent handoff pins
manifest/credential/runtime hashes and the resolved helper; the actual channel
child validates that binding and re-verifies the executable before a helper
can spawn. Metro receives the canonical schema locator from trusted process
configuration, not from editable generated files. Channel lifecycle placement
and application lease ownership have not moved.

Review fixes route Windows/Win32 smoke lease publication, replacement, and
cleanup through the trusted Node helper and OS private-storage adapter;
PowerShell receives only a digest receipt. Smoke control now uses the strict
shared version-3 parser. Publication resolves the existing generated directory
once before opening private storage, supporting symlinked projects and macOS
`/var` aliases while retaining later fail-closed ancestor validation and
actionable diagnostics.

**Portable/local boundary checks:** the initial 364-test integration result
used a project-local temporary directory and did not qualify stock macOS
temporary paths. Review exposed that gap; those counts are superseded by the
default-`TMPDIR` review validation below. Runtime format, lint, build, and all
33 tests pass with the default temporary directory. The driver package passed
format, lint, build, and 1,221 portable tests with 66 skips; focused private
storage tests passed 65 with ten platform skips.
The reviewed integration package passes format, lint, build, and 379 tests
with four Windows-only skips. Its focused generated-manifest, lease, and real
WDIO-runner contract selection passed 38 tests, including the actual v3 smoke
control path. The ledger-owning harness passes format, lint, build, and
380 tests with one skip; its claim-sensitive tests ran under the shared lock.
These review runs used the default macOS `TMPDIR`, without an override.
The channel-child rejection fixture now canonicalizes its temporary parent
too, ensuring it reaches helper/hash refusal instead of an alias-path error.
Evidence: `apps/storybook/artifacts/f6/review-{driver-focused,driver-test,integration-focused,integration-final,runtime,harness}.log`.
Controlled Metro fixtures cover missing trust inputs, unknown fields, and
manifest/runtime tampering. Actual channel-child fixtures reject substituted
helper path/hash, helper bytes, and unknown fields before listening or spawning.
The real macOS private-storage adapter round-trips the records with directory
mode `0700` and file mode `0600` and rejects a permissive credential mode.

**Pre-review native helper checks:** on macOS 27.2.1 arm64, the locked
`FURN_NATIVE_DRIVER_TEST=1 yarn workspace
@fluentui-react-native/desktop-driver test --runInBand` run passed 1,240 tests;
47 platform/capability tests were skipped (75 suites passed, six skipped).
Evidence: `apps/storybook/artifacts/f6/native-contract.log`. The explicitly
built helper uses the stable `FURN Desktop Driver Development` identity;
`doctor --platform macos --permissions` reported ready, unlocked/on-console,
and Screen Recording preflight true, but Accessibility and PostEvent preflight
false. No permission prompts, privacy changes, or TCC resets were requested.
The native consumer runs below must not be interpreted as passed from that
helper readiness result.

**Native consumer preparation:** Fabric bundle passed
(`apps/storybook/artifacts/f6/bundle-fabric.log`). Initial Fabric prep failed
because CocoaPods called `JSON.fast_generate` after Ruby selected JSON 3.1.
Selecting the already installed JSON 2.18 through a worktree-local Ruby
preload, without installing or modifying shared tools, made prep pass
(`prep-fabric-json2.log`, run `8df5c79a-9618-423d-b65d-e9828644a75b`).
The first Fabric smoke exposed rejection of the extractor's legitimate
resolved `inputSource` metadata; `fa0681635` fixes it and adds declared/derived
descriptor regressions while preserving unknown-field refusal.

**Fabric native consumer: blocked, not passed.** The corrected smoke built and
launched the app, started the verified channel, and reached authenticated
bridge epoch recording. Native attach then reported Accessibility
`apiDisabled` (`-25211`), and session creation failed because the target exposed
no supported click input mode. No stories or tests executed.
Evidence: `apps/storybook/artifacts/f6/smoke-fabric-resolved-options.log` and
`apps/storybook/artifacts/desktop/65fb216f-89ee-43db-86a6-333b3d91331e/run.json`.
The harness's AppleEvent cleanup also timed out (`-1712`); its leftover app
process was verified against this worktree's executable, terminated by that
exact PID only, and confirmed gone. No privacy workaround was attempted.

**Paper native consumer: blocked, not passed.** Paper bundle and prep passed
with the same existing-JSON-2 selection (`bundle-paper.log`, run
`3c281fb3-eb3a-4125-a189-86ced929d6ad`; `prep-paper.log`, run
`9b575663-fa72-4625-9f09-b745bfa1e83e`). Paper smoke also built and launched
the app and reached bridge epoch recording, then failed on Accessibility
`apiDisabled` and no supported click input mode. Zero tests executed.
Evidence: `apps/storybook/artifacts/f6/smoke-paper.log` and
`apps/storybook/artifacts/desktop/cfab6e50-9b38-45d3-b114-05b3ea995037/run.json`.
Its AppleEvent cleanup timed out as well; the exact worktree-owned leftover
app PID was verified, terminated, and confirmed gone. Positive Fabric/Paper
traversal and authored-case qualification remain pending an authorized
Accessibility/PostEvent-capable host.

**Reviewed repository checks:** source `ffb4944db` passed all 90
`yarn lage test-links --verbose --grouped` tasks. After `yarn clean-lage-cache`,
the locked `TF_BUILD=1 yarn lage buildci --concurrency 4` passed all 178 tasks
with the default macOS `TMPDIR`. The existing test wrapper uses `TF_BUILD`
only to run Jest in-band; it does not skip agentic tests. Evidence:
`apps/storybook/artifacts/f6/review-links.log` and `review-buildci.log`.
The Accessibility-blocked macOS consumer smoke was not repeated for review.

**First PR CI follow-up (2026-11-12):** run `43145388693` on
`2739349a3` exposed five Linux CLI fixture failures and both Win32 smoke
lanes refusing private storage before any stories ran. The Linux cause is
confirmed: the command factory dropped the injected `createPrivateStorage`
adapter. It now forwards that option, and platform selection explicitly
supports macOS/Windows while other production credential paths fail closed.
Portable contracts inject storage and simulate all three platform branches.

The Win32 logs retained only the generic unsafe-storage message, not the
adapter's non-enumerable refusal reason; the exact native refusal category
cannot be recovered from that evidence. Native inspection confirms that the
workspace root was checked before creation and ancestor grants allowing
untrusted child replacement are refused. Unsafe hosted-workspace ancestry
is therefore an inferred cause, not a confirmed refusal category.
Windows publication now asks the verified helper for its OS-selected per-user
known-folder root and opens a deterministic, independently protected child
namespace for the canonical generated directory. Reading rederives that
namespace only after verifying the parent handoff and helper. No environment
path, editable manifest root, relaxed ACL, or root repair chooses authority.
Storybook now surfaces the bounded native refusal token. Metro retains its
workspace roots and also watches the pinned private runtime projection
outside the workspace.

The separate Windows setup job failed four native build/handshake/UIA
timeout cases, but its existing Windows private-storage native contracts
passed. This branch does not change Windows helper build, resolution,
handshake, C++, UIA, or fixture code; setup runs before Storybook publication.
Runner flakiness is an inference, not a confirmed explanation. The next
same-branch CI run must establish the result; timeouts were not increased.

**CI-fix portable validation (default `TMPDIR`):** driver format/lint/build/test
passed (1,222 tests; 66 skipped); Storybook integration passed (386; 4 skipped);
runtime passed (34). The new contracts cover OS dispatch, helper-selected
project isolation, trust-before-helper ordering, changed-root and tamper
refusal, protected child calls, and outside-workspace Metro resolution.
Evidence: `apps/storybook/artifacts/f6/ci-fix-{driver,integration,runtime}.log`.
These simulated-platform results are not Windows ACL qualification.

**Windows/Win32 qualification: pending, not sufficient yet.** Native execution
is unavailable on this Mac, and `pwsh` is not installed, so PowerShell parser
validation was not run. The first CI run confirms that Win32 Paper smoke
reaches the changed protected-storage path, but it does not qualify the
revised namespace or Windows Fabric flow. A passing same-branch run must demonstrate
version-3 smoke control, trusted helper verification, protected-DACL lease
publication/replacement/cleanup, private runtime resolution, and live bridge
authentication. Portable negative fixtures do not qualify Windows ACL
behavior. Keep the PR draft until that coverage is observed.
