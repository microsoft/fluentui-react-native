---
id: desktop-driver-mcp.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver-mcp
---

# Current adapter and measurement status

**Work in progress, updated 2026-11-12.** The adapter is a thin client, not a
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
discovery. New macOS Paper samples are recorded in the dated F15
permission-enabled follow-up below; they do not fill earlier provenance gaps.

### Windows Fabric and Win32 Paper - 2026-11-08 UTC

Revision `9d3e11516` plus the uncommitted Windows ownership and foreground
helper changes, which do not alter tool text. MCP SDK 1.32.2 stdio client
through the default descriptor; `gpt-tokenizer` 4.1.0 with `o200k_base` over
every text block. Windows 11 build 26300, AMD64; Storybook served by
`yarn desktop-test --target windows|win32 --reporter json serve --agent`. The
console session was disconnected, so `click` was not measured; the toggle
row uses `activate`. Each endpoint made 139 calls with no errors or retries,
then closed its session. Runs `caba9e12-d9da-42a0-8b06-7300940e8318`
(Windows) and `5f75aac2-d74c-4969-aba3-bd8c925d5725` (Win32), each with its
`run.json` under `apps/storybook/artifacts/desktop/<run-id>/`.

| Measurement                                             | Windows Fabric                      | Win32 Paper                         |
| ------------------------------------------------------- | ----------------------------------- | ----------------------------------- |
| Six-tool `tools/list`                                   | 4,691 tokens; 20,277 bytes (chars)  | Same                                |
| Server instructions                                     | 120 tokens; 591 bytes               | Same                                |
| `open` (attach)                                         | 45 ms                               | 31-40 ms                            |
| Checkbox `activate` + `checked` check + default observe | 1,923 tokens; 5,346 bytes; 2,288 ms | 1,645 tokens; 5,187 bytes; 2,302 ms |
| Of which `activate`                                     | 2,190 ms                            | 2,196 ms                            |
| Observe default (100 of about 113 nodes, 20 calls)      | 66.7-73.7 ms median, max 93.1 ms    | 81.1-85.8 ms median, max 97.3 ms    |
| Observe text per call                                   | 1,801-1,843 tokens                  | 1,594-1,633 tokens                  |
| Delta (20 calls, idle)                                  | 72.7-77.5 ms median, max 98.4 ms    | 83.3-88.3 ms median, max 106.4 ms   |
| Delta text per call                                     | 368 tokens                          | 220 tokens                          |

Ranges span the Button, Checkbox, and Menu stories (`components-button--appearance`,
`components-checkbox--constrained-text`, `components-menu--default`); the
toggle row used `components-checkbox--default`. Observe used the default
budget, which emitted 100 nodes. On Windows an idle delta is never empty:
the React Native Test App's React, Debug, and System menu-bar items get new
references on every read (three removed, three added). The helper reuses a
reference only when the UI Automation runtime identity matches; whether these
items lack stable runtime identities is unconfirmed. Without those changes
the envelope is about 151 tokens. The Win32
idle delta was not decomposed. The first Win32 toggle attempt chose the
wrapping-label checkbox in `constrained-text` and returned a `stopped`
sequence; it is retained here, not diagnosed, and the default story was used
instead.

Discovery grew by 3 tokens and 8 bytes since `41fc7473f` from tool-text
changes. The Windows toggle rows are not comparable with the 386-token macOS
row: they target a different story and their closing observe is an unscoped
default observe, which accounts for most of their text.

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

## 2026-11-06 combined-candidate descriptor evidence at `a19fd3e1e7b3f1f443a241b1571cb029162f4ef2`

App: Agentic Components Storybook / ReactTestApp,
`com.microsoft.fluentui.agenticstorybook`; macOS 27.2 arm64. The helper was
rebuilt for this exact source and the fresh nonprompting permission preflight
reported Accessibility, PostEvent, and ScreenCapture granted. The MCP SDK
stdio client consumed the default private `agent-connection.json`; no
descriptor grants, private descriptor data, or story-args values are retained.
The descriptor-path commands were `yarn storybook driver --macos --agent`
and `yarn storybook driver --macos --paper --agent`, paired with
`yarn storybook run --macos` and `yarn storybook run --macos --paper`.
Manual MCP operation sequences are not suite selections; companion driver
run.json counts were 0 selected/0 executed.

