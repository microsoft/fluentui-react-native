---
id: desktop-driver.remaining-work
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Agent efficiency and ergonomics: implementation plan

**Status:** Implementation in progress. Reporter modes (section 5) have been
implemented in the three JavaScript packages, and the Node timeout boundary
now waits for an aborted host operation to settle. The Windows helper now
fails closed on unsettled UI Automation mutations. MR has Windows/PowerShell
pipe qualification; GitHub Actions rendering and console-interrupt coverage
remain. M0-M6 remain open unless marked below. This status does not claim
real-application qualification.
Planning baseline: `c84acb741`, 2026-11-02.

**Delivery constraint:** Complete the shared architecture, macOS implementation,
Windows implementation, and separate Windows Fabric/Win32 Paper qualification
on the same branch before publishing its PR. Do not ship a macOS-only agent
surface and leave Windows parity to another PR.

This is the canonical open-work plan under R-PKGDOC-009. Each milestone states
its outcome and completion condition. As implementation lands, move durable
contracts into the owning references and remove completed work here.

## 1. Architecture decision

**Build an MCP-first agent interface over a transport-neutral operation layer
inside the existing driver service. Keep the CLI as a thin secondary client.
Do not create another permanent daemon.**

The long-term investment is the common operation, observation, identity, and
lifecycle contracts, not a larger collection of commands. MCP supplies tool
discovery, structured input, cancellation, progress, and optional images;
programmatic and shell clients reuse the same implementation. MCP does not
inherently save tokens: measure its tool-definition overhead as well as its
results.

Use a separate, optional **desktop-driver-mcp** package and the official
TypeScript MCP SDK. This keeps MCP dependencies and protocol releases outside
the driver/native/WDIO dependency path. Choose an age-policy-compliant SDK
version during implementation; use strict Zod schemas, inferred types, and
JSON Schema conversion rather than a bespoke schema language or hand-written
MCP server. A transitive dependency is not a substitute for declaring the
owning package's direct dependency.

```text
MCP stdio adapter       CLI adapter       typed agent client       WDIO
         \                  |                   /                   |
          shared, versioned operation contract                     |
                         |                                          |
               client-neutral driver service <--- W3C compatibility |
                         |
           SessionManager: authority, queues, refs, outcomes
                         |
                     DesktopHost
                   /             \
          macOS AX helper      Windows UIA helper

desktop-test: trusted configuration, process lifecycle, connection grants
storybook-desktop: optional story context and authenticated orchestration
```

The MCP adapter connects to an already provisioned service. It does not select
executables, build helpers, launch a supervisor, become the native helper's
responsible parent, or own application cleanup. Embedders can supply the
service directly; desktop-test is the supported supervisor, not a dependency
of the driver.

**Rejected alternatives:**

- A CLI-first command engine followed by a separate MCP implementation:
  duplicates contracts and preserves the script-writing interaction loop.
- Driver tools hosted exclusively inside Storybook's upstream MCP server:
  couples generic automation to a React Native consumer.
- A new per-user broker owning another helper/session pool: duplicates
  authority and changes process, permission, and recovery boundaries.
- A generic shell/evaluate tool or one unconstrained command dispatcher:
  bypasses bounded schemas, target policy, and discoverability.

Storybook's existing documentation MCP may coexist, but it is not the driver
control plane. Its programmatic mutations must participate in driver ownership
and serialization when an agent controls the target.

## 2. Evidence that changes the research recommendations

The earlier capability research provides useful recorded macOS measurements,
not a Windows benchmark or a live comparison with agent-device. Approximately
14k tokens for stored trees versus 700 for a compact projection is a formatting
opportunity, not a delivered performance result. Stored failure trees also
overrepresent failure-time UI.

Source review corrects or qualifies several assumptions:

| Finding                                                                                                                                                                                                  | Consequence                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| The [agent API](../src/agent/DesktopAgent.ts) already forwards `launchMode`; the CLI omits it.                                                                                                           | Fix CLI policy/connection handling without inventing a missing programmatic option.             |
| Agent description fetches a full tree before projection; programmatic scope defaults to the current-window tree, while CLI scope defaults to story.                                                      | Add a distinct bounded observation contract with explicit window/application/context scope.     |
| Agent lookup uses first-match selection and eagerly requests `selected`, which native controls may not support.                                                                                          | Strict ambiguity and supported-state results must be tested with realistic fake-host states.    |
| Generic installed targets and optional renderer metadata already exist. Windows can attach using exact executable/AUMID and title identity.                                                              | Extend existing application-neutral seams; do not require a Storybook lease file for every app. |
| The [timeout wrapper](../src/protocol/timeouts.ts) can return before aborted work settles. Windows [bounded UIA calls](../native/windows/src/automation.cpp) can leave a worker running after a timeout. | Qualify cancellation and uncertain side effects before expanding persistent agent mutations.    |
| Both providers collect before agent-side projection; retained element records are unsuitable for unlimited repeated observations.                                                                        | Budget native work and retained identities, not just output bytes.                              |
| Existing semantic activation already uses several AX actions/UIA patterns.                                                                                                                               | Add explicit discovery and selection, not a duplicate implementation of all activation.         |
| The desktop-test `--json` option prints the complete run result and still writes human progress to stderr; storybook-desktop has no structured mode.                                                     | Add bounded reporter modes shared by all three CLIs (section 5).                                |

These are source-inspected concerns, not newly reproduced native failures.
Milestones below require matching-OS experiments, including late application
effects after timeout. Fake-host agreement is insufficient.

## 3. Authority, session lifetime, and recovery

### One controller and one execution path

Keep the existing SessionManager as the sole reservation, native-session,
element, and command authority. An agent controller adds bounded caches,
operation outcomes, and a lease to an ordinary service session; it does not
create a second native session beside WDIO.

Use one catalog of operation schemas, effect classes, capabilities, defaults,
limits, and results. Put execution beside service/session state. The MCP
adapter, CLI, typed client, and any W3C extensions call those same executors.
Expose the proposed named-operation route family
`POST /session/<id>/furn/ops/<operation>` with a versioned, strictly validated
envelope; do not turn it into arbitrary script execution. The new internal
operation layer owns schemas and executors, while the existing public
`/agent` entry point remains the client/compatibility facade.
Keep existing W3C and public agent contracts available through explicit
compatibility adapters; do not silently change result shapes or reinterpret
unsupported values as false.

Extend exclusive claims across independently started services targeting the
same verified application. Claims bind canonical application/process
incarnation, not merely a user-chosen target alias. WDIO and agent conflicts
return a bounded `busy` result; neither silently steals the other's target.
Physical input retains its existing cross-process serialization.

### Authentication and trusted discovery

The new agent-enabled service must authorize session creation and **all routes
addressing protected sessions, including ordinary W3C routes**. Protecting only
new operation endpoints would leave a bypass. An agent capability flag or MCP
tool annotation is not authorization.

