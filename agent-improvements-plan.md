# Agent instruction and skill improvements plan

**Status:** Proposed; awaiting user decisions. This document authorizes no
instruction migration, skill changes, policy changes, or evaluation runs.

**Basis:** Repository inspection at `246d336682c628e6ff65d11c6f5997d9135be5b6`
on 2026-10-14, independent plans from Claude Opus 5.5 and GPT 6 Astra, and
reciprocal cross-review in the original reviewer threads.

## Recommended outcome

Create **`references/agents/`** as the shared, tool-neutral home for reusable
agent guidance. Keep root and scoped `AGENTS.md` files as discovery entrypoints
and concise routers; keep discoverable workflows in `.github/skills/`. Leave
product contracts, protocols, token mappings, package documentation, and
historical plans beside their owning code.

Recommend **separate generation-specific recipes, not eight immediately
separate skills**: one classification-first v0/v1 workflow, the existing
agentic authoring workflow, one read-only component-review workflow, and a
native-authoring entrypoint that also acts as an overlay. Native is a platform
and integration dimension, not an exclusive fourth component generation.
Retain the existing skill names initially; explicit `implement-*` names remain
an owner choice.

Begin with a small routing and non-safety extraction pilot. Defer Apple/Office,
permissions, and security-policy extraction until a separately approved parity
review. Establish portable rule IDs and evidence records without choosing or
building an evaluation framework.

## 1. Goals, boundaries, and success criteria

| Goal                        | Success criterion                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Centralized shared guidance | Reused rules have one authoritative home and explicit owners; skills and root/scoped routers link to that home.                                            |
| Future evaluation reuse     | A case can identify the applicable instructions, rule assertions, inspected repository revision, and actual evidence without depending on an agent vendor. |
| Clear component workflows   | Tasks distinguish v0, v1, agentic higher-order, agentic primitive, and native obligations without using directory names alone.                             |
| Progressive loading         | Agents load the applicable workflow and conditional references, not the complete instruction collection. Actual loading and duplication are measured.      |
| Safe continuous improvement | Evidence produces a human-reviewable proposal; no autonomous policy weakening, external publication, or raw-transcript collection.                         |

This is an organizational change, not a component migration. Preserve public
APIs, framework behavior, native registration, supported hosts, contract
lifecycle, qualification requirements, permission behavior, and publishing
policy. Correct stale instructions only after reconciling them with their
owning implementation; do not use the reorganization to expand unrelated work.

## 2. Observed starting point

The inspected checkout contains **12 `AGENTS.md` files including the root,
two root/tool adapters, five repository skills, ten authoring references, and
six contract-source adapters**. The root is 418 lines and approximately 30 KB.
These are file measurements, not token measurements.

| Finding                                                | Evidence and implication                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root guidance conflates component models               | [Root component guidance](AGENTS.md) recommends composition and new `stagedComponent` usage at line 257; [framework-base guidance](packages/framework-base/AGENTS.md), line 15, prohibits new staged usage. These need explicit domain routing, not a global winner.                                                                    |
| v0/v1 guidance is outside consumer ancestry            | [v0 guide](packages/deprecated/foundation-compose/AGENTS.md), lines 3-6, and [v1 guide](packages/framework/framework/AGENTS.md), lines 3-6, apply to consuming components outside their directories. Ancestor discovery alone cannot be assumed to supply them.                                                                         |
| A package can contain both generations                 | [Deprecated Button](packages/components/Button/src/deprecated/Button.tsx), lines 17-19, uses foundation-compose; [current Button](packages/components/Button/src/Button.tsx), lines 6-7, uses framework composition.                                                                                                                    |
| Helper names do not determine generation               | [v1 Text](packages/components/Text/src/Text.tsx), lines 5-17 and 133, uses `compressible` and a `directComponent` continuation. [Agentic Button](packages/agentic/components/src/components/button/button.ts), lines 9-13, is a normal React function assembling its stages.                                                            |
| Legacy API and implementation model are different axes | [Native-core Callout facade](packages/agentic/native-core/src/legacy/callout/Callout.tsx), lines 2-10, uses modern helpers while retaining legacy compatibility.                                                                                                                                                                        |
| Native cuts across generations                         | [Experimental Checkbox](packages/experimental/Checkbox/src/Checkbox.macos.tsx), lines 10 and 27-39, combines v1 composition with a native root. Native modules may have no component generation at all.                                                                                                                                 |
| Shared references are owned by one skill directory     | [Framework-base guidance](packages/framework-base/AGENTS.md), line 54, consumes authoring focus guidance; [native-core README](packages/agentic/native-core/README.md), line 177, consumes its Windows Fabric guidance.                                                                                                                 |
| Existing loading instructions are too broad            | [Authoring skill](.github/skills/agentic-component-authoring/SKILL.md), lines 37-46, includes a conditional Windows reference in an "every reference" recommendation and needs a primitive-specific `CONTRACT.md` branch instead of unconditional `SPEC.md`.                                                                            |
| Commands need source reconciliation                    | [Root manifest](package.json), lines 18-19 and 31, defines `build` as `lage root-build`, `build:clean` separately, and `root-build` as `tsc -b`. Do not copy the root's `yarn build --clean` advice into the new reference unchecked.                                                                                                   |
| Instruction anchors are contract dependencies          | [Button specification](packages/agentic/components/src/components/button/SPEC.md), lines 70 and 99, cites `src/components/AGENTS.md#focus-visual-policy`. Reviewers found 45 such links in 34 files and three root Apple/Office-anchor links. Preserve their meaning and compatibility.                                                 |
| Contract infrastructure already has its own schema     | [SPEC-SOURCE.md](packages/agentic/components/SPEC-SOURCE.md), lines 24-57 and 185-216, defines provenance and lifecycle. [Contract checker](packages/agentic/components/scripts/spec-contracts/check-spec-contracts.cjs), lines 45-75 and 504-546, enforces profile/layout constraints. Do not repurpose it as an instruction registry. |

