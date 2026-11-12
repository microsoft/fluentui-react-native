---
id: desktop-test.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Current lifecycle and qualification status

**Work in progress, updated 2026-11-12.** Done means the listed implementation,
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
| Supervisor-owned app lifetime                            | Work in progress   | Opt-in macOS supervisor launch, neutral exact attach, causal ownership and application claim resources are implemented. Session-owned launch remains the default; external attach never transfers ownership. Signed AppKit supervisor/session lifetime, exact cleanup and external preservation passed on 2026-11-12. Renderer evidence is scoped below; descendants, interrupted native publication and Storybook lifecycle relocation remain gates.                                                                                                               |
| Cross-service/multi-target claims                        | Work in progress   | Configured aliases retain physical identity. Exact macOS application exclusion, lease release and the physical-input mutex passed signed AppKit contracts on 2026-11-12. Renderer evidence is scoped below; cross-platform and broader lifecycle qualification remains open.                                                                                                                                                                                                                                                                                        |
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

| Area            | Remaining evidence/work                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| macOS           | Signed AppKit and separate Fabric/Paper positive lifecycle, inspection, exclusion and exact primary cleanup passed on 2026-11-12. Rebased native contracts also pass interrupted acquisition publication, owner death with native app/known-descendant survivors, retained claim fences and exact operator cleanup. Arbitrary descendants, Metro/channel survivors, automatic recovery and repeated-run reliability remain unqualified. |
| Windows / Win32 | Same-branch MCP restart/revocation/dispose/args tests; physical console Ctrl+C requalification of `serve --agent`; interactive input/capture rerun. Generic launched-application claim fields and durable survivor contracts are implemented; live uncontained packaged-survivor journaling/recovery remains not run for this change.                                                                                                   |
| Storybook       | Authenticated mutation ingress, context fencing/reconnect, consistent helper build policy. F6 strict provenance and independent nonces are qualified by same-branch Windows Fabric and both Win32 Paper lanes in run 43156299266; see the F6 evidence below for scope and limits.                                                                                                                                                       |
| Recovery        | Durable uncertainty is wired in both paths; live restart qualification, ledger and exact-resource reconciliation still precede automatic reclaim. Claim schema 3 records the driver's OS start identity; schema 2 and unverified claims inspect as unknown. LIFE-8's clock-estimate mismatch is fixed; LIFE-9's existing stable per-user claim root has a TMPDIR regression contract. Automatic reclaim remains unsupported.            |
| Concurrency     | No physical-input suites in parallel on one interactive desktop. Separate machines may qualify independent endpoints.                                                                                                                                                                                                                                                                                                                   |
| Reliability     | Establish the required repeated-run window rather than interpreting aggregate past successes as a pass.                                                                                                                                                                                                                                                                                                                                 |

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
workspace roots; this initial fix also watched the private runtime projection,
which the subsequent CI run exposed as incompatible with cross-volume Windows
workspaces.

The separate Windows setup job failed four native build/handshake/UIA
timeout cases, but its existing Windows private-storage native contracts
passed. This branch does not change Windows helper build, resolution,
handshake, C++, UIA, or fixture code; setup runs before Storybook publication.
Runner flakiness is an inference, not a confirmed explanation. The next
same-branch CI run passed setup, supporting that inference; no timeout or
native-helper behavior was changed.

**CI-fix portable validation (default `TMPDIR`):** driver format/lint/build/test
passed (1,222 tests; 66 skipped); Storybook integration passed (386; 4 skipped);
runtime passed (34). The new contracts cover OS dispatch, helper-selected
project isolation, trust-before-helper ordering, changed-root and tamper
refusal, protected child calls, and outside-workspace Metro resolution.
Evidence: `apps/storybook/artifacts/f6/ci-fix-{driver,integration,runtime}.log`.
These simulated-platform results are not Windows ACL qualification.

**CI-fix repository validation:** source `17032203b` passed all 178
`TF_BUILD=1 yarn lage buildci --concurrency 4` tasks after
`yarn clean-lage-cache`; both commands held the shared native lock and used
the default `TMPDIR`. Links passed all 90 tasks. Repository lint, instruction,
changeset, and whitespace checks passed. Evidence:
`apps/storybook/artifacts/f6/ci-fix-buildci.log` and `ci-fix-links.log`.
The Accessibility-blocked macOS consumer smoke was not repeated.

**Second PR CI follow-up:** run `43150784347` on `ca27c1b0b` passed JS PR,
all macOS lanes, Windows/Win32 PR, and Windows native-helper setup. All three
Windows Fabric / Win32 Paper Storybook lanes opened the revised protected
per-user namespace, then failed before smoke during Metro bundling. The
workspace was on `D:` and private projection on `C:`; Metro's relative-path
file map recombined the absolute cross-volume result into `D:\C:\...`.
This confirms the new namespace works on the hosted runner, not that the
consumer flow is qualified.

The bridge projection contains the bridge nonce, so it remains protected.
Windows/Win32 Metro now indexes only the constant workspace stub and supplies
the pinned private buffer through its supported custom-transformer hook,
delegating compilation/minification to the consumer's original worker. The
worker rechecks the digest, and its cache key binds that digest to avoid
stale nonce transforms. No cross-volume private watch folder or public
generated source copy is created. macOS private-path behavior is unchanged.
Windows namespace/path comparisons normalize drive letters, casing, and
separators without replacing the independent byte-digest trust checks.

**Cross-volume portable evidence:** controlled fixtures cover a `C:` private
source with a `D:` workspace, case/drive aliases, a wrongly located stub,
unchanged watch roots, digest tampering, nonce cache invalidation, and
unrelated-module delegation. The actual consumer Metro worker/Babel/minifier
also compiled both Windows targets. A bounded full Metro file-map/worker-farm
fixture built minified Windows and Win32 bundles with the private source
explicitly excluded from the file map. These JavaScript checks are not native
Windows qualification. Evidence:
`apps/storybook/artifacts/f6/crossdrive-real-worker.log` and
`crossdrive-real-bundle-final.log`.

**Cross-volume package validation (default `TMPDIR`):** format/lint/build/test
passed for the driver (1,222 tests; 66 skipped), Storybook integration
(387; 4 skipped), and runtime (37). The final transformer cache-key change
also passed the 11 controlled Metro cases. Knip now explicitly includes the
Metro config/worker entrypoints; repository lint, instruction integrity,
changesets, whitespace, and all 90 link tasks passed. Evidence:
`apps/storybook/artifacts/f6/crossdrive-{desktop-driver,storybook-desktop,storybook-desktop-runtime}.log`,
`crossdrive-final-format.log`, `crossdrive-repo-checks.log`, and
`crossdrive-repo-safeguards.log`.

**Cross-volume repository validation:** source `e760a36de` passed all 178
`TF_BUILD=1 yarn lage buildci --concurrency 4` tasks after
`yarn clean-lage-cache`. Both commands held the shared native lock and used
the default `TMPDIR`; no native smoke or privacy-setting change was repeated.
Evidence: `apps/storybook/artifacts/f6/crossdrive-buildci.log`.

