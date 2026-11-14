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

The macOS permission gate was **resolved, observed 2026-11-12**: the
stable-signed helper reports Accessibility/PostEvent true without prompting.
This alone is not requalification; see the
[2026-11-12 supporting evidence](#f15-non-ax-macos-supporting-evidence--2026-11-12).

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

The rebased real Storybook consumer passes at
`ca88c289c0fbd79b03dbd43b9bd85f0b21e7e800` independently passed all
**9 ownership checks on Fabric and all 9 on Paper**, with no cleanup failures.
Each accessible smoke passed **224/224**, with no failures/skips/unsupported
cases/retries; one physical callback was excluded before selection.
Neutral supervisor/session lifetime, exact external preservation, independent
application exclusion, read-only inspection and exact cleanup all passed.
This supplements the unchanged helper's native contracts and does not
qualify arbitrary descendants or deferred Storybook lifecycle integration.
Exact commands and report IDs are in the harness ledger.

**Aggregate qualification remains failed:** one plain cache-cleared
`yarn clean-lage-cache && yarn lage buildci` encountered an unreproduced
desktop-test pack dry-run failure. Two unchanged plain `yarn lage buildci`
retries then reproduced the pre-existing `boundedCommand` parallel-startup
SIGKILL/SIGTERM assertion; the first also hit an unmodified private-storage
timeout, which passed in the last attempt. The focused serial diagnostic
passed 73 with 10 skipped. No environment/concurrency override or unrelated
test fix was used; this does not establish a green aggregate.

Separate Markdown validation passed 90 link-check tasks. Final locked
cleanup proved **24 exact incarnations exited**, **3 ports closed**, zero
worktree processes and no shared/fixture claims. Four test workers briefly
outlived the failed aggregate but all exited naturally before cleanup
inspection. The final verifier and lock reacquisition passed. The harness
ledger preserves each exact command and every failed attempt.

### 2026-11-12 review follow-up: bounded qualification fixtures

Source commit `0fb6cd47fccc4f6210797b25085e7b56aa8ca4fe` bounds the
ready crash-owner fixture to a 120-second wait followed by exit 1 and adds
four lines requesting AppKit fixture termination on the main queue after
300 seconds. The `/bin/sleep 300` descendant was already bounded. Its focused
portable regression exercises the same wait with a short deadline and no
native resources. Production helper/ownership behavior, exact-identity
cleanup and durable claim fences are unchanged.

The portable regression failed with `ETIMEDOUT` before the fix and passed
afterward. The focused harness suite passed 30 with no skips. Both owning
packages' format, lint and build passed; full portable suites passed driver
1,237 with 66 skipped and harness 410 with 14 skipped.

**Native build passed, runtime blocked:** under the shared native lock,
`node packages/agentic/desktop-driver/native/macos/fixtures/build.cjs artifacts/desktop/f10m/retirement-followup-20261112/fixture`
compiled and strictly verified the stable-signed fixture. Nonprompting
doctor reported `screenLocked=true`, despite effective permission preflights.
No application was launched. The earlier native and Fabric/Paper passes are
pre-fix evidence present at `16558610ff2bd14775430f86c738c12947fe81ee`,
not qualification of the new retirement deadlines.

The single fresh `yarn clean-lage-cache && yarn lage buildci` failed only the
unchanged `boundedCommand.test.ts:31` SIGKILL/SIGTERM assertion, with driver
1,236 passed, 1 failed, 66 skipped. No environment/concurrency override or
retry was used. Separate links passed 90 tasks. Final locked audits found
zero worktree workloads/unreadable candidates; no signals were issued.

The harness ledger's "Review follow-up: bounded fixture retirement" section
records exact commands and limitations. Evidence is retained under
`artifacts/desktop/f10m/retirement-followup-20261112/`.

## Windows Fabric and Win32 Paper — F10-W application ownership — 2026-11-12 UTC

**Source and dependency:** Windows implementation commit
`6e881e1a05fef735c1b9bacd7d123285f47269ff`, branch
`user/jasonvmo/desktop-windows-app-ownership`, stacked on F10-M #4492 at
exactly `6489386956c0485cb91b478a8f4adc4828f4178b`. The intended draft PR
base is `user/jasonvmo/desktop-macos-app-ownership`; its independently owned
branch must not be rewritten. This implements the same neutral
`applicationOwnership` host/resource model, schema 3 claims, native OS owner
identity, `processIdentity`, `inspectApplication`, and launch settlement
metadata, rather than a parallel Windows contract. Application naming uses
the existing neutral publication seam; no additional F11 #4448/#4491-owned
file changes were made relative to the pinned base.

**Observed, portable Windows host:** the driver's declared format, lint and
TypeScript build passed. With native opt-in unset, the full driver suite
passed **74 suites / 1,234 tests**, with **9 suites / 93 tests skipped**.
The focused `NativeDesktopHost.applicationIdentity` suite passed **31 tests**,
covering malformed/missing Windows image/session/AUMID/start evidence,
read-only inspection and trusted recovery response/input validation.
Test-first failures were observed before implementing the Windows boundary;
those fake-helper tests do not establish native exclusion or cleanup.

Commands ran from the worktree root; `$W2` denotes that root. `TEMP`/`TMP`
were scoped to its ignored `artifacts\desktop\f10w\scratch` directory and
`FURN_NATIVE_DRIVER_TEST` was unset.

| Command                                                                                                                                                                 | Result                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `yarn workspace @fluentui-react-native/desktop-driver format`                                                                                                           | Passed                              |
| `yarn workspace @fluentui-react-native/desktop-driver lint`                                                                                                             | Passed                              |
| `yarn workspace @fluentui-react-native/desktop-driver build`                                                                                                            | Passed                              |
| `yarn workspace @fluentui-react-native/desktop-driver test --runInBand --cacheDirectory "$W2\artifacts\desktop\f10w\jest-driver"`                                       | Passed; native opt-ins skipped      |
| `yarn workspace @fluentui-react-native/desktop-driver test --runInBand NativeDesktopHost.applicationIdentity --cacheDirectory "$W2\artifacts\desktop\f10w\jest-driver"` | Passed 31 tests                     |
| `yarn check-agent-instructions`                                                                                                                                         | Passed                              |
| `yarn oxfmt --check`                                                                                                                                                    | Passed repository-wide, 3,163 files |

Ignored run evidence: `artifacts/desktop/f10w/portable-20261112/driver-test.log`,
`driver-build.log`, `driver-lint.log`, and `changed-markdown-links.log`.
Every changed Markdown file's link check passed. The root formatter
deliberately excludes `.changeset/*.md`; the committed patch changeset
`windows-exact-application-ownership.md` covers driver, harness and Storybook.

**Observed, compile only:** the locked direct `buildWindowsDriver` Debug/x64
invocation (`buildId: f10w-compile-02`, staging
`artifacts/desktop/f10w/b2`) passed in **35.09 seconds, 0 warnings / 0 errors**.
All seven changed C++ source/header files match the successful build's source
snapshot byte-for-byte. The first compile failed on a self-test `std::wstring`
argument, corrected to `.c_str()` before the successful build. Native build
log: `artifacts/desktop/f10w/b2/build.log`; output:
`artifacts/desktop/f10w/b2/output/furn-desktop-driver-host.exe`.
No helper self-test, fixture or application was executed by this compile.

**Implementation, not native qualification:** Windows leases and inspection
retain canonical image, seven-digit native creation time, session and packaged
AUMID. Exact pins reject a one-tick mismatch and ambiguous candidates. A
per-incarnation nonwaiting semaphore excludes controlling helpers; a losing
packaged activation receives no cleanup authority over another controller.
Unpackaged launches retain suspended-create / Job Object containment.
Packaged activation stays explicitly `uncontained`: a post-activation job
cannot remove its already-running race and may encounter existing job
restrictions. Exact primary-process cleanup is not arbitrary-descendant proof.

| Native acceptance case                                     | Windows Fabric packaged | Win32 Paper REX | Reason / required next evidence                                              |
| ---------------------------------------------------------- | ----------------------- | --------------- | ---------------------------------------------------------------------------- |
| Exact AUMID / image / REX incarnation, start and session   | Not run                 | Not run         | Awaiting the lane's granted desktop campaign                                 |
| Native one-tick/session/image rejection and ambiguity      | Not run                 | Not run         | Authored native fixture/consumer contracts; portable tests do not prove this |
| Cross-service exact-application exclusion                  | Not run                 | Not run         | Must use independent real helpers                                            |
| Job containment / explicitly fenced packaged activation    | Not run                 | Not run         | Runtime process/lease evidence required                                      |
| Physical input mutex                                       | Not run                 | Not run         | Requires physical opt-in and connected/unlocked session gate                 |
| Acquired survivor journaling and next-run exact recovery   | Not run                 | Not run         | Requires identity-verified helper/owner fault injection                      |
| Five consecutive launches/teardowns without identity leaks | Not run                 | Not run         | Required separately on both real endpoints                                   |

Native session kind is **not sampled**: no GUI/physical campaign has run.
Planned provider command, under the exclusive lock:
`$env:FURN_NATIVE_DRIVER_TEST='1'; yarn workspace @fluentui-react-native/desktop-driver test --runInBand applicationOwnership.contract`.
The consumer runbook is
`packages/agentic/desktop-test/references/native-qualification.md`,
“Neutral Windows application ownership”; it additionally exercises three
paired packaged activations and physical input across both endpoint helpers.
The pre-campaign audit observed `FURN-AUDIT: no FURN desktop processes found`;
no W2 campaign was started. These are preparation results, not native or
hosted-CI qualification. Part of #4447 and #4435.

Preparation closeout on the implementation SHA above: the post-commit
focused driver rerun passed **31 tests**. `yarn change:check` passed;
`yarn lage test-links --verbose --grouped` passed **90 tasks, 0
failed/skipped**. The two appended Windows ledgers' link checks passed
(driver 6 links, harness 15), and `yarn oxfmt --check` again passed
3,163 files. Only Windows evidence text followed those checks; no native or
runtime source changed. Additional ignored provenance under
`artifacts/desktop/f10w/portable-20261112/`:
`tested-source-revision.txt`, `compile-source-evidence.json`,
`driver-focused-committed.log`, `test-links.log`, and `root-format.log`.

## Windows Fabric and Win32 Paper — F10-W native qualification — 2026-11-12 UTC

**Observed source:** application qualification ran at
`8343dc0c48a2de01475454c892e7a295523caa75`; helper/self-test correction
`4a4b87f37b574820b93e342b68721d931be07c55` follows implementation
`6e881e1a05fef735c1b9bacd7d123285f47269ff`. The branch remains
`user/jasonvmo/desktop-windows-app-ownership`, pinned on #4492 at
`6489386956c0485cb91b478a8f4adc4828f4178b`. The coordinator handoff
`W2-base-decision.md` records **STACK**: W2 implements the inherited neutral
application host/resource model, schema-3 native owner claims, exact process pins,
inspection and settlement messages, rather than a second Windows model.
Application naming required no new F11-owned file edits. The eventual draft PR
base remains `user/jasonvmo/desktop-macos-app-ownership`; later dependency
movement does not authorize a rebase, merge or dependency-branch push.

**Observed host and identity:** Windows build 26300 x64, Node 26.13.0,
active/unlocked RDP (`sessionKind: remote`, `windows-session:1`). Every native
command used the exclusive W2 lock and `-RequirePhysical`; before/after gates
stayed eligible. The actual endpoint helper's SHA256/artifact identity is
`863cc2dbfc8f5792d22c8606376d226affbf8655fe4ded62ba78c23a29c516c7`,
source digest
`ea76e931dc4cdebc87e0621a7d730f81faabce5ef902063a0512cd7c2b100f2d`,
Debug/x64. Resolution was prebuilt-only.

The registered Fabric build was reused from the coordinator-specified
`furn-81` worktree, built at `bdeb0b291`: no Windows app/native-core Windows
source differs from that build. Its generated `RnwNewArch` and `UseFabric`
properties are true. All five ordinary native identities matched the registered
manifest's exact image and AUMID
`40411fc5-8e92-4d46-b68d-b62df44b1366_syyqehzwccsyy!App`.
Metro and both JavaScript bundles came from W2. Win32 used the canonical
prebuilt REX `ReactTest.exe` and W2's Paper bundle; Win32 native app build is
**Unsupported**, not a skipped build.

**Observed provider result:** `nativeDriver`'s selected Windows build/reuse/
resolution/handshake contract and all five new `applicationOwnership` fixture
cases passed: **2 suites / 6 tests passed**, 10 unrelated filtered cases skipped.
This includes the native C++ self-test and the actual physical mutex fixture.
The first self-test run failed because an existing release-count assertion
kept a pointer into a destroyed temporary JSON result. Commit `4a4b87f37`
retains the result for the assertion; the native rerun passed. This is a
self-test lifetime fix, not a change to release behavior.

From `packages/agentic/desktop-driver`, the exact selected test command was:

```powershell
yarn test --runInBand --cacheDirectory "$W2\artifacts\desktop\f10w\jest-driver" --runTestsByPath src\native\nativeDriver.test.ts src\native\windows\applicationOwnership.contract.test.ts --testNamePattern 'Windows exact application ownership|builds, reuses, resolves, and handshakes with the Windows helper' --json --outputFile "$W2\artifacts\desktop\f10w\native-20261112\driver-native-fixed-results.json"
```

Inherited settings were `FURN_NATIVE_DRIVER_TEST=1`,
`FURN_NATIVE_PHYSICAL_INPUT_TEST=1`, native cache
`$W2\artifacts\desktop\f10w\n`, configuration `debug`, build policy `never`,
and project-local `TEMP`/`TMP`. From `apps/storybook`,
`yarn desktop-driver doctor --platform windows --configuration debug --cache-root "$W2\artifacts\desktop\f10w\n"`
**passed** against the selected artifact. An initial doctor without the explicit
configuration selected its CLI default `release` and correctly reported no
verified prebuilt; that setup attempt was not a native application result.

The separate real-endpoint consumer suite passed **9 tests / 0 failed /
0 skipped**:

| Case                                                                  | Windows Fabric packaged                                                  | Win32 Paper REX                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------- |
| Exact AUMID/image/REX incarnation, native start and session           | Passed                                                                   | Passed                                                   |
| Start/session/image mismatch; independent exact-controller exclusion  | Passed                                                                   | Passed                                                   |
| Multiple actual matching processes/windows refuse unpinned inspection | Passed, three pairs                                                      | Passed, three pairs                                      |
| Containment or explicit exact-identity fencing                        | Passed, `uncontained` and journaled                                      | Passed, `job-object`                                     |
| Physical Shift contention, effect-none cancellation and transfer      | Passed                                                                   | Passed                                                   |
| Live-owner fence, acquired journal and next-run recovery              | Passed, packaged app survived helper crash then exited by exact recovery | Passed, Job Object drained then the claim was reconciled |
| Repeated launches and settled teardown                                | Passed 5/5, five distinct incarnations                                   | Passed 5/5, five distinct incarnations                   |
| Close one concurrent winner without ending the other                  | Passed 3/3 pairs                                                         | Passed 3/3 pairs                                         |

Both packaged contenders started distinct processes in every pair. Same exact
incarnation exclusion was independently proved by pinned attach, but a
**shared-PID packaged activation race was not induced**. Actual kernel PID
recycling was **Not run**; the real fixture's one-100-ns-tick mismatch and both
endpoints' stale-start refusal passed. Arbitrary uncontained descendants and
mixed Storybook-graph recovery remain outside this bounded qualification.

Ignored evidence root: `artifacts/desktop/f10w/native-20261112/`.
`driver-native.log` retains the initial failure;
`driver-native-fixed.log` and `driver-native-fixed-results.json` retain the
green provider run. `qualification-summary.json`, `selected-helper.json`,
`application-build-provenance.json` and `consumer-evidence-final.json` record
the tested source, binary hash, registration, bundles and per-case identities.
The real consumer run is `windows-application-ownership-GiW4x1`; outer command
report `4ed98f8f-8ebb-49ca-ac90-2ee6caece7dc` is a lifecycle report, not the
test-count source. The harness ledger records the full consumer commands.

**Observed closeout:** all W2 campaigns ended; before/after audits were clean:
`FURN-AUDIT: no FURN desktop processes found`. No helper, fixture, Metro, REX
or packaged app from W2 survived. Review, the final one-time clean-cache
`buildci`, push, draft PR and hosted CI remain **Not run** at this review
handoff. The three-package patch changeset remains
`windows-exact-application-ownership.md`. Part of #4447 and #4435.

## Windows Fabric and Win32 Paper — recovery review follow-up — 2026-11-12 UTC

**Scope and provenance:** the review of `6489386956c0..6bdcde61f` found that
trusted recovery incorrectly rejected an application's reused PID. The fix is
commit `8b2fb7e67dc5864180c7863ac94fc3c0c3c9d6e3`, still stacked on the
pinned #4492 dependency `6489386956c0485cb91b478a8f4adc4828f4178b`.
No rebase, dependency-branch write, push, or PR occurred.

**Implemented, not yet runtime-qualified:** recovery first queries native
creation time with `PROCESS_QUERY_LIMITED_INFORMATION`. A different time
settles the recorded incarnation as `exited`, without application control,
termination rights, or signals to its live replacement. An unreadable start,
including access denied, remains fenced. A matching start still requires
complete identity and exclusive control before exact cleanup. Inspection and
attach continue rejecting stale pins. This supersedes the earlier ledger's
recovery-specific stale-start refusal; that earlier native run does **not**
qualify the corrected recovery semantics.

**Observed validation:**

- **Passed:** package `yarn format`, `yarn lint`, and `yarn build`.
- **Passed:** `yarn workspace @fluentui-react-native/desktop-driver test --runInBand`
  with native opt-in unset: **1,234 passed, 93 skipped**. Native skips are
  not native qualification. Expanded arguments/results are retained under
  `artifacts/desktop/f10w/review-20261112/driver-tests.log` and
  `driver-results.json`.
- **Passed:** compile-only Windows x64 Debug `build-driver --platform windows
--configuration debug --cache-root artifacts/desktop/f10w/n --force
--reporter json`, through the declared package CLI and machine lock. It
  waited for W3's campaign, acquired the lock at `2026-11-12T16:50:25Z`,
  launched/registered no application, and exited zero.
  Helper source digest:
  `3558e8597f6cfe1ee3f4e38dca2137710b80d193a5c30bf946d54065bf8bc153`;
  executable SHA-256:
  `97f0072ce22449bc5c87c05de259d3e4c46eca666e6135977432b30fa16053b2`.
  Full invocation/artifact receipt: ignored `helper-build.log` in that evidence
  directory. Compilation is not native runtime or renderer qualification.

**Not run on this corrected source:** native self-test, the expanded fixture
recovery case, and Windows Fabric/Win32 Paper consumer recovery. The opt-in
fixture now expects a stale recorded start to return `exited` while the live
controlled replacement survives; matching-start session/executable/AUMID
mismatches and another controller must still fail closed. Consumer Native RED
against the retained pre-fix helper and provider/consumer GREEN against the
rebuilt helper await the next granted W2 campaign, under the physical-session
gate where applicable.
No W2 campaign or session kind is claimed for this compile/portable phase.
Final clean-cache `buildci` and publication remain **Not run**. Part of #4447
and #4435.

**Observed closeout:** root `yarn oxfmt --check` (**3,163 files**),
`yarn check-agent-instructions`, `yarn change:check`, `git diff --check`, and
link checks for every edited Markdown reference and both ledgers **Passed**.
The first concurrently requested audit saw only the portable formatter's two
Node processes; the idle rerun was clean:
`FURN-AUDIT: no FURN desktop processes found`. No W2 desktop campaign was
started. The old and rebuilt helper files both match their recorded SHA-256;
the old binary remains available for the expected-failing consumer run.

## Windows Fabric and Win32 Paper — default-environment buildci — 2026-11-12 UTC

**Observed:** the root `yarn clean-lage-cache` followed by `yarn lage buildci`
passed at `68d63ccfbf008b963e59772f57aca8ac8f9ff05f`: **178 successful
tasks, 0 failed/skipped**, in 2m 32.26s. Both commands ran under the W2 machine
lock without `-RequirePhysical`, with default TEMP and concurrency and no
environment or repository-guidance adjustments.

The first attempt at that same revision failed the Storybook server-integration
child-exit assertion and the inline-worker aggregate's 120s timeout.
Before considering a fix, the same full default-environment gate was run at
pinned base `6489386956c0485cb91b478a8f4adc4828f4178b`: **Passed**, 178/0.
The unchanged W2 rerun then passed. No source fix, timeout increase, dependency
install, or concurrency override was made; baseline failure was not reproduced.

Ignored receipts are under `artifacts/desktop/f10w/review-20261112/`:
`buildci-default.log`, `buildci-default-base.log`,
`buildci-default-rerun.log`, `buildci-default-summary.json`, and
`buildci-default-final-audit.log`. The final audit **Passed**:
`FURN-AUDIT: no FURN desktop processes found`.
No app or native contract was launched. The desktop remained disconnected;
both endpoints' corrected native recovery qualification remains **Not run**
pending an active/unlocked session and a separate grant. No push occurred.
Part of #4447 and #4435.

## Windows Fabric and Win32 Paper — recovery native re-verification — 2026-11-12 UTC

**Observed source:** native implementation
`dbaf558939db31b4a3935ad68b1eb20d25d90d3e`, stacked on pinned #4492
`6489386956c0485cb91b478a8f4adc4828f4178b`. The helper and public host API
were unchanged in this phase. The harness consumer needed a test-only fix:
`recoverApplication` checks native `{ state: 'exited' }` internally and resolves
`Promise<void>`, so the consumer must expect `undefined`. That one-line
assertion correction is committed with this evidence and needs review before
publication; no production, protocol or F11 file changed.

**Observed granted native session:** active/unlocked **remote** session 1,
input desktop `Default`, with eligible before/after checks for every native
wrapper. Both W2 campaigns used the machine lock and `-RequirePhysical`; no
exit 75 or session change occurred. The final consumer wrapper ran
`21:54:54Z–21:57:02Z`. Fabric registration was checked before each phase and
remained the `furn-81` Debug/x64 build at `bdeb0b291`, with no relevant native
source difference and executable SHA-256
`df9cb3559843fcfb0158ee4ab5edbae78890c4e231ebd895cbb636c24b18cd45`.
The exact AUMID remained
`40411fc5-8e92-4d46-b68d-b62df44b1366_syyqehzwccsyy!App`.
REX Paper used the canonical worktree image `0.81.1-6828073195`, exact launch
arguments, a fresh Win32 bundle and owned worktree Metro. A Win32 native-app
build remains **Unsupported**.

**Observed native RED/GREEN:** the retained pre-review helper's source was
`ea76e931dc4cdebc87e0621a7d730f81faabce5ef902063a0512cd7c2b100f2d`,
executable SHA-256
`863cc2dbfc8f5792d22c8606376d226affbf8655fe4ded62ba78c23a29c516c7`.
It produced **4 expected failures / 0 passed / 7 filtered skips** across the
two endpoints' stale-start and crashed-recoverer cases:
`recoverApplication` rejected with `identity-start-mismatch`.

The selected review-fixed consumer helper had source
`3558e8597f6cfe1ee3f4e38dca2137710b80d193a5c30bf946d54065bf8bc153`
and executable SHA-256
`97f0072ce22449bc5c87c05de259d3e4c46eca666e6135977432b30fa16053b2`.
Its first consumer run had **9 passed / 2 failed**, solely because the test
expected the wire object rather than the host's void resolution.
After correcting only that assertion, all **11 consumers passed / 0 failed /
0 skipped**. Native recovery settles a different recorded start without
control/termination access or replacement signals; matching-start
session/executable/AUMID mismatches still fail closed. Unreadable native starts
remain fenced; no real protected-process access-denial case was induced here.

**Exact provider command:** from the driver package, inside the granted
physical-gated machine lock, with `FURN_NATIVE_DRIVER_TEST=1`,
`FURN_NATIVE_PHYSICAL_INPUT_TEST=1`, Debug configuration and worktree-local
scratch/cache. `$W2` denotes the assigned worktree; `$E` is its ignored
`artifacts\desktop\f10w\review-native-20261112` directory.
The direct-helper override is unset for the cache-resolution contract.

```powershell
yarn test --runInBand `
  --cacheDirectory "$W2\artifacts\desktop\f10w\jest-driver" `
  --runTestsByPath src\native\nativeDriver.test.ts src\native\windows\applicationOwnership.contract.test.ts `
  --testNamePattern 'Windows exact application ownership|builds, reuses, resolves, and handshakes with the Windows helper' `
  --json --outputFile "$E\driver-green-results.json"
```

| Provider/self-test case                                                                          | Outcome         |
| ------------------------------------------------------------------------------------------------ | --------------- |
| Build, reuse, resolve, handshake and Windows helper self-test                                    | **Passed**      |
| Noncontrolling inspection and exclusion of another independent helper                            | **Passed**      |
| Reused recorded start settles without signalling the live replacement; other mismatches rejected | **Passed**      |
| Multiple matching process/window candidates rejected                                             | **Passed**      |
| Five contained exact-identity launch/close cycles                                                | **Passed**, 5/5 |
| Independent applications serialize through the physical input mutex                              | **Passed**      |

Final provider result: **6 passed / 0 failed / 10 unrelated filtered skips**.
The first invocation mistakenly set a direct-helper path, so the five ownership
cases passed but the isolated cache test resolved that explicit artifact
instead of its temporary build. Removing the conflicting invocation override,
without changing source, produced the full passing result. Both receipts are
preserved; this was not a resolver fix or an additional production defect.

**Observed real consumer results:** both endpoints passed five distinct
PID/start incarnations, exact independent-service exclusion, native mismatch
refusals, crashed-recoverer barrier retirement, crashed-owner journal
reconciliation and three concurrent pairs. Fabric consistently reported
`uncontained` and exact survivor cleanup; REX reported `job-object` and
reconciled its job drain. The cross-endpoint physical-mutex case passed with
cancellation, release and transfer. All recorded application sessions were
`windows-session:1`. The crash fixtures verified each owned child's native
identity before literal-PID termination; the new dead-recoverer PIDs were
**54440** and **55808**. Live replacements survived stale-record retirement.
The harness's matching section records all 11 cases and exact consumer
commands.

Ignored evidence root: `artifacts\desktop\f10w\review-native-20261112`.
`driver-green-results.json`, `red-consumer-results.json`,
`green-initial-consumer-results.json`, `green-consumer-results.json`,
`green-consumer-evidence.json`, `consumer-assertion-fix.diff` and
`qualification-summary-final.json` retain the failures, corrected results,
digests and actual test-source provenance. Final consumer evidence:
`windows-application-ownership-3BLzLV`; lifecycle report
`32f3d6be-c4b0-4792-aeb6-a5d7df165fc0` has no test counts.

**Observed portable/aggregate closeout:** harness format/lint/build and
**453** portable tests **Passed** (**28** native skips). Existing driver
`NativeDesktopHost.applicationIdentity` contracts **Passed**, **31/31**.
Locked default-environment `yarn clean-lage-cache` then `yarn lage buildci`
initially **Failed** the reported intermittent Storybook `serverIntegration`
readiness assertion, `A stopping command cannot publish readiness`
(`176` successful tasks, one failed). The cause remains unproven.
After the fail-fast test children settled and a clean audit, the sole unchanged
full rerun **Passed**, **178 successful / 0 failed / 0 skipped**, 2m 38.65s.
No TEMP, concurrency, timeout, dependency or guidance workaround was applied.
Both W2 campaigns ended and the final audit **Passed**:
`FURN-AUDIT: no FURN desktop processes found`.

**Publication/remaining limits:** no push or PR-body update occurred because
the test-only correction needs review. Initial PR #4494 CI at `dbaf558939`
was observed green: run `43282149276`, all **19/19** checks successful.
Windows job `131405956387` selected the ownership provider suite
(`PASS applicationOwnership.contract.test.ts`; **4** nonphysical ownership
cases selected, physical case gated off; full driver **1,281 passed /
46 skipped**). The Win32 jobs did not select that ownership step, and the
actual-endpoint consumer opt-in was absent: **0/11** consumers hosted.
These are historical hosted counts, not new CI for the local test correction
or substitutes for this physical campaign. F11 claim naming is deferred and
untouched. Actual kernel PID recycling and shared-PID activation were
**Not induced**; all concurrent winners were distinct. Arbitrary uncontained
descendants and mixed-graph recovery remain unqualified. The existing
`windows-exact-application-ownership.md` patch changeset remains applicable.
Part of #4447 and #4435.

**Observed reference checks:** Markdown links in both edited ledgers
**Passed** (6 driver links, 15 harness links). Root `yarn oxfmt --check`
(3,163 files), `yarn check-agent-instructions`, `yarn change:check`, and
`git diff --check` **Passed**. Their receipts are in the same ignored evidence
directory.

## F15 non-AX macOS supporting evidence — 2026-11-12

Source `505a2187b0a2451aed7081c9260b343d55742f93`; macOS 27.2.1
(26B131), arm64 (`sw_vers`). App: `FurnDesktopDriverHost.app` and
process-identity contract children, not Storybook. Renderer: N/A.
Feasibility was recorded before execution in the machine-local ignored
artifact `artifacts/desktop/f15-20261112/feasibility.md`.

All native commands ran serially through the machine-wide native lock.
From the repository root, the shared environment was:

```sh
export FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="FURN Desktop Driver Development"
export FURN_DESKTOP_DRIVER_CACHE_ROOT="$PWD/artifacts/desktop/f15-20261112/native-cache"
```

| Command / selection                                                                                                                                                          | Passed / failed / skipped                                                                                                     | Cleanup / artifact locator                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver --reporter json build-driver --platform macos`                                                     | Passed build and signature verification; 0 tests selected                                                                     | Build exited; `artifacts/desktop/f15-20261112/helper-build.json` and `helper-build.stderr`         |
| `yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver --reporter json doctor --platform macos --permissions`                                             | Passed diagnostic invocation; 0 tests selected. Accessibility=false, PostEvent=false, ScreenCapture=true; no prompt requested | Diagnostic helper exited; `artifacts/desktop/f15-20261112/doctor.json` and `doctor.stderr`         |
| Signed helper `--self-test`, resolved from `helper-build.json`; exact invocation below                                                                                       | 448 / 0 / 0 checks, including 8 strict-clear refusal/negotiation assertions                                                   | Helper exited; `artifacts/desktop/f15-20261112/signed-self-test.log` and `signed-self-test.stderr` |
| `FURN_NATIVE_DRIVER_TEST=1 yarn workspace @fluentui-react-native/desktop-driver test --runInBand nativeDriver.test applicationIncarnation.contract serviceIdentity.contract` | 27 / 0 / 15 tests; 3 passed suites, 2 platform-skipped suites; default TMPDIR                                                 | Test/helper children exited; `artifacts/desktop/f15-20261112/native-contracts.log`                 |

The stable-signed self-test invocation retained the selected artifact as data,
with a 120-second subprocess timeout:

```sh
python3 -c 'import json,subprocess; from pathlib import Path; root=Path("artifacts/desktop/f15-20261112"); artifact=json.loads((root/"helper-build.json").read_text()); print("helper="+artifact["artifactId"]); result=subprocess.run([artifact["executablePath"],"--self-test"],stdout=(root/"signed-self-test.log").open("w"),stderr=(root/"signed-self-test.stderr").open("w"),timeout=120); print("signed-self-test exit="+str(result.returncode)); raise SystemExit(result.returncode)'
```

Stable helper artifact:
`bdc07c7c4333eeef6cf5da683128591da0564cf978cf813335b5c63494dc7903`;
source digest:
`b1d5233de326faf886c8d6310c2844c6857e4936686dfd493ff898f9e5ec6b9a`.
Its designated requirement was
`identifier "com.microsoft.fluentui-react-native.desktop-driver" and certificate leaf = H"ab592605f8619fcaa952b4a2525ae6d41296fdd7"`.
The doctor reported the same artifact and signing requirement, an unlocked
console session, and `promptRequested=false`. Its `ready=true` describes
artifact availability, not permission readiness.

Strict-clear coverage in this initial pass is limited to four invalid-mechanism
refusals, semantic/keyboard missing-element refusals with no effect, and
probe/hello negotiation. Successful real-element clears, Fabric/Paper
Storybook descriptor lifecycle and smoke, physical input, and Paper MCP
interaction measurements were blocked on Accessibility/PostEvent during that
pass and were not launched or credited as passes. The later permission recheck
below resolves that prerequisite, not the unexecuted acceptance cases.
No privacy settings changed.
Process inspection after the contracts found no surviving test/helper
processes from this worktree. This supporting evidence is **not macOS
requalification**, native positive strict-clear qualification, or a reliability
window; the existing F15 acceptance gaps remain open.

### F15 permission-enabled follow-up — 2026-11-12

**Observed, partial qualification, not macOS requalification.** Product source:
`141b88b4b81a1bd9a0472de533681f9274d8cb00` (main plus this PR's
documentation); macOS 27.2.1 (26B131), arm64. No sibling-branch evidence is
included. The pre-execution feasibility note and ignored machine-local
artifacts are under `artifacts/desktop/f15-20261112T115411Z/`.
The signing identity/cache environment above was reused. Every native,
GUI and physical-input command ran through
`$HOME/Library/Caches/furn-overnight/with-native-lock.sh`;
unit tests retained the default TMPDIR. No privacy settings changed and no
permission prompts were requested.

| Check / exact command from the repository root                                                                                   | Observed result / passed, failed, skipped                                                                                                                                | Artifact beneath the follow-up directory                |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `yarn workspace @fluentui-react-native/desktop-driver exec desktop-driver --reporter json doctor --platform macos --permissions` | Passed diagnostic: Accessibility=true, PostEvent=true, ScreenCapture=true; unlocked, onConsole=true, promptRequested=false; 0 tests                                      | `doctor.json`, `doctor.stderr`                          |
| `FURN_NATIVE_DRIVER_TEST=1 yarn workspace @fluentui-react-native/desktop-driver test --runInBand`                                | Passed: 1,240 / 0 / 47 tests; 75 passed, 6 platform-skipped suites; includes native build/identity contracts and portable fake-host tests                                | `native-tests.log`                                      |
| `node artifacts/desktop/f15-20261112T115411Z/qualify.mjs fabric strict`                                                          | Passed: 3 / 0 / 0 manual checks: real-element keyboard clear/input, semantic clear, protected args refusal                                                               | `fabric-strict-qualification.json`, `fabric-strict.log` |
| `node artifacts/desktop/f15-20261112T115411Z/qualify.mjs paper`                                                                  | Failed: 14 / 4 / 0 manual assertions; includes a dependent semantic-clear precondition failure and unsupported Checkbox activation, not four independent product defects | `paper-qualification.json`, `paper-qualification.log`   |
| `node artifacts/desktop/f15-20261112T115411Z/qualify.mjs paper input`                                                            | Failed overall: 4 / 1 / 0 manual checks; semantic clear, independent physical-input delivery, args refusal and MCP type/check/observe passed; keyboard clear failed      | `paper-input-qualification.json`, `paper-input.log`     |

The doctor resolved the same stable helper artifact and source digest as the
initial pass. **Inferred:** this preflight is authority for the current
responsible process tree (Rex Server.app), not proof of helper-owned durable
TCC continuity.

The real element was Storybook `components-input--default`,
`agentic-storybook-input`. The physical session verified typed text, cleared a
nonempty value to empty with the required keyboard mechanism, then exercised
element-relative pointer down/up, an arrow key and one wheel event.
Its input receipt was `{ keyboard: 4, pointer: 1, wheel: 1 }`.
A subsequent accessible session verified the nonempty value and cleared it to
empty with exactly `{ "semantic-clear": 1 }`, no keyboard fallback.
**Observed:** wheel delivery succeeded; its visual scrolling effect was not
asserted. These are manual real-element checks, not synthetic self-test
assertions. The strict run stopped the exact owning CLI with SIGTERM (exit 0),
then terminated and verified exit of its own app.

Paper's first keyboard clear returned success but changed the verified
synthetic value `F15` to `F1`, not empty. Its next semantic check incorrectly
required the original `F15`, so that assertion failed **before semantic
clear was attempted**. The separate `paper input` probe made the semantic
precondition independent and polled the value after typing and clearing,
without retrying either mutation. **Observed:** keyboard clear still left
two characters after 100 reads separated by 50-ms waits; its receipt was
`{ keyboard: 2 }` for typing and clear. Semantic clear then passed from a
nonempty value to empty with exactly `{ "semantic-clear": 1 }`.
A separate Paper physical session verified text and delivered pointer,
arrow-key and wheel actions with
`{ keyboard: 2, pointer: 1, wheel: 1 }`; visual scrolling was not asserted.
Thus real-element keyboard clear passed on Fabric, not Paper; semantic
clear passed on both. Receipt delivery is not proof of successful clearing.

Fabric descriptor follow-up:
`node artifacts/desktop/f15-20261112T115411Z/qualify.mjs fabric lifecycle`
recorded **10 passed, 1 failed, 0 skipped manual checks**;
`fabric preservation` added **1 passed, 0 failed, 0 skipped**.
The protected descriptor/native helper was real throughout.
CREATE/DELETE response-loss and delayed-open injections wrapped the public
typed client method boundary; they were not TCP fault proxies or forced
native cleanup failures. Grant revocation, terminal drain/reacquisition,
same-port replacement fencing, read cancellation and target-only PNG
resource reads passed. A separate PID/start-time/executable comparison proved
the exact externally attached app survived session and service close.
Artifacts and consumer commands are detailed in the harness ledger's
"F15 permission-enabled consumer follow-up".

The Fabric and Paper full `stories-and-tests` smokes each failed:
**223 passed, 2 failed, 0 skipped**, 225 selected/executed per renderer,
no retries/flaky entries.
The 223 passes were navigation; later authored callbacks remained not run.
This does not invalidate the separate real-input delivery receipts, but it
does leave successful physical control activation unqualified.

#### Open F15 native findings

**Observed, unresolved; no product fixes in this docs-only PR.**

- `packages/agentic/desktop-driver/src/operations/act.ts`, `physicalClick`
  / `obscuredRejection`: through either real renderer's MCP descriptor, select
  `components-checkbox--default`, find `agentic-storybook-checkbox`, then
  `desktop_act` with one `click` step citing its unique ref/sample.
  The sequence returns `stopped` at step 0, `element click intercepted`,
  reason `obscured`, mutation `rejected` / effect `none`, not quarantined.
  The refusal measured 1,187.5 ms, 107 text tokens, 438 UTF-8 bytes in the
  lifecycle follow-up; this is **not a successful click measurement**.
  Evidence: `fabric-lifecycle-qualification.json`, `physical-click` measurement.
  Paper reproduced the same refusal in 1,172.4 ms, 106 tokens, 438 bytes
  (`paper-qualification.json`). Paper semantic `activate` was separately
  **Unsupported** by this element's provider (743.9 ms, 79 tokens,
  329 bytes); that response is not a successful alternative activation.
- `packages/agentic/desktop-driver/native/macos/Sources/DesktopDriverHost/Driver.swift`,
  `clear`, and `Input.swift`, `pressCommandADelete`: reproduce with
  `node artifacts/desktop/f15-20261112T115411Z/qualify.mjs paper input`,
  using the instance-aware Paper app. Create a physical session, select
  `components-input--default`, find `agentic-storybook-input`, type and
  verify `F15`, then clear with required mechanism `keyboard`. The helper
  returns success and records keyboard input, but the value remains
  nonempty through bounded read polling. Accessible semantic clear succeeds
  independently. Evidence: `paper-input-qualification.json`; exact local
  harness `paper-input-harness.mjs`, SHA-256
  `183d2ef5f943c8d384598dc1f5976611f9df72c5bc8481ef83345d39fc0fc278`.
  **Inferred routing:** macOS driver keyboard-clear/focus owner with the
  Paper Input provider owner; the root cause is not established.
- `packages/agentic/desktop-driver/native/macos/Sources/DesktopDriverHost/Driver.swift`
  (activation) and
  `packages/agentic/components/src/components/accordion/accordion.stories.tsx`
  (`KeyboardDisclosure`): reproduce with
  `yarn storybook smoke --macos --mode stories-and-tests --reporter json`
  from `apps/storybook`. Its two keyboard callbacks fail in the initial
  `focusByTab` click: own-window obstruction, then failure to make the target
  foreground. Report:
  `apps/storybook/artifacts/desktop/8e1bfc4a-3037-42af-8d52-47739db9065d/run.json`.
  The matching Paper smoke (`--paper`) reproduced own-window obstruction
  in both callbacks:
  `apps/storybook/artifacts/desktop/9f8bb135-907f-419c-8c23-d543fc201230/run.json`.

**Inferred routing:** macOS desktop-driver hit-testing/geometry and activation
owners, with the Accordion story/focus-test owner for the callback
reproduction. Whether the cause is provider geometry, app state or an
environmental foreground transition is not established; no root cause or
component defect is asserted. The coordinator should route these open
findings under #4441/#4435. Semantic activation must not replace the missing
physical-click evidence.

#### F15 remaining acceptance and cleanup

**Not run on this source:** forced native failed-cleanup claim retention;
startup/shutdown survivor and channel/helper/Metro crash reconciliation;
unknown-effect story quarantine/trusted recovery; post-dispatch mutation
cancellation; correlated readiness/render faults; lost-context fresh-preview
fencing and authenticated app-relaunch recovery; registered secondary
windows; anonymous/foreign HTTP/WebSocket protected ingress; launch-capable
discovery and explicit legacy-lane separation. Read cancellation and normal
shutdown are narrower than these cases. Fabric's idle-channel interval was
not measured in this follow-up; Paper passed a single 22-second interval.
The reliability window, durable TCC continuity, and clients beyond the MCP
SDK are **Not run**; Windows and Win32 are **Not run** on this host.
Failed smokes, successful Checkbox/Accordion physical activation, remaining
authored callbacks and Paper keyboard clear remain unqualified. Permissions
are no longer the blocker. This does not meet #4441's macOS acceptance.

**Observed cleanup, passed:** the isolated
`node artifacts/desktop/f15-20261112T115411Z/audit-cleanup.mjs` command,
under the native lock, found no worktree processes or listeners on
39860/23935/28029, no default descriptor and no per-user workload claim at
2026-11-12T12:20:26Z (`cleanup-audit.json`). Every launched app had been
terminated after exact-incarnation verification. The wrapper exited 0;
subsequent `lsof` found no holder of the machine-wide `native.lock`.

## F11 scoped runner handoff — 2026-11-12

Source `5c9d0191e` implements the reviewed generic attach-only phase: attenuated
runner/controller grants, bounded busy by default, operator-authorized
preemption, and target reservation only after in-flight acquisition,
session deletion, and controller-subtree drain settle. Revocation callbacks
alone are not a drain barrier. Failed cleanup remains fenced and retryable;
unknown runner input is rejected before granting or reserving authority.
Settled drains restore the 4096 live/draining grant capacity; only the last
4096 settled cleanup proofs are retained, never pending or failed proof.
Busy/failed attempts issue no runner grant, and shared descriptor/workload
holders require relinquish instead of subtree preemption. Retired requests
still check live authority after asynchronous target probes.
Driver package format, lint, build, and tests passed (1,233 passed,
66 skipped). The default-`TMPDIR` focused authority/delegation/handoff selection
passed 51 cases, including 4,101 drained delegation cycles under one live parent.

Native selection at `87bc8b710` on macOS 27.2.1 arm64 passed 27 identity
and backend cases, with 15 Windows cases skipped. The stable-signed helper
doctor was ready but reported Accessibility/PostEvent `false`. The real
private-descriptor AppKit consumer then failed session creation with no
supported click input mode. Native handoff and worker-crash drain remain
unqualified; no permissions were changed. Cleanup preserved the externally
owned fixture through service shutdown, removed both descriptors and
released the claim before its spawning test ended that exact process.
The Accessibility-blocked native contract was not repeated for review fixes.

Exact commands, helper/fixture revisions, the initial stale-fixture failure,
one corrected-fixture retry, cleanup evidence and artifact locators are in
`@fluentui-react-native/desktop-test/references/current-status.md`.
Windows/Win32 native handoff is not selected by existing PR smoke/E2E jobs
and remains not run. Storybook integration, retained launches, and
cross-connection resume/replay are not implemented by this phase.

## Windows Fabric and Win32 Paper — F11 handoff qualification — 2026-11-12 UTC

**Observed:** source `c9753208d0f5602d28510d84ededf3f2fc3c3855`,
Windows x64, active/unlocked RDP (`sessionKind: remote`). Every native command
ran inside the W1 campaign through `with-native-lock.ps1 -Lane W1`; native
contracts and live endpoint runs used `-RequirePhysical`. Both session gates
remained eligible. No physical input was delivered by the handoff probes;
these results are not physical-input qualification.

From this package, with `FURN_NATIVE_DRIVER_TEST=1`:

```powershell
yarn test --runInBand serviceIdentity.contract applicationIncarnation.contract nativeDriver --json --outputFile <worktree>\artifacts\desktop\f11\w1\native-contracts.json
yarn test --runInBand protectedService.contract --json --outputFile <worktree>\artifacts\desktop\f11\w1\protected-service.json
```

The first selection **passed 23, skipped 19, failed zero**. All 15 Windows
cases skipped in the earlier macOS selection executed and passed here:

| Windows case                                                              | Result |
| ------------------------------------------------------------------------- | ------ |
| Service identity: describes the publishing supervisor process             | Passed |
| Service identity: refuses nonexistent/exited/foreign-principal processes  | Passed |
| Service identity: verifies only the process owning the loopback listener  | Passed |
| Service identity: refuses changed start time, image or session            | Passed |
| Service identity: compares executable paths case-insensitively            | Passed |
| Service identity: refuses an unserved address                             | Passed |
| Service identity: refuses an exited process                               | Passed |
| Service identity: refuses `http://localhost:49152`                        | Passed |
| Service identity: refuses `http://192.0.2.1:49152`                        | Passed |
| Service identity: refuses `https://127.0.0.1:49152`                       | Passed |
| Service identity: refuses `http://127.0.0.1`                              | Passed |
| Service identity: refuses `http://127.0.0.1:49152/status`                 | Passed |
| Service identity: keeps IPv6 and IPv4 listeners apart                     | Passed |
| Application incarnation: proves exact-process exit, not a weaker identity | Passed |
| Native driver: builds/reuses/resolves/handshakes the Windows helper       | Passed |

The other eight passing cases are portable native-driver source/build-policy
checks. All 19 skips are macOS-only: 16 service-identity cases, one
application-incarnation case and two helper-build/signing cases. They are
**skipped**, not Windows passes. Every exact test title, source file, outcome,
skip reason and mapping to the 15 earlier skips is retained in
`artifacts\desktop\f11\w1\case-mapping.json`; the raw Jest results and
`native-contracts.log` are alongside it.

`protectedService.contract` was included because it exercises changed
session-owner admission, busy, revocation and drain paths with a real helper.
Three cases **passed**: grant/owner isolation, revoked-owner handoff, and
quarantine retention without exit proof. The recovering-quarantine case
**failed before its assertions, environment-blocked**: the project-local
scratch directory's ancestry is refused by Windows private storage
(`reason: ancestor`). A native diagnostic reproduced that refusal and opened
the default private store successfully (`storage-probe.json`). No ACL was
changed. Both the Node storage adapter and native storage implementation are
unchanged from this branch's main base. **Inferred:** this is storage
placement, not an F11 regression. Recovery in that additional contract remains
unqualified by this run. Other native fixture suites were not repeated:
F11 changes no native protocol/provider code, and live RN endpoints below
exercise the changed generic handoff.

**Observed, live native:** Windows Fabric packaged Storybook and Win32 Paper
REX each passed default busy, explicit MCP relinquish, operator preemption,
normal worker drain, killed-worker drain, and real lost-acquisition-response
drain. A fresh MCP session succeeded after each runner; stale references,
observation cursors and captured-resource links were rejected. Preemption
invalidated the old binding (`service-unavailable` at the MCP adapter), kept
MCP busy while the runner held the reservation, then allowed a fresh child.

| Endpoint       | Local evidence root                       | Terminal runner runs: normal / preempt / crash                                                                                                            |
| -------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows Fabric | `artifacts\desktop\f11\w1\windows-3tYoml` | `a3bf02e2-df22-4a63-92f8-686057ef2a80` passed / `24d38403-b4e5-49d6-9e0f-d1d123e4fb17` passed / `8f702133-e18a-41f0-b05d-ce5fcb5cff1a` failed as injected |
| Win32 Paper    | `artifacts\desktop\f11\w1\win32-BefbqE`   | `d79fd672-df2d-4943-8b40-c017a8978380` passed / `f1f17781-08aa-4cac-a6d8-34cb13bd749b` passed / `a09a8c20-1380-4933-a7a3-9c2d786352c3` failed as injected |

The retained reproduction is `node artifacts\desktop\f11\w1\qualify.cjs
windows` or `... win32`, from the worktree root under the W1 physical/session
lock. It composes the real `DesktopSupervisor`, verified native descriptors,
MCP SDK/server and WDIO/Jasmine, mirroring the macOS fixture procedure rather
than using the unsupported Storybook handoff. Apps are externally launched
through the public native host with exact AUMID/REX identity. Windows Metro
uses the app's declared `yarn start --no-interactive --port 8081`, from this
worktree; Win32 uses `yarn storybook bundle --win32`. The registered Fabric
build at `bdeb0b291` was reused: the requested native-source diff contains only
native-core changelog/version metadata, no Windows native source changes.

Helper artifact: `d8ee05e4796fb3aa22f7b5dbf481bd8cdfb0c20b6d5d24676d689dc7900d5b3c`.
Both external applications remained the same running process incarnation
through service shutdown; only their exact recorded launcher then closed them.
Both descriptors and workload claims were removed. All `run.json` files are
terminal, including the deliberately failed crash runs (one selected,
zero completed, one incomplete; cleanup succeeded). The service lifecycle
runs passed. A scan of 45 retained text/config/report files found no bearer
credential. Final audit: `FURN-AUDIT: no FURN desktop processes found`;
campaign ended.

**Observed, portable:** uncached `yarn workspace
@fluentui-react-native/desktop-driver test --runInBand` passed 1,211, skipped
88, failed zero with native opt-ins unset. `yarn build` passed. Windows
`yarn desktop-driver doctor --platform windows` and `--platform win32`
each **passed** with `ready: true`; adding `--permissions` is **unsupported**
(exit 1), not a permission pass.
The existing three-package `scoped-runner-handoff` patch changeset is retained.

**Remaining automation gap:** desktop-test's `nativeRunner.contract` is
darwin-gated and its fixture uses `Contents/MacOS/fixture`; Windows execution
selects one skipped case even with the native opt-in. The CI native-driver
step runs driver contracts, not this generic MCP/WDIO consumer. A Windows
fixture path and explicit consumer selection are proposed to the coordinator;
no test/source or CI code was changed by this qualification lane.

**Evidence validation:** `yarn markdown-link-check -c
.github\markdown-link-check-config.json
packages\agentic\desktop-driver\references\current-status.md` passed
(six links). Root `yarn oxfmt --check`, `yarn change:check` and
`git diff --check` passed. No clean-cache `buildci` rerun was required for
these evidence-only markdown edits.

## Windows hosted native-runner fixture provisioning — 2026-11-12 UTC

**Observed:** hosted PR run `43279226602` at branch source
`23f974a727ca2627690304cbecee0fa96cb6de83` failed before the selected native
MCP/WDIO consumer in Windows Storybook job `131395742955` and Win32
accessible Storybook job `131395742289`. Both helpers passed `doctor`; the
Windows job additionally passed 1,254 driver tests with 45 capability/platform
skips. These are not nativeRunner passes: its ownership modes and accessibility
input were **Not run** in both jobs.

The fixture provisioner's built ESM import failed with `ERR_MODULE_NOT_FOUND`
for its extensionless `NativeDesktopHost` dependency. The test-only source also
used CommonJS `__dirname`. The repair uses `.js` specifiers and the existing
package-root anchor, preserving the fixture source directory for both Jest and
built Node consumers. The C++ fixture, helper protocol, cache policy and native
entrypoints are unchanged.

**Observed, portable:** tested repair source
`0e2dcb26ca156133cb577fc81869b23cebf1df3a`. From this package,
`yarn test nativeDriver -t 'loads Windows fixture provisioning from built ESM'
--runInBand` was **Failed as expected** before the repair with the exact hosted
import error, then **Passed** after building the correction. It imports the
actual built module in an ordinary Node subprocess, without Jest's resolver,
native compilation or application launch.

`yarn format`, `yarn lint`, `yarn build` and `yarn test --runInBand` all
**Passed**; the complete portable driver suite passed 1,212 and skipped 88.
The root `yarn clean-lage-cache && yarn lage buildci`, serialized through
`with-native-lock.ps1 -Lane W1`, **Passed** with inherited temporary-directory
settings and default concurrency: 178 successful tasks, zero cache hits or
failures, 2m 52.86s. No native opt-in or physical-session requirement was used.
The first post-run audit reported another lane's portable Yarn cache-clean
process, not a process owned by this repair; it was not terminated.

Receipts, exact commands, job logs and doctor artifacts are retained under
`artifacts\desktop\f11\w1-fix\push-ci`. Hosted requalification of the repaired
provisioner is **Not run** at this receipt. Local nativeRunner and physical
console Ctrl+C remain **Not run** because the desktop session is disconnected
and no desktop campaign is granted. Portable loading is not native evidence.

## Windows native fixture consumers and console cleanup — 2026-11-12 UTC

**Observed at `b1bbb26df880252a184ea5a3d2e1848bd811e83f`:** explicit
`yarn desktop-driver build-driver --platform windows` and
`yarn desktop-driver doctor --platform windows` **Passed**, the latter
with `ready: true`. Built ESM fixture provisioning succeeded without Jest.
The C++ fixture and provider/protocol sources are unchanged; verified helper
artifact `d8ee05e4796fb3aa22f7b5dbf481bd8cdfb0c20b6d5d24676d689dc7900d5b3c`
was used.

With `FURN_NATIVE_DRIVER_TEST=1`, the locked root command
`yarn workspace @fluentui-react-native/desktop-driver test
serviceIdentity.contract applicationIncarnation.contract nativeDriver
--runInBand --json --outputFile
<repository-root>\artifacts\desktop\f11\w1-native\native-driver-jest.json` **Passed**:
24 tests passed, zero failed, 19 macOS-only cases skipped. This mixed
selection includes the new ordinary-Node ESM import regression as well as
the Windows native identity/backend contracts. No skip is a native pass.

The newly enabled Windows desktop-test consumer also **Passed** all five
outer modes against the plain Win32 fixture: handoff, operator preemption,
worker-crash recovery, lost successful runner-grant response and capture.
The four non-crash modes each executed two inner specs, including native
accessibility input, with zero skips. Crash recovery intentionally produced
a terminal failed WDIO run before reuse. Every mode confirmed native deletion,
descriptor withdrawal and workload-claim release while preserving the
external fixture; only the scenario's own launcher then ended it.
This qualifies generic native transport/ownership, not React Native rendering
or Storybook runner handoff.

Separately, physical console Ctrl+C **Passed** for real Storybook
`desktop-test serve --agent` on both renderers in an active unlocked RDP
session (`sessionKind: remote`). Exact-console foreground/isolation checks
preceded four real `SendInput` keyboard events; the observer received console
`SIGINT`, and no semantic signal generation was used. Both apps had completed
authenticated Button story/native-marker and MCP observation checks; the
MCP session was closed before interrupting the long-lived service.

| Endpoint                    | Terminal passed lifecycle              | CLI / Yarn / observer exit |
| --------------------------- | -------------------------------------- | -------------------------- |
| Windows Fabric packaged app | `75c40800-571c-4d8f-9fa1-debf876f0664` | 0 / 0 / 0                  |
| Win32 Paper REX             | `9a5c618f-d54d-4599-b36f-e3fd5b5436b9` | 0 / 0 / 0                  |

The service withdrew its descriptor, released its claim and preserved the
same running app incarnation. Its recorded external launcher then closed
that app. Metro, channel and helper cleanup completed without survivors.
Fabric reused the verified registered `bdeb0b291` native build because its
Windows native sources are unchanged; the app config was inherited with an
explicit verified AUMID/title, not a title-only target. Paper used the prebuilt
REX host and a fresh bundle carrying the serving instance/manifest identity;
a Paper native build remains **Unsupported**.

All live commands used the granted W1 campaign and
`with-native-lock.ps1 -Lane W1 -RequirePhysical`. Exact reproduction,
session/lock receipts, native identities, run IDs and per-mode results are in
`artifacts\desktop\f11\w1-native`; physical roots are
`physical-windows-UmfSj6` and `physical-win32-sssEyg`.
The owning harness reference
`packages/agentic/desktop-test/references/current-status.md` records its
commands and the historical Ctrl+C regression proof separately.

Workflow `43284867711` reached the Windows native consumer in jobs
`131415841258` and `131415842551` after the built-import correction.
Both ran three successful ownership modes, including two accessibility specs,
but their lost-response case failed on an exact-message assertion before
WDIO. Source `b1bbb26d` repairs that test composition in desktop-test and
passes it natively; it does not change the client's legitimate transport-error
wrapping. Corrected-head hosted coverage is pending publication here.

The campaign is ended. Broad audit exit 2 names only four foreign portable
W5 Jest/Yarn processes with no listeners; zero W1 native/GUI processes remain,
and no foreign process was stopped. Native helper builds, JavaScript-only
checks and capability skips are not substituted for the live results above.

**Portable closeout:** three fresh locked default-environment
`cmd.exe /d /c "yarn clean-lage-cache && yarn lage buildci"` attempts
**Failed**, each only on the unchanged Storybook integration test
`hosts the Storybook channel and Stage 1 smoke-test target in one process`
with `A stopping command cannot publish readiness.`. The test and readiness
source match main and review base `04d8d8b13`; no unrelated source,
timeout, TEMP/Git-ceiling or concurrency workaround was added. The owning
package's full default-concurrency `yarn workspace
@fluentui-react-native/storybook-desktop test` **Passed** 340 with three
skips. This is not a passing aggregate receipt for the current source.
Details and the unchanged-source object IDs are in the harness ledger and
`artifacts\desktop\f11\w1-native\aggregate-readiness-source-comparison.json`.
The final attempt began with a clean audit; the failure is not attributed
to foreign work. Owned fail-fast portable workers exited naturally; the
foreign owner removed its abandoned processes. Final audit **Passed**:
`FURN-AUDIT: no FURN desktop processes found`. Ledger format, instruction
and link checks passed.

## Windows default-aggregate follow-up — 2026-11-12 UTC

**Observed at `2bf750f9e`:** final locked default
`cmd.exe /d /c "yarn clean-lage-cache && yarn lage buildci"` **Passed**
178 tasks, zero failed, at 20:52:21–20:55:29 UTC. No source, deadline,
TEMP/Git-ceiling or concurrency change was made. A detached main baseline
first failed the driver cancellation/reuse test (`unique` expected,
`inconclusive` received); its unchanged default repeat passed all 178.
That different failure does not reproduce the earlier Storybook readiness
error. Exact causality of that error remains unproven.

Native-store inspection found no live descriptors/claims. Only the two
campaign-owned bridge epochs were compare-and-removed at 20:46:53 UTC,
after exact recorded application/start-time matching and verified exit
proof; eleven unrelated recovery records were retained. No process,
registered app, firewall or loopback setting was changed. The scratch
worktree was removed, and final broad process audit **Passed**, no
FURN processes found. The owning harness receipt in
`packages/agentic/desktop-test/references/current-status.md` records state
locations/timestamps, both baseline results, the head receipt and the
inference boundary.

Corrected-source hosted workflow `43297198219` also **Passed**, zero
failed jobs. Windows `131458546719` and Win32 accessible `131458546805`
each proved four ownership cases passed / one capture-policy skip /
zero failures; handoff, preemption and lost-response each executed both
inner specs with `accessibilityClick: passed`. Those hosted results and
the preceding physical campaign remain distinct from this portable
aggregate follow-up.

## F11 rebased macOS positive qualification — 2026-11-12 UTC

**Observed at `5dbadb53b10cd81ccf1e15739e213f0046d93323`:** the original
`11820d6330f4ea591bed400193b13e793970b5bd` branch was rebased onto F6/main
`041ac8b9894aeaa7e1aa273baa2ece4e46298b94`, preserving every Windows addition
and both provenance/handoff ledgers. No runtime/native-provider fix was needed.

Under the shared native lock, stable-signed noninteractive doctor reported
Accessibility, PostEvent and ScreenCapture **true**, no prompt, connected
unlocked console. The actual AppKit private-descriptor MCP/WDIO contract
**passed all five modes, zero skips**: handoff, operator preemption, worker
crash, lost successful grant response, and target capture. All four non-crash
modes executed/passed both inner ownership/accessibility-input specs without
skips. The deliberately failed crash worker was drain-confirmed before reuse.
Every mode preserved its exact external fixture through service shutdown,
withdrew both descriptors, released its claim, then ended only its own fixture.
The earlier macOS permission block is historical.

The locked native `serviceIdentity.contract applicationIncarnation.contract
nativeDriver --runInBand` selection passed **28 / 15 Windows skips** (including
the portable built-ESM regression). Portable full driver tests passed
**1,235 / 66 skips**; format, lint and build passed. Exact commands, immutable
helper/fixture identities, per-mode run IDs, cleanup and evidence locators are
in `packages/agentic/desktop-test/references/current-status.md`, under
"F11 rebased macOS positive qualification — 2026-11-12 UTC".
This qualifies generic attach-only handoff, not RN rendering, Storybook/F9,
F10 retained launches, physical input or replay. Windows evidence above is
preserved historical evidence, not a rerun of the rewritten source.
Plain locked aggregate acceptance remains **failed**: the unchanged main
`boundedCommand.test.ts` expected `SIGKILL`, received `SIGTERM` on both
post-documentation-correction attempts. The first also timed out in private
storage; that passed on repeat. Focused diagnostics passed 73 / 10 skips,
but do not replace aggregate acceptance. No environment/concurrency or
unrelated source workaround was used; see the harness receipt for every result.
