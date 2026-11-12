---
id: storybook-desktop.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Current qualification evidence

## 2026-11-12: refresh-reduction timing baseline

Part of #4435. This section records bounded measurements, not a reliability
claim or a full-catalog test pass. The product baseline is the instrumented
parent of the navigation optimization, stacked on PR #4490
(`aadc2f3591d15f5d43496d7f069fa8d0d32d5384`).

### Method and coverage

The public `DesktopStorybookCli` API ran eight independently launched macOS
Fabric lifecycles in the accessible lane. An injected fetch narrowed only the
CLI's traversal index to the real
`components-listboxitem--native-selection` entry; the server's authenticated
manifest, runtime, native helper, and authored callbacks were unchanged.
Every lifecycle traversed that story, ran its three supported callbacks in
declaration order, and reported its one declared macOS-unsupported callback.
App, channel, helper, and Metro cleanup completed before the next lifecycle.
This deliberately bounded index is **not** complete smoke traversal.

The measurements below are from the executable-story `run.json`, excluding
application/service startup and traversal. Millisecond p50 is the median; p95
uses inclusive linear interpolation. Phase samples are 24 executed callbacks;
runner-total samples are eight lifecycles. Navigation subphases overlap and
must not be added together. The first lifecycle can include cold caches.

| Fabric baseline phase        |  p50 ms |  p95 ms |
| ---------------------------- | ------: | ------: |
| Session attach               | 1192.22 | 1612.56 |
| Manifest                     |    2.62 |    3.37 |
| Input policy                 |    0.01 |    0.04 |
| Preparation                  |    0.13 |    0.17 |
| Upstream HTTP                |  503.23 |  504.56 |
| Correlated runtime readiness |   28.77 |  562.62 |
| Native marker verification   |   75.07 |  168.00 |
| Complete navigation          |  753.13 |  812.97 |
| Worker startup               |  203.00 |  215.85 |
| Worker body                  |  505.18 |  533.74 |
| Settled worker               |  723.34 |  750.74 |
| Receipts                     |    2.62 |    2.93 |
| Session cleanup              |  115.24 |  126.77 |
| Diagnostic native reads      |   13.33 |   18.08 |

Runner-total p50/p95 were **7939.07 / 8845.37 ms**; aggregate duration was
**63950.71 ms**. Sample variance was **306828.83 ms²** (range
7478.77–9245.48 ms). Complete lifecycle p50/p95, including startup and
traversal, were 19887.17 / 28433.88 ms, with 171994.83 ms aggregate and
19950017.41 ms² sample variance. These different totals are not interchangeable.

### Lifecycle and observation limits

Each lifecycle had one verified PID/start-time pair, one authenticated bridge
connection, and one accepted hello. Each callback selected a fresh generation
(2, 3, 4 after the traversal's first generation), with matching keyed-mount and
context generations. No within-lifecycle application replacement or new bridge
connection was observed. JS initialization/HMR is explicitly **not observed**:
neither a hello nor the absence of a new socket proves a JS initialization count.
The keyed generation is not an instrumented React effect-mount counter.

Native activity reports retained fixed counters only. No activation command,
provider activation, application activation/deactivation, or main/focused-window
change was observed in this observational cohort. `AXUIElementDestroyed`
notifications can describe preview elements, not necessarily closed windows.
The bounded native event ring can be truncated, and its observations are
advisory. These counters do not establish whether a user saw a flash.

Target-window-only ScreenCaptureKit recordings remain local in ignored
consumer artifacts. They are separate evidence, not committed media.
Paired candidate/renderer evidence and visual analysis must be recorded before
claiming a speedup or flash reduction.

### Gates

Session attachment is a material, dominant cost in this cohort; the conditional
session/worker investigation gate is eligible. No session reuse, worker
sharing, worker-isolation flag, preview reuse, or runtime protocol expansion is
implemented by the timing work. Such a trial still needs independently paired
benefit and ownership/settlement evidence. Windows Fabric and Win32 Paper:
**not run locally**.
