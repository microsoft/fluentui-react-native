---
id: desktop-driver.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Current capability and qualification status

**Work in progress, updated 2026-11-08.** "Done" below means the stated
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
| Native sessions and command/input queues                   | Done                                   | One reservation per registered target in one service. Cross-service exact-application claims remain work in progress.                                                                                                                                                                                                                                                                                                                                           |
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

| Lane                           | Recorded evidence through 2026-11-06                                                                                                      | Still required before full submission                                                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| macOS Fabric                   | M3 evidence at `41fc7473f`; bounded F4 marker, stale-preview/chrome and authenticated-incarnation restart checks at `6fca14788`           | Native cancellation/fault injection, fresh preview after lost context, secondary windows, physical input, supervisor crash, generic AppKit fixture and reliability window. |
| macOS Paper                    | Hosted build/smoke evidence; separate bounded F4 marker, stale-preview/chrome and authenticated-incarnation restart checks at `6fca14788` | Native cancellation/fault injection, fresh preview after lost context, secondary windows, physical input and complete lifecycle/reliability qualification.                 |
| Windows Fabric                 | M3 real-app observation and story MCP path recorded at `600235c35`                                                                        | Same-branch lifetime/restart and failure gates; 200%/mixed DPI, minimized/negative-origin windows, live lock/RDP/elevation, popups, capture cancellation.                  |
| Win32 Paper                    | M3/agent path recorded; native fixture physical input/capture at 100% and 150%                                                            | Interactive rerun of current native contracts; physical Ctrl+C, mixed DPI and failure paths. Hosted input/capture skips are not passes.                                    |
| Generic native applications    | macOS Calculator and plain Win32 fixture evidence recorded                                                                                | AppKit fixture and integrated ownership/recovery parity; a probe is not a real-app lifecycle qualification.                                                                |
| This update's portable changes | Deterministic fake-host MCP, authority, and story regression coverage; the Windows oversized-tree fallback passed hosted CI               | CI and matching-OS live evidence are distinct. The oversized-tree fallback is compiled and contract-tested only on hosted CI; no live Windows qualification.               |

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

## Windows Fabric and Win32 Paper — #4441 connected-session qualification — 2026-11-12 UTC

**Observed baseline:** `505a2187b0a2451aed7081c9260b343d55742f93`,
Windows 11 Enterprise build 26300, x64, Node 26.13.0. All native runs held
the machine-wide campaign/lock; physical gates before and after each run
reported an active, unlocked **remote RDP** session, not a console session.
The single attached monitor was 1728 x 1084, origin `(0,0)`, 96 DPI / 100%.
No display settings changed. The packaged Fabric app's registered native
build was `bdeb0b291`; comparison of the Windows app project and native-core
sources to the tested SHA showed only native-core
version/changelog changes. **Inferred:** native-build reuse was valid.
Metro, generated catalogs and protected bundles came from the qualification
checkout. Paper used the prebuilt REX 0.81.1 host.

### Matching-OS F16 clear contracts

F16 is issue #4467, implemented by merged PR #4468,
`ac20660ff039f4e0dc914706ff24f548610f30aa`. From the qualification checkout,
with `$CampaignTools` identifying the private campaign helper directory:

```powershell
$QualificationRoot = (Get-Location).Path
$env:TEMP = Join-Path $QualificationRoot 'artifacts\native-working'
$env:TMP = $env:TEMP
$env:TMPDIR = $env:TEMP
$env:FURN_NATIVE_DRIVER_TEST = '1'
pwsh -NoProfile -File "$CampaignTools\with-native-lock.ps1" `
  -Lane W3 -Label 'W3 qualification native strict-clear and fixture contracts' `
  -RequirePhysical `
  -WorkingDirectory (Join-Path $QualificationRoot 'packages\agentic\desktop-driver') -- `
  yarn test --runInBand nativeDriver win32Fixture operations.contract
```

**Passed:** 3 suites, 27 tests; **skipped:** 2 macOS-only signed/unsigned
build cases. This is one shared Windows-provider/Win32-fixture run, not 27
tests per renderer. The real helper self-test negotiated `strictClear` and
covered semantic/keyboard mechanism selection and no-dispatch refusal;
the Windows native provider serves both endpoints. Helper artifact SHA-256:
`d8ee05e4796fb3aa22f7b5dbf481bd8cdfb0c20b6d5d24676d689dc7900d5b3c`.
The self-test's keyboard-denial instrumentation is not itself successful
React Native keyboard deletion.

Separate live endpoint probes **passed** actual nonempty RN keyboard clear
(keyboard receipts 1 -> 2), accessible clear of an **initially empty**
TextInput, and readonly accessible clear refusal with effect `none` and
unchanged receipts. Nonempty semantic removal is native self-test evidence,
not a claim about the initially-empty RN probe.

### Secondary targeting, capture and remaining gaps

All rows below are **Observed** at the baseline SHA:

| Case                                     | Windows Fabric packaged                                                                                                                                                               | Win32 Paper REX                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Separately registered secondary          | Passed: exact new opaque handle, explicit switch, complete 11-node native observation, unique `modern-callout-focus`, physical-pointer click, `focus: confirmed`, then handle removal | Not run / partial: real Callout shown, but only main registered; no secondary targeting claim |
| Additional secondary semantic activation | Failed: applied/accessibility on the exact unique button, but six checks / 2090 ms and final native observation stayed `Idle`                                                         | Not run: no registered secondary                                                              |
| Minimized capture                        | Passed: `unsupported operation`, still minimized, no implicit restore; explicit restore then valid 586 x 793 capture                                                                  | Passed: same refusal/restore contract; restored capture 1010 x 761                            |
| 200% scale                               | Not run: 100% RDP scale; changing it was not authorized                                                                                                                               | Not run: same                                                                                 |
| Mixed DPI                                | Not run: only one attached monitor                                                                                                                                                    | Not run: same                                                                                 |
| Negative-origin layout                   | Not run: only an origin-zero monitor; no approved eligible layout                                                                                                                     | Not run: same                                                                                 |
| Physical console Ctrl+C                  | Not run: owned by the separate implementation lane                                                                                                                                    | Not run: same                                                                                 |

