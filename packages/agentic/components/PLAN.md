# Next component generation round

**Status: five-component code generation integrated; endpoint acceptance remains gated.**
Prepared 2026-10-01 from [#4273](https://github.com/microsoft/fluentui-react-native/issues/4273)
and current repository evidence. GPT 6 Astra and GPT 6.1 Sol independently
planned the round, then reviewed each other's proposal. This document records
the reconciled scope, prerequisite decisions, parallel work boundaries, and
acceptance gates. No components, source releases, or issue states change as a
result of writing the initial plan.

## Execution tracking

The user authorized the five-component core round on 2026-10-01, with the
current baseline retained and optional extensions excluded. The existing
Callout production dependency is explicitly approved as a narrow anchored-overlay
exception in `src/AGENTS.md`. Profiled workers use the unchanged pinned release;
the CLI exposes its verified component skills under unqualified names while
provenance retains canonical `flex-components:<key>` IDs.

The user approved Toolbar's bounded composition: explicit `ToolbarButton`
commands reusing Button's existing pipeline, plus Divider. Arbitrary editable,
nested, or opaque custom children are excluded rather than silently adapted.
The pinned Toolbar source does not require automatic overflow. This replaces
the provisional arbitrary-child assumption below; custom target adapters
would require a separately reviewed extension.

The user also authorized minimal native Callout/focus prerequisite work for
Menu and subsequently selected full `macos-menu-first` behavior. The delivered
Callout protocol supplies managed readiness, owned-child focus, guarded close,
macOS nested popup families, original-event Tab continuation, and live pointer
hit targeting. Windows retains the reviewed flat managed protocol; prebuilt
Win32 retains native-default restoration without new managed messages.
Menu use is explicitly rejected on Windows/Win32, and those endpoints exclude
its stories intentionally. This is an admission gate, not reduced Menu parity.

| Component  | Current execution state                                             | Acceptance still required                                              |
| ---------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Label      | Implemented and integrated; local package/root gates pass           | VoiceOver/Narrator announcements and other native endpoints            |
| Popover    | Base and semantic Menu composition integrated and reviewed          | Passive popup observation, native actions/projections and P readiness  |
| Toolbar    | Implemented and integrated; local package/root gates pass           | Endpoint grouping/navigation, projections and announcements            |
| RadioGroup | Implemented and integrated; local package/root gates pass           | Endpoint navigation, AX/UIA projections and announcements              |
| Menu       | Full macOS-first code integrated; two independent reviews completed | Passive family observation, physical/AX qualification and ratification |

All five lanes used whole-component owners and reviewed pinned sources.
Integrator-owned exports, exact export tests, strict story typing, reporting,
changeset and shared prerequisites are wired. The final composition review
found and corrected commit-order-dependent controlled sibling switching and
caller content-style precedence, with rendered regressions for both sibling
orders and caller spacing. Native-fixture hit interception was corrected by
placing outside controls above the popup while retaining editor-to-trigger
Tab adjacency; physical input is not bypassed.

Local generation is not full round acceptance. Menu and the amended Popover
retain `contract-reviewed` lifecycle pending the required realized/native
evidence; Label, RadioGroup and Toolbar have `implemented` local contracts.
The report therefore has **25 contracts, 23 implemented local components
(22 admitted plus Text), and 27 admitted implementation gaps**. Two of those
gaps now have reviewed code but are not counted as accepted implementations.
The projected 25 implementations/25 admitted gaps below remains conditional.
No optional component, source-lock/profile, dependency manifest, or issue state
was changed. Public publication and full endpoint readiness are not claimed.

### Integrated evidence

Coordinator evidence as of 2026-10-02, on the generation worktree rooted at
`c3a89b0b717a6bcc8c2104fdb11b733b1a725356`:

| Local gate                                                          | Result                                      |
| ------------------------------------------------------------------- | ------------------------------------------- |
| Components format/lint/build and strict story typing                | Passed                                      |
| `yarn workspace @fluentui-react-native/components test --runInBand` | Passed: 72 suites / 779 tests               |
| Framework Base format/lint/build/tests                              | Passed: 23 suites / 194 tests / 6 snapshots |
| Callout format/lint/build/tests                                     | Passed: 3 suites / 47 tests / 1 snapshot    |
| `yarn build`                                                        | Passed                                      |
| Desktop bundles, serialized Windows -> Win32 -> macOS               | Passed on all three endpoints               |
| macOS prep/codegen/native build including family hit targeting      | Passed                                      |

Native evidence uses target `agenticstorybook-macos`, isolated bundle
`com.microsoft.fluentui.agenticstorybook.i36f0d99a63`, RNmacOS 0.81.9 Fabric
and the registered desktop-driver instance. `defaults read -g
AppleKeyboardUIMode` returned **3** (all-controls keyboard navigation enabled).
No machine setting or privacy permission was changed. Every indexed story
rendered: **238 stories**.
Structured named-case results, not `OK wdio` output, establish these counts:

| Component  | macOS passed | Failed after correction | Skipped | Remaining native gate                                                                   |
| ---------- | ------------ | ----------------------- | ------- | --------------------------------------------------------------------------------------- |
| Label      | 7            | 0                       | 0       | Speech, scaling/contrast and other endpoints                                            |
| Popover    | 6            | 0                       | 5       | Passive popup tree/geometry/modality observation; expanded projection and named actions |
| Menu       | 1            | 0                       | 12      | Passive popup-family observation; real AX actions, projection and eventless activation  |
| RadioGroup | 13           | 0                       | 4       | Native role/checked/selected projection and Select action/speech                        |
| Toolbar    | 8            | 0                       | 1       | Native toolbar role projects to AXUnknown on installed RNmacOS                          |

The unified five-component run `3cdf5a27-a23e-4bc8-8887-aea6d0f05541`
executed all 57 selected cases from 2026-10-02T19:01:56.836Z through
2026-10-02T19:07:00.402Z: **35 passed, 0 failed, 22 skipped**.
The exact selection was
`STORYBOOK_SMOKE_STORY='components-{label,popover,radiogroup,toolbar,menu}--*'`
with `yarn storybook smoke --macos --mode stories-and-tests` from
`apps/storybook`. Earlier fixture failures and Toolbar's unsupported role
assertion are superseded by their corrected tests, not hidden. The role
gap is verified in the installed native conversion, not converted to a
successful toolbar assertion. Named-root and child discovery remain separate.

The separately named `Components/Popover/Composition` stories were then run
with `STORYBOOK_SMOKE_STORY='components-popover-composition--*'`. Existing-row
ref attachment/no-second-trigger passes after correcting a test that queried
an intentionally inaccessible root as an AX element. The managed controlled
host case **fails**: the surface renders but native Show/Ready remain zero,
without dismissal or generation. This is an unresolved native presentation
failure, not a successful capability skip. It blocks the amended Popover/Menu
host acceptance and makes the cause of missing Menu popup observations
unproven. Popup helpers wait for commit and never activate another window
to manufacture focus evidence.

Scoped JSON reports and per-case evidence remain under the ignored
`apps/storybook/artifacts/macos/desktop-driver/`; the failed attempt is also
retained in private session storage. Windows Fabric and Office Win32 native
execution are **NOT RUN**, not successful bundles or counted skips. Menu
admission is gated on both. VoiceOver/Narrator speech, high contrast/scaling,
native action APIs and critical popup-family behaviors remain unqualified.
In particular, Menu's closed-trigger pass is **not** a pass for nested Escape,
Tab/Shift+Tab, guarded action-return or physical pointer targeting.

## 1. Recommended scope

Commit to **five whole components: two prerequisite recoveries and three new
implementations**. Recovery means selectively adapting already-authored local
contracts and code to current foundations, not generating replacements or
merging an old branch wholesale.

| Component  | Issue                                                                   | Work          | Prerequisite                                                                                   |
| ---------- | ----------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| Popover    | [#4236](https://github.com/microsoft/fluentui-react-native/issues/4236) | Recover/adapt | Reviewed bounded Callout host capabilities and dependency-policy disposition                   |
| Label      | [#4228](https://github.com/microsoft/fluentui-react-native/issues/4228) | Recover/adapt | Reviewed native label/association contract                                                     |
| Menu       | [#4232](https://github.com/microsoft/fluentui-react-native/issues/4232) | New           | Qualified Popover surface, MenuItem/Divider, consumer-specific focus/dismissal model           |
| RadioGroup | [#4237](https://github.com/microsoft/fluentui-react-native/issues/4237) | New           | Qualified Label legend, Radio, reviewed group selection/navigation ownership                   |
| Toolbar    | [#4248](https://github.com/microsoft/fluentui-react-native/issues/4248) | New           | Button/Divider, eligible-child/ref/navigation contract; Menu only if required overflow uses it |

This keeps Menu as the high-leverage overlay objective while allowing
RadioGroup and a non-overflow Toolbar to proceed independently of popup work.
Full acceptance would produce **25 local implementations: 24 admitted Flex
entries plus Text, leaving 25 admitted gaps**. This is a projection, not a
completion claim.

**Optional, outside the five-component cap:** MenuButton after qualified Menu;
the navigation family after a separately approved NavItem recovery; List after
Win32 child-host qualification. The coordinator must obtain explicit scope
authorization, revise the total recovery/new-component cap, and satisfy each
new worker's gates. Optional work is not an automatic replacement for a blocked
core lane. All other historical recovery and new generation remain deferred.

Before dispatch, confirm the integration baseline and scope cap. A source,
contract, native, or API blocker pauses only its affected lane unless the DAG
establishes a real shared dependency. A partial result must name unaccepted
components rather than claim the five-component round complete.

## 2. Baseline and catalog reconciliation

**Observed baseline:** `user/jasonvmo/components-wave-three` at
`c3a89b0b717a6bcc8c2104fdb11b733b1a725356`. Its 20 higher-order components have
implemented/reviewed local contracts, public exports, and referenced evidence.
The declared contract checker validated all 20 during planning. That proves
local contract consistency, not source consultation or native readiness.

The **19 implemented admitted entries** are:
`accordion`, `avatar`, `badge`, `button`, `card`, `checkbox`, `divider`, `input`,
`list-item`, `listbox-item`, `menu-item`, `progress-bar`, `radio`, `skeleton`,
`spinner`, `switch`, `tab`, `tablist`, `tag`.
`text` is the twentieth local component, with a sole local-foundation source.
Primitives, standalone Callout, and FocusZone demonstrations are not Flex
catalog completions.

| Named set                                                              | Observed result                                                             |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Admitted release in [the source lock](./spec-source-lock.json)         | 49 entries                                                                  |
| Current admitted implementations / gaps                                | 19 / 30                                                                     |
| Current local higher-order implementations                             | 20, including Text                                                          |
| Recorded candidate snapshot in [the report](./spec-source-report.json) | 52 entries, acquired 2026-08-31; not a fresh October upstream check         |
| Candidate-only additions                                               | Persona, PresenceBadge, Toast                                               |
| Original #4273 child tasks today                                       | 32: 30 admitted gaps, implemented/closed TabList, candidate-only/open Toast |

#4273's historical 50/18/32 inventory remains useful for task identity, but is
not the current admitted-release inventory. All original children except
TabList remain open as observed on 2026-10-01. Issue state, branch-only
implementation, publication, local lifecycle, and platform qualification are
separate facts.

**Observed historical work:** local `user/jasonvmo/components-next` at
`fdc8914c6ee2ba124ccd68f3b9e0ef841a60342d` contains nine additional implemented
local contracts: AvatarGroup, DestructiveButton, InteractionTag, Label, Link,
NavItem, Popover, SearchBox, Tooltip. Its 29/21 local-implementation/release-gap
report describes that branch, not this checkout. The branch is not an ancestor
of the baseline and includes unrelated Native Lib work.

**Recovery protocol:** record exact donor paths/revisions, compare relevant
component repairs through `a0fe649874156980d393b2a739167692c893bee8` and later
component-local changes, and preserve unchanged reviewed requirements.
Re-review changed behavior against current refs, focus targets, accessibility
actions, theme/text metrics, and typed WDIO stories. Port only approved
component slices; do not overwrite current shared plumbing, import obsolete
focus helpers, or restore historical manifests/exports wholesale. Regeneration
requires an explicit contract/API reason, not merely absence from this tree.
Any baseline change requires named-set reconciliation before dispatch.

## 3. Complete disposition of the original 32 tasks

Each kebab-case key identifies its future `flex-components:<key>` invocation.
An absent contract is first-phase authoring work, not a reason to resurrect the
removed copied `specs/` tree.

| Key / issue                                                                                    | Disposition                    | Actual next dependency or decision                                                                                                   |
| ---------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `avatar-group` / [#4218](https://github.com/microsoft/fluentui-react-native/issues/4218)       | Deferred recovery              | Existing Avatar; grouping/overflow and native layout/announcement review                                                             |
| `breadcrumb` / [#4219](https://github.com/microsoft/fluentui-react-native/issues/4219)         | Deferred new                   | Menu/Tooltip only for adopted overflow/truncation behavior                                                                           |
| `combobox` / [#4220](https://github.com/microsoft/fluentui-react-native/issues/4220)           | Deferred new                   | Input/ListboxItem, popup, actual versus virtual-focus/announcement model                                                             |
| `destructive-button` / [#4221](https://github.com/microsoft/fluentui-react-native/issues/4221) | Deferred recovery              | Preserve Button; explicitly review distinct component/variant disposition                                                            |
| `dialog` / [#4222](https://github.com/microsoft/fluentui-react-native/issues/4222)             | Deferred new                   | Modal host/scrim, arbitrary-child trap, background AX/UIA isolation, safe return                                                     |
| `drawer` / [#4223](https://github.com/microsoft/fluentui-react-native/issues/4223)             | Deferred new                   | Modal/nonmodal scope; required modal behavior cannot be silently dropped                                                             |
| `dropdown` / [#4224](https://github.com/microsoft/fluentui-react-native/issues/4224)           | Deferred new                   | ListboxItem, popup/selection, explicit native focus model; not forced Combobox reuse                                                 |
| `field` / [#4225](https://github.com/microsoft/fluentui-react-native/issues/4225)              | Deferred new                   | Label/control association, validation announcements, canonical status icons                                                          |
| `info-label` / [#4226](https://github.com/microsoft/fluentui-react-native/issues/4226)         | Deferred new                   | Qualified Label/Popover and distinct informational trigger relationship                                                              |
| `interaction-tag` / [#4227](https://github.com/microsoft/fluentui-react-native/issues/4227)    | Deferred recovery              | Tag/Avatar, main versus dismiss action ownership and refs                                                                            |
| `label` / [#4228](https://github.com/microsoft/fluentui-react-native/issues/4228)              | **Core recovery**              | Native label/association proof; no inferred HTML `for` or press-to-focus                                                             |
| `link` / [#4229](https://github.com/microsoft/fluentui-react-native/issues/4229)               | Deferred recovery              | Native navigation/callback, activation, text and underline contract                                                                  |
| `list` / [#4230](https://github.com/microsoft/fluentui-react-native/issues/4230)               | Optional gated new             | ListItem, collection ownership, documented Win32 child-host crash gate                                                               |
| `menu-button` / [#4231](https://github.com/microsoft/fluentui-react-native/issues/4231)        | Optional gated new             | Qualified Menu and approved Button-compatible trigger anatomy                                                                        |
| `menu` / [#4232](https://github.com/microsoft/fluentui-react-native/issues/4232)               | **Core new**                   | Popover surface plus separate native Menu focus/dismissal gate, MenuItem/Divider                                                     |
| `message-bar` / [#4233](https://github.com/microsoft/fluentui-react-native/issues/4233)        | Deferred new                   | Canonical status assets/licensing and announcement/action contract                                                                   |
| `nav-item` / [#4234](https://github.com/microsoft/fluentui-react-native/issues/4234)           | Optional prerequisite recovery | Port current leaf refs/focus; selected/disclosure/identity qualification                                                             |
| `nav` / [#4235](https://github.com/microsoft/fluentui-react-native/issues/4235)                | Optional gated new             | Qualified NavItem, hierarchy/disclosure/selection; routing scope explicit                                                            |
| `popover` / [#4236](https://github.com/microsoft/fluentui-react-native/issues/4236)            | **Core recovery**              | Bounded host qualification; recovery does not establish Menu focus guarantees                                                        |
| `radio-group` / [#4237](https://github.com/microsoft/fluentui-react-native/issues/4237)        | **Core new**                   | Label legend explicitly required by issue; Radio, group naming/selection/navigation                                                  |
| `scrollbar` / [#4238](https://github.com/microsoft/fluentui-react-native/issues/4238)          | Deferred new                   | Scroll-metrics/host ownership and accessible manipulation; no fake thumb                                                             |
| `search-box` / [#4239](https://github.com/microsoft/fluentui-react-native/issues/4239)         | Deferred recovery              | Current Input/Button; editor/clear/IME/ref/layout regressions                                                                        |
| `select` / [#4240](https://github.com/microsoft/fluentui-react-native/issues/4240)             | Deferred new                   | Owner chooses native versus composed realization; not an invented Dropdown alias                                                     |
| `simple-nav` / [#4241](https://github.com/microsoft/fluentui-react-native/issues/4241)         | Optional gated new             | Qualified NavItem, compact navigation; Nav is not automatically a hard edge                                                          |
| `split-button` / [#4242](https://github.com/microsoft/fluentui-react-native/issues/4242)       | Deferred new                   | Qualified Menu/Button and reviewed two-target semantics; MenuButton reuse optional                                                   |
| `tablist` / [#4243](https://github.com/microsoft/fluentui-react-native/issues/4243)            | Implemented; closed            | Preserve contract and use as current navigation/focus precedent                                                                      |
| `teaching-popover` / [#4244](https://github.com/microsoft/fluentui-react-native/issues/4244)   | Deferred new                   | Qualified Popover, instructional/actions/progression contract                                                                        |
| `textarea` / [#4245](https://github.com/microsoft/fluentui-react-native/issues/4245)           | Deferred new                   | Explicit no-resize/growth decision and native multiline/IME/scroll semantics                                                         |
| `toast` / [#4246](https://github.com/microsoft/fluentui-react-native/issues/4246)              | Candidate-only; deferred       | Source admission first, then queue/host/lifetime/announcements and status icons                                                      |
| `toggle-button` / [#4247](https://github.com/microsoft/fluentui-react-native/issues/4247)      | Deferred new                   | [#4215](https://github.com/microsoft/fluentui-react-native/issues/4215) Button/ToggleButton API decision; no silent breaking rewrite |
| `toolbar` / [#4248](https://github.com/microsoft/fluentui-react-native/issues/4248)            | **Core new**                   | Eligible arbitrary-child refs, one navigation owner, explicit overflow scope                                                         |
| `tooltip` / [#4249](https://github.com/microsoft/fluentui-react-native/issues/4249)            | Deferred recovery              | Non-focus-taking popup, native description relationship and delay cancellation                                                       |

The 30 admitted gaps partition into **5 core + 5 optional + 20 deferred**.
Candidate Toast and implemented TabList complete the original 32-child set.
Persona and PresenceBadge are candidate-only additions outside that original
set; their admission/tracking is a separate task, not a local-foundation
workaround.

## 4. Flex source and contract gates

Follow [package instructions](./AGENTS.md), [source instructions](./src/AGENTS.md),
[higher-order instructions](./src/components/AGENTS.md),
[contract authoring](../../../.github/skills/agentic-component-contract-authoring/SKILL.md),
its [Flex/X3 adapter](../../../.github/skills/agentic-component-contract-authoring/references/sources/flex-x3.md),
and [component authoring](../../../.github/skills/agentic-component-authoring/SKILL.md).
Use [SPEC-SOURCE.md](./SPEC-SOURCE.md) for lifecycle/provenance, the canonical
[Flex token map](../design/src/tokens/mappings/flex-token-map.yaml), current
Button/Icon precedents, and desktop/V1 compatibility evidence.

**Observed identity, not consultation:** [agency.toml](../../../agency.toml)
and the lock agree on `flex-1.5.0-206c4996`, Marketplace index commit
`206c4996205b027f4d806ac4ac7366f1f0ab0d5a`, fingerprint
`a69997212ec1b89510c94176801bf5a146ed7e7d8c80cc7db40ac8f60cf9f119`,
and X3 lineage `334d3b82a08b610b0002fe922ce9b4dac4db64f2`.
The `flex-authoring` profile pins all three Flex plugins with `no-refresh`.
The planners observed matching cache identities, but no Flex component skill
bodies were invoked/consulted in this session. Cache TTL and recorded prior
`surfacesConsulted` assertions are not source drift or fresh consultation.

Every component owner must, in the correctly profiled authoring environment:

1. Start `agency copilot --profile flex-authoring`, verify actual resolved
   payload/file identities against the unchanged lock, and invoke its named
   skill: `flex-components:popover`, `flex-components:label`,
   `flex-components:menu`, `flex-components:radio-group`, or
   `flex-components:toolbar`. Optional workers use their own inventory key.
2. Read actual shared/usage and applicable platform companions from that same
   release. Record only consulted surfaces; do not silently substitute web or
   iOS behavior for desktop evidence. Source access failure blocks that
   component, not a license to invent guarantees or change pins.
3. Preserve or author original `SPEC.md`, `spec/source.json`,
   `spec/tokens.yaml`, `spec/accessibility.md`, `spec/interaction.md`, and
   `spec/usage.md`, with requirement IDs, explicit authority/adaptation,
   state/ref/API decisions, token gaps, divergences, and planned evidence.
   Composite sources require immutable identities and authority per requirement.
4. Obtain independent pre-code contract review. New/changed draft contracts
   retain `contract-draft`, `review-required`, and a null review date until
   reviewed. Do not use a checker or provenance refresh to approve a contract.
5. Implement the cohesive component, then reconcile realized types, tests,
   stories, and platform evidence. Set `implemented` only when the referenced
   evidence exists; report native qualification separately.

The integrator may generate pinned provenance **before** handing its exact
revision to the contract owner:

```sh
yarn workspace @fluentui-react-native/components report:spec-source-drift --write --update-sources --component <key>
```

Never refresh a source file during its owner's write/review lease. Freeze
`agency.toml` and `spec-source-lock.json` throughout the round. Candidate
admission and mutable upstream refresh are separate reviewed decisions.
Commit only permitted identities/digests and original React Native contracts;
do not copy or lightly rewrite private source bodies, rationale, or token tables
into public documentation, code, tests, issues, or PRs.

## 5. Foundation decisions and capability-specific gates

| Gate                        | Accountable role                  | Required disposition                                                                                                                                                                    |
| --------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B0: baseline/recovery       | Coordinator + integrator          | Exact current baseline, donor slices, scope cap, and compatibility review; no wholesale historical branch/Native Lib import                                                             |
| D1: dependency policy       | Package maintainer                | Explicitly reconcile existing production Callout usage with the literal source dependency allowlist; any production FocusZone choice needs its own approved manifest/policy disposition |
| P: Popover host             | Popover owner + native owner      | Actual anchors, mounting, sizing/placement, theme/modality and content semantics on claimed endpoints, within the recovered contract                                                    |
| FM: Menu feasibility        | Menu owner + native/focus owner   | Approved route to live item focus, popup keyboard delivery, required dismiss reasons and safe restoration; missing capabilities become separately scoped foundation work                |
| FR: group naming/navigation | RadioGroup owner + reviewer       | Label legend association/name, group state ownership, stable identities, selection/focus policy and one navigation owner                                                                |
| FB: toolbar navigation      | Toolbar owner + reviewer          | Eligible child/ref registration, nested/editable controls, Tab exit, and whether overflow introduces a Menu edge                                                                        |
| H(List): optional host      | Leaf/native owner + List reviewer | Reproduce and resolve/disposition the documented Win32 ListItem host crash before List qualification                                                                                    |

P is **not** FM. Historical Popover deliberately limits portable initial-child
focus, return focus, reason-rich dismissal, and nested coordination. Windows
Callout's focus/blur-window command handlers contain `nyi`, and standalone
Callout stories are excluded on Windows. Qualify each required actual path;
neither infer all popup transport is impossible nor rely on missing commands
as implemented. Future Tooltip additionally needs its own non-focus,
noncapture, description, and cancellation gate rather than inheriting FM.

Pre-code FM establishes a feasible approved capability/interface path.
Full Menu behavior is verified only after implementation; do not create a
dependency cycle requiring future Menu tests to pass before Menu can be written.
If a required capability cannot be supplied, pause Menu acceptance, preserve
its contract work, and scope the smallest owner-approved foundation repair.

FocusZone provides navigation, not arbitrary modal trapping or editor-retained
virtual focus. Its development dependency does not authorize production import.
Current TabList/Framework Base FocusTarget are available precedents. Choose
one navigation owner per scope; never run competing JS/native key loops.
Keep collection-specific logic local until real repeated consumers justify an
extraction. General non-styling helpers belong in Framework Base, style helpers
in design, and component-private shared glue in `src/common`.

Keep deferred gates explicit: Dialog/Drawer need trapping/background isolation;
Combobox/Dropdown need a native focus/announcement decision; MessageBar/Field/
Toast need canonical status assets, not generic Unicode Icon fallbacks;
Scrollbar/Select/Textarea need their recorded host/realization/resize choices.
Do not pull these unrelated systems into the core round.

## 6. Parallel execution and exclusive ownership

```text
B0 + each component's pinned source gate
  -> original/recovered contract -> independent pre-code review

Label recovery + qualified legend/name relationship + Radio -> RadioGroup
Popover recovery -> P + approved FM path + MenuItem/Divider -> Menu
Button/Divider/FocusTarget + FB ----------------------------> Toolbar
  [add Menu -> Toolbar only if required overflow selects it]

Each accepted slice -> single integrator -> integrated checks
                    -> endpoint evidence -> realized-contract ratification

Optional: NavItem recovery/qualification -> Nav and SimpleNav independently
          ListItem + H(List) -> List
          accepted Menu + approved trigger anatomy -> MenuButton
```

**Maximum three active whole-component workers**, plus the coordinator's
review/integration role. Start Label recovery, Popover recovery, and Toolbar
source/contract work. After Label is integrated, dispatch RadioGroup; after P
and FM feasibility pass, dispatch Menu. Contract drafting may run ahead of
predecessor implementation within the same capacity cap, but unresolved
interface assumptions are not permission to implement against invented APIs.

Each fresh worker owns one entire component through contract, types, state,
styles, render, assembly, tests, stories, and ratification. Do not divide a
component into type/state/style/render subagents. Independent contract review
is a gate, not a transfer of implementation ownership.

| Owner             | Writable scope                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Popover worker    | `src/components/popover/` only                                                                                  |
| Label worker      | `src/components/label/` only                                                                                    |
| Menu worker       | `src/components/menu/` only                                                                                     |
| RadioGroup worker | `src/components/radio-group/` only                                                                              |
| Toolbar worker    | `src/components/toolbar/` only                                                                                  |
| Single integrator | Shared paths listed below, approved prerequisite patches, baseline/recovery scheduling and evidence aggregation |

Paths in this table are relative to this package. Component owners propose
shared changes but do not edit leaves such as Button, Radio, or MenuItem without
a separately assigned exclusive scope and affected-contract review.

**Integrator-only writes:** `src/index.ts`, `src/index.test.ts`,
`src/primitives/index.ts` if an actual approved primitive is needed,
`tsconfig.stories.json`, `spec-source-report.json`, approved package/project
manifests and `yarn.lock`, shared helpers/framework/design/native patches,
changesets, and necessary Storybook discovery/configuration changes.
New story files are already glob-discovered; never hand-edit generated catalogs,
native outputs, runtime identity/lease files, or reports.

Use separate worktrees/branches from the immutable integration base, with public
branch prefix `user/jasonvmo/`, or exclusive folder leases when isolation is
impractical. Do not switch/rebase another worker's worktree or share writable
build/generated app state. Prerequisite code and explicit exports must reach
the dependent worker before its implementation begins. Merge/reconcile slices
in DAG order; independent accepted slices need not wait for a blocked lane.
Serialize shared edits, aggregate source reporting, and native instance leases.

### Required worker handoff

Supply the exact issue/skill ID, baseline and dependency revisions, allowed
paths, relevant instructions/companions, reviewed requirements, API/ref/state
decisions, acceptance list, and stop conditions. Return owned-file changes,
reviewed revision, proposed export/story/shared changes, actual command results,
native pass/fail/skip evidence, and unresolved decisions. A blocked worker
returns the failed gate, observation, owner, and smallest next action, not a
stub, silent fallback, or substitute component.

## 7. Component acceptance

| Component  | Contract and regression obligations                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label      | Native legend/name association on each claimed endpoint; explicit platform limits, required/disabled semantics, text scaling, stable refs/native IDs. No assumed HTML behavior.                                                                                                                                                                                                    |
| Popover    | Recovered bounded open/host contract, real anchor/content geometry, constrained text sizing, theme/modality across the popup root, attachment/unmount/ref-replacement races, documented dismissal/focus limits. Changes needed by consumers reopen affected requirements.                                                                                                          |
| Menu       | One navigation/selection/dismissal owner; initial eligible target; headers, empty/all-disabled and dynamic removal; arrows/Home/End/RTL; disabled discoverability versus current MenuItem; explicit type-ahead/submenu/hover scope; exactly-once activation; safe reason-aware return without stealing outside-click focus. Reduced scope does not silently complete all of #4232. |
| RadioGroup | Label legend, controlled/uncontrolled group selection, externally selected Radio leaves, stable item identity, no/initial selection, selection-before-focus policy, disabled/removal cases, real checked state and accessible group name. No overlay dependency.                                                                                                                   |
| Toolbar    | Supported arbitrary-child/ref contract, nested/editable controls, one key owner, grouping and Tab exit, disabled/removal/RTL cases, explicit mandatory versus excluded overflow. Required overflow adds its actual dependency rather than disappearing for concurrency.                                                                                                            |

All components need finite API/default axes, intentional slots and React 19
root/inner refs with cleanup; token bindings/gaps and immutable theme-only
styles; user forwarding and disabled precedence; runtime and committed type
tests; focused state-style snapshots where useful; explicit exports and exact
export-test updates; and colocated typed interactive stories.

Leaves retain externally driven selection rather than acquiring self-selection.
Story args use `default<State>` for self-driving controls; fixed `selected` is
valid for externally driven leaves, with interactive demos owning selection.
Use stable IDs and top-level named `wdio` callbacks typed with `WdioStory`.
Include every test-bearing story in `tsconfig.stories.json`; dynamically import
Node-only `*.wdio.ts` helpers inside callbacks. Do not reintroduce legacy
catalog `parameters.desktopDriver` plans.

## 8. Validation and merge barriers

These are **future execution commands**, not results for components generated
in this planning session. Use declared workspace scripts and the smallest
relevant executed-case selector during iteration.

```sh
yarn workspace @fluentui-react-native/components check:spec-contracts
yarn workspace @fluentui-react-native/components format
yarn workspace @fluentui-react-native/components lint
yarn workspace @fluentui-react-native/components build
yarn workspace @fluentui-react-native/components test
yarn build
```

`test` also runs contract and story type checks. The Jest wrapper appends every
discovered test file: positional paths with `--runTestsByPath` are **not**
file-isolated. A verified future suite-name selector can reduce executed cases:

```sh
yarn workspace @fluentui-react-native/components test --runInBand --testNamePattern='^(Menu|MenuItem)( |$)'
```

Confirm actual suite names and nonzero expected matches first. This still
loads the full file set and runs contract/story checks. Final acceptance uses
the unfiltered package test. Use declared snapshot scripts only after reviewing
behavior. Run affected foundation-package scripts for approved shared changes;
run `yarn lage test --no-cache` only if execution becomes a major refactor.
New public exports/types require the root build.

After accepted metadata stabilizes, the integrator runs:

```sh
yarn workspace @fluentui-react-native/components report:spec-source-drift --offline --write
yarn workspace @fluentui-react-native/components check:spec-contracts
```

Offline local reporting is not a fresh live candidate review or contract
approval. Reconfirm the source lock/profile did not change.

Run each declared Storybook command separately; shared generated catalog state
must not have concurrent writers:

```sh
yarn workspace @fluentui-react-native/agentic-components-storybook storybook manifest --macos
yarn workspace @fluentui-react-native/agentic-components-storybook storybook manifest --windows
yarn workspace @fluentui-react-native/agentic-components-storybook storybook manifest --win32
yarn workspace @fluentui-react-native/agentic-components-storybook storybook bundle --macos
yarn workspace @fluentui-react-native/agentic-components-storybook storybook bundle --windows
yarn workspace @fluentui-react-native/agentic-components-storybook storybook bundle --win32
```

Run app format/lint if its configuration changes. Follow the
[Storybook skill](../../../.github/skills/agentic-storybook-development/SKILL.md)
and [app instructions](../../../apps/storybook/AGENTS.md) for diagnostics,
prep/build, driver/privacy prerequisites, and owned lifecycles. From
`apps/storybook`, on the actual endpoint host:

```sh
yarn storybook test --macos --list
yarn storybook smoke --macos --mode stories-and-tests
# On Windows, distinct Fabric and Office/REX endpoints:
yarn storybook test --windows --list
yarn storybook smoke --windows --mode stories-and-tests
yarn storybook test --win32 --list
yarn storybook smoke --win32 --mode stories-and-tests
```

Focused `storybook test --<endpoint> --test '<discovered-case-glob>'` requires
the owned app/driver already running; use the smoke lifecycle otherwise. There
is no `build --win32`: REX is prebuilt. A macOS bundle/mock cannot qualify
Windows or Win32. Finish repository/package tests before native lifecycles;
fixture-generated state can interfere with app leases/nonces.

**Native evidence:** real Tab/Shift+Tab and contracted navigation/activation,
native focus/checked/selected state, popup geometry/lifetime, UIA/AX action
invocation and VoiceOver/Narrator announcements, theme/contrast/text scale,
refs/removal and event order. Preserve endpoint activation timing, editor
shortcuts and native/custom ring policy. Record commit, renderer/version,
commands, target identity, macOS Keyboard navigation setting, scoped ignored
artifacts, and **passed/failed/skipped counts with reasons**.

Existing native projection gaps and discovery exclusions are not intended
component semantics. Do not hide new consumers, fake missing state values,
change machine privacy/settings without authorization, or equate a bundle,
mock, excluded critical story, or zero-exit skipped traversal with native
qualification. Missing critical evidence blocks the claimed readiness level;
local implementation and endpoint readiness remain separately reportable.

## 9. Review resolutions and completion

| Cross-review result                                   | Resolution                                                                                                                    |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Historical code should not be blindly regenerated     | Selective recovery first; only Label/Popover are core recovery commitments                                                    |
| RadioGroup Label prerequisite was omitted             | Explicit Label -> RadioGroup edge and native legend/name gate                                                                 |
| Common popup qualification overclaimed consumer focus | Separate bounded P, Menu-specific FM, and future Tooltip-specific gate                                                        |
| Focused Jest path command was not actually focused    | Use honest full-package acceptance and verified suite-name iteration                                                          |
| Exact runtime export test ownership was missing       | Integrator owns both `src/index.ts` and `src/index.test.ts`                                                                   |
| Callout dependency-policy exception was implicit      | Explicit maintainer disposition; no blanket source-policy rewrite                                                             |
| Scope preferences differed                            | Choose Sol's smaller three-new/two-recovery core; retain Astra's independent navigation family as an explicit gated extension |

Both reviewers support source/contract gates, recovery-first baseline handling,
whole-component ownership, capability-specific native evidence, and bounded
shared integration. They did **not** agree on identical scope or certify future
implementation readiness. The selected smaller core avoids simultaneously
committing to Menu native work, a known ListItem Win32 crash, and a navigation
family recovery while still supporting three independent implementation lanes.

Round completion requires accepted named components, realized-contract review,
integrated command results, endpoint pass/fail/skip evidence, and explicit
remaining decisions. Preserve [#4251](https://github.com/microsoft/fluentui-react-native/issues/4251)
readiness-policy uncertainty; this plan does not ratify beta or production
status. Only accepted components change generated counts. Future issue/PR
writes require execution authorization; use a nonclosing #4273 link for this
partial catalog round and close individual issues only after their actual
acceptance/publication requirements are met.

### Evidence anchors

- Current immutable baseline, [public exports](https://github.com/microsoft/fluentui-react-native/blob/c3a89b0b717a6bcc8c2104fdb11b733b1a725356/packages/agentic/components/src/index.ts),
  [source lock](./spec-source-lock.json), [source report](./spec-source-report.json),
  current local `spec/source.json` records and declared contract checker.
- Historical donor Git objects at `fdc8914c6ee2ba124ccd68f3b9e0ef841a60342d`
  and component repairs at `a0fe649874156980d393b2a739167692c893bee8`;
  historical evidence is not a newly repeated native pass.
- [Callout Windows command implementation](https://github.com/microsoft/fluentui-react-native/blob/c3a89b0b717a6bcc8c2104fdb11b733b1a725356/packages/native/Callout/windows/Callout/Callout.cpp#L132-L140),
  [Storybook platform configuration](../../../apps/storybook/storybook.config.mts),
  [current focus plan](./WIN32-FOCUS-PLAN.md), current TabList and Input contracts.
- [Declared component scripts](./package.json),
  [Jest wrapper](../../../scripts/src/tasks/jest.ts),
  [tests/stories guidance](../../../.github/skills/agentic-component-authoring/references/tests-and-stories.md),
  and live read-only #4273 child state/acceptance evidence as of 2026-10-01.