| Renderer                     | Sanitized operation sequence and application outcomes                                                                                                                                                                                                                                                                                                                 | Result and locator                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fabric                       | `desktop_session.status` → `desktop_session.open(launch:false)` → `desktop_story.story(select)` → `desktop_observe.find` → authorized `desktop_story.story(select)` → `desktop_observe.observe(within)` → authorized `desktop_story.story(reset)` → old `observe(within)` → fresh `find` → fresh `observe(within)` → old `observe(within)` → `desktop_session.close`. | Passed. Same driver session/incarnation 1 throughout; preview-element aliases `element-ref-1` and `element-ref-2` were distinct. Select marker settled at region 2 and reset at region 3. Old ref returned `stale element reference` / `ref-region-changed` immediately after select and reset and after fresh find; fresh ref worked. Private sanitized record: `fabric-reference-sequence-retry.json`.                                                                                                                                                                                                        |
| Paper                        | Same operation sequence as Fabric.                                                                                                                                                                                                                                                                                                                                    | Passed with the same identity, marker, region, stale-old-ref, and fresh-ref outcomes. Private sanitized record: `paper-reference-sequence.json`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Fabric idle channel          | `desktop_session.status` → `open` → idle 21,002 ms → `status` → `close`.                                                                                                                                                                                                                                                                                              | Passed; status and close succeeded after idle. Private record: `fabric-idle-channel-21s.json`. No equivalent Paper interval on this SHA.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Fabric same-port replacement | Old client: `desktop_session.status` → `open` → `desktop_observe.find` (0 matches) → service stopped/replaced on the same ports → old client `desktop_session.status` → `desktop_session.close`.                                                                                                                                                                      | Partial (recorded Failed at qualification; reclassified on contract review): the first post-replacement status returned `mcpIsError:true`, `error:"adapter"`, `reason:"service-unavailable"`, the designed fail-closed rejection that the same-port contract asserts before the next call re-verifies discovery; close then succeeded. Close is a no-op once invalid authority forgets the session, so native rediscovery was not demonstrated. No old-reference operation was possible because find returned 0 matches, and no mutation was sent. Sanitized record: `fabric-same-port-replacement-final.json`. |
| Fabric physical input        | `desktop_act` physical click was sent once after one corrected request shape.                                                                                                                                                                                                                                                                                         | Partial/inconclusive: MCP returned success and sequence completed, but the client parser did not retain `result.steps[0].act` mechanism/disposition. Not a physical-input pass and not repeated. Private record: `fabric-physical-input-retry-corrected.json`.                                                                                                                                                                                                                                                                                                                                                  |

Separate non-agent manifest-backed smoke passed 211/211 callbacks in both
renderers, with 0 failed, skipped, unsupported, incomplete, retries, or flaky
results. These runs are the legacy lane, not protected-ingress evidence, and
the recorded artifacts do not establish the requested one-session/no-HTTP-
fallback invariant. Fabric artifact:
`apps/storybook/artifacts/desktop/a2475e8d-7ea9-465f-8461-b8f115cfcee5/run.json`;
Paper artifact:
`apps/storybook/artifacts/desktop/87f0452f-5fd7-48eb-8494-a63202842521/run.json`.

The initial Fabric service replacement attempt encountered a retained
`interactive.lock`; it was not removed until its exact recorded owner exited
and the lock showed no resources or unresolved effects. A subsequent launch
attempt was correctly refused while that claim remained; after verified
cleanup, the replacement service started normally. Final cleanup verified
owned app and service PIDs exited, ports 21338/30029/45382 had no listeners,
the descriptor and lock were absent, and no external app was stopped.
Anonymous/foreign HTTP and WS bypass, protected args refusal, grant revocation,
dispose-during-open, failed delete, ambiguous create, resource invalidation
beyond preview elements, quarantine/recovery, F3/F4 injections, and Paper
same-port/idle/physical-input cases are Not run on this exact SHA.

## 2026-11-06 Windows Fabric and Win32 Paper descriptor evidence

