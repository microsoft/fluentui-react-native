# Desktop automation: architecture and next work

**Recommendation:** strengthen `desktop-test` into the shared, application-neutral
workload host. Keep `desktop-driver` authoritative for native execution and keep
MCP a client. Introduce typed, statically registered resource and workload
contributions inside the existing packages, rather than putting orchestration
inside the driver or MCP, or creating a plugin framework now.

Keep all five package names in this PR. When actual lifecycle and test-run tools
land, generalize the adapter to `@fluentui-react-native/desktop-mcp`, retaining a
driver-only mode and compatibility for existing users. A separate coordinator
package is a later extraction decision, not a prerequisite for coordination.

**Status:** Approach A approved by the owner; the P1/P2 foundation and bounded
P3 safeguards are implemented, with qualification in progress.
The architecture review below evaluates #4434 at
`59dad9515667eb41a9b11de1453b6432ed2bf57f`. Source/test inspection was completed;
tests, builds, app launches, Metro evaluation, and native qualification were
**not run during the review**. Subsequent implementation and qualification
status live in the packages' `references/current-status.md` files, linked from
their READMEs. Performance and reliability comparisons below are architectural
inferences, not measurements.

| PR item | Delivered in this update                                                                                                                                                                                                   | Explicitly unfinished                                                                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1      | Serialized MCP lifetime, late-open cleanup, verified authority refresh, failed-delete retention, ambiguous-create fence, no automatic replay                                                                               | Live cross-platform descriptor/lifetime qualification; per-connection attenuated grants and resumable sessions                                                                 |
| P2      | Stable package names/ownership direction, transitional API annotations, corrected incarnation/readiness/topology contracts, launch-mode discovery, package status/measurement ledgers replacing the root capability report | Resource contributions/shared service factory and later management facade remain follow-ups                                                                                    |
| P3      | Failed cleanup retains workload claim; unknown story effects quarantine; protected driver args return unsupported                                                                                                          | Durable recovery is not wired in shipped supervisors; alternate Storybook channel ingress is not exclusively controlled; no lifecycle reuse/handoff/recovery tools are exposed |

P3 is a partial safety foundation, not complete protected orchestration. The
channel API belongs to upstream Storybook and currently lacks an ingress
authority contract; this update does not claim that disabling its MCP endpoint
governs its HTTP/WebSocket mutations. F4 and F5 remain required before that claim.
Native Windows/Win32 and macOS live requalification remains explicit in the
package status tables. The F1-F14 issue bodies below remain the parallelizable
follow-up plan; no issues are created by this implementation.

## 1. Objectives and boundaries

The architecture should support an ordinary installed desktop application without
Storybook, a Storybook application with its additional runtime capabilities,
standalone WDIO suites, Storybook-authored test callbacks, and agent control.
These should share configuration, lifecycle accounting, diagnostics, and
ownership policy without sharing competing native sessions.

Success means:

- One native execution authority per controlled target, with cancellation,
  settlement, reference invalidation, and quarantine preserved.
- One workload resource owner, with explicit owned/borrowed resources and
  cleanup that cannot terminate attached applications or release uncertain claims.
- Optional Storybook integration, not Storybook vocabulary throughout every
  lifecycle interface.
- A bounded, cohesive agent interface that does not require agents to assemble
  shell commands, read generated secrets, or debug several unrelated services.
- Work that can land incrementally, with clear file ownership and matching
  platform evidence at each step.

This is not a proposal for arbitrary executable/plugin discovery, a universal
desktop automation daemon, unrestricted recovery tools, or parallel physical
input on one desktop. A plugin configuration is trusted executable code;
schema validation and child-process separation are not a security sandbox.

## 2. What the branch already gets right

The dependency layering is substantially correct:

```text
desktop-driver-mcp ------> desktop-driver
desktop-test ------------> desktop-driver
storybook-desktop -------> desktop-test + desktop-driver
storybook-desktop-runtime -> React / React Native / Storybook

storybook-desktop <---- authenticated runtime wire protocol ----> app runtime
```

**Observed [E1]:** neither the driver, harness, nor MCP adapter requires a
Storybook/React/React Native dependency. The Storybook integration depends
downward; runtime UI dependencies remain in the on-device package.

**Observed [E2]:** the driver authenticates before request processing and again
before queued dispatch. It reserves targets, queues session commands, serializes
physical input, and waits for native work to settle after timeout rather than
merely racing a promise.

**Observed [E3]:** private connection discovery verifies the native listener
before transmitting a grant, then verifies the service incarnation. MCP resolves
an already-built helper; it does not start the service or compile a helper.

**Observed [E4]:** operation execution depends on `OperationRuntime`, not server
implementation. MCP reuses the driver's registered schemas. Bounded observations,
paging, deltas, sequences, and artifacts already provide a useful low-round-trip
agent interface. The tool-list test is a character-size guard, not a measured
token-cost result.

**Observed [E5]:** the Storybook path has substantive authenticated and correlated
readiness checks, followed by native story-root verification. Preserve these
checks through any refactor.

**Observed [E6]:** reporting already supports a shared collector, bounded
summaries, and explicit incomplete/unsupported results. Do not replace this with
plugin-specific transcripts or another report format.

The problem is therefore not "there is no coordinator." There is a supervisor
already. Its ownership and composition seams need to become explicit and
consistent.

## 3. Where the layering is weak

| Finding                                                                                                                                                                  | Evidence | Architectural consequence                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storybook substitutes a complete CLI lifecycle through `integration.run`. Generic and Storybook paths construct services through different composition paths.            | E7       | Lifecycle policy must be maintained in multiple places. This does not prove two simultaneous owners or duplicate listeners in every integrated run.                        |
| The channel child hosts the Storybook channel and driver; parent readiness uses a generated file. Some guidance describes the parent process instead.                    | E7, E12  | Process residence, ownership, and readiness are conflated. Shared policy can fix this without immediately moving the child in-process.                                     |
| MCP acquisition/deletion/disposal are represented by optional fields, not serialized lifetime transitions. A 401 leaves the cached client intact.                        | E8       | Dispose-during-open, failed deletion, and same-port protected restart need deterministic handling. Multi-target embedders also expose concurrent-open races.               |
| Supervisor cleanup can release the workload claim after shutdown errors or a deadline, while `guard` does not itself await abandoned work.                               | E9       | Stopping the wait is not proof that resources or effects are released. Recovery must remain fenced when cleanup is uncertain.                                              |
| Durable settlement recovery is implemented in the driver but not passed by the shipped supervisor composition paths.                                                     | E10      | Library support is not the same as crash-persistent behavior in `serve --agent`.                                                                                           |
| Workload records contain PID/run ID rather than exact owner identity and a resource ledger. Reporting delegation can imply skipping workload acquisition.                | E9       | Dead-parent detection alone cannot reclaim a workload with surviving children. Reporting delegation is not workload authority.                                             |
| Authenticated Storybook completion does not authorize every mutation entrance. Selection still uses an unauthenticated channel route; args have a separate driver route. | E11      | A protected driver listener does not establish exclusive protected Storybook control. Navigation/args must participate in authority, settlement, and context invalidation. |
| Story providers lack cancellation/lifetime context. Runtime reconnect and delayed-render fencing are incomplete contracts.                                               | E11, E12 | Transport reconnect is not recovered context. Cancellation must not let a delayed old render overwrite a newer selection.                                                  |
| Agent-served and WDIO modes currently exclude one another. Standalone WDIO and authored CSF callbacks use different session ownership models.                            | E13      | Future handoff needs an awaited drain barrier and new grants/sessions, not sharing MCP session IDs or creating sessions in WDIO hooks.                                     |
| Neutral packages remain semantically Storybook-aware; operation incarnation text overstates app-restart behavior.                                                        | E14      | Keep today's deliberate optional story capability, but do not expand domain-specific harness schemas or imply reference continuity through app replacement.                |
| Helper provenance crosses a generated manifest; lease and bridge nonces are reused; helper resolution imports can pull WDIO through the root entry.                      | E12, E15 | Tighten trust handoff and import boundaries rather than assuming a new coordinator fixes them. Costs of the import graph are unmeasured.                                   |
| Target aliases are not necessarily unique across multiple configured apps, and session exclusion is per service.                                                         | E16      | Registered target IDs, verified application identity, and physical input locks serve different purposes. An input mutex is not a cross-service controller claim.           |