**Observed, session-specific:** the review context included the root guidance
both directly and through the `CLAUDE.md` import. This warrants a duplication
probe; it does not prove identical behavior in all clients. Copilot CLI help
confirms root/cwd instruction locations and `/instructions`, `/env`, `/skills`,
`/context`, and `/usage`. Linked-file transclusion, nested inheritance, and
other clients' discovery semantics remain unqualified.

**Additional migration candidates:** Claude identified stale tester paths,
E2E naming, `depcheck`/format advice, changeset-script references, and the docs
command. Record these in the migration ledger and verify against current
manifests/source before changing them. They were inspected, not all executed.

## 3. Target architecture and authority

```text
AGENTS.md                              # Repository safeguards and task router
CLAUDE.md                              # Existing adapter; qualify before changing
.github/copilot-instructions.md        # Existing adapter
.github/skills/
  agentic-component-authoring/
  agentic-component-contract-authoring/
  agentic-component-optimization/
  agentic-storybook-development/
  fix-security-issues/
  maintain-v0-v1-component/             # Proposed; separate conditional recipes
  review-component/                    # Proposed; read-only, all generations
  implement-native-component/          # Proposed; also modules/services overlay
  assess-agent-efficacy/                # Optional; proposal-only
references/agents/
  README.md                            # Short index, ownership, document roles
  repository-development.md            # Verified commands and validation routing
  components/
    classify.md
    v0.md
    v1.md
    agentic/                           # Only recipes proven shared by workflows
  focus/
    common.md
    windows-win32.md
    macos.md
  native/
    windows-fabric.md
    apple-office.md                    # Later, separately approved extraction
    qualification.md                   # Only if genuinely shared detail warrants it
packages/**/AGENTS.md                   # Retained scoped entrypoints
apps/storybook/AGENTS.md                # Retained app entrypoint
```

This is a destination map, not a requirement to create every listed file.
Keep the primary routing table in root `AGENTS.md`; do not add another mandatory
`routing.md` hop. Detailed classification is loaded when the task requires it.
Review sequencing belongs in the review skill, not a second duplicated protocol.

### Ownership and precedence

- Root owns repository-wide safeguards and routes. Scoped entrypoints own
  local invariants and explicitly identify their applicable domain.
- Skills own task sequencing, entry conditions, required inputs, outputs,
  conditional reads, and stop conditions.
- Shared references own reusable behavioral rules. Their central location
  does not transfer technical stewardship away from the owning package.
- Product contracts, transport protocols, token definitions, and source locks
  stay authoritative in their existing homes. A README can contain an
  authoritative protocol; a filename alone does not establish its role.
- Respect actual runtime instruction priority and user authorization. Do not
  invent a repository precedence ladder above either. Scope determines which
  rule applies; path depth is not a universal conflict-resolution mechanism.
