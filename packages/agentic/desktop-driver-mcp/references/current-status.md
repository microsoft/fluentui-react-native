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

| Capability                                          | State                           | Boundary/remaining work                                                                                                                                                                                               |
| --------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Six tools over shared driver schemas                | Done                            | Session, observe, act, check, capture, story. No separate execution path.                                                                                                                                             |
| Private descriptor and native identity verification | Done                            | Verifies before sending a grant. Uses the driver's `/native`, `/authority`, and `/client` subpaths, not its WebdriverIO-heavy root; boundary tests guard this dependency. No model URL/token/config/executable input. |
| Single-flight connection/session lifetime           | Done                            | Serial acquisition, close, operations and resource reads; late acquisition after dispose is cleaned up.                                                                                                               |
| Same-port protected restart/revocation              | Done in deterministic contracts | Invalid authority is forgotten; next call re-verifies discovery. No mutation replay. Live endpoint reruns remain required.                                                                                            |
| Same-authority transport retry                      | Done, bounded semantics         | Retain known session cleanup responsibility and rebind only after verification of the same incarnation/principal. This is not cross-MCP-connection resume.                                                            |
| Lost create response                                | Fenced; child drain implemented | `session-uncertain`; no repeated acquisition. Connection disposal revokes and drains the child, including unknown session ids. Live descriptor-path reruns not run for this change.                                   |
| Failed delete/disconnect                            | Done with limits                | Keep known-session responsibility; bounded dispose wait leaves late cleanup attached. Unreachable-service cleanup cannot be guaranteed; service drain/expiry remains necessary.                                       |
| Launch-mode discovery                               | Done                            | Status lists effective launch/attach modes; no predictable attach-first failure against launch-only targets.                                                                                                          |
| Progress, cancellation, paged image resources       | Done                            | Progress does not renew idle sessions; artifacts are session-bound and hash-checked.                                                                                                                                  |
| Storybook control                                   | Experimental                    | Driver selection/marker path exists; channel ingress/reconnect and full exclusive context authority remain incomplete.                                                                                                |
| Per-connection attenuated grants                    | Done in deterministic contracts | Each controller delegates a distinct driver-only child after verification; target/scope subsets and terminal-only cleanup retry. Native descriptor-path qualification not run for this change.                        |
| Cross-connection session resume                     | Intentionally unsupported       | No lease/grace or ownership-transfer protocol. Same-controller rediscovery retains its existing child; no automatic replay or cross-connection resume.                                                                |
| Workload/test orchestration tools                   | Work in progress                | Belong to a future harness control/client surface; adapter never becomes the resource owner.                                                                                                                          |
| General MCP-client qualification                    | Work in progress                | SDK stdio evidence exists; client-specific resource/image/cancellation behavior needs independent runs.                                                                                                               |

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

## Provisional F15 native endpoint records — 2026-11-06

**Exact source revision:** `388a60cc803ab78202a6f64f92e3f53b779c5c39`.
**App:** Agentic Components Storybook / ReactTestApp (configured bundle ID
`com.microsoft.fluentui.agenticstorybook`).
**OS:** macOS 27.2, arm64.
The reusable procedure is
`packages/agentic/desktop-test/references/native-qualification.md`.

These rows document the native smoke environment only. The smoke used the
non-agent WDIO path; no MCP descriptor was consumed, so these rows are not
descriptor-path passes.

| Renderer                       | Command and selection                                                                                                                   | Passed / failed / skipped / unsupported | Cleanup                                                                         | Artifact                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| macOS Fabric                   | `STORYBOOK_SMOKE_STORY=components-button--default yarn storybook smoke --macos --mode stories-and-tests`; 211 selected/executed         | 211 / 0 / 0 / 0                         | No owned processes or listeners on 21338/30029/45382; `interactive.lock` absent | `apps/storybook/artifacts/desktop/0f99740f-631b-444a-a705-76a9b4a761b7/run.json` |
| macOS Paper                    | `STORYBOOK_SMOKE_STORY=components-button--default yarn storybook smoke --macos --paper --mode stories-and-tests`; 211 selected/executed | 211 / 0 / 0 / 0                         | No owned processes or listeners on 21338/30029/45382; `interactive.lock` absent | `apps/storybook/artifacts/desktop/e82a83c2-a01d-41c0-b308-2551630e8b1e/run.json` |
| Windows Fabric descriptor path | Not run — Windows is unavailable on this macOS-only machine                                                                             | Not run; 0 selected                     | Not applicable                                                                  | None                                                                             |
| Win32 Paper descriptor path    | Not run — Win32 is unavailable on this macOS-only machine                                                                               | Not run; 0 selected                     | Not applicable                                                                  | None                                                                             |