The trusted supervisor supplies a versioned connection descriptor and scoped
grants through owner-only state. The usual stdio adapter is the MCP client's
child, not the supervisor's, so it cannot assume inherited credentials.
Embedders that actually co-launch clients may use inherited channels instead.
Validate service nonce, process incarnation, ownership, and actual permissions:
a 0700 directory and 0600 file on macOS; an explicitly validated user-scoped
Windows DACL. Implement Windows creation/validation through a native ownership
adapter rather than assuming Node can set DACLs. Reject unsafe links or
permissions. Bind grants to the intended interactive session; do not claim
logon-session file isolation without implementing it.

The trust boundary excludes other OS users and accidental cross-client access;
it does not isolate mutually hostile processes running as the same user or
protect against administrators. Pass grants to trusted WDIO workers through
supervisor-controlled transport configuration, never capabilities or logs.

Keep credentials, helper paths, executables, arbitrary hosts, artifact roots,
environment values, and lease-file paths out of model-visible tool schemas.
Tools select only registered, approved target IDs. Keep loopback binding and
browser-origin rejection. Existing non-agent deployments may retain their
documented mode, but a protected target cannot downgrade through a legacy
client or an alternate route.

### Lifecycle policy

- Prefer attach for externally owned targets. Launch requires a registered
  launch-enabled policy and an explicit request; never fall back to launch
  after attachment fails.
- Move lease creation to the trusted application launch/attachment path, not
  to a test command. Preserve descriptor-based native attachment where valid.
- Separate application ownership, workload claims, controller leases, and
  transport connections. A CLI invocation can end without deleting its
  explicitly retained controller session.
- Proposed initial defaults: ten-minute idle expiry and thirty-second
  reconnect grace, capped by operator policy. Meaningful operations renew
  idle activity; heartbeats establish transport liveness, not perpetual
  ownership. Final defaults require measurement.
- Disconnect, expiry, and shutdown drain or quarantine work before releasing
  authority. Reconnection requires the same grant and service incarnation;
  service restart never resurrects old references.
- Add supervisor-owned status, stop, and recovery operations. Record PID,
  process start, executable identity, and causal ownership. Reclaim only a
  provably dead workload claim under exclusive locking and identity comparison.
- Preserve attached applications. On macOS, track child groups and
  LaunchServices-launched applications separately. On Windows, use native
  helper-managed Job Objects for assignable unpackaged trees that the helper
  actually launches, with verified explicit cleanup or launch rejection
  otherwise. Other supervisor-owned services require their own recorded
  process-instance cleanup; Node cannot create Job Objects by assumption.
  Never absorb attached apps, assume packaged activation belongs to a job, or
  bypass nested-job restrictions.
- Do not promise immediate cleanup after an uncatchable supervisor death.
  Report incomplete ownership and perform exact-ledger recovery on the next
  trusted start. A new detached watchdog is outside this branch.

### Cancellation and uncertain mutations

Distinguish a caller's response deadline from native settlement. After
dispatch, report whether the operation completed, was rejected before effects,
or has an **indeterminate** outcome. Dispatch completion is not proof that an
application assertion passed.

If settlement cannot be established, quarantine the **target/session**, not
just the affected element. Keep its reservation, block further mutations on
every route, and preserve affected input exclusion until safe recovery.
Record a minimal redacted in-flight disposition before dispatch so a process
restart cannot erase uncertainty. Pin unresolved records until settled; journal
quotas must fail closed rather than evict the only recovery evidence.

Request IDs allow retrieval of known outcomes; they do not make UI actions
idempotent. Never automatically replay an ambiguous click, key sequence, or
UIA call. Killing the helper does not retract input already delivered to an
application. An attached application must not be terminated just to clear
quarantine. An explicit trusted `recover` operation, keyed to application
incarnation and request ID, requires established native settlement/input
recovery plus authoritative re-observation, or verified exit of that exact
application incarnation. Helper exit and key release alone do not prove a
delivered UIA/AX mutation cannot complete later. If safety cannot be established,
keep the target quarantined and explain the required operator intervention.

## 4. Bounded observations and safe actions

### Model-facing operation families

Keep five core tool families and one optional story tool; do not generate a
tool per story, control, or native pattern. These are proposed names, not
commands available today.

| Family            | Purpose                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `desktop_session` | List approved targets; open, inspect, reconnect, or close a controller.                                        |
| `desktop_observe` | Compact observation, scoped search, element details, pagination/deltas, and bounded diagnostic-resource reads. |
| `desktop_act`     | Bounded actions with optional checks/waits and a closing observation.                                          |
| `desktop_check`   | Authoritative predicates, optionally waiting with a deadline.                                                  |
| `desktop_capture` | Confined window/element evidence; capped image preview only when requested.                                    |
| `desktop_story`   | Optional catalog/context operations only when an orchestrator is registered.                                   |

Expose schemas and results consistently through all adapters. Reject unknown
fields and oversized requests. MCP cancellation/progress must reach the common
operation lifecycle; stdout carries protocol only. Use resources for optional
detail with a bounded text fallback for clients without resource support.
Event tails, capabilities, catalogs, and journal detail are paged resources;
the observation tool's explicitly typed resource-read variant supplies that
fallback. Avoid returning the full tree twice in text and structured content.

Every result carries schema version, request ID, session/application
incarnation, and bounded provenance/diagnostics. Keep mutation disposition
(`applied`, `rejected`, `indeterminate`) separate from predicate status
(`passed`, `failed`, `unsupported`, `inconclusive`, `timed-out`, `cancelled`).
For example, an incomplete search produces an inconclusive absence check, and
a delivered click does not by itself produce a passed application assertion.

### Observation contract

Default to the current window; application scope explicitly groups a bounded
set of windows. A registered context root can provide story scope without
hard-coded test-ID suffixes. Unsupported context scope is an error, not an
empty successful observation.

Return a compact outline with opaque short refs, role, accessible name,
automation ID, requested state, and available actions. Geometry is opt-in.
Interactive filtering uses native affordances/focusability as well as roles;
retain ancestor context and allow static text when it is the requested
evidence. Keep supported, unsupported, and unobserved fields distinguishable
per element.

Enforce budgets **inside native traversal** and again at projection:
visited/emitted nodes, depth, string length, bytes, elapsed work, and retained
references. Proposed starting output defaults are 100 nodes and 12 KiB, with
finite server-owned ceilings. Tune visited-node and time budgets independently
on AX/UIA; a deadline prevents additional work but cannot guarantee that an OS
provider call is interruptible.

Providers lacking negotiated bounded traversal must return
unsupported/upgrade-required for this API. Legacy full-tree retrieval can
remain separate; it is not a silent fallback for a bounded request. Artifact
links are not an escape hatch for unlimited collection.

Each observation includes sample ID, capture interval, scope/projection
identity, counts, completeness, and explicit truncation reasons. An incomplete
search cannot establish absence, exact count, or uniqueness. Selector-based
mutation requires proven uniqueness within the declared scope; otherwise
return bounded candidates and request narrowing.