- Validator failures are evidence of unmet enforced contracts, not permission
  to override reviewed requirements silently. Escalate unresolved same-domain
  conflicts. Plans and historical observations do not become implementation
  guarantees through relocation.

Keep one full authoritative definition per rule. Concise entrypoint warnings
and links are intentional safety redundancy, not another complete copy.
The permission hook provides approvals; unmatched commands are not blanket
denials. This migration must preserve that distinction.

## 4. Classification and proposed skill workflows

Classify the actual changed surfaces before selecting recipes:

1. **Task mode:** implement/maintain, contract-only, plan-only, review,
   cross-component optimization, Storybook/toolchain, or dependency security.
2. **Implementation model:** v0 foundation-compose, v1 compose/compressible,
   agentic higher-order, agentic primitive, another framework-base pattern,
   or no component model.
3. **Public compatibility:** legacy aliases/`componentRef`, V1 exports,
   modern `ref` contracts, primitive entrypoints, or native-core legacy facade.
4. **Native obligations:** platform, renderer, host ownership, schema,
   registration, Apple module/bridging integration, and qualification status.

Paths, imports, exports, and component structure provide evidence together.
Neither `legacy/`, a JSX pragma, nor a single helper import is sufficient.
For mixed diffs, classify each surface; never force the whole change into one
generation.

| Surface                         | Implementation workflow                                 | Conditional recipe and review obligations                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v0                              | `maintain-v0-v1-component`, v0 branch                   | Settings layering, filters, prepare/render boundary, token dependencies, overrides, aliases, and existing public refs. Preserve the current maintenance-first v0 policy.                                                 |
| v1                              | Same entrypoint, v1 branch                              | Compose versus compressible behavior, continuations, token precedence, customization, platform variants, and existing ref/API compatibility. New-v1 policy requires D04.                                                 |
| Agentic higher-order            | Existing `agentic-component-authoring`                  | Reviewed contract gate where applicable; stage structure, slots, state ownership, cached styles, rendering, tests, and stories. Contract-only work routes to the contract skill.                                         |
| Agentic primitive               | Explicit branch of the same authoring skill             | Local `CONTRACT.md`, unstyled acceptance API, renderer branches, exports, slot type tests, and documented ref exceptions. Do not impose Flex provenance or a uniform imperative ref.                                     |
| Native component/module/service | `implement-native-component`, directly or as an overlay | Codegen, registration, UI affinity, lifetimes, cancellation, renderer/host admission, packaging, and native evidence. Use native-core for new shared modern native work; do not force unrelated old wrappers to migrate. |
| Any component review            | `review-component`                                      | Read-only classification, applicable generation checklist, relevant native/focus overlays, high-confidence findings with path/line evidence, and truthful validation status.                                             |

The native skill name would have to describe modules and shared host services
as well as components. `native-authoring` is a clearer alternative if D03
favors broader names.

**Why not eight skills initially?** Skill selection happens before an agent
has necessarily inspected APIs; v0/v1 can share a package and a review can span
both. Separate recipe branches preserve incompatible conventions while one
entry workflow avoids overlapping metadata. A single review route shares
read-only rules and evidence standards without duplicating four workflows.
Split entrypoints if measured routing errors justify it, not merely to achieve
symmetrical names.

**Eight-skill alternative:** `implement-v0-component`,
`implement-v1-component`, `implement-agentic-component`,
`implement-native-component`, and corresponding `review-*` skills. If chosen,
each must delegate to shared recipes rather than copy them, mixed-generation
review must have an explicit composition route, and native must remain an
overlay. Retire replaced active skills atomically; never leave discoverable
alias skills competing for automatic selection.

## 5. Progressive loading contract

1. Start with the root router and applicable scoped instructions. Verify
   actual discovery; explicitly read required scopes when it is unqualified.
2. Select one task workflow. Read its positive scope, exclusions, and output
   contract before invoking adjacent workflows.
3. Load only the chosen generation recipe, relevant product contract, and
   references triggered by the work. Loading both v0 and v1 is appropriate
   only for a genuinely mixed change.
4. Load native/focus overlays for semantic changes as well as file suffixes:
   schemas, refs, platform wrappers, registration, Pod/build configuration,
   accessibility actions, and focus behavior can cross native boundaries.
5. Choose source adapters by evidence type; do not load all six by default.
   Look up relevant token entries rather than reading the entire mapping or
   source inventory.