The semantic failure was reproduced **without** switching foreground back
to main: main status was read through its explicitly cited native root.
The same selector and status assertion passed with physical click in one
attempt / 79 ms. **Inferred:** the renderer/accessibility-pattern dispatch
path may acknowledge activation without reaching Pressable `onPress`.
`native/windows/src/automation.cpp` tries several patterns and accepts a
successful HRESULT; the precise selected pattern was not instrumented.
An applied receipt alone is not application-level effect proof.

On Win32, exact-process native inventory **observed** a visible, untitled,
root `Net UI Tool Window` with ToolWindow true. **Inferred:** the deliberate
untitled `WS_EX_TOOLWINDOW` exclusion in `CollectWindow` explains the missing
registration. Modern Callout was absent from the actual Win32 catalog.
No native title/style manipulation was attempted. Both open findings are
being fixed on this connected-session branch; this entry records the
unfixed baseline, not successful fix qualification.

Exact endpoint supervisor invocations, each inside the same W3
`with-native-lock.ps1 -RequirePhysical` wrapper:

```powershell
node .\artifacts\desktop\w3-qualification\run-endpoint.mjs windows
node .\artifacts\desktop\w3-qualification\run-endpoint.mjs win32
node .\artifacts\desktop\w3-qualification\run-endpoint.mjs windows --secondary-only --modern-only
node .\artifacts\desktop\w3-qualification\run-endpoint.mjs windows --secondary-only --modern-only --physical-secondary
```