Source: the PR branch at `1f5333e25` plus `8458bde48` and `a6b89e924`; host
Windows 11 Enterprise build 26300, AMD64. Commands:
`yarn storybook driver --windows|--win32 --agent`, then
`yarn storybook run --windows|--win32`; the MCP SDK stdio client consumed the
default private `agent-connection.json`. No grants, descriptor data, or story
args values are retained. Manual MCP calls are not suite selections. The full
matrix (Windows Fabric 15 Pass, 1 Partial, 1 Failed, 7 Not run; Win32 Paper
15 Pass, 2 Partial, 7 Not run), run records, and cleanup are in the "Windows
Fabric and Win32 Paper qualification — 2026-11-06" section of
`packages/agentic/desktop-test/references/current-status.md`.
These rows supersede the macOS-host "Not run" Windows rows above for the
Windows host only.

| Area                    | Windows Fabric and Win32 Paper outcome                                                                                                                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same-port replacement   | Pass on both. The old client's status returned `service-unavailable` and its refs returned `no-session`; a later call rediscovered the new service, and close and a new open succeeded. The first select after replacement returned `relaunch-required` (rejected, effect none). No old mutation replayed. |
| Authority faults        | Pass on both for grant revocation, dispose during open, failed delete, and ambiguous create (`session-uncertain` until the grant was revoked). Windows grant revocation and failed delete each passed on a rerun; the first attempts are retained in the desktop-test ledger.                              |
| Resources and refs      | Pass on both. Preview element refs became stale after reset and after the next select; chrome/window refs kept their identity; the immutable MCP PNG resource stayed readable after reset with a matching digest. One session and incarnation 1 throughout each sequence.                                  |
| Quarantine and recovery | Pass on both. An interrupted select returned `story-not-ready` (indeterminate, quarantined); later mutations in the same session returned `target-quarantined` while reads worked. A new session's exit probe lifted the quarantine, and select and reset applied with marker verification.                |
| Protected args          | Pass on both: `story-args-unsupported`, with no value in the response.                                                                                                                                                                                                                                     |
| F4 cancellation         | Pass on both. After a client abort at 150 or 40 ms, replaying the request ID returned the recorded applied result, and the next mutation applied in the same session.                                                                                                                                      |
| F5 ingress and lifetime | Pass on both. Unauthenticated HTTP returned 403, an anonymous WebSocket received only the hello request, and the session stayed usable after about 21 s idle.                                                                                                                                              |
| Not run                 | Failed-cleanup claim retention, live cleanup and restart, F4 readiness/render faults, F4 secondary windows, F3 survivors, F5 manifest smoke, and F5 legacy separation. No MCP discovery-size or latency measurements were recorded on Windows.                                                             |

## 2026-11-07 UTC Windows follow-up

Source `386f0585edae2450ab22e6d359e2fe4db3399555`, plus validation,
atomic-report repairs, and guidance. The seven Not run rows above were exercised; the
additive desktop-test ledger now records Windows 21 Pass, 2 Partial, 1 Fail
and Win32 21 Pass, 3 Partial. Full run IDs, ref kinds/identities/generations,
failure history, and operator cleanup proof are in
`packages/agentic/desktop-test/references/current-status.md`.

The real SDK stdio client continued to use only the default private
descriptor and native-verified service. Delayed readiness rejected a stale
correlation; correlated render faults quarantined the same session while
chrome reads remained usable. Old preview refs expired. No fresh preview
root was exposed after those errors, so this does not fill Win32's
fresh-preview fence gap. Secondary Callout probes were Partial: no separately
registered secondary target was selected.

Exact failed-cleanup and startup-survivor claims blocked replacement until
the original stop callbacks settled. After exact operator reconciliation, new
descriptor-backed services selected/reset with marker verification in
Windows session `fbbdadc4-aa0e-45a9-9862-124052bc5e4e` and Win32 session
`0245de0c-c004-4c76-865d-7458b62f999f`. Normal shutdown removed discovery,
revoked authority, freed ports/resources, and preserved attached apps.

Manifest smoke/legacy traces were separate **unprotected** workloads. They
used no descriptor or grant and provide no additional protected-ingress
evidence. The initial local probe's cached `bridge-unavailable` loop was a
request-ID reuse error: the corrected client issued a new ID only after
rejected/effect-none proof, never after an indeterminate mutation. Earlier
failed attempts and the local control-file crash remain recorded.