6. Links are navigation, not assumed automatic transclusion. Avoid recursive
   "read everything" instructions, circular dependencies, and redirect chains.
7. Never trade required contract or safety evidence for fewer tokens. Missing
   validation is reported explicitly, not converted to a successful fallback.

Suggested **review budgets**, subject to D08: root eventually around 8 KB or
1,000 words, skill bodies around 600 words, descriptions around 50 words with
clear exclusions, and mandatory root-to-rule routes within two explicit reads.
Keep safety triggers directly in always-on entrypoints. Scoped files and
coherent references have advisory budgets, not hard truncation limits.

Measure unique file bytes/words separately from actual injected tokens,
repeated loading, tool calls, and elapsed time. Shortening files does not prove
reduced runtime context. A 30% median loading reduction may be a later reporting
target, **not an empirically established prediction or pilot gate**.

## 6. Minimal evaluation groundwork

Do not introduce an instruction DSL, retrieval service, vendor-specific runner,
or a generated instruction system.

Recommended first convention, subject to D07: three metadata fields on shared
references only:

```yaml
---
id: native.apple-office
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core
---
```

Use `instruction-reference`, `evidence-reference`, or `compatibility-reference`
to distinguish document roles. These are repository conventions, not assumed
runtime-recognized frontmatter. Keep load conditions in routers, not duplicated
in a registry, frontmatter, and skill description.

Assign stable IDs only to consequential, testable obligations, for example
`R-APPLE-001`, and separate version-bound observations as `C-FOCUS-001` with
source, inspected revision/version, date, and limits. Do not reuse component
requirement IDs or modify their checker schema. Distinguish an authoritative
rule definition from references to its ID.

Git identifies document versions. Compute file hashes when assessing a case;
do not maintain per-file revision counters or self-referential hashes.
An optional generated inventory can follow once an integrity checker has a
real need; do not start with both a rich catalog and duplicate frontmatter.

A portable case/result boundary can use:

```yaml
case_id: classify-v1-compressible
task_mode: review
repository_commit: '<full SHA>'
instructions:
  - path: references/agents/components/v1.md
    sha256: '<computed at execution>'
assertions:
  - id: preserves-v1-public-ref
    rule_ids: [R-V1-001]
    source_refs: ['packages/components/Text/src/Text.tsx:5-17']
    result: not-run
    evidence: 'No execution recorded.'
```

Case definitions describe inputs and expected assertions; execution results
add runtime/model versions, actual loaded files, command outcomes, skips,
measurement method, and sanitized evidence. Separate expected reads from
observed reads. A future evaluation framework can consume these artifacts
without changing the underlying instructions.

Small sanitized case fixtures may be checked in after D11 approval; otherwise
keep them local. Framework selection is not a prerequisite for portable cases.
The agentic contract checker discovers that package's higher-order components,
not native-core specs
([checker common module](packages/agentic/components/scripts/spec-contracts/common.cjs),
lines 5-9 and 58-60). Do not claim native-contract coverage from it.

## 7. Migration map

### Existing skills and references

| Existing surface                                               | Proposed treatment                                                                                                                                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `agentic-component-authoring`                                  | Retain name initially. Narrow implementation scope, distinguish primitive/higher-order contracts, and replace blanket reference loads with explicit conditions.                      |
| Its types/state/styles/render/tests references                 | Retain initially. Move an individual recipe to `references/agents/components/agentic/` when implementation and review actually share it, updating both consumers in the same change. |
| Its three focus references                                     | Centralize under `references/agents/focus/` after the pilot; preserve cross-generation intent, platform-specific recipes, version limits, and historical evidence labels.            |
| Its Windows Fabric reference                                   | Centralize under `references/agents/native/windows-fabric.md` after the pilot; preserve native-core's narrower Fabric-only boundary.                                                 |
| Its `spec-source-adaptation.md` redirect                       | Retain as a non-skill compatibility reference until explicit retirement. No tracked inbound links does not establish absence of external consumers.                                  |
| `agentic-component-contract-authoring` and six source adapters | Retain lifecycle and skill-local adapters. Move only if demonstrated reuse warrants it; keep `SPEC-SOURCE.md`, source locks, `agency.toml`, and checker locations intact.            |
| `agentic-component-optimization`                               | Retain cross-component scope. Link to dependency-direction authority instead of copying it; do not broaden to repository-wide optimization.                                          |
| `agentic-storybook-development`                                | Retain. Route operations through app-owned instructions/map and current declared scripts; keep the live story catalog out of shared instructions.                                    |
| `fix-security-issues`                                          | Retain safeguards, age policy, remediation ordering, and fail-closed behavior. No policy changes through extraction.                                                                 |

