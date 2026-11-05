---
id: desktop-driver-mcp.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver-mcp
---

# Current adapter and measurement status

**Work in progress, updated 2026-11-05.** The adapter is a thin client, not a
supervisor. Keep this package name until actual harness-owned management tools
land; a later `desktop-mcp` facade must retain driver-only use and plan published
compatibility. Done below describes implementation, not full native qualification.
Follow-up work is tracked in
[desktop driver improvements (#4435)](https://github.com/microsoft/fluentui-react-native/issues/4435);
connection isolation is [#4440](https://github.com/microsoft/fluentui-react-native/issues/4440)
and the generalized management facet is
[#4450](https://github.com/microsoft/fluentui-react-native/issues/4450).

## Capability matrix

| Capability                                              | State                           | Boundary/remaining work                                                                                                                                                         |
| ------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Six tools over shared driver schemas                    | Done                            | Session, observe, act, check, capture, story. No separate execution path.                                                                                                       |
| Private descriptor and native identity verification     | Done                            | Verifies before sending a grant. No model URL/token/config/executable input.                                                                                                    |
| Single-flight connection/session lifetime               | Done                            | Serial acquisition, close, operations and resource reads; late acquisition after dispose is cleaned up.                                                                         |
| Same-port protected restart/revocation                  | Done in deterministic contracts | Invalid authority is forgotten; next call re-verifies discovery. No mutation replay. Live endpoint reruns remain required.                                                      |
| Same-authority transport retry                          | Done, bounded semantics         | Retain known session cleanup responsibility and rebind only after verification of the same incarnation/principal. This is not cross-MCP-connection resume.                      |
| Lost create response                                    | Fenced; recovery in progress    | `session-uncertain`; no repeated acquisition. Operator must revoke the old grant or replace the service. No session-enumeration shortcut.                                       |
| Failed delete/disconnect                                | Done with limits                | Keep known-session responsibility; bounded dispose wait leaves late cleanup attached. Unreachable-service cleanup cannot be guaranteed; service drain/expiry remains necessary. |
| Launch-mode discovery                                   | Done                            | Status lists effective launch/attach modes; no predictable attach-first failure against launch-only targets.                                                                    |
| Progress, cancellation, paged image resources           | Done                            | Progress does not renew idle sessions; artifacts are session-bound and hash-checked.                                                                                            |
| Storybook control                                       | Experimental                    | Driver selection/marker path exists; channel ingress/reconnect and full exclusive context authority remain incomplete.                                                          |
| Per-connection attenuated grants and resumable sessions | Work in progress                | Current supervisor publishes one shared agent grant. Labels are not client isolation.                                                                                           |
| Workload/test orchestration tools                       | Work in progress                | Belong to a future harness control/client surface; adapter never becomes the resource owner.                                                                                    |
| General MCP-client qualification                        | Work in progress                | SDK stdio evidence exists; client-specific resource/image/cancellation behavior needs independent runs.                                                                         |

See [connection](connection.md) and [tools](tools.md) for exact behavior.
Native and Storybook limitations are tracked in
`@fluentui-react-native/desktop-driver/references/current-status.md`;
supervision gaps in
`@fluentui-react-native/desktop-test/references/current-status.md`.

## Measured discovery and interaction costs

Historical measurements migrated from the root capability report, **not rerun**
by this update. `o200k_base` was used over all MCP text blocks; tokenizer package
version/raw portable artifact locator were not retained.

| Date / revision          | Measurement                            | Result                          | Boundary                                              |
| ------------------------ | -------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| 2026-11-04 / `41fc7473f` | Six-tool `tools/list`                  | 4,688 text tokens; 20,269 bytes | Discovery once per connection; not per operation      |
| Same                     | Server instructions                    | 120 text tokens                 | Additional discovery context                          |
| Same                     | Named Toggle + check + closing observe | 386 text tokens; 48 ms          | One warm macOS Fabric run, not a latency distribution |
| Same                     | Physical click + checked check         | 181 ms                          | One run                                               |
| Same                     | Observe default                        | 29-31 ms median, max 35 ms      | 20 warm calls per button/checkbox/menu story          |
| Same                     | Delta                                  | 32-35 ms median, max 37 ms      | Same 20-call-per-story method                         |

The app was macOS Fabric Storybook at 2720 x 1988 pixels on a 2x display,
served through `storybook driver --macos --agent`, driven by an MCP SDK stdio
client. Operation text/scoping comparisons and their completeness are retained
in the driver's status reference rather than duplicated here.

The schema test limits serialized JavaScript string length to 22,000
**characters**. It is not a token or UTF-8 byte limit. The earlier proposed
8 KiB discovery budget was not achieved; measured discovery is about 20.3 KB.
Changed descriptions/schema text invalidate an exact present-day 4,688-token
claim: retain that number only with its historical revision.

For each new run append revision, SDK/client version, platform/renderer,
tokenizer/version, serialized UTF-8 bytes and characters, text tokens,
instructions overhead, projection/budgets, sample count, cold/warm timing,
success/retry/cancellation/cleanup counts, and approved artifact locator.
Do not claim token reductions from reducing information scope or omitting
discovery. Windows and Paper measurements are currently **not recorded here**.

## Before full submission

Re-run same-port replacement, revocation, dispose during open, failed delete,
ambiguous create, and resource invalidation through the real descriptor path on
macOS and Windows. Qualify Windows Fabric and Win32 Paper independently, with
physical Ctrl+C and interactive input/capture cases where supported. Current
fake-host tests validate portable controller semantics, not native ownership,
signing, TCC, Windows ACLs, DPI, or process containment. This requalification is
tracked in [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).