Retained artifacts are relative to that qualification checkout, not shipped
package files: `artifacts\desktop\w3-qualification\runs\<qualification-id>\`.

| Evidence                                                                          | Qualification ID                       | Report in that directory                                                                                                      |
| --------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Fabric clear / minimized capture                                                  | `5c97fc26-71ef-483c-aa2a-b454d6ff4458` | `descriptor-cases-windows-clear.json`, `descriptor-cases-windows-minimized-capture.json`                                      |
| Paper clear / minimized capture / missing secondary                               | `22332065-6fa3-4061-a2b6-93f83295ca2e` | `descriptor-cases-win32-clear.json`, `descriptor-cases-win32-minimized-capture.json`, `descriptor-cases-win32-secondary.json` |
| Fabric semantic failure, driver run `a9f2e71e-71ab-40f0-a375-fd6d76a0b971`        | `675160f7-e069-413c-a6c8-486de0c37b69` | `descriptor-cases-windows-secondary---modern.json`                                                                            |
| Fabric physical secondary pass, driver run `16aac92b-bb36-4742-bd29-01df381d9594` | `7fbe3b0b-df33-476b-80e3-95b97bf19f02` | `descriptor-cases-windows-secondary---modern---physical.json`                                                                 |

The physical secondary pass does not erase the semantic failure or earlier
receipt-only/investigation failures. The full matrix and injected Win32
fresh-preview fence are recorded in
`@fluentui-react-native/desktop-test/references/current-status.md`; real MCP
click costs are in
`@fluentui-react-native/desktop-driver-mcp/references/current-status.md`.
Exact owned applications, helpers, Metro and service processes drained.
The campaign ended; pre/post-end audits both exited 0:
`FURN-AUDIT: no FURN desktop processes found`. No physical Ctrl+C claim is
made from the supervisor's cooperative programmatic shutdown.

## Windows Fabric and Win32 Paper — connected-session fixes — 2026-11-12 UTC

**Observed test base:** `a1cee02547b7aae4c72134902fe43ed007215069` plus the
then-uncommitted fixes described here. This section supplements, rather than
rewrites, the unfixed qualification above. No macOS qualification is added.
The native runs used the serialized W3 campaign/lock. Eligible runs reported
an active, unlocked **remote RDP** session on `Default` before and after;
they were not console-session tests. The packaged Fabric build at
`bdeb0b291` was reused: neither the Windows app native project nor native-core
Windows native sources differed. Metro and bundles came from the fix
checkout. Paper used the prebuilt REX 0.81.1 host; its native build remains
unsupported.

### Observed causes and corrections

Instrumented Fabric and Paper runs
`6488435c-6222-4c35-a670-d50655753da4` and
`ecd1cdff-6b77-4c42-ad57-89733dc154d0` found no Invoke, Toggle,
SelectionItem, or ExpandCollapse pattern. LegacyIAccessible was selected:
its default-action read returned `S_OK` and a **nonempty** action, and
`DoDefaultAction` returned `S_OK`, but the application did not change.
This occurred on main-window Pressables and agentic Buttons on both
endpoints, and on the Fabric secondary button. The saved fixed-format traces
are `native-trace-21424.jsonl` and `native-trace-38384.jsonl` under
`artifacts\desktop\w3-qualification`.

**Inferred from that dispatch trace and the independent effect checks:** a
nonempty legacy default action is not sufficient activation evidence.
An empty-action-only guard would not repair the observed defect. The helper
therefore refuses legacy-only activation before mutation with
`unsupported-operation`, reason `activation-unsupported`, and effect `none`.
The four explicit actionable pattern paths remain unchanged. The public
error preserves its class, native code, and reason; it records no delivery,
does not quarantine, and never implicitly retries physically. Temporary
native tracing was removed.

The Paper inventory also proved an exact-process, visible, untitled,
280 x 144 `Net UI Tool Window` popup owned/root-owned by the main window.
The strict untitled-tool exclusion originated in provider commit
`5b3f74c7b`; the available history supplied no more specific rationale.
The correction leaves global discovery conservative and qualifies only
lease-local popup roots using verified primary identity, exact-process
ownership, positive visible bounds, helper-class exclusions, and a bounded
UIA exact-root/content check, followed by native identity rechecks.

The final helper registered that real Paper secondary. Its unique Callout
content observation was complete at eight nodes; its public `find` proved
the actual focus **button** unique, cited activation refused honestly, and
story cleanup removed the secondary handle. The host's whole-window UIA tree
also exposes the owner subtree, so this is scoped popup-content evidence,
not a claim that the default whole-window observation was complete.
Stable focus/blur test IDs were added to the legacy Callout story rather
than weakening the public uniqueness-proof requirement.

### Red/green checks and helper identity

All commands below ran from `packages\agentic\desktop-driver` unless stated
otherwise. Native commands used the W3 lock/campaign; interactive runs also
used `-RequirePhysical`. Test working directories were confined beneath the
ignored checkout `artifacts\desktop\w3-fix\native-working`.

```powershell
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn test --runInBand operations.contract win32Fixture.contract --testNamePattern 'nonactionable legacy|legacy-only|untitled tool roots'
yarn test --runInBand operations.contract win32Fixture.contract nativeDriver
yarn desktop-driver build-driver --platform windows
```

- **Expected red:** five behavioral failures, 18 skipped, in
  `native-passive-red.log`: MSAA no-action and ScrollIntoView-only UIA
  activation both falsely succeeded through raw/public routes, and the
  owned content tool root was missing.
- **Passed on the initial fixed helper:** five new cases, 18 filtered cases
  skipped (`native-fix-focused-green.log`); then three suites, 32 tests
  passed and two macOS build/signing cases skipped
  (`native-fix-regressions.log`). This includes existing operation, fixture,
  cancellation, retention, capture, and helper build/handshake checks.
- That initial helper was artifact
  `29b67c2c775f51cd360016c6abd09eb2ca377b7868b0cd7c6feb7432799e871e`,
  source digest `e99e3246963a0fa4848a31c5753a026200492d9ad92c036a132bba16f9d1b469`.
- **Passed final helper build:** after adding an exact UIA native-root
  handle check, artifact
  `b47212dcd9e63aba388907b930da19d9a6d602f7d3de32e364f1584890f4d6dc`,
  source digest `16ecdda1e41112cf2dafaf57eaad843054fbeeb2e9add0518f9c41886e8c867c`,
  build fingerprint `3628b82e4280727dce2b265db184baa52285cc9f88f571621182d3893b051397`.
  The build log is `native-fix-final-build.log`. The real Paper pass below
  used this final helper and story blob
  `f96de651a8433fc446f9c02b7b5ee3f5075c945c`.
- The **final-helper native-contract rerun is Not run**, not a replay of
  the initial helper's 32 passes: the desktop was paused after disconnect.
  Logs in this list are relative to `artifacts\desktop\w3-fix`.

### Endpoint results and session boundary

The copied qualification supervisor ran these exact commands from the
checkout root, inside the W3 `-RequirePhysical` wrapper:

```powershell
node artifacts\desktop\w3-qualification\run-endpoint.mjs windows --secondary-only --modern-only --activation-diagnostics
node artifacts\desktop\w3-qualification\run-endpoint.mjs win32 --secondary-only --activation-diagnostics
```

| Case                                                                        | Outcome and evidence                                                                                                                                                                                       |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fabric main Pressable and agentic Button                                    | **Passed** honest refusal on the initial fixed helper; original statuses remained `Closed` and `0`, with unchanged receipts.                                                                               |
| Fabric modern secondary semantic action                                     | **Passed** honest refusal on the initial fixed helper: exact secondary handle, complete 11-node observation, unique button, no delivery/quarantine, main status stayed `Idle`, handle retired.             |
| Paper main Pressable and agentic Button                                     | **Passed** honest refusal on the final helper; original statuses remained `Native window: Shown` and `0`, with unchanged receipts.                                                                         |
| Paper secondary registration, observation, semantic action, retirement      | **Passed** on the final helper: main plus one secondary, complete eight-node content sample, unique focus button, `activation-unsupported`/effect `none`, no receipt/quarantine/fallback, then main alone. |
| Final-helper Fabric semantic rerun                                          | **Not run**: first startup failed before readiness with `spawn rnx-cli ENOENT`; dependency resolution confirmed the CLI was installed. Its one retry was session-gated before the supervisor started.      |
| Final-helper Fabric and Paper secondary physical clicks                     | **Not run (session disconnected)**. No physical input was attempted after the gate. The earlier baseline Fabric physical pass remains valid; it is not a final-helper rerun.                               |
| DPI, mixed-monitor, negative-origin monitor layout, physical console Ctrl+C | **Not run** by this fix campaign; no new claim beyond the baseline section.                                                                                                                                |

Artifacts are beneath
`artifacts\desktop\w3-qualification\runs\<qualification-id>\`:

| Evidence                                                 | Qualification ID                       | Driver run ID                          |
| -------------------------------------------------------- | -------------------------------------- | -------------------------------------- |
| Initial fixed Fabric main/secondary semantic pass        | `a583840b-7ad5-4691-9e60-f4f83d49fd48` | `0644505e-3642-4fed-b6aa-157275fb519f` |
| Final fixed Paper main/secondary semantic pass           | `7edaa34a-fefd-4a8b-846b-dc8aa8c3880e` | `2d342e8c-dd72-4553-bc90-af070716add2` |
| Final Fabric startup failure, no app-level case executed | `c807faf4-31e8-4aa1-a3de-5b78e720e20f` | `07fe422f-7c94-4bbc-b6e8-379b9ee989c7` |

Each successful directory retains `qualification.json` and
`descriptor-cases-<endpoint>-main-activation.json` /
`descriptor-cases-<endpoint>-secondary[---modern].json`, with cleanup
acknowledgments. Earlier failed Paper probes were qualification-harness
failures, not passes: the owner subtree exhausted the observation byte
budget, searching _inside_ the unnamed button did not prove that button,
and an observation sample was correctly refused as `sample-not-unique`.
The successful run uses a real unique `find` with the stable story test ID.
The optional managed UIA probe now serializes nonfinite geometry as null;
its bounded 32-node content result is explicitly incomplete, not a complete
window-tree claim.

At **2026-11-12T17:03:45Z** the wrapper observed session 1 as remote,
Disconnected, locked, LogonUI running, with no input desktop. It returned
75 / `NOT RUN` before starting the retry. All native/GUI/physical work was
then paused; no reconnect or session move was attempted. The campaign ended
and both audits passed:
`FURN-AUDIT: no FURN desktop processes found`.

### Portable checks and remaining qualification

**Passed:** desktop-driver `yarn test --runInBand` with native opt-in unset:
73 suites / 1,201 tests, with eight native suites / 93 native tests
**skipped**, not passed. Native-core `yarn test` passed its build, story
typecheck, 18 Node checks, 56 Jest checks, and one snapshot; native-core
format/lint passed. These do not replace native qualification.

From the checkout root, the final portable checks **passed**:

- `yarn workspace @fluentui-react-native/desktop-driver format`
- `yarn workspace @fluentui-react-native/desktop-driver lint`
- `yarn workspace @fluentui-react-native/desktop-driver build`
- `yarn oxfmt --check` and `git diff --check`
- `yarn markdown-link-check -c .github\markdown-link-check-config.json <changed-file>`
  for all ten changed Markdown files, including both patch changesets:
  72 links checked.

One permitted session check at **2026-11-12T17:21:31Z** reconfirmed remote
session 1 as Disconnected, locked, LogonUI running, and without an input
desktop. No native or GUI retry followed.

The implementation is committed as
`cd036a2d06ae450f9c26ac0837c4fe140877ffb9`. Its committed
`yarn change:check` **passed**. A post-commit process audit also passed:
`FURN-AUDIT: no FURN desktop processes found`; campaign status reported no
campaign or holder. The branch has not been pushed.

The post-review clean-cache repository aggregate and final native/physical
reruns are still pending. Outstanding qualification stays tracked in
[remaining work](remaining-work.md) / #4441; no issue is closed and no
final-helper physical-success claim is made here.

## Windows Fabric and Win32 Paper — popup liveness review fixes — 2026-11-12 UTC

**Observed source base:** `96b91661e2886aa4a22bd3f08b485e51d11c90d7`
plus the then-uncommitted review fixes below. This section supplements the
earlier Windows evidence; it does not rerun or relabel that evidence. The
earlier section's final helper was the pre-review `b47212dc…` artifact.
No macOS code, ledger section, or qualification changed.

### Admission, liveness, and publication

Registered untitled popups now bypass UIA content discovery when their lease,
process, thread/class, primary identity, and owned-content native predicates
still match. A failed content read or temporary re-layout therefore cannot
remove a live, admitted popup from `windows`. New candidates share one
1,000 ms deadline per listing; UIA waits use its remaining time, late reads
stop before another transaction, and unprobed candidates retry later.
Exhausting discovery does not skip registered windows later in the listing.
Publication diagnostics now include admitted live popups as `listed` as well
as `tracked`, without another content probe.

**Test-first authoring:** the gated fixture regressions and native self-test
were added before production edits. The self-test injects false, throwing,
and unavailable content probes, an exhausted shared deadline, a later retry,
and listed/tracked publication assertions. The fixture checks hung-provider
popup retention/rectangle reads and bounded new-popup discovery/recovery;
its existing admission case also checks publication. Native red/green
execution is **Not run**, not inferred as passed: the desktop remains paused.

### Compile-only and portable validation

The helper-only build used the shared W3 lock, no campaign, and no launch.
The following build command is shown with its cache-root argument relative to
the driver package; the recorded invocation resolved that path absolutely:

```powershell
yarn desktop-driver build-driver --platform windows --cache-root ..\..\..\artifacts\desktop\w3-review\native-cache
```

**Passed** x64 release compilation, including the new native self-test.
Lock acquisition was at `2026-11-12T17:45:53Z`, and the wrapper released
successfully with exit 0. No helper, fixture, REX, packaged app, or Metro was
launched. This is compilation, not native runtime qualification.

- Artifact: `eb91ef8a4164080bcae787aacce3fd5aa5556d8c3d0b22d0cd0c661a50934066`
- Source digest: `89cc81fbb72cb8a79852e5d4d90ce96d8b2982283086236b860289f2664ac557`
- Build fingerprint: `7b38faa5c0eeba1ace7441d613a3f0c126915f78eff58c4a32466825c4e11854`
- Build log: `artifacts\desktop\w3-review\helper-build.log`

From `packages\agentic\desktop-driver`, with native opt-in unset:

```powershell
Remove-Item Env:FURN_NATIVE_DRIVER_TEST -ErrorAction SilentlyContinue
yarn test --runInBand win32Fixture nativeDriver
yarn test --runInBand
```

**Passed:** focused portable checks, eight tests; 20 native tests **skipped**.
The full portable suite passed 73 suites / 1,201 tests, with eight native
suites / 95 tests **skipped**, not passed. Logs are
`tests-authored-portable.log`, `focused-portable-final.log`, and
`portable-tests.log` beneath `artifacts\desktop\w3-review`.

From the checkout root, **passed**:

```powershell
yarn workspace @fluentui-react-native/desktop-driver format
yarn workspace @fluentui-react-native/desktop-driver lint
yarn workspace @fluentui-react-native/desktop-driver build
```

The README, protocol, helper/fixture references, and patch changeset describe
the same policy. FDR1 fields, commands, and `native/protocol.json` remain
unchanged. Root `yarn oxfmt --check`, `git diff --check`, and
`yarn markdown-link-check -c .github\markdown-link-check-config.json <changed-file>`
**passed** for all seven changed Markdown files (66 links).
The review-fix implementation is committed as
`4d39582f2292ff6436dafaba646ee63cb9bdc3cc`.
Its committed `yarn change:check` **passed**; the log is
`artifacts\desktop\w3-review\change-check.log`.
The process audit passed with
`FURN-AUDIT: no FURN desktop processes found`; no W3 campaign was started,
and shared campaign status reported no campaign or holder. No push was made.

### Remaining session-gated runs

One permitted check at **2026-11-12T17:52:11Z** observed remote session 1 as
Disconnected, locked, LogonUI running, with no input desktop. No GUI or native
contract was attempted; no reconnect or session move was attempted.

Still **Not run (session disconnected / W3 desktop grant required)**:

- Final-helper Fabric main/secondary semantic case.
- Fabric and Paper secondary physical clicks, under `-RequirePhysical`.
- Final native selector below, including the new failed/hung-probe,
  shared-deadline/retry, and publication regressions plus the native self-test.

```powershell
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn test --runInBand operations.contract win32Fixture.contract nativeDriver
```

The clean-cache repository aggregate is **Not run** in this review-fix
segment; W1 holds the buildci-only grant. It remains required before
publication. The native cases remain in [remaining work](remaining-work.md)
and #4441; no new native pass, physical success, or issue closure is claimed.

## Windows Fabric and Win32 Paper — default-environment publication validation — 2026-11-12 UTC

**Observed tested source:** `cad25f8c53855c30f2c45f3ce6655f668d09bdc9`.
The coordinator authorized buildci-only use of the shared W3 lock, followed
by draft publication. No app, native contract, helper runtime, or physical
input was launched in this segment. Native opt-in remained unset. TEMP and
concurrency used their defaults; no workaround, guidance, or timeout edits
were made.

The exact root validation command, inside the W3 machine-wide lock:

```powershell
cmd.exe /d /c "yarn clean-lage-cache && yarn lage buildci"
```

### Failure comparison and unchanged-source retry

- **Failed, first branch attempt:** lock acquired at `18:33:59Z`, released
  at `18:36:20Z`; 136 tasks succeeded and Storybook desktop tests failed.
  Four checks failed: the WDIO worker's 7,000 ms deadline, two 10,000 ms
  diagnostic timeouts, and the server-integration stop result.
- **Observed cleanup:** Lage exited before its desktop-test descendants.
  No independent WDIO command had been started outside the lock. The
  descendants finished naturally; their recorded root PID was already gone
  when checked. A subsequent process audit exited 0.
- **Failed on clean baseline too:** the same default-environment command
  ran on isolated detached `505a2187b0a2451aed7081c9260b343d55742f93`.
  It reproduced the WDIO deadline and server-stop readiness race; baseline
  diagnostics passed. There were 138 successful tasks and one failed task.
  All baseline children drained before the lock released at `18:45:14Z`.
  The disposable checkout remained clean and was removed afterward.
- Storybook source/config, desktop-test source/config, scripts, lockfile,
  and Lage configuration were byte-unchanged between the baseline and this
  branch. **Inferred:** these load-sensitive failures were not caused by
  the Windows activation/popup changes; no unrelated source fix was made.
- **Passed, unchanged-source branch retry:** the lock was acquired at
  `18:48:10Z`, validation started at `18:48:11Z`, and all **178 tasks passed**
  at `18:50:53Z` (zero failed, aborted, pending, or skipped Lage tasks).
  Owned descendant drain completed before lock release. This is a task-level
  aggregate result, not a claim that opt-in native cases executed.

The local ignored supervisor `run-buildci-and-drain.ps1` runs the exact
command above and keeps the wrapper alive until owned Node descendants
finish. It does not alter the test environment or send input. Logs are
retained beneath `artifacts\desktop\w3-buildci`:
`buildci-default.log`, `baseline-buildci-default.log`, and
`buildci-default-rerun.log`.

At `2026-11-12T18:52:16Z`, the post-run audit exited 0:
`FURN-AUDIT: no FURN desktop processes found`. Shared state reported no
campaign or holder. W3 started no campaign; its build-only lock was released.

### Publication scope and remaining native work

The final local Fabric semantic case, both final-helper secondary physical
clicks, and final native contracts remain **Not run**. The earlier disconnect
prevented them; after the session became Active/unlocked again, the desktop
was reserved for W1, not a W3 native campaign. No reconnect, session move,
display change, or native retry occurred here. The current review helper
remains compile-only as recorded above.

The default-environment aggregate requirement is now satisfied. Draft
publication does not close #4441 or replace its outstanding native, 200%,
mixed-DPI, negative-origin, or separate #4491 console-Ctrl+C qualification.

## Windows Fabric and Win32 Paper — hosted popup compatibility follow-up — 2026-11-12 UTC

**Observed published revision:** `4208ab36d641bcfe3675836634f18dee2072ef49`,
draft PR #4498, workflow run `43284991535` (attempt 1).
**Tested portable correction:** `28c7690085342a3bc2ee114b2c4c2032d7d050c4`.
No native source or FDR1 schema changed in this follow-up.

### Hosted evidence at the published revision

- **Passed:** Windows Storybook's opt-in package command,
  `yarn workspace @fluentui-react-native/desktop-driver test --runInBand`
  with `FURN_NATIVE_DRIVER_TEST=1`:
  79 suites / 1,251 tests; two suites / 45 tests **skipped**. The Windows
  fixture, operations, native-driver self-test, and other matching-OS native
  suites actually ran. This includes the registered-popup hung-provider,
  deferred-discovery, and listed/tracked publication regressions, rather than
  merely compiling them. These are hosted fixture results, not the remaining
  local real-application or physical-secondary reruns.
- **Passed:** Windows Storybook accessible smoke: 255 executed / 255 passed,
  no failures, skips, unsupported cases, or retries. Internal navigation
  diagnostics were retained; this count is the final selected-test summary,
  not a claim that every diagnostic navigation attempt succeeded.
- **Passed:** Win32 Storybook physical smoke: 288 passed and one
  unsupported/quarantined case; no failures or retries. The helper source
  digest was `89cc81fbb72cb8a79852e5d4d90ce96d8b2982283086236b860289f2664ac557`,
  matching the review helper.
- **Passed:** Windows legacy E2E, JS PR, both Win32 Storybook jobs, publishing,
  links, changesets, and CodeQL. Other hosted jobs were still completing
  during this follow-up; no whole-workflow pass is claimed.
- **Failed, deterministic:** Win32 legacy E2E executed 201 tests: 191 passed,
  ten menu tests failed only at the final “An assert popped up” safety check.
  Their menu-open/state checks had passed. The existing guard treated every
  second window as an assertion dialog. All 20 retained failure captures
  (including suite retries) showed the secondary accessibility root as `menu`.
  Correctly registering native menu windows exposed that consumer assumption;
  no flake rerun was requested.

Logs and the bounded downloaded E2E artifact are retained under
`artifacts\desktop\w3-buildci`: `ci-windows-storybook.log`,
`ci-win32-physical.log`, `ci-win32-job.log`, and `ci-win32-e2e`.

### Test-first correction and boundaries

`DesktopSessionClient.getWindowTree` now reads a currently listed session
window without selecting or activating it. The server refreshes authoritative
window membership and rejects unknown/closed IDs before tree inspection.
Native focus, selected-window identity, and input state are unchanged.

The Windows/Win32 legacy guard exempts only a single `menu` root without
nested dialogs or windows. Unrecognized secondary roots still fail; unreadable
windows reject rather than report no assertion. A menu cannot hide another
unexpected window. macOS, non-native runners, Android, and the native-task
library bypass keep their earlier behavior. Diagnostic window events are
not used as authority. The public route is documented in
[the WebDriver contract](protocol.md); it is a full tree query, not a budgeted
agent operation.

From `apps\E2E`, `yarn test` first produced **two expected failures** for a
legitimate menu and an unreadable secondary. From `packages\agentic\desktop-driver`,
the two focused new routing cases first failed because the read-only route
did not exist. Logs: `e2e-assert-red.log`, `window-tree-red.log`.

| Exact command                                                                        | Result                                                                                                                     |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `yarn test --runInBand desktopDriver.test DesktopDriverClient.test` (desktop-driver) | **Passed:** 52 tests, including non-activation and unknown/closed-window refusal.                                          |
| `yarn test --runInBand` (desktop-driver, native opt-in unset)                        | **Passed:** 73 suites / 1,203 tests; eight suites / 95 native tests **skipped**.                                           |
| `yarn workspace @fluentui-react-native/e2e-testing test`                             | **Passed:** all 11 adapter tests, including menus, possible assertions, failed reads, and unchanged other-runner behavior. |
| `yarn workspace @fluentui-react-native/desktop-driver build`                         | **Passed**.                                                                                                                |
| `yarn workspace @fluentui-react-native/e2e-testing build`                            | **Passed**.                                                                                                                |
| `yarn workspace @fluentui-react-native/desktop-driver lint`                          | **Passed**.                                                                                                                |
| `yarn workspace @fluentui-react-native/e2e-testing lint`                             | **Passed** after marking the mocked loopback URL as test-only.                                                             |
| `yarn workspace @fluentui-react-native/desktop-driver format`                        | **Passed**.                                                                                                                |
| `yarn oxfmt --check`                                                                 | **Passed**.                                                                                                                |
| `git diff --check`                                                                   | **Passed**.                                                                                                                |
| `yarn markdown-link-check -c .github\markdown-link-check-config.json <changed-file>` | **Passed:** E2E README and public protocol, 25 links.                                                                      |
| `yarn change:check`                                                                  | **Passed** after committing the implementation and patch changeset `quiet-menu-windows.md`.                                |

The new correction is committed locally and awaits coordinator review before
push. Its clean-cache aggregate and affected hosted E2E rerun are **not run
yet**; the earlier 178-task aggregate does not qualify this new source.
W1 holds the live desktop campaign. W3 has not launched an app, native helper,
fixture, WDIO suite, or physical action in this portable correction segment.
The final local Fabric semantic case, both final-helper secondary physical
clicks, and requested local native selector remain **not run**. Hosted
fixture passes do not substitute for those real-app/physical cases.

The shared process audit returned 2: it listed W5's test tree and the W3
formatter running concurrently with the audit. Both recorded W3 formatter
PIDs were confirmed exited afterward. No W3 native runtime or campaign is
left running; a globally clean audit is not claimed while peer work is active.

## Windows Fabric and Win32 Paper — closing-menu review correction — 2026-11-12 UTC

**Reviewed base:** `ad8b67c9720a00d7d8df4d27c2ca7436c78d6198`.
**Tested implementation:** `36efc5a88dc507c626f2d29ac487cfc37e9e4bf3`.
The coordinator's review accepted the scoped, non-activating tree query and
conservative menu classification, and identified a closing-popup race in the
legacy E2E adapter.

The adapter now skips a tree read only when its typed WebDriver error is
`no such window`, then continues checking other handles. Before reporting an
empty, non-menu, or dialog-containing tree as an assertion, it refreshes the
authoritative window list and confirms that handle is still present.
Persistent unexpected windows still fail the check. Transport, provider,
and stale-element errors still reject; no diagnostic event or input fallback
is used.

**Observed test-first:** `yarn test` in `apps\E2E` initially failed two new
cases: a `no such window` read rejected, and an empty closing-menu tree
reported an assertion. The retained log is
`artifacts\desktop\w3-buildci\popup-race-red.log`.
After the fix, all 14 adapter tests passed, including a vanished menu followed
by a real unexpected window, empty/non-menu roots followed by disappearance,
persistent unexpected roots, and unreadable still-listed windows.

| Exact command                                                                                                   | Result                                        |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `yarn workspace @fluentui-react-native/e2e-testing build`                                                       | **Passed**.                                   |
| `yarn workspace @fluentui-react-native/e2e-testing test`                                                        | **Passed:** 14 tests, zero skips or failures. |
| `yarn workspace @fluentui-react-native/e2e-testing lint`                                                        | **Passed**.                                   |
| `yarn oxfmt --write apps\E2E\src\common\nativeDesktop.ts apps\E2E\desktop-adapters.test.cjs apps\E2E\README.md` | **Passed**.                                   |
| `yarn oxfmt --check`                                                                                            | **Passed**.                                   |
| `git diff --check`                                                                                              | **Passed**.                                   |
| `yarn markdown-link-check -c .github\markdown-link-check-config.json apps\E2E\README.md`                        | **Passed:** 19 links.                         |
| `yarn change:check`                                                                                             | **Passed** after the implementation commit.   |

This correction changes only the private E2E adapter, its focused tests, and
related documentation; no native helper or public protocol changed. The
existing driver patch changeset remains committed.
Per coordinator instruction, the locked clean-cache aggregate, native
contracts, GUI/physical runs, and push are **not run** in this segment.
W1 retains the desktop campaign. W3 awaits its explicit grant for the final
Fabric semantic case, both secondary physical clicks, and final native
contracts/probe tests, then the clean-cache aggregate and publication.

## Windows Fabric and Win32 Paper — final sweep and native close-race correction — 2026-11-12 UTC

**App qualification revision:** `3957cd6aec1cf83c8dc62e4d56403fe942505aa4`.
**Close-race implementation:** `a53451513eb84f5ff62dc7763bd419521c617d5b`.
The session had returned to Active/unlocked before this campaign. All native
commands below used the W3 campaign and serialized lock with
`-RequirePhysical`; both preflight and postflight reported an eligible
**remote** session with the Default input desktop. No session change was
reported.

The registered Fabric native app was reused only after checking its install
identity and verifying no native app-source differences from its build
revision. Metro and bundles came from this worktree. Paper used the exact
REX executable with SHA-256
`3ecd1f58690b029eccf06838dc23411f08b1f3765b99950091f8246aedd74725`.
Apps, Metro, helpers, and fixtures were closed between runs.

The following results used helper source
`89cc81fbb72cb8a79852e5d4d90ce96d8b2982283086236b860289f2664ac557`,
artifact `eb91ef8a4164080bcae787aacce3fd5aa5556d8c3d0b22d0cd0c661a50934066`.
Run artifacts are under `artifacts\desktop\w3-qualification\runs\<run-id>`.

| Endpoint / case                       | Observed result                                                                                                                                                                                          | Run ID                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Fabric main/secondary semantic action | **Passed:** honest `activation-unsupported` refusal with effect `none`; no fabricated receipt, fallback, or app change.                                                                                  | `98d0ae8f-e84b-43c1-b332-7136dd676f23` |
| Fabric secondary physical click       | **Passed:** separately registered window, complete 11-node sample, physical-pointer receipt and public `focus: confirmed`, then retirement.                                                              | `537cc479-b3d3-4ef0-93b2-d39c35177653` |
| Paper secondary physical click        | **Passed:** exact owned tool window, complete eight-node sample, physical-pointer delivery and retirement. The legacy story has no native-command outcome, so this is not proof of the RN focus command. | `e29ff4aa-62f5-4f53-8a5e-450a5e799466` |

### Observed failure and test-first correction

With `$env:FURN_NATIVE_DRIVER_TEST='1'`, the requested package command
`yarn test --runInBand operations.contract win32Fixture.contract nativeDriver`
**failed**: 33 passed, one failed, two macOS-only cases skipped. The tool-content
fixture failed with `no-such-window`, not a session or permission refusal.
Its log remains `artifacts\desktop\w3-buildci\final-native-contracts.log`.
This failed sweep is not claimed as a final native pass.

A bounded diagnostic replay reproduced the failure on its first fixture.
The command journal isolated it to `windows` immediately after the close
button's successful accessibility click; the destroy event confirmed the
secondary had closed. Native enumeration can return a window that closes
before `WindowSummary` reads its geometry. This is separate from semantic
dispatch and the E2E adapter's closing-tree race.

The correction omits a geometry failure only when its code is
`no-such-window` **and** native liveness confirms the handle has gone. A
still-live handle's error and every unrelated error propagate. Direct
commands for the omitted window still refuse. No input fallback,
cross-process admission, or wire-schema change was added.

A deterministic native self-test closes a secondary exactly between
enumeration and geometry serialization. Before the guard, this command
**failed** its new live-window-listing assertion:

```powershell
yarn test --runInBand nativeDriver --testNamePattern 'handshakes with the Windows helper'
```

After the guard, the following command **passed**, two native cases with 26
unselected cases skipped. It includes the deterministic self-test and the
original real-fixture registration/action/closure scenario:

```powershell
yarn test --runInBand nativeDriver win32Fixture.contract --testNamePattern 'handshakes with the Windows helper|registers only owned untitled tool roots'
```

The self-test also verifies direct closed-window refusal, propagation of an
error for a live handle, and propagation of an unrelated error even when its
window closes. The unchanged diagnostic replay then **passed six isolated
fixture lifecycles**, including close polling and subsequent main-window
actions. Retained logs under `artifacts\desktop\w3-buildci` are
`trace-tool-contract-replay.log`, `closed-window-listing-red.log`,
`closed-window-listing-green.log`, and `trace-tool-contract-green.log`.

The fixed helper has source
`7119f42fb101452990b7bea13daf685e90a67ad75840fba60968a5efe42f62d1`,
artifact `e0e6fc988fc9214b91e02bd0909c099b203d4f9bfd89c45db8f8c9f9397a05e0`,
and build fingerprint
`afca889e68ccd07b9c1874b6d46b0c2a3a3f635e3e7b09c1b43eca20b9fb6f9c`.
The package `yarn build` and `yarn lint`, root `yarn oxfmt --check`,
`git diff --check`, and Markdown link checks for the native provider README
and protocol **passed**. Patch changeset: `brave-popup-listings.md`.

The new implementation needs coordinator review before push. The complete
native selector, Fabric semantic case, and both secondary physical clicks
must be rerun against this **new** helper; the earlier app results above do
not qualify its new source digest. The new-source clean-cache aggregate and
hosted CI are **not run** yet. The 200% DPI, mixed-DPI, and negative-origin
gaps remain unchanged. Both campaigns ended, and the final audit reported
`FURN-AUDIT: no FURN desktop processes found`.

## Windows Fabric and Win32 Paper — reviewed-helper final qualification — 2026-11-12 UTC

**Tested revision:** `6c626602cf1eedd10425c8a63d794b1e12b1ff95`, clean worktree
for every real-app run. The coordinator's Opus review of the close-race
correction reported no findings. W3 received a new desktop grant after W2's
recovery verification; the session was **remote**, Active/unlocked, with
the Default input desktop and `physicalEligible: true`.

All native and real-app commands below ran inside the W3 campaign and
serialized machine lock with `-RequirePhysical`. Every wrapper's before/after
session check stayed eligible. No hosted input skip or semantic action is
counted as physical evidence.

The source-verified helper cache selected source
`7119f42fb101452990b7bea13daf685e90a67ad75840fba60968a5efe42f62d1`,
artifact `e0e6fc988fc9214b91e02bd0909c099b203d4f9bfd89c45db8f8c9f9397a05e0`,
and build fingerprint
`afca889e68ccd07b9c1874b6d46b0c2a3a3f635e3e7b09c1b43eca20b9fb6f9c`.
The app supervisor used prebuilt-only policy, not an implicit helper build.
The exact native app identity was checked before each run. The registered
Fabric app had no native source differences from its build revision;
Metro and bundles came from this worktree. Paper used the exact REX executable
with SHA-256
`3ecd1f58690b029eccf06838dc23411f08b1f3765b99950091f8246aedd74725`.
The plain Win32 fixture executable had SHA-256
`9e082f5a9a50e1a6f93f8d91a0c01f8e880820030a7e9d8b5c1917993fc8bc13`.
Apps, Metro, helpers, and fixtures were cleaned up between runs.

The native package command below ran from `packages\agentic\desktop-driver`
with `$env:FURN_NATIVE_DRIVER_TEST='1'`. Endpoint supervisor commands ran
from the worktree root; their source and immutable run artifacts remain
under ignored `artifacts\desktop\w3-qualification`.

| Exact command                                                                                                              | Observed result                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn test --runInBand operations.contract win32Fixture.contract nativeDriver --verbose`                                   | **Passed:** three suites, 34 tests; two macOS-only cases **skipped**. The previously failing tool-content closure case passed. The log is `artifacts\desktop\w3-buildci\final-native-contracts-fixed.log`.                                                                                                              |
| `node artifacts\desktop\w3-qualification\run-endpoint.mjs windows --secondary-only --modern-only --activation-diagnostics` | **Passed:** main Pressable/Button and modern secondary refuse honestly with `activation-unsupported`, effect `none`, no delivery receipt, quarantine, physical fallback, or application change. Run `8f6d457c-c0d3-4ab5-9204-6dbf66383dbd`.                                                                             |
| `node artifacts\desktop\w3-qualification\run-endpoint.mjs windows --secondary-only --modern-only --physical-secondary`     | **Passed:** a distinct secondary is registered, its 11-node sample is complete, the click is applied through `physical-pointer`, the public `focus: confirmed` effect is observed, and its handle retires. Run `94c0b321-cebd-4e9b-99e2-3404bbbd80c3`.                                                                  |
| `node artifacts\desktop\w3-qualification\run-endpoint.mjs win32 --secondary-only --physical-secondary`                     | **Passed for native delivery:** the exact owned tool secondary is registered, its eight-node sample is complete, a physical-pointer click is applied, and its handle retires. Run `f46d008a-d310-4e6e-98fd-e85941879edd`. The legacy story has no native-command outcome, so this is not proof of the RN focus command. |

