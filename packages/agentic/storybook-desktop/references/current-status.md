---
id: storybook-desktop.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Current status

This document records the status of Storybook desktop qualification: Windows Fabric and Win32 Paper connected-session results, direct story selection, refresh reduction, and lifecycle parity.
Done means the stated implementation exists and is covered by deterministic tests; it does not mean every native endpoint is qualified.
Parent issue: [#4435](https://github.com/microsoft/fluentui-react-native/issues/4435).
See the [integration guide](integration.md) and the [reference index](README.md).
Harness, driver and MCP evidence lives in `@fluentui-react-native/desktop-test/references/current-status.md`, `@fluentui-react-native/desktop-driver/references/current-status.md` and `@fluentui-react-native/desktop-mcp/references/current-status.md`.

## Status overview

Direct story selection and run-owned extraction caching are implemented and measured on macOS only.
Fresh-preview fencing for injected provider-context loss is qualified on Win32 Paper at baseline `505a2187b`.
Windows Fabric modern Callout physical-pointer interaction passed; semantic-activation refusal and Win32 Paper tool-window registration landed in PR [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498) and passed local native checks at its final source `6c626602c`.
Console-session (non-RDP), 200% and mixed DPI, and negative-origin cases are not qualified.

- **Preview fencing and context loss:** Qualified (Win32 Paper, injected provider-context loss only). Native crash, real socket reconnect and chrome mutation are not covered. See [Preview fencing and context loss](#preview-fencing-and-context-loss). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Secondary windows:** Qualified (Windows Fabric and Win32 Paper, remote RDP session, limited cases). Display-scale, negative-origin and console cases are not run. See [Secondary windows](#secondary-windows). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Story selection and refresh reduction:** Qualified (macOS Fabric and macOS Paper, bounded cohort). Windows Fabric and Win32 Paper are not run. See [Story selection and refresh reduction](#story-selection-and-refresh-reduction). Tracking: [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449).

- **Lifecycle parity:** Qualified (macOS Fabric and macOS Paper, observed). JS initialization and HMR counts are not observed. See [Lifecycle parity](#lifecycle-parity). Tracking: [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449).

- **Hosted resources and protected runners:** Implemented with portable coverage and partial non-agent native smoke evidence; protected Storybook handoff remains unqualified. See [Hosted resources and protected runners](#hosted-resources-and-protected-runners). Tracking: [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449), [#4450](https://github.com/microsoft/fluentui-react-native/issues/4450).

- **Visual flash claims:** Deferred. No flash-reduction claim is made. See [Visual flash claims](#visual-flash-claims). Tracking: [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449).

- **Native qualification:** Partial per endpoint; non-agent smoke does not qualify protected Storybook workloads. Windows refresh-reduction, console and display-scale lanes are not run. See [Native qualification](#native-qualification). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441), [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451).

## Preview fencing and context loss

Scope: Win32 Paper stale-ref rejection after the Storybook preview context is lost.

### Behavior and limits

- After provider-context loss, a ref from the old preview is rejected with `ref-region-changed`.
- A freshly found native ref in the new preview epoch is rejected with `story-context-stale` until the story context is re-established.
- Both rejections are effect-none and do not quarantine the session.
- Chrome refs established before the loss survive.
- Qualification injected the loss through the orchestrator's bridge-retirement path while keeping the socket and native preview.
- The qualification harness reads current-story state before injecting loss; it is retained local tooling, not a published CLI or fault-injection API.
- Not claimed: native crash, actual socket disconnect and reconnect, transparent upstream reconnection, chrome mutation, or quarantine recovery.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): requalify on later revisions and the remaining lost-context variants.

## Secondary windows

Scope: separately registered popup windows such as the modern Callout.

### Behavior and limits

- Windows Fabric modern Callout registers as a distinct window with an opaque handle; a complete observation, a unique focus target and a physical-pointer click with `focus: confirmed` passed.
- Windows legacy-only semantic activation is refused before dispatch with `activation-unsupported`, because an accessibility default action does not prove the Pressable ran.
- Win32 Paper registers an untitled tool popup only after exact-process ownership, native identity, visible bounds and bounded content checks.
- The Paper legacy story publishes no native focus-command outcome, so its physical-pointer receipt proves native delivery, not the React Native focus command.
- Paper's modern Callout is absent from the Paper catalog, so Paper modern-Callout secondary coverage does not exist.
- Secondary windows are inspected without activation through the read-only window-tree route.
- Not run: 200% scaling, mixed DPI and negative-origin layouts.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): the unrun display-scale, negative-origin and console cases.

## Story selection and refresh reduction

Scope: the driver-owned channel factory and the run-owned extraction cache.

### Behavior and limits

- Agent sessions select stories directly through the authenticated channel without an upstream HTTP mutation.
- Controlled policy remains independent: protected story args are refused and foreign mutation relaying is refused.
- Extracted export maps are cached by source content and location within one owning run, including across smoke's per-story calls.
- Cache hits are bound to digests of every helper module read by input-policy validation, including transitive helpers and failed reads; a changed helper reruns extraction.
- Manifest digest checks, per-case remounts, fresh sessions, fresh workers and native marker verification remain on every callback.
- Phase durations include failed attempts; a missing duration does not mean success or zero cost.
- `processEventsTruncated` reports the native process-lifetime flag; `eventsTruncated` reports per-case history loss only when the history no longer covers the case cursor.
- Session reuse, worker sharing, preview reuse, new isolation descriptors and runtime protocol expansion are not implemented.
- Attach is the dominant remaining cost, so a session or worker investigation is eligible but needs its own paired benefit and ownership evidence.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): session and worker investigation and the Windows measurements.

## Lifecycle parity

### Behavior and limits

- Each lifecycle has one verified app incarnation and one authenticated bridge connection; macOS Fabric accepts one hello and macOS Paper two on the same connection.
- Each callback selects a fresh preview and context generation.
- Keyed remounting is inferred from the rendering policy, not counted; the duplicate `mountGeneration` field no longer exists.
- JS initialization and HMR counts are not observed, and generations are not React effect-mount counters.
- Native activity reports are advisory fixed counters; AX element-destruction counts describe preview elements, not closed windows.
- Window-oriented test helpers can activate the app without physical input; this does not identify a painted flash or justify removing foreground guarantees.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): an independent JS-initialization counter, if needed.

## Hosted resources and protected runners

### Behavior and limits

- Storybook and desktop-test share a neutral owner for hosted-driver acquisition, readiness and management publication.
- Metro and channel readiness require correlated owned-listener receipts; the driver remains in the channel child.
- A protected runner holds one reservation across cases and gives each worker a distinct drain-confirmed grant.
- macOS lease maintenance is host-owned; default macOS and Windows/Win32 native smoke retain their exact supervisor-launched applications in the channel child.
- macOS smoke verifies the built instance bundle and renderer, and never stops another app merely because it shares a bundle identifier.
- Non-agent macOS Fabric and Paper candidate smokes and Win32 Paper smoke have native evidence; they do not qualify protected app-backed handoff or managed Storybook workloads.

- Exact macOS primary-app cleanup does not prove that arbitrary uncontained descendants exited.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): qualify Storybook handoff, retained launches and lease maintenance on each native endpoint.
- [#4450](https://github.com/microsoft/fluentui-react-native/issues/4450): qualify managed Storybook workloads through the real supervisor descriptor.

## Visual flash claims

### Behavior and limits

- Window-only ScreenCaptureKit recordings exist only as local artifacts.
- The near-uniform-luma detector is not a validated blank-preview or activation-flash classifier; chrome, variable-rate recordings and window-only pixels limit it.
- No speedup or flash-reduction claim is made without paired candidate and renderer evidence plus visual analysis.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): validated visual analysis, if a flash claim is wanted.

## Native qualification

Results are per endpoint and tied to the revision that produced them; skipped checks are not passes.
Full per-run evidence (commands, counts, run ids, artifact locators, cleanup outcome) lives in the linked pull requests and issues.

### macOS Fabric

- **Owned non-agent smoke:** a candidate worktree based on `474941a38` passed 223 navigations and 37 accessible callbacks, and 223 navigations and 120 physical callbacks; each lane had three declared unsupported cases. The accessible run preceded the final identity guard; the physical run included it. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Direct selection, accessible lane:** full-index run rendered 223 stories and passed five callbacks (228 passes, no failures or unsupported results) at candidate `06446c276`. Evidence: [#4496](https://github.com/microsoft/fluentui-react-native/pull/4496).

- **Direct selection, physical lane:** 223 stories plus 15 callbacks passed (238 passes) at `06446c276`; sparse regression evidence, not the full physical suite. Evidence: [#4496](https://github.com/microsoft/fluentui-react-native/pull/4496).

- **Review corrections:** not requalified natively; earlier qualification is historical for `06446c276`.

### macOS Paper

- **Owned non-agent smoke:** a candidate worktree based on `474941a38` passed 223 navigations and 36 accessible callbacks, and 223 navigations and 120 physical callbacks; each lane had three declared unsupported cases. Both runs preceded the final identity guard; a later guarded render-only run passed 223 navigations. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Direct selection, accessible lane:** 223 stories plus five callbacks passed (228 passes) at `06446c276`. Evidence: [#4496](https://github.com/microsoft/fluentui-react-native/pull/4496).

- **Direct selection, physical lane:** 223 plus 15 callbacks passed (238 passes) at `06446c276`.

- **Review-correction smoke:** full-index accessible smoke with Button, Dropdown and modern Callout selection passed 228 checks; ten physical callbacks were excluded by input policy.

### Windows Fabric

- **Hosted non-agent smoke:** at `474941a38`, 250 of 251 selected checks passed and a modern Callout placement assertion failed; eight groups were not run. The cause is unproven. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Secondary window:** at `6c626602c` the modern Callout physical-pointer click passed (`focus: confirmed`) and semantic activation was refused before dispatch with effect none and no fallback. Evidence: [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498).

- **Environment:** Windows 11 Enterprise build 26300 x64, remote RDP session (not console), one 1728 x 1084 monitor at 96 DPI.

- **Not run:** 200%, mixed DPI and negative-origin layouts. Refresh-reduction measurements not run.

### Win32 Paper

- **Non-agent smoke:** a local render-only run passed 188 stories at `41c604371`; hosted accessible smoke passed 233 checks and physical smoke passed 288 with one quarantined unsupported case at `474941a38`. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Fresh-preview fencing:** passed for injected provider-context loss at baseline `505a2187b` (REX 0.81.1). Evidence: [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498).

- **Secondary tool window:** the owned untitled tool popup registered, a complete eight-node sample was read, and a physical-pointer click passed at `6c626602c` (native delivery only). Evidence: [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498).

- **Not run:** refresh-reduction measurements.

### Hosted CI and portable evidence

- Portable Storybook integration, driver and root checks passed for the refresh-reduction work; JavaScript tests are not native qualification.

- Hosted macOS Fabric and Paper smokes passed at `474941a38` before the ownership-safe macOS smoke change; they do not qualify that later candidate. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- The cache-cleared `yarn lage buildci` aggregate failed on timing-sensitive driver tests (`boundedCommand`, `privateStorage`) on the candidate and on base `aadc2f359`, so it is not hosted-CI parity; tracked in [#4349](https://github.com/microsoft/fluentui-react-native/issues/4349).

## Measurements

Revision: candidate `06446c276` against its instrumented parent; stacked on PR [#4490](https://github.com/microsoft/fluentui-react-native/pull/4490) (`aadc2f359`).
Platform: macOS, accessible lane, Fabric and Paper separately.
Method: eight independently launched lifecycles per renderer and side, run through the public `DesktopStorybookCli` API with the traversal index narrowed to `components-listboxitem--native-selection`; three callbacks passed and one declared macOS-unsupported callback was reported per lifecycle.
Samples: phase samples are 24 callbacks; extraction samples and totals are eight lifecycles; values are p50 / p95 milliseconds (inclusive linear interpolation).
Caveats: rows omitted for unchanged phases and lifecycle totals (which include startup and traversal); sequential before/after blocks (not randomized), small cohort, no system-load control, first lifecycle may include cold caches, navigation subphases overlap and must not be added, no reliability or startup claim.
Evidence: [#4496](https://github.com/microsoft/fluentui-react-native/pull/4496).

### macOS Fabric

| Phase                        | Baseline          | Candidate         |
| ---------------------------- | ----------------- | ----------------- |
| Session attach               | 1192.22 / 1612.56 | 1088.67 / 1611.77 |
| Upstream HTTP                | 503.23 / 504.56   | Not dispatched    |
| Correlated runtime readiness | 28.77 / 562.62    | 31.78 / 538.64    |
| Native marker verification   | 75.07 / 168.00    | 72.32 / 546.11    |
| Complete navigation          | 753.13 / 812.97   | 274.20 / 788.37   |
| Runner total                 | 7939.07 / 8845.37 | 6680.04 / 6995.31 |

Runner median was 15.9% lower; paired-by-index median delta −1141.99 ms (10,000-resample bootstrap 95% interval −1887.49 to −782.75 ms, fixed seed).
Navigation median improved while native-verification p95 worsened.

### macOS Paper

| Phase                        | Baseline          | Candidate         |
| ---------------------------- | ----------------- | ----------------- |
| Session attach               | 1094.93 / 1609.26 | 1434.73 / 1621.30 |
| Upstream HTTP                | 503.08 / 503.95   | Not dispatched    |
| Correlated runtime readiness | 25.86 / 458.94    | 26.28 / 456.76    |
| Native marker verification   | 97.40 / 170.07    | 167.26 / 582.90   |
| Complete navigation          | 756.77 / 792.62   | 340.59 / 787.83   |
| Runner total                 | 7915.99 / 8755.09 | 7218.78 / 7811.59 |

Runner median was 8.8% lower; paired-by-index median delta −760.17 ms (95% interval −1120.33 to −192.13 ms); one pair regressed by 3245.12 ms and no samples were dropped.
Session-attach and native-verification medians worsened; the candidate needed one marker poll in 12 callbacks and two in 12, and fresh verification was never bypassed.
The baseline's first lifecycle was unusually short (runner 4123.59 ms) and is retained.

## Maintaining this document

- Edit only the topic your change affects, and keep that topic's line in the status overview in step with it.
- Describe what is true now. Do not add dated entries, run logs, or "updated" stamps.
- Record per-run evidence (commands, counts, run ids, artifact locations, cleanup outcome) in the pull request description or the tracking issue, and keep only the latest result for each endpoint here with a link to that record.
- Put remaining-work detail in the tracking issue and link the issue from the topic's open-work list; remove the link when the issue closes.
- Write one sentence or fact per line, and keep a blank line between adjacent list entries that different changes are likely to edit, so concurrent changes merge independently.
- Historical results stay tied to the revision that produced them and are never reported as qualifying a later revision.
- Skipped checks are not passes; report each endpoint (macOS Fabric, macOS Paper, Windows Fabric, Win32 Paper) separately.
- The detailed per-run ledger that preceded this format is preserved in git history: `git show a7af2b4b2:packages/agentic/storybook-desktop/references/current-status.md`.