### Every instruction entrypoint

| Entrypoint                                             | Proposed treatment                                                                                                                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root `AGENTS.md`                                       | Compact router and safeguards. Extract reconciled architecture/commands/framework recipes incrementally. Preserve permissions and Apple/Office text in the first pilot. |
| `CLAUDE.md` and `.github/copilot-instructions.md`      | Retain discovery filenames and paths; change adapter/import semantics only after actual supported-client probes.                                                        |
| `packages/agentic/components/AGENTS.md`                | Retain package boundaries, modern API invariants, and component/primitive routes. Link to shared recipes without repeating them.                                        |
| `packages/agentic/components/src/AGENTS.md`            | Retain dependency direction, public primitive boundaries, and extraction ownership.                                                                                     |
| `packages/agentic/components/src/components/AGENTS.md` | Retain higher-order rules and the `#focus-visual-policy` anchor. Detailed reusable recipes may move; contract meaning does not.                                         |
| `packages/agentic/components/src/primitives/AGENTS.md` | Retain local-contract, unstyled behavior, renderer, export, and ref exceptions.                                                                                         |
| `packages/agentic/native-core/AGENTS.md`               | Retain host/export/lifetime boundaries; link to shared native guidance when approved.                                                                                   |
| `packages/agentic/desktop-driver/AGENTS.md`            | Retain ownership/security constraints and local documentation routes. Do not move its package reference tree.                                                           |
| `packages/framework-base/AGENTS.md`                    | Retain modern-pattern/React compatibility boundaries; update shared focus links.                                                                                        |
| `packages/framework-base/src/accessibility/AGENTS.md`  | Retain abstraction/import constraints and qualification requirements; it is cited by product specs. Separate mixed technical evidence only with owner review.           |
| `packages/framework/framework/AGENTS.md`               | Keep framework-maintainer entrypoint; extract reusable v1 consumer guidance to `components/v1.md`.                                                                      |
| `packages/deprecated/foundation-compose/AGENTS.md`     | Keep deprecated-framework entrypoint; extract reusable v0 guidance to `components/v0.md`.                                                                               |
| `apps/storybook/AGENTS.md`                             | Retain app invariants and `agent-map.yaml` route. Keep operational diagnostics app-owned and deduplicate only after reconciling scripts.                                |

Update tracked inbound Markdown links, anchors, backtick paths, map paths, and
tooling/profile dependencies atomically. Keep the root
`#apple-native-authoring-and-office-integration` anchor as a short route if
Apple extraction is later approved. Preserve the component focus anchor.
Compatibility redirects are ordinary Markdown, not additional active skills.
Check packed-package contents if changing package-local documentation paths;
do not assume such files never ship.

## 8. Phased execution and gates

All phases require owner approval of their blocking decisions. The coordinator
owns the ledger, routing, and synthesis; affected package maintainers own
technical parity; the user owns architecture/policy choices and acceptance.

| Phase                                      | Work and dependencies                                                                                                                                                                                                                                                                    | Exit gate                                                                                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| P0: baseline                               | Resolve D01-D08 as relevant. Inventory paths, rule definitions, consumers, anchors, stale claims, supported runtimes, and observed loading. Capture a rule-preservation ledger before edits.                                                                                             | Approved pilot scope and cases; discovery assumptions recorded, not guessed.                                                       |
| P1: bounded pilot                          | After P0, add classification route, one v1 consumer extraction, a `review-component` prototype, and limited non-safety root slimming associated with those routes. Resolve stale statements in the touched scope before extraction. No native/safety relocation or source-adapter moves. | Static integrity, actual discovery, correct routing, and preserved rules; efficiency reported without a mandatory percentage gain. |
| P2: workflow rollout                       | After successful P1 and D02-D04, add merged v0/v1 and native entrypoints, separate recipes, and small agreed integrity tooling under D09.                                                                                                                                                | Mixed-generation and native-overlay cases select the correct recipes; review remains read-only.                                    |
| P3: shared-reference consolidation         | After P2 and D10, move proven shared focus/Windows guidance and genuinely shared agentic recipes. Keep source adapters and domain docs local.                                                                                                                                            | Inbound links/anchors updated; no lost rule, evidence limit, owner, or contract meaning.                                           |
| P4: safety and compatibility qualification | Only after explicit D06 approval and parity review, consider Apple/permissions extraction. Requalify adapters, packed-file effects, and supported-client loading; wire approved integrity checks into CI.                                                                                | Safety parity, truthful native evidence, and compatibility retained. Removal requires a separate explicit retirement decision.     |
| P5: optional efficacy loop                 | After stable earlier phases and D11-D12, introduce proposal-only assessment using approved evidence and untouched holdouts.                                                                                                                                                              | Human-reviewed improvement with regression evidence; no autonomous canonical policy edits.                                         |