### References, paging, and deltas

Refs bind to exact native element identity, application/process incarnation,
opaque window identity, and an optional region-lifetime epoch. Revalidate
liveness, ownership, capability, and action preconditions immediately before
dispatch. Do not rebuild a stale ref using label, path, parent/index, or the
first selector match.

Role/name fingerprints are useful preconditions, not identity proofs.
Explicitly qualify provider recycling, including indistinguishable replacement
controls. Where lifetime identity cannot be established, report that stable
reference use is unsupported rather than substituting a replacement.

Separate observation samples from lifetime epochs. A new read does not
invalidate unchanged refs. Preview replacement invalidates its region, not
application chrome or still-live secondary windows. Optional orchestrators
register context and generation; generic apps require neither.

Page only within bounded immutable observation caches. Expanding an unvisited
frontier produces another sample, not a falsely consistent continuation.
Deltas require retained, matching scope/projection bases. Lost bases return an
explicit fresh snapshot; omitted or truncated nodes are never reported as
deleted. Use epoch-scoped cursors for event tails and report overflow.

Bound Node and helper caches together. Release agent-only native references on
expiry/reset and preserve live W3C references. At capacity, fail explicitly or
expire eligible records; never recycle a public ref onto another element.

### Actions, waits, and fidelity

Separate physical, hit-tested `click` from semantic `activate`/`perform`.
Report the mechanism actually used. Preserve existing W3C `auto` behavior
without counting semantic fallback as physical-input qualification.

Offer portable desired-state actions only where their native mapping is
verified. AX custom actions use opaque tickets bound to the exact element and
native action identity; display labels are not unique action IDs. UIA patterns
are not assumed to be equivalent to similarly named AX actions. Unsupported
actions remain explicit.

Allow a short, server-capped action/check/wait sequence under one session queue
turn, stopping on failure or uncertainty and returning per-step outcomes plus
one bounded final observation. This is not rollback or an atomic transaction
against human input. Release physical-input locks after input settles, not
while waiting for application state.

Wait by authoritative query, waking on native notifications with bounded
polling fallback. Subscribe before checking to avoid missed notifications.
Events are advisory: they neither satisfy assertions nor prove freshness.

Capture defaults to an artifact ID, with window/ref scope, capture interval,
coordinate-space, scale, and renderer/runtime provenance where applicable.
Optional downscaled previews have pixel/byte caps. Never infer input
coordinates from a stale screenshot.

## 5. Reporter modes and machine-readable CLI output

**Add explicit reporter modes to desktop-test, storybook-desktop, and the
driver CLI.** For agents, most of the savings come from bounded summaries and
quiet structured streams, not from JSON syntax. Lifecycle, build, and suite
execution remain shell commands in this branch, outside the MCP tool families,
so their output is the agent interface for those workflows. The same renderer
seam allows later human CLI improvements without changing collection,
journals, or results.

### Baseline before MR

- desktop-test `--json` moves the human presenter to stderr and, at exit,
  prints the complete `run.json` result to stdout. `serve --json` prints one
  readiness document. `test --list` always prints indented JSON.
- storybook-desktop has no structured mode. Some commands always print
  indented JSON (`instance`, `build-driver`, `test --list`); others print
  prose. Its `test --reporter spec|tap|dot` option already selects the Node
  test reporter for worker processes.
- The driver CLI always prints indented JSON.
- `reporting.console` (`auto`, `plain`, `github-actions`) can be set only in
  configuration.
- Every collector run already writes the authoritative `events.jsonl`,
  `run.json`, `junit.xml`, and command logs.

### Measured opportunity

These figures are an offline projection of 80 recorded Storybook run
directories under `apps/storybook/artifacts/desktop`, tokenized with o200k.
The human row approximates the current non-verbose presenter, including
worker-log replay. Stream and summary rows are prototype projections, not
implemented output.

| Output shape                                      | Lifecycle (38 runs), median/max | 1–8 tests (36 runs), median/max | 110–243 tests (6 runs), median/max |
| ------------------------------------------------- | ------------------------------- | ------------------------------- | ---------------------------------- |
| Human console                                     | 352 / 37,020                    | 1,776 / 6,006                   | 39,234 / 61,549                    |
| Current `--json` stdout (complete compact result) | 215 / 915                       | 1,313 / 9,257                   | 35,335 / 38,260                    |
| Complete journal as NDJSON                        | 1,681 / 64,588                  | 10,077 / 32,860                 | 340,688 / 442,676                  |
| Every test result as NDJSON                       | 126 / 236                       | 1,282 / 9,625                   | 41,562 / 47,288                    |
| Milestones plus at most 25 problems               | 57 / 138                        | 285 / 402                       | 297 / 1,391                        |
| Bounded terminal summary                          | 214 / 301                       | 279 / 382                       | 302 / 395                          |

- The current `--json` mode still writes the human stream to stderr. An agent
  shell that captures both streams receives more text than in plain mode:
  about 78k tokens for the recorded 243-test run. Structured modes must
  suppress human presentation.
- For large runs, a bounded summary with artifact paths is about 100 times
  smaller than either current output and remains nearly constant as suites
  grow. Agents read `run.json`, `events.jsonl`, or logs only for failures they
  are investigating.
- NDJSON that streams every test costs as much as prose. Its value is
  liveness, early failure detection, cancellation, and machine consumers, so
  the default stream contains only milestones and capped problems.
- On these results, compact JSON used 25% fewer tokens than two-space
  indentation; on the earlier stored trees it used 45% fewer.

### Mode contract

Use one `--reporter <mode>` option in all three CLIs and keep `--json` as an
alias for `--reporter json`. Resolve the mode from the flag, then
`DESKTOP_REPORTER`, then configuration, then `auto`. Do not try to detect
whether the caller is an agent.

| Mode                      | stdout                                                                                                                                                           | stderr                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `auto` (default)          | `github-actions` when `GITHUB_ACTIONS=true`; otherwise `plain`. A future interactive renderer may be selected only for a TTY.                                    | Current diagnostics                                                 |
| `plain`, `github-actions` | Existing human renderers. `reporting.console` remains a compatible configuration source.                                                                         | Current diagnostics                                                 |
| `json`                    | Exactly one compact document at exit. Long-lived commands (`serve`, Storybook `driver` and `server`) print one readiness document instead and nothing afterward. | Empty, except for failures before mode resolution or loss of stdout |
| `ndjson`                  | Compact LF-terminated records ending with exactly one terminal record, identical to the `json` document. One-shot commands emit one record.                      | Same as `json`                                                      |

`--events <milestones|progress|all>` applies to `ndjson`; the default is
`milestones`:

- `milestones`: run start (run ID and artifact root), service and phase scope
  boundaries, readiness and service failures, warning and error diagnostics,
  and non-passing test results up to a server-side cap, followed by a
  suppressed-count record.
