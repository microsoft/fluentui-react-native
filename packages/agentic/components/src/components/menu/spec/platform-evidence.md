# Menu evidence plan

## 2026-10-02 coordinator integration

Local implementation and public integration now pass package format/lint/build,
the strict story type project, 72 component suites / 779 tests and the root
build. Framework Base passes 194 tests; native Callout passes 47. Desktop
bundles pass on macOS, Windows and Win32; the macOS family/hit-target codegen
and native build pass. None proves native Menu focus or accessibility.
See the round's [integrated evidence](../../../../PLAN.md#integrated-evidence)
for actual passed/failed/skipped counts and retained acceptance gates.

The independent composition review found two defects, now corrected:
controlled sibling switching depended on row layout-effect setup order, and
structural content spacing overrode caller styles. Changed expansion effects
now clear their previous branch during React's commit-wide layout cleanup
phase before sibling setups; rendered tests switch both ways in both orders.
Native `openSubmenu` still awaits owned close before replacement. Content
styling carries caller style after structural defaults without invoking a slot
early. A resolved-style regression proves caller gap precedence.

The worker evidence below is historical. In particular, an `OK wdio` line or
zero exit can mean an explicit skip. Earlier claims of nested Escape, guarded
return or natural Tab success based solely on those lines are not accepted:
the structured report remains authoritative. The separately observed native
Show/Ready failure was repaired with two guarded post-attachment retries.
Both managed Popover composition cases now pass after rebuilding; native
Menu rerun still records one closed-trigger pass and twelve explicit skips.
Managed host readiness is no longer the known blocker, but popup-family
focus, pointer targeting, Tab/Escape and AX assertions remain unqualified.
Native Menu acceptance and `contract-reviewed` lifecycle ratification stay gated.

**Local implementation authored, 2026-10-02.** Menu/MenuEntry types, context/
controller, styles, slot rendering, assembly, runtime/type cases and typed WDIO
stories now exist. Integrated Jest, package commands, bundles, native Menu
interaction and assistive-technology execution are NOT RUN by this worker.
There is no component readiness level asserted.
Baseline compatibility code and authored legacy tests are evidence of intent,
not new Menu results.

Owned scoped format/check passed on 32 files. Read-only TypeScript 7 API
checked 23 owned TS/TSX files against actual project references and strict
in-memory story inclusion with zero diagnostics. Fifteen isolated in-memory
keyboard/controller/current-hit scenarios and three focused shared-close
assertions passed. These are business-logic checks, not executed Jest suites
or native tests. The source/lifecycle/20 requirement identity and local planned
path-existence assertions passed without changing their metadata values.

`macos-menu-first` targets full pinned Menu behavior on macOS. The native
family delta is delivered; it is not a Menu pass.
Windows/Win32 Menu admission is expressly gated. Parent-generated source.json
is unchanged and remains contract-reviewed/reviewed/2026-10-02, with twenty
planned requirements pending realized-contract ratification.

The coordinator now reports all 47 native Callout cases and final hit-target
macOS codegen/build passing. Earlier 39-case family/build and 36-helper/
11-skipped subset results are historical, not the latest prerequisite status.
None is a Menu physical-hit or AX runtime result.

## 2026-10-02 approved eventless activation follow-up

User/coordinator approval ratifies the optional-event callback on 2026-10-02.
The real onAccessibilityTap route now directly requests command/choice/submenu
semantics, then forwards its observer once, without press/action fabrication.
Root trigger toggles without calling onPress. Disabled/stale observers survive.
The former event-shape implementation blocker is resolved; AX runtime and
projection qualification remain NOT RUN.

Thirteen additional runtime cases and one type case are authored for eventless
commands, all checkable selected states, submenu/trigger activation, disabled/
stale forwarding, exact original press identity and optional callback input.
The owned totals are 48 runtime cases and 3 type cases (51), not executed Jest
passes. EventlessAccessibilityActivation raises the authored story count to 18. Eighteen isolated in-memory cases exercised the actual Menu hook handlers
with bounded dependency doubles and passed. That does not qualify native AX.
Scoped final type/format results are recorded in the handoff; parent executes
integrated package/runtime/native validation.

## Authored local coverage

Runtime/type coverage must exercise all MNU requirements: open presence and
defaults, constrained child validation/identity, one adapter root/target,
external selected values, checkable/submenu type exclusivity, exactly-once
original-event forwarding, disabled/custom named actions, caller style order,
and callback/object refs with React 19 cleanup.
Test import-safe exports and explicit non-macOS use-time rejection, including
closed/default-open instances and direct unstable pipeline use. No trigger,
entry, Callout transport or fake subtree may be created there. A rejected
new managed command is not the mechanism for gating Menu admission.

Add focused request-state tests for native generations, stale results,
first-close arbitration, detach/replacement, controlled true after hide,
rapid reopen, removal/disable/reorder, and submenu ancestor teardown.
Cover atomic originating-child action/root-only return, local submenu-back,
native Tab with no JS close, displaced-movement versus stationary/button-only
events, pointer crossing, and stale/newer owned-child requests. Confirm
result/context/legacy notification ordering produces one state-close request.
These tests can prove JS bookkeeping, not native ownership or focus guards.
Resolved-style coverage should target Menu padding/inherited boundary and
caller styles; leaf visual axes remain MenuItem evidence, not duplicated
full-tree Menu snapshots.

