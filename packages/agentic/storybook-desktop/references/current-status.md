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

The public `DesktopStorybookCli` API ran eight independently launched
lifecycles per macOS renderer in the accessible lane. An injected fetch
narrowed only the CLI's traversal index to the real
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

| Baseline phase               | Fabric p50 ms | Fabric p95 ms | Paper p50 ms | Paper p95 ms |
| ---------------------------- | ------------: | ------------: | -----------: | -----------: |
| Session attach               |       1192.22 |       1612.56 |      1094.93 |      1609.26 |
| Manifest                     |          2.62 |          3.37 |         2.60 |         3.14 |
| Input policy                 |          0.01 |          0.04 |         0.01 |         0.04 |
| Preparation                  |          0.13 |          0.17 |         0.13 |         0.24 |
| Upstream HTTP                |        503.23 |        504.56 |       503.08 |       503.95 |
| Correlated runtime readiness |         28.77 |        562.62 |        25.86 |       458.94 |
| Native marker verification   |         75.07 |        168.00 |        97.40 |       170.07 |
| Complete navigation          |        753.13 |        812.97 |       756.77 |       792.62 |
| Worker startup               |        203.00 |        215.85 |       196.50 |       207.40 |
| Worker body                  |        505.18 |        533.74 |       523.32 |       556.19 |
| Settled worker               |        723.34 |        750.74 |       736.00 |       789.32 |
| Receipts                     |          2.62 |          2.93 |         2.46 |         2.76 |
| Session cleanup              |        115.24 |        126.77 |       108.93 |       115.69 |
| Diagnostic native reads      |         13.33 |         18.08 |         6.79 |         9.11 |

Runner-total p50/p95 were **7939.07 / 8845.37 ms**; aggregate duration was
**63950.71 ms**. Sample variance was **306828.83 ms²** (range
7478.77–9245.48 ms). Complete lifecycle p50/p95, including startup and
traversal, were 19887.17 / 28433.88 ms, with 171994.83 ms aggregate and
19950017.41 ms² sample variance. These different totals are not interchangeable.

Paper runner-total p50/p95 were **7915.99 / 8755.09 ms**, aggregate
**60909.13 ms**, sample variance **2199477.39 ms²**, and range
4123.59–8794.34 ms. Complete lifecycle p50/p95 were 19928.62 / 62342.92 ms,
aggregate 224024.71 ms, and variance 529506165.46 ms². The first Paper
lifecycle totaled 84945.44 ms including cold startup, but had an unusually
short runner
(4123.59 ms); both remain included. The first Fabric baseline also had
recording/cold-cache overhead. No startup or reliability improvement is
attributed to those differences.

### Lifecycle and observation limits