| macOS descriptor-path renderer | Command / selection                            | Passed / failed / skipped / unsupported | Cleanup                                      | Artifact |
| ------------------------------ | ---------------------------------------------- | --------------------------------------- | -------------------------------------------- | -------- |
| Fabric                         | Not run; no descriptor consumed; selection N/A | 0 / 0 / 0 / 0; Not run                  | N/A for descriptor path; smoke cleanup above | None     |
| Paper                          | Not run; no descriptor consumed; selection N/A | 0 / 0 / 0 / 0; Not run                  | N/A for descriptor path; smoke cleanup above | None     |

Real-descriptor lifecycle, grant revocation, ambiguous create, resource
invalidation, protected args, quarantine/recovery, F2/F3/F4/F5 cases, and MCP
discovery/text/latency measurements remain **Not run** on this revision. Do not
attribute the WDIO callback counts to MCP. The initial Fabric smoke attempt
failed before selection because the generated CocoaPods sandbox was out of
sync; supported `prep` resolved it before the passing run. The story
environment selector did not constrain callback selection; the artifacts show
211 selected.

## 2026-11-06 partial descriptor-path evidence at `3c780cfd1bccaf510ece080e4be2b516c645989a`

App: Agentic Components Storybook / ReactTestApp,
`com.microsoft.fluentui.agenticstorybook`; macOS 27.2 arm64. The MCP SDK stdio
client used the default `agent-connection.json` descriptor against the real
native helper. The exact inline client launch command and connection/session
identifiers were not retained. No descriptor grants or story-args values are
recorded here. Manual MCP operations are not suite selections; the companion
driver `run.json` files each report 0 selected/0 executed tests.

| Renderer | Tool/operation evidence                                                                                                            | Result                                                                                                                                                                                                                                                                                                                                                                                                                                | Artifact / limitation                                                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fabric   | `desktop_session.status/open/close`; `desktop_story.story` select/reset; `desktop_observe` find/observe; `desktop_capture.capture` | Discovery showed attach-only. Select and reset were applied with marker verification (regions 1 then 2). A separate preview-child reference was rejected with `stale element reference`, reason `ref-region-changed`. Protected args returned `unsupported operation` / `story-args-unsupported`; an intermediate unchanged-story assertion was false, the final assertion was true, and no probe value appeared in error or journal. | Private `fabric-launch-mode-discovery.json`, `fabric-mcp-markers-resources.json`, `fabric-mcp-observe-resource-invalidation.json`, `fabric-protected-args-retry.json`, `fabric-protected-args-final.json`. |
| Fabric   | Anonymous/foreign-authority HTTP select, prepare, args; foreign WebSocket; idle channel                                            | HTTP returned 403 for all three mutation classes and native preview stayed unchanged. The first two foreign-WS assertions failed; the final attempt passed with no observer-message delta. The channel remained open after 21,003 ms idle and marker verification succeeded.                                                                                                                                                          | Private `fabric-f5-ingress-bypass.json`, `fabric-f5-ingress-bypass-retry.json`, `fabric-f5-ingress-bypass-final.json`, `fabric-f5-channel-idle.json`, `fabric-mcp-live-selection.json`.                    |
| Paper    | `desktop_session.status/open/close`; `desktop_story.story` select/reset; protected args; bypass and idle-channel checks            | Attach-only discovery, marker-settled selection/reset, protected args refusal, revocation/drain, bypass checks, and 21-second channel lifetime were reported. A protected preview reference was reported rejected after reset, but handle kind/generation and exact operation-level fields were not retained; classify that invalidation as Partial.                                                                                  | Private Paper driver/MCP logs in `f15-native-qualification-3c780cfd-20261106T0200/`; Paper run metadata: `apps/storybook/artifacts/desktop/a58d2fdd-5584-47f4-8747-5307607b4c0d/run.json`.                 |

The initial Fabric observation that a pre-reset reference was accepted after a
later observation remains **Inconclusive**: its handle kind (preview element,
MCP PNG resource, or chrome/window reference), stable identity relationship,
and explicit session continuity were not retained. Do not count an immutable
PNG resource or chrome/window reference surviving reset as a failure. The
separate retained preview-child stale-element rejection is expected behavior,
but does not prove the F5 same-native-ID-after-fresh-find seam. No additional
probe of the inconclusive sequence was run. The later F5 fix at
`2d8e8db001b64ebea85f0d6dce141f040fb5182d` is not part of this candidate; the
original observation is not attributed to that defect.

No aggregate MCP call count was retained. Dispose-during-open, failed delete,
ambiguous create, story quarantine/recovery, failed-cleanup claim retention,
F4 cancellation/readiness/render/lost-context/secondary-window cases, F3
failure-survivor injection, F5 legacy separation, and exact manifest-smoke
single-session/no-HTTP-fallback evidence remain Not run. Windows Fabric and
Win32 Paper are Not run on this macOS-only host. At handoff, the default
descriptor and workload lock were absent and the Storybook, Metro, and driver
ports had no listeners. The Fabric cleanup record reports owner exit,
descriptor removal, grant revocation, and attached-app preservation. Paper
cleanup was reported, but its process IDs were not retained for independent
PID-level confirmation.
