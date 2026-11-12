---
id: desktop-driver.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Current capability and qualification status

**Work in progress, updated 2026-11-12.** "Done" below means the stated
implementation exists, not that every native endpoint is qualified or that the
complete orchestration product is ready for submission. Historical measurements
remain tied to their original revision; they were not rerun by this update.
See [architecture](architecture.md) for boundaries and
[remaining work](remaining-work.md) for open delivery gates. Follow-up
lifecycle, orchestration, and qualification work is tracked in
[desktop driver improvements (#4435)](https://github.com/microsoft/fluentui-react-native/issues/4435)
and its sub-issues, which record dependencies and parallel waves.

## Capabilities

| Capability                                                 | State                                  | Boundary or remaining work                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W3C service and typed/WDIO clients                         | Done                                   | Registered targets only; native browser-inapplicable commands explicitly unsupported.                                                                                                                                                                                                                                                                                                                                                                           |
| Application-neutral driver                                 | Done                                   | No Storybook, React, or React Native dependency; package-boundary tests reject forbidden imports/dependencies. Optional story provider is injected.                                                                                                                                                                                                                                                                                                             |
| Native sessions and command/input queues                   | Done                                   | One reservation per registered target in one service. Exact macOS application exclusion and the physical-input mutex passed signed AppKit contracts on 2026-11-12. Renderer and failure-path qualification remains separately scoped below. Windows behavior is unchanged.                                                                                                                                                                                      |
| Verified private discovery and grants                      | Done                                   | Native identity verified before credential transmission; all protected driver routes authenticate. Storybook agent manifests additionally disable alternate channel mutations in the integration adapter.                                                                                                                                                                                                                                                       |
| Attenuated connection principals and permission scopes     | Done in deterministic contracts        | Driver/workload/recovery scopes are distinct; fixed driver-only HTTP delegation, target/scope subsets, synchronous subtree fencing and awaitable/retryable drain. Native descriptor-path requalification not run for this change.                                                                                                                                                                                                                               |
| Mutation effects, settlement, quarantine                   | Done                                   | Native mutations settle before advancing. Uncertain story changes now quarantine instead of assuming a later render is safe.                                                                                                                                                                                                                                                                                                                                    |
| Durable settlement storage and trusted recovery API        | Done                                   | Generic/Storybook native paths share the harness factory's private storage and exact-incarnation probes. Direct library embedders must pass `recovery`; restart is not proof.                                                                                                                                                                                                                                                                                   |
| Bounded observation, references, paging, deltas            | Done                                   | Provider capability/budget checks, explicit completeness and truncation. Reference generation is session-local; reopen after application replacement.                                                                                                                                                                                                                                                                                                           |
| Find, action, check, sequence                              | Done                                   | Up to eight sequence steps; request-id outcomes prevent replay within their retained session history. No replay across service replacement.                                                                                                                                                                                                                                                                                                                     |
| Capture and artifact pages                                 | Done                                   | Session-bound bounded artifacts and hashes; pixels are opt-in. Screenshots are evidence, not visual comparison.                                                                                                                                                                                                                                                                                                                                                 |
| Named accessibility actions                                | Done                                   | Agent operations and WDIO (`desktopPerformAccessibilityAction`) invoke one uniquely named action; the W3C route is fenced against stale Storybook preview context like click, clear and value.                                                                                                                                                                                                                                                                  |
| Story catalog/select/reset                                 | Done, experimental integration         | Local lifetime/signal context, authenticated epochs persisted per native-verified app incarnation, versioned marker conformance, prompt disconnect failure, and stale preview rejection. Bounded macOS Paper/Fabric marker and stale-reference checks passed at `6fca14788`; native cancellation/fault injection remain unqualified. Unknown navigation effects still quarantine.                                                                               |
| Story args on protected driver                             | Intentionally unsupported              | `story-args-unsupported`, including the session-owning grant and controlled orchestrator. HTTP and foreign WebSocket args are refused/not relayed without logging values; legacy unprotected args remain separate.                                                                                                                                                                                                                                              |
| Exclusive Storybook control                                | Work in progress: native qualification | Deterministic endpoint evidence: controlled HTTP mutations return 403; foreign WS selection/prepare/args never reach the runtime; authenticated driver prepare/select uses F4 settlement and fencing. Non-agent channel remains legacy unprotected. Native endpoint evidence not yet run: macOS Paper/Fabric, Windows Fabric/Win32 Paper. Preview context checks preserve chrome/secondary references.                                                          |
| Supervisor crash containment and automatic reclaim         | Work in progress outside driver        | Exact ownership ledger, surviving-resource reconciliation, and lifelines belong to desktop-test. The Windows helper's Job Object ends an unpackaged application it launched when the helper dies; packaged launches are `uncontained`.                                                                                                                                                                                                                          |
| Application-exit/reconnect continuity                      | Work in progress                       | Bounded macOS Paper/Fabric full-service restart checks passed at `6fca14788`: private authenticated-epoch record plus exact live-incarnation proof yields renderer-specific relaunch-required, effect none. Initial absence and exited/replaced apps stay bridge-unavailable; failed/unknown probes are contract-tested only. No transparent restoration or quarantine recovery; inspected RN Storybook 10.7.1 / Storybook 10.6.5 transport does not reconnect. |
| Recording/replay export, event-tail API, visual comparison | Work in progress/deferred              | No agent-session-to-WDIO export; window-events still returns its full bounded ring.                                                                                                                                                                                                                                                                                                                                                                             |
| Intel macOS and distributed/remote control                 | Unsupported                            | Current macOS helper is arm64; service is loopback-only.                                                                                                                                                                                                                                                                                                                                                                                                        |

The approved direction is a stronger `desktop-test` workload host, with native
authority here and MCP as a client. No coordinator package or daemon is being
added. Management/run schemas stay in the harness, not this package.

## Native evidence and full-submission gates

| Lane                           | Recorded evidence through 2026-11-12                                                                                                                             | Still required before full submission                                                                                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| macOS Fabric                   | M3 at `41fc7473f`; bounded F4/restart at `6fca14788`; signed neutral ownership/inspection/exclusion and 224 accessible smoke checks on 2026-11-12                | Native cancellation/fault injection, fresh preview after lost context, secondary windows, physical pointer/normal-keyboard/capture paths, supervisor crash, descendants, interrupted publication and reliability window. |
| macOS Paper                    | Hosted build/smoke and bounded F4/restart at `6fca14788`; separately signed neutral ownership/inspection/exclusion and 224 accessible smoke checks on 2026-11-12 | Native cancellation/fault injection, fresh preview after lost context, secondary windows, physical pointer/normal-keyboard/capture paths and complete failure/reliability qualification.                                 |
| Windows Fabric                 | M3 real-app observation and story MCP path recorded at `600235c35`                                                                                               | Same-branch lifetime/restart and failure gates; 200%/mixed DPI, minimized/negative-origin windows, live lock/RDP/elevation, popups, capture cancellation.                                                                |
| Win32 Paper                    | M3/agent path recorded; native fixture physical input/capture at 100% and 150%                                                                                   | Interactive rerun of current native contracts; physical Ctrl+C, mixed DPI and failure paths. Hosted input/capture skips are not passes.                                                                                  |
| Generic native applications    | Historical macOS Calculator/plain Win32 evidence; signed AppKit ownership and physical-input mutex passed on 2026-11-12                                          | Integrated survivor/interrupted-publication/recovery parity; a probe alone is not real-app lifecycle qualification.                                                                                                      |
| This update's portable changes | Deterministic fake-host MCP, authority, and story regression coverage; the Windows oversized-tree fallback passed hosted CI                                      | CI and matching-OS live evidence are distinct. The oversized-tree fallback is compiled and contract-tested only on hosted CI; no live Windows qualification.                                                             |

Hosted Windows policy disables physical input and can reject capture with
`0x80070057`. Capability-gated skips must stay explicit. `activate` succeeding
does not qualify a refused physical click. Each new lifecycle/native change
needs its own endpoint evidence; a final aggregate matrix is not a substitute.
Live requalification of these lanes is tracked in
[#4441](https://github.com/microsoft/fluentui-react-native/issues/4441), and
the repeated-run support matrix in
[#4451](https://github.com/microsoft/fluentui-react-native/issues/4451).
The parameterized procedure is
`packages/agentic/desktop-test/references/native-qualification.md`.

### Provisional F15 macOS evidence — 2026-11-06

**Provisional; exact source revision `388a60cc803ab78202a6f64f92e3f53b779c5c39`.**
App: Agentic Components Storybook / ReactTestApp (configured bundle ID
`com.microsoft.fluentui.agenticstorybook`). OS: macOS 27.2, arm64.
The helper was explicitly built and the noninteractive doctor reported
Accessibility, PostEvent, and ScreenCapture preflight `true`, console unlocked,
ad-hoc signing, and designated requirement
`cdhash H"0d2e7a81dfd4695b7fb84aa1b3242f5e1773e8b4"`.

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

The `STORYBOOK_SMOKE_STORY` value did not constrain the callbacks in these
runs; `run.json` recorded 211 selected. An initial Fabric attempt failed before
test selection because CocoaPods was out of sync. `yarn storybook prep --macos`
resolved that environment prerequisite; the failed attempt is retained at
`apps/storybook/artifacts/desktop/2e42a0aa-506d-4edb-a3ca-32e5b7c26b04/run.json`.
These smoke runs used the non-agent WDIO path. They do **not** qualify the MCP
descriptor lifecycle, native story quarantine/recovery, F2/F3/F4/F5 integration,
or physical-input/capture requirements. The descriptor rows are not run on
this baseline revision; update them on the combined integration SHA after the
real descriptor-path pass.

### 2026-11-06: bounded F4 restart qualification

Source revision `6fca1478871f41ec884fb4bd2cff66cff8197833` includes mainline
`cd0ede21489c9ab8cb76fea07c4dec2e9699389f` through merge
`35057966aeb20b70756af4e83c58c3242675aa72`. macOS arm64 Paper and Fabric
were run separately. These are bounded acceptance checks, not full smoke or
reliability passes.

**Passed:** the nonprompting preflight
`FURN_DESKTOP_DRIVER_BUILD_POLICY=never yarn desktop-driver doctor --platform macos --permissions`
reported AX, PostEvent and screenCapture all `true`. The cached helper retained
cdhash `0d2e7a81dfd4695b7fb84aa1b3242f5e1773e8b4`; no helper rebuild, permission
prompt, TCC change or unrestricted capture was used.

**Passed separately for Paper and Fabric:** authenticated button navigation,
actual native marker conformance, rejection of an old preview reference after
another selection, and continued usability of an existing chrome reference.
The bounded authored command was
`FURN_DESKTOP_DRIVER_BUILD_POLICY=never yarn storybook test --macos --test '*exposes enabled button semantics*'`
(append `--paper` for Paper). Passing authored run IDs, beneath
`apps/storybook/artifacts/desktop/`, were
`c462e891-a755-4a27-9b63-9eb07f64934b` (Paper) and
`cd1ef4ac-8f38-4d3e-ac06-0d957ade0207` (Fabric).

**Passed separately for Paper and Fabric:** stop the entire driver supervisor
while preserving the authenticated app; start a fresh driver; verify the
unchanged authenticated epoch and exact live PID/start time. The story route
returned `relaunch-required`, the matching renderer, and mutation effect
`none`. The same bounded authored command intentionally failed navigation
with that typed error; it is not an authored-test pass. Independent native
route assertions passed. The private endpoint/target storage namespace and
epoch survived the service restart without relying on the rotated manifest.

**Passed separately for Paper and Fabric:** quit the recorded app and driver,
launch a replacement app before its channel exists, then restart the driver.
The route returned `bridge-unavailable`, effect `none`, and removed the exited
incarnation's record. A subsequent no-record check remained unavailable.
Initial absence before authentication also returned unavailable, effect `none`.
Early Paper startup attempts failed navigation while the runtime was not ready;
they remain failures, not passes hidden by the later settled run. The earlier
Fabric full-catalog traversal with app-stop AppleEvent `-1712` remains a failed
smoke command; bounded reruns used verified-process cleanup instead.

**Passed:** focused and owning-package checks, clean-cache `yarn lage buildci`
(178 tasks), and `yarn lage test-links --verbose --grouped` (90 tasks).
Private session evidence is retained under `files/f4-validation/`:
`restart-{paper,fabric}-{markers,record,assert,replaced-assert}.log`,
`restart-permissions.log`, `restart-buildci.log` and `restart-test-links.log`.
After both lanes, owned apps, supervisors, Metro, channels and helpers were
stopped; ports 23489, 39627 and 30542 and the interactive lock were verified
clear, and the exclusive validation slot was released.

**Not run natively:** post-dispatch cancellation, delayed ready/error/render
fault injection, fresh-preview actions after lost context, secondary windows
and physical input. **Not run:** Windows Fabric and Win32 Paper qualification.
Portable contract coverage is not native evidence for these gaps.

## Measurement ledger

Preserved from the former root capability report, not newly measured here.
Use **Measured** for observed product/recorded-run data, **Estimate** for
synthetic/token-formula calculations, and **Not run** for missing evidence.
Do not silently replace historical rows with current claims.

### 2026-11-04: delivered operation text costs at `41fc7473f`

**Measured.** macOS Fabric Storybook, 2720 x 1988-pixel window (1360 x 994
points, 2x display), served by `yarn storybook driver --macos --agent`.
An MCP SDK stdio client rendered `components-button--default`,
`components-checkbox--default`, and `components-menu--default`, each
marker-confirmed. Baseline routes and new operations sampled the same app
state. `o200k_base` token counts include every returned text block and the
result envelope; all observations were complete, without truncation.

| Result                         | Measured text tokens | Scope/notes                                            |
| ------------------------------ | -------------------- | ------------------------------------------------------ |
| `furn/tree`, pretty JSON       | 12,972-13,643        | 63-67 KB; 142-150 nodes                                |
| Same tree, minified            | 7,102-7,469          | Same nodes                                             |
| Page source XML                | 6,244-6,562          | Same app state                                         |
| `furn/window-events`           | 5,331-5,352          | Entire bounded ring, not a recent tail                 |
| `observe`, `all` outline       | 1,602-1,859          | Same 142-150 nodes; 86-88% below pretty JSON           |
| `observe`, `all` JSON nodes    | 3,290-3,375          | Explicit JSON projection                               |
| `observe`, default interactive | 1,122-1,304          | 74-76 elements; not the same scope as all nodes        |
| `observe`, content             | 1,199-1,373          | 79-80 elements                                         |
| `observe`, story-root scope    | 252-311              | 2-6 elements                                           |
| Unchanged delta                | 149-150              | Retained-sample comparison                             |
| One-element delta              | 192                  | Checkbox toggled                                       |
| Find story root                | About 200            | Unique result                                          |
| Find button role               | About 490            | Multiple matches                                       |
| Check                          | About 81             | Small predicate result                                 |
| Capture without pixels         | About 140            | Metadata, hash, and resource link                      |
| Journal, default 50-entry page | About 3,570          | Bounded page                                           |
| Stories, first 25              | 637                  | Full 209-story catalog in three 100-entry pages: 5,429 |

Envelope overhead was about 150 tokens for observation/delta payloads, not a
universal floor for every operation. Include MCP discovery separately:
`@fluentui-react-native/desktop-driver-mcp/references/current-status.md`.

### 2026-11-02 baseline: recorded evidence at `c84acb741`

**Measured from 61 recorded macOS failure-evidence sets**, not a new live
session. Same tokenizer and window dimensions; different app states from the
November 4 comparison. Median full tree: 157 nodes, 69 interactive roles,
12 testIDs, maximum depth three.

| Representation               | Median tokens | Range or limitation                      |
| ---------------------------- | ------------- | ---------------------------------------- |
| Pretty tree evidence         | 14.2k         | 11.6k-18.4k; about 70 KB                 |
| Minified tree                | 7.8k          | Same retained evidence                   |
| Minified tree without rects  | 4.8k          | Less information, not equivalent content |
| Legacy application describe  | 9.4k          | Depth 3 / 100-node bound                 |
| Legacy story-scoped describe | 223           | Maximum 2.1k                             |
| XML page source              | 6.8k          | Recorded source                          |
| Window events                | 5.0k          | Full 512 + 128-entry ring                |

Earlier synthetic compact-outline estimates (824 tokens all named nodes,
683 interactive, 39 story-scoped) excluded delivered references/action metadata
and envelopes. They are **not measurements** and must not be used as product
targets already achieved. The screenshot estimate of about 1,530 Claude or
1,105 OpenAI high-detail image tokens applied then-published resize formulas to
the 2720 x 1988 PNG; it is not measured billing or a current model guarantee.
Third-party agent-device comparisons were not same-app measurements and are not
retained as product evidence.

### Historical latency, not a current performance guarantee

| Date/revision and measurement boundary            | Operation                      | Median   | Tail/qualification                 |
| ------------------------------------------------- | ------------------------------ | -------- | ---------------------------------- |
| 2026-11-04 / `41fc7473f`, MCP client end-to-end   | Default observe                | 29-31 ms | 20 warm calls per story; max 35 ms |
| Same                                              | Delta                          | 32-35 ms | 20 warm calls per story; max 37 ms |
| Same                                              | Physical click + checked check | 181 ms   | One run, not a distribution        |
| Same                                              | Named Toggle + check + observe | 48 ms    | One run; 386 text tokens           |
| 2026-11-02 / `c84acb741`, recorded helper journal | Snapshot/windows               | 0-2 ms   | Different app states               |
| Same                                              | Attach                         | 2 ms     | Max 983 ms                         |
| Same                                              | Probe                          | 5 ms     | Helper-side only                   |
| Same                                              | Perform actions                | 19 ms    | Helper-side only                   |
| Same                                              | Tree                           | 58 ms    | Full tree, not bounded observe     |
| Same                                              | Find                           | 65 ms    | p90 498 ms; max 693 ms             |
| Same                                              | Source                         | 79 ms    | Max 1.16 s                         |
| Same                                              | Physical click                 | 121 ms   | Helper-side only                   |
| Same                                              | Capture window                 | 152 ms   | Helper-side only                   |

Do not subtract helper timings from end-to-end timings or compare them as a
controlled speedup. Five reads estimated as one interactive observation and
four unchanged deltas cost about 1.7k-2.1k text tokens **plus discovery**; that
is a calculated scenario, not an observed five-turn agent session.

### Recording the next measurement

Append a dated run with commit, OS/architecture, renderer, application/story,
window dimensions/scale, helper build/signing mode, cold/warm state, sample
count, tokenizer/version, exact projection/budgets, completeness, text blocks
included, discovery overhead, and client-versus-helper timing boundary.
Retain an approved artifact/report locator without credentials, private paths,
application text, or raw screenshots. Record missing artifacts as unavailable.
The historical report did not retain a portable raw-artifact locator or tokenizer
package version; those provenance gaps remain, rather than inventing them.

Report p50/p90/max with sample count, retries, failures, skipped capabilities,
and cleanup status. Compare equivalent assertions and complete scopes.
Windows and Paper measurements need their own rows; do not extrapolate macOS
Fabric numbers.

### 2026-11-06: partial native evidence at `3c780cfd1bccaf510ece080e4be2b516c645989a`

App: Agentic Components Storybook / ReactTestApp
(`com.microsoft.fluentui.agenticstorybook`), macOS 27.2 arm64. The exact
candidate helper was built with `yarn storybook build-driver --macos`; fresh
nonprompting preflight was
`yarn desktop-driver doctor --platform macos --permissions`. Accessibility,
PostEvent, and ScreenCapture were all `true`; no prompt or permission change
was made. The console was on and unlocked. The helper was arm64/release,
ad-hoc signed, with designated requirement
`cdhash H"0d2e7a81dfd4695b7fb84aa1b3242f5e1773e8b4"`. Host load was 3.25 /
4.41 / 3.81 at 1/5/15 minutes. Detailed preflight output is kept privately as
`f15-native-qualification-3c780cfd-20261106T0200/doctor.json`.

| Renderer     | Command and selection                                                                                                                                                       | Outcome                                                                                                                                                                                                                                                           | Cleanup and artifact                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| macOS Paper  | `yarn storybook driver --macos --paper --agent`; app via `yarn storybook run --macos --paper`; MCP calls used the default descriptor. Driver run selected/executed 0 tests. | Attach-only discovery, capture, normal selection/reset, protected-args refusal, revocation, and 21-second channel check were reported. Same-port restart/rediscovery was partial because explicit old-session close was not retained.                             | Cleanup was reported; ports 21338/30029/45382 had no listeners and the lock/descriptor were absent at handoff. Paper process IDs were not retained for PID-level confirmation. Driver run: `apps/storybook/artifacts/desktop/a58d2fdd-5584-47f4-8747-5307607b4c0d/run.json`; private `paper-native-capture.png`.                                                                                                                                       |
| macOS Fabric | `yarn storybook driver --macos --agent`; app via `yarn storybook run --macos`; MCP calls used the default descriptor. Driver run selected/executed 0 tests.                 | Attach-only discovery and capture passed. Selection/reset markers settled; F5 HTTP/WS bypass checks and 21,003 ms idle-channel check passed. The old-reference acceptance remains inconclusive; the physical-input attempt returned `physicalInputApplied:false`. | Fabric cleanup record reports the service owner exited, descriptor removed/grant revoked, and attached app preserved through service shutdown; ports had no listeners and the lock/descriptor were absent at handoff. Driver run: `apps/storybook/artifacts/desktop/c15a35b9-7b8d-4edb-adba-84e3cd5a3023/run.json`; app launch: `apps/storybook/artifacts/desktop/8fb9a576-cde8-470c-a8bb-a76b6d8fabc0/run.json`; private `fabric-native-capture.png`. |

The capture operation succeeded for both renderers. Fabric's first capture
caller attempt used the wrong argument shape and failed; the corrected
documented `image` field succeeded. This caller error is retained and is not
counted as a product failure. The separate Paper non-agent manifest smoke
selected 319, executed/passed 308, failed 0, skipped 11, unsupported 0,
incomplete 0, retries 0, flaky 0; it is not descriptor-path evidence. The
three 319-count run artifacts do not all preserve renderer metadata, so only
the Paper-attributed artifact is credited to Paper.

Fabric's first two foreign-WebSocket bypass assertions failed, followed by a
final attempt that passed with no observer-message delta; the cause is
unknown. An intermediate protected-args record had a false unchanged-story
assertion, while the final record was unchanged and value-free. The overall
bypass/args results are therefore recorded as Partial in the harness matrix.
The physical-input attempt returned `physicalInputApplied:false`; it was not
retried.

This is not full native qualification. Dispose-during-open, failed delete,
ambiguous create, quarantine/recovery, failed-cleanup claim retention, faulted
F3 survivor reconciliation, F4 cancellation/readiness/render/lost-context/
secondary-window cases, and legacy-lane separation were not run. Physical
input did not pass. Windows Fabric and Win32 Paper are Not run on this host.
The F5 reference-generation fix at
`2d8e8db001b64ebea85f0d6dce141f040fb5182d` is outside the tested SHA and needs
a new native run; do not attribute the original inconclusive probe to it.

## 2026-11-06 combined-candidate macOS evidence at `a19fd3e1e7b3f1f443a241b1571cb029162f4ef2`

App: Agentic Components Storybook / ReactTestApp
(`com.microsoft.fluentui.agenticstorybook`), macOS 27.2 arm64. The exact
arm64/release helper was rebuilt with
`yarn storybook build-driver --macos`; fresh nonprompting
`yarn desktop-driver doctor --platform macos --permissions` reported
Accessibility, PostEvent, and ScreenCapture granted. No permission changes
were made. Helper fingerprint:
`b58e4d8692702fd1dfa16b73ac987d1738e6e17d16757cbc3c6007722b8e3869`;
ad-hoc signing designated requirement:
`cdhash H"0d2e7a81dfd4695b7fb84aa1b3242f5e1773e8b4"`.
Observed quiet host load was 2.49 / 5.27 / 5.47 (1/5/15-minute averages).

| Renderer     | Command and selection                                                                                                                                                                                                                                           | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Cleanup and artifact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| macOS Fabric | `yarn storybook driver --macos --agent`; app `yarn storybook run --macos`; manual MCP descriptor session, 0 automated tests selected/executed. Separate `yarn storybook smoke --macos --mode stories-and-tests`: 211 selected/executed.                         | Retained preview-element sequence passed: same session/incarnation 1; select settled at region 2, reset at region 3; old element alias rejected after both transitions; fresh find produced a distinct alias that worked; old alias remained rejected. Fabric idle session passed at 21,002 ms. Same-port replacement partial (recorded Failed, reclassified on contract review): old client's first post-replacement `desktop_session.status` returned the designed fail-closed `adapter` / `service-unavailable`; close succeeded, but rediscovery on a later call was not demonstrated. One physical click was issued but its nested mechanism/disposition was not retained, so partial only. | App PID 26792 survived service shutdown/restart and was stopped afterward. Owned PIDs gone; ports 21338/30029/45382 free; descriptor and lock absent. Smoke artifact `apps/storybook/artifacts/desktop/a2475e8d-7ea9-465f-8461-b8f115cfcee5/run.json`; service runs `apps/storybook/artifacts/desktop/414cf449-bfd4-4b9f-b630-63e86ebdd5c4/run.json`, `apps/storybook/artifacts/desktop/d732ae38-df56-4b81-a56c-2791bdbac5e8/run.json`; blocked-claim attempt `apps/storybook/artifacts/desktop/73563809-2d77-49cb-a297-c74fd57ecd36/run.json`. Sanitized operation records are in the private `f15-native-qualification-a19fd3e1-20261106T0406/` log directory. |
| macOS Paper  | `yarn storybook driver --macos --paper --agent`; app `yarn storybook run --macos --paper`; manual MCP descriptor session, 0 automated tests selected/executed. Separate `yarn storybook smoke --macos --paper --mode stories-and-tests`: 211 selected/executed. | Retained preview-element sequence passed with the same-session region transition and stale/fresh alias assertions. No same-port, idle-channel, or physical-input case was run for Paper on this SHA.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | App, service, and Metro processes exited; ports free, descriptor absent, stale lock removed only after verifying its recorded owner had exited with empty resources/unresolved effects. Smoke artifact `apps/storybook/artifacts/desktop/87f0452f-5fd7-48eb-8494-a63202842521/run.json`. Sanitized record is in the private log directory above.                                                                                                                                                                                                                                                                                                                 |

The Fabric replacement case was not retried. It was recorded as Failed and
reclassified as Partial on contract review: the replacement service started on
the same ports, and the old MCP client's first status call was rejected with
`service-unavailable`, which is the designed fail-closed response before the
next call re-verifies discovery. The following close cannot prove rediscovery,
so a native status call after the rejection remains required. No mutation was
issued. Manual MCP calls are
not counted as selected tests. Manifest smoke is the separate non-agent legacy
lane and does not prove protected-ingress behavior or the no-HTTP-fallback
instrumentation requirement. Windows Fabric and Win32 Paper measurements are
Not run on this host. Fault injection, args refusal, ingress bypass, and F3/F4
survivor/fault cases were not run.

## 2026-11-06 Windows Fabric and Win32 Paper descriptor evidence

Source: the PR branch at `1f5333e25` plus `8458bde48` and `a6b89e924`; host
Windows 11 Enterprise build 26300, AMD64. The full 24-case matrix, counts,
retry history, run records, and cleanup are in the "Windows Fabric and Win32
Paper qualification — 2026-11-06" section of
`packages/agentic/desktop-test/references/current-status.md`.
`yarn storybook build-driver --windows|--win32` succeeded, and
`yarn desktop-driver doctor --platform windows|win32 --permissions` reports
`--permissions` as **Unsupported** on Windows. No text-size or operation
latency measurements were recorded on Windows, so none are added here.

Reference kinds, each from one driver session at service incarnation 1:

| Endpoint       | Target                     | Preview element refs                                                       | Chrome/window ref                                  | Fresh ref after reset                    |
| -------------- | -------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| Windows Fabric | `windows-f33cce69c1a7d0ae` | `9z4z23` (story root) and `9z4z66` became `ref-region-changed` after reset | `9z4z1` survived on `window-df4a4ab9-b2` (allowed) | `9z4z102` became stale after next select |
| Win32 Paper    | `win32-5e01f2ae23282f34`   | `okdw21` (story root) and `okdw38` became stale after reset                | `okdw1` survived on `window-9951db02-b3` (allowed) | `okdw54` became stale after next select  |

After a Fabric Metro reload, the old story root `7fqk23` returned `ref-stale`
and a new story root `7fqk101` was observable in the same session. After a Win32 app exit, observing the old preview returned
`window-closed`. Physical input: the Windows helper rejected a physical click
because the target window did not become the foreground window (effect none);
the Win32 helper applied one with mechanism `physical-pointer`.

## 2026-11-07 UTC Windows follow-up

Source `386f0585edae2450ab22e6d359e2fe4db3399555`; validation tests,
tooling, atomic reporting, and guidance changed during this follow-up. The additive native
matrix in `packages/agentic/desktop-test/references/current-status.md`
records 21 Pass, 2 Partial, 1 Fail for Windows and 21 Pass, 3 Partial for
Win32, with no remaining Not run rows. This does not resolve Windows
physical input or the partial launch/secondary-window coverage.

Real descriptor/MCP probes held correlated readiness for 1,500 ms after
native render and delivered a stale correlation first. Windows settled after
1,637 ms and Win32 after 1,618 ms. Within one uninterrupted session at
incarnation 1, regions changed 1 -> 2 -> 3:

| Endpoint | Session                                | Preview element / chrome | Exact window          | Runtime delayed/error generation |
| -------- | -------------------------------------- | ------------------------ | --------------------- | -------------------------------- |
| Windows  | `46a48bed-5f9c-40c6-aac7-c2929461d222` | `0yoo23` / `0yoo1`       | `window-4124f4f1-1be` | 2 / 3                            |
| Win32    | `a29dc7af-c96f-4b0a-a98f-2eae04d7f8c1` | `oyno25` / `oyno1`       | `window-5d019501-11b` | 5 / 6                            |

The preview refs returned `ref-region-changed`; chrome checks passed.
Correlated render errors produced unknown-effect quarantine and rejected
later story mutations. A fresh preview root was not exposed after that error,
so that subcase is Partial, not a bypass/fencing proof. Win32's earlier
fresh-preview fencing gap remains Partial. Native Callout probes confirmed a
shown native window and cleanup by subsequent selection, but addressed only
the registered primary identity: separately registered secondary-window
selection remains Partial on both endpoints.

Startup and shutdown failure probes retained exact owned-resource claims and
refused replacement. Original stop callbacks reconciled the recorded
generation-2 channel/helper; the retained owner and claim were removed only
after resource cleanup proof. Fresh service incarnations then passed
descriptor discovery, marker-verified selection/reset, normal shutdown,
authority revocation, and attached-app preservation. The desktop-test ledger
retains the injected failures, one local control-reader crash, operator
reconciliation details, every supervisor run ID, and the separate unprotected
smoke history. No new physical-input or capture capability is inferred.

Final non-agent smoke with bounded atomic-report recovery passed on both
endpoints: Windows run `1825d9aa-2c25-4a2c-8524-ceadcf52ad68`
(234 passed, 78 skipped) and Win32 run
`8c6f58e1-3591-4f1b-b008-c52a718d3ca2` (214 passed, 52 skipped).
Every session had a successful delete; readiness traversal ended before
authored tests. Windows journaled one recovered sharing conflict, Win32 none.
Processes, listeners, per-user claim, and default descriptor were absent
after cleanup. Artifacts remain under
`apps/storybook/artifacts/desktop/<run-id>/run.json`; earlier reporting and
physical-input failures are not erased.

## 2026-11-08 UTC Windows application ownership and foreground diagnosis

Source `9d3e11516` plus the Windows helper changes for
[#4441](https://github.com/microsoft/fluentui-react-native/issues/4441) and
F10-W ([#4447](https://github.com/microsoft/fluentui-react-native/issues/4447)).
Same host, with the console session disconnected throughout.

- **Foreground diagnosis (#4441).** Activation now re-attaches to the
  foreground holder when it changes during an attempt, and
  `window-activation-failed` names the holder by opaque handle and process id
  with its cause. The helper self-test covers each cause; a live physical
  click on Windows Fabric was not rerun, so that row stays Fail.
- **Application ownership (F10-W).** Leases report `containment`. Unpackaged
  launches run in a helper-owned Job Object and end with the helper;
  packaged launches are `uncontained` and survive it in a fenced claim;
  attach is `external` and fails closed. The fixture contracts and live REX
  and packaged-Storybook launch probes passed, which moves launch-capable
  discovery to Pass on both endpoints. Runs and survivor handling are in
  `packages/agentic/desktop-test/references/current-status.md`.
- **Measurements.** Windows Fabric and Win32 Paper discovery, observe, delta,
  and toggle text and latency are now recorded in
  `packages/agentic/desktop-driver-mcp/references/current-status.md`. On
  Windows Fabric three React Native Test App menu-bar items get new
  references on every read, so an idle `delta` is never empty.

## 2026-11-08 UTC connected Windows qualification

Source `fec94cec4995c7372b798877c5412ddcb156523b`, Windows 11 Enterprise
build 26300, AMD64, with the console connected. The opt-in `nativeDriver`
contract passed 6 tests with 2 skipped. Under an exclusive workload claim,
`FURN_NATIVE_DRIVER_TEST=1 yarn test win32Fixture --runInBand` passed all
11 tests; retained elements were 20 at cycle 100 and 23 at cycle 500.
The full `FURN_NATIVE_DRIVER_TEST=1 yarn test --runInBand` suite then passed
909 tests with 31 skipped across 65 passed and 2 skipped suites. Its separate
fixture run retained 20 elements at both cycles 100 and 500; the exclusive
claim was released.

A separate generic Win32 fixture probe (`dfb100b1-94b2-4007-946e-9172c1f97d54`)
switched between the exact main and secondary dialog handles, read controls
in each, and verified the dialog closed. Capture of the minimized main
window returned `unsupported operation` without restoring it; an explicitly
restored window produced a valid PNG. This is not the Storybook F4
separately registered secondary-window case, which remains Partial.

Connected physical-input Storybook smokes passed on both endpoints, including
the checkbox and popup cases. The separate real MCP descriptor path also
passed two physical checkbox clicks and checked-state assertions on each
endpoint, and returned hash-verified target PNGs. This replaces the earlier
Windows physical-click failure for that bounded case, not for the full
native matrix. Run IDs, selection counts, receipts, and cleanup are in
`packages/agentic/desktop-test/references/current-status.md`; MCP session
evidence is in `packages/agentic/desktop-driver-mcp/references/current-status.md`.

The Win32 authenticated bridge was disconnected after a settled story.
Chrome remained observable, but a fresh preview reference was not exposed
after the disconnect, so fresh-preview fencing remains Partial. The first
probe timed out after 10 seconds; bridge retirement occurred about 19 seconds
after injection. A later attempt waited for retirement and retained the
same Partial result. Physical Ctrl+C and DPI changes were not exercised.

## 2026-11-12: macOS exact application identity backend

Source `76a2be59abfde3a7bcb0abd8d86a2052e7378274`, macOS 27.2.1 arm64,
standalone AppKit fixture; no React renderer. Exact kernel start timestamps,
causal direct-child/LaunchServices capture, exact-primary cleanup and stable
per-user exact-app exclusion are implemented. Both macOS launch kinds remain
uncontained. Unknown or stale identity never authorizes termination.
The generic lease/claim policy lives in `desktop-test`, not in the helper.

Under the exclusive native-validation lock, with `FURN_NATIVE_DRIVER_TEST=1`,
stable signing identity `FURN Desktop Driver Development`, project-local
temporary storage and an isolated helper cache:

- At source `fc1df4bda42004ad86378d2acc6701427dda1836`,
  `yarn workspace @fluentui-react-native/desktop-driver test --runInBand`
  passed 1,241, failed 0, skipped 47; 75 suites passed, 6 skipped.
  Artifact: `artifacts/desktop/f10m/driver-native-stable.log`.
  This includes signed build/rebuild and causal-identity native self-tests.
  An earlier build-ID mismatch was caused by editing native inputs while the
  run was queued; this successful rerun used frozen source.
- At source `76a2be59abfde3a7bcb0abd8d86a2052e7378274`,
  `yarn workspace @fluentui-react-native/desktop-driver test --runInBand applicationIncarnation serviceIdentity`
  passed 69, failed 0, skipped 14; 4 suites passed, 2 skipped.
  Artifact: `artifacts/desktop/f10m/native-identity-final.log`.
  The intervening fixture deployment-target/schema-bound correction was
  separately exercised by the harness native safety cases.
- The harness's native OS-owner and rejected-launch cases passed 3 with
  5 skipped. Actual AX calls returned `apiDisabled` (-25211), but exact
  direct-child and LaunchServices primary cleanup and claim-resource records
  were proved. Both recorded PIDs and all own-worktree fixture/helper
  processes were absent afterward. The corrected fixture's Mach-O minimum
  is macOS 11.0, matching the helper.

Exact helper artifact/digest, commands, PIDs, failures, cleanup and evidence
locators are in `packages/agentic/desktop-test/references/current-status.md`,
section "2026-11-12: F10-M neutral application ownership".
Positive application lifecycle/external preservation and cross-service
application exclusion remain blocked by missing Accessibility permission;
the physical-input mutex is not qualified, and PostEvent preflight is false.
macOS Fabric and Paper signing/TCC-responsibility qualification remain
separate, unrun gates on this branch. No TCC/privacy settings were changed.
Primary exit is not descendant containment; Windows/Win32 native application
claim/survivor qualification remains not run for this change.

### 2026-11-12 review follow-up

At source `62e6552028ea8fb81e76d430379321145fab709c`, the signed helper
was forcibly rebuilt and
`yarn workspace @fluentui-react-native/desktop-driver test --runInBand nativeDriver.test applicationIncarnation serviceIdentity`
passed 79, failed 0, skipped 15; 5 suites passed, 2 skipped. The lock, signing,
native opt-in and project-local storage policy above were retained.
The native self-test exercises actual flock contention, preserves a real child
after injected EWOULDBLOCK and proves exact cleanup of a real launched child
after injected EBADF. Pre-spawn failures report `not-started`; a lost dispatched
launch response remains `unknown`. Default-TMPDIR transport regressions passed
59/59.

The matching AppKit safety subset passed 4, failed 0, skipped 5, including
pre-spawn/LaunchServices no-app rejection and claim reuse. Its helper artifact is
`1d68fae8df504432900e30e5b2a6714029762f5dd690cd953a8ef07b1f5da4f3`,
source digest
`2c8ac56b2b824b05b1cb10d358050dfb643b44eb6e209508d53eaa0f2744b0f8`.
Raw evidence is
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-JMEGuu/evidence.json`;
commands and exact primary identities are in the harness ledger.
Positive AX and renderer qualification remain blocked/not run as above.

The final review-fix `yarn clean-lage-cache && yarn lage buildci --concurrency 4`
passed under the exclusive lock at clean source
`e74043b0e6eb5b452e9023bc60c70ba6c9540600`: 178 successful tasks,
0 skipped/pending/aborted/failed. Project-local TMPDIR/Git-ceiling isolation and
the declared `TF_BUILD=1` in-band test task were used, with native-only
signing/cache/opt-in overrides removed. Log:
`artifacts/desktop/f10m/review-buildci-final.log`.
The harness ledger records the exact invocation. This aggregate is portable
repository validation, not additional positive native qualification.

### 2026-11-12 Storybook identity-observation regression

CI run `43148275374` at `0bd0ad6f7` failed both macOS Storybook renderers:
the normal driver session held the exact-application flock, while bridge-epoch
recovery created another helper and tried a competing controlling `attach`.
The passing macOS E2E artifact has 62 tests using session-owned `launch`;
it does not exercise that Storybook identity callback.

Fix source `5e360734e9b85bd4732aabc47c7654bb7211c3d3` adds
`NativeDesktopHost.inspectApplication` and the matching macOS native command.
It shares descriptor/legacy-lease/window validation and checks the exact
kernel incarnation before and after discovery, without creating a lease,
acquiring application/input locks or registering windows/elements. Storybook
uses the session's helper for this observation. Real launch/attach exclusion
is unchanged; foreign control remains `application-lock-busy`.
Windows/Win32 retain their existing temporary identity attachment, and an old
macOS helper never falls back to controlling attachment.

Default-TMPDIR adapter regressions passed 11; composed Fabric/Paper Storybook
regressions passed 5; claim/ownership regressions passed 29. The full portable
driver suite passed 1,236 with 66 skipped, and all three owning packages passed
format/build/lint and their full suites. Broad fixtures require project-local
TMPDIR under this task's filesystem restriction; only the focused selections
are default-TMPDIR evidence.

Under the exclusive native-validation lock, the stable-signed helper was
forcibly rebuilt. Native identity/termination/backend contracts passed 79 with
15 skipped, including new inspection-refusal self-tests; AppKit safety passed
4 with 5 skipped. Helper artifact:
`982f3cfa696bbde7f9868186ae9365d59014fd656687e5cbec2de74863280ed3`,
source digest
`6bafaf5835d9cd22410992466a8d8f86086ff6b3b3efd182b3a48922f698527c`.
The noninteractive doctor still reports Accessibility/PostEvent preflight false.
Both rejected-launch primaries and all own-worktree fixture/helper processes
were absent after the run. No privacy changes were made.

The harness ledger records exact commands, identities and evidence locators.
Raw evidence is under `artifacts/desktop/f10m/ci-regression/`.
Positive AX-dependent ownership/observation contracts and actual macOS
Storybook Fabric/Paper CI requalification remain pending, not passed; the
other native acceptance gates above are unchanged.

The final clean-cache aggregate at `a7c37b86a` passed **178 tasks**, with 0
skipped, failed, pending or aborted, under the exclusive native-validation
lock: `yarn clean-lage-cache && yarn lage buildci --concurrency 1`.
It used `TF_BUILD=1`, project-local TMPDIR and the matching Git ceiling, with
native-only overrides removed. The harness ledger records the full invocation.
The first concurrency-4 attempt failed after 112 successful tasks with abrupt
partial Storybook Jest output and no cause diagnostic. The unchanged isolated
Storybook suite passed 344 with 4 skipped under that exact environment before
the serialized aggregate retry. The first failure's cause is unestablished;
no source or test waiver was applied. Logs are `buildci.log`,
`storybook-buildci-environment.log` and `buildci-final.log` in the same artifact
directory. Runtime source remains `5e360734e`; this portable aggregate does
not qualify the still-pending positive native or renderer gates.

### 2026-11-12 AX-enabled application-ownership qualification

**Observed, superseding the permission-blocked results above.** Source is
`9395737943d7e1402a40a67a41dc605ef0afb24b` plus the live-discovery fix in
this delivery. Host: macOS 27.2.1 arm64. The signed, nonprompting doctor
reported Accessibility, PostEvent and ScreenCapture preflight `true`, unlocked
and on-console, with `promptRequested=false`. No privacy settings were changed.
Helper artifact:
`1429ce4663795bad31f545086ef80bffb83e9b9533287964991c5527388b2f6c`;
source digest:
`c17944691081d30a320cf6e4393a5bb0ce6cece8dd71295a400dbc5e6a53b3cb`.
The signer is `FURN Desktop Driver Development`, with designated requirement
`identifier "com.microsoft.fluentui-react-native.desktop-driver" and certificate leaf = H"ab592605f8619fcaa952b4a2525ae6d41296fdd7"`.

The initial positive AppKit run passed 8 and failed 1: the session's window
existed, but its helper could not rediscover the newly launched app.
The new warmed-discovery regression failed before the fix (1 failed,
9 skipped). A read-only native diagnostic observed the child missing from
`NSWorkspace.shared.runningApplications` while direct PID and static bundle
queries saw it. The standalone helper does not pump the main run loop needed
to refresh that cached workspace list. Descriptor discovery now enumerates
current-user kernel PIDs and constructs fresh `NSRunningApplication` objects,
retaining exact bundle/executable/window, uniqueness and incarnation checks.
Enumeration failure refuses discovery; launch causality is unchanged.

Under `$HOME/Library/Caches/furn-overnight/with-native-lock.sh`,
with the default TMPDIR unchanged:

```sh
env FURN_NATIVE_DRIVER_TEST=1 FURN_NATIVE_PHYSICAL_INPUT_TEST=1 \
  FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="FURN Desktop Driver Development" \
  FURN_DESKTOP_DRIVER_CACHE_ROOT="$PWD/artifacts/desktop/f10m/helper" \
  yarn workspace @fluentui-react-native/desktop-test test --runInBand \
  applicationOwnership.contract applicationOwnership.test ownership.test \
  --cacheDirectory "$PWD/artifacts/desktop/f10m/ax-qualification-20261112/jest-native-harness"
```

**Passed 39, failed 0, skipped 0** across three files: 10 native ownership
tests and 29 portable regressions. Native cases cover supervisor lifetime
across two sessions, external preservation, independent-service exclusion,
lease release, fresh read-only discovery while another helper controls the app,
duplicate-bundle refusal, stale identity, causal primary cleanup, cancellation
and the physical-input mutex. The mutex uses only bounded Shift down/up, not
pointer input. AppKit evidence:
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-1V0SrR/evidence.json`.
Raw red/green logs, the diagnostic and verified experimental-survivor cleanup
are in `artifacts/desktop/f10m/ax-qualification-20261112/`.

The harness ledger's matching dated section owns the renderer commands, full-suite counts,
cleanup and remaining acceptance gates. AppKit evidence does not establish
descendant containment, interrupted native publication, automatic recovery,
or Windows/Win32 packaged-survivor behavior.

**Observed, real renderers:** Fabric and Paper each passed all 9 qualification
checks, with 0 failed/skipped and 0 cleanup failures. Each run used the same
stable-signed helper above and independently rechecked nonprompting
Accessibility/PostEvent preflight. Neutral external owners preserved the app;
foreign native control returned `application-lock-busy`; a replacement
attached after lease release. Read-only inspection succeeded while the
controlling lease was held and retained its window handles. Supervisor-owned
launch survived two borrowed sessions, published exact application/owner
identity in schema 3 and exited at supervisor disposal. The transitional
Storybook CLI's outer claim remains `unregistered`; registered target/instance
checks apply to the neutral claims, not a fictional completed F9 migration.

| Renderer     | Exact smoke command from `apps/storybook`                                                                                                           | Passed / failed / skipped / unsupported | Artifact                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| macOS Fabric | `STORYBOOK_SMOKE_STORY=components-button--default yarn storybook --reporter json smoke --macos --mode stories-and-tests --input accessible`         | 224 / 0 / 0 / 0; retries 0              | `apps/storybook/artifacts/desktop/616bf2e8-a675-408f-bd56-2e09982ea969/run.json` |
| macOS Paper  | `STORYBOOK_SMOKE_STORY=components-button--default yarn storybook --reporter json smoke --macos --paper --mode stories-and-tests --input accessible` | 224 / 0 / 0 / 0; retries 0              | `apps/storybook/artifacts/desktop/19358539-eed2-49e9-9c9a-79b5e7db4e9f/run.json` |

Each smoke traversed 223 catalog entries and executed the one manifest-selected
Button semantics callback. One physical callback was excluded by input policy,
not passed or skipped. The physical-input mutex was separately qualified by
the AppKit test; these smokes are not pointer/capture qualification.
The exact run-owned and supervisor-owned apps exited, all reported
driver/channel/Metro ports closed and all test claims were released between
runs and at the end. Renderer evidence:
`artifacts/desktop/f10m/ax-qualification-20261112/{fabric,paper}/evidence.json`.
The harness ledger records the declared bundle/prep/run procedure, installed
Ruby JSON selection and failed qualifier attempts with their exact cleanup.

**Not run/unqualified:** native descendant containment, interrupted native
publication, supervisor-death survivors, Windows/Win32 packaged-survivor
journaling, repeated-run reliability and clean-machine/PPPC/revoked-grant
behavior. Effective TCC acceptance is scoped to the observed `Rex Server.app`
responsibility tree, not an independently durable helper-owned grant.
Keep draft; ordinary hosted Windows driver/smoke CI is not sufficient for
the unrun harness survivor gate.

Final declared package format checks, TypeScript builds and lint passed for
desktop-driver, desktop-test and storybook-desktop. The full signed,
native-enabled driver suite passed **1,255**, failed **0**, skipped **47**.
The separately scoped portable suites passed driver **1,236** (66 skipped),
harness **409** (11 skipped), and Storybook **344** (4 skipped), with no failures.
All used the default TMPDIR. Skips are not native passes; the signed focused
ownership run separately passed all 39, including all 10 AppKit tests.

A broad mixed-environment harness attempt failed 3 (416 passed, 1 skipped):
two portable fixtures replace HOME, hiding the signing keychain while
inheriting the native signing override, and one LaunchServices acquisition
reported an unverifiable incarnation and preserved the process. Its cause is
unestablished; this is not reliable-launch qualification. That exact
run-owned fixture was operator-cleaned only after native identity/path/time
checks. The discovery-only regression now uses externally started children
with native identities, independent of LaunchServices ownership acquisition;
no causal guard was relaxed. The signed native selection and the portable
suites then passed separately. The harness ledger records exact commands,
failed-attempt evidence and the remaining causal-acquisition reliability gate.

**Observed final repository validation:** the single final clean-cache
aggregate, `yarn clean-lage-cache && yarn lage buildci --concurrency 1`,
passed **178 tasks**, failed **0**, skipped **0**, pending **0**, aborted **0**
in 6m 50.47s under the native lock. It used `TF_BUILD=1`, the default TMPDIR,
and explicitly removed the five native/signing overrides listed in the
harness ledger. This portable aggregate supplements, not replaces, the
separate signed native and renderer results. Full invocation and output:
`artifacts/desktop/f10m/ax-qualification-20261112/buildci-final.log`.

**Observed final cleanup:** after the aggregate, signed native probes
reported all **31** recorded exact process incarnations exited. Scoped
command-line and current-working-directory inspection found **0** worktree
workload processes; all three reported driver/channel/Metro ports refused
connections. The shared workload claim and all `interactive.lock` files in
eight native/renderer/failed-attempt artifact roots were absent. The
locked verifier exited successfully, and a subsequent locked `true`
reacquired and released the machine-wide lock. No privacy changes or
unknown-process termination were used. Evidence and operational verifier:
`artifacts/desktop/f10m/ax-qualification-20261112/cleanup-final.json`,
`cleanup-final.log` and `verify-cleanup.mjs` in that directory.
The experimental diagnostic/cleanup scratch sources were removed; their
JSON results and logs remain ignored evidence.

Documentation closeout passed all four changed Markdown link checks
(12 / 6 / 15 / 0 links), `yarn lage test-links --verbose --grouped`
(90 tasks, 0 failed/skipped) and repository-wide `yarn oxfmt --check`
(3,159 files). The harness ledger records each exact link-check command.
Final logs in the same artifact root: `changed-markdown-links-final.log`,
`test-links-final.log` and `root-format-final.log`.

### Rebased macOS publication/survivor contracts — 2026-11-12

The macOS ownership layer is rebased onto F6 main
`041ac8b9894aeaa7e1aa273baa2ece4e46298b94`; test/fixture qualification
commit `d5a7530a9f2d4cb78721a36c1109b5c36fbdc5a1` does not change
production helper behavior. Under the shared native lock on macOS 27.2.1
arm64, the stable-signed native driver suite passed **1,256, failed 0,
skipped 47**:

```sh
FURN_NATIVE_DRIVER_TEST=1 \
FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="FURN Desktop Driver Development" \
FURN_DESKTOP_DRIVER_CACHE_ROOT="$PWD/artifacts/desktop/f10m/helper" \
yarn workspace @fluentui-react-native/desktop-driver test --runInBand \
  --cacheDirectory "$PWD/artifacts/desktop/f10m/rebased-qualification-20261112/jest-driver-native"
```

Package format, lint and build passed. Nonprompting doctor reported effective
Accessibility/PostEvent/ScreenCapture permissions and an unlocked console;
no privacy changes were made. Helper artifact/source digest are unchanged
from the previous signed qualification.

The harness's focused suite passed **13 native AppKit cases plus 29 portable
cases, no failures or skips**. New native evidence covers failed acquired-record
publication, owner death before/after acquired-record publication, retained
workload fences, real application/known-descendant survivors and exact operator
cleanup. The descendant remains alive after the primary exits, consistent with
both macOS launch kinds remaining explicitly `uncontained`. This is not
automatic recovery or arbitrary descendant containment. Stale native start
identities and inaccessible foreign process identity still fail closed.

Exact commands, process identities, limitations and the independent renderer
and aggregate outcomes are recorded in
`packages/agentic/desktop-test/references/current-status.md`, section
"Rebased F10-M publication and survivor qualification".
Evidence root: `artifacts/desktop/f10m/rebased-qualification-20261112/`;
AppKit identities:
`packages/agentic/desktop-test/artifacts/desktop/application-ownership-kffNMN/evidence.json`.