Each lifecycle had one verified PID/start-time pair and one authenticated bridge
connection. Fabric accepted one hello per baseline lifecycle; Paper accepted
two on the same connection. Each callback selected a fresh generation
(2, 3, 4 after the traversal's first generation), with matching keyed-mount and
context generations. No within-lifecycle application replacement or new bridge
connection was observed. JS initialization/HMR is explicitly **not observed**:
neither a hello nor the absence of a new socket proves a JS initialization count.
The keyed generation is not an instrumented React effect-mount counter.

Native activity reports retained fixed counters only. No activation command,
provider activation, application activation, or main/focused-window change
was observed in these baseline cohorts; Paper recorded one application
deactivation. Sixteen of 24 callback event samples per renderer carried a
truncation warning. `AXUIElementDestroyed`
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

## 2026-11-12: direct-selection candidate

Part of #4435. Candidate implementation: `06446c276`; instrumentation:
`f0feebc90`. The driver-owned channel factory now uses authenticated direct
selection without an upstream HTTP mutation. Controlled policy remains
independent and still refuses protected args and foreign mutation relaying.
Full extracted export maps are cached by source content/location within one
owning run, including across smoke's per-story calls; manifest digest checks,
remounts, fresh sessions, fresh workers, and native marker verification remain.

### Fabric before/after

Eight baseline and eight candidate lifecycles selected identical callbacks in
identical order: 24 passed and eight declared unsupported on each side.
These are sequential before/after blocks, not randomized alternating runs.
Phase samples are 24 callbacks; extraction samples and totals are eight runs.
Values below are p50 / p95 milliseconds.

| Phase                        | Baseline          | Candidate         |
| ---------------------------- | ----------------- | ----------------- |
| Session attach               | 1192.22 / 1612.56 | 1088.67 / 1611.77 |
| Manifest                     | 2.62 / 3.37       | 2.90 / 3.88       |
| Input policy                 | 0.01 / 0.04       | 0.01 / 0.02       |
| Preparation                  | 0.13 / 0.17       | 0.15 / 0.20       |
| Upstream HTTP                | 503.23 / 504.56   | Not dispatched    |
| Correlated runtime readiness | 28.77 / 562.62    | 31.78 / 538.64    |
| Native marker verification   | 75.07 / 168.00    | 72.32 / 546.11    |
| Complete navigation          | 753.13 / 812.97   | 274.20 / 788.37   |
| Worker startup               | 203.00 / 215.85   | 201.50 / 212.85   |
| Worker body                  | 505.18 / 533.74   | 510.90 / 533.80   |
| Settled worker               | 723.34 / 750.74   | 729.28 / 758.36   |
| Worker settlement            | 18.12 / 20.96     | 19.63 / 21.90     |
| Receipts                     | 2.62 / 2.93       | 2.67 / 2.98       |
| Session cleanup              | 115.24 / 126.77   | 118.25 / 126.46   |
| Diagnostic native reads      | 13.33 / 18.08     | 7.81 / 14.71      |
| Extraction                   | 6.50 / 10.34      | 6.50 / 8.67       |

| Fabric total               | Baseline            | Candidate           |
| -------------------------- | ------------------- | ------------------- |
| Runner p50 / p95 ms        | 7939.07 / 8845.37   | 6680.04 / 6995.31   |
| Runner aggregate ms        | 63950.71            | 53173.56            |
| Runner sample variance ms² | 306828.83           | 91557.04            |
| Runner range ms            | 7478.77–9245.48     | 6192.64–7031.09     |
| Lifecycle p50 / p95 ms     | 19887.17 / 28433.88 | 18461.08 / 28733.43 |
| Lifecycle aggregate ms     | 171994.83           | 162636.05           |
| Lifecycle variance ms²     | 19950017.41         | 30801394.39         |

The bounded Fabric runner median was 15.9% lower. Matching repetitions by
index gave a median candidate-minus-baseline delta of −1141.99 ms; a
10,000-resample paired-median bootstrap interval was
−1887.49 to −782.75 ms (95%, fixed seed). This does not account for
temporal/system-load bias or establish reliability. Navigation's median
improved while native-verification p95 worsened; no universal tail-latency
or startup claim follows. This single-source cohort parsed once per run on
both sides and does not measure the cross-story cache benefit.

### Paper before/after

The same eight-plus-eight design, callback selection/order, and accessible
lane passed 24 callbacks and eight declared unsupported on each side.
Values are p50 / p95 milliseconds, with 24 callback samples or eight
extraction/total samples.

| Phase                        | Baseline          | Candidate         |
| ---------------------------- | ----------------- | ----------------- |
| Session attach               | 1094.93 / 1609.26 | 1434.73 / 1621.30 |
| Manifest                     | 2.60 / 3.14       | 2.69 / 3.11       |
| Input policy                 | 0.01 / 0.04       | 0.01 / 0.01       |
| Preparation                  | 0.13 / 0.24       | 0.14 / 0.20       |
| Upstream HTTP                | 503.08 / 503.95   | Not dispatched    |
| Correlated runtime readiness | 25.86 / 458.94    | 26.28 / 456.76    |
| Native marker verification   | 97.40 / 170.07    | 167.26 / 582.90   |
| Complete navigation          | 756.77 / 792.62   | 340.59 / 787.83   |
| Worker startup               | 196.50 / 207.40   | 193.00 / 201.85   |
| Worker body                  | 523.32 / 556.19   | 529.44 / 547.30   |
| Settled worker               | 736.00 / 789.32   | 741.24 / 756.44   |
| Worker settlement            | 15.94 / 18.23     | 16.09 / 17.49     |
| Receipts                     | 2.46 / 2.76       | 2.44 / 2.62       |
| Session cleanup              | 108.93 / 115.69   | 106.57 / 114.07   |
| Diagnostic native reads      | 6.79 / 9.11       | 7.09 / 12.84      |
| Extraction                   | 6.44 / 8.97       | 6.64 / 9.77       |

| Paper total                | Baseline            | Candidate           |
| -------------------------- | ------------------- | ------------------- |
| Runner p50 / p95 ms        | 7915.99 / 8755.09   | 7218.78 / 7811.59   |
| Runner aggregate ms        | 60909.13            | 57610.90            |
| Runner sample variance ms² | 2199477.39          | 210172.97           |
| Runner range ms            | 4123.59–8794.34     | 6440.61–7996.85     |
| Lifecycle p50 / p95 ms     | 19928.62 / 62342.92 | 18921.30 / 60994.39 |
| Lifecycle aggregate ms     | 224024.71           | 215170.59           |
| Lifecycle variance ms²     | 529506165.46        | 519947445.91        |

The bounded Paper runner median was 8.8% lower. Paired-by-index median
candidate-minus-baseline delta was −760.17 ms; its 10,000-resample bootstrap
95% interval was −1120.33 to −192.13 ms. One pair regressed by 3245.12 ms;
no samples were dropped. Cold first-lifecycle totals, including startup, were
retained on both sides (baseline 84945.44 ms, candidate 83318.31 ms).
Session-attach and native
verification medians worsened despite faster median navigation. The same
non-randomization, small-cohort, system-load, reliability, and cache-benefit
limits apply as for Fabric.

### Candidate lifecycle parity

Across each renderer's 24 passing candidate callbacks, keyed-preview/context
generations remained 2/3/4 per lifecycle. Fabric matched its native marker on
the first poll in all 24 callbacks, as did both renderer baselines. Paper's
candidate needed one poll in 12 callbacks and two polls in 12, contributing
to its slower native verification; fresh verification was never bypassed.
All eight lifecycles per side had distinct
verified app incarnations, one authenticated socket per lifecycle, and no
within-lifecycle app replacements or extra accepted hellos during callbacks.
Fabric accepted one hello and Paper two on the same connection. No independent
JS-init/HMR counter was added, and keyed generations do not count React
effect mounts.

Candidate activity retained zero activation commands, provider activations,
application activation/deactivation, main/focused-window changes, or window
creation in the bounded observational cohort. Generic AX element-destruction
counts matched baseline (Fabric 96; Paper 240), not closed-window counts.
Sixteen Fabric and 17 Paper candidate callback samples had truncated event
history, versus 16 each on baseline. These are advisory observations, not
proof that no activation or visual flash occurred.

### Window-only recording limits

Separate synchronized recording lifecycles used only the target Storybook
window, outside the performance cohorts. All recordings were 1864×1564:

| Renderer / revision | Duration seconds | Encoded frames | Last encoded timestamp seconds | Uniform-content candidates |
| ------------------- | ---------------: | -------------: | -----------------------------: | -------------------------: |
| Fabric baseline     |            8.037 |              4 |                          0.102 |                          0 |
| Fabric candidate    |            7.273 |              4 |                          0.103 |                          0 |
| Paper baseline      |            8.590 |              4 |                          0.103 |                          0 |
| Paper candidate     |            7.862 |              4 |                          0.100 |                          0 |

The candidate detector measured near-uniform luma in a padded window-content
crop; it is **not a validated blank-preview or activation-flash classifier**.
The crop includes persistent Storybook chrome, variable-rate recordings hold
their last frame, and window-only pixels cannot establish foreground/window
raising behavior. There is **no measured flash-reduction claim**. Raw media
and derived image samples remain local, ignored artifacts.

Phase 2 therefore ships measurement and a source-traced compatible proposal,
not an activation change. Phase 3's investigation gate is eligible because
attach is material, but pooling/startup changes remain deferred without their
own benefit and ownership/settlement evidence. Phase 4, new isolation
descriptors, preview reuse, and runtime protocol expansion remain excluded.

### Focused native qualification and cache ownership

The Fabric full-index accessible run rendered all 223 real catalog stories
and passed five selected callbacks (228 canonical passes, no failures or
unsupported results; run `57cf8594-addf-4cd3-9e60-5e1907a46b09`).
Selected stories were Button default, Dropdown default, and modern Callout
default/local-point/local-rectangle. This is not a full authored-test-suite
pass. The selected callbacks produced three source extractions and two
same-source cache hits across smoke's separate per-story runner invocations.
Each callback still had its own session, worker, and preview/context
generation (224–228); the application incarnation and authenticated
connection stayed stable.

Fabric physical qualification also rendered all 223 stories and passed
15 selected callbacks (238 canonical passes, no failures or unsupported
results; run `6ba319db-cada-4e66-a000-513015b2610b`). Selection covered
Button default, Dropdown default, modern Callout default, and native
Callout default/window-commands. Four source extractions and one cache hit
were recorded. Dropdown's open-list keyboard case preceded its
initially-collapsed semantic case; fresh per-case remounting prevented the
open popup from contaminating the latter. Native and modern Callout
dismiss/reopen, outside-click, anchor input, and Escape cases passed.
This is sparse physical regression evidence, not the full physical suite
or a qualification of concurrent physical-input fixes on another branch.

Paper passed the same full-index selections: 223 rendered stories plus five
accessible callbacks (228 canonical passes; run
`c6e2032d-76ee-4021-bc96-3e1c73be60ff`) and 223 plus 15 physical callbacks
(238 passes; run `9351f32d-29fe-4e6e-ae3d-cadd85a51989`). Neither lane had
failures, skips, unsupported callbacks, retries, or incomplete work.
Source extraction/cache-hit counts matched Fabric (3/2 accessible, 4/1
physical). Fresh callback generations were 224–228 and 224–238 respectively;
each lane retained one verified app incarnation and authenticated socket,
with two accepted hellos.

Fabric's three accessible Callout callbacks each observed two activation
commands
and two provider activations during their worker interval, plus focused-window
changes. This shows that window-oriented test helpers can activate even
without physical input; it does not identify a painted flash or justify
removing foreground guarantees. The timing cohort itself observed no
activation commands on either side.

### Package validation

| Workspace / command                                                                      | Result                                                                        |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Storybook integration: `yarn format && yarn lint && yarn build && yarn test --runInBand` | **Passed**; 405 tests passed, four skipped, 28 suites                         |
| Driver: `yarn format && yarn lint && yarn build`                                         | **Passed**                                                                    |
| Driver portable: `FURN_NATIVE_DRIVER_TEST=0 yarn test --runInBand`                       | **Passed**; 1223 tests passed, 66 skipped, 73 suites passed and eight skipped |
| Root: `yarn oxfmt --check`                                                               | **Passed**                                                                    |
| Root: `yarn check-agent-instructions`                                                    | **Passed**                                                                    |
| Root: `yarn change:check` after committing patch changesets                              | **Passed**                                                                    |

New regressions cover direct dispatch without HTTP, normal args versus
protected args refusal, correlated/stale/foreign readiness, uncertainty after
dispatch cancellation or disconnect, native-marker verification, bounded
diagnostic projection, source-content/location invalidation, run ownership,
cross-invocation cache hits, and manifest-digest rejection even on a cache hit.

### Final native and aggregate validation

All native/GUI and aggregate commands were serialized through the shared
native lock, with project-local temporary files.

From `apps/storybook`, the strict standalone-helper build **passed**:

```sh
swift build --package-path ../../packages/agentic/desktop-driver/native/macos --scratch-path artifacts/refresh-reduction/native-strict-build -c release -Xswiftc -warnings-as-errors
artifacts/refresh-reduction/native-strict-build/release/furn-desktop-driver-host --self-test
```

The self-test **passed 448/448 checks**. From the driver workspace,
`FURN_NATIVE_DRIVER_TEST=1 yarn test nativeDriver nativeCache applicationIncarnation serviceIdentity --runInBand`
**passed 87 tests**, with 16 skipped, six suites passed and two Windows suites
skipped. No product Swift or React-module boundary changed; Office
module/bridging-header qualification is not applicable.

The single cache-cleared `yarn clean-lage-cache && yarn lage buildci` attempt
**failed** in scripts' negative instruction fixtures: a temporary directory
inside ignored artifacts inherited the outer Git repository. The scripts
workspace's `yarn test` then **passed all 76 tests** with Git discovery
bounded by the temporary directory's parent. The next plain aggregate
**failed** two existing timing-sensitive driver tests in parallel execution
(`boundedCommand` termination signal and `privateStorage` timeout).
`FURN_NATIVE_DRIVER_TEST=0 yarn test boundedCommand privateStorage --runInBand`
then **passed 73 tests**, with ten skipped.

The final plain aggregate **passed** using the repository's existing
`TF_BUILD` serial-Jest mode and the fixture environment below, without another
cache clear:

```sh
export TMPDIR="$PWD/apps/storybook/artifacts/refresh-reduction/tmp"
export GIT_CEILING_DIRECTORIES="$PWD/apps/storybook/artifacts/refresh-reduction"
TF_BUILD=1 yarn lage buildci
```

Lage reported 46 successful and 132 skipped tasks, zero pending/aborted, exit
zero. These task skips are not test-pass counts. No source changes were made
to the instruction validator, private storage, or bounded process runner.