The full native selector executed the review-specific coverage, not just
compiled it: failed-probe retention and shared-deadline/retry self-tests;
the real hung-popup listing and bounded new-popup discovery/recovery cases;
truthful listed/tracked publication; the close-after-enumeration self-test
with live-error and unrelated-error propagation; and both legacy-only
activation refusals. Legitimate Invoke/Toggle and the existing observation,
capture, mutation settlement, containment, cancellation, and retention
contracts also passed. Cancellation completed in 32 ms; retained elements
stayed at 20 after 500 fixture cycles. The earlier failed sweep and
deterministic red/green evidence remain recorded above.

### Final-source aggregate and hygiene

After ending the native campaign and obtaining a clean audit, the exact root
command `cmd.exe /d /c "yarn clean-lage-cache && yarn lage buildci"` ran under
the W3 machine lock with **default TEMP and concurrency**, native opt-in
unset, and no policy, timeout, or guidance workaround. It **passed on the
first attempt**: 178 successful tasks, zero failed, aborted, pending, or
skipped tasks. Native tests remain opt-in in this aggregate and are qualified
by the separate 34-test run above.

The aggregate ran from 22:30:40 to 22:33:27 UTC. The operational supervisor
retained the lock until its owned descendants drained; drain completed
before lock release. Its retained log is
`artifacts\desktop\w3-buildci\final-buildci-fixed.log`. No readiness-flake
rerun was needed. No code changed after the reviewed and qualified source;
this publication update changes only Windows evidence/tracking.

The campaign ended. Both its post-campaign audit and the post-aggregate audit
reported `FURN-AUDIT: no FURN desktop processes found`. No W3 app, helper,
fixture, Metro, or WDIO process survived.

The current-source local reruns are complete. Hosted results for the
publication head will be recorded in draft PR #4498, separately from
earlier-head hosted evidence. The 200% DPI, mixed-DPI, and negative-origin
cases remain **not run** for the previously recorded authorization/topology
reasons; console Ctrl+C remains separate work in #4491.
