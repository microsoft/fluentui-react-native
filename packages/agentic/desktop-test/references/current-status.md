---
id: desktop-test.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Current status

This document states what the neutral desktop workload host does today, what it deliberately refuses, and the latest native result per endpoint.
Done means the stated implementation exists and is covered by deterministic tests; it does not mean every native endpoint is qualified.
The package is the neutral workload host; Storybook contributes its domain resources to the same owner.
No new coordinator package, daemon, dynamic plugin loader, or package rename is required.
Parent issue: [#4435](https://github.com/microsoft/fluentui-react-native/issues/4435).
See [lifecycle](lifecycle.md), [commands](commands.md), [native qualification](native-qualification.md), and `@fluentui-react-native/desktop-driver/references/current-status.md` for the native and driver boundaries.

## Status overview

Configuration, service composition, reporting, cleanup fencing and generic handoff are implemented.
macOS application ownership and Windows/Win32 application ownership are implemented and qualified on the endpoints named below.
The neutral Storybook execution seam has portable coverage and selected native protected-handoff evidence on macOS Fabric, macOS Paper, Windows Fabric and Win32 Paper. Win32's post-readiness-gate rerun, repeated-run reliability and required native CI remain open.
Native results are per endpoint and tied to the revision that produced them.

- **App/suite configuration and standalone use:** Done. Storybook is optional and the runtime boundary rejects React, React Native and Storybook dependencies. See [Configuration and standalone use](#configuration-and-standalone-use).

- **Service and helper composition:** Done. The generic supervisor and the supervised Storybook child share one `driverService` factory. See [Service and helper composition](#service-and-helper-composition).

- **WDIO/Jasmine execution, required services and reporting:** Done. See [WDIO execution and reporting](#wdio-execution-and-reporting).

- **`serve --agent` descriptor publication:** Done. See [Agent descriptor publication](#agent-descriptor-publication). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Cleanup fence and lifecycle settlement:** Done. Failed disposal keeps the claim and never reclaims automatically. See [Cleanup fence and lifecycle settlement](#cleanup-fence-and-lifecycle-settlement). Tracking: [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451), [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Typed resource contributions and durable quarantine:** Done. Live restart qualification is separate. See [Resource contributions and durable recovery](#resource-contributions-and-durable-recovery).

- **Supervisor crash containment:** In progress. Portable contracts pass; live macOS survivors beyond the known descendant are unqualified. See [Supervisor crash containment](#supervisor-crash-containment). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Application ownership:** Qualified on macOS Fabric, macOS Paper, Windows Fabric (packaged) and Win32 Paper. See [Application ownership](#application-ownership). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441); landed in [#4492](https://github.com/microsoft/fluentui-react-native/pull/4492), [#4494](https://github.com/microsoft/fluentui-react-native/pull/4494).

- **Generated manifest provenance:** Qualified in hosted Windows/Win32 and macOS non-agent smokes; protected workload qualification remains open. See [Generated manifest provenance](#generated-manifest-provenance). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441); landed in [#4490](https://github.com/microsoft/fluentui-react-native/pull/4490).

- **MCP/WDIO handoff:** Qualified for the earlier generic attach-only phase on macOS AppKit and Windows/Win32 fixtures. Selected retained Storybook handoffs passed on all four endpoints; Win32's post-readiness-gate rerun and broader fault qualification remain open. See [MCP/WDIO handoff](#mcpwdio-handoff). Tracking: [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449); generic phase landed in [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **Storybook resource contributions:** Implemented with shared ownership and readiness; native smoke and protected handoff have partial macOS evidence. See [Storybook resource contributions](#storybook-resource-contributions). Tracking: [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449).

- **Cross-service and multi-target claims:** In progress. Exact macOS and Windows exclusion is qualified; broader lifecycle qualification is open. See [Cross-service and multi-target claims](#cross-service-and-multi-target-claims).

- **Persisted run, status and artifact queries:** Done. The verified management transport exposes bounded queries for connection-owned runs. See [Run queries and management](#run-queries-and-management). Tracking: [#4450](https://github.com/microsoft/fluentui-react-native/issues/4450).

- **Workload management API:** Implemented for opted-in generic WDIO and hosted Storybook CSF suites; generic native fixtures and selected macOS Storybook cases passed, while other native qualification remains open. See [Run queries and management](#run-queries-and-management). Tracking: [#4450](https://github.com/microsoft/fluentui-react-native/issues/4450).

- **Automatic service reuse and per-user daemon:** Deferred. See [Service reuse](#service-reuse).

- **Reliability and concurrency:** In progress. No repeated-run window is established. See [Reliability and concurrency](#reliability-and-concurrency). Tracking: [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451), [#4349](https://github.com/microsoft/fluentui-react-native/issues/4349).

## Configuration and standalone use

### Behavior and limits

- Storybook is optional; installed apps run without it.
- The runtime boundary and standalone-consumer contracts reject React, React Native and Storybook imports and dependencies.
- Executable configuration is trusted operator code, not a sandbox.
- Unknown configuration fields and invalid app or suite references are rejected.

### Open work

- None beyond the native qualification below.

## Service and helper composition

### Behavior and limits

- The generic supervisor and the supervised Storybook child use the same real `driverService` factory.
- They share helper policy, authority and settled close.
- Generic and Storybook composition stays in `src/driverService.ts`.

### Open work

- None beyond the native qualification below.

## WDIO execution and reporting

### Behavior and limits

- WDIO owns its session; hooks never create competing sessions.
- Storybook CSF callbacks use a runner-owned session borrowed by a Node worker.
- One collector produces bounded JSON and NDJSON summaries.
- Service-ready is not app-ready or context-ready.
- Skipped capabilities, empty work and incomplete work never count as passing coverage.
- Non-agent smoke is the legacy, unprotected path and stays separate from descriptor-path results.
- Normal WDIO cannot use the agent-served path except through the attach-only handoff.
- On Windows, report replacement retries only transient `EPERM`/`EACCES` rename conflicts (see [reporting](reporting.md)). The original conflicting handle owner was never identified, so it is not attributed to a reader or antivirus.

### Open work

- [#4349](https://github.com/microsoft/fluentui-react-native/issues/4349): required native CI.

## Agent descriptor publication

### Behavior and limits

- `serve --agent` publishes a private descriptor that protects the driver routes.
- MCP never builds or launches the application automatically.
- A real physical console Ctrl+C on the Windows packaged Fabric app and Win32 Paper REX drained the service, wrote a terminal `passed` lifecycle report, released the claim, withdrew the descriptor and preserved the borrowed app until its recorded launcher closed it ([#4491](https://github.com/microsoft/fluentui-react-native/pull/4491)).
- That qualification ran in an unlocked remote RDP session; a non-RDP console session has not been run.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): live requalification of descriptor-path lifecycle on all four endpoints.

## Cleanup fence and lifecycle settlement

### Behavior and limits

- Failed or timed-out disposal retains the claim with the exact resource generation and unresolved effect.
- A fenced claim needs manual inspection; there is no automatic reclaim.
- A fenced claim refuses a replacement workload.
- Guarded work settles before a successful close.
- Late acquisitions are disposed.
- A required-service failure stops its dependants.
- Owned resources dispose in reverse order.

### Open work

- [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451): failure-path matrix, kernel PID recycling and power-loss rename; automatic reclaim stays unsupported.
- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): live failed-cleanup retention and restart on each endpoint.

## Resource contributions and durable recovery

### Behavior and limits

- Static contribution plans validate IDs and dependencies.
- They record readiness, generation, identity, ownership and settled disposal through the public `resources` and `ownership` subpaths.
- Both native service paths use owner-only storage and exact-incarnation probes.
- Claim schema 3 records the driver's OS start identity; schema 2 and unverified claims inspect as unknown.
- Restart is not recovery proof.
- Automatic reclaim is unsupported.

### Open work

- [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451): exact-resource reconciliation beyond the implemented ledger.
- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): live endpoint qualification of restart recovery.

## Supervisor crash containment

### Behavior and limits

- Cooperative Node service lifelines and correlated service readiness are implemented.
- Portable contracts cover parent and wrapper crash, late spawn, failed withdrawal and stalled children.
- macOS applications survive an owner crash as `uncontained`; the claim stays fenced and an operator performs exact cleanup.
- Windows: the helper's Job Object ends an unpackaged app it launched when the helper dies.
- Windows packaged launches are `uncontained`; they survive in a fenced claim.
- Windows hard-terminates non-detached children when the owner crashes, so the three cooperative crash-disposal contracts are skipped there.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): arbitrary descendants, Metro and channel survivors on macOS, and live uncontained packaged-survivor journaling.

## Application ownership

Opt-in supervisor launch with neutral exact attach, causal ownership and application claim resources.

### Behavior and limits

- Session-owned launch remains the default.
- External attach never transfers ownership; an attached application is preserved.
- Only applications whose exact incarnation was recorded are cleaned up.
- Failed cleanup keeps the pending claim fenced; a pending claim with no acquired identity adopts no guessed identity and refuses replacement.
- Native launch survivors and known descendants are `uncontained`; exact primary-process cleanup does not remove descendants.

### macOS

- macOS ownership requires Accessibility, PostEvent and ScreenCapture permissions for the signed helper.
- Intel macOS and remote control are unsupported.
- First-run TCC grants, clean-machine, PPPC and revoked-permission behavior are not inferred from passes.

### Windows and Win32

- Windows application claims use schema 3 native owner identity, exact process pins, inspection and settlement.
- Packaged launches are `uncontained` and fenced.
- Win32 native application build is Unsupported; Win32 uses the prebuilt REX host.
- Stale-start recovery and matching-start identity mismatches fail closed.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): descendants, interrupted publication on Windows, supervisor-death survivors and live failed-cleanup fault injection.
- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): native qualification of the host-owned Storybook lease maintainer and remaining lifecycle migration.

## Generated manifest provenance

### Behavior and limits

- Generated driver manifests emit strict version 4, accept version 3 for compatibility, and carry no secrets.
- Credentials use independent bridge and application attachment nonces.
- The owner-private runtime module holds only bridge data.
- The parent's handoff pins manifest, credential and runtime hashes and the resolved helper, and the channel child re-verifies the executable before spawning a helper.
- Metro receives the canonical schema locator from trusted process configuration, not from editable generated files.
- Windows and Win32 smoke lease publication goes through the trusted Node helper and OS private storage.
- Generated manifests never authorize native helpers or expose credentials.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): protected Storybook qualification of the host-owned lease maintainer and version 4 manifest.
- [#4349](https://github.com/microsoft/fluentui-react-native/issues/4349): consistent helper build policy in required CI.
- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): remaining protected descriptor-path and native fault qualification.

## MCP/WDIO handoff

Generic and Storybook attach-only runners share the protected reservation.

### Behavior and limits

- A runner handoff fences admission before cancellation and drain, and confirms deletion before granting an attach-only reservation.
- Busy or failed handoffs issue no runner grant.
- The target reservation is held until every worker grant is drain-confirmed; a crash or revocation callback alone never releases it.
- Descriptor roots and workload or recovery holders refuse preempt with `target-busy` and require explicit relinquish.
- A preempted MCP child is discarded after authoritative rejection, and the connection reopens with fresh resources after runner drain.
- Live and draining grant capacity is reusable beyond 4096 connections; settled history never evicts pending or failed cleanup proof.
- Broker credentials are scrubbed before user hook import; WDIO receives each worker token through its per-worker `runnerEnv`, not launcher `process.env`.
- The worker's Node bootstrap and preload window stays trusted.
- Storybook workers receive distinct grants while their runner holds one reservation across cases.
- Supervisor-owned applications remain retained across attached sessions; external applications are never promoted to owned.
- Cross-connection resume and automatic replay remain unsupported.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): native Storybook handoff, preview lifecycle and retained-launch qualification.
- [#4349](https://github.com/microsoft/fluentui-react-native/issues/4349): the unchanged `boundedCommand` SIGKILL/SIGTERM assertion that blocks macOS portable aggregate acceptance.

## Storybook resource contributions

### Behavior and limits

- Desktop-test and the standalone Storybook CLI share run ownership, typed hosted-driver readiness, and verified management publication.
- The channel and driver child stay in place until relocation is justified and qualified.
- The macOS application lease is maintained by a host-owned read-only resource; macOS and Windows smoke retain their exact launched applications in the channel child.
- A claimed macOS, Windows, or Win32 Storybook supervisor can retain its verified built application across sessions. Selected native handoffs passed on all four endpoints; Win32 Paper has not been rerun after the authenticated initial-render readiness gate.
- Agent-served Storybook targets advertise attach-only sessions; owned smoke may launch and stop its exact application.
- Metro and channel readiness require correlated owned-listener receipts in addition to their HTTP and driver readiness.
- Protected story args are refused with `story-args-unsupported`, leaving the story unchanged and no value in an error or the journal.
- The non-agent smoke orchestrator intentionally uses the legacy transport.
- An ambiguous mutation is never retried.
- Windows `doctor --permissions` is Unsupported.
- Windows popup interaction does not establish a separately registered Storybook secondary-window identity.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): qualify the protected handoff and remaining lease and smoke lifecycle on each native endpoint.
- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): launch-capable discovery comparison, quarantine recovery, and live failed-cleanup retention per endpoint.
- [#4348](https://github.com/microsoft/fluentui-react-native/issues/4348): Windows and Win32 capture qualification.

## Cross-service and multi-target claims

### Behavior and limits

- Configured aliases have distinct registered IDs while retaining physical identity.
- Exact application exclusion, lease release and the physical-input mutex are qualified on signed AppKit and on Windows Fabric and Win32 Paper.
- No physical-input suites run in parallel on one interactive desktop.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): broader lifecycle qualification.

## Run queries and management

### Behavior and limits

- A harness-local read service and client expose atomic snapshots, terminal evidence, scoped expiring grants, bounded pages and allowlisted opaque artifact IDs.
- A separately verified supervisor transport exposes only opted-in workload IDs and allowed lanes, never commands, paths or environment.
- Per-connection principals can run and cancel their own workloads; cancellation does not stop the host and failed drain fences admission.
- Hosted Storybook CSF work borrows the active driver; it does not perform the smoke build or launch lifecycle.
- Generic AppKit and Win32 fixtures exercised supervisor-mode management, including lost-response reconciliation and cancellation. Selected protected Storybook workloads also passed on macOS Fabric, macOS Paper and Win32 Paper; Windows Fabric remains unqualified.

### Open work

- [#4450](https://github.com/microsoft/fluentui-react-native/issues/4450): native supervisor-mode qualification, fault injection and credential evidence.

## Service reuse

### Behavior and limits

- Automatic service reuse and a per-user daemon are Deferred until exact identity and configuration matching and evidence of need exist.
- An unknown port occupant is never adopted.

## Reliability and concurrency

### Behavior and limits

- Aggregate past successes are not a reliability pass.
- The required repeated-run window is not established.
- Interactive runs hold the per-user workload lock.

### Open work

- [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451): repeated-run reliability and support matrix.
- [#4349](https://github.com/microsoft/fluentui-react-native/issues/4349): required native CI, including managed macOS physical-input lanes.
- [#4348](https://github.com/microsoft/fluentui-react-native/issues/4348): Windows and Win32 capture qualification.

## Native qualification

Results are per endpoint and tied to the revision that produced them; skipped checks are not passes.
Full per-run evidence (commands, counts, run ids, artifact locators, cleanup outcome) lives in the linked pull request or issue.
Hosted physical-input and capture skips do not qualify those paths.

### macOS Fabric

- **Application ownership:** 9 ownership/lifecycle checks passed, 0 failed, 0 cleanup failures; smoke 224 selected/executed/passed, 0 failed, 0 skipped, 0 retries (accessible input policy excluded one physical callback); rebased snapshot `16558610f`; evidence in [#4492](https://github.com/microsoft/fluentui-react-native/pull/4492).

- **Generic handoff (plain AppKit fixture, no renderer):** `nativeRunner.contract` passed 5/5 with zero skips at the rebased revision `5dbadb53b`; evidence in [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **Generic supervisor management:** the AppKit fixture passed handoff, preemption, worker crash, lost response and managed modes at `41c604371`; capture was skipped, and no React Native renderer was involved. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Protected Storybook handoff:** at `8bbc3741d` (integrated source `a52302ebe`, later changes documentation-only), an accessible Button case and a physical Checkbox case each passed once attached and once managed. First story selection succeeded without retries after readiness; MCP-to-runner-to-MCP handoff retained the same app, and the exact primary app, descriptors and claim settled. The helper was ad-hoc signed; broader fault and stable-signing qualification remain open. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Owned non-agent smoke:** a candidate worktree based on `474941a38` passed 223 navigations and 37 accessible callbacks, and 223 navigations and 120 physical callbacks, with three declared unsupported cases in each lane. The accessible run preceded the final identity guard; the physical run included it. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Earlier physical-input smoke:** `yarn storybook smoke --macos --mode stories-and-tests --input physical` passed 343, 0 failed, 3 declared unsupported at `b66140d7b`; the accessible lane passed 260 with 3 declared unsupported; the advisory hosted macOS physical job passed 343 with 3 declared unsupported; evidence in [#4500](https://github.com/microsoft/fluentui-react-native/pull/4500).

- **Earlier failure:** the smoke at `141b88b4b` failed 2 of 225 in `components-accordion--keyboard-disclosure` (obscured physical click, foreground activation failure); [#4500](https://github.com/microsoft/fluentui-react-native/pull/4500) fixed it (scrolling previews, verified clear, verified foreground); original record in [#4493](https://github.com/microsoft/fluentui-react-native/pull/4493).

- **Not run:** live failed-cleanup retention and restart, quarantine recovery and launch-mode discovery on macOS; tracked in [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

### macOS Paper

- **Application ownership:** same result as Fabric (9 checks passed, smoke 224/224 passed, 0 skipped) at `16558610f`; evidence in [#4492](https://github.com/microsoft/fluentui-react-native/pull/4492).

- **Protected Storybook handoff:** at `8bbc3741d` (integrated source `a52302ebe`, later changes documentation-only), an accessible Button case and a physical Checkbox case each passed once attached and once managed. First story selection succeeded without retries after readiness; MCP-to-runner-to-MCP handoff retained the same app, and the exact primary app, descriptors and claim settled. The helper was ad-hoc signed; an earlier launch could not capture an exact start time and was manually reconciled after its app exited, with cause unknown. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Owned non-agent smoke:** a candidate worktree based on `474941a38` passed 223 navigations and 36 accessible callbacks, and 223 navigations and 120 physical callbacks, with three declared unsupported cases in each lane. Both runs preceded the final identity guard; a later guarded render-only run passed 223 navigations. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Earlier physical-input smoke:** passed 343, 0 failed, 3 declared unsupported at `b66140d7b` after a first attempt failed 7 cases (an unrelated overlay window obscured six; one hit-test unsupported); accessible 259 passed with 3 declared unsupported; no hosted Paper physical lane exists; evidence in [#4500](https://github.com/microsoft/fluentui-react-native/pull/4500).

- **Earlier failures:** at `141b88b4b` smoke failed 2 of 225 and the descriptor run 4 of 18 (keyboard clear, obscured Checkbox click), fixed by [#4500](https://github.com/microsoft/fluentui-react-native/pull/4500); Paper semantic activation remains Unsupported by the provider, and Paper Menu observations hit the 100-node cap; original record in [#4493](https://github.com/microsoft/fluentui-react-native/pull/4493).

### Windows Fabric

- **Retained Storybook handoff and workload:** at `a52302ebe`, one supervisor-retained ReactApp incarnation stayed exact across marker-verified MCP selection and observation, refused attached execution while MCP held the session, relinquish, an attached accessible case (1/1) and full accessible suite (40/40), MCP reopen and a managed workload (1/1, cleanup settled). Console Ctrl+C wrote a terminal `passed` lifecycle report and released the app, services, descriptors and claim. Physical input and capture were not run. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Application ownership (packaged, `furn-81` build `bdeb0b291`):** the complete native consumer suite passed 11/11 and the provider cases 6/6 at `da89fe9bc` (native source `dbaf55893`), including recovery of a packaged survivor and the physical-input mutex; the hosted selection ran 0 of the 11 consumer cases because it has no endpoint opt-in; evidence in [#4494](https://github.com/microsoft/fluentui-react-native/pull/4494).

- **Generic handoff:** `nativeRunner.contract` passed all 5 outer cases with zero skips at `b1bbb26df` against the plain Win32 fixture (not a React Native renderer); handoff, operator preemption, worker crash, lost grant response and capture modes all passed; evidence in [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **Generic supervisor management:** the Win32 fixture passed handoff, preemption, worker crash, lost response and managed modes at `41c604371`; capture was skipped, and this does not qualify a React Native renderer. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Console interrupt of `serve --agent`:** a real physical console Ctrl+C (four `SendInput` key events, no injected signal) in an unlocked remote RDP session ended with exit codes 0/0/0, a terminal `passed` report, a released claim and a withdrawn descriptor at `b1bbb26df`; evidence in [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **Secondary windows and activation (unlocked remote RDP session, not console) at `6c626602c`:** a distinct secondary window's physical-pointer click was applied with `focus: confirmed` and its handle retired; modern main controls and the secondary refuse semantic activation before dispatch (`activation-unsupported`, effect `none`, no physical fallback); evidence in [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498).

- **Connected-session probes at `505a2187b`:** physical keyboard clear, semantic clear, readonly refusal and minimized-capture refusal without restore passed; default observe is incomplete (`maxNodes`, 13 nodes omitted); 200% scale, mixed DPI and negative-origin layouts were not run; evidence in [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498).

- **Storybook physical smokes:** Checkbox and Callout selections passed 203/203 with zero failures or skips at `fec94cec4`; evidence in [#4469](https://github.com/microsoft/fluentui-react-native/pull/4469).

- **Manifest provenance (hosted run 43156299266):** accessible 255 selected, executed and passed; evidence in [#4490](https://github.com/microsoft/fluentui-react-native/pull/4490).

- **Latest hosted Storybook smoke:** at `0a369ebe5`, 255 of 255 selected checks passed with no groups skipped, after the Callout placement story began repositioning on owner layout changes; at `474941a38` a placement assertion had failed and eight groups were not run. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

### Win32 Paper

- **Retained Storybook handoff and workload:** at `d04c064da`, one supervisor-retained REX incarnation stayed exact across MCP select, a refused attached runner, relinquish, the attached accessible Button case (1/1), MCP reopen and a managed workload (1/1, cleanup settled); console Ctrl+C then wrote a terminal `passed` report and released the app, lease, descriptors and claim. Not rerun after the `a52302ebe` initial-render readiness gate. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Application ownership (prebuilt REX 0.81.1):** the same 11-case consumer suite and 6 provider cases passed at `da89fe9bc` with job-object drain reconciled; the hosted selection ran 0 of the 11 consumer cases; evidence in [#4494](https://github.com/microsoft/fluentui-react-native/pull/4494).

- **Generic handoff:** same five modes passed at `b1bbb26df`; evidence in [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **Non-agent smoke:** a local render-only run passed 188 stories at `41c604371`; hosted accessible smoke passed 233 checks and physical smoke passed 288 with one quarantined unsupported case at `474941a38`. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Console interrupt of `serve --agent`:** same result as Windows Fabric (real physical console Ctrl+C in an unlocked remote RDP session; exit codes 0/0/0, terminal `passed` report, claim released) at `b1bbb26df`; evidence in [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **Connected-session probes and secondary windows:** at `505a2187b` injected provider-context loss was fenced with `ref-region-changed` and `story-context-stale` (provider retirement, not crash or reconnect proof); at `6c626602c` the owned untitled tool secondary registered with exact-root UIA content and a physical-pointer click was applied (native delivery only, not proof of the React Native focus command); evidence in [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498).

- **Storybook physical smokes:** Checkbox and Callout selections passed 177/177 with zero failures or skips at `fec94cec4`; evidence in [#4469](https://github.com/microsoft/fluentui-react-native/pull/4469).

- **Manifest provenance (hosted run 43156299266):** accessible 233 selected, executed and passed; physical 289 selected, 288 executed and passed, 1 quarantined unsupported ([#4373](https://github.com/microsoft/fluentui-react-native/issues/4373), not a pass); evidence in [#4490](https://github.com/microsoft/fluentui-react-native/pull/4490).

- **Open observation:** the exact REX process can outlive its closed window after MCP close and report failed cleanup; no later run resolves it; tracked in [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

### Hosted CI and portable evidence

- **Windows aggregate:** a locked default-environment `yarn clean-lage-cache && yarn lage buildci` passed all 178 tasks at `2bf750f9e`; evidence in [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **macOS aggregate:** the final aggregate at the rebased F11 revision failed twice on the same bounded-command `SIGKILL`/`SIGTERM` assertion; no complete aggregate acceptance is claimed for that revision; evidence in [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491); tracked in [#4349](https://github.com/microsoft/fluentui-react-native/issues/4349).

- **Hosted skips:** hosted physical-input and capture skips are not passes and do not qualify those paths.

- **Historical consumer baselines** (`c84acb741`, endpoint-specific, not lifecycle evidence): FluentTester E2E passed 62/62 on macOS Fabric, 39/39 on Windows Fabric and 201/201 on Win32.

## Maintaining this document

- Edit only the topic your change affects, and keep that topic's line in the status overview in step with it.
- Describe what is true now. Do not add dated entries, run logs, or "updated" stamps.
- Record per-run evidence (commands, counts, run ids, artifact locations, cleanup outcome) in the pull request description or the tracking issue, and keep only the latest result for each endpoint here with a link to that record.
- Put remaining-work detail in the tracking issue and link the issue from the topic's open-work list; remove the link when the issue closes.
- Write one sentence or fact per line, and keep a blank line between adjacent list entries that different changes are likely to edit, so concurrent changes merge independently.
- Historical results stay tied to the revision that produced them and are never reported as qualifying a later revision.
- Skipped checks are not passes; report each endpoint (macOS Fabric, macOS Paper, Windows Fabric, Win32 Paper) separately.
- The detailed per-run ledger that preceded this format is preserved in git history: `git show a7af2b4b2:packages/agentic/desktop-test/references/current-status.md`.