The final separate non-agent smoke runs passed: Windows
`1825d9aa-2c25-4a2c-8524-ceadcf52ad68` (234 passed, 78 skipped) and
Win32 `8c6f58e1-3591-4f1b-b008-c52a718d3ca2` (214 passed, 52 skipped).
Windows recovered one atomic-report sharing conflict with a journal warning;
Win32 needed none. All sessions closed and cleanup removed owned processes,
listeners, and the workload claim; no default descriptor remained. These
runs issued no descriptor grant and do not change the descriptor matrix's
Partial or Fail outcomes.

## 2026-11-08 UTC connected descriptor-path checks

Source `fec94cec4995c7372b798877c5412ddcb156523b`, Windows 11 Enterprise
build 26300, AMD64. An MCP SDK stdio client used the default private
descriptor and attached to the real, instance-matched Storybook app under an
exclusive claim. These are manual operations, not selected suite tests.

| Endpoint       | Driver run / MCP session                                                        | Physical checkbox                                                             | Target PNG                                    |
| -------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------- |
| Windows Fabric | `af97fdb3-68de-4ce9-836e-935331528c8e` / `6ab236be-dc25-4b53-97f9-4e6ce8875ab2` | Pass: 2 applied `physical-pointer` actions, unchecked -> checked -> unchecked | Pass: 42,436 bytes, resource SHA-256 verified |
| Win32 Paper    | `3294d66d-9332-4639-95fe-8d3047f47e46` / `8d75052d-ddae-48f9-a1c1-2c8abcf8a019` | Pass: 2 applied `physical-pointer` actions, unchecked -> checked -> unchecked | Pass: 31,639 bytes, resource SHA-256 verified |

Each session selected `components-checkbox--default`, checked every state,
read the PNG through its MCP resource, verified its signature and digest,
and closed. The Windows case supersedes the earlier failed physical-click
attempt for this bounded descriptor-path operation. The first Windows
readiness attempt ended after 30 rejected, effect-none retries while Metro
was still building; a later attempt passed.

On Win32, a session-local injection closed the authenticated bridge after
selection. A newly observed preview checkbox was unavailable (`find: none`)
while the chrome root remained present; fresh-preview mutation fencing and
chrome mutation remain Partial, not passes. An initial 10-second wait timed
out before the observed bridge retirement; the subsequent attempt waited for
retirement. No raw image or grant is retained in this reference. Driver
shutdown, app cleanup, and the failed Win32 app-run reports are
recorded in `packages/agentic/desktop-test/references/current-status.md`.

## F15 macOS Paper measurement prerequisite — 2026-11-12

Source `505a2187b0a2451aed7081c9260b343d55742f93`; macOS 27.2.1
(26B131), arm64. The stable-signed helper's noninteractive doctor reported
Accessibility=false and PostEvent=false, with ScreenCapture=true. The
driver ledger at `packages/agentic/desktop-driver/references/current-status.md`,
section "F15 non-AX macOS supporting evidence — 2026-11-12",
retains the exact diagnostic command and signing identity; its local artifact
is `artifacts/desktop/f15-20261112/doctor.json`.

The initial pass was **blocked**: macOS Paper MCP interaction/text/latency
measurements needed Accessibility/PostEvent. That prerequisite was resolved
later the same day; it is no longer an owner-action block.
In the initial pass no Paper Storybook app or MCP session was launched, no measurement command
was run, and 0 tests were selected/executed (no new pass, failure, or skip
counts). Cleanup is N/A for MCP; the diagnostic helper exited. The non-AX
helper self-test does not qualify the adapter or change historical measurement
claims.

### F15 permission-enabled MCP follow-up — 2026-11-12

**Observed, partial; not macOS requalification.** Source:
`141b88b4b81a1bd9a0472de533681f9274d8cb00`; macOS 27.2.1 (26B131),
arm64. App: Agentic Components Storybook / ReactTestApp, bundle
`com.microsoft.fluentui.agenticstorybook.id915e78595`.
Fabric target: `macos-a6dfeaccb13e643a`; Paper target:
`macos-de43c71d45415315`. Nonprompting doctor reported
Accessibility/PostEvent/ScreenCapture true; no privacy changes were made.
All native/GUI commands used the machine-wide native lock and the stable
`FURN Desktop Driver Development` identity/cache described in the driver
ledger's F15 follow-up.