Most lifecycle gaps predate this PR. The MCP adapter and composed agent story
operations are new. That distinction should inform merge scope, but it does not
make pre-existing gaps safe for a newly claimed protected orchestration surface.

## 4. Three approaches

### A. Strengthen the existing workload host -- recommended

`desktop-test` remains the composition root. One-shot CI runs and an
operator-started long-lived `serve` host use the same resource accounting.
Storybook contributes resources/context; WDIO contributes a workload runner.
MCP later exposes typed management requests to that host.

```text
trusted consumer config
        |
        v
desktop-test workload host
  |-- resource graph / ownership ledger / readiness / collector
  |-- launch provider
  |-- Metro or other configured services
  |-- optional Storybook channel + context provider
  |-- WDIO / CSF workload adapters
  `-- desktop-driver service
        `-- native session authority / input / refs / settlement

desktop-mcp (later)
  |-- driver client and operation schemas
  `-- desktop-test management client and schemas
```

The channel/driver child can remain a supervised resource initially. A single
resource owner does not require a single process. Long-lived hosting also does
not require a per-user daemon or a new package.

**Reliability:** smallest incremental route because existing authority and
reporting remain intact. Explicit cleanup and reconnect contracts improve the
current failure paths rather than introducing another authority.

**Agent efficiency:** retain bounded UI operations; add workload handles and
bounded results later. Warm resources and handoff can reduce restarts within a
workspace, but a host holding the coarse interactive claim can block another
workspace even while idle. That needs an explicit idle policy.

**Scalability:** good for local workloads and additional static integrations.
Extraction remains possible when there is a real second consumer or incompatible
dependency profile.

**Cost:** moderate follow-up changes to busy integration files; minimal package
churn now. It requires discipline to stop opaque lifecycle takeover.

### B. Extract a dedicated coordinator with typed plugins

Create a real `desktop-host` or `desktop-orchestrator` package by moving the
resource graph, ownership, and management implementation out of `desktop-test`.
The harness becomes a runner adapter; Storybook supplies its own adapter.

```text
consumer composition
        |
        v
desktop-host
  |-- launch / Metro / Storybook resource providers
  |-- WDIO and other workload providers
  `-- driver provider ------> desktop-driver

desktop-test ------> host contracts
storybook-desktop -> host contracts + driver contracts
desktop-mcp -------> host client + driver client
```

This is the user's coordinator/plugin idea with explicit separation of
coordination and native authority. It can be run-scoped or workspace-scoped.
**A coordinator package is not inherently a permanent daemon.**

**Reliability:** clear service graph and recovery ownership, but extraction
introduces new public contracts and migration failure modes before current
ownership is complete. Plugins must not independently reclaim sessions or
declare uncertain cleanup complete.

**Agent efficiency:** potentially the same warm-host interface as A. Package
extraction alone does not reduce tool calls or improve reuse.

**Scalability:** strongest uniform extension boundary if multiple independent
products need orchestration without test-runner dependencies.

**Cost:** high now: moving lifecycle, configuration, reporting, and consumers
risks creating circular dependencies or an empty "contracts" package. Prefer a
later extraction of real code once its seam has been exercised.

**Extraction trigger:** a second independent production consumer of the service
graph, or a demonstrated conflict between lifecycle dependencies and the
harness's WDIO/reporting dependency profile. "We have plugins" is insufficient.

### C. Federated controllers with protocol-first composition

Separate driver, lifecycle, Storybook, and test-run controllers expose verified,
versioned capability endpoints. A trusted workflow client coordinates them
without a global process/resource owner.

```text
MCP / trusted workflow client
  |-- verified driver endpoint ----> native authority
  |-- verified lifecycle endpoint -> app / Metro resource owner
  |-- optional context endpoint ---> Storybook controller
  `-- verified runner endpoint ----> suite execution / reports