Proposed colocated artifacts are `menu.test.tsx`,
`menu.types.test.ts`, `menu-entry.test.tsx`, `menu-entry.types.test.ts`,
`menu.stories.tsx`, and dynamically imported Node-only `menu.wdio.ts`.
All these files were created only after explicit pre-code/implementation
approval. Scope-only read-only diagnostics and isolated business-logic probes
do not replace their integrated Jest execution.

## Authored stories and coordinator inclusion

Typed metadata is `Components/Menu`. Proposed named stories are Default,
Overview, ControlledOpenRequests, CommandsAndCheckableChoices,
HeadersAndDisabledEntries, EmptyAndAllDisabled, KeyboardAndTypeahead,
RTLSubmenus, HoverAndKeyboardSuppression, TabExit,
NativeDismissAndGuardedReturn, ActionMovesFocus,
DynamicMembershipAndRefs, AccessibilityActions, ConstrainedContent,
and PopupThemeAndModality.
PlatformAdmission covers the explicit guard, without rendering
interactive Menu stories on gated native endpoints to manufacture a pass.

Uncontrolled open uses defaultOpen. Checkable/submenu kind remains fixed per
scene, not an identity-changing control. Stateful examples deliberately own
their selection/controlled values. Use stable IDs and top-level named `wdio`
callbacks typed with WdioStory, with isolated fresh cases.
Parent owns export tests, story-tsconfig inclusion, discovery/bundle state,
changesets, integrated package commands, and native instance leases.
The supported discovery setting is app/package
`StorySettings.platformSettings.<endpoint>.storyPatterns`, not a per-story
platform parameter. Coordinator must exclude menu/ on Windows/Win32 and add
menu.stories.tsx to the strict story project before integrated execution.
The macos-only tag is descriptive, not enforcement or qualification.

## Planned macOS cases and explicit endpoint gates

Run all contracted behavior on macOS Fabric first: root plus two descendant
levels, not only a flat popup. Source/declaration/flat build support is not
family or Menu readiness. Native Callout Paper regression stays its owner's
separate obligation; Menu Paper readiness is not inferred.
Windows/Win32 require later admission and independent parity evidence.

| Endpoint       | Admission/execution           | Passed | Failed | Skipped |
| -------------- | ----------------------------- | ------ | ------ | ------- |
| macOS Fabric   | Targeted, NOT RUN             | 0      | 0      | 0       |
| Windows Fabric | Menu admission GATED, NOT RUN | 0      | 0      | 0       |
| Office Win32   | Menu admission GATED, NOT RUN | 0      | 0      | 0       |

Zero means no execution, not success. Gated platforms are not silently counted
as passed or skipped macOS critical tests. Planned macOS obligations include:

- Keyboard, pointer and real accessibility opening; observe first eligible
  focus without focusing an item or activating the popup to inspect it.
- Vertical wrap, Home/End, character matches/no-match, Unicode/IME and modified
  keys; prove one movement and preserved original observers.
- Return/Space held/repeat/release and blur/disable/detach cancellation;
  command, checkbox, radio and submenu actual native action invocation.
- Empty/all-disabled Escape; child-only Escape/back arrow; nested family
  action-close, sibling switching, RTL row alignment and collision behavior.
- Both natural Tab exits; distinguish them from row cycling or fabricated
  focus on a chosen external ref. Observe original-event forwarding once,
  unchanged owner opening position and no replacement native event.
- Action-close with ordinary return and with caller-directed outside focus;
  real outside pointer to an editor in the same window, another window, and
  another application, plus separate application/window deactivation cases.
- Anchor disable/unmount/replacement, active row removal, popup detach,
  controlled true after native hide, rapid close/reopen, and stale results.
- Original-event native hit identity for padded rows, labels/icons, gaps,
  disabled rows, occlusion/clipping, removed/replaced/ref-recycled targets and
  child-popup source separation. Match current refs; do not dispatch/cache tags.
- Actual roles/names/checked/disabled/expanded state, independent descendant
  exposure, VoiceOver announcements, ring/modality exclusivity,
  high contrast, scaling, constrained labels and oversized content.

Required geometry/visual separation and current macOS projection/driver gaps
remain conformance questions, not hidden exclusions to call the result full.
Owned-child repair and pointer handoff must assert actual
active popup focus, not a retained JS target snapshot.

Later Win32 parity retains V1 pointer-container, disabled discovery,
MenuGroup Tab and persistent-checkbox scenarios as **compatibility comparisons** where the new
contract intentionally differs. Legacy ContextualMenu is a separate, narrower
comparison. It must retain default native restoration with no onRestoreFocus
override or JS refocus. No managed family messages reach prebuilt REX.
Do not claim current Menu support or parity from these retained scenarios.

## Evidence requirements

Record integrated revision, renderer/host versions, target identity, commands
and actual results, scoped ignored artifacts, and macOS Keyboard navigation
setting. Never change machine preferences or activate another window merely
to manufacture a passive focus observation.

Current popup lookup can require a driver capability not yet available:
window switching activates its destination. Named AX/UIA action dispatch and
some native state projection are also separate infrastructure gates. Explicit
skips block their associated readiness claim. No false/true property fallback,
pointer proxy for native action, rendered text for focus, or mock declaration
counts as a native pass.

The coordinator schedules serialized validation after contract/interface
review. This worker runs no package-wide checker/report/format/lint/build/test
or native command while other owners write. Owned-file formatting/read-only
diagnostics and isolated Node probes are recorded in the handoff separately.
Final realized-contract approval
requires existing artifacts and real evidence, not merely this plan.