No unrelated native rebuild is required merely to move Markdown. If instructions
change a native recipe, validate the actual affected boundary and record
unavailable host/Office/runtime checks. A source build is not evidence of
physical input, UIA/AX action dispatch, or Office qualification.

### Pilot cases and measurement

Use six development cases: v0 Button maintenance, v1 Button review, compressible
Text review, agentic Button plan-only work, Icon primitive review, and a
native-backed experimental Checkbox review. Reserve holdouts covering a
modern implementation behind a legacy native-core facade, macOS extern
registration, Storybook operations, and dependency remediation.

Compare baseline and candidate instructions against the same frozen product
source, task inputs, tools, model configuration, and permissions. Record the
distinct instruction revisions/hashes. Begin with one paired run per approved
case; repeat noisy/ambiguous cases only within D08's resource budget. Qualify a
second supported configuration before broad promotion.

Hard gates: correct domain routing, no critical-rule loss, no unauthorized
writes or review-to-implementation switch, and no unsupported success claims.
Report per-case loading, duplicate injection, actual tokens when exposed,
tool calls, elapsed time, and human verdict. Small samples and synthetic
routing tasks do not prove end-to-end component-authoring efficacy.

## 9. Integrity and validation

Use existing tooling first. Add a small deterministic integrity check only
for gaps that existing tools do not cover; do not disguise agent evaluation as
static linting.

| Check                             | Method                                                                                                                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preservation                      | Every previous consequential rule maps to a retained/new authoritative location or an explicitly approved retirement; observations retain versions and evidence limits.                                  |
| Links and fragments               | `yarn lage test-links`; additionally verify cross-file heading fragments, compatibility anchors, case-sensitive paths, and registered backtick/map references. Current fragment coverage is unqualified. |
| Routing integrity                 | Check missing targets, redirect chains, cycles, conflicting mandatory loads, metadata validity, and duplicate rule definitions rather than repeated ID references.                                       |
| Formatting/repository conventions | `yarn format:check` and `yarn lint-repo` for migration changes; use targeted formatting during iteration.                                                                                                |
| Permission parity                 | `yarn test:agent-permissions` when touching permission-related surfaces; hook behavior must remain unchanged unless separately authorized.                                                               |
| Contract-linked changes           | `yarn workspace @fluentui-react-native/components check:spec-contracts` when changing linked instruction locations or contract-sensitive guidance.                                                       |
| Packaging changes                 | `yarn check-publishing` and owning-package archive inspection when package documentation paths or published manifests change.                                                                            |
| Runtime discovery                 | Probe root and nested cwd using actual supported client versions; inspect loaded instructions, active skills, and duplication. Static links do not establish runtime discovery.                          |
| Native validation reporting       | Record executed, failed, skipped, not-run, and unsupported checks separately, with reasons. All-skipped or JS-only evidence is not native qualification.                                                 |

For implementation/tooling additions, run the owning declared tests/builds and
root graph only when their scope warrants it. Inspect manifests before using
commands; do not assume generic `check`, `depcheck`, or direct runner scripts.
The commands above are migration validation requirements, not claims that this
planning task executed them all.

## 10. Optional agent-efficacy improvement workflow

`assess-agent-efficacy` should accept an explicit assessment request and
approved sanitized evidence. A description requesting explicit invocation is
not an enforced opt-out; verify runtime selection controls and retain an entry
gate that stops without user intent.

Capture case ID, instruction/product revisions, model/client/tool versions,
loaded-file evidence, rule failures, actual command outcomes and skip reasons,
numeric usage where available, and human assessment. Exclude credentials,
private source bodies, personal identifiers, raw transcripts, and unrestricted
machine-log discovery. Do not upload evidence or publish a PR without separate
authorization.

