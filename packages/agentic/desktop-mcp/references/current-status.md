---
id: desktop-mcp.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-mcp
---

# Current adapter and measurement status

This document covers the state of the MCP adapter and its measured discovery and interaction costs.
The adapter is a thin client, not a supervisor.
Done means the stated implementation exists and is covered by deterministic tests; it does not mean every native endpoint is qualified.
Parent issue: [desktop driver improvements (#4435)](https://github.com/microsoft/fluentui-react-native/issues/4435).
See [connection](connection.md) and [tools](tools.md) for exact behavior.
Native and Storybook limitations are tracked in `@fluentui-react-native/desktop-driver/references/current-status.md`; supervision gaps in `@fluentui-react-native/desktop-test/references/current-status.md`.

## Status overview

The adapter's driver tools, connection lifetime, grants, relinquish, and bounded workload tool have portable coverage.
Native qualification through the real descriptor path is partial and per endpoint.
Generic AppKit and Win32 fixtures exercised supervisor-mode management; selected protected Storybook workloads also passed on macOS Fabric, macOS Paper and Win32 Paper.

- **Tools and shared schemas:** Done. Six tools over shared driver schemas. See [Tools and discovery](#tools-and-discovery).

- **Descriptor, identity and grants:** Done. Native identity is verified before a grant is sent, and each connection gets an attenuated child. See [Descriptor, identity and grants](#descriptor-identity-and-grants). Tracked by [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Connection and session lifetime:** Qualified (generic AppKit consumer on macOS, generic native consumer on Windows and Win32). Storybook lifecycle faults are not qualified. See [Connection and session lifetime](#connection-and-session-lifetime). Tracked by [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441) and [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451).

- **Relinquish and handoff:** Done. Earlier generic AppKit and Windows fixture consumers were qualified; those results do not qualify a React Native renderer. See [Relinquish and handoff](#relinquish-and-handoff). Storybook handoff is tracked by [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449).

- **Storybook control:** In progress. The experimental selection and marker path exists. See [Storybook control](#storybook-control). Tracked by [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449).

- **Cross-connection resume:** Unsupported. See [Cross-connection resume](#cross-connection-resume).

- **Workload and test orchestration tools:** Implemented for opted-in generic WDIO and hosted Storybook CSF suites; generic native fixtures and selected macOS and Win32 Paper Storybook workloads passed, while Windows Fabric and broader native qualification remain open. See [Workload and test orchestration tools](#workload-and-test-orchestration-tools). Tracked by [#4450](https://github.com/microsoft/fluentui-react-native/issues/4450).

- **General MCP-client qualification:** In progress. SDK stdio evidence only. See [MCP client qualification](#mcp-client-qualification). Tracked by [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Native qualification:** In progress. See [Native qualification](#native-qualification). Tracked by [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

- **Measurements:** In progress. Latest values are recorded for all four endpoints except macOS Paper click and cancellation cost. See [Measurements](#measurements). Tracking: [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441).

## Tools and discovery

### Behavior and limits

- Driver-only mode exposes six tools over shared driver schemas: session, observe, act, check, capture, story.

- Supervisor mode adds one fixed workload tool and uses no dynamic schema generated from the catalog.
- There is no separate execution path from the driver.
- Launch-mode discovery lists the effective launch and attach modes, so a launch-only target never fails a predictable attach-first call.
- Progress and cancellation are supported; progress does not renew idle sessions.
- Image artifacts are paged resources that are bound to the session and hash-checked.
- The schema tests limit driver-only discovery to fewer than 22,000 UTF-8 bytes and 5,200 `o200k_base` tokens.

- Supervisor discovery is limited to fewer than 24,000 UTF-8 bytes and 5,800 `o200k_base` tokens.
- Discovery is about 20.3 KB; the earlier 8 KiB discovery budget is not met.
- Changed descriptions or schema text invalidate an exact token claim; keep token counts tied to their revision.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): remaining MCP cost measurements (macOS Paper click and cancellation cost).

## Descriptor, identity and grants

### Behavior and limits

- Preview element references go stale after reset or the next select; chrome and window references and immutable PNG resources keep their identity.
- Manifest smoke and legacy traces are unprotected workloads that use no descriptor or grant, so they are not protected-ingress evidence.
- The adapter verifies the private descriptor and native identity before sending a grant.
- It imports the driver's `/native`, `/authority` and `/client` subpaths, not the WebdriverIO-heavy root; boundary tests guard this.
- The model supplies no URL, token, configuration or executable input.
- Each controller delegates a distinct driver-only child after verification, with target and scope subsets.
- Terminal-only cleanup is retried.
- Invalid authority is forgotten and the next call re-verifies discovery; mutations are never replayed.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): live descriptor-path requalification of per-connection grants on every endpoint.

## Connection and session lifetime

### Behavior and limits

- Acquisition, close, operations and resource reads are serialized single-flight; a late acquisition after dispose is cleaned up.
- After a same-port protected restart or revocation the next call re-verifies discovery.
- Same-authority transport retry keeps the known session cleanup responsibility and rebinds only after verifying the same incarnation and principal.
- Same-authority retry is not cross-connection resume.
- A lost create response is fenced as `session-uncertain` with no repeated acquisition.
- Connection disposal revokes and drains the child, including unknown session ids.
- A failed delete or disconnect keeps known-session responsibility; the bounded dispose wait leaves late cleanup attached.
- Cleanup against an unreachable service cannot be guaranteed, so service drain and expiry remain necessary.
- Fake-host tests validate portable controller semantics, not native ownership, signing, TCC, Windows ACLs, DPI or process containment.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): descriptor-path reruns of same-port replacement, revocation, dispose during open, failed delete, ambiguous create and resource invalidation on the endpoints not yet qualified.
- [#4451](https://github.com/microsoft/fluentui-react-native/issues/4451): repeated-run reliability and failure-path support matrix.

## Relinquish and handoff

### Behavior and limits

- `desktop_session` relinquish applies an immediate admission fence and cancellation, and returns only after the connection subtree drains.
- A failed drain keeps retryable cleanup responsibility.
- A fresh open expires old references, cursors, proofs and artifact links.
- Authoritative rejection discards the cached child binding; after operator preemption and runner drain the same connection delegates a fresh child.
- The generic attach-only runner integration is owned by `@fluentui-react-native/desktop-test/references/current-status.md`.
- Handoff also supports retained supervisor-owned apps and Storybook CSF runners; selected macOS Fabric and Paper cases passed on the combined implementation.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): Storybook handoff and preview lifecycle.

## Storybook control

### Behavior and limits

- The driver selection and marker path exists and is experimental.
- Channel ingress, reconnect and full exclusive context authority are incomplete.

### Open work

- [#4449](https://github.com/microsoft/fluentui-react-native/issues/4449): channel ingress, reconnect and exclusive context authority.

## Cross-connection resume

### Behavior and limits

- There is no lease, grace or ownership-transfer protocol, by design.
- Same-controller rediscovery retains its existing child.
- There is no automatic replay or cross-connection resume.

## Workload and test orchestration tools

### Behavior and limits

- `desktop_workload` connects to the harness-owned management authority; the adapter never becomes the resource owner.

- Generic WDIO and Storybook CSF suites require explicit catalog opt-in and an input lane supported by the host and runner.

- A Storybook workload can select an exact story ID and runs against the live host rather than invoking smoke.

- Workload principals are connection-local, admission is reconciled by request ID, and disposal waits for owned work to drain.

- The deprecated `desktop-driver-mcp` executable remains a driver-only forwarding shim.

- A native fixture exercised supervisor discovery, admission, lost-response reconciliation, cancellation, handoff and credential confinement through the MCP SDK; it did not use a React Native renderer.

### Open work

- [#4450](https://github.com/microsoft/fluentui-react-native/issues/4450): protected Storybook workload and remaining native supervisor-mode qualification.

## MCP client qualification

### Behavior and limits

- Evidence comes from the MCP SDK 1.32.2 stdio client; it is not universal client qualification.
- Client-specific resource, image and cancellation behavior needs independent runs.

### Open work

- [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441): independent runs for supported clients.

## Native qualification

Results are per endpoint and tied to the revision that produced them.
Skipped or not-run checks are not passes.
Full per-run evidence (commands, counts, run ids, artifact locators, cleanup outcome) lives in the linked pull request or issue.
The new supervisor mode passed selected app-backed Storybook workloads on macOS Fabric, macOS Paper and Win32 Paper.
Windows Fabric workloads and app-backed forwarding-shim qualification remain open.

- **Generic supervisor-managed fixtures:** AppKit and Win32 fixtures passed the managed scenario at `41c604371`; the SDK used an in-memory MCP transport, and these results do not qualify a React Native renderer. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **App-less macOS discovery:** real stdio clients verified the supervisor catalog, driver-only mode and forwarding shim at `5991ca42f` and `474941a38`; no application session or Storybook workload ran. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

### macOS Fabric

- **Retained Storybook handoff and workloads:** at `69fd4a850`, one accessible Button case and one physical Checkbox case each passed attached and managed, with the same app retained across MCP handoff and exact primary-app cleanup settled. The helper was ad-hoc signed; these cases do not qualify direct MCP physical clicks or lifecycle faults. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Generic AppKit consumer (relinquish/handoff, operator preemption, worker crash, lost runner-grant response, target capture):** all five modes passed through the real descriptor, MCP SDK transport and WDIO/Jasmine at `5dbadb53b`, with stale-resource and credential-confinement checks passing. Evidence: [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **Storybook descriptor lifecycle and faults:** 10 passed, 1 failed, 0 skipped at `141b88b4b`; the failure is the physical Checkbox click (`element click intercepted`, effect none). Fault injection used public typed-client methods, not native cleanup or TCP failures. Evidence: [#4493](https://github.com/microsoft/fluentui-react-native/pull/4493). [#4500](https://github.com/microsoft/fluentui-react-native/pull/4500) fixed driver physical-input postconditions but records no MCP-path rerun.

### macOS Paper

- **Retained Storybook handoff and workloads:** at `69fd4a850`, one accessible Button case and one physical Checkbox case each passed attached and managed, with the same app retained across MCP handoff and exact primary-app cleanup settled. The helper was ad-hoc signed; these cases do not qualify direct MCP physical clicks or lifecycle faults. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Storybook descriptor lifecycle and interaction:** 14 passed, 4 failed, 0 skipped at `141b88b4b` (keyboard clear and its dependent precondition, physical Checkbox click, unsupported semantic Checkbox activation); a separate input probe passed 4 and failed 1 (keyboard clear). Cleanup audit passed. Evidence: [#4493](https://github.com/microsoft/fluentui-react-native/pull/4493). No MCP-path rerun followed [#4500](https://github.com/microsoft/fluentui-react-native/pull/4500), so macOS acceptance for [#4441](https://github.com/microsoft/fluentui-react-native/issues/4441) is not met.

### Windows Fabric

- **Physical MCP click:** six physical-pointer checkbox clicks, each state-checked, with 23 calls and zero errors at `505a2187b`; remote RDP session, 100% scale, one origin-zero monitor. Evidence: [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498).

- **Generic consumer handoff, preemption, worker kill and lost runner-grant response:** the plain Win32 fixture passed 5/5 with zero skips at `b1bbb26df`; this qualifies generic native ownership, not a React Native renderer or Storybook handoff. Evidence: [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **Connected descriptor-path checks:** physical checkbox and target PNG passed at `fec94cec4`. Evidence: [#4469](https://github.com/microsoft/fluentui-react-native/pull/4469).

- **Descriptor lifecycle:** same-port replacement, revocation, dispose during open, failed delete, ambiguous create, quarantine and recovery, protected args, cancellation replay and idle-channel lifetime passed with the real descriptor at `1f5333e25` plus the follow-up fixes `8458bde48` and `a6b89e924`. Evidence: [#4463](https://github.com/microsoft/fluentui-react-native/pull/4463).

### Win32 Paper

- **Retained Storybook handoff and workload:** at `d04c064da`, over a real stdio MCP client and the protected descriptor, status advertised attach-only launch; MCP open, marker-verified selection and observe passed; the attached runner was refused `target-busy` until relinquish, then the accessible Button case passed 1/1; MCP reopened, the catalog listed the accessible `stories` lane, and a managed workload passed 1/1 with cleanup settled. The same REX incarnation was retained throughout and closed only when the supervisor stopped. Direct MCP physical input and lifecycle faults were not run. Evidence: [#4510](https://github.com/microsoft/fluentui-react-native/pull/4510).

- **Physical MCP click:** six physical-pointer checkbox clicks, each state-checked, with 23 calls and zero errors at `505a2187b`. Evidence: [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498).

- **Generic consumer handoff, preemption, worker kill and lost runner-grant response:** same result as Windows Fabric at `b1bbb26df`.

- **Connected descriptor-path checks:** physical checkbox and target PNG passed at `fec94cec4`. Evidence: [#4469](https://github.com/microsoft/fluentui-react-native/pull/4469). Injected fresh-preview fencing and the secondary tool popup were later recorded in [#4498](https://github.com/microsoft/fluentui-react-native/pull/4498).

- **Descriptor lifecycle:** the same real-descriptor lifecycle set as Windows Fabric passed at `1f5333e25` plus the follow-up fixes `8458bde48` and `a6b89e924`. Evidence: [#4463](https://github.com/microsoft/fluentui-react-native/pull/4463).

- **Process lifetime:** after MCP session close the exact REX process can outlive its closed window; it is stopped only after identity verification.

### Hosted CI and portable evidence

- **Portable:** the package passes 32 tests (31 in the focused server selection) at `5dbadb53b`; these do not qualify native behavior. Evidence: [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- **Hosted generic native consumer:** the Windows and Win32 accessible jobs each passed four ownership modes with one capture-policy skip, which is not a pass. Evidence: [#4491](https://github.com/microsoft/fluentui-react-native/pull/4491).

- Not run: 200% scale, mixed DPI and negative-origin layout. Windows and Win32 doctor `--permissions` is unsupported.

## Measurements

Measurements keep the latest values per endpoint.
Tokens use `o200k_base` over all MCP text blocks; Windows and later macOS runs used `gpt-tokenizer` 4.1.0 with MCP SDK 1.32.2 stdio through the private descriptor.
The macOS Fabric baseline at `41fc7473f` is retained where it is the latest value; its tokenizer package version was not retained.
Discovery is paid once per connection, and each value stays tied to its revision.

### Discovery

The combined working tree's portable in-memory MCP SDK 1.32.2 measurement uses `js-tiktoken` 1.0.21 with `o200k_base`.
It serializes the tool array as JSON; it is provisional and does not qualify a native endpoint or final revision.
The per-mode budgets are tested independently and must be remeasured on the final qualified revision.

| Mode        | Tools | Tokens | UTF-8 bytes |
| ----------- | ----- | ------ | ----------- |
| Driver-only | 6     | 4,698  | 20,298      |
| Supervisor  | 7     | 5,252  | 21,996      |

Historical driver-only measurements:

| Item                              | Value                                         | Revision / source                     |
| --------------------------------- | --------------------------------------------- | ------------------------------------- |
| Six-tool `tools/list` array       | 4,691 tokens; 20,277 UTF-8 bytes (characters) | `9d3e11516` and `505a2187b` (Windows) |
| Full `tools/list` result envelope | 4,693 tokens; 20,287 bytes                    | `505a2187b`; macOS `141b88b4b`        |
| Server instructions               | 120 tokens; 591 bytes                         | Same                                  |

### macOS Fabric

| Measurement                                          | Result                                                       | Caveat                                            |
| ---------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| Named Toggle + check + closing observe (`41fc7473f`) | 386 tokens; 48 ms                                            | One warm run at 2720 x 1988 on a 2x display       |
| Physical click + checked check (`41fc7473f`)         | 181 ms                                                       | One run                                           |
| Default observe (`141b88b4b`)                        | median 21.9-27.8 ms, max 1,680.2 ms; 905-948 tokens per call | 20 calls per story; 100-node projection, complete |
| Idle delta (`141b88b4b`)                             | median 21.5-26.3 ms, max 1,688.1 ms; 151-152 tokens per call | Same method                                       |
| First attach after discovery (`141b88b4b`)           | 846.4 ms                                                     | One sample; excludes service and app startup      |
| Read cancellation (`141b88b4b`)                      | 301.5 ms, then a usable observe                              | No mutation cancellation claim                    |

No successful physical click cost is recorded for the latest macOS revision, because the click was refused.

### macOS Paper

| Measurement (`141b88b4b`)                  | Result                                | Caveat                                                         |
| ------------------------------------------ | ------------------------------------- | -------------------------------------------------------------- |
| Observe, button / checkbox / menu stories  | p50 31.8-34.1 ms; 1,188-1,322 tokens  | 20 calls each; menu emitted 100 of 103 nodes, 0 of 20 complete |
| Idle delta                                 | p50 31.5-36.4 ms; 151-152 tokens      | 20 calls each, all complete                                    |
| First attach after discovery               | 831.6 ms                              | One sample                                                     |
| Text entry + value check + closing observe | 2,015.7 ms; 1,371 tokens; 4,194 bytes | One sample; not a physical Checkbox activation                 |
| Read cancellation                          | 302.2 ms                              | Mutation cancellation not run                                  |

The p90 values (1,142-1,710 ms) are slow outliers; samples are warm and window size and scale were not retained.

### Windows Fabric and Win32 Paper

Revision `505a2187b` (click) and `9d3e11516` (other rows); Windows 11 build 26300, AMD64; MCP SDK 1.32.2; remote RDP for the click run.

| Measurement                                         | Windows Fabric                          | Win32 Paper                             |
| --------------------------------------------------- | --------------------------------------- | --------------------------------------- |
| `open` (attach)                                     | 45 ms                                   | 31-40 ms                                |
| Physical click response (6 samples)                 | 99-106 tokens; p50 299.1 ms, max 370.0  | 96-103 tokens; p50 308.0 ms, max 318.2  |
| Click + checked check + default observe (6 samples) | 1,999-2,005 tokens; 411.8-550.6 ms      | 1,585-1,592 tokens; 431.8-473.5 ms      |
| Checkbox `activate` + check + default observe       | 1,923 tokens; 2,288 ms                  | 1,645 tokens; 2,302 ms                  |
| Observe default (20 calls, 100 nodes)               | median 66.7-73.7 ms; 1,801-1,843 tokens | median 81.1-85.8 ms; 1,594-1,633 tokens |
| Idle delta (20 calls)                               | median 72.7-77.5 ms; 368 tokens         | median 83.3-88.3 ms; 220 tokens         |
| Default observe completeness in click run           | Incomplete: `maxNodes`, 13 omitted      | Complete                                |

- Click request JSON adds 56-64 tokens; click RPC time excludes startup and discovery; with six samples p90 is the maximum.
- On Windows an idle delta is never empty: three menu-bar items (React, Debug, System) get new references on every read, and whether they lack stable runtime identities is unconfirmed; without them it is about 151 tokens.
- The Win32 idle delta was not decomposed.
- The `activate` rows come from a disconnected console session and are not comparable with the click rows or the macOS row.
- These are local samples, not a latency distribution or platform ranking; do not claim token reductions from reducing scope or omitting discovery.

## Maintaining this document

- Edit only the topic your change affects, and keep that topic's line in the status overview in step with it.
- Describe what is true now. Do not add dated entries, run logs, or "updated" stamps.
- Record per-run evidence (commands, counts, run ids, artifact locations, cleanup outcome) in the pull request description or the tracking issue, and keep only the latest result for each endpoint here with a link to that record.
- Put remaining-work detail in the tracking issue and link the issue from the topic's open-work list; remove the link when the issue closes.
- Write one sentence or fact per line, and keep a blank line between adjacent list entries that different changes are likely to edit, so concurrent changes merge independently.
- Historical results stay tied to the revision that produced them and are never reported as qualifying a later revision.
- Skipped checks are not passes; report each endpoint (macOS Fabric, macOS Paper, Windows Fabric, Win32 Paper) separately.
- The detailed per-run ledger that preceded this format is preserved in git history: `git show a7af2b4b2:packages/agentic/desktop-driver-mcp/references/current-status.md`.
