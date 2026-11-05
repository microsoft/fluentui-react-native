---
id: desktop-driver.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Current capability and qualification status

**Work in progress, updated 2026-11-05.** "Done" below means the stated
implementation exists, not that every native endpoint is qualified or that the
complete orchestration product is ready for submission. Historical measurements
remain tied to their original revision; they were not rerun by this update.
See [architecture](architecture.md) for boundaries and
[remaining work](remaining-work.md) for open delivery gates.

## Capabilities

| Capability                                                 | State                                    | Boundary or remaining work                                                                                                                                                |
| ---------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W3C service and typed/WDIO clients                         | Done                                     | Registered targets only; native browser-inapplicable commands explicitly unsupported.                                                                                     |
| Application-neutral driver                                 | Done                                     | No Storybook, React, or React Native dependency. Optional story provider is injected.                                                                                     |
| Native sessions and command/input queues                   | Done                                     | One reservation per registered target in one service. Cross-service exact-application claims remain work in progress.                                                     |
| Verified private discovery and grants                      | Done                                     | Native identity verified before credential transmission; all protected driver routes authenticate. Does not protect the separate Storybook channel.                       |
| Mutation effects, settlement, quarantine                   | Done                                     | Native mutations settle before advancing. Uncertain story changes now quarantine instead of assuming a later render is safe.                                              |
| Durable settlement storage and trusted recovery API        | Done in library; integration in progress | Requires explicit `recovery` options. Shipped generic/Storybook supervisors do not yet wire them; restart can erase uncertainty. Do not use restart as recovery evidence. |
| Bounded observation, references, paging, deltas            | Done                                     | Provider capability/budget checks, explicit completeness and truncation. Reference generation is session-local; reopen after application replacement.                     |
| Find, action, check, sequence                              | Done                                     | Up to eight sequence steps; request-id outcomes prevent replay within their retained session history. No replay across service replacement.                               |
| Capture and artifact pages                                 | Done                                     | Session-bound bounded artifacts and hashes; pixels are opt-in. Screenshots are evidence, not visual comparison.                                                           |
| Named accessibility actions                                | Done in agent operations                 | WDIO can list actions but has no corresponding named-action invocation command.                                                                                           |
| Story catalog/select/reset                                 | Done, experimental integration           | Catalog-only IDs, correlated readiness and marker verification. Delayed/unknown failures fence mutations.                                                                 |
| Story args on protected driver                             | Intentionally unsupported                | `story-args-unsupported`; legacy unprotected args remain separate.                                                                                                        |
| Exclusive Storybook control                                | Work in progress                         | Channel selection/prepare ingress can bypass driver authority; out-of-band args/context invalidation is incomplete.                                                       |
| Supervisor crash containment and automatic reclaim         | Work in progress outside driver          | Exact ownership ledger, surviving-resource reconciliation, and lifelines belong to desktop-test.                                                                          |
| Application-exit/reconnect continuity                      | Work in progress                         | No transparent app/session or runtime bridge restoration. Events are advisory, not proof of recovery.                                                                     |
| Recording/replay export, event-tail API, visual comparison | Work in progress/deferred                | No agent-session-to-WDIO export; window-events still returns its full bounded ring.                                                                                       |
| Intel macOS and distributed/remote control                 | Unsupported                              | Current macOS helper is arm64; service is loopback-only.                                                                                                                  |

The approved direction is a stronger `desktop-test` workload host, with native
authority here and MCP as a client. No coordinator package or daemon is being
added. Management/run schemas stay in the harness, not this package.

## Native evidence and full-submission gates

| Lane                           | Recorded evidence through 2026-11-04                                                                                      | Still required before full submission                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| macOS Fabric                   | M3 real-app observation and MCP story path at `41fc7473f`; helper self-tests and historical Calculator operation evidence | Requalify changed story settlement/lifetime behavior live; runtime reconnect, supervisor crash/cleanup, generic AppKit fixture, complete reliability window. |
| macOS Paper                    | Hosted build/smoke evidence exists                                                                                        | Separate live agent/lifetime qualification; do not infer it from Fabric or hosted smoke.                                                                     |
| Windows Fabric                 | M3 real-app observation and story MCP path recorded at `600235c35`                                                        | Same-branch lifetime/restart and failure gates; 200%/mixed DPI, minimized/negative-origin windows, live lock/RDP/elevation, popups, capture cancellation.    |
| Win32 Paper                    | M3/agent path recorded; native fixture physical input/capture at 100% and 150%                                            | Interactive rerun of current native contracts; physical Ctrl+C, mixed DPI and failure paths. Hosted input/capture skips are not passes.                      |
| Generic native applications    | macOS Calculator and plain Win32 fixture evidence recorded                                                                | AppKit fixture and integrated ownership/recovery parity; a probe is not a real-app lifecycle qualification.                                                  |
| This update's portable changes | Deterministic fake-host MCP, authority, and story regression coverage                                                     | CI and matching-OS live evidence are distinct. No new native source change or live Windows qualification is claimed.                                         |

Hosted Windows policy disables physical input and can reject capture with
`0x80070057`. Capability-gated skips must stay explicit. `activate` succeeding
does not qualify a refused physical click. Each new lifecycle/native change
needs its own endpoint evidence; a final aggregate matrix is not a substitute.

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
