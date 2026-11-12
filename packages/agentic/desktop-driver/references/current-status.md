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

## 2026-11-12 UTC macOS physical-input postconditions (F16)

Part of [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441)
and [#4435](https://github.com/microsoft/fluentui-react-native/issues/4435).
This section is independent of the F15 ledger update in
[#4493](https://github.com/microsoft/fluentui-react-native/pull/4493).
The implementation commits are `6aa7a68ba`, `5baf9f735`, and `e0af46b38`,
based on `505a2187b`; they include menu-independent selection, the LiteUI
viewport fix, and bounded pointer acknowledgment. The separate renderer
prerequisite was first committed as `1492afe57`; the independently verified
backport branch starts at `505a2187b`, with patch commit `1eaa60a44` and
self-contained ledger commit `9393fe896`. Normal merge `adde47dfd` makes
that branch an ancestor of E. Its three-dot diff contains only E-owned
files, not the backport, manifest, lockfile, or Native Core documents.
All original implementation commits, including `1492afe57`, are retained.
The final
signed helper source digest is
`26c8f8e9060d0e10b26d6b7cab0ced556a172b29c1c14aac2429ce3e0773ebea`.
Local evidence is under `artifacts/desktop/f16-macos-physical/`, with consumer
reports under `apps/storybook/artifacts/desktop/<run-id>/`.

### Findings and fixes

- **Physical click: observed preview overflow and a separate identity defect.**
  A controlled 480 × 302 Paper window reproduced interception. Raw
  application-scoped and system-wide AX hit tests found the Controls addon
  button over the checkbox, not the checkbox. F15's Accordion screenshots
  show the same small-window, clipped-preview layout. Accepting any
  hit-tested ancestor window would therefore dispatch input to the wrong
  control. The guarded full physical run
  `8f464c02-6e09-4bbc-8007-059310e01c93` then exposed the same class at
  932 × 782: Input FocusTreatment's entry field started at window-relative
  y = 31.5 while its preview started at y = 76, and the actual hit was the
  Tone combobox. LiteUI's fixed-height, centered decorator placed oversized
  stories behind native chrome. Its macOS/Windows decorator now uses the
  existing Win32 pattern: a scrollable viewport with naturally growing
  content, centering only when there is spare space. No hit-test ancestor is
  accepted as the target and no story assertion changed. The unchanged
  oversized Input callback now passes, including all native focus and
  geometry assertions. At normal geometry the real descriptor's MCP
  Checkbox click, checked state, and physical receipt pass. Separately, the native
  `externalWindowSnapshot` incorrectly assigned an external hit the target
  window's identity, preventing the agent operation's foreground activation.
  External hits now have distinct opaque window identities, including other
  windows of the same application. A native regression failed before that
  fix; existing in-window obstruction checks remain unchanged. Two attempts
  to place a standalone external fixture in the foreground did not establish
  the fixture precondition; they are not external-occlusion qualification.
  At 480 × 302 the Controls addon still covers the Checkbox's native center,
  even with the scrollable decorator; the driver correctly rejects that
  unusable preview with effect `none`. The fix does not promise to click
  through chrome or implicitly resize a caller's window.
- **Keyboard clear: false-success root and ignored shortcut observed;
  menu-route explanation inferred.** The helper returned after posting
  Command-A/Delete, without checking native focus, selection, or the empty
  value. The first guarded full Paper physical run exposed the original
  Input callback's ignored Command-A: focus and foreground were established,
  the Select All menu item was enabled, but the selected range remained
  `{ location: 3, length: 0 }`. Explicit Unicode Command-A, physical pointer
  focus, and holding the chord until acknowledgment did not correct it.
  Physical Command-Up followed by Command-Shift-Down selected the complete
  value in the same field and cleared it. Keyboard clear now uses those
  document-navigation chords once, without the application's Select All menu
  route; the precise Paper menu-dispatch cause is not established.
  It confirms focus, waits for complete selection when
  `AXSelectedTextRange` is exposed, posts Delete once, and verifies an empty
  value. Unreadable values refuse before keys; unacknowledged selection,
  retained text, and cancellation retain the posted input's partial effect.
  There is no key replay, semantic fallback, or story assertion change.
- **Foreground activation: inferred from F15 evidence, observed in the
  regression.** F15 recorded a successful AXFrontmost setter with
  `frontmost=false`; the old fallback ran only for setter errors. Activation
  now checks the postcondition and requests workspace activation once when
  the acknowledged AX write did not establish foreground state. The final
  foreground/main-window checks remain mandatory. No Accordion story or
  assertion was changed.
- **Pointer acknowledgment: an exposed timing gap, with inferred connection
  to the full-run failure.** Run `c741b8d5-1a4b-49a0-b2f8-24ba25e8e8c1`
  stopped at Button Default because the pointer was not at its requested
  coordinate; the same callback passed on a fresh isolated run. Code checked
  the asynchronous move only once, after 16 ms. A recorded-input regression
  reproduced delayed OS observation, and another exposed lost cancellation
  during that acknowledgment. Position is now read for a bounded roughly
  200 ms, without reposting the motion or pressing a button until verified.
  The specific full-run delay/interference cause is not established.
- **Fabric renderer prerequisite: failing reader observed, concurrent writer
  inferred.** Full physical and accessible qualification exposed a crash in
  the unchanged PGB-006 window-resize callback. A fresh DerivedData/native
  rebuild still failed. The owned-process AddressSanitizer report recorded
  main-thread `BUS` in `folly::dynamic::type()` while `ShadowNode::clone`
  copied `nativeProps_DEPRECATED` during AppKit layout. The installed fork
  had an unguarded cloning reader and two UIManager writers. The
  minimal upstream MIT backport documented in
  `@fluentui-react-native/native-core/references/rnmacos-patch.md` gives
  them the family-owned mutex from React Native commit
  `923e7ddcaf4d2de45ca7dedafbb84c6b87dbffc4`, releasing it before parsing
  and shadow-tree commits. The concurrent writer is inferred from source
  and the upstream correction, not established by ThreadSanitizer.
  The backport is required for the complete Fabric physical lane's PGB-006
  resize case, not for the three original input reproductions.

### Native and focused qualification

The responsible process tree had Accessibility, PostEvent, and Screen
Recording authority; permission diagnostics requested no prompts. Native,
GUI, physical-input, and aggregate commands use the shared native lock.
The helper is standalone: CocoaPods-module and Office bridging-header
qualification do not apply.

- **Passed:** `swift build -c release -Xswiftc -warnings-as-errors` with a
  worktree-local scratch root; helper self-test **461/461**. The first regression
  run failed seven new checks; the external-hit regression then failed
  independently before its fix. The menu-independent selection regression
  failed **458/459** before its fix. Pointer acknowledgment and cancellation
  regressed **459/461** before their fix. Logs: `native-regressions-red.log`,
  `native-hit-regression-red.log`, `document-selection-red.log`, and
  `document-selection-green.log`, `pointer-ack-red.log`, and
  `pointer-ack-green.log`.
- **Passed:** driver `yarn format`, `yarn lint`, `yarn build`, and focused
  `yarn test act.test sessionInput --runInBand`: **24 passed, 62 skipped**
  (the selector also discovers opt-in platform contracts).
- **Passed:** complete driver suite with `FURN_NATIVE_DRIVER_TEST=1` and
  stable signing, **75 suites / 1,240 tests passed; 6 suites / 47 tests
  skipped**, including the macOS native build, framing, authority, and
  incarnation contracts. The final complete run took **151.668 seconds**
  (`native-package-contracts-post-backport-repeat.log`); an earlier complete
  run also passed (`native-package-contracts-final.log`). Skipped contracts
  are not native qualification.
- **Failed, final native-suite repeat:** **1,238 passed, 2 failed,
  47 skipped** (`native-package-contracts-post-backport.log`). Both failures
  are the existing `nativeDriver.test.ts` macOS helper build/sign/reuse
  contracts exceeding their unchanged **240-second** test deadlines. Other
  contracts passed. No native-source change accompanied this repeat, and
  the timeout cause is not established; the earlier passing suite does not
  turn this failed repeat into a pass.
- **Passed after timeout isolation:** unchanged
  `yarn test nativeDriver.test --runInBand` with native opt-in and signing,
  **10 passed, 1 skipped**, in **106.588 seconds**
  (`native-package-contracts-focused-after-timeout.log`), followed by the
  complete passing suite above. No test deadline, source, or assertion was
  relaxed. These passes do not establish the earlier elapsed-time cause.
- **Passed:** runtime `yarn format`, `yarn lint`, `yarn build`, and
  `yarn test --runInBand`: **25/25**, four suites. The added LiteUI viewport
  contract failed first, alongside two passing Win32 cases
  (`liteui-viewport-red.log`), then all three focused cases passed.
- **Passed, Paper:** bundle and native build after the viewport change;
  unchanged oversized Input FocusTreatment callback **1/1**, run
  `70b6f0cd-b569-4d80-9a11-8495aa9fc68c`
  (`paper-viewport-fixed-callbacks-treatment-qualification.json`).
- **Passed, Paper:** real MCP descriptor Checkbox physical click, checked
  state, `physical-click: 1`; required-keyboard clear verified empty with
  `keyboard: 2` and no semantic-clear receipt
  (`paper-native-props-final-qualification.json`, final helper digest above).
- **Passed, Fabric:** the same real-descriptor MCP click, checked state, and
  physical receipt, plus required-keyboard clear with verified typed/empty
  values and `keyboard: 2`, without semantic fallback
  (`fabric-native-props-final-qualification.json`, source `1492afe57`).
- **Passed, Paper:** the original Input callback, without retries or changed
  assertions, run `7a7a9962-1633-4060-b4a6-aa5fdaeb5939`, **1/1**
  (`paper-document-fixed-callbacks-input-qualification.json`). The earlier
  full physical run `99a6f266-3f9d-471e-8ca8-75d879b5205b` failed honestly
  with partial effect before Delete; the held-chord experiment also failed.
  Neither result is counted as a pass.
- **Passed, Paper:** both unmodified Accordion callbacks through
  `yarn storybook test --macos --paper --test '*ACC-001*' --input physical --reporter json`,
  **2/2**, run `9cc7f6b4-63e2-484e-98a1-a57bab79174b`
  (`paper-native-props-final-callbacks-qualification.json`). The unchanged
  oversized Input callback also passed **1/1**, run
  `da79154b-fce2-4137-b324-1b870e9133a7`
  (`paper-native-props-final-callbacks-treatment-qualification.json`).
- **Passed, Fabric:** both unchanged Accordion callbacks, **2/2**, run
  `e2dc76d4-40c4-46ff-a2e1-238777623093`; oversized Input FocusTreatment
  callback **1/1**, run `db6b223f-cc45-465e-8952-89383d5c5c2e`
  (`fabric-native-props-final-callbacks-qualification.json` and
  `fabric-native-props-final-callbacks-treatment-qualification.json`).
- **Passed, Paper accessible smoke:** final helper, **259 passed, 3 declared
  unsupported**, run `e638b907-df55-412a-b1ae-fdebd3df522a`, with no failed,
  skipped, or quarantined cases. Declared native projection gaps are not
  passes.
- **Passed, Paper physical smoke:** isolated full rerun, **343 passed,
  3 declared unsupported**, run `b0ad0949-786d-4550-a620-402a4f4609ba`,
  including the original Input, focus-treatment, and Accordion callbacks.
  There were no failed, skipped, quarantined, retried, flaky, or incomplete
  cases (`paper-final-physical-repeat-lanes-qualification.json`).
- **Failed, Paper physical smoke:** run
  `3067945a-9c0f-460a-8895-8c8b0387fc01` stopped during Radio story
  navigation, before callbacks: **82 passed, 3 failed, 138 unfinished work
  items**. The first context change did not settle; subsequent mutations
  correctly refused the quarantined target. A fresh accessible run passed
  the same catalog; this does not establish a physical-input root cause or
  count as successful physical qualification. The isolated full physical
  rerun above passed without changing production code, policy, assertions,
  or callback retries; the earlier failure remains recorded.
- An instrumented MCP attempt with pre-click menu/AX probing stopped before
  dispatch with `automation-failed`, not an obstruction. Final descriptor
  checks omit that extra diagnostic interposition and pass. Instrumentation
  causality is not established; the failed attempt remains in
  `paper-pointer-fixed-qualification.json`.
- **Failed before the backport, Fabric full smokes:** physical run
  `7bfe3fc7-bcbc-4275-ac5b-b457b66af7d7` reached **295 passed, 1 failed,
  3 declared unsupported**; accessible run
  `aebe42da-fcf5-4482-8eec-3e28401ea50c` reached **246 passed, 1 failed,
  3 declared unsupported**. Both lost the application during PGB-006's
  window resize, and ownership checks refused stale-window evidence.
  The same unchanged callback passed **1/1** in isolation, run
  `7daeeea1-5042-4dd8-9efa-0b227b33a9a1`
  (`fabric-callbacks-progress-current-qualification.json`). The isolated
  pass does not qualify either full lane.
- **Failed before the backport, clean Fabric resize:** fresh DerivedData and
  a native rebuild retained AddressSanitizer but still lost the application
  in the unchanged forced PGB-006 callback, run
  `5314fc3d-da45-403e-b9bd-e187f0a9284c`. The later owned-process report
  `fabric-progress-asan-report.86816` pinpointed the native-props copy.
  Diagnostic stdout/stderr redirection changed the result; those passes
  are not evidence of a fix.
- **Passed after the backport, clean Fabric resize:** deleted only this
  worktree's Pods and DerivedData, regenerated dependencies, bundled, and
  built the native app. The unchanged forced callback passed **1/1**, run
  `61d2dce4-5980-49b9-a727-412da47fca71`, with AddressSanitizer still linked.
  Native Core's Apple module/Office-style bridging-header probe passed
  **3/3** (`native-props-clean-build-green.log`). This probe is not an
  Office application build.
- **Passed after the backport, complete Fabric physical smoke:**
  `yarn storybook smoke --macos --mode stories-and-tests --input physical --reporter json`,
  **343 passed, 3 declared unsupported**, run
  `3cb2f6af-69fd-44c1-8fb0-495607e37ca0`.
- **Passed after the backport, complete Fabric accessible smoke:**
  `yarn storybook smoke --macos --mode stories-and-tests --input accessible --reporter json`,
  **260 passed, 3 declared unsupported**, run
  `e8ef9d6a-e3a0-4164-b692-de319aaae545`. Both final Fabric lanes had zero
  failed, skipped, quarantined, incomplete, retried, or flaky cases and no
  owned process survivors
  (`fabric-native-props-final-lanes-qualification.json`). Their ordinary
  launch path retained AddressSanitizer; no diagnostic output redirection
  or callback assertion change was used to make them pass.
- **Passed after the backport, complete Paper physical smoke:**
  `yarn storybook smoke --macos --paper --mode stories-and-tests --input physical --reporter json`,
  **343 passed, 3 declared unsupported**, run
  `064e399f-2bd0-4913-9996-f2cb3b5aead6`. The application smoke exited
  successfully with zero failed, skipped, quarantined, incomplete, retried,
  or flaky cases. The local wrapper then failed its additional cleanup
  assertion: a substring-only process detector counted the queued
  standalone-build `bash` and `lockf` commands because their arguments
  mentioned the future native image. Both recorded PIDs are wrappers,
  not app/helper/Metro survivors. The original evidence is retained in
  `paper-native-props-final-lanes-qualification.json`, with the exact
  classification in `paper-native-props-final-cleanup-classification.json`.
  The ignored harness now checks executable identity; no product code,
  assertion, or smoke result was changed, and no physical input was replayed
  to conceal this harness failure.
- **Passed after the backport, complete Paper accessible smoke:**
  `yarn storybook smoke --macos --paper --mode stories-and-tests --input accessible --reporter json`,
  **259 passed, 3 declared unsupported**, run
  `4882b35f-20a4-442a-a097-5fb5b572000e`. This separate complete run used the
  corrected harness and had zero failed, skipped, quarantined, incomplete,
  retried, or flaky cases and no owned survivors
  (`paper-native-props-accessible-final-lanes-qualification.json`).

### Hosted policy

The new advisory `macos-storybook-physical` Fabric job has no disabled input
features, runs the explicit physical lane, and uploads its own artifacts.
It is not in the aggregate `pr` job's `needs`. Existing Fabric, Paper, and
legacy macOS compatibility jobs retain their `physicalClick` mask: fixing
external-hit identity and passing managed local input do not qualify hosted
foreground behavior or remove genuine clipped/covered controls.

### Final repository acceptance

- **Failed, initial aggregate:** the required locked
  `yarn clean-lage-cache && yarn lage buildci` first stopped on this ledger's
  new sibling-package Markdown link. It was corrected to the
  package-qualified code span required by R-PKGDOC-005, and
  `yarn check-agent-instructions` passed.
- **Failed, ordinary parallel aggregate retries:** the unchanged
  `boundedCommand.test.ts` escalation fixture received `SIGTERM` rather
  than its expected `SIGKILL`. Its child installs the ignored-signal
  handler after Node startup, with no readiness handshake before the
  300 ms deadline; a startup/deadline race under aggregate load is inferred,
  not directly timed. The focused serial check passed **7/7**, and the
  complete opt-in driver suite above also passed unchanged. No source,
  timeout, or assertion in this area was modified
  (`buildci-final-retry.log`, `buildci-final-complete.log`, and
  `bounded-command-focused-final.log`).
- **Passed, final locked aggregate:** `TF_BUILD=1 yarn lage buildci`, using
  the repository's existing serial-Jest mode in `scripts/src/tasks/jest.ts`,
  completed **18 tasks with 160 cached/skipped tasks**, zero pending or
  aborted tasks, and exit code 0 (`buildci-final-serial.log`). There was
  no second cache clear. Serial execution does not change the selected
  assertions or establish the earlier timing cause.
- **Passed:** changed Markdown link checks for all **11 files**, root
  `yarn oxfmt --check`, `yarn check-agent-instructions`, and
  `git diff --check`, plus `yarn change:check`. All source changesets were
  committed before the changeset check.
- **Passed, cleanup:** the locked exact-worktree argv and Node CWD scan at
  **18:14:43 UTC** found no E-owned app, Metro, helper, compiler, or fixture
  survivors (`process-cleanup-final.json`). This includes the standalone
  backport child worktree, excludes other owners, and terminates none of
  their processes. The audit command completed and released its lock.
  Diagnostic launch wrappers and copied dependency/backport scratch were
  removed; qualification evidence and both Git worktrees remain.

### Local disposition and remaining limits

F15's three input findings are resolved locally on this branch at usable
window geometry: both renderers have real-descriptor physical receipts,
verified keyboard clear, and passing unchanged Accordion callbacks.
Genuine chrome overlap in a 480 × 302 window still refuses input safely;
this is not a promise to click covered content. The external-occlusion
fixture did not establish its foreground precondition, so that native
scenario remains unqualified.

The shared viewport's Windows/Win32 native behavior, hosted macOS
foreground behavior, macOS FluentTester, and other native application
hosts were not run locally. Native Core's module/bridging-header probes
are compile checks, not Office application qualification. The separate
backport ledger records the immutable install and fresh native build of
the bottom branch without E's driver/runtime sources.
