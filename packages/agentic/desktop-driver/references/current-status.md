---
id: desktop-driver.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Current status

This document describes the capabilities, limits and native qualification state of the application-neutral desktop driver.
Done means the stated implementation exists and is covered by deterministic tests; it does not mean every native endpoint is qualified.
Parent issue: [#4435](https://github.com/microsoft/fluentui-react-native/issues/4435), which records dependencies and parallel waves for the follow-up work.
See [architecture](architecture.md) for boundaries and [remaining work](remaining-work.md) for the delivery-gate inventory cited by [#4345](https://github.com/microsoft/fluentui-react-native/issues/4345) and [#4348](https://github.com/microsoft/fluentui-react-native/issues/4348).
The approved direction is a stronger `desktop-test` workload host with native authority here and MCP as a client; no coordinator package or daemon is added, and management and run schemas stay in the harness.

## Status overview

The driver, its W3C service, typed clients and agent operations are implemented and covered by deterministic tests.
All four endpoints (macOS Fabric, macOS Paper, Windows Fabric, Win32 Paper) have bounded physical-input Storybook smoke passes at the revisions listed under Native qualification.
Failure-path, descendant, reliability and release-matrix qualification remain open on every endpoint.

- **Service and clients:** Done. The W3C service and typed and WDIO clients accept registered targets only. See [Service and clients](#service-and-clients). Tracking: [#4450](https://github.com/microsoft/fluentui-react-native/issues/4450).

- **Sessions and input:** Qualified (macOS Fabric and Paper signed ownership contracts; physical-input smokes on all four endpoints). One reservation per target, exact application exclusion and physical-input postconditions are implemented; failure-path qualification is open. See [Sessions and input](#sessions-and-input). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441), [#4349](https://github.com/microsoft/fluentui-react-native/issues/4349).

- **Discovery, grants and authority:** Done. Verified private discovery and attenuated connection principals are covered by deterministic contracts. See [Discovery, grants and authority](#discovery-grants-and-authority). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Mutation settlement and recovery:** Done. Native mutations settle before advancing and uncertain changes quarantine. See [Mutation settlement and recovery](#mutation-settlement-and-recovery). Tracking: [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451).

- **Observation and actions:** Done. Bounded observation, find, action, check, sequence and named accessibility actions. See [Observation and actions](#observation-and-actions).

- **Capture and artifacts:** Done. Artifacts are bounded and session-bound; Windows and Win32 capture qualification is open. See [Capture and artifacts](#capture-and-artifacts). Tracking: [#4348](https://github.com/microsoft/fluentui-react-native/issues/4348).

- **Storybook story control:** In progress. Catalog, select and reset are an experimental integration; native cancellation and fault injection are unqualified. See [Storybook story control](#storybook-story-control). Tracking: [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449).

- **Crash containment and continuity:** In progress. The ownership ledger and reclaim live in desktop-test, and application exit reports relaunch-required without restoring state. See [Crash containment and continuity](#crash-containment-and-continuity). Tracking: [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451), [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Recording, replay and visual comparison:** Deferred. There is no recording export, event tail or visual comparison. See [Recording, replay and visual comparison](#recording-replay-and-visual-comparison).

- **Platform scope:** Unsupported for Intel macOS and distributed or remote control. See [Platform scope](#platform-scope). Tracking: [#4345](https://github.com/microsoft/fluentui-react-native/issues/4345).

## Service and clients

### Behavior and limits

- The W3C service and the typed and WDIO clients accept registered targets only.
- Browser-inapplicable commands are either explicitly unsupported or have no route. New Session ignores the `timeouts` capability; use Set Timeouts after connecting.
- The compatibility `./agent` API does not bound provider work. Use [agent operations](operations.md) for budgeted inspection.
- The driver has no Storybook, React or React Native dependency; package-boundary tests reject forbidden imports and dependencies.
- The optional story provider is injected.

### Open work

- [#4450](https://github.com/microsoft/fluentui-react-native/issues/4450): native qualification of the harness-owned management facet and transport.

## Sessions and input

### Behavior and limits

- One reservation exists per registered target in one service.
- Each session's commands and all physical input are serialized, including across helper processes.
- Exact macOS application exclusion and the physical-input mutex passed signed AppKit contracts.
- Windows behavior is unchanged by the macOS ownership work.
- Failed-cleanup claims stay fenced; there is no automatic reclaim.
- Packaged Windows launches are `uncontained` and fenced; packaged activation receives no cleanup authority over another controller.
- The Windows helper's Job Object (suspended-create) ends an unpackaged application it launched when the helper dies.
- Windows ownership retains canonical image, native creation time, session and packaged identity; a changed start, session, image or ambiguous match fails closed, and an unreadable native start stays fenced.
- Native recovery settles a different recorded start without control or termination access.
- A Win32 native-app build is unsupported.

### macOS physical input

- Physical element clicks verify the hit and pointer acknowledgment before pressing. Keyboard clear verifies focus and the resulting value.
- Raw `performActions` requires a live exact application lease for button presses, drags, scrolls and new key presses. Unverified window hits or foreground refuse before posting the action; owned input can still be released after focus changes.
- The physical lane clamps its window to the visible frame (maximum 1024 x 768 with a one-point inset) and verifies the exact requested rectangle.
- A genuinely overlapped 480 x 302 window refuses physical input safely.
- A locked console blocks physical-input lanes; no unlock or privacy change is attempted.
- Keyboard clear confirms focus, selects the whole value with document-navigation chords once, posts Delete once and verifies an empty value; unreadable values refuse before any key, and there is no key replay or semantic fallback.
- Pointer motion is acknowledged for a bounded wait (about 200 ms) before any button press.
- Foreground activation checks its postcondition and requests workspace activation once when the acknowledged write did not establish it.
- Only hits proven to belong to another process get a distinct window identity; same-process covering windows and unproven owners refuse as `obscured`, effect `none`, with no activation, because raising through a popup could dismiss it.
- The physical Fabric lane needs the rnmacos native-props backport documented in `@fluentui-react-native/native-core/references/rnmacos-patch.md`.
- Exact macOS identity uses kernel start timestamps, causal direct-child or LaunchServices capture and exact-primary cleanup; both launch kinds are `uncontained`, and unknown or stale identity never authorizes termination.
- Primary exit is not descendant containment.
- Strict clear requires an explicit mechanism: invalid mechanisms and missing elements are refused with no effect.
- Doctor `ready` describes artifact availability, not permission readiness.
- Unreadable geometry can appear as zero in legacy rectangles or use a cached window frame. XML page source can report unsupported enabled/visible states as `false`; bounded `observe` carries unsupported states and can omit unavailable geometry.
- A known destroyed window ID is retired, but a missed destruction notification can allow recovery by exact title to bind a replacement window in the same live lease. `closeWindow` does not independently confirm destruction.
- Hosted macOS physical input runs in an advisory CI lane ([#4500](https://github.com/microsoft/fluentui-react-native/pull/4500)); hosted skips are not passes.

### Windows secondary windows and activation

- Windows secondary and popup windows register as distinct targets with bounded discovery and recovery; their handles retire when closed.
- Modern Pressable and Button controls refuse semantic activation honestly with `activation-unsupported`, effect `none`, without a physical fallback.
- Legitimate Invoke and Toggle activation works.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): live requalification of renderer and failure paths across the four endpoints, including checkbox and Accordion physical activation and Paper keyboard clear.

- [#4349](https://github.com/microsoft/fluentui-react-native/issues/4349): required native CI, including managed macOS physical-input lanes.

## Discovery, grants and authority

### Behavior and limits

- Native identity is verified before any credential is transmitted.
- All protected driver routes authenticate.
- Storybook agent manifests additionally disable alternate channel mutations in the integration adapter.
- Driver, workload and recovery scopes are distinct.
- Delegation is fixed and driver-only over HTTP; child grants only attenuate targets and scopes.
- Revocation fences the subtree synchronously and drain is awaitable and retryable.
- Runner handoff grants are attenuated runner or controller grants with bounded busy by default and operator-authorized preemption.
- A target reservation is granted only after in-flight acquisition, session deletion and controller-subtree drain settle; a revocation callback alone is not a drain barrier.
- Failed cleanup stays fenced and retryable; unknown runner input is rejected before any grant or reservation.
- Settled drains restore the 4096 live and draining grant capacity; only the last 4096 settled cleanup proofs are retained, never pending or failed proof.
- Shared descriptor or workload holders must relinquish; they are not preempted as a subtree.
- Storybook integration and retained launches use the attach-only handoff; their native qualification is separate from the generic phase in [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491). Cross-connection resume and replay remain unsupported.
- Descriptor-path native requalification has not been run for the attenuation work.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): descriptor-path requalification.

## Mutation settlement and recovery

### Behavior and limits

- Native mutations settle before the queue advances.
- Uncertain story changes quarantine instead of assuming a later render is safe.
- Generic and Storybook native paths share the harness factory's private settlement storage and exact-incarnation probes.
- Direct library embedders must pass `recovery`; a restart is not proof.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): integrated survivor, interrupted-publication and recovery parity for generic native applications.

## Observation and actions

### Behavior and limits

- Observation enforces provider capability and budget checks and reports completeness and truncation explicitly.
- Reference generation is session-local; reopen after application replacement.
- A sequence has up to eight steps; request-id outcomes prevent replay within their retained session history.
- Nothing replays across service replacement.
- Named accessibility actions invoke one uniquely named action through agent operations and WDIO (`desktopPerformAccessibilityAction`).
- The W3C named-action route is fenced against stale Storybook preview context like click, clear and value.

### Open work

- None tracked beyond the endpoint qualification in [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

## Capture and artifacts

### Behavior and limits

- Artifacts are session-bound, bounded and hashed; pixels are opt-in.
- Screenshots are evidence, not visual comparison.
- Hosted Windows policy disables physical input and can reject capture with `0x80070057`; these skips stay explicit and are not passes.
- Hosted physical-input and capture skips are not passes; Windows doctor `--permissions` is unsupported.
- Win32 capture of a minimized window returns `unsupported operation` without restoring it.
- A successful `activate` does not qualify a refused physical click.

### Open work

- [#4348](https://github.com/microsoft/fluentui-react-native/issues/4348): Windows and Win32 capture qualification.

## Storybook story control

### Behavior and limits

- Catalog, select and reset are an experimental integration.
- Authenticated epochs persist per native-verified application incarnation, with versioned marker conformance, prompt disconnect failure and stale preview rejection.
- Unknown navigation effects quarantine.
- Story selection can return allowlisted, service-local timing observations and a native-verified PID and start-time pair; they are diagnostics, not marker fields, context identity or authority to clear quarantine ([#4496](https://github.com/microsoft/fluentui-react-native/pull/4496)).
- A zero advisory timing count is not visual qualification.
- Story args are unsupported on the protected driver (`story-args-unsupported`), including for the session-owning grant and the controlled orchestrator.
- HTTP and foreign WebSocket args are refused or not relayed, without logging values.
- Controlled HTTP mutations return 403, and foreign WebSocket selection, prepare and args never reach the runtime.
- Authenticated driver prepare and select use settlement and fencing.
- The non-agent channel remains legacy and unprotected; non-agent smoke is not driver evidence.
- Preview context checks preserve chrome and secondary references.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): native cancellation and fault injection, fresh preview after lost context, secondary windows.

## Crash containment and continuity

### Behavior and limits

- The exact ownership ledger, surviving-resource reconciliation and lifelines belong to desktop-test.
- Windows hard-terminates non-detached children when the owner crashes, so cooperative crash-disposal contracts are skipped there.
- After a full-service restart, a private authenticated-epoch record plus exact live-incarnation proof yields renderer-specific relaunch-required with effect none.
- Initial absence and exited or replaced applications stay bridge-unavailable.
- Failed or unknown probes are contract-tested only.
- There is no transparent restoration or quarantine recovery.
- The inspected RN Storybook 10.7.1 and Storybook 10.6.5 transport does not reconnect.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): supervisor crash, descendants and interrupted publication on live endpoints.

- [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451): repeated-run reliability window.

## Recording, replay and visual comparison

### Behavior and limits

- There is no agent-session-to-WDIO export.
- The window-events route returns its full bounded ring; there is no event-tail API.

## Platform scope

### Behavior and limits

- The macOS helper is arm64; Intel macOS is unsupported.
- The service is loopback-only; distributed and remote control are unsupported.
- macOS requires Accessibility and PostEvent (and ScreenCapture for capture) permissions; the stable-signed helper reports them without prompting.

## Native qualification

Results are per endpoint and tied to the revision that produced them; skipped checks are not passes.
Full per-run evidence lives in the linked pull request or issue.
The parameterized procedure is `@fluentui-react-native/desktop-test/references/native-qualification.md`.
Live requalification is tracked in [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441) and the repeated-run support matrix in [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451).

### macOS Fabric

- **Story control, restart:** bounded marker, stale-reference and restart checks passed at `6fca14788`; M3 at `41fc7473f`.

- **Neutral ownership, inspection, exclusion:** signed checks and 224 accessible smoke checks passed.

- **Physical input at `b66140d7b`:** `DESKTOP_INPUT=physical yarn storybook smoke --macos --mode stories-and-tests` passed 343, 3 declared unsupported, 0 failed locally, and the advisory hosted physical job passed the same selection ([#4500](https://github.com/microsoft/fluentui-react-native/pull/4500)).

- **Earlier gap closed:** the lifecycle run at `141b88b4b` had the Checkbox physical click refused as obscured and Accordion focus-clicks failing; [#4500](https://github.com/microsoft/fluentui-react-native/pull/4500) fixed them ([#4493](https://github.com/microsoft/fluentui-react-native/pull/4493) holds the failing run).

- **Exact application ownership:** signed AppKit ownership, inspection, exclusion and physical-input mutex contracts passed ([#4492](https://github.com/microsoft/fluentui-react-native/pull/4492)); permission-enabled supporting evidence in [#4493](https://github.com/microsoft/fluentui-react-native/pull/4493).

- **Handoff:** native selection at `87bc8b710` passed 27 identity and backend cases, but the real-descriptor consumer failed because Accessibility and PostEvent were false then; native handoff and worker-crash drain are unqualified ([#4491](https://github.com/microsoft/fluentui-react-native/pull/4491)).

- **Still required:** native cancellation and fault injection, fresh preview after lost context, secondary windows, supervisor crash, descendants, interrupted publication and the reliability window ([#4441](https://github.com/microsoft/fluentui-react-native/issues/4441), [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451)).

### macOS Paper

- **Story control, restart:** hosted build and smoke, and bounded checks at `6fca14788`.

- **Neutral ownership, inspection, exclusion:** separately signed checks and 224 accessible smoke checks passed.

- **Physical input at `b66140d7b`:** physical smoke passed 343, 3 declared unsupported, 0 failed on rerun after an unrelated Captive Network Assistant window obscured six cases (the first attempt failed 7); a focused smoke passed 225/225; the Paper hosted physical lane does not exist ([#4500](https://github.com/microsoft/fluentui-react-native/pull/4500)).

- **Keyboard clear:** fixed by [#4500](https://github.com/microsoft/fluentui-react-native/pull/4500) after [#4493](https://github.com/microsoft/fluentui-react-native/pull/4493) found the value stayed nonempty; semantic `activate` remains Unsupported by the Paper provider.

- **Still required:** cancellation and fault injection, fresh preview after lost context, secondary windows, and failure and reliability qualification ([#4441](https://github.com/microsoft/fluentui-react-native/issues/4441)).

### Windows Fabric

- **Desktop package preview checks:** the shared Windows/Win32 helper built for both endpoints and passed 869/869 native self-test checks with physical input masked at [`f3bf1767c`](https://github.com/microsoft/fluentui-react-native/commit/f3bf1767c). These cover first window listing, input ranges and origin geometry, empty-ledger recovery, startup hardening and injected Direct3D device loss. Release candidate app, physical-input and live device-loss checks were not run.

- **Windows and Win32 preview limitations ([#4441](https://github.com/microsoft/fluentui-react-native/issues/4441)):** a UI Automation `E_FAIL` pattern query can fall through to a different pattern; a renamed or moved executable can fail without a stable identity reason; a process creation failure may report settlement as `exited`; action durations still cap at 30 seconds; diagnostic byte truncation can split UTF-8; and XML page source can report unsupported enabled/visible states as `false`.

- **Observation and story MCP path:** M3 real-app observation recorded at `600235c35`.

- **Connected-console physical smokes at `fec94cec4`:** Checkbox and Callout physical-input Storybook smokes passed 203/203 with zero failures, skips or retries; the real MCP descriptor path passed physical checkbox clicks with hash-verified PNGs ([#4469](https://github.com/microsoft/fluentui-react-native/pull/4469)).

- **Secondary windows and activation at `6c626602c`** (remote unlocked RDP session, not console): a distinct secondary window's physical-pointer click was applied with `focus: confirmed` and its handle retired; modern main controls refuse semantic activation with `activation-unsupported`, effect `none` ([#4498](https://github.com/microsoft/fluentui-react-native/pull/4498)).

- **Application ownership at `da89fe9bc`:** 11/11 actual-endpoint consumer cases and 6/6 provider cases passed locally; hosted selection ran 0 of the 11 consumer cases ([#4494](https://github.com/microsoft/fluentui-react-native/pull/4494)).

- **Handoff at `b1bbb26df`:** the generic runner contract against the plain Win32 fixture passed 5/5 with zero skips (handoff, preemption, worker crash, lost grant response, capture), and the identity and backend selection passed 24 with 19 macOS-only cases skipped ([#4491](https://github.com/microsoft/fluentui-react-native/pull/4491)).

- **Hosted CI:** Windows Storybook PR smoke 255/255 and native desktop-driver 1,254 tests passed at `86be8531e` ([#4498](https://github.com/microsoft/fluentui-react-native/pull/4498)).

- **Still required:** 200% and mixed DPI, negative-origin and minimized windows, live lock, RDP and elevation transitions, popups other than Callout, capture cancellation, kernel PID recycling, arbitrary descendants, and a console rerun of the interactive wheel, keyboard and capture contracts ([#4441](https://github.com/microsoft/fluentui-react-native/issues/4441), [#4348](https://github.com/microsoft/fluentui-react-native/issues/4348)).

### Win32 Paper

- **Desktop package preview checks:** the same [Windows provider checks and limitations](#windows-fabric) apply. Release candidate REX app, physical-input and live device-loss checks were not run.

- **Agent path and native fixture:** M3 and agent path recorded; native fixture physical input and capture at 100% and 150%.

- **Connected-console physical smokes at `fec94cec4`:** Checkbox and Callout physical-input Storybook smokes passed 177/177; physical checkbox clicks through the MCP descriptor passed ([#4469](https://github.com/microsoft/fluentui-react-native/pull/4469)).

- **Secondary windows and fresh-preview fencing at `6c626602c`:** the exact owned tool secondary registered with exact-root UIA content and a physical-pointer click was applied (native delivery only, not proof of the RN focus command); injected fresh-preview fencing returned `ref-region-changed` and `story-context-stale` with effect `none` (provider retirement, not crash or reconnect proof) ([#4498](https://github.com/microsoft/fluentui-react-native/pull/4498)).

- **Real lost context:** after an authenticated-bridge disconnect the fresh preview reference is not exposed (Partial), and the exact REX process outlived the closed window after MCP close, reporting failed cleanup.

- **Application ownership at `da89fe9bc`:** 11/11 consumer and 6/6 provider cases passed locally ([#4494](https://github.com/microsoft/fluentui-react-native/pull/4494)).

- **Handoff at `b1bbb26df`:** the same generic plain-Win32-fixture runner contract passed ([#4491](https://github.com/microsoft/fluentui-react-native/pull/4491)).

- **Hosted CI at `86be8531e`:** accessible 233/233; physical 288/289 with 1 unsupported; legacy E2E passed ([#4498](https://github.com/microsoft/fluentui-react-native/pull/4498)).

- **Still required:** mixed DPI, production-bundle Metro reload (unsupported), failure paths, and a console rerun of the current native contracts ([#4441](https://github.com/microsoft/fluentui-react-native/issues/4441)). Hosted input and capture skips are not passes.

### Hosted CI and portable evidence

- **Windows oversized-tree fallback:** compiled and contract-tested on hosted CI only; no live Windows qualification.

- **Generic native applications:** historical macOS Calculator and plain Win32 evidence; a probe alone is not real-app lifecycle qualification.

## Measurements

Measured on macOS Fabric Storybook at `41fc7473f`, 2720 x 1988-pixel window (1360 x 994 points, 2x), via `yarn storybook driver --macos --agent` and an MCP SDK stdio client over three marker-confirmed stories (button, checkbox, menu).
Token counts use `o200k_base`, include every returned text block and the result envelope (about 150 tokens for observation and delta payloads), and exclude MCP discovery (see `@fluentui-react-native/desktop-mcp/references/current-status.md`).
All observations were complete. Windows and Paper need their own rows; do not extrapolate.

| Result                         | Measured text tokens  | Scope and notes                                        |
| ------------------------------ | --------------------- | ------------------------------------------------------ |
| `furn/tree`, pretty JSON       | 12,972-13,643         | 63-67 KB; 142-150 nodes                                |
| Same tree, minified            | 7,102-7,469           | Same nodes                                             |
| Page source XML                | 6,244-6,562           | Same app state                                         |
| `furn/window-events`           | 5,331-5,352           | Entire bounded ring, not a recent tail                 |
| `observe`, `all` outline       | 1,602-1,859           | 86-88% below pretty JSON                               |
| `observe`, `all` JSON nodes    | 3,290-3,375           | Explicit JSON projection                               |
| `observe`, default interactive | 1,122-1,304           | 74-76 elements; not the same scope as all nodes        |
| `observe`, content             | 1,199-1,373           | 79-80 elements                                         |
| `observe`, story-root scope    | 252-311               | 2-6 elements                                           |
| Unchanged delta                | 149-150               | Retained-sample comparison                             |
| One-element delta              | 192                   | Checkbox toggled                                       |
| Find story root / button role  | about 200 / about 490 | Unique / multiple matches                              |
| Check                          | about 81              | Small predicate result                                 |
| Capture without pixels         | about 140             | Metadata, hash, resource link                          |
| Journal, default 50-entry page | about 3,570           | Bounded page                                           |
| Stories, first 25              | 637                   | Full 209-story catalog in three 100-entry pages: 5,429 |

Latency through the MCP client at `41fc7473f` (one run unless noted; a historical measurement, not a performance guarantee):

| Operation                      | Median   | Qualification                      |
| ------------------------------ | -------- | ---------------------------------- |
| Default observe                | 29-31 ms | 20 warm calls per story; max 35 ms |
| Delta                          | 32-35 ms | 20 warm calls per story; max 37 ms |
| Physical click + checked check | 181 ms   | One run, not a distribution        |
| Named Toggle + check + observe | 48 ms    | One run; 386 text tokens           |

Helper-side journal timings at `c84acb741` (61 recorded macOS failure-evidence sets, different app states; do not subtract from end-to-end timings): snapshot 0-2 ms, attach 2 ms (max 983 ms), probe 5 ms, perform actions 19 ms, tree 58 ms, find 65 ms (p90 498 ms), source 79 ms, physical click 121 ms, capture 152 ms.
Recorded median full tree at `c84acb741`: 157 nodes, 69 interactive roles, 12 testIDs, depth three; pretty 14.2k tokens, minified 7.8k, XML source 6.8k, window events 5.0k (512 + 128-entry ring).
Earlier synthetic compact-outline and screenshot-token figures were estimates, not measurements, and are not retained.
The historical report kept no portable raw-artifact locator or tokenizer package version.

When recording a measurement, state commit, OS and architecture, renderer, story, window size and scale, helper build and signing mode, cold or warm state, sample count, tokenizer version, projection and budgets, completeness, discovery overhead and the client-versus-helper timing boundary; report p50, p90 and max with retries, failures and skips.

## Maintaining this document

- Edit only the topic your change affects, and keep that topic's line in the status overview in step with it.
- Describe what is true now. Do not add dated entries, run logs, or "updated" stamps.
- Record per-run evidence (commands, counts, run ids, artifact locations, cleanup outcome) in the pull request description or the tracking issue, and keep only the latest result for each endpoint here with a link to that record.
- Put remaining-work detail in the tracking issue and link the issue from the topic's open-work list; remove the link when the issue closes.
- Write one sentence or fact per line, and keep a blank line between adjacent list entries that different changes are likely to edit, so concurrent changes merge independently.
- Historical results stay tied to the revision that produced them and are never reported as qualifying a later revision.
- Skipped checks are not passes; report each endpoint (macOS Fabric, macOS Paper, Windows Fabric, Win32 Paper) separately.
- The detailed per-run ledger that preceded this format is preserved in git history: `git show a7af2b4b2:packages/agentic/desktop-driver/references/current-status.md`.
