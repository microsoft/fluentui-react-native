---
id: desktop-test.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Current lifecycle and qualification status

**Work in progress, updated 2026-11-05.** Done means the listed implementation,
not full cross-platform qualification. This package is the intended neutral
workload host; the existing Storybook lifecycle takeover is transitional.
No new coordinator package, daemon, dynamic plugin loader, or package rename
is required now. Follow-up work is tracked in
[desktop driver improvements (#4435)](https://github.com/microsoft/fluentui-react-native/issues/4435)
and its sub-issues.

## Capability matrix

| Capability                                               | State              | Limit or next gate                                                                                                                                          |
| -------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App/suite configuration and standalone installed-app use | Done               | Storybook is optional; executable config is trusted operator code, not a sandbox.                                                                           |
| Native service and helper composition                    | Done               | Generic supervisor and supervised Storybook child use the same real `driverService` factory, helper policy, authority and settled close.                    |
| Standalone WDIO/Jasmine execution                        | Done               | WDIO owns its session. Storybook CSF callbacks use a runner-owned session borrowed by a Node worker.                                                        |
| Required services, reporting, structured results         | Done               | One collector; bounded JSON/NDJSON summaries. Service-ready is not app/context-ready.                                                                       |
| `serve --agent` descriptor publication                   | Done               | Protects driver routes; no automatic build/launch from MCP. Normal WDIO cannot use the agent-served path yet.                                               |
| Cleanup failure fence                                    | Done, conservative | Failed cleanup retains `interactive.lock`; manual exact-owner/resource inspection is required. No automatic reclaim.                                        |
| Complete lifecycle settlement                            | Work in progress   | Guarded abandoned work, late acquisitions, exact resource ledger, and report/workload delegation separation need the shared resource model.                 |
| Durable quarantine wiring                                | Done               | Both native service paths use owner-only storage and exact-incarnation probes; restart is not recovery proof. Live endpoint qualification remains separate. |
| Supervisor crash containment                             | Work in progress   | Child lifelines, survivor reconciliation, stale-claim protocol, status/stop/recover tooling.                                                                |
| Storybook resource contributions                         | Work in progress   | Current integration substitutes its CLI lifecycle; retain the channel/driver child until relocation is justified and qualified.                             |
| MCP/WDIO handoff                                         | Work in progress   | Must await drain/deletion; attached-app handoff is independent of future supervisor-owned launch.                                                           |
| Supervisor-owned app lifetime                            | Work in progress   | Current session-owned launch/externally owned attach semantics remain; never silently retain or terminate another owner's app.                              |
| Cross-service/multi-target claims                        | Work in progress   | Target aliases and input mutexes are not exact-application exclusion; resolve registered-ID collisions before expanding hosts.                              |
| Bounded persisted run-query/control API                  | Work in progress   | Schemas belong here. Agents may eventually select only declared workload IDs, not commands/paths/environment.                                               |
| Automatic service reuse and per-user daemon              | Deferred           | Requires exact identity/config matching and evidence of need. Never adopt an unknown port occupant.                                                         |

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