The local evidence root is `artifacts/desktop/f15-20261112T115411Z/`.
The session-local probe used the public MCP SDK 1.32.2 and shipped
desktop-driver-mcp 0.1.3 stdio CLI with the real private
`agent-connection.json` descriptor. No grant or descriptor contents were
printed or copied to evidence. Tokenizer: `gpt-tokenizer` 4.1.0,
`o200k_base`; compact JSON for discovery, newline-joined MCP text blocks for
operation text. UTF-8 bytes and JavaScript characters were recorded
independently. These bounded samples are not a controlled cold-start
benchmark, reliability window or cross-client qualification.

Fabric command, from the repository root:
`node artifacts/desktop/f15-20261112T115411Z/qualify.mjs fabric lifecycle`.
It starts `yarn storybook driver --macos --agent --reporter json`, then
`yarn storybook run --macos --reporter json` in `apps/storybook`.
Results: **10 passed, 1 failed, 0 skipped manual checks** in
`fabric-lifecycle-qualification.json`. Revocation, dispose-during-open,
ambiguous CREATE and failed DELETE before/after dispatch used the SDK
in-memory transport with the real native service and verified descriptor:
response loss was injected at the public typed-client method boundary,
not with a TCP proxy or by forcing native cleanup failure. Each connection
drained and the target reservation could be reacquired.

The stdio pass observed same-port service replacement, authoritative
invalidation of the old session, fresh verified discovery, `no-session`
refusal of the old mutation, target capture/resource reading, session-close
resource expiry and read cancellation. The first group-SIGTERM harness
attempt retained a descriptor and failed restart; it remains recorded in
`fabric-qualification.json`, with exact-record reconciliation in
`descriptor-reconciliation.json`. It is not a successful ordinary shutdown.

Fabric's physical checkbox click **failed**, not passed: the sequence stopped
before dispatch (`element click intercepted`, `obscured`, effect `none`).
Its 107-token / 438-byte / 1,187.5-ms response measures a refusal.
No successful physical click/check/observe interaction cost is claimed.
The driver's F15 open finding records the reproduction and routing.

| Fabric measurement                           | Observed result                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Six-tool discovery                           | 4,693 tokens; 20,287 UTF-8 bytes / characters                                                                              |
| Server instructions, additional to discovery | 120 tokens; 591 UTF-8 bytes / characters                                                                                   |
| First attach after discovery                 | 846.4 ms; one sample, excludes service/app startup                                                                         |
| Default observe, 20 calls per story          | Median 21.9–27.8 ms across stories; p90 1,127.7–1,669.0 ms; maximum 1,680.2 ms; 905–948 tokens, 2,778–3,061 bytes per call |
| Idle delta, 20 calls per story               | Median 21.5–26.3 ms; p90 1,122.0–1,671.9 ms; maximum 1,688.1 ms; 151–152 tokens, 464–469 bytes per call                    |
| Read cancellation                            | Caller aborted after 301.5 ms; subsequent observe passed; no mutation cancellation claim                                   |

The three stories were `components-button--appearance`,
`components-checkbox--constrained-text` and `components-menu--default`.
The default 100-node projection completed in all 60 observations and all
60 deltas; no retries. The slow maxima are retained rather than hidden by
the medians. These samples do not establish equal information content to
historical Windows or other story projections.

#### Paper descriptor, interactions and completeness

From the repository root,
`node artifacts/desktop/f15-20261112T115411Z/qualify.mjs paper`
used `yarn storybook driver --macos --paper --agent --reporter json`
and `yarn storybook run --macos --paper --reporter json`.
It recorded **14 passed, 4 failed, 0 skipped manual assertions**
(`paper-qualification.json`), not selected suite tests. The four failures
were keyboard clear, its dependent semantic-clear precondition, refused
physical Checkbox click and unsupported semantic Checkbox activation.
The latter two sequences were `stopped` despite non-error MCP envelopes;
they were not accepted as interactions.

The same real-descriptor lifetime/fault boundaries described for Fabric
passed on Paper, including same-port invalidation, fresh discovery,
`no-session` old-mutation refusal, read cancellation followed by a usable
session, target PNG resource reading/hash verification and expiry on close.
The exact app PID/start-time/executable survived session and service close.
Paper's channel survived one 22-second idle interval. The fault probes
wrapped public typed-client methods, not native cleanup or TCP failures.