The output is a local proposal: observed failure, inferred root cause, smallest
instruction/skill change, expected benefit, tradeoffs, and regression results.
Apply it only through human review. Permission hooks/text, security-age policy,
native safety rules, and contract admission are protected review surfaces;
automated assessment cannot weaken or rewrite them.

Prefer repeated evidence across task families and more than one supported
configuration. Keep acceptance holdouts unseen while tuning; a reused holdout
becomes a development case. Control for model upgrades, tool availability,
task difficulty, caching, compaction, human steering, network/toolchain
failures, native permissions, skipped tests, active plugins, and judge bias.
Cheaper output is not an improvement if correctness or safety regresses.

## 11. User decisions required before execution

Recommendations are not approvals. Edit **Answer** and **Status** below.
Use `Answered` or `Deferred`; a deferral should name its reconsideration event.

| ID  | Decision                         | Recommendation                                                                                                          | Blocks                           |
| --- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| D01 | Shared home                      | `references/agents/`, not all package references centralized                                                            | P1 extraction                    |
| D02 | Workflow granularity             | Merged v0/v1 entrypoint, separate recipes, one review skill, native overlay                                             | P2 skills                        |
| D03 | Skill names and compatibility    | Retain existing names; add `maintain-v0-v1-component`, `review-component`, and `implement-native-component`             | P2 discovery                     |
| D04 | New v1 component policy          | Preserve current supported behavior; explicitly decide whether new v1 work remains allowed                              | v1 workflow scope                |
| D05 | Supported agent/client matrix    | Qualify Copilot CLI and Claude Code if required; inventory other actual consumers before promising support              | Discovery claims/adapter changes |
| D06 | Safety extraction                | Keep Apple/permissions text in first pilot; later extraction only with parity review and retained safety routes/anchors | P4 safety migration              |
| D07 | Metadata and rule IDs            | Minimal shared-reference frontmatter, selective `R-`/`C-` IDs, Git/hash result identity; no rich registry initially     | Eval-ready metadata/tooling      |
| D08 | Pilot budget and acceptance      | Approved paired cases, correctness/safety hard gates, efficiency measured; 30% only an optional later target            | Pilot runs/rollout               |
| D09 | Integrity tooling                | Small link/anchor/rule checker; wire into existing CI after pilot                                                       | Tooling/CI changes               |
| D10 | Recipe relocation and retirement | Move only demonstrated shared recipes; preserve adapters/anchors/redirects until explicitly retired                     | P3 moves/removal                 |
| D11 | Evidence and fixture storage     | Sanitized portable fixtures may be committed; raw logs stay out; no external collection without approval                | Eval fixtures/assessment inputs  |
| D12 | Improvement governance           | Defer proposal-only efficacy skill until pilot evidence; require human approval for promotion                           | P5                               |

### D01: Shared home

**Status:** Unanswered  
**Answer:**

Choose `references/agents/` (recommended), root `references/`, or
`.github/references/`. The first preserves a root reference namespace for
future non-agent material. Product-owned documentation remains local under
every option.

### D02: Workflow granularity

**Status:** Unanswered  
**Answer:**

Choose the hybrid above (recommended), separate v0/v1 implementation skills
with one review router, or all eight `implement-*`/`review-*` skills. Separate
generation recipes and native-overlay composition are required in all cases.

### D03: Names and discoverable compatibility

**Status:** Unanswered  
**Answer:**

Keep existing names initially (recommended), or adopt `implement-*` consistently,
including renaming agentic authoring. Choose whether the native name should be
`implement-native-component` or broader `native-authoring`. No duplicate active
aliases; define any supported transition period explicitly.

### D04: v1 admission policy

**Status:** Unanswered  
**Answer:**

Are new v1 components supported, maintenance-only, or allowed only for specific
compatibility requirements? The reviewers did not establish a current
maintenance-only v1 prohibition. Do not invent one during reorganization.

### D05: Required clients and adapter behavior

**Status:** Unanswered  
**Answer:**

Name required clients/versions: Copilot CLI, Claude Code, VS Code, cloud coding
agent, code review, Agency, or others. Claude/GPT models inside Copilot are not
evidence of Claude Code discovery. Keep current adapters until the required
matrix verifies imports, nested scopes, skill discovery, and duplication.

### D06: Safety material

**Status:** Unanswered  
**Answer:**

Approve deferred extraction with parity review (recommended), retain full
safety guidance always-on permanently, or specify another boundary. Short
native/permission safeguards and explicit conditional routes remain always-on;
no actual policy change is included.