controllers share exact claims and explicit settlement/handoff protocols
```

**Reliability:** best deployment isolation, hardest partial-failure model.
Cross-service claims and restart epochs must precede composition; otherwise
client death strands resources and multiple controllers can mutate the same app.

**Agent efficiency:** likely more discovery, coordination, and recovery calls
unless a facade aggregates them. Independent service restarts can be helpful,
but no latency benefit is established.

**Scalability:** strongest fit for independently deployed or non-TypeScript
controllers. It is unnecessary complexity for today's local integrated tools.

**Cost:** high protocol, compatibility, and recovery work. Choose only when
independent deployment is a real requirement.

| Criterion              | A: Existing host                                 | B: Extracted coordinator                            | C: Federation                                  |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------- |
| Near-term reliability  | Best incremental route                           | Good potential; substantial migration               | Hardest recovery model                         |
| Agent efficiency       | Cohesive bounded facade; warm workspace possible | Similar potential; extraction alone adds no benefit | More coordination unless aggregated            |
| Extension growth       | Good for local integrations                      | Best uniform plugin boundary                        | Best independent deployment                    |
| Change/risk in this PR | Lowest                                           | Highest extraction churn                            | High protocol/authority churn                  |
| Storybook-free use     | Natural                                          | Requires a neutral core                             | Natural with optional facets                   |
| Recommendation         | Adopt                                            | Keep as an evidence-triggered extraction            | Defer until deployment requirements justify it |

**Rejected placement:** do not make the MCP adapter itself a supervisor.
Resources would follow MCP client restarts, multiple adapters would compete as
owners, and model-facing code would gain launch/configuration authority.
Similarly, do not move app/Metro/test lifecycle into `desktop-driver` merely
because it already has a listener.

A persistent per-user broker is a separate optional deployment variant, not a
fourth package design. It adds cross-worktree version skew, a wider failure/trust
domain, and macOS responsibility/Windows interactive-session obligations.
Neither reviewer recommends it now.

## 5. Package and API decisions to set in this PR

| Package                     | Keep responsibility                                                                          | Structural decision now                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `desktop-driver`            | Native hosts, targets, sessions, W3C/agent execution, schemas, refs, settlement, quarantine  | Keep name. No lifecycle or Storybook imports. Keep the optional story provider contract deliberately; do not generalize all operations into plugins now. |
| `desktop-test`              | Trusted configuration, workload lifecycle, resources, runner coordination, aggregate reports | Keep name. Declare it the intended resource owner. Consolidate service construction next inside this package.                                            |
| `storybook-desktop`         | Catalog/CSF interpretation, bridge protocol, Storybook context, CLI compatibility            | Keep name. Treat full `run` takeover and domain-specific readiness presentation as transitional.                                                         |
| `storybook-desktop-runtime` | On-device bridge, context marker, theme/chrome, Metro runtime generation                     | Keep name. No Node supervisor or harness dependency in the application bundle.                                                                           |
| `desktop-driver-mcp`        | Verified discovery, connection/session client lifetime, MCP mapping                          | Keep name now. Correct lifetime handling before broadening its tools.                                                                                    |

**No added package or rename in #4434.** This is an explicit structural decision,
not postponing a decision accidentally. New subpaths must contain real
implementation/contracts; do not add placeholder packages or re-export-only
layers.

Next, consolidate the existing service construction into a real
`desktop-test/src/driverService.ts` module used by both generic supervision and
the Storybook child. It owns consistent helper policy, authority/recovery
configuration, descriptor publication, and settled shutdown. Preserve public
compatibility entry points while marking transitional seams.

Avoid enlarging the new stable export surface for implementation-only publication
helpers. An explicit `desktop-driver/native` subpath is a useful optional
in-PR improvement so helper resolution/verification does not require the root
entry and its WDIO imports. Do not remove existing public exports casually.

### Story operations

`stories`, `story`, and MCP `desktop_story` are deliberate new contracts in this
PR; only the older W3C story routes are compatibility surfaces.

Keep operation queueing, budgets, outcomes, native marker verification, and
preview invalidation in the driver. Keep catalog/CSF mapping and channel
navigation in `storybook-desktop`. Pass operations only catalog fields they
actually need, not source/test metadata.

Add local cancellation/lifetime context separately from serializable inputs.
Version the producer/verifier marker contract and test actual runtime production
against the verifier, without introducing Node imports into the runtime.

A startup-registered domain extension could preserve one queue and schema source;
it is not intrinsically invalid. However, a generic `ContextProvider` or
operation-plugin framework is premature without a second concrete use.

### Generalized MCP

**Yes, generalize the product surface later; no, do not generalize its authority.**
The eventual adapter should expose driver operations plus supervisor-declared
status, suite execution/cancellation, and persisted result retrieval.

Lifecycle/run schemas and clients belong to a real `desktop-test/control`
surface; report schemas stay with the harness. Driver reporter primitives remain
shared framing utilities, not the home of test-run semantics.

At that implementation milestone, rename to `desktop-mcp` and preserve the old
binary/package compatibility as publication history requires. A non-private
manifest proves publishability, not whether a version already has registry users.
Check that history before setting a deprecation period.

A descriptor without management capability must still support driver-only use.
The adapter must not evaluate project config, launch helpers, or accept commands,
paths, environment values, grants, or arbitrary URLs from the model.

**Transport decision remains gated:** management could use a generic,
startup-registered authenticated extension on the driver listener, or a separate
verified supervisor endpoint in a versioned descriptor. Sharing a socket must
not move lifecycle semantics into the driver. Both endpoints require verified
identity, scoped permissions, and explicit incarnation handling.

## 6. Coordination and plugin contract

Start with typed contributions, not a dynamic plugin loader:

| Contribution            | Owns                                                                                  | Must not own                                                 |
| ----------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Launch provider         | Exact application acquisition/identity and owned-versus-attached semantics            | Native controller sessions or permission bypass              |
| Metro/resource provider | Declared service start, verified readiness, generation, and disposal                  | Adoption of an arbitrary port occupant                       |
| Storybook provider      | Channel resources, authenticated context, catalog, correlated render readiness        | A second workload owner or independent native mutation queue |
| WDIO/CSF runner         | Its documented suite-session model and terminal run result                            | A competing session opened from hooks                        |
| Driver service provider | Trusted composition of the driver and helper lifecycle                                | App/test-specific policy inside core routing                 |
| Coordinator             | Dependency ordering, resource ledger, workload claim, status, cancellation, collector | Native execution/settlement authority                        |

Initially these can remain statically imported integration functions. A resource
contribution needs a stable ID, dependencies, ownership mode, readiness state,
generation, and a settled disposal contract. Register acquisition cleanup
before effects, including resources acquired after cancellation. Reject unknown
serializable fields, duplicate IDs, cycles, and invalid target/suite references
before starting resources.

Config and provider implementations are trusted operator-installed code.
Management tools select only predeclared target/suite/action IDs. Child processes
can isolate failures but do not contain malicious same-user configuration.

### Separate authority and lease classes

| Class                                 | Authority and release rule                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Workload claim                        | Supervisor; release only after resource/effect accounting, otherwise retain a fenced recovery state.         |
| Resource handle                       | Recorded owner; owned and borrowed are distinct. Never stop or adopt borrowed resources implicitly.          |
| Service identity/grant                | Verified service incarnation and attenuated permission scope; invalidate on replacement/revocation.          |
| Target reservation/controller session | Driver; one session per registered target, retained through acquisition/drain/settlement.                    |
| Application ownership                 | Session, supervisor, or external launcher; exact process incarnation and causal ownership determine cleanup. |
| Physical input turn                   | Native lock; serialize settled input across processes. Not an application or controller reservation.         |
| Settlement/quarantine record          | Driver plus trusted durable storage; uncertain effects outlive transport/service death.                      |
| Attach credential                     | Exact application identity proof; not the same secret or authority as a runtime bridge nonce.                |
| Context epoch                         | Driver/provider agreement; stale render messages and preview references cannot establish current readiness.  |

Registered target aliases must be collision-free. Cross-service claims must bind
verified physical application identity and interactive-session scope, not merely
configuration target names. Keep the conservative global workload claim until a
finer supported claim model exists.

### Readiness tiers

1. **Service ready:** verified listener, descriptor published.
2. **Target acquirable:** registered identity/helper/policy available.
3. **Application ready:** the actual controlling session has verified the app.
4. **Context ready:** authenticated runtime, correlated render, verified marker.

Do not publish application readiness because a port answers. Do not create a
temporary competing WebDriver session for readiness. Launch-enabled targets can
be service-ready before the session that launches the application exists.

### Cancellation, handoff, and recovery

The default for a held target is bounded `busy`, not stealing or an invisible
queue. An explicit relinquish or operator-authorized preempt must stop new work,
drain/cancel and **await settlement**, confirm session deletion, invalidate
references/cursors/proofs/artifact links, then authorize a new runner session.
Grant revocation callbacks are not an awaited drain barrier.

Standalone WDIO owns its session. Today's Storybook callback runner creates the
session and its isolated Node worker borrows it. Keep that exception explicit;
do not silently claim both flows have identical ownership.

An attached app can survive handoff without native launch refactoring. A
session-owned launched app currently closes with its session. Retaining it
requires explicit opt-in supervisor-owned launch plus session attachment; do
not change this UX implicitly or make it a prerequisite for all handoff work.

Before dispatch, cancellation can have no effect. After dispatch, preserve
applied/rejected/indeterminate outcomes. A response deadline is not proof of
settlement. For remote story changes, prove old work is settled or fenced from
affecting the next epoch; otherwise block further controlled context mutation.
A narrower proven context fence can avoid whole-target quarantine, but simply
invalidating references and releasing the queue is insufficient.

Crash containment has two parts: cooperative child lifelines and exact-owner
ledger reconciliation. Durable settlement must be wired before a lifeline can
terminate a service mid-mutation without losing uncertainty. No universal
five-second cleanup guarantee is assumed. Uncontained descendants, failed
probes, or incomplete cleanup remain explicit/fenced.

Never reclaim solely because the supervisor PID exited. Prove its recorded
owned resources are gone or safely recovered, reconcile unresolved effects, and
use an exclusive reconciliation protocol that handles PID reuse, concurrent
reclaimers, interrupted writes, and late cleanup from the old generation.

### Reconnection matrix

| Event                     | Required behavior                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MCP transport loss        | Retain deletion/reconciliation responsibility. Do not blindly create another session or replay the failed operation.                                         |
| Grant rejected            | Authority invalid, not necessarily service replacement. Re-read verified discovery on a subsequent call; never send the old grant to an unverified listener. |
| Driver replacement        | New incarnation/grants; old session references are unusable. Restore durable uncertainty before accepting mutations.                                         |
| Same-incarnation recovery | Session continuity requires the same valid owning authority and confirmed session, not merely the same port/incarnation string.                              |
| Application replacement   | New exact incarnation; require a new session rather than silently rebinding old elements. Advisory exit events alone are not recovery evidence.              |
| Bridge reconnect          | New authenticated epoch, fail old pending requests, require hello and initial render again.                                                                  |
| Metro/rebundle            | Reverify runtime/catalog/config identity; an answering HTTP service is not enough to reuse it.                                                               |
| Supervisor crash          | Preserve/fence the ownership record, reconcile surviving resources, and recover through a trusted owner.                                                     |

A lost create response can leave session ownership unknown. The adapter must
represent that state and refuse fresh acquisition until reconciled or authoritatively
expired. "Best-effort delete" cannot promise absence of self-blocking.
Connection-bound sessions remain the default; resumable sessions require a
separate reviewed protocol.

## 7. Recommended changes to this PR

Keep this PR focused on a bounded driver/MCP foundation, not completion of every
orchestration milestone. Do not bury a coordinator extraction inside an already
large native/protocol change.

### P1 -- Correct new MCP lifetime and authority handling

**Required.** Implement single-flight connection/open/close/dispose transitions.
Keep deletion responsibility until confirmed terminal or the old authority is
proven gone. Correct same-address protected restart and revocation handling.
Never replay a mutation while reconnecting.

Primary files:
`packages/agentic/desktop-driver-mcp/src/controller.ts`,
`src/server.test.ts`, and connection/tool references.

Acceptance: deterministic dispose-during-open, late acquisition, failed deletion,
same-port replacement, grant revocation, lost response, and concurrent-open
tests. Same-target races are constrained by the service; a multi-target embedder
also needs coverage. Keep the existing bounded tool-list contract.

### P2 -- Make the shipped contract truthful and set the structural direction

**Required.** Keep package names/dependencies; record the host/driver/client
responsibility split. Mark opaque integration takeover, `supportsAgent`,
publication helpers, and adapter-written readiness as internal/transitional
where appropriate, without removing established public API indiscriminately.

Correct model-visible incarnation text, actual process topology, readiness tiers,
DELETE versus revocation behavior, persistence wiring, session continuity, and
the two suite ownership models. State which remaining milestones are delivered,
which are deferred, and the exact platform/renderer evidence required.

Primary files: existing architecture/operations/security/lifecycle/integration
references; MCP guidance; `desktop-driver/src/operations/shapes.ts`;
`desktop-test/src/integration.ts` and export annotations.

Reconcile latest main by ordinary non-rewriting integration; do not overwrite
its runtime/theme/version changes with branch-baseline files.

### P3 -- Apply a safety gate to protected orchestration claims

**Required decision, not an instruction to implement the whole roadmap.**
The reviewers disagreed on whether three existing gaps must block this PR:
claim release after uncertain cleanup, missing shipped recovery wiring, and
unauthorized Storybook mutation ingress.

The resolution here is a **behavior/support gate**, not a blanket redesign:

- The protected driver foundation can land separately from complete lifecycle
  orchestration.
- Do not claim crash-persistent protection unless the actual service path wires
  durable recovery. Existing library support is insufficient.
- Do not claim exclusive/protected Storybook control while alternate mutation
  entrances bypass it. Gate the affected protected behavior if it cannot be
  made safe; a limitations paragraph alone cannot establish that guarantee.
- Do not expose new lifecycle reuse/handoff/recovery while unresolved cleanup
  permits another owner to enter. Minimal fencing may land now; automatic
  reclamation belongs with the exact ledger implementation.
- The new story operation must preserve settlement/context fencing after
  dispatched cancellation. A signal parameter alone is not the fix.

Legacy unprotected behavior can remain an explicitly separate mode. Specify
unsupported behavior in bounded machine-readable results, not only prose.

This is intentionally stricter than "all existing gaps are follow-ups" and
narrower than "complete the entire supervisor redesign before merging."

### Optional, bounded improvements

Expose effective launch modes in status so agents do not default to attach
against launch-only targets. Add the real native-resolution subpath and narrow
MCP imports. Reduce catalog metadata crossing operation boundaries. Extract a
shared service factory now only if it remains small and is qualified in both
paths; otherwise F1 owns it.

**Do not add now:** a coordinator package, a general plugin loader, automatic
stale-lock reclaim, transparent runtime reconnect promises, resumable MCP
sessions, arbitrary lifecycle tools, or a broad package rename.

## 8. Issue-ready follow-up backlog

These are proposed issue bodies, not created GitHub issues. Paths below are
relative to `packages/agentic/`. Each item owns its tests, owning references,
changeset for published package changes, and relevant consumer/native evidence.
Dependencies are functional prerequisites; shared-file scheduling is listed
separately in section 9.

### F1 -- Unify driver-service composition and wire durable recovery

**Owner:** harness/service composition.
**Paths:** `desktop-test/src/driverService.ts` (real new module),
`src/supervisor.ts`, relevant `desktop-driver/src/server` recovery APIs, and the
factory call in `storybook-desktop/config/server.cjs`.
**Depends on:** P1-P3 scope/contract decisions.

Consolidate helper policy, authority, recovery, publication/withdrawal, and
settled shutdown for generic and Storybook paths. Add bounded offline inspection/
operator recovery if needed; it must hold the exclusive workload claim and
refuse a live service.

**Acceptance:** an indeterminate attached-target mutation remains blocked across
service restart in both paths; unreadable recovery storage fails closed;
application-exit recovery requires exact probe evidence; operator listings are
bounded and contain no grants/application text. Both composition paths use the
same real implementation, not parallel copies.

### F2 -- Implement settled lifecycle supervision and fenced ownership records

**Owner:** neutral lifecycle.
**Paths:** `desktop-test/src/{supervisor,services,integration,config}.ts`,
new ownership/claim implementation, and neutral lifecycle contract tests.
**Depends on:** F1.

Implement typed resource contributions with real generic fixtures, strict
dependency validation, late-acquisition accounting, explicit workload delegation,
and collector-owned presentation. Record exact owner identity, resource
generation/identity, ownership mode, and unresolved effects. Correct registered
target-ID collisions without equating target aliases with physical identity.

**Acceptance:** cancellation during acquisition cannot orphan a late resource;
required-service failure aborts dependants; shutdown awaits guarded work;
failed/timed-out disposal retains a fenced claim; reporting inheritance does not
grant ownership; live/unknown/PID-reused owner probes fail closed; concurrent
reconcilers cannot both acquire. Automatic reclaim stays disabled until survivor
handling is qualified by F3 and the relevant native backend.

### F3 -- Add owned-process lifelines and typed service readiness

**Owner:** process lifecycle.
**Paths:** `desktop-test/src/{commands,ownedService}.ts`,
`storybook-desktop/config/{server,server-runner}.cjs`, reporting transport
integration, and process contract fixtures.
**Depends on:** F1; F2's typed ownership/readiness interface before integration.

Give cooperative owned children a parent lifeline and explicit disposal.
Replace authoritative agent-ready-file polling with correlated typed readiness.
Keep the channel/driver child unless later measurements justify relocation.

**Acceptance:** parent/wrapper crash, late spawn, failed withdrawal, and stalled
child cases produce either verified cleanup or fenced incomplete results;
descriptors are withdrawn by surviving cooperative owners; borrowed resources
remain running. Qualify Windows descendant containment explicitly rather than
assuming a lifeline controls every process tree.

### F4 -- Settle Storybook provider cancellation and reconnect epochs

**Owner:** driver context port plus runtime bridge.
**Paths:** `desktop-driver/src/{storybook.ts,server/sessionStories.ts,operations/story.ts,operations/runtime.ts}`,
`storybook-desktop/src/driver/StorybookChannelOrchestrator.ts`,
runtime bridge/root implementation and tests.
**Depends on:** P2/P3 context contract; no dependency on host relocation.

Add local signal/lifetime context, typed bridge-unavailable state, connection
epochs, prompt pending-request failure, and producer/verifier conformance tests.
Investigate upstream reconnect behavior before promising transparent recovery.

**Acceptance:** absent bridge fails promptly before dispatch with no effect;
post-dispatch cancellation settles or fences late work; an old ready/error/render
cannot satisfy or overwrite a newer selection; context-sensitive actions reject
stale previews. Restart with a running app either safely reauthenticates or
returns an explicit renderer-specific relaunch-required state. No deadline-only
queue-release acceptance criterion.

### F5 -- Authorize and settle every controlled Storybook mutation entrance

**Owner:** Storybook control ingress and driver args policy.
**Paths:** driver `src/server/createDesktopDriverServer.ts` story/args routes,
Storybook orchestrator, smoke traversal, and `config/server.cjs`.
**Depends on:** F4 for context settlement/fencing; supported upstream interception
decision before channel changes.

Define an explicit policy for args. The session-owning grant still matters:
"any grant can reach any session" is not the finding. Refuse unsupported
agent args behavior or implement authorization, invalidation, settlement, and a
privacy-preserving journal without values. Protect/disable alternate HTTP/
WebSocket mutations while controlled; make smoke use the authoritative path.

**Acceptance:** unauthenticated/foreign-authority selection and args cannot alter
controlled context; allowed mutations share settlement/invalidation; no argument
values enter logs/journals. Preserve deliberately unprotected legacy behavior
in its separate mode. Do not block this on moving the channel into the parent.

### F6 -- Tighten manifest provenance and native helper trust handoff

**Owner:** Storybook generated configuration.
**Paths:** `storybook-desktop/src/driver/driverManifest.ts`,
CLI nonce/lease handling, `config/server.cjs`,
`storybook-desktop-runtime/config/metro.cjs`, and controlled config fixtures.
**Depends on:** chosen ownership/publication contract in F2; not logically
dependent on lifelines, but merge after F3's `server.cjs` edits.

Separate runtime bridge and attach-credential secrets; centralize/version
generated schemas; reverify helper provenance in the actual spawning process.
Do not treat a hash from the same editable record as independent trust.

**Acceptance:** tampered or mismatched artifacts fail before spawn; unknown
manifest fields fail; nonces are independent; secrets use owner-private POSIX
modes and the appropriate Windows ACL/private-storage boundary. Exercise Metro
generation only in controlled fixtures: loading its config has write effects.

### F7 -- Guard neutral dependency and import boundaries

**Owner:** package-boundary tests.
**Paths:** focused tests in `desktop-driver`, `desktop-test`, and MCP; export-map
integration if the native subpath is adopted.
**Depends on:** P2's allowed boundary; no other feature prerequisite.

**Acceptance:** negative fixtures detect React/React Native/Storybook imports or
dependencies in neutral packages; a standalone app consumer needs no Storybook;
MCP imports the declared narrow client/operations/authority/native surfaces.
Checks cover a real dependency boundary, not only constants or file spelling.

### F8 -- Expose bounded persisted run and artifact queries

**Owner:** harness reporting.
**Paths:** `desktop-test/src/reporting/*`, a real run-query implementation/client,
report contracts and tests.
**Depends on:** P2's result/ownership boundary.

Reuse the collector's authoritative persisted result. Add bounded status/pages,
terminal/incomplete semantics, and authorized opaque run/artifact IDs.

**Acceptance:** large/unfinished/all-skipped runs cannot become success;
reconnecting a reader does not restart execution; omission counts are explicit;
artifact queries cannot accept model-supplied paths; redaction and retention
apply before model-visible projection. Keep schemas in the harness.

### F9 -- Convert Storybook lifecycle takeover into resource contributions

**Owner:** Storybook/harness integration.
**Paths:** `storybook-desktop/src/{config/integration.ts,cli/*,driver/driverManifest.ts}`,
`config/server.cjs`, and harness integration call sites.
**Depends on:** F1, F2, F3, F6, F7.

Make `storybook driver` and neutral `serve` use one resource-ownership
implementation. Contribute Metro/channel/context and workload runners rather
than replacing the parent CLI lifecycle. Preserve current process placement.

**Acceptance:** generic and Storybook fixtures exercise the same real seam;
one workload/resource owner and one readiness/result presentation;
no unnecessary second driver; fixed Windows Metro-port policy is preserved;
unknown occupants are never adopted; CLI compatibility remains. Existing
attach-only behavior is sufficient for this migration.

Full bridge reconnect or new native launch ownership is **not** a prerequisite
for removing takeover. Exclusive controlled context claims additionally require
F4/F5; do not conflate migration with those guarantees.

### F10-M -- Implement neutral macOS application ownership and identity recovery

**Owner:** macOS lifecycle/backend.
**Paths:** neutral app/ownership adapters in `desktop-test`,
driver macOS authority/native support only where needed, native contracts.
**Depends on:** F2's exact ownership/claim contract.

Move generic attach-identity duties out of Storybook. Add opt-in supervisor-owned
launch, keeping attached applications external. Distinguish LaunchServices
causal ownership from direct child-process ownership.

**Acceptance:** PID reuse, duplicate bundle identities, permission failure,
interrupted publication, surviving descendants, and foreign/stale exit events
fail closed; attached apps survive cleanup; owned apps close by exact identity;
stable-signing/responsibility behavior is qualified. Moving Storybook's existing
lease code is an integration commit after F9, not a blocker for backend work.

### F10-W -- Implement neutral Windows application ownership and containment

**Owner:** Windows lifecycle/backend.
**Paths:** neutral Windows app/ownership adapters, driver Windows authority/native
support as needed, packaged/Win32 contracts.
**Depends on:** F2; can run independently of F10-M.

Support exact AUMID and executable/REX identities, process start and interactive
session checks, identity re-resolution, and supported descendant containment.

**Acceptance:** PID reuse/ambiguous identity/unknown evidence fail closed;
attached apps are not assigned to owned termination groups;
Job Object restrictions or uncontained descendants are explicit unsupported/
fenced outcomes. Qualify Windows Fabric and Win32 Paper separately.

### F11 -- Add scoped runner grants and drain-confirmed controller handoff

**Owner:** WDIO and CSF runner integration.
**Paths:** `desktop-test/src/wdio/*`, driver grant transport/drain contracts,
`storybook-desktop/src/testing/{runWdioTests,worker}.ts`.
**Depends on:** F1/F2 for generic handoff; F9 for Storybook integration.

Default to `busy`. Explicit relinquish/operator preempt awaits actual drain and
deletion before the runner opens its own session. Keep CSF's runner-owned session
exception documented unless deliberately migrated.

**Acceptance:** MCP/WDIO cannot control the same reserved target concurrently;
worker crash drains its session; stale references/cursors/artifact links fail;
credentials never enter capabilities, generated config, logs, or model output.
Attached-app handoff does not require F10. Retained supervisor-launched apps
require the relevant F10 backend and an explicit ownership option.

### F12 -- Attenuate management grants and isolate MCP connections

**Owner:** driver authority and adapter connection lifetime.
**Paths:** driver authority/grant/server contracts, MCP controller, security
references.
**Depends on:** P1; permission design review before expansion.

Separate driver-control, declared-workload, and operator-recovery permissions.
If delegation is introduced, each connection gets a child principal with equal
or narrower authority and parent revocation propagation. Labels are not the
authorization boundary.

**Acceptance:** two clients cannot use each other's sessions/permissions;
child scope cannot exceed parent; revocation drains descendants; no token leaks.
Keep session resume out of this item unless its grace/ownership protocol is
separately specified and reviewed.

### F13 -- Add the generalized `desktop-mcp` management facet

**Owner:** harness control/client and MCP mapping.
**Paths:** real `desktop-test/control` implementation/subpath;
MCP server/controller/package migration; transport extension/descriptor only as
the chosen design requires.
**Depends on:** F8, F11 generic path, F12, management transport/scope decision.

Expose a finite supervisor-declared catalog: workload status, run approved suite,
cancel owned run, bounded result/artifact queries. Start/stop/recover permissions
must be separately reviewed; operator recovery is not an ordinary agent tool.
Return an opaque run handle rather than keeping a model call open for the whole
suite.

**Acceptance:** no model-selected config/modules/commands/paths/env/URLs;
one source for each management schema; bounded discovery/results;
reconnect does not replay a run; cancellation produces truthful incomplete/
settled status; old driver-only descriptors still work. Verify publication
history and migrate the name/binary compatibly.

The Storybook management facet additionally depends on F9 and F4/F5. Generic
MCP management can land without Storybook; do not block it on every native
retained-app option.

### F14 -- Qualify lifecycle failure paths and maintain a support matrix

**Owner:** cross-platform qualification, with each feature owner responsible for
its own evidence.
**Paths:** driver native fixtures/contracts, harness/Storybook consumer tests,
owning app CI/scripts, and qualification references.
**Depends on:** baseline can start after P2; consolidate each advertised feature
only after its implementation and endpoint evidence.

**Acceptance:** supervisor/helper/app/Metro/bridge/runner/MCP failures are
injected independently; same-port replacement, surviving children, stale
descriptors, late renders, grant revocation, and uncertain cleanup are covered.
Include a non-React application. Report macOS Fabric/Paper, Windows Fabric,
and Win32 Paper separately; add the AppKit fixture rather than assuming it exists.
Hosted physical-input/capture skips are not passes, and semantic `activate` is
not evidence that a physical click works.

Measure identical tasks for schema overhead, tool calls/response bytes, cold/warm
startup, retries, recovery cost, retained resources, and cleanup correctness.
Native/lifecycle qualification happens **with each item**, not only at the end.

## 9. Dependencies and safe parallel execution

Functional dependencies:

```text
P1/P2/P3 decisions
  |-- F1 shared factory/recovery --> F2 lifecycle/ledger
  |                                  |-- F3 readiness integration
  |                                  |-- F6 manifest contract
  |                                  |-- F10-M / F10-W
  |-- F4 context epochs --> F5 controlled ingress
  |-- F7 boundary guards
  |-- F8 persisted queries
  `-- F12 attenuated grants

F1 + F2 + F3 + F6 + F7 --> F9 Storybook contributions
F1 + F2 --> F11 generic handoff
F9 --> F11 Storybook integration
F10-* --> F11 retained-owned-app option only

F8 + F11 generic + F12 + reviewed transport --> F13 generic MCP
F9 + F4 + F5 --> F13 Storybook facet

Each feature --> its own native/consumer evidence --> F14 consolidated matrix
```

An interface sketch alone is not a completion gate. F1/F2 must include a real
generic implementation and fixtures; F9 exercises the same seam with Storybook.
Do not freeze placeholder interfaces that no consumer has implemented.

| Batch            | Parallel work                                                           | Coordination constraint                                                                                |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| PR               | P1; P2/P3 documentation coordinated by one owner; optional import work  | Controller/status edits follow P1. P2/P3 share architecture/remaining-work references.                 |
| First follow-ups | F1, F4, F7, F8, F12                                                     | F12 server integration must not collide with F1 recovery exports or later F5 routes.                   |
| Lifecycle        | F2 while F4/F8 finish; F3 process implementation can prepare against F1 | F3 integrates typed handles only after F2. Do not concurrently edit the supervisor.                    |
| Platform/context | F10-M, F10-W, F5, F6                                                    | Native backends own separate files. F5/F6 both touch `server.cjs`: sequence their integration commits. |
| Integration      | F9; F11 generic runner code can proceed separately                      | One owner for supervisor/Storybook CLI integration. No parallel wholesale CLI rewrites.                |
| Facade           | F13 generic; separate OS qualification lanes                            | Enable Storybook facet only after its safety dependencies.                                             |

Shared-file scheduling is not a functional dependency:

- `supervisor.ts`, `integration.ts`, and `config.ts`: one lifecycle integration
  owner; platform contributors propose shared changes instead of editing them
  concurrently.
- `server.cjs`: F1 factory switch, F3 lifeline/readiness, F5 ingress, F6 trust,
  then F9 simplification have ordered integration commits.
- `StorybookChannelOrchestrator.ts`: F4 owns epoch/cancellation; F5 applies
  ingress after that. Do not split those changes between simultaneous editors.
- `DesktopStorybookCli.ts`: F6 and F9 own their phases; later lease/handoff
  integration is coordinated, not assumed disjoint.
- `SessionManager.ts` and grant routing: drain, exit/identity, and attenuation
  work share an integration owner.
- Export maps, native wire schemas, root TypeScript references, lockfile,
  changesets, and aggregate guidance use coordinated commits.
- Physical-input qualification is serialized per interactive desktop; different
  OS machines can work in parallel.

## 10. End-to-end target flows

**Standalone installed app:** trusted config selects a registered target; the
neutral host acquires its claim, verifies configured resources, and publishes
service readiness. MCP opens launch or attach according to declared modes.
Story capabilities are absent/unsupported. Closing an attached session preserves
the app; a session-owned launch follows its existing close semantics.

**Storybook:** the integration contributes Metro/channel/context and generated
identity. The actual listener owner publishes verified service readiness. Runtime
hello and initial render establish context readiness separately. Selection enters
the native session authority, establishes an epoch, awaits correlated readiness,
and verifies the marker. Observe/action paths detect stale context. Windows
fixed-port and macOS attach-credential differences remain explicit.

**WDIO:** the host starts resources but not a competing readiness session. WDIO
owns its session and hooks install commands on that session. CSF callbacks keep
their separately documented runner/worker ownership. Failures and terminal
flushes go to one collector.

**MCP-to-suite:** the agent requests a predeclared suite and receives `busy` or a
run handle. Any explicit handoff drains the old session first. MCP queries
bounded progress/results without keeping a native session alive merely by
watching progress. When tests end, the target is unowned; a fresh MCP session
requires fresh observations.

**Restart/crash:** reverify discovery/authority, restore settlement, reconcile
exact resource ownership, reject ambiguous reuse, reopen a session, and
reauthenticate context. Never equate reconnecting a socket with restoring native
session or preview state.

## 11. Decisions, risks, and validation gates

| Decision gate               | Recommended default                                                           | Evidence needed before expansion                                                |
| --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Coordinator extraction      | Existing host; no new package                                                 | Second independent consumer or dependency-profile conflict                      |
| Management transport        | Keep domain ownership; decide one listener vs verified second endpoint at F13 | Scope enforcement, incarnation/discovery, cancellation and compatibility design |
| App survival across handoff | Preserve existing semantics; opt-in host ownership                            | Exact native ownership/cleanup evidence                                         |
| Session continuity          | Connection-bound; no automatic resume                                         | Reviewed lease/grace protocol with ambiguous-response handling                  |
| Storybook ingress/reconnect | Gate unsupported protection; no transparent-recovery promise                  | Supported interception and endpoint/renderer reconnect evidence                 |
| Multi-workspace concurrency | Conservative workload exclusion                                               | Verified cross-service application claims and measured contention               |
| Process co-location         | Keep supervised child initially                                               | Measured benefit plus macOS responsibility/Windows containment qualification    |
| Plugin generalization       | Static typed contributions                                                    | Real second provider and stable exercised extension seam                        |

Important risks are ownership ambiguity, premature queue release, delayed
Storybook renders, forged/mismatched discovery, stale resource adoption,
cross-service control, secret leakage, and version skew. Mitigations are exact
identity, verified discovery, scoped finite operations, durable uncertainty,
generation fencing, owned-versus-borrowed cleanup, bounded privacy-preserving
results, and explicit unsupported states.

**Review validation:** source/diff/test inspection completed; implementation
tests, package builds, native contracts, and live apps **not run**. Test citations
are evidence of assertions, not executed passes.

Implementation owners should run focused tests for changed behavior, then each
changed package's declared `yarn format`, `yarn lint`, `yarn build`, and
`yarn test`, followed by the repository-required `yarn clean-lage-cache` and
`yarn lage buildci`. Documentation links are a separate check. Native/provider
or topology changes additionally require matching-OS native contracts and
affected consumer lanes. JavaScript tests/bundles do not qualify native behavior.

Use a revision- and endpoint-specific matrix with passed/failed/skipped/not-run/
unsupported status. Historical qualification at another revision must not be
reported as qualification of these proposals.

## 12. Evidence and reciprocal-review reconciliation

All paths below are relative to the repository root and refer to inspected HEAD.
The PR three-dot range was 306 files; the broader main-to-branch diff includes
unrelated main-side changes. The runtime was not changed in the PR three-dot
range. Reconcile main's runtime/theme/version updates without attributing them to
this PR.

| ID  | Primary source evidence                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | `packages/agentic/desktop-driver/package.json:110-114`; `desktop-test/package.json:63-69`; `storybook-desktop/package.json:70-83`; `storybook-desktop-runtime/package.json:45-80`; `desktop-driver-mcp/package.json:42-47` (all under `packages/agentic/`)                     |
| E2  | `packages/agentic/desktop-driver/src/server/createDesktopDriverServer.ts:189-234`; `src/server/SessionManager.ts:298-345,486-512,557-638`; `src/protocol/timeouts.ts:18-77`; `src/server/authority.test.ts:414-459` (remaining paths relative to that package)                 |
| E3  | `packages/agentic/desktop-driver/src/authority/connectionDescriptor.ts:44-70`; `connectionDescriptor.test.ts:36-73`; `packages/agentic/desktop-driver-mcp/src/connection.ts:27-40`                                                                                             |
| E4  | `packages/agentic/desktop-driver/src/operations/runtime.ts:86-132`; `registry.ts:31-46,93-124`; `limits.ts:18-25,84-102`; `observations.ts:7-10`; `packages/agentic/desktop-driver-mcp/src/server.ts:35-99`; `server.test.ts:63-88`                                            |
| E5  | `packages/agentic/storybook-desktop/src/driver/StorybookChannelOrchestrator.ts:174-235`; `StorybookChannelOrchestrator.test.ts:135-172,262-348`; `packages/agentic/desktop-driver/src/server/sessionStories.ts:94-141`; runtime `src/DesktopStoryRoot.tsx:19-58`               |
| E6  | `packages/agentic/desktop-test/src/reporting/session.ts:20-77`; `results.ts:24-79,161-191,220-233`; `transport.ts:129-131`                                                                                                                                                     |
| E7  | `packages/agentic/desktop-test/src/integration.ts:17-40`; `src/cli.ts:189-222`; `src/supervisor.ts:98-139,285-345`; `packages/agentic/storybook-desktop/src/config/integration.ts:35-48`; `config/server.cjs:114-167`                                                          |
| E8  | `packages/agentic/desktop-driver-mcp/src/controller.ts:63-88,140-145,181-198`; `src/server.test.ts:91-132,307-339`; driver `src/client/DesktopDriverClient.ts:97-99`                                                                                                           |
| E9  | `packages/agentic/desktop-test/src/supervisor.ts:79-88,238-266,352-372`; `src/services.ts:67-70`; `src/commands.ts:110-116`; driver `references/remaining-work.md:774-778`                                                                                                     |
| E10 | `packages/agentic/desktop-driver/src/server/createDesktopDriverServer.ts:49-59,106-114,130-134`; `packages/agentic/desktop-test/src/supervisor.ts:107-121,299-305`; driver `src/server/SessionManager.ts:693-695,766-797`                                                      |
| E11 | `packages/agentic/storybook-desktop/config/server.cjs:106-108`; `src/driver/StorybookChannelOrchestrator.ts:101-105,133-142`; driver `src/server/sessionStories.ts:18-35,72-90`; `src/server/createDesktopDriverServer.ts:339,521-537`; `references/remaining-work.md:729-752` |
| E12 | `packages/agentic/storybook-desktop/src/driver/driverManifest.ts:105,128-136`; `src/cli/DesktopStorybookCli.ts:272,727-736,1007-1112`; `config/server.cjs:75-99,142-171`; runtime `config/metro.cjs:71-116`; driver `references/remaining-work.md:1014-1024`                   |
| E13 | `packages/agentic/desktop-test/src/wdio/configuration.ts:55-111`; `packages/agentic/storybook-desktop/src/testing/runWdioTests.ts:135-181,225-234`; `worker.ts:22-58`; `src/cli/DesktopStorybookCli.ts:412-416`; driver `src/wdio/DesktopWebdriver.ts:117-166`                 |
| E14 | `packages/agentic/desktop-driver/src/storybook.ts:1-40`; `src/host/types.ts:235-245`; `src/operations/shapes.ts:29`; `src/operations/sessionState.ts:73`; `packages/agentic/desktop-test/src/config.ts:64-69,163-175,209-232`                                                  |
| E15 | `packages/agentic/desktop-driver/src/hosts/native/NativeHostProcess.ts:78-95,430-441`; `src/native/nativeDriver.ts:299-315`; `src/index.ts:8,17,149`; MCP `src/connection.ts:1`                                                                                                |
| E16 | `packages/agentic/desktop-test/src/config.ts:265-280,302-306`; driver `src/server/SessionManager.ts:116,325`; native macOS `Sources/DesktopDriverHost/InputLock.swift:48-126`; native Windows `src/inputlock.cpp:52-94`                                                        |

For shortened source paths in the table, the immediately preceding full package/
source directory supplies their prefix. Native helper paths are beneath
`packages/agentic/desktop-driver/native/`.

### How the two models' disagreements were resolved

| Question                              | Independent positions and reciprocal correction                                                                                                                 | Decision in this plan                                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing supervisor vs workspace host | Astra favored strengthening the supervisor; Opus initially distinguished a workspace host from it. Both later recognized `serve` is already a long-lived owner. | Approach A includes both one-shot and hosted lifetimes.                                                                                                                             |
| Coordinator vs daemon                 | Opus initially conflated package extraction with a per-user broker, then withdrew that framing.                                                                 | Compare run-scoped extraction separately from process lifetime.                                                                                                                     |
| Move channel/driver into parent       | Opus initially required co-location; reciprocal review conceded shared policy and supervised child ownership are sufficient.                                    | Retain child placement until evidence justifies native requalification.                                                                                                             |
| MCP naming and schema ownership       | Opus initially kept the name even for management on the driver socket, then accepted harness-owned schemas and a later rename.                                  | Keep now; `desktop-mcp` when actual management tools land.                                                                                                                          |
| PR merge scope                        | Astra required broader safety fixes/gates; Opus limited blockers to new defects and false claims.                                                               | P1/P2 are unconditional; P3 gates protected orchestration behavior without requiring the entire roadmap. This is a coordinator decision, not unanimous agreement on merge blockers. |
| Native ownership before handoff       | Astra's first DAG serialized all handoff/Storybook work behind native ownership. Opus correctly distinguished attach-only and retained-launch flows.            | Native ownership blocks retained-owned-app handoff only.                                                                                                                            |
| Cancellation/reclamation              | Both converged on ledger/drain requirements; some Opus criteria still used a fixed queue-release deadline and a five-second containment guarantee.              | Require settlement/fencing and verified cleanup, not timing proxies.                                                                                                                |
| Extension schemas                     | Opus initially treated core story operation placement as permanent necessity. Astra noted a closed startup catalog can still preserve one schema/queue.         | Keep deliberate optional story contracts now; no generic framework without a concrete second use.                                                                                   |
| Qualification ordering                | Opus identified that a final qualification batch cannot substitute for each feature's native evidence.                                                          | Qualify with each item; F14 consolidates.                                                                                                                                           |

**Provenance:** exactly two independent investigations followed by reciprocal
review of each complete peer report: GPT-6 Astra (`gpt-6-astra`) and Claude Opus
5.5 (`claude-opus-5.5`), both requested with `reasoning_effort: max` and
`context_tier: long_context`. The complete independent reports and critiques
were retained as private session artifacts. Opus's critique was returned as a
continuation first; its missing beginning was recovered in the same thread
before synthesis, with the reviewer reporting only editorial recovery changes.
No third model was delegated to adjudicate. This document is the coordinator's
evidence-backed reconciliation, not a claim that every recommendation was
unanimous.