**Windows/Win32 qualification: sufficient for F6's changed paths.**
[Run 43156299266](https://github.com/microsoft/fluentui-react-native/actions/runs/43156299266)
passed on source `58ec7ab4fb7ce6e449d0e351ecb02352bf88f319` on
2026-11-12. Full job logs and the uploaded terminal `run.json` reports agree:

| Lane / job                                                                                                                               | Full story index rendered | Authored tests                        | Aggregate                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------- | ---------------------------------------------------- |
| Windows Fabric accessible / [130976919836](https://github.com/microsoft/fluentui-react-native/actions/runs/43156299266/job/130976919836) | 215/215                   | 40/40 passed                          | 255 selected, executed, and passed                   |
| Win32 Paper accessible / [130976919943](https://github.com/microsoft/fluentui-react-native/actions/runs/43156299266/job/130976919943)    | 188/188                   | 45/45 passed                          | 233 selected, executed, and passed                   |
| Win32 Paper physical / [130976920038](https://github.com/microsoft/fluentui-react-native/actions/runs/43156299266/job/130976920038)      | 188/188                   | 100 passed; 1 quarantined unsupported | 289 selected; 288 executed and passed; 1 unsupported |

All three reports have zero failed, skipped, incomplete, retried, or flaky
tests and zero groups not run. Each navigation result has a distinct story
ID and passed; the render totals match the complete runtime index, not an
early-stop subset. The physical lane's existing #4373 quarantine is not a
pass or an F6 failure.

The five required paths are exercised in **each** lane. The successful
guarded execution establishes the mandatory checks below; these checks do
not emit separate success messages or upload secret records:

1. **Version-3 control:**
   `packages/agentic/storybook-desktop/config/storybook-control.cjs` uses the strict shared
   generated-contract parser before driver traversal and authored tests.
   The rendered-story and authored-test results above therefore cross the
   v3 gate in all three lanes.
2. **Trusted helper verification:** each log records native Storybook/WebDriver
   readiness before traversal. The channel child's
   `packages/agentic/storybook-desktop/config/server.cjs`
   requires the inherited parent handoff and awaits `readDriverManifest`,
   which checks its independent byte/helper binding and calls
   `verifyNativeDriverArtifact` before opening Windows private storage or
   starting the native service. Readiness plus completed native traversal
   demonstrates this guarded spawn path, not merely parent-side resolution.
3. **Protected-DACL lease lifecycle:** both PowerShell scripts require a
   successful trusted Node publication and digest receipt before control,
   and propagate lease-helper cleanup failures. Successful script completion
   exercises publication, native consumption, and receipt-checked cleanup in
   all lanes. Windows Fabric additionally stops/relaunches the app between
   its stories/tests phases and replaces the lease using the prior receipt;
   the Win32 lanes use one app incarnation. The Windows job also passed the
   real NTFS `privateStorage.contract.test.ts` (log line 436), including
   exclusive publication/removal and refusal of permissive root/record ACLs,
   junctions, hard links, and replaced roots. This is native boundary
   evidence, not portable mock coverage or an independent post-run ACL dump.
4. **Private runtime resolution:** all three logs finish writing the minified
   Windows/Win32 bundle before native startup. On these hosted runners the
   workspace is on `D:` and the protected per-user projection is on `C:`.
   The Windows runtime transformer must read and hash-check that private
   buffer before delegating the workspace stub to Metro's original worker;
   the subsequent authenticated render confirms the resulting bundle works.
5. **Live bridge authentication:** successful native story selections require
   `StorybookChannelOrchestrator.acceptHello` to match the nonce, instance,
   endpoint, target, manifest digest, and connection epoch, followed by
   correlated render-ready responses. The 215/188/188 successful selections
   prove live authenticated runtime traffic, not just a listening server.

**Evidence locators:** the Windows full log records bundle completion at
line 655, native readiness at 669-670, all stories at 709, authored tests at
1230, and terminal totals at 2295. Win32 accessible uses lines 502,
508-511, 1097, and 1118; Win32 physical uses 499, 505-508, 1809, and 1845.
The three artifacts are `Storybook_windows_fabric_43156299266_1`
(13916946307), `Storybook_win32_paper_accessible_43156299266_1`
(13917010025), and `Storybook_win32_paper_physical_43156299266_1`
(13916318019). Their main smoke reports under `apps/storybook/artifacts/desktop`
are respectively `414aa6f1-a539-4d67-9aa4-a92db05b58a4/run.json`,
`00cae5a0-ef44-45cf-aaa9-68485ecf2403/run.json`, and
`e5767c29-e4b1-4a9b-9685-8cdf8e0d3ee1/run.json`. Full logs, inventory,
and extracted reports are retained locally under ignored
`apps/storybook/artifacts/f6/ci-43156299266/`.

**Limits:** collected channel stderr includes non-terminal
`bridge-unavailable` navigation diagnostics on Windows and an authenticated
epoch `lease-invalid` diagnostic on Win32 physical. Do not infer their
original timing from the buffered output, diagnostic-free operation, or
general bridge-recovery qualification from the terminal passes. The local
macOS Accessibility block above remains unchanged; no local smoke was
repeated. `pwsh` is unavailable locally, so its parser check remains not run;
the actual scripts executed in these CI lanes. Keep the PR draft until the
documentation follow-up's CI passes and the coordinator changes its status.

## 2026-11-12: F10-M neutral application ownership

Implementation source:
`76a2be59abfde3a7bcb0abd8d86a2052e7378274`.
Host: macOS 27.2.1, arm64, isolated signed AppKit fixture; no React renderer.
The helper used the stable `FURN Desktop Driver Development` identity,
artifact `73d2e52b2ad9fbd51410301399f3b784a2d17ae8c2b34ebb12b36cd9b41626a1`,
source digest `b0e40122cc2226ffa65486677af7ba2495e1138cbc2c7e70af22fd36671e796f`.
Evidence records the exact source revision and the three documentation-only
working-tree changes present during the run.

The neutral `application-ownership` public entry provides exact macOS attach
identity and opt-in supervisor-owned launch; session launch stays the default.
Attached apps remain external. Both macOS launch kinds are explicitly
uncontained: LaunchServices causal ownership is not direct-child containment.
Pending and acquired applications are claim resources, including exact
PID/start and launch/containment metadata when available. Unknown publication
or cleanup outcomes remain fenced. `claimDesktopWorkload` is now asynchronous;
schema 3 uses the driver's OS start-time identity, and schema 2/unverified
identities inspect as unknown. Existing Storybook lease migration remains
deferred until after F9.

All commands below ran under the exclusive native-validation lock with
project-local ignored `TMPDIR`; native commands additionally used
`FURN_NATIVE_DRIVER_TEST=1`, the stable signing identity, and an isolated helper
cache. Commands are shown from the repository root.

| Selection                                         | Exact command                                                                                                                                                | Result                                                       | Workspace-relative artifact                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------- |
| Full portable harness                             | `yarn workspace @fluentui-react-native/desktop-test test --runInBand`                                                                                        | Passed 399, failed 0, skipped 9; 25 suites passed, 1 skipped | `artifacts/desktop/f10m/harness-unit-final.log`    |
| Native owner and rejected-launch safety           | `yarn workspace @fluentui-react-native/desktop-test test --runInBand applicationOwnership.contract --testNamePattern 'kernel owner identity\|failed native'` | Passed 3, failed 0, skipped 5                                | `artifacts/desktop/f10m/native-negative-final.log` |
| Native identity and application exclusion backend | `yarn workspace @fluentui-react-native/desktop-driver test --runInBand applicationIncarnation serviceIdentity`                                               | Passed 69, failed 0, skipped 14; 4 suites passed, 2 skipped  | `artifacts/desktop/f10m/native-identity-final.log` |

The first full harness run had one missing compiled `desktop-driver-mcp`
boundary dependency. Building that unchanged workspace corrected the
prerequisite; all eight standalone-consumer boundary cases then passed,
including the new public entry, and the full harness rerun above passed.
Portable Windows/Win32 cases prove durable launched-app survivor records and
fail-closed claims only; they are not native packaged-survivor qualification.

Native evidence:
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-0fNQ8C/evidence.json`.
Schema 3 inspected its native OS owner as live. Both direct-child and
LaunchServices launches reached actual AX queries, which returned
`apiDisabled` (-25211), then journaled and settled their exact primary-process
identities. Direct child PID 8558 started at
`2026-11-12T02:37:23.794023Z`; LaunchServices PID 8616 started at
`2026-11-12T02:37:24.304837Z`. Native probes proved those incarnations exited;
an independent process check found both PIDs absent and no fixture/helper
process under this worktree. No external process was terminated.
Post-run verification is retained at
`artifacts/desktop/f10m/native-cleanup-final.json`.

An earlier fixture inherited Mach-O minimum macOS 28.0 on this 27.2.1 host.
LaunchServices failed before publishing a PID
(`NSCocoaErrorDomain` 256, underlying `NSOSStatusErrorDomain` -10825);
that older implementation left the pending resource uncertain. Completed
no-application failures are settled by the review follow-up below.
The corrected fixture pins the helper's macOS 11.0 minimum in both compiler
target and bundle metadata;
`vtool` confirmed 11.0 and the corrected rejected-launch run passed above.
The earlier evidence is retained at
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-UiVcfS/evidence.json`.

**Remaining qualification:** positive supervisor/session lifecycle, exact
external-app preservation and independent-service application exclusion are
blocked: Accessibility is not granted to the signed helper. Physical-input
mutex qualification is not run; PostEvent preflight is also false. Separate
macOS Fabric and Paper signing/TCC-responsibility lanes are not run on this
branch because of that permission block. No privacy settings were changed.
Arbitrary surviving descendants, interrupted native publication and live
Windows/Win32 uncontained packaged-survivor claims remain gates. The PR's
Windows driver-only native suite and ordinary E2E/smoke jobs do not exercise
the new harness survivor contracts; Windows CI is insufficient for those
gates. This is partial F10-M delivery, not full issue completion.

### Pre-review repository validation

At source `48717724f0df1e8f89d76b66c48d37fac93e871b`,
`yarn clean-lage-cache` passed once, followed by the locked aggregate:

```sh
TMPDIR="$PWD/artifacts/desktop/f10m/buildci-tmp" \
GIT_CEILING_DIRECTORIES="$PWD/artifacts/desktop/f10m/buildci-tmp" \
TF_BUILD=1 yarn lage buildci --concurrency 4
```

Result: passed, 176 successful tasks, 2 cache skips, 0 pending/aborted/failed.
`TF_BUILD=1` selects the declared Jest task's in-band runner; the Git ceiling
keeps project-local temporary test fixtures from discovering the outer
repository. No baseline tests or dependencies were changed for this setup.
An initial aggregate stopped at two owned cross-package guidance links;
replacing them with explicit code paths fixed the policy violation, and
`yarn check-agent-instructions` then passed. The corrected aggregate above
passed, including all owning workspace test/lint tasks. Package format/build
checks passed separately. `yarn lage test-links --concurrency 4` passed 90
tasks with no failures. Logs: `artifacts/desktop/f10m/buildci-first.log`,
`artifacts/desktop/f10m/buildci-final.log` and
`artifacts/desktop/f10m/test-links-final.log`. Aggregate success does not
qualify the blocked or unrun native gates above.

### Review follow-up: launch rejection and lock-failure settlement

Source `62e6552028ea8fb81e76d430379321145fab709c` fixes the three review
findings. Native pre-spawn rejection and completed LaunchServices failure with
no application report `applicationSettlement: 'not-started'`. Ordinary no-data
macOS/Windows/Win32 rejections release the claim; reported process identity,
unknown or unrecognized settlement, lost dispatched responses and completion
after cancellation remain fenced. An acquired lease is never cleared by the
no-data fallback. The async `claimDesktopWorkload` export and awaited Storybook
caller are unchanged; desktop-test now has a **minor** changeset.

Default-TMPDIR focused tests used only project-local test files and Jest cache.
Native commands ran under the exclusive lock, with the stable signing identity,
native opt-in, an isolated helper cache and project-local temporary storage:

| Selection                                              | Exact command                                                                                                                                                | Result                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Default-TMPDIR ownership                               | `yarn workspace @fluentui-react-native/desktop-test test --runInBand applicationOwnership.test --cacheDirectory "$PWD/artifacts/desktop/f10m/jest-cache"`    | Passed 24, failed 0, skipped 0                                |
| Default-TMPDIR transport                               | `yarn workspace @fluentui-react-native/desktop-driver test --runInBand NativeHostProcess --cacheDirectory "$PWD/artifacts/desktop/f10m/jest-cache"`          | Passed 59, failed 0, skipped 0                                |
| Signed helper rebuild                                  | `yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver build-driver --platform macos --force`                                             | Passed                                                        |
| Native identity and termination                        | `yarn workspace @fluentui-react-native/desktop-driver test --runInBand nativeDriver.test applicationIncarnation serviceIdentity`                             | Passed 79, failed 0, skipped 15; 5 suites passed, 2 skipped   |
| AppKit safety                                          | `yarn workspace @fluentui-react-native/desktop-test test --runInBand applicationOwnership.contract --testNamePattern 'kernel owner identity\|failed native'` | Passed 4, failed 0, skipped 5                                 |
| Portable CLI retry, native-only environment removed    | `yarn workspace @fluentui-react-native/desktop-test test --runInBand contracts --testNamePattern 'agent-cli\|lane-cli'`                                      | Passed 2, failed 0, skipped 28 unselected                     |
| Full portable harness, native-only environment removed | `yarn workspace @fluentui-react-native/desktop-test test --runInBand`                                                                                        | Passed 409, failed 0, skipped 10; 25 suites passed, 1 skipped |

The native self-test distinguishes actual flock contention from other errors.
Injected EBADF cleans up a real causally owned child and proves its exact exit;
injected EWOULDBLOCK preserves its real child. The AppKit safety case proves
claim release/reacquisition for exact-identity launch refusal, a missing direct
executable, a missing installed bundle, and a completed LaunchServices rejection.
Both AX-rejected launch kinds still prove exact-primary cleanup.

New evidence:
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-JMEGuu/evidence.json`;
it records a clean source tree. Helper artifact:
`1d68fae8df504432900e30e5b2a6714029762f5dd690cd953a8ef07b1f5da4f3`;
source digest:
`2c8ac56b2b824b05b1cb10d358050dfb643b44eb6e209508d53eaa0f2744b0f8`.
Direct-child PID 70283/start `2026-11-12T03:14:29.097020Z` and
LaunchServices PID 70323/start `2026-11-12T03:14:29.588927Z` were proved exited.
Independent post-run inspection found both PIDs absent and no own-worktree
fixture/helper process. Logs:
`artifacts/desktop/f10m/review-focused-final.log`,
`artifacts/desktop/f10m/review-native-final.log` and
`artifacts/desktop/f10m/review-native-cleanup.json`.
An extra full portable run in the native batch initially passed 407, failed 2,
skipped 10 because the HOME-isolating CLI fixtures inherited native-only
signing/cache settings and could not resolve the configured signing identity.
Removing `FURN_NATIVE_DRIVER_TEST`,
`FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY` and
`FURN_DESKTOP_DRIVER_CACHE_ROOT` corrected the invocation, without a source or
fixture change. Both affected cases and then the full portable suite passed
under the exclusive lock; log:
`artifacts/desktop/f10m/review-harness-final.log`.
These safety passes do not close any positive AX, physical-input, renderer,
descendant, interrupted-publication or Windows-native gate above.

### Final review-fix repository validation

At clean source `e74043b0e6eb5b452e9023bc60c70ba6c9540600`, one combined
clean-cache aggregate passed under the exclusive native-validation lock:

```sh
env -u FURN_NATIVE_DRIVER_TEST \
  -u FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY \
  -u FURN_DESKTOP_DRIVER_CACHE_ROOT \
  TMPDIR="$PWD/artifacts/desktop/f10m/review-buildci-tmp" \
  GIT_CEILING_DIRECTORIES="$PWD/artifacts/desktop/f10m/review-buildci-tmp" \
  TF_BUILD=1 \
  bash -c 'yarn clean-lage-cache && yarn lage buildci --concurrency 4'
```

Result: **passed, 178 successful tasks, 0 skipped, 0 pending/aborted/failed**.
All owning workspace aggregate tasks passed; native-only overrides were not
inherited. `TF_BUILD=1` retains the supported in-band Jest task, and the Git
ceiling isolates project-local temporary Git fixtures. No source, dependency or
test waiver was needed. Log:
`artifacts/desktop/f10m/review-buildci-final.log`.
The code remains the native-qualified `62e6552028ea8fb81e76d430379321145fab709c`;
subsequent changes record evidence only. Positive native acceptance gates remain
open, so delivery is draft and does not close #4446.

### CI regression follow-up: read-only application identity

CI run `43148275374` at `0bd0ad6f7cc1e862169a422b7614a95adf899584`
failed both macOS Storybook renderers with `application-lock-busy` while
recording the authenticated bridge epoch. The actual WebDriver session's
native helper held its legitimate exact-incarnation application lock.
Storybook's recovery callback ignored that helper and created another
`NativeDesktopHost` whose temporary `attach` requested competing control.
This was not a workload-claim leak or an ownership handoff.
The passing macOS E2E artifact reports 62 tests with session ownership:
`desktop-test/src/wdio/configuration.ts` selects `launch`, not the Storybook
attach/recovery path, and that lane has no Storybook bridge-epoch journal.

Fix source `5e360734e9b85bd4732aabc47c7654bb7211c3d3` introduces the
macOS-only read-only `inspectApplication` operation. It shares descriptor,
legacy nonce/lease, executable/bundle and exact-window verification, capturing
the kernel identity before discovery and rechecking it afterwards. It does
not acquire control or register windows/elements. Storybook uses the existing
session helper; every real launch/attach retains exclusive exact-incarnation
control, and foreign controlling services still receive
`application-lock-busy`. Windows/Win32 keep their previous isolated identity
attachment path. Unsupported old helpers fail closed rather than falling
back to controlling macOS attachment.

All three owning packages passed their declared format, build and lint checks.
Build/test/lint batches and native qualification used the exclusive
native-validation lock. Focused tests kept the default TMPDIR unchanged;
their fixtures and Jest caches are project-local. The full
suites instead used project-local TMPDIR and the matching Git ceiling because
existing broad fixtures use `os.tmpdir()` and this task forbids system
temporary-directory writes. This is a declared deviation from the requested
default-TMPDIR full-suite invocation, not default-TMPDIR full-suite evidence.

| Selection                                    | Exact command                                                                                                                                                                                                                                 | Result                                                                             |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Default-TMPDIR native adapter                | `yarn workspace @fluentui-react-native/desktop-driver test --runInBand NativeDesktopHost.applicationIdentity --cacheDirectory "$PWD/artifacts/desktop/f10m/ci-regression/jest-driver"`                                                        | Passed 11, failed 0, skipped 0                                                     |
| Default-TMPDIR composed Storybook regression | `yarn workspace @fluentui-react-native/storybook-desktop test --runInBand applicationIdentity --cacheDirectory "$PWD/artifacts/desktop/f10m/ci-regression/jest-storybook"`                                                                    | Passed 5, failed 0, skipped 0                                                      |
| Default-TMPDIR claim/ownership regressions   | `yarn workspace @fluentui-react-native/desktop-test test --runInBand applicationOwnership.test ownership.test --cacheDirectory "$PWD/artifacts/desktop/f10m/ci-regression/jest-harness"`                                                      | Passed 29, failed 0, skipped 0                                                     |
| Full portable driver                         | `yarn workspace @fluentui-react-native/desktop-driver test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/ci-regression/jest-desktop-driver-full"`                                                                                 | Passed 1,236, failed 0, skipped 66                                                 |
| Full portable harness                        | `yarn workspace @fluentui-react-native/desktop-test test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/ci-regression/jest-desktop-test-full"`                                                                                     | Passed 409, failed 0, skipped 10                                                   |
| Full portable Storybook                      | `yarn workspace @fluentui-react-native/storybook-desktop test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/ci-regression/jest-storybook-desktop-full"`                                                                           | Passed 344, failed 0, skipped 4                                                    |
| Stable-signed helper rebuild                 | `yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver build-driver --platform macos --force`                                                                                                                              | Passed                                                                             |
| Noninteractive permissions                   | `yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver doctor --platform macos --permissions`                                                                                                                              | Passed diagnostics; Accessibility/PostEvent preflight false, Screen Recording true |
| Native identity/termination/backend          | `yarn workspace @fluentui-react-native/desktop-driver test --runInBand nativeDriver.test applicationIncarnation serviceIdentity --cacheDirectory "$PWD/artifacts/desktop/f10m/ci-regression/jest-driver-native"`                              | Passed 79, failed 0, skipped 15                                                    |
| AppKit safety                                | `yarn workspace @fluentui-react-native/desktop-test test --runInBand applicationOwnership.contract --testNamePattern 'kernel owner identity\|failed native' --cacheDirectory "$PWD/artifacts/desktop/f10m/ci-regression/jest-harness-native"` | Passed 4, failed 0, skipped 5                                                      |

The composed regression covers launch, application claim publication,
embedded-driver attach and authenticated epoch observation separately for
Fabric and Paper, with retained window identity and rejected foreign control.
The native self-test additionally refuses missing, malformed and stale
inspection descriptors before AX discovery. The positive AppKit contracts now
inspect an application while its controlling session and foreign helper are
present, but those AX-dependent cases remain locally blocked, not passed.

The stable-signed native run used a clean source tree. Helper artifact:
`982f3cfa696bbde7f9868186ae9365d59014fd656687e5cbec2de74863280ed3`;
source digest:
`6bafaf5835d9cd22410992466a8d8f86086ff6b3b3efd182b3a48922f698527c`.
AppKit evidence:
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-mwo1d2/evidence.json`.
Rejected direct-child PID 53320/start `2026-11-12T04:18:28.787757Z` and
LaunchServices PID 53360/start `2026-11-12T04:18:29.263568Z` were proved exited;
independent post-run inspection found both PIDs absent and no own-worktree
fixture/helper process. No privacy settings were changed.

Logs and curated CI analysis are under
`artifacts/desktop/f10m/ci-regression/`: `focused-default-tmp.log`,
`package-validation.log`, `native-validation.log`, `native-cleanup.json` and
`ci-analysis.json`. Actual macOS Storybook Fabric/Paper CI requalification at
the fix is pending. Local positive AX/physical input, descendant, interrupted
publication and Windows-native acceptance gates above remain open; keep draft.

#### Final CI-regression aggregate

The first clean-cache aggregate at documentation revision
`a7c37b86abdfc3847824480300315cf88eebaf42` failed the Storybook test task
after 112 successful tasks. Its output stopped after 13 passing Jest files,
without an assertion, stack, summary or termination cause. The cause remains
unestablished. The unchanged full Storybook suite then passed 344 with 4
skipped under the identical aggregate environment; that reproduction is not
a successful aggregate.

A second clean-cache aggregate serialized package tasks to remove
inter-package fixture/process overlap. Under the exclusive native-validation
lock, the following invocation passed **178 tasks**, with 0 skipped, failed,
pending or aborted, in 6m 12.39s:

```sh
env -u FURN_NATIVE_DRIVER_TEST \
  -u FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY \
  -u FURN_DESKTOP_DRIVER_CACHE_ROOT \
  TMPDIR="$PWD/artifacts/desktop/f10m/ci-regression/buildci-tmp" \
  GIT_CEILING_DIRECTORIES="$PWD/artifacts/desktop/f10m/ci-regression/buildci-tmp" \
  TF_BUILD=1 \
  bash -c 'set -euo pipefail; git rev-parse HEAD; git status --short; yarn clean-lage-cache && yarn lage buildci --concurrency 1'
```

No source or test waiver was applied between these runs. Serialization is
the retry's isolation measure, not a proven diagnosis of the first failure.
Logs: `artifacts/desktop/f10m/ci-regression/buildci.log`,
`artifacts/desktop/f10m/ci-regression/storybook-buildci-environment.log`
and `artifacts/desktop/f10m/ci-regression/buildci-final.log`.
Runtime source remains the native-qualified `5e360734e`; subsequent changes
record evidence only. This is portable repository validation, not positive
AX or renderer qualification. Actual macOS Storybook Fabric/Paper CI and the
other native acceptance gates remain pending; keep draft.

### 2026-11-12 AX-enabled F10-M qualification

**Observed.** This evidence supersedes the earlier Accessibility/PostEvent
block, not the remaining descendant/publication gates. Source is
`9395737943d7e1402a40a67a41dc605ef0afb24b` plus this delivery's live
macOS discovery fix. Host: macOS 27.2.1 arm64. Feasibility was recorded before
execution at
`artifacts/desktop/f10m/ax-qualification-20261112/feasibility.json`.
Every native, GUI, physical-input and aggregate command used
`$HOME/Library/Caches/furn-overnight/with-native-lock.sh`.
The default TMPDIR was retained for this requalification; the older
project-local-TMPDIR qualification remains historical.

The requested diagnostic passed:

```sh
env FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="FURN Desktop Driver Development" \
  FURN_DESKTOP_DRIVER_CACHE_ROOT="$PWD/artifacts/desktop/f10m/helper" \
  FURN_DESKTOP_DRIVER_BUILD_POLICY=never \
  yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver \
  --reporter json doctor --platform macos --permissions
```

Accessibility, PostEvent and ScreenCapture preflight were `true`; the screen
was unlocked/on-console and `promptRequested=false`. Stable signed helper:
`1429ce4663795bad31f545086ef80bffb83e9b9533287964991c5527388b2f6c`;
source digest
`c17944691081d30a320cf6e4393a5bb0ce6cece8dd71295a400dbc5e6a53b3cb`.
The certificate leaf and designated requirement match the driver's evidence
above. Process ancestry reaches `Rex Server.app`; the effective permission
result is scoped to that responsible process tree. **Inferred, not qualified:**
these passes do not establish that the helper bundle independently owns a
durable grant or that another terminal/CI process tree inherits it.

The initial full AppKit run passed 8 and failed 1. Its newly launched app was
missing from the standalone helper's cached `NSWorkspace` application list.
The new warmed-discovery regression failed before the native fix (1 failed,
9 skipped). Live descriptor discovery now uses current-user kernel PID
enumeration with fresh `NSRunningApplication` objects; exact identity,
ambiguity refusal and launch causality remain enforced. The final focused run
passed **39, failed 0, skipped 0**:

```sh
env FURN_NATIVE_DRIVER_TEST=1 FURN_NATIVE_PHYSICAL_INPUT_TEST=1 \
  FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="FURN Desktop Driver Development" \
  FURN_DESKTOP_DRIVER_CACHE_ROOT="$PWD/artifacts/desktop/f10m/helper" \
  yarn workspace @fluentui-react-native/desktop-test test --runInBand \
  applicationOwnership.contract applicationOwnership.test ownership.test \
  --cacheDirectory "$PWD/artifacts/desktop/f10m/ax-qualification-20261112/jest-native-harness"
```

Ten native tests cover positive supervisor/session lifecycle, exact OS owner
identity, external preservation, independent-service application exclusion
and lease release, read-only observation with retained windows, warmed
discovery and duplicate-bundle refusal, stale identity, direct-child and
LaunchServices causality, cancellation, rejected launch cleanup, and the
physical-input mutex. The remaining 29 are portable regressions. Physical
input was limited to the mutex's Shift down/up sequence.

During implementation, two experimental LaunchServices attempts could not
publish causal ownership. They were not silently treated as owned or exited.
The run-specific executable paths, native start identities and launch-time
intervals were checked before exact operator cleanup; native probes then
reported both exited (PIDs 63263 and 65041). The experimental change to launch
preexistence discovery was reverted; only descriptor discovery is changed.
Evidence:
`orphan-native-launch-cleanup.json`, `orphan-physical-launch-cleanup.json`,
the red/experimental/green logs and `discovery-probe.json` under
`artifacts/desktop/f10m/ax-qualification-20261112/`.
Final passing AppKit identities and cleanup:
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-1V0SrR/evidence.json`.

#### Real Storybook renderer procedure and boundaries

The ignored qualifier
`artifacts/desktop/f10m/ax-qualification-20261112/qualify-renderer.mjs`
uses the declared app commands below from `apps/storybook`. Fabric omits
`--paper`; Paper adds it to every renderer-specific command. Preparation is
rerun when changing renderer:

```sh
yarn storybook --reporter json instance --macos
yarn storybook --reporter json bundle --macos
yarn storybook --reporter json prep --macos
yarn storybook --reporter json manifest --macos
yarn storybook --reporter json driver --macos --input accessible
yarn storybook --reporter json run --macos
STORYBOOK_SMOKE_STORY=components-button--default \
  yarn storybook --reporter json smoke --macos --mode stories-and-tests --input accessible
```

Only `run` applies the worktree instance bundle ID. Before restarting the
driver, the qualifier quits the exact app it launched and closes the old
driver/Metro/channel. Its observer is started before app launch to exercise
warmed discovery. Startup polling retries only read-only missing/incomplete
AX discovery, never launch, attach or another mutation.

The real-app checks use public `DesktopSupervisor`, native-host, identity,
claim-inspection and driver-client APIs. Two independent services have
separate claim directories and native helpers. The first attaches; both
helpers can inspect its exact app identity without changing window handles.
The second's native controlling attach returns `application-lock-busy`, and
its WebDriver new-session request is refused. Releasing the first session
lets the second attach. Deleting sessions and closing both external owners
preserves the app. A separate supervisor-owned launch then survives two
borrowed sessions, publishes its exact owned application resource and exits
only at supervisor disposal. Each neutral claim verifies schema 3, native
owner start identity, registered target and target-instance IDs; its claim is
absent after settled close.

**Observed integration limit:** Storybook's outer CLI claim still uses
`unregistered` target/instance placeholders and no application resource
journal. Its OS owner identity and run ID are verified separately. This
qualification does not pretend that the deferred Storybook lifecycle/lease
relocation after F9 has happened; the exact registered application-resource
assertions are on the neutral supervisor claims.

The first Fabric prep attempt failed before any app/service launch because
the installed Ruby 4.0.6 selected JSON 3.1.0, which lacks the `fast_generate`
entry used by this CocoaPods toolchain. Selecting the already-installed
JSON 2.18.0 through a project-local Ruby preload fixed prep. The preload
contains only `gem 'json', '=2.18.0'`; no gem installation, generated-source
patch, Podfile change or global Ruby configuration change was made.
Renderer invocations use:

```sh
env RUBYOPT="-r$PWD/artifacts/desktop/f10m/ax-qualification-20261112/ruby-json-version.rb" \
  FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="FURN Desktop Driver Development" \
  FURN_DESKTOP_DRIVER_CACHE_ROOT="$PWD/artifacts/desktop/f10m/helper" \
  FURN_DESKTOP_DRIVER_BUILD_POLICY=never \
  node artifacts/desktop/f10m/ax-qualification-20261112/qualify-renderer.mjs fabric
```

For Paper, the final argument is `paper`. The machine-wide native-lock
wrapper encloses each complete invocation, including cleanup. The qualifier
selects Button/Default by manifest title/name, not an assumed slug.
`STORYBOOK_SMOKE_STORY` filters authored callbacks, not catalog traversal.
The accessible lane executes the Button semantics callback; its declared
physical-pointer callback is excluded at selection, not counted as passed
or skipped.

Failed exploratory Fabric attempts remain separate artifacts:
`fabric-prep-json3-failure/`, `fabric-orchestrator-scope-failure/`,
`fabric-ax-startup-failure/` and `fabric-orchestrator-refusal-failure/`.
The latter three corrected qualifier assumptions: the transitional outer
claim is not a registered neutral claim; initial AX queries can be incomplete;
and native conflict metadata is not the WebDriver error shape. They did not
change production behavior. The scope failure required scoped command-tree
shutdown; its three ports and claim were then verified absent in
`driver-exact-cleanup.json`. The startup failure occurred before the qualifier
captured a lease identity, so its original zero cleanup-failure count is not
proof that its app exited. Operator cleanup separately checked the unique
native PID, worktree executable, instance bundle ID and start within the
successful `run` interval before signaling that exact app; the native probe
reported exited in `run-candidate-exact-cleanup.json`. No unknown process or
foreign application was adopted or killed.

#### Observed renderer results

| Renderer     | Qualification checks passed / failed / skipped | Smoke selected / executed / passed / failed / skipped / unsupported | Smoke artifact                                                                   |
| ------------ | ---------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| macOS Fabric | 9 / 0 / 0; cleanup failures 0                  | 224 / 224 / 224 / 0 / 0 / 0; retries 0                              | `apps/storybook/artifacts/desktop/616bf2e8-a675-408f-bd56-2e09982ea969/run.json` |
| macOS Paper  | 9 / 0 / 0; cleanup failures 0                  | 224 / 224 / 224 / 0 / 0 / 0; retries 0                              | `apps/storybook/artifacts/desktop/19358539-eed2-49e9-9c9a-79b5e7db4e9f/run.json` |

Each smoke traversed 223 catalog entries plus the one manifest-selected
Button semantics callback. The accessible input policy excluded one physical
callback before selection; no physical callback is included in those passes.
Both renderer doctors observed the same stable signed helper artifact and
effective permissions recorded above. This qualifies the observed Fabric and
Paper signing/TCC responsibility path separately; it is not first-run,
clean-machine, PPPC or revoked-permission qualification.

| Renderer | Externally attached run-owned app, PID / native start | Supervisor-owned app, PID / native start | Exact cleanup                                                                                                      |
| -------- | ----------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Fabric   | 82677 / `2026-11-12T10:56:35.279027Z`                 | 83427 / `2026-11-12T10:56:38.528966Z`    | External app preserved through both external owners, then explicitly quit; supervisor app exited at owner disposal |
| Paper    | 93753 / `2026-11-12T11:03:02.610130Z`                 | 94499 / `2026-11-12T11:03:04.921261Z`    | Same independently observed preservation and exact disposal                                                        |

Both renderer runs closed driver/channel/Metro ports 33637, 18878 and 38843
before restart and after smoke, removed all neutral and outer CLI claims,
and found the instance application absent after smoke. Raw checks, identities,
claims, process ancestry, signing/preflight and command logs:
`artifacts/desktop/f10m/ax-qualification-20261112/fabric/evidence.json`
and
`artifacts/desktop/f10m/ax-qualification-20261112/paper/evidence.json`.

**Still not run/unqualified:** arbitrary surviving descendants, interrupted
native publication, supervisor-death survivors and live failed-cleanup/restart
fault injection; native Windows/Win32 packaged-survivor journaling/recovery;
and the repeated-run reliability window. First-run durable helper-owned
TCC grants, clean-machine/PPPC/revocation behavior and another responsible
process tree are not inferred from these passes. Storybook lifecycle/lease
relocation remains deferred after F9. **Windows CI sufficient: no; keep draft.**
Apple/Office module and bridging-header checks are inapplicable to this
standalone helper.

#### Final package validation and scope correction

**Observed.** All three owning packages passed their declared
`yarn workspace @fluentui-react-native/<package> format --check`, `build`
and `lint` commands, for `desktop-driver`, `desktop-test` and
`storybook-desktop`. The harness build/format/lint were repeated after its
regression-fixture refinement. Command log: `package-validation.log` in the
qualification artifact root.

The initial broad native-enabled batch passed the full driver suite, then
failed the harness suite: **416 passed, 3 failed, 1 skipped**. Two portable
CLI fixtures intentionally substitute HOME, but inherited the native signing
override, making the signing identity unavailable in that isolated home.
Those are not portable results without native environment overrides.
The third failure was a LaunchServices acquisition in the discovery test's
setup: the helper could not prove causal incarnation, returned
`applicationSettlement=unknown` with PID 9037, and did not kill a guessed
process. Its precise cause remains unestablished. It is not a successful
launch or a resolved reliability gate.

Operator cleanup verified the unique run-owned fixture executable, exact
kernel start `2026-11-12T11:12:39.767964Z` and native-suite interval before
signaling PID 9037; the native probe then proved exited. Evidence:
`native-suite-candidate-cleanup.json` and
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-Kd4tXB/evidence.json`.
The discovery-only regression now starts both external children directly,
captures their native identities, and waits for exact attached windows.
It still warms discovery before launch, observes through another controlling
helper, refuses duplicate bundle identities and verifies disappearance.
This removes unrelated LaunchServices setup from that regression; it neither
fixes nor weakens causal ownership capture. Existing supervisor/causal-launch
tests remain selected.

The corrected validation keeps the signing/native opt-ins only on matching-OS
native selections and clears them for portable full suites. Every command
below ran under the native lock with the default TMPDIR unchanged:

| Selection                              | Exact command                                                                                                                                                                                                                             | Passed / failed / skipped                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Full signed native-enabled driver      | `yarn workspace @fluentui-react-native/desktop-driver test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/ax-qualification-20261112/jest-desktop-driver-full"`                                                                 | 1,255 / 0 / 47                           |
| Final signed ownership and regressions | `yarn workspace @fluentui-react-native/desktop-test test --runInBand applicationOwnership.contract applicationOwnership.test ownership.test --cacheDirectory "$PWD/artifacts/desktop/f10m/ax-qualification-20261112/jest-native-harness"` | 39 / 0 / 0; all 10 native tests selected |
| Full portable driver                   | `yarn workspace @fluentui-react-native/desktop-driver test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/ax-qualification-20261112/jest-desktop-driver-portable"`                                                             | 1,236 / 0 / 66                           |
| Full portable harness                  | `yarn workspace @fluentui-react-native/desktop-test test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/ax-qualification-20261112/jest-desktop-test-portable"`                                                                 | 409 / 0 / 11                             |
| Full portable Storybook                | `yarn workspace @fluentui-react-native/storybook-desktop test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/ax-qualification-20261112/jest-storybook-desktop-portable"`                                                       | 344 / 0 / 4                              |

Signed/native rows use `FURN_NATIVE_DRIVER_TEST=1`, the signing identity and
helper cache above; the ownership row additionally enables
`FURN_NATIVE_PHYSICAL_INPUT_TEST=1`. Portable rows explicitly unset
`FURN_NATIVE_DRIVER_TEST`, `FURN_NATIVE_PHYSICAL_INPUT_TEST`,
`FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY`,
`FURN_DESKTOP_DRIVER_CACHE_ROOT` and `FURN_DESKTOP_DRIVER_BUILD_POLICY`.
The 11 portable harness skips include all 10 opt-in AppKit tests; their
separate signed pass is not inferred from that portable run.

Logs: `full-native-suites.log` (includes the failed broad attempt) and
`validation-final.log` (all corrected selections passed), under
`artifacts/desktop/f10m/ax-qualification-20261112/`.
Final AppKit evidence:
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-1V0SrR/evidence.json`,
with the unchanged signed helper/source digest qualified by both renderers.
**Still unqualified:** reliable LaunchServices causal-identity acquisition
when the native snapshot cannot be proven; the unknown-publication/survivor
and other gates listed above remain open. No automatic reclaim is claimed.

#### Final aggregate and cleanup

**Observed.** The single final clean-cache aggregate ran under the exclusive
native-validation lock, without changing the default TMPDIR:

```sh
"$HOME/Library/Caches/furn-overnight/with-native-lock.sh" \
  env -u FURN_NATIVE_DRIVER_TEST -u FURN_NATIVE_PHYSICAL_INPUT_TEST \
  -u FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY \
  -u FURN_DESKTOP_DRIVER_CACHE_ROOT -u FURN_DESKTOP_DRIVER_BUILD_POLICY \
  TF_BUILD=1 bash -c 'set -euo pipefail;
node -e '\''console.log(JSON.stringify({tmpdir:require("node:os").tmpdir(),nativeOptIn:process.env.FURN_NATIVE_DRIVER_TEST??null}))'\'';
yarn clean-lage-cache && yarn lage buildci --concurrency 1'
```

**Passed 178 tasks, failed 0, skipped 0, pending 0, aborted 0**, in
6m 50.47s. The recorded Node snapshot confirms the default macOS temporary
directory and no native opt-in. The portable aggregate does not replace the
separate signed native or real-renderer qualification. Full output:
`artifacts/desktop/f10m/ax-qualification-20261112/buildci-final.log`.

After the aggregate, the final read-only cleanup verification ran:

```sh
"$HOME/Library/Caches/furn-overnight/with-native-lock.sh" \
  env FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="FURN Desktop Driver Development" \
  FURN_DESKTOP_DRIVER_CACHE_ROOT="$PWD/artifacts/desktop/f10m/helper" \
  FURN_DESKTOP_DRIVER_BUILD_POLICY=never \
  node artifacts/desktop/f10m/ax-qualification-20261112/verify-cleanup.mjs
"$HOME/Library/Caches/furn-overnight/with-native-lock.sh" true
```

**Passed:** signed public native probes reported all **31** recorded exact
incarnations exited; all three reported driver/channel/Metro ports refused
connections; scoped current-user command-line and working-directory
inspection found **0** worktree workload processes. Only the verifier, its
command ancestors and its `lsof` child were excluded. The shared workload
claim was absent, with **0** remaining `interactive.lock` files in eight
native/renderer/failed-attempt artifact roots. Neither unknown nor foreign
processes were signaled. The locked verifier exited 0; the following locked
`true` successfully reacquired and released the machine-wide lock.

Evidence: `cleanup-final.json` and `cleanup-final.log` under
`artifacts/desktop/f10m/ax-qualification-20261112/`. The qualifier, installed-gem
selector and final verifier remain as ignored execution artifacts; the
experimental Swift diagnostic and completed operator-cleanup scratch scripts
were removed, preserving their JSON/log evidence. No helper, fixture, app,
driver service or Metro from this worktree remains. The causal-acquisition,
survivor, containment, interrupted-publication and TCC/reliability limitations
above are unchanged; keep the PR draft.

Final documentation checks passed:

| Exact command                                                                                                                      | Observed result                      |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `yarn markdown-link-check -c .github/markdown-link-check-config.json packages/agentic/desktop-driver/native/macos/README.md`       | Passed 12 links                      |
| `yarn markdown-link-check -c .github/markdown-link-check-config.json packages/agentic/desktop-driver/references/current-status.md` | Passed 6 links                       |
| `yarn markdown-link-check -c .github/markdown-link-check-config.json packages/agentic/desktop-test/references/current-status.md`   | Passed 15 links                      |
| `yarn markdown-link-check -c .github/markdown-link-check-config.json .changeset/neutral-macos-application-ownership.md`            | Passed; 0 links                      |
| `yarn lage test-links --verbose --grouped`                                                                                         | Passed 90 tasks, failed 0, skipped 0 |
| `yarn oxfmt --check`                                                                                                               | Passed repository-wide, 3,159 files  |

Logs in the qualification artifact root:
`changed-markdown-links-final.log`, `test-links-final.log` and
`root-format-final.log`. `git diff --check` also passed. Only documentation
result capture followed the final aggregate; no native/runtime source
changed after the separately qualified renderer builds.

### Rebased F10-M publication and survivor qualification — 2026-11-12

The macOS layer was rebased in place from
`6489386956c0485cb91b478a8f4adc4828f4178b` onto main
`041ac8b9894aeaa7e1aa273baa2ece4e46298b94` (F6), yielding
`d58d473b7bbef26619db596f420fa837687badf3`. The awaited Storybook claim
was already present in F6; conflict resolution retained it and both independent
evidence ledgers. No Windows native source was changed.
`yarn install --immutable` passed with existing peer-dependency warnings.

Qualification-only commit
`d5a7530a9f2d4cb78721a36c1109b5c36fbdc5a1` adds three real AppKit
scenarios; production ownership and helper behavior are unchanged:

- Acquired-resource publication throws after native launch. The complete
  pending claim remains fenced, refuses release/replacement, and settles only
  after exact native cleanup and successful publication.
- An independent owner is killed with `SIGKILL` after native acquisition but
  before acquired-identity publication. The durable pending record survives;
  no guessed identity is adopted, and replacement remains refused.
- Another independent owner is killed after acquired-identity publication.
  Its native app and known `/bin/sleep` descendant survive owner/helper exit.
  Read-only inspection verifies the surviving app. The descendant also
  survives exact primary-process cleanup, confirming `uncontained` semantics.
  Both crash tests verify native owner/helper/app/descendant identities and
  the initial child-parent relationship before exact operator cleanup. Only
  the unchanged fixture claim is then removed.

**Observed:** macOS 27.2.1 arm64, stable signer
`FURN Desktop Driver Development`. All native operations ran under the shared
native lock, with inherited TMPDIR. Nonprompting doctor passed with
Accessibility/PostEvent/ScreenCapture preflight true and unlocked/on-console.
The helper artifact and source digest remain
`1429ce4663795bad31f545086ef80bffb83e9b9533287964991c5527388b2f6c`
and `c17944691081d30a320cf6e4393a5bb0ce6cece8dd71295a400dbc5e6a53b3cb`.

The focused command below passed **42 tests: 13 native, 29 portable; no failures
or skips**. It ran the exact fixture/test content subsequently committed above.

```sh
FURN_NATIVE_DRIVER_TEST=1 FURN_NATIVE_PHYSICAL_INPUT_TEST=1 \
FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="FURN Desktop Driver Development" \
FURN_DESKTOP_DRIVER_CACHE_ROOT="$PWD/artifacts/desktop/f10m/helper" \
yarn workspace @fluentui-react-native/desktop-test test --runInBand \
  applicationOwnership.contract applicationOwnership.test ownership.test \
  --cacheDirectory "$PWD/artifacts/desktop/f10m/rebased-qualification-20261112/jest-ownership"
```

Evidence: `packages/agentic/desktop-test/artifacts/desktop/application-ownership-kffNMN/evidence.json`.
Raw command output is under
`artifacts/desktop/f10m/rebased-qualification-20261112/`.

Full package validation also passed:

| Exact command                                                                                                                                                            | Observed result                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `yarn workspace @fluentui-react-native/desktop-driver format --check`                                                                                                    | Passed                                                                                                                       |
| `yarn workspace @fluentui-react-native/desktop-driver lint`                                                                                                              | Passed                                                                                                                       |
| `yarn workspace @fluentui-react-native/desktop-driver build`                                                                                                             | Passed                                                                                                                       |
| `yarn workspace @fluentui-react-native/desktop-test format --check`                                                                                                      | Passed                                                                                                                       |
| `yarn workspace @fluentui-react-native/desktop-test lint`                                                                                                                | Passed                                                                                                                       |
| `yarn workspace @fluentui-react-native/desktop-test build`                                                                                                               | Passed                                                                                                                       |
| `yarn workspace @fluentui-react-native/storybook-desktop format --check`                                                                                                 | Passed                                                                                                                       |
| `yarn workspace @fluentui-react-native/storybook-desktop lint`                                                                                                           | Passed                                                                                                                       |
| `yarn workspace @fluentui-react-native/storybook-desktop build`                                                                                                          | Passed                                                                                                                       |
| `yarn workspace @fluentui-react-native/desktop-driver test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/rebased-qualification-20261112/jest-driver-native"` | Passed 1,256; failed 0; skipped 47. Native opt-in, stable signing and the helper cache above were set for this command only. |
| `yarn workspace @fluentui-react-native/desktop-test test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/rebased-qualification-20261112/jest-harness"`         | Passed 409; failed 0; skipped 14. Native/signing overrides absent; the 13 AppKit cases passed separately.                    |
| `yarn workspace @fluentui-react-native/storybook-desktop test --runInBand --cacheDirectory "$PWD/artifacts/desktop/f10m/rebased-qualification-20261112/jest-storybook"`  | Passed 392; failed 0; skipped 4. Native/signing overrides absent.                                                            |

The native driver suite includes exact-incarnation probes, refusal of
unreadable foreign process identity, stale-start/PID-reuse classification and
native self-tests. Stale timestamps supplied against live PIDs and synthetic
microsecond-reuse self-tests are not an observation of forced OS PID recycling.
The physical ownership mutex uses only bounded Shift down/up.

**Remaining scope:** the crash fixtures prove a bounded known descendant,
not arbitrary descendant discovery or containment. They interrupt acquisition
publication, not a machine power loss during filesystem rename. Actual TCC
revocation, helper-owned durable grants outside the observed responsible
process tree, automatic survivor adoption, Metro/channel survivor topology,
transparent restart and repeated-run reliability remain unqualified.
The earlier unverifiable LaunchServices causal snapshot is not erased by these
passing launches. F9 lifecycle relocation and F11 retained-app handoff are
separate work; this change implements neither.

#### Rebased Fabric and Paper consumer passes

Both renderers were independently rebuilt/prepared and qualified at
`ca88c289c0fbd79b03dbd43b9bd85f0b21e7e800` (documentation after the
qualification-only commit). Each passed **all 9 ownership/lifecycle checks**,
with **0 cleanup failures**. Their declared accessible smokes each passed
**224, failed 0, skipped 0, unsupported 0, retries 0**: 223 catalog traversals
and one manifest-selected Button semantics callback. One physical callback
was excluded before selection, not passed or skipped.

Commands ran from `apps/storybook`, separately for Fabric and Paper, under the
native lock. The helper signing/cache settings above were supplied.
The existing project-local Ruby preload selected installed JSON 2.18.0 for
CocoaPods; no dependencies, privacy settings, native project sources or
global Ruby settings were changed.

| Exact command                                                                                                                                       | Observed result                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `yarn storybook --reporter json instance --macos`                                                                                                   | Passed                                         |
| `yarn storybook --reporter json bundle --macos`                                                                                                     | Passed                                         |
| `yarn storybook --reporter json prep --macos`                                                                                                       | Passed                                         |
| `yarn storybook --reporter json manifest --macos`                                                                                                   | Passed                                         |
| `yarn storybook --reporter json driver --macos --input accessible`                                                                                  | Passed readiness and settled shutdown          |
| `yarn storybook --reporter json run --macos`                                                                                                        | Passed native build and exact instance launch  |
| `STORYBOOK_SMOKE_STORY=components-button--default yarn storybook --reporter json smoke --macos --mode stories-and-tests --input accessible`         | Passed 224/224                                 |
| `yarn storybook --reporter json instance --macos --paper`                                                                                           | Passed                                         |
| `yarn storybook --reporter json bundle --macos --paper`                                                                                             | Passed                                         |
| `yarn storybook --reporter json prep --macos --paper`                                                                                               | Passed                                         |
| `yarn storybook --reporter json manifest --macos --paper`                                                                                           | Passed                                         |
| `yarn storybook --reporter json driver --macos --paper --input accessible`                                                                          | Passed readiness and settled shutdown          |
| `yarn storybook --reporter json run --macos --paper`                                                                                                | Passed native build and exact instance launch  |
| `STORYBOOK_SMOKE_STORY=components-button--default yarn storybook --reporter json smoke --macos --paper --mode stories-and-tests --input accessible` | Passed 224/224                                 |
| `yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver --reporter json doctor --platform macos --permissions`                    | Passed separately for each renderer; no prompt |

Real neutral supervisor-owned apps survived two borrowed sessions and exited
only at supervisor disposal. Externally attached apps survived both independent
owners' cleanup. Cross-helper controlling attach returned
`application-lock-busy`; independent WebDriver control was refused until the
first lease was released. Read-only inspection succeeded while control was
held and preserved window handles. Schema-3 claims carried verified native
owner/application and registered target/instance identities. F6 provenance
behavior remained intact. Storybook's outer CLI claim still has its documented
transitional placeholders; this is not F9 integration.

Evidence: `fabric/evidence.json` and `paper/evidence.json` under the new
qualification artifact root. Smoke reports:
`apps/storybook/artifacts/desktop/15518d7a-d662-49ae-a76d-f4c0cd5e2fc3/run.json`
(Fabric) and
`apps/storybook/artifacts/desktop/92d22b26-24cc-4d87-a4b7-229d24f478b1/run.json`
(Paper). Both observed the same stable signer/designated requirement with
effective permissions under the `Rex Server.app` responsible process tree;
this is not first-run, clean-machine or permission-revocation qualification.
Apple/Office module and bridging-header checks are inapplicable to this
standalone helper. Windows/Win32 native ownership qualification belongs to
the independent upper layer and was not run here.

#### Plain aggregate, documentation and final cleanup

The required aggregate **is not green**. It ran under the native lock with
inherited environment: `TF_BUILD` and native/signing overrides absent,
default TMPDIR retained, and no concurrency override. The cache was cleared
once; subsequent plain attempts used only results from that fresh run.

| Exact command                                                                                         | Observed result                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn lage test-links --verbose --grouped`                                                            | Passed 90 tasks, failed 0, skipped 0                                                                                                                                                               |
| `yarn clean-lage-cache && yarn lage buildci`                                                          | Failed in `check-package-contents`: desktop-test's `yarn pack --dry-run --json` exited 1; underlying cause unestablished. Log: `buildci.log`.                                                      |
| `yarn workspace @fluentui-react-native/desktop-test pack --dry-run --json`                            | Passed immediately without changes. Log: `desktop-test-pack.log`.                                                                                                                                  |
| `yarn lage buildci` (first retry)                                                                     | Failed driver tests: known `boundedCommand` parallel-startup assertion expected SIGKILL but observed SIGTERM; unmodified `privateStorage` test also exceeded 10 seconds. Log: `buildci-retry.log`. |
| `yarn workspace @fluentui-react-native/desktop-driver test --runInBand boundedCommand privateStorage` | Passed 73, failed 0, skipped 10. This focused serial diagnostic is not aggregate acceptance. Log: `aggregate-failures-focused.log`.                                                                |
| `yarn lage buildci` (final unchanged retry)                                                           | Failed only the same `boundedCommand` assertion; driver tests passed 1,236, failed 1, skipped 66. The private-storage test passed. Log: `buildci-final.log`.                                       |

Both failing test sources and their implementations are unchanged from pinned
main. No assertion, timeout, concurrency policy or environment was altered to
hide these failures. The passing full signed suite, focused contracts and
renderer runs remain distinct evidence; they do not turn the failed plain
aggregate into a pass.

Changed Markdown link checks passed using
`yarn markdown-link-check -c .github/markdown-link-check-config.json <file>`:
`packages/agentic/desktop-driver/native/macos/README.md` (12 links),
`packages/agentic/desktop-driver/references/current-status.md` (6),
`packages/agentic/desktop-test/references/current-status.md` (19),
`packages/agentic/desktop-test/references/native-qualification.md` (2), and
`.changeset/neutral-macos-application-ownership.md` (0).

**Observed final cleanup:** native probes proved all **24** recorded exact
incarnations exited; all **3** reported driver/channel/Metro ports refused
connections. Scoped command-line and working-directory checks found **0**
worktree workload processes. The shared claim and all claims beneath the
three native/renderer evidence roots were absent. The native lock was then
reacquired and released successfully.

An earlier cleanup scan saw four orphaned test workers/children from the
failed aggregate. All four exited naturally before the bounded cleanup
inspection; no signal was needed. Their initial failure and subsequent
absence are retained in `cleanup-first.json`, `cleanup-first.log` and
`aggregate-worker-cleanup.json`. The final successful verifier wrote
`cleanup-final.json` and `cleanup-final.log` in the new artifact root.
No helper, fixture, descendant, application, driver service or Metro from
this qualification remains. Copied execution scripts were removed after use;
their JSON results and command logs remain as ignored evidence.

#### Review follow-up: bounded fixture retirement — 2026-11-12

Source commit `0fb6cd47fccc4f6210797b25085e7b56aa8ca4fe` addresses the
reviewed indefinite crash-owner wait. The changed executable source is limited
to `fixtures/application-ownership/crash-owner.mjs`, its regression in the
existing `src/applicationOwnership.test.ts`, and four lines in
`packages/agentic/desktop-driver/native/macos/fixtures/ApplicationFixture.swift`.
The ready owner now waits
at most 120 seconds, emits a fixed diagnostic and exits 1. The AppKit fixture
requests termination on its main queue after 300 seconds; its existing
`/bin/sleep 300` descendant was already bounded.

Production ownership, helper protocol, parent cleanup, identity verification
and claim settlement are unchanged. In particular, failure to obtain an owner
identity still does not authorize signalling a guessed PID. Owner retirement
allows helper EOF; neither fixture deadline settles an abandoned workload
claim or implements automatic recovery.

**Observed portable regression:** with the shared wait still unbounded, the
new `--retirement-probe` test failed with `spawnSync ETIMEDOUT` after five
seconds. After adding the timeout, the same probe exited 1 with the expected
diagnostic. It uses a 25 ms deadline through the same wait function, before
acquiring any claim or starting a helper/application. This is portable
retirement evidence, not a native owner-death or five-minute AppKit runtime
pass.

Exact commands and results at the source commit:

- `node --check packages/agentic/desktop-test/fixtures/application-ownership/crash-owner.mjs`:
  passed.
- `yarn workspace @fluentui-react-native/desktop-test test --runInBand applicationOwnership.test ownership.test`:
  passed 30, failed 0, skipped 0.
- `yarn workspace @fluentui-react-native/desktop-driver format`,
  `yarn workspace @fluentui-react-native/desktop-driver lint` and
  `yarn workspace @fluentui-react-native/desktop-driver build`: each passed.
- `yarn workspace @fluentui-react-native/desktop-test format`,
  `yarn workspace @fluentui-react-native/desktop-test lint` and
  `yarn workspace @fluentui-react-native/desktop-test build`: each passed.
- `yarn workspace @fluentui-react-native/desktop-driver test --runInBand`:
  passed 1,237, failed 0, skipped 66; native opt-in absent.
- `yarn workspace @fluentui-react-native/desktop-test test --runInBand`:
  passed 410, failed 0, skipped 14; native opt-in absent.

Under the shared native lock, using the existing stable signing identity and
helper cache, these commands also completed:

```sh
yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver \
  --reporter json doctor --platform macos --permissions
node packages/agentic/desktop-driver/native/macos/fixtures/build.cjs \
  artifacts/desktop/f10m/retirement-followup-20261112/fixture
```

Doctor exited 0 with `promptRequested=false`, Accessibility/PostEvent/
ScreenCapture preflight true, and **`screenLocked=true`**. The fixture
compiled and passed strict signature verification; it was not launched.
**Current native runtime qualification is blocked by the locked console.**
The prior 13 native cases and Fabric/Paper passes above remain evidence of
pre-fix content, present at `16558610ff2bd14775430f86c738c12947fe81ee`;
they are not reruns of this retirement change. No unlock, privacy alteration
or native GUI retry was attempted.

The one required follow-up `yarn clean-lage-cache && yarn lage buildci`
cleared the cache, then **failed** only the unchanged
`boundedCommand.test.ts:31` SIGKILL-versus-SIGTERM assertion: driver tests
passed 1,236, failed 1, skipped 66. Private-storage tests passed in this run.
Both implicated test files and their implementations are byte-unchanged from
pinned main `041ac8b9894aeaa7e1aa273baa2ece4e46298b94`.
The aggregate used the native lock, inherited TMPDIR, no `TF_BUILD`, no native
opt-in and no concurrency override. It was not retried. Root instruction,
package-content and publishing checks passed within that failed aggregate;
these individual passes do not make the aggregate green.

Separate `yarn lage test-links --verbose --grouped` passed 90 tasks.
`yarn markdown-link-check -c .github/markdown-link-check-config.json <file>`
passed for the five changed Markdown files listed above, with unchanged
12/6/19/2/0 link counts.

Final locked command-line/working-directory audits at 23:23:50 and 23:23:53
UTC found no worktree workloads or unreadable candidates and issued no
signals. The initial audit conservatively counted its own short-lived
`lsof` child; the corrected audit excludes only that exact known audit PID
and its own ancestor chain. No application, Metro or native ownership
fixture was launched in this follow-up.

Evidence: `artifacts/desktop/f10m/retirement-followup-20261112/`, including
`retirement-unbounded-red.log`, `retirement-green.log`,
`driver-portable.log`, `harness-portable.log`, `doctor.json`,
`fixture-build.json`, `plain-aggregate.log`, `test-links.log`,
`changed-markdown-links.log`, `cleanup.json` and `cleanup-final.json`.

## Windows Fabric and Win32 Paper — F10-W application ownership — 2026-11-12 UTC

**Source and base decision:** implementation commit
`6e881e1a05fef735c1b9bacd7d123285f47269ff`, branch
`user/jasonvmo/desktop-windows-app-ownership`, **stacked on #4492** at
`6489386956c0485cb91b478a8f4adc4828f4178b`; draft PR base remains
`user/jasonvmo/desktop-macos-app-ownership`. The Windows side implements its
neutral application host/resources, claim schema 3, native OS owner identity,
exact process pins, inspection and launch settlement messages. A separate
claim schema or duplicate service factory was not introduced. This pins the
dependency; later #4492 movement is not authorization to rebase, merge or
push to its branch.

Application resources can be named through the inherited neutral publication
seam without touching F11's CLI, service, agent connection, WDIO, session,
grant, client or MCP files. The base's existing `driverService.ts` changes
remain inherited only; W2 adds no edits to an F11-owned file.

**Observed, test-first portable evidence:** new Windows identity/recovery
tests failed before implementation, then passed. Later red/green regressions
covered recovery barriers after claim removal, inconsistent containment,
unrecognized/invalid owner probes, preserving recovery plus barrier failures,
and portable service/reporting scopes without a prebuilt helper. The focused
Windows suite now has **31 passing tests** and supervisor suite **11**.
Existing neutral ownership tests also pass. Storybook identity tests pass
**7**, including Windows Fabric and Win32 Paper read-only resolution alongside
both macOS renderers; the epoch journal deliberately retains its existing
PID/start schema instead of taking another controlling attachment.

Full portable results:

| Package           | Passed suites / tests | Skipped suites / tests | Interpretation                                     |
| ----------------- | --------------------- | ---------------------- | -------------------------------------------------- |
| desktop-driver    | 74 / 1,234            | 9 / 93                 | Native opt-ins unset; not native qualification     |
| desktop-test      | 25 / 442              | 3 / 25                 | Native/unsupported-platform opt-ins remain skipped |
| storybook-desktop | 23 / 347              | 1 / 3                  | Portable integration; not renderer qualification   |

The first full harness attempt failed because the new eager Windows helper
resolution also affected portable scopes; focused failures reproduced it,
and the fix permits only `no-verified-prebuilt` to retain that existing
non-native behavior. Other verification failures still abort. A stale claim
cannot be recovered without a verified helper. The existing public boundary
fixture also needed the desktop-driver-mcp public entries built; no MCP source
was changed. Both failures were resolved before the full green harness rerun.

Commands below ran from the worktree root; `$W2` denotes that root.
`TEMP`/`TMP` were scoped to its ignored `artifacts\desktop\f10w\scratch`;
`FURN_NATIVE_DRIVER_TEST` was unset.

| Command                                                                                                                                 | Observed result                   |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `yarn workspace @fluentui-react-native/desktop-test format`                                                                             | Passed                            |
| `yarn workspace @fluentui-react-native/desktop-test lint`                                                                               | Passed                            |
| `yarn workspace @fluentui-react-native/desktop-test build`                                                                              | Passed                            |
| `yarn workspace @fluentui-react-native/desktop-test test --runInBand --cacheDirectory "$W2\artifacts\desktop\f10w\jest-harness"`        | Passed 442; skipped 25            |
| `yarn workspace @fluentui-react-native/storybook-desktop format`                                                                        | Passed                            |
| `yarn workspace @fluentui-react-native/storybook-desktop lint`                                                                          | Passed                            |
| `yarn workspace @fluentui-react-native/storybook-desktop build`                                                                         | Passed                            |
| `yarn workspace @fluentui-react-native/storybook-desktop test --runInBand --cacheDirectory "$W2\artifacts\desktop\f10w\jest-storybook"` | Passed 347; skipped 3             |
| `yarn workspace @fluentui-react-native/desktop-driver-mcp build`                                                                        | Passed; existing boundary fixture |
| `yarn check-agent-instructions`                                                                                                         | Passed                            |
| `yarn oxfmt --check`                                                                                                                    | Passed, 3,163 files               |

Ignored evidence run: `artifacts/desktop/f10w/portable-20261112/`.
Logs include `harness-test-initial.log`, final `harness-test.log`,
`driver-test.log`, `storybook-test.log`, each owning build/lint log, and
`changed-markdown-links.log`. Per-file link checks passed for driver README,
native protocol, Windows provider README, driver contributing/native-helpers,
harness README/configuration/lifecycle/native-qualification, Storybook
contributing, and the three-package patch changeset. The root formatter
intentionally excludes `.changeset/*.md`.

**Observed, helper build only:** the locked Debug/x64 `buildWindowsDriver`
compile with build ID `f10w-compile-02` passed, 0 warnings/errors. Its seven
changed C++ files match the compiled snapshot. Native build evidence is
`artifacts/desktop/f10w/b2/build.log`. No application, fixture, native
self-test or physical-input case has run, and session kind is **not sampled**.
The pre-campaign audit reported
`FURN-AUDIT: no FURN desktop processes found`; no W2 campaign was started.

**Implemented, still requiring native proof:** Windows/Win32 supervisor
ownership, exact external pins and acquired resource evidence now include
canonical executable, native seven-digit creation time, session, and packaged
AUMID. The native supervisor can reconcile an acquired exact app only after
the old owner is proven exited/reused, before its replacement claim/listener.
It serializes recovery, validates file identity/content and resource/effect
consistency, durably records partial progress, and preserves external apps.
Unknown services/resources, pending/unleased launches, mixed service graphs,
interrupted recovery, unverified owners, and unrelated effects remain fenced.
Custom hosts/delegated claims acquire no automatic native termination authority.
There is no general stale-lock remover, quarantine reset, or new protected
agent recovery route. Mixed Storybook graph and arbitrary uncontained-descendant
recovery are not qualified by this bounded application-only path.

| Native gate                                                  | Windows Fabric packaged | Win32 Paper REX | Required evidence / limit                                                         |
| ------------------------------------------------------------ | ----------------------- | --------------- | --------------------------------------------------------------------------------- |
| Exact application/native owner identity                      | Not run                 | Not run         | AUMID or canonical REX/executable, PID/start/session from real native evidence    |
| PID-reuse/mismatch and ambiguity rejection                   | Not run                 | Not run         | Real mismatch/fixture cases; actual OS PID reuse only if inducible                |
| Containment or explicit packaged fencing                     | Not run                 | Not run         | Packaged stays `uncontained`; REX must report Job Object and drain on helper exit |
| Cross-service application exclusion and physical input mutex | Not run                 | Not run         | Independent helpers, physical opt-in and connected/unlocked session gate          |
| Acquired survivor journal and next-run recovery              | Not run                 | Not run         | Literal-PID, identity-verified helper/owner fault injection                       |
| Repeated-run reliability                                     | Not run                 | Not run         | Five launches/teardowns and no old exact incarnation or claim leak                |

The opt-in consumer command is
`$env:FURN_NATIVE_DRIVER_TEST='1'; $env:FURN_NATIVE_APPLICATION_OWNERSHIP_TEST='1'; $env:FURN_NATIVE_PHYSICAL_INPUT_TEST='1'; yarn workspace @fluentui-react-native/desktop-test test --runInBand windowsApplicationOwnership.contract`.
It requires explicitly resolved Windows AUMID and REX JSON descriptors and a
verified prebuilt helper, under the granted exclusive physical desktop
campaign. Each endpoint gets five launch/teardown iterations and two borrowed
sessions per launch, stale identity checks, cross-service exclusion, and
journal recovery. Three paired packaged activations also check that the
losing launcher does not clean up the winning service's app.
See `references/native-qualification.md`, “Neutral Windows application
ownership”. No skips above establish these gates. The final clean-cache
`yarn lage buildci`, independent review, push, draft PR and hosted CI remain
not run at this preparation checkpoint. Part of #4447 and #4435.

Preparation closeout pinned to the implementation SHA above:

| Post-commit command                                                                                                                                                                                   | Result                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `yarn workspace @fluentui-react-native/desktop-test test --runInBand windowsOwnership supervisor applicationOwnership.test ownership.test --cacheDirectory "$W2\artifacts\desktop\f10w\jest-harness"` | Passed 71 tests                     |
| `yarn workspace @fluentui-react-native/storybook-desktop test --runInBand applicationIdentity --cacheDirectory "$W2\artifacts\desktop\f10w\jest-storybook"`                                           | Passed 7 tests                      |
| `yarn change:check`                                                                                                                                                                                   | Passed                              |
| `yarn lage test-links --verbose --grouped`                                                                                                                                                            | Passed 90 tasks; 0 failed/skipped   |
| `yarn oxfmt --check`                                                                                                                                                                                  | Passed repository-wide, 3,163 files |

For each file below, the exact checker invocation was
`yarn markdown-link-check -c .github\markdown-link-check-config.json <file>`;
all file arguments are worktree-relative:

| File                                                               | Result          |
| ------------------------------------------------------------------ | --------------- |
| `packages\agentic\desktop-driver\README.md`                        | Passed 16 links |
| `packages\agentic\desktop-driver\native\PROTOCOL.md`               | Passed 5 links  |
| `packages\agentic\desktop-driver\native\windows\README.md`         | Passed 8 links  |
| `packages\agentic\desktop-driver\references\contributing.md`       | Passed 4 links  |
| `packages\agentic\desktop-driver\references\native-helpers.md`     | Passed 8 links  |
| `packages\agentic\desktop-driver\references\current-status.md`     | Passed 6 links  |
| `packages\agentic\desktop-test\README.md`                          | Passed 7 links  |
| `packages\agentic\desktop-test\references\configuration.md`        | Passed 1 link   |
| `packages\agentic\desktop-test\references\lifecycle.md`            | Passed 1 link   |
| `packages\agentic\desktop-test\references\native-qualification.md` | Passed 2 links  |
| `packages\agentic\desktop-test\references\current-status.md`       | Passed 15 links |
| `packages\agentic\storybook-desktop\references\contributing.md`    | Passed; 0 links |
| `.changeset\windows-exact-application-ownership.md`                | Passed; 0 links |

The same ignored evidence root retains `tested-source-revision.txt`,
`compile-source-evidence.json`, each `*-focused-committed.log`,
`test-links.log`, `root-format.log`, and `pre-campaign-audit.log`.
Only appended Windows result capture followed the checks; no macOS ledger
section or native/runtime source was changed.

## Windows Fabric and Win32 Paper — F10-W native qualification — 2026-11-12 UTC

**Observed source and dependency:** real application qualification ran at
`8343dc0c48a2de01475454c892e7a295523caa75`, on
`user/jasonvmo/desktop-windows-app-ownership`. The coordinator handoff
`W2-base-decision.md` records **STACK** on #4492 at exactly
`6489386956c0485cb91b478a8f4adc4828f4178b`, implementing its neutral application
host/resources, schema-3 native owner claims, process pins, inspection and
settlement contracts. Application resource naming uses the inherited seam,
without new edits to F11's CLI, service, agent connection, WDIO, session,
grant, client or MCP files. The eventual draft PR base is
`user/jasonvmo/desktop-macos-app-ownership`. Its independently owned head may
advance or never merge; this pinned dependency is not permission to rebase,
merge, rewrite history or push to that branch.

**Observed environment:** Windows build 26300 x64, Node 26.13.0, active/unlocked
RDP, `sessionKind: remote`, native `windows-session:1`. Every native command ran
under the exclusive W2 lock with `-RequirePhysical`; the session remained
eligible before and after each command, with no exit-75 or session-change
result. The helper used Debug/x64, prebuilt-only resolution, artifact/SHA256
`863cc2dbfc8f5792d22c8606376d226affbf8655fe4ded62ba78c23a29c516c7`,
source digest
`ea76e931dc4cdebc87e0621a7d730f81faabce5ef902063a0512cd7c2b100f2d`.
Private machine paths are retained only in ignored artifacts.

The registered Windows Fabric product was reused from the
coordinator-specified `furn-81` build at `bdeb0b291`: there are no Windows
app/native-core Windows source changes relative to that build, and the
generated `RnwNewArch`/`UseFabric` values are true. All five native ordinary-run
identities matched its registered manifest image and AUMID
`40411fc5-8e92-4d46-b68d-b62df44b1366_syyqehzwccsyy!App`.
Windows Metro was owned by W2 on 8081 and passed `/status`; both bundles were
produced from W2. Win32 used its canonical prebuilt REX `ReactTest.exe`, Paper,
and the W2 bundle/component/working-directory descriptor. Native Win32 app
build is **Unsupported**.

**Observed corrections before the green run:**

- The selected native helper contract initially failed an existing C++ assertion
  that dereferenced a destroyed temporary JSON release result. Commit
  `4a4b87f37b574820b93e342b68721d931be07c55` retains the result, and the complete
  selected native contract/self-test rerun passed. Release behavior is unchanged.
- The first real consumer run passed 3 and failed 5. The fixture's arbitrary
  project settlement root was correctly refused with native reason `ancestor`;
  this worktree's ancestors allow broader modification. The final fixture uses
  the normal native per-user private-store default, without changing ACLs,
  permissions or the provider's fail-closed checks.
- Paired packaged activation produced two different PID/start incarnations,
  not two owners of one incarnation. Commit `8343dc0c4` corrects that fixture
  assumption: three pairs on **each** endpoint now prove distinct controlling
  incarnations, unpinned ambiguity refusal, pinned cross-service exclusion, and
  that closing one winner preserves the other. Refused contenders, if present,
  are disposed before checking the winners. All observed pairs had two distinct
  winners; the shared-PID activation race was not induced.

The corrected fixture passed format, lint and TypeScript build. Its focused
portable selection passed **31 tests**, with **9 native cases skipped** because
native opt-in was unset; the later real native run, not those skips, qualifies
the cases below. Earlier full portable results remain the preparation results
above. The corrected provider selection passed **6 tests**, including all five
new real-process fixture cases, with 10 unrelated filtered cases skipped.

**Observed final application result: 9 passed, 0 failed, 0 skipped**, one suite,
at `2026-11-12T16:04:04.248Z`. The 27 evidence rows include iteration receipts
and case verdicts; they are not 27 tests.

| Case                                            | Windows Fabric packaged | Win32 Paper REX           | Native evidence                                                                                                                                                          |
| ----------------------------------------------- | ----------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exact identity                                  | Passed                  | Passed                    | Canonical image, PID, seven-digit creation time, session; packaged AUMID or exact REX incarnation                                                                        |
| Read-only inspection and borrowed sessions      | Passed                  | Passed                    | Unchanged window ids; two sessions per supervisor launch; first deletion preserves the app                                                                               |
| Start/session/executable mismatch               | Passed                  | Passed                    | Both inspect and trusted recovery refuse the wrong identity without ending the real process                                                                              |
| Ambiguous matching processes/windows            | Passed                  | Passed                    | Three pairs of two actual incarnations; unpinned inspection refuses, exact pins remain readable                                                                          |
| Independent-service exact application exclusion | Passed                  | Passed                    | Independent helper's pinned attach fails `application-lock-busy`; observations do not take control                                                                       |
| Containment or explicit fencing                 | Passed, `uncontained`   | Passed, `job-object`      | Packaged survivor stays journaled and fenced; REX exits with the crashed helper's job                                                                                    |
| Survivor journal and next-run recovery          | Passed                  | Passed                    | Acquired application resource; live owner refused; literal-PID helper/owner stops after full native identity verification; next supervisor reconciles before replacement |
| Physical-input mutex                            | Passed                  | Passed                    | Native Shift down, second helper cancelled with `AbortError`/effect `none`, release then transfer                                                                        |
| Repeated-run reliability                        | Passed 5/5              | Passed 5/5                | Five distinct PID/start tuples per endpoint, two borrowed sessions each; no exact old process or claim leak                                                              |
| Concurrent cleanup isolation                    | Passed 3/3 pairs        | Passed 3/3 pairs          | Closing one exact winner leaves the other alive; final cleanup proves every incarnation exited                                                                           |
| Actual kernel PID recycling                     | Not run                 | Not run                   | Not induced; provider's one-100-ns-tick stale pin and real endpoint start mismatch both passed                                                                           |
| Shared-PID packaged activation race             | Not run                 | Unsupported, not packaged | Every actual Windows pair created two distinct processes; no claim that this exercised a losing shared-PID launch                                                        |

The crash receipts include packaged PID **10984**, creation time
`2026-11-12T16:02:38.6619313Z`, helper **37916**, owner **35708**; and REX
PID **35844**, creation time `2026-11-12T16:03:18.2246578Z`, helper **34864**,
owner **37256**. Native evidence verified each fault-injection identity again
immediately before a single literal-PID stop. The packaged process survived
helper death, the live owner fenced replacement, and after owner exit the next
supervisor ended that exact app and removed the old claim. REX's Job Object
drained on helper death; its next supervisor reconciled the acquired dead app
and claim. No broad name-based termination was used.

Commands below are the inner workspace commands issued through the required W2
lock with `-RequirePhysical`. `$W2` denotes the assigned worktree, `$E` its
`artifacts\desktop\f10w\native-20261112` evidence directory. `TEMP`/`TMP` point
to `$W2\artifacts\desktop\f10w\scratch`; the native cache is
`$W2\artifacts\desktop\f10w\n`, configuration `debug`, build policy `never`.

| Workspace / command                                                                                                                                                                                                                                                                               | Observed result                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Storybook: `yarn desktop-driver build-driver --platform windows --configuration debug --cache-root "$W2\artifacts\desktop\f10w\n"`                                                                                                                                                                | Passed initial explicit build; provider contract explicitly rebuilt the corrected source |
| Storybook: `yarn desktop-driver doctor --platform windows --configuration debug --cache-root "$W2\artifacts\desktop\f10w\n"`                                                                                                                                                                      | Passed selected final artifact                                                           |
| Storybook: `yarn storybook bundle --win32`                                                                                                                                                                                                                                                        | Passed; run `14c14c80-0da7-48ad-ac14-47e0c257fbe1`                                       |
| Storybook: `yarn storybook bundle --windows`                                                                                                                                                                                                                                                      | Passed; run `f6ba6fb4-25c9-49a2-9928-8b2430abc83b`                                       |
| Repository root: `node .yarn\releases\yarn-4.18.0.cjs workspace @fluentui-react-native/agentic-components-storybook start --port 8081`                                                                                                                                                            | Passed owned Metro `/status` and final shutdown                                          |
| Repository root: `node .yarn\releases\yarn-4.18.0.cjs workspace @fluentui-react-native/desktop-test test --runInBand --cacheDirectory "$W2\artifacts\desktop\f10w\jest-harness" --runTestsByPath src\windowsApplicationOwnership.contract.test.ts --json --outputFile "$E\consumer-results.json"` | Passed 9, failed 0, skipped 0                                                            |

The consumer inherited `FURN_NATIVE_DRIVER_TEST=1`,
`FURN_NATIVE_APPLICATION_OWNERSHIP_TEST=1`,
`FURN_NATIVE_PHYSICAL_INPUT_TEST=1`, and the two explicit JSON descriptors in
`windows-application.json` / `win32-application.json`. REX's descriptor came
from the owning adapter, not guessed host arguments. No input features were
masked. The command runner owned Metro and awaited its normal resource cleanup;
the outer report's “lifecycle (no tests)” is not the native test verdict.

**Ignored evidence:** `artifacts/desktop/f10w/native-20261112/` contains
`consumer-results.json`, `consumer-evidence-final.json`,
`qualification-summary.json`, `selected-helper.json`,
`application-build-provenance.json`, `metro-identity.json`, `doctor-debug.log`,
both bundle logs, corrected provider logs, and preserved initial failed
attempts. Canonical native evidence is
`packages/agentic/desktop-test/artifacts/desktop/windows-application-ownership-GiW4x1/evidence.json`;
the outer command report is
`artifacts/desktop/f10w/native-20261112/commands/4ed98f8f-8ebb-49ca-ac90-2ee6caece7dc/run.json`.
Registration, executable/bundle hashes, source revision, real PID/start/session
receipts, and every case outcome are retained there. Machine-specific paths
and crash-owner request/ready records remain ignored, not public.

**Observed closeout:** all W2 campaigns ended. Final audit:
`FURN-AUDIT: no FURN desktop processes found`; no owned helper, fixture, Metro,
REX or packaged app survived. No push or PR was made. Independent review, the
final one-time locked clean-cache `buildci`, and hosted CI remain **Not run**.
The existing three-package patch changeset is
`windows-exact-application-ownership.md`.

**Limits:** the tests do not establish arbitrary uncontained-descendant cleanup,
mixed Storybook-graph recovery, forced kernel PID recycling, the unobserved
shared-PID packaged activation race, or a new protected-agent recovery API.
No macOS renderer claim is made by this Windows campaign. Part of #4447 and
#4435.
