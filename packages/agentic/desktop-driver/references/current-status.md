---
id: desktop-driver.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Current capability and qualification status

**Work in progress, updated 2026-11-06.** "Done" below means the stated
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
| Named accessibility actions                                | Done in agent operations               | WDIO can list actions but has no corresponding named-action invocation command.                                                                                                                                                                                                                                                                                                                                                                                 |
| Story catalog/select/reset                                 | Done, experimental integration         | Local lifetime/signal context, authenticated epochs persisted per native-verified app incarnation, versioned marker conformance, prompt disconnect failure, and stale preview rejection. Bounded macOS Paper/Fabric marker and stale-reference checks passed at `6fca14788`; native cancellation/fault injection remain unqualified. Unknown navigation effects still quarantine.                                                                               |
| Story args on protected driver                             | Intentionally unsupported              | `story-args-unsupported`, including the session-owning grant and controlled orchestrator. HTTP and foreign WebSocket args are refused/not relayed without logging values; legacy unprotected args remain separate.                                                                                                                                                                                                                                              |
| Exclusive Storybook control                                | Work in progress: native qualification | Deterministic endpoint evidence: controlled HTTP mutations return 403; foreign WS selection/prepare/args never reach the runtime; authenticated driver prepare/select uses F4 settlement and fencing. Non-agent channel remains legacy unprotected. Native endpoint evidence not yet run: macOS Paper/Fabric, Windows Fabric/Win32 Paper. Preview context checks preserve chrome/secondary references.                                                          |
| Supervisor crash containment and automatic reclaim         | Work in progress outside driver        | Exact ownership ledger, surviving-resource reconciliation, and lifelines belong to desktop-test.                                                                                                                                                                                                                                                                                                                                                                |
| Application-exit/reconnect continuity                      | Work in progress                       | Bounded macOS Paper/Fabric full-service restart checks passed at `6fca14788`: private authenticated-epoch record plus exact live-incarnation proof yields renderer-specific relaunch-required, effect none. Initial absence and exited/replaced apps stay bridge-unavailable; failed/unknown probes are contract-tested only. No transparent restoration or quarantine recovery; inspected RN Storybook 10.5.4 / Storybook 10.6.3 transport does not reconnect. |
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