### D07: Metadata convention

**Status:** Unanswered  
**Answer:**

Choose minimal frontmatter plus selective IDs (recommended), a single minimal
catalog instead, or plain Markdown initially. Do not duplicate routing and
ownership metadata across multiple inventories. Future evals record revision
and computed hashes, not manually maintained per-file versions.

### D08: Pilot resource budget and thresholds

**Status:** Unanswered  
**Answer:**

Approve/adjust the six development and four holdout cases, configurations,
run/retry ceiling, and evidence method before runs. Choose whether efficiency
is reporting-only (recommended) or has a measured acceptance threshold.
The first pilot does not promise a 30% reduction or an 8 KB root.

### D09: Checker and CI scope

**Status:** Unanswered  
**Answer:**

Approve a small deterministic integrity checker and later CI wiring
(recommended), or manual checks initially. Decide whether it is invoked by
existing lint/link infrastructure or a declared dedicated script. It checks
instruction integrity, not model behavior.

### D10: Shared recipes and compatibility retirement

**Status:** Unanswered  
**Answer:**

Approve consumer-driven recipe moves (recommended), centralize all agent
recipes, or retain skill-local recipes. Keep contract source adapters local
unless actual reuse changes. Set the event required to retire old reference
paths; preserve product-linked anchors irrespective of routine cleanup.

### D11: Evidence storage

**Status:** Unanswered  
**Answer:**

Choose checked-in sanitized case fixtures with local execution evidence
(recommended), entirely local cases, or a separately approved external store.
Define public/private boundaries and any retention requirements. Framework
selection can remain deferred.

### D12: Improvement loop

**Status:** Unanswered  
**Answer:**

Defer `assess-agent-efficacy` until the pilot establishes useful measurements
(recommended), add a proposal-only skill earlier, or omit it. Define reviewer
ownership and promotion evidence; no autonomous safety edits or external
publication under any option.

## 12. Cross-review reconciliation and provenance

| Topic                 | Reconciled recommendation                                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root namespace        | Both reviewers accepted `references/agents/` after cross-review.                                                                                                                                     |
| v0/v1 skill count     | Astra revised its initial separate-skill recommendation to a merged classifier entrypoint with separate recipes; retain splitting as a decision/pilot fallback.                                      |
| Review/native split   | Both favored one review workflow and native as an orthogonal entry/overlay.                                                                                                                          |
| Recipe centralization | Reject wholesale source-adapter migration. Move agentic recipes only with demonstrated implementation/review reuse; move focus/Windows guidance because existing consumers already cross boundaries. |
| Pilot scope           | Reject Claude's initial safety-heavy root rewrite. Use limited non-safety slimming so the pilot can measure something; do not require the final root-size target immediately.                        |
| Authority             | Reject a repository-defined global precedence ladder. Apply actual runtime authority, domain scopes, and explicit conflict resolution.                                                               |
| Metadata              | Both rejected rich duplicated inventories. This synthesis recommends minimal frontmatter; the remaining format choice is D07.                                                                        |
| Compatibility         | Preserve Apple/focus anchors and ordinary Markdown redirects; avoid active alias skills.                                                                                                             |
| Efficiency            | Treat byte/token/latency savings as measured outcomes, not unsupported forecasts; safety and correct routing are hard gates.                                                                         |
| Eval fixtures         | Reviewers differed on local-only versus checked-in fixtures. Portable sanitized cases need no chosen framework; owner approval under D11 resolves storage.                                           |

Research used `claude-opus-5.5` and `gpt-6-astra`, each with `xhigh` reasoning
and `long_context`, first independently and then in reciprocal peer review.
The invocation interface exposes no exact token-window setting, so **an exact
1M-token context was requested but could not be verified**.

The four complete reports are retained as session artifacts:
`claude-independent-report.txt`, `astra-independent-report.txt`,
`claude-cross-review.txt`, and `astra-cross-review.txt`. They are provenance,
not repository instruction entrypoints. Reviewer findings remain distinguishable
from runtime-qualified behavior and owner-approved decisions.

**Known gaps:** supported-client discovery, exact context capacity,
cross-file fragment checking, external reference consumers, packed
instruction-file contents, quantitative efficacy, and unavailable native
qualification remain open until the relevant phase. No component code,
instruction files, skills, contracts, or permission hooks were changed to
produce this plan.
