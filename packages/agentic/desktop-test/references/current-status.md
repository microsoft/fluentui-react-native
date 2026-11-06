---
id: desktop-test.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Current lifecycle and qualification status

**Work in progress, updated 2026-11-06.** Done means the listed implementation,
not full cross-platform qualification. This package is the intended neutral
workload host; the existing Storybook lifecycle takeover is transitional.
No new coordinator package, daemon, dynamic plugin loader, or package rename
is required now. Follow-up work is tracked in
[desktop driver improvements (#4435)](https://github.com/microsoft/fluentui-react-native/issues/4435)
and its sub-issues.

## Capability matrix

| Capability                                               | State              | Limit or next gate                                                                                                                                                                                                                                                |
| -------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App/suite configuration and standalone installed-app use | Done               | Storybook is optional; runtime boundary and standalone-consumer contracts reject React, React Native, and Storybook imports/dependencies. Executable config is trusted operator code, not a sandbox.                                                              |
| Native service and helper composition                    | Done               | Generic supervisor and supervised Storybook child use the same real `driverService` factory, helper policy, authority and settled close.                                                                                                                          |
| Standalone WDIO/Jasmine execution                        | Done               | WDIO owns its session. Storybook CSF callbacks use a runner-owned session borrowed by a Node worker.                                                                                                                                                              |
| Required services, reporting, structured results         | Done               | One collector; bounded JSON/NDJSON summaries. Service-ready is not app/context-ready.                                                                                                                                                                             |
| `serve --agent` descriptor publication                   | Done               | Protects driver routes; no automatic build/launch from MCP. Normal WDIO cannot use the agent-served path yet.                                                                                                                                                     |
| Cleanup failure fence                                    | Done, conservative | Failed or timed-out disposal retains the claim with an exact resource generation and unresolved effect; manual inspection is required. No automatic reclaim.                                                                                                      |
| Complete lifecycle settlement                            | Done, conservative | Guarded work settles before successful close; late acquisitions are disposed; required-service failures stop dependants; owned resources dispose in reverse order.                                                                                                |
| Typed generic resource contributions                     | Done               | Static contribution plans validate IDs/dependencies and record readiness, generation, identity, ownership, and settled disposal through public `resources` and `ownership` subpaths.                                                                              |
| Durable quarantine wiring                                | Done               | Both native service paths use owner-only storage and exact-incarnation probes; restart is not recovery proof. Live endpoint qualification remains separate.                                                                                                       |
| Supervisor crash containment                             | Work in progress   | Cooperative Node service lifelines and correlated service readiness implemented; portable parent/wrapper crash, late-spawn, failed-withdrawal and stalled-child contracts. Live macOS survivors and Windows containment remain unqualified; no automatic reclaim. |
| Storybook resource contributions                         | Work in progress   | Current integration substitutes its CLI lifecycle; retain the channel/driver child until relocation is justified and qualified.                                                                                                                                   |
| MCP/WDIO handoff                                         | Work in progress   | Must await drain/deletion; attached-app handoff is independent of future supervisor-owned launch.                                                                                                                                                                 |
| Supervisor-owned app lifetime                            | Work in progress   | Current session-owned launch/externally owned attach semantics remain; never silently retain or terminate another owner's app.                                                                                                                                    |
| Cross-service/multi-target claims                        | Work in progress   | Configured aliases now have distinct registered IDs while retaining physical identity; exact-application exclusion and input-mutex qualification remain open.                                                                                                     |
| Bounded persisted run/status/artifact queries            | Done               | Harness-local read service/client; atomic snapshots, terminal evidence, scoped expiring grants, bounded pages and allowlisted opaque artifact IDs. No management transport.                                                                                       |
| Workload management/control API                          | Work in progress   | Future management selects only declared workload IDs, not commands/paths/environment; lifecycle/handoff gates still apply.                                                                                                                                        |
| Automatic service reuse and per-user daemon              | Deferred           | Requires exact identity/config matching and evidence of need. Never adopt an unknown port occupant.                                                                                                                                                               |

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

| Area            | Remaining evidence/work                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| macOS           | Live failed-cleanup and service-restart cases; Paper separately; supervisor death with Metro/channel/helper survivors; exact attached-app preservation.         |
| Windows / Win32 | Same-branch MCP restart/revocation/dispose/args tests; physical console Ctrl+C; interactive input/capture rerun; process-tree containment and ownership checks. |
| Storybook       | Authenticated mutation ingress, context fencing/reconnect, consistent helper build policy, manifest provenance and separate nonces.                             |
| Recovery        | Durable uncertainty is wired in both paths; live restart qualification, ledger and exact-resource reconciliation still precede automatic reclaim.               |
| Concurrency     | No physical-input suites in parallel on one interactive desktop. Separate machines may qualify independent endpoints.                                           |
| Reliability     | Establish the required repeated-run window rather than interpreting aggregate past successes as a pass.                                                         |

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
ledger and its inconclusive probe remain unchanged and separate.