Discovery independently matched Fabric: six tools, **4,693 tokens /
20,287 UTF-8 bytes / characters**, plus 120 tokens / 591 bytes of server
instructions. First attach was 831.6 ms, excluding service/app startup.
All latency values below are client wall time; p90 uses nearest rank.
Each row has 20 calls, zero retries and zero call failures. Defaults used
the 100-node projection, not a full-tree request.

| Paper story / operation                          | p50 / p90 / max, ms      | Text tokens | UTF-8 bytes | Complete projections |
| ------------------------------------------------ | ------------------------ | ----------- | ----------- | -------------------- |
| `components-button--appearance`, observe         | 31.8 / 1,142.7 / 1,689.3 | 1,188–1,189 | 3,533–3,537 | 20 / 20              |
| Same story, delta                                | 31.5 / 1,152.0 / 1,671.9 | 151–152     | 465–467     | 20 / 20              |
| `components-checkbox--constrained-text`, observe | 34.1 / 1,688.0 / 1,698.8 | 1,201–1,202 | 3,750–3,752 | 20 / 20              |
| Same story, delta                                | 33.9 / 1,696.4 / 1,701.6 | 151–152     | 465–467     | 20 / 20              |
| `components-menu--default`, observe              | 34.1 / 1,158.7 / 1,706.5 | 1,313–1,322 | 3,862–3,866 | **0 / 20**           |
| Same story, delta                                | 36.4 / 1,159.7 / 1,710.1 | 151–152     | 468–470     | 20 / 20              |

**Observed:** each Paper Menu observation emitted 100 of 103 matching
nodes, `maxNodes`, three omitted; these are incomplete observations, not
full-information comparison samples. Complete deltas do not repair that
truncation. Fabric's complete projections and these Paper projections are
not equivalent scopes. Window dimensions and display scale were not
retained for this run; the cached stable helper and running app make these
warm operation samples, not controlled cold-start measurements.
Paper read cancellation took 302.2 ms; post-dispatch mutation cancellation
was **Not run**.

The Paper physical-click refusal cost 1,172.4 ms / 106 tokens / 438 bytes;
the provider's **Unsupported** semantic activation cost 743.9 ms /
79 tokens / 329 bytes. Neither is a successful click/check/observe cost.
The independent
`node artifacts/desktop/f15-20261112T115411Z/qualify.mjs paper input`
probe recorded **4 passed, 1 failed, 0 skipped manual checks**:
semantic clear, physical-input delivery, protected args and the following
real stdio MCP interaction passed; Paper keyboard clear still failed after
bounded polling. Exact harnesses and defect reproduction are retained in the
driver and consumer ledgers.

| Successful Paper Input interaction, one sample                  | ms      | Tokens | UTF-8 bytes |
| --------------------------------------------------------------- | ------- | ------ | ----------- |
| `desktop_act` type `F15`, keyboard mechanism, applied/completed | 837.5   | 74     | 261         |
| `desktop_check` value equals `F15`, passed on first read        | 30.1    | 96     | 322         |
| Closing default `desktop_observe`, complete, 90 emitted nodes   | 1,148.2 | 1,201  | 3,611       |
| Sum of those three calls                                        | 2,015.7 | 1,371  | 4,194       |

This sum excludes discovery, attach, story reset and close. No mutation was
retried; each measured call ran once. It is a successful text-entry/value
interaction, **not physical Checkbox activation** and not directly comparable
to historical toggle costs or projections. Artifact:
`paper-input-qualification.json`.

**Cleanup passed:** `cleanup-audit.json`, 2026-11-12T12:20:26Z, records no
worktree processes, no listeners on 39860/23935/28029, no descriptor and
no per-user workload claim; the native-lock wrapper exited and the lock
was unheld afterward. Reliability, durable TCC continuity, other MCP clients,
native cleanup/survivor faults and the outstanding F3/F4/F5 acceptance
cases listed in the consumer ledger remain **Not run** on this source.
Both renderer smokes failed; the permission prerequisite is resolved but
#4441's macOS acceptance is not met.