- `progress`: adds every test start and result, worker scopes, and artifacts.
- `all`: a bounded projection of every canonical event, including command
  output.

Records project the canonical events; they are not a second event model. Each
record carries the schema version, record type, run ID, arrival sequence, and
the source `eventId` or `failureId` that locates the complete record in
`events.jsonl` or `run.json`. Truncate text with explicit omission markers.
Stacks and command output stay in artifacts except at `all`.

The run summary contains status, counts, duration, endpoint and renderer
context, and bounded problem lists: test ID, title, status, failure ID, and a
short message or reason; infrastructure, cleanup, and reporting failures;
unfinished selected work; and deduplicated skip or unsupported reasons. It also
includes omission counts and absolute paths to `run.json`, `events.jsonl`,
`junit.xml`, and the command-log directory. It never inlines the complete
result. Proposed initial limits are 10 problems, 500 characters per message,
and 4 KiB per document; ratify them in M0 and enforce them in tests.

Usage, configuration, unknown-target, busy, attach-only, unsupported, and
internal failures produce a structured `error` record with a stable code,
message, and optional hint. Resolve the reporter mode before command parsing
and override Commander's exit and output handling so parse errors cannot
corrupt stdout. Preserve current exit codes: 0 for passed or optional skipped
runs and 1 otherwise. Structured status is authoritative; change exit codes
only after a separate compatibility review.

Write UTF-8 without a BOM and use LF line endings on every OS, including
Windows consoles and PowerShell pipelines. Apply existing redaction before
rendering. If the consumer closes stdout, stop presenting and record a
reporting diagnostic instead of a test or infrastructure failure. The journal
and result files remain complete. Flush before exit. SIGINT and SIGTERM produce
a terminal record with `cancelled` or `incomplete` status.

### Ownership and delegation

| Owner              | Responsibility                                                                                                                                                                                                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop-driver     | Lowest shared CLI primitives: mode resolution, compact framing, error records and codes, and compact projection of driver operation results, exported through an explicit subpath rather than a barrel.                                                                                                                                                                 |
| desktop-test       | Separate `DesktopRunReporter` state reduction from presentation behind a renderer interface. Implement `plain`, `github-actions`, `json`, and `ndjson` renderers plus run-summary and record projections, using Zod schemas and generated JSON Schema.                                                                                                                  |
| storybook-desktop  | Adopt the global option and renderers. Have commands (`manifest`, `instance`, `test`, `smoke`, `build-driver`) return typed results for the renderer instead of writing ad hoc prose or indented JSON. Rename the Node runner option to `--test-reporter`. For one deprecation cycle, accept `--reporter spec\|tap\|dot` with a warning; the value sets do not overlap. |
| desktop-driver-mcp | Return structured tool results directly and never parse CLI output. When an operation reports progress, reuse the milestone record shape.                                                                                                                                                                                                                               |

Only the owning collector renders. Delegated producers keep emitting events and
ignore the reporter mode for presentation, so nested CLIs never render twice.
Their compatibility record (`{ runId, delegated, exitCode }`) remains a
captured output event.

Renderers only present output. They cannot change status, drop journal
records, or block producers. Keep the existing bounded presentation queue. A
later interactive renderer belongs behind this seam: live progress, collapsed
passing tests, and color only on a TTY when `NO_COLOR` is unset. It requires no
collector or result changes.

### Compatibility and agent guidance

`desktop-test --json` will print the bounded summary, with a link to
`run.json`, instead of the complete result. In this repository, only the
delegated desktop-test contract and the `serve --json` documentation consume
the current output. The package is published, so describe the change in its
changeset and update `desktop-test.commands` and `desktop-test.reporting`.

Under `auto`, the driver CLI keeps indented JSON until a documented breaking
change introduces a human renderer. `--json` provides compact output
immediately. `--list` output follows the selected mode and remains indented
JSON under `auto`.

Update the desktop-testing and Storybook development skills, plus package
AGENTS and README entry points. Direct agents to use `--json` or
`DESKTOP_REPORTER=json` and to read artifacts from the returned paths only when
needed.

## 6. Generic applications and package ownership

Do not rename the package or replace its existing endpoint contract merely to
generalize it. Separate OS/provider identity from optional runtime metadata;
keep current endpoint/renderer capabilities as compatibility aliases. Additive
metadata must not silently change FDR1 hello names.

Use native automation ID, role, name, text, and ancestor/window scope;
`testId` remains a compatible alias. Expose native roles when normalization
would lose useful distinctions. Generic readiness is an exact live window
and an optional native predicate, not React or Storybook readiness.

Acquire only a registered application with an explicit, unambiguous primary
window policy. After acquisition, follow verified process/window identity
through title changes. Cross-process popups require a declared, verified
ownership relationship; generic support does not authorize system dialogs or
arbitrary desktop discovery.

Prove the architecture before PR with a small AppKit fixture and a plain native
Win32 fixture without React Native. This establishes a bounded supported
surface, not universal Electron, WebView, WinUI, WPF, or custom-canvas coverage.

| Owner                                    | Planned responsibility                                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop-driver                           | Shared contracts/executors, sessions, observation/ref caches, clients, native capabilities, artifacts, foundational journal, CLI output primitives.                 |
| desktop-driver-mcp, proposed new package | Official-SDK stdio adapter, discovery, progress/cancellation, bounded resources/images; no lifecycle authority.                                                     |
| desktop-test                             | Trusted descriptors/grants, installed targets, ownership ledger, claims, lease production, stop/recovery, aggregate outcomes, reporter renderers and run summaries. |
| storybook-desktop                        | Optional context/catalog adapter, readiness, serialized programmatic navigation, consumer CLI integration and reporter-mode adoption.                               |
| storybook-desktop-runtime                | Change only if authenticated context freshness requires it; do not move native authority into the app.                                                              |

Source ownership follows [contributing](contributing.md),
`@fluentui-react-native/desktop-test/references/contributing.md`, and
`@fluentui-react-native/storybook-desktop/references/contributing.md`.

## 7. Windows is a required implementation, not an adapter-only port

The [Windows provider](../native/windows/README.md) is shared, but Windows
Fabric and Win32 Paper retain distinct app/runtime behavior and qualification.

| Work area                | Source owner                                                            | Remaining evidence                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incremental UIA reads    | `native/windows/src/automation.cpp` and `native/windows/src/driver.cpp` | Measured and deferred (see Windows progress). Budgets must apply before subtree-wide caching: the bounded walk still caches the whole subtree before it fails `tree-too-large`, and `find` shares the 5,000-node cap. Large trees must return honest partial results, and incomplete searches must never authorize unique mutation.                                                                   |
| Identity and reclamation | UIA records, window/process records, SessionManager                     | Windows implemented ([contract](../native/windows/README.md#element-identity-and-retention)). Remaining: macOS parity (it keeps a hard 10,000-record fail-closed cap and a process check, with no fingerprint or eviction), PID reuse against a real application, and a retention plateau measured on a real React Native session.                                                                    |
| Actions and settlement   | UIA mutation worker and FDR1 dispatch                                   | Windows implemented ([contract](../native/windows/README.md#unsettled-mutations)) and qualified against the stuck and hung Win32 fixture. Remaining: quarantine persistence and the trusted `recover` operation (M2), re-observing application effects after a late completion, a genuinely hung React Native app, and macOS adoption of the codes and the provider-timeout rule.                     |
| Input authority          | `native/windows/src/input.cpp` and application activation               | Windows implemented ([contract](../native/windows/README.md#input-authority)), and the Win32 Paper smoke passed physical pointer and keyboard actions. Remaining: live lock, RDP disconnect, and elevation transitions (the self-test injects them), a `uiAccess` decision, delivery evidence for `SendInput` beyond its return value, and foreground matching that is finer than the owning process. |
| Events                   | UIA MTA worker and bounded event dispatch                               | Windows implemented with `WinEvent` hooks ([contract](../native/windows/README.md#window-events-and-identity)): callbacks enqueue on a dedicated thread without provider calls, overflow is bounded, and `IsWindow` polling is the fallback. Remaining: event delivery across integrity levels, same-class handle recycling whose destroy event is lost, and UIA structure-change events (not used).  |
| Application ownership    | `native/windows/src/application.cpp` and trusted supervisor             | Not started: packaged AUMID and unpackaged executable identity under duplicate or changing titles, ACL validation, stale claims, and Job Object restrictions. The fixture has only a lifetime watchdog.                                                                                                                                                                                               |
| Popups and islands       | UIA traversal and window ownership                                      | Owned dialogs verified: the fixture rejects owner clicks and publishes destroy events, and a real native Callout test passed on Win32 Paper. Remaining: menu popups, which need activation to open and so are unqualified, and Fabric islands.                                                                                                                                                        |
| Geometry and capture     | Windows geometry/capture modules                                        | Window and element PNG capture is verified on the fixture only. Remaining: 100/150/200% and mixed-DPI monitor moves, negative origins, crop alignment, minimized windows, and cancellation during capture.                                                                                                                                                                                            |

Keep UIA operations on correctly initialized/marshaled COM workers. Document
the bounded-call settlement strategy explicitly; abandoning a thread and
returning a timeout is not an acceptable guarantee.

**Windows progress:** the helper now implements the settlement, identity,
input-authority, and event work areas above. Each has a contract in the
[Windows provider](../native/windows/README.md) and checks in its native
self-test. A test-only plain Win32 fixture (`fixtures/win32`, repository only)
exercises the helper against a real application through the opt-in
`win32Fixture` native contract: observation, native and accessibility actions,
hit testing, PNG capture, a title change, an owned dialog, a hung application,
a stuck provider call, trees near and beyond the node cap, and 500 repeated
cycles. A focused Win32 Paper smoke (176 stories and 5 authored tests,
including the native Callout popup) passed against the same helper source.
Section 11 records what did not run.

Incremental UIA reads were measured and deliberately not started. UIA caches a
subtree at about 0.4 ms per node, so a 4,900-node tree reads in about 2
seconds and a 10,000-node tree fails after about 4 seconds. A root `find`
shares the 5,000-node cap. Bounding the work before it is done needs per-level
or budgeted reads with explicit completeness fields, and a single very wide
level needs its own budget because a children-scope request returns every
sibling. That is an FDR1 protocol change with Node types and fake-host
support, so it belongs to M3 and must land with the macOS provider rather than
as a Windows-only change.

Operation-time permission and capability changes must be surfaced truthfully
even if session-start feature negotiation previously succeeded. The Windows
input authority rechecks session, foreground, and integrity for every physical
operation; the macOS provider must show the same for its permissions.

## 8. Dependency-ordered work on this branch

All milestones remain open. No separate tracking issue was created by this
planning task. Existing release/qualification work under #4345 remains
applicable; this plan does not imply that broader release gates are closed.

### M0. Freeze contracts and approve the changed trust boundary

**Depends on:** nothing.

Specify operation/result schemas, compatibility, ownership/grants on all
routes, ref/sample/region lifetimes, native budgets, privacy, and quarantined
mutation recovery. Specify the reporter-mode schemas, limits, error codes, and
CLI compatibility in section 5. Investigate the source-inspected timeout and
identity risks with targeted native reproductions before claiming they are
fixed.

**Complete when:** the contract and security design are reviewed, adversarial
failure cases are defined, and both provider implementations have an explicit
settlement/unsupported strategy. Approval gates new authority and persistence;
it is not a request to reopen the architectural choice of MCP.

### M1. Build the portable operation core and correctness contracts

**Depends on:** M0.

Implement one validated catalog, service executors, typed client, supported-state
results, strict selection, queues/deadlines, and a bounded canonical journal.
Add realistic fake-host states and model timeout, truncation, stale refs,
duplicate selectors, request correlation, and indeterminate effects.

**Settlement is the first implementation dependency, not late hardening:**
correct the existing Node timeout boundary and both providers' ambiguous
mutation handling before enabling new controllers or action operations.
Exercise late native effects and target-wide exclusion in matching-OS tests.
If a provider cannot establish settlement, implement an explicit fail-closed
outcome rather than advancing its queue.

**Progress:** the Node timeout wrapper now aborts at the deadline but does not
return until the host operation promise settles. This prevents a Node-level
timeout from advancing its queues early. The Windows provider fails closed on
unsettled UIA mutations (section 7), including a mutation whose provider call
times out. The Win32 fixture contract verifies that a
stuck call lands exactly once and that later mutations stay refused afterward.
The macOS provider's ambiguous AX mutation handling must adopt the same
`mutation-indeterminate` and `target-quarantined` codes and the same timeout
rule from the [native protocol](../native/PROTOCOL.md). Provider late-effect
behavior is otherwise unqualified against real hung applications.
Portable story-plan reads and actions now reject selectors that match multiple
elements; explicit `count` and `exists` expectations remain multi-match-safe.

The journal records versioned operations, explicit checks, outcomes, and
provenance, redacted **before persistence**. Do not record passwords or default
to plaintext typed input. A model-supplied flag cannot relax operator privacy
policy. UI text, screenshots, and logs remain sensitive artifacts with
collection/retention limits.

**Complete when:** the shared operation corpus passes without WDIO or
Storybook in execution, and existing API behavior is preserved or has an
explicit versioned migration. The existing native mutation paths satisfy the
settlement/exclusion contract or remain disabled with explicit limitations.
Serialization supports future reuse without introducing a second test DSL.

### MR. Deliver reporter modes and structured CLI output

**Depends on:** M0. This track is independent of native work and can land
before M1 completes. It provides immediate agent benefit for lifecycle and
suite runs.

Implement section 5 in desktop-driver, desktop-test, and storybook-desktop.
Update the delegated desktop-test contract that asserts the current JSON
record, plus the commands and reporting references.

**Progress:** shared mode/framing helpers, bounded JSON/NDJSON reports,
delegated setting propagation, structured CLI errors, and Storybook service
readiness records are implemented. Mac-host package checks pass, including
synthetic 10,000-test, 1,000-failure, and 1 MiB-message coverage. Windows
pipe qualification found and fixed two defects: an empty `DESKTOP_REPORTER`
or `DESKTOP_EVENTS` (common in CI templates) was rejected instead of treated
as unset, and a consumer that closed stdout crashed the one-shot CLI entry
points with an unhandled `EPIPE`. MR remains open for GitHub Actions
rendering, interruption on Windows (signals cannot be delivered to a child
there; it needs console Ctrl+C), and any remaining exit-path gaps.

**Complete when:** every reporter mode is tested on every exit path: pass,
test failure, infrastructure failure, usage or configuration error,
interruption, and closed stdout. Structured stdout must parse as exactly one
document or as valid NDJSON ending in one terminal record, and structured
stderr must be empty on normal paths. Documents and default streams stay within
limits for synthetic runs with at least 10,000 tests, 1,000 failures, and
1 MiB messages. Secrets remain redacted, and delegated runs render once.
Verify the same behavior on macOS and Windows, including PowerShell parsing
and GitHub Actions rendering.

### M2. Establish trusted sessions and ownership-safe recovery

**Depends on:** M0, M1.

Implement descriptors/grants, cross-service target claims, controller leases,
idle/disconnect behavior, exact ownership ledgers, status/stop/recovery, and
launch-path lease creation. Coordinate optional Storybook programmatic
mutations with the controller queue; detect human/out-of-band context changes
through authoritative revalidation.

Cover every story-mutating entry point, including upstream MCP selection and
runtime prepare messages, not only the new driver tool. If upstream selection
cannot honor controller authority, expose documentation-only behavior while
driver control is active rather than retaining a bypass.

**Complete when:** agent/WDIO contention, all-route authorization, stale-owner
recovery, reconnect, supervisor/helper/app crashes, quarantine persistence, and
attached-app preservation pass. No cleanup broadens authority or silently
replays work.

### M3. Implement bounded native observations and identities on both OSes

**Depends on:** M1, M2.

Update [FDR1 schema and protocol](../native/PROTOCOL.md), Node host types, fake
host, and both providers together. Add budgeted traversal, reference release,
window/context scope, action descriptors, completeness, and bounded event
tails. Negotiate additive features and reject incompatible helpers.

**Progress:** the Windows provider already bounds identity and retention
without a protocol change. Element ids are never reused, every action
revalidates a fingerprint, and a 20,000-record LRU caps memory
([contract](../native/windows/README.md#element-identity-and-retention)). On the
Win32 fixture, 500 observation, action, and popup cycles keep about 20 retained
elements and grow the working set by under 8 MB after the first 100 cycles; no
longer run was recorded. The wire-level work
(budgeted traversal, completeness, explicit release, window scope, delta bases)
has not started on either OS, and no real React Native session has been
measured for a plateau.

**Complete when:** native large-tree, duplicate, replacement, pagination/delta,
and repeated-context tests pass; no new bounded request uses a full-tree
fallback. Retained memory reaches a documented plateau rather than growing
with every observation.

### M4. Complete action fidelity, settlement, waits, and capture

**Depends on:** M1, M2, M3.

Implement explicit semantic/physical actions, AX action tickets, UIA pattern
mappings, authoritative check/wait batching, per-operation input checks, and
capture provenance/previews. Extend M1's settlement guarantees to every new
action; no new path may bypass target-wide exclusion or outcome recording.

**Complete when:** per-target quarantine survives transport loss, no later
operation overtakes unsettled work, unsupported controls remain honest, and
physical versus semantic evidence is distinguishable on both OSes.

### M5. Deliver MCP and thin compatibility clients

**Depends on:** M1, M2, M3, M4, MR. Transport prototypes may start after
M1/M2, but native feature enablement and milestone completion require M3/M4.

Add the optional MCP package, root TypeScript project reference, packaging and
age-policy-compliant dependencies. Implement the small tool set, authenticated
discovery, progress/cancellation, bounded resources, and explicit image
requests. Route CLI and programmatic operations through the same contract,
and render CLI results through the MR reporter modes.
Fix CLI attach handling without adding a separate CLI daemon.

**Complete when:** the same requests produce equivalent outcomes through MCP,
CLI, and typed clients; actual MCP clients exercise initialize/discover/call,
progress, cancellation, reconnect, and resource/image fallback. A generic
registered app works with Storybook absent.

### M6. Finish Windows and qualify the final branch revision

**Depends on:** M2, M3, M4, M5, MR.

Complete the Windows work in section 7 on this branch, add the two generic
native fixtures, and qualify each row of the platform matrix below. Rerun
affected macOS lanes after Windows-driven changes to shared contracts.

Update the driver architecture/service/protocol/security/provider references,
downstream lifecycle references, short agent instructions, and consumer maps.
Document exact supported scope and recovery, not just happy-path commands.

**Progress:** the plain Win32 fixture and its opt-in contract exist, and the
Windows provider contract, protocol notes, and fixture documentation are
current. Section 11 lists the Windows evidence. The AppKit fixture and the
Windows Fabric, DPI, live-transition, and menu-popup lanes remain open.

**Complete when:** all mandatory native/consumer lanes and efficiency gates
have evidence at the final revision, implementation changesets are present,
and the final clean-cache repository aggregate passes. Only then prepare/push
the PR; a hosted capability skip is not completion.

## 9. Qualification and efficiency gates

| Lane                                       | Required scope                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| macOS arm64 helper and AppKit fixture      | Native contracts; generic attach/read/action/capture; privacy loss, exact ownership, duplicate actions, refs and large trees.  |
| RN macOS Fabric                            | Affected Storybook and legacy native lanes; popup/state/input/evidence and MCP loop.                                           |
| RN macOS Paper                             | Attach/observe/act plus provider action-label/ticket differences; do not infer coverage from Fabric.                           |
| Windows x64 helper and plain Win32 fixture | Native contracts; generic app semantics; hung providers, ownership/ACLs/Job restrictions, lock/RDP/integrity, DPI and capture. |
| RN Windows Fabric                          | Packaged application identity and real action/state/popup/capture flows.                                                       |
| RN Win32 Paper                             | Unpackaged REX identity and the same required behaviors, independently qualified.                                              |

Use adversarial tests for incomplete uniqueness, indistinguishable
replacement, expired delta bases, event gaps, unknown outcomes, crashed
supervisors, and long-session memory. Test multiple MCP clients and adapters
contending for one target. Full desktop observer sessions are not part of this
branch.

Build the test-only AppKit/Win32 fixtures only through opt-in native contracts
into the external native cache; do not publish them or add automatic
install-time builds. Include standard controls, menus, a modal/owned popup,
title changes, and a tree of at least 10,000 nodes. Run at least 500 repeated
observation/action/context-change cycles for retention evidence. Uncatchable
supervisor-death tests must verify explicit incomplete status and subsequent
ownership-safe recovery, not claim an unimplemented immediate watchdog.

The Windows fixture (`fixtures/win32`, repository only) covers an owned popup,
title changes, 4,900- and 10,000-node trees, and 500 cycles. Its menu bar
exists, but opening a menu popup needs activation and is not exercised. The
AppKit fixture does not exist yet.

**Implementation validation, not commands executed for this plan:**

- Run focused tests while iterating, then each changed package's declared
  `yarn format`, `yarn lint`, `yarn build`, and `yarn test`.
- On macOS, run the driver native contract with
  `FURN_NATIVE_DRIVER_TEST=1 yarn test --runInBand`; include the configured
  stable signing identity for repeatable permission qualification.
- On Windows, set `$env:FURN_NATIVE_DRIVER_TEST = '1'` before
  `yarn test --runInBand`, then restore the prior environment setting.
- Run affected owning-app suites and Storybook smoke on each endpoint using
  its documented configuration. Preserve bundle/prep/build ordering; do not
  invent successful Windows coverage from JavaScript or fake-host tests.
- Add the required implementation changesets and publishing/package inventory
  checks for changed/new packages. Finish the final code/configuration revision
  with one `yarn clean-lage-cache` followed by `yarn lage buildci`.

Empty, all-skipped, incomplete, timed-out, or unsupported mandatory lanes block
the PR. Performance must not improve by suppressing evidence or reducing the
assertions being proved.

### Benchmark design

Use reproducible tasks with identical start state and an independently
verified outcome: toggle/check, text entry/clear, occlusion diagnosis,
popup/window navigation, stale-reference recovery, and non-RN interaction.
Include a large/virtualized tree and repeated preview changes.

Compare current warm programmatic sessions as well as cold CLI/callback
workflows with new MCP and CLI clients. A permitted screenshot/System Events
baseline and a pinned agent-device macOS run are optional comparators, not
prerequisites and not Windows evidence.

Measure tool discovery/schema/instruction tokens, text/image tokens, model
turns, tool calls, retries/errors, end-to-end p50/p95, native calls/visited
nodes/time, and retained Node/helper memory. Report cold and warm separately,
by OS/runtime and success/failure path. Keep model, prompt, UI fixture, and
outcome constant within comparisons; use enough repetitions to report
uncertainty rather than claiming tail reliability from a handful of runs.

**Proposed acceptance targets:** at least 70% fewer observation tokens than
equivalent complete current observations; one tool call for an ordinary
action/check/observe loop; lower whole-task context after tool-schema cost;
bounded steady-state memory; no regression in correctness or comparable warm
latency. Start with an 8 KiB serialized tool-definition budget, then ratify it
against actual SDK/client output in M0/M5 and enforce the agreed ceiling in CI.
Establish measured baselines before fixing latency ceilings; an arbitrary
300 ms target or a small-sample p95 is not a platform qualification gate.

Do not compare a truncated new view with a complete old view, count caches as
fresh state, or promote the research's synthetic compact outline into a
measured product result.

**Reporter modes:** compare the whole task of running a suite and diagnosing
one failure under `plain`, `json`, and `ndjson`, counting both output streams
and any artifact reads. Proposed targets: `json` documents stay within the
ratified limit regardless of suite size; the default `ndjson` record count does
not grow with passing tests; structured modes write nothing to stderr on normal
paths; and every reported problem resolves to its complete journal or result
record. Measure live output; the figures in section 5 are offline projections.

## 10. Bounded follow-on work

These features are deliberately outside this branch, not excuses to defer its
core contracts:

- **Recording/replay and WDIO export:** build on the canonical journal/schema.
  Re-resolve approved selectors, preserve explicit assertions, reject
  ambiguous/indeterminate records, and use a fixed runner plus serialized data.
  No source interpolation, selector healing, or invented assertions. Story
  callback export belongs to Storybook integration. Complete when portable
  recordings reproduce verified outcomes without broadening authority.
- **Authorized observers and remote transports:** require a separate authority
  design. Do not create competing native sessions or expose the local listener
  through a tunnel. Complete when their independent trust and lifecycle
  contracts are qualified.
- **Additional app frameworks/process families:** extend the proven generic
  contract with toolkit-specific evidence. Electron/WebViews, custom-drawn
  controls, system dialogs, and arbitrary cross-app automation are not implied
  by the AppKit/Win32 fixtures.
- **Distribution and visual testing:** notarized/prebuilt helpers, Intel macOS,
  visual baselines, and richer RN profiling/log integrations remain separate
  product/release work. Add them only with their own qualification and privacy
  rules.

## 11. Review and validation record

Independent architecture proposals were produced by **GPT Astra 6** and
**Claude Opus 5.5**, both requested with **max reasoning** and **long context**.
Each reviewed the other's proposal before this consolidation. Both rounds
completed. This is the synthesized plan, not a claim that both models executed
or qualified it.

| Review topic              | Resolution incorporated                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MCP packaging and schemas | Both converged on a separate optional adapter, the official SDK, and strict Zod schemas; rejected an in-house schema/MCP implementation.                                             |
| Bounded observations      | Removed the proposed silent full-tree fallback; incomplete resolution cannot prove uniqueness or authorize mutation.                                                                 |
| Identity                  | Removed fingerprints/indices as identity proofs; separated sample IDs from lifetime epochs and required provider replacement evidence.                                               |
| Uncertain mutations       | Replaced element-only quarantine with target-wide exclusion and moved settlement corrections to the first implementation milestone.                                                  |
| Authority                 | Required route-wide protection, a trusted WDIO grant path, and Storybook mutation coordination; deferred observer sessions.                                                          |
| Scope                     | Kept a canonical journal now, deferred recording/export, but retained non-RN AppKit/Win32 proof before PR.                                                                           |
| Lifecycle mechanics       | Distinguished adapter credentials from supervisor inheritance, required actual Windows ACL machinery, limited jobs to helper-created launches, and rejected an unqualified watchdog. |

Where the reviews differed, this plan selects the stricter boundary: helper
termination alone cannot clear mutation uncertainty; a user-directory location
does not substitute for Windows ACL validation. It does not adopt fixed
historical smoke counts as forever-valid gates; preserve the actual selected
suite and its assertions at the tested revision.

Remaining uncertainty is empirical, not an undecided architecture: native
replacement identity, late provider effects, Windows job/session restrictions,
bounded UIA traversal cost, and MCP-client resource behavior. M0 and the native
qualification lanes must resolve or explicitly constrain those cases.

The user asked for section 5 and track MR after the reciprocal review. They
derive from source inspection of the three CLIs and the desktop-test collector,
plus an offline token projection of 80 recorded runs. Neither model reviewed
them. M0 must review their contracts and limits with the rest of the design.

Reporter implementation checks on macOS:

- The three owning package format, lint, build, and full test suites **passed**:
  `yarn workspace @fluentui-react-native/desktop-driver format`, `lint`,
  `build`, and `test`; the same four scripts for `desktop-test` and
  `storybook-desktop`.
- After the selector and timeout fixes, the desktop-driver full suite passed
  (84 passed, 3 skipped); the Storybook diagnostics suite passed (10 tests),
  and desktop-test's full suite passed (32 tests).
- `FURN_NATIVE_DRIVER_TEST=1 yarn workspace @fluentui-react-native/desktop-driver test --runInBand`
  **passed** (84 passed, 2 skipped); Jest printed an open-handle warning after
  completing.
- `yarn oxfmt --check`, `yarn check-agent-instructions`, `git diff --check`,
  `yarn clean-lage-cache`, and `yarn lage buildci` **passed**. The clean-cache
  aggregate completed 176 tasks with 0 failed, skipped, pending, or aborted.

The synthetic reporter tests cover 10,000 selected tests, 1,000 failures, and
1 MiB event text. On macOS, Windows/PowerShell, Windows native contracts, and
both Windows Storybook renderers were **not run**; the Windows block below
records what ran afterward. Real-app smoke on macOS, MCP clients, and
efficiency benchmarks are **not run**. Native macOS application smoke and the
full plan's security/ownership qualification are also **not run**. M1's Node
timeout boundary and selector uniqueness are partial implementations only;
provider late-effect behavior is unresolved. M0-M6 and the final branch
qualification remain open.

Windows implementation checks (Windows 11, PowerShell 7, Node 26):

- The three owning package format, lint, build, and full test suites **passed**.
  The checks found and fixed one test defect: the `desktop-test` reporting
  results test hardcoded a POSIX temporary path.
- A throwaway harness drove all three CLIs over real operating-system pipes
  (14 of 15 expectations **passed**). It found and the branch now fixes two
  defects: an empty `DESKTOP_REPORTER` or `DESKTOP_EVENTS` was rejected instead
  of treated as unset, and a consumer closing stdout crashed the one-shot CLIs
  with an unhandled `EPIPE`. Both have regression tests, and the closed-stdout
  test was verified to fail without the guard. The one remaining harness
  mismatch is `--reporter bogus`, which Commander rejects before mode
  resolution, as the contract allows; it is not a defect.
- Helper checks on Windows 11 x64 in an RDP session (MSBuild toolset v145,
  Windows SDK 10.0.26100). The helper built from source with
  `node config/cli.cjs build-driver --platform windows` and no compiler
  warnings, and `furn-desktop-driver-host.exe --self-test` **passed** 453 of 453
  checks. They cover settlement, element identity, retention, input authority
  through injected state, and event bookkeeping.
- `FURN_NATIVE_DRIVER_TEST=1 yarn test --runInBand` in the driver package
  **passed** (17 suites; 97 passed, 2 skipped macOS-only tests). That includes
  the seven-scenario `win32Fixture` contract, which takes about 66 seconds:
  observation, actions, hit testing, and PNG capture; a title change; an owned
  popup; a hung application; a stuck provider call and its quarantine; trees of
  4,900 and 10,000 nodes; and 500 repeated cycles. Across those cycles retained
  elements stayed at 20, working set moved from 22.5 to 23.6 MB, and private
  bytes from 5.0 to 6.2 MB. Without the variable the same suites **passed** or
  skipped (89 passed, 10 skipped).
- The focused Win32 Paper smoke **passed**: with `STORYBOOK_SMOKE_STORY`
  `{components-button--default,components-checkbox--default,components-input--default,native-callout--default}`
  selecting the authored tests,
  `yarn storybook smoke --win32 --mode stories-and-tests` selected 181 items and
  passed all 181. That is the full 176-story catalog render plus 5 authored tests (native
  pointer activation, enabled-button semantics, checkbox toggle, keyboard input
  and clear, and native-callout open, light-dismiss, and recreate). It ran
  against the helper built from the final C++ sources. The run records no helper
  statistics, so the UI Automation tree size of a real application is not
  measured.
- The `desktop-test` owned-service contract's temporary-directory cleanup hit a
  transient Windows `EPERM` under `lage buildci` parallel load; it now retries
  the removal. One `storybook-desktop` `sourceConfig` test also timed out its
  10 s child process once under the same load (244 ms standalone, no diff in
  that area); a re-run passed without changes.
- `yarn oxfmt --check`, `yarn check-agent-instructions`, and `git diff --check`
  **passed**. `yarn clean-lage-cache` then `yarn lage buildci` first failed one
  storybook-desktop test (the known timing-sensitive flake recorded above, not
  reproduced) and passed on the immediate rerun: 176 tasks, 8 run and 168
  replayed from cache, 0 failed. The final `closeWindow` reorder was validated
  by the rebuilt helper's self-test and native contract, not a repeat smoke.
- The direct `yarn markdown-link-check -c .github/markdown-link-check-config.json`
  over this revision's changed Markdown files **passed**. `yarn lage test-links`
  itself **failed** on this Windows machine for 71 packages, including
  untouched files, while the direct invocation of the same checker passes for
  those files. Treat the Windows lage worker as unsupported until it is fixed;
  its result says nothing about the links.

Windows items **not run**:

- GitHub Actions rendering, and signal or console Ctrl+C interruption (a signal
  cannot be delivered to a child process on Windows).
- The Windows Fabric renderer, which needs a native MSBuild and NuGet build and
  a registered packaged application, and the Win32 Paper authored tests for
  stories outside the four above.
- Qualification against a genuinely hung React Native application, and the
  retention plateau of a real session.
- Live session lock, RDP disconnect, and elevation transitions (the self-test
  injects them), and delivery of events across integrity levels.
- DPI scaling other than the machine's current setting, mixed-DPI moves, and
  negative monitor origins.
- Menu popups, which need activation to open.

Deferred Windows work, listed in section 7: incremental UIA reads, Job Object
and ACL application ownership, and quarantine persistence with the trusted
`recover` operation. Also open: the `window-closed` publication writes to
stdout from the hook thread, so a Node side that stops draining stdout can stall
event processing; move the write to a queue drained off the hook thread.

The macOS provider has not adopted the `mutation-indeterminate` and
`target-quarantined` codes or the rule that a provider timeout on a mutation is
indeterminate. It also needs a parity check against Windows element reclamation
and fingerprint revalidation, the hit-test ownership check, and the
`closeWindow` event semantics. After pulling this branch, macOS should rebuild
the helper, re-run the driver native contract and the three packages' tests, and
adopt those behaviors, because the shared reporter, the desktop-test and
Storybook CLI entry points, and `NativeDesktopHost` changed.

Read [architecture](architecture.md), [service integration](service.md),
[security](security.md), [contributing](contributing.md),
[macOS provider](../native/macos/README.md),
[Windows provider](../native/windows/README.md), and the
[native protocol](../native/PROTOCOL.md) when implementing this plan.
