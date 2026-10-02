---
name: radio-group
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# RadioGroup

## Review boundary

This original React Native contract for #4237 and the five-component round in
[PLAN.md](../../../PLAN.md) passed independent coordinator pre-code review on
2026-10-01. The coordinator generated immutable Marketplace/X3 provenance;
the pinned release has no RadioGroup content differences. Lifecycle is
`implemented` records the local types, stages, tests and stories named below,
not passed package validation or native qualification. The coordinator owns
those remaining gates; mutable candidate drift does not rewrite this pinned
contract.

The exposed `radio-group` skill alias was invoked for canonical provenance
`flex-components:radio-group`. Its shared skill and usage and all three web
companions were read from `flex-1.5.0-206c4996`. Canonical cache trees,
excluding Agency's generated `.github` envelope, match the three plugin tree
identities in the unchanged source lock. There is no RadioGroup native
companion in that release. Consultation establishes the design input, not
AX/UIA projection or native keyboard qualification.

## Scope

RadioGroup owns the question, one selected value, ordered membership,
eligibility, and directional navigation. Label supplies its visual legend.
Radio supplies each option's existing indicator, text, interaction states,
checked semantics, native Pressable, and focus visuals. Neither leaf acquires
group state or an additional native wrapper.

The child is **RadioGroupItem**, a component-local adapter over
`useRadio_unstable`, `useRadioStyles_unstable`, and `renderRadio_unstable`.
It registers the `FocusTarget` already returned by Radio's state stage.
It does not render a Radio inside another Pressable, inspect an arbitrary
child's ref, add `value` to Radio, or change Radio's externally supplied
`selected` contract. The coordinator approved this bounded adapter.

Label's reviewed interface supplies package Text content, `strong` weight,
`medium` size, visual `required`/`disabled`, a View ref, and
`accessible=false` visual legend mode. RadioGroup must separately establish
the actual group's name and preserve individually accessible options.
Label's owned-folder implementation and interface are integrated.
An overlay or production FocusZone dependency is not proposed.

## Public contract

### RadioGroup

The public slot is `root: Slot<typeof View>`. Legend and options hosts are
private state slots, not general-purpose insertion points.

| Prop                   | Type/default                                 | Ownership                                                                      |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| `label`                | required nonblank `string`                   | Visible question, and default explicit native group name.                      |
| `children`             | required supported child collection          | Two through five RadioGroupItem elements in logical order.                     |
| `selectedValue`        | optional `string \| null`                    | Controlled answer; `null` deliberately means no answer.                        |
| `defaultSelectedValue` | optional `string \| null`, default `null`    | Initial uncontrolled answer, read only on initialization.                      |
| `onSelectionChange`    | `(value: string \| null) => void`            | One notification for an accepted change request or uncontrolled removal clear. |
| `orientation`          | `vertical \| horizontal`, default `vertical` | Options column or row; not a different key map.                                |
| `direction`            | `ltr \| rtl`, default `I18nManager.isRTL`    | Resolved Yoga direction and horizontal arrow meaning.                          |
| `required`             | `boolean`, default `false`                   | Label marker only; native required communication is separately gated.          |
| `disabled`             | `boolean`, default `false`                   | Convenience effective disable of every item and visual legend.                 |
| `accessibilityLabel`   | optional nonblank `string`                   | Explicit group name override, not a labelled-by relationship.                  |
| `accessibilityHint`    | optional `string`                            | Caller-supplied group instructions; no guaranteed speech.                      |
| `style`                | native View style                            | Caller-last structural styling without reversing membership order.             |
| `ref`                  | native View ref                              | Structural root only, never an item or imperative group-focus facade.          |

Use `PropsWithRefOf<typeof View>` and the existing owned-native-props pattern.
Forward compatible identifiers, layout handlers, and unrelated native props.
Own root children, role aliases, accessibility exposure, focusability,
tab-index/handled-key configuration, and group checked/selected semantics.
Exclude `aria-label`, `aria-labelledby`, and `accessibilityLabelledBy` from
this first naming contract rather than accepting conflicting naming paths.
Preserve unrelated caller accessibility state; apply owned disabled state
last, and reject attempts to give the structural group checked/selected state.
Do not expose `selectionFollowsFocus`, circular-navigation, clear-button,
validation, hidden-legend, or mobile/native-radio mode switches.

### RadioGroupItem

`RadioGroupItemProps` requires a unique nonblank `value: string` and a
nonblank `label: string`. `value` is membership identity, not visible text.
The adapter permits Radio's `disabled`, `secondaryText`,
`showSecondaryText`, native naming/hint, style, identifiers, layout and
interaction callbacks, and React 19 native Pressable ref.
Defaults for optional presentation props remain Radio's defaults.

The public `root` slot retains Radio's native Pressable/ref contract, with a
narrowed customization surface. Compatible replacements must forward that
ref, retain one native target, and contain no independently interactive
descendants. Slot and top-level handlers enter the same composed callback
path; a slot override cannot bypass membership or selection.

`selected`, `defaultSelected`, any item selection-change callback, children,
accessible/focusable/tab-index overrides, role overrides, native key-owner
descriptors, and overrides of checked/selected/disabled/set-position state are
excluded. The group supplies them. Preserve unrelated state such as `busy`.
Native `onKeyDown`/`onKeyUp` observers are permitted, but may not install a
second collection navigation loop. The item does not work outside RadioGroup
as an implicit standalone mode; callers needing an independent leaf use Radio.

The adapter also supplies native `accessibilityState.selected`
alongside Radio's existing `checked`, both derived from the same group answer.
Radio already preserves this caller state through its stage; no Radio API
change is needed. Matching selected/checked intent was approved: installed Windows Fabric
requires presence of `selected` for UIA SelectionItemPattern. The proposal
does not invent group required/multiselectable state to manufacture a UIA
selection-container pattern. AX role/value and native container patterns
remain separate gates in `spec/accessibility.md`.

### Membership validation

Support direct RadioGroupItem elements, arrays, recursively expanded
Fragments, and null/boolean conditional placeholders. Do not discover items
inside custom components, nested groups, Views, or portals. Plain Radio,
editable controls, text nodes, unknown wrappers, and nested collections are
unsupported, even if they happen to forward a ref.

Values must be unique and nonblank; an empty string is not the no-selection
sentinel. React keys should equal values for mapped items, but keys, native
tags, labels, indices, and registration order never replace explicit values.
Order is derived from the validated child tree, not effect timing.

Malformed-composition policy: throw a descriptive `Error` identifying
the unsupported child, missing/duplicate identity, invalid count, or invalid
name in every build. An orphan item also throws. This is a deliberate
approved fail-fast contract; it must not become a silent
partial group, invented placeholder, or native-mode fallback. A stale
controlled value after valid dynamic removal is handled separately below.
An initially supplied nonnull selected/default value absent from membership
throws that same descriptive error, rather than selecting the first option.
Whitespace validity checks do not trim or rewrite valid identifiers.

## State and focus policy

The group is self-driving in uncontrolled mode and externally controlled when
`selectedValue !== undefined`. Use Framework Base's multi-value
`useControllableValue` with `string | null`; the hook itself does not suppress
no-op callbacks, so the collection must do so. `null` is controlled, not
omitted. Supplying both controlled and default values ignores the default
and produces a development diagnostic. Keep the mode stable for an instance;
changing modes throws a descriptive error, not a silent reset or
an undocumented mirror-state fallback.

No initial answer is valid even when required. Neither mount, Tab entry,
programmatic focus, nor a native self-focus event selects the first item.
A supplied initial answer renders that matching item checked, including
when it is disabled. Exactly one matching member or none is checked.
Pressing the checked item never clears it; clearing is an external controlled
update or an uncontrolled consequence of selected-member removal.

Keep the selected value, active tab-entry identity, confirmed self-focused
identity, and pending request distinct. With no current self-focus, entry is
the selected eligible member, otherwise the first eligible member. While
native focus remains inside, retain its live eligible entry identity when
the parent changes the selected value without a navigation request.
On exit, the next entry follows the current eligible selection or first
eligible member. An external value change alone never steals native focus.

Eligibility is valid membership and `!(group.disabled || item.disabled)`.
Disabled members remain readable and can remain checked, but are not
navigable or activatable. All-disabled groups have zero item tab stops.
Otherwise exactly one item is keyboard-focusable, with no root or legend
stop. This is the current focusability-based native adaptation, not DOM
tabindex or active-descendant behavior.

An arrow/Home/End action requests the destination's selection first.
Uncontrolled state and destination eligibility commit before its
layout-effect `requestFocus('keyboard')`. Controlled mode emits one request
but waits for a matching parent value commit before moving the active entry
and issuing native focus. A refused/delayed update does not manufacture
checked state or focus an unchecked destination. A new navigation supersedes
the pending destination; an unrelated parent value cancels it. No timeout,
forced parent update, or arbitrary native delay is proposed.

Windows/Win32 pointer activation follows the same
selection/eligibility-before-focus transaction with pointer intent. The local
adapter must prevent Radio's existing Windows pre-press focus request from
becoming a competing owner, including when the first entry has no answer.
Pass one guarded member-activation callback into Radio's state stage, then
locally attach that same callback as the resolved root's press handler instead
of its pre-focus press wrapper. The group owns pointer focus; Radio's existing
keydown/keyup, press-in/out, focus-target binding, and render stage remain.
The Win32 key-based fallback still reaches the supplied activation callback
through the existing helper and skips pointer focus for a key event. This
specific local interception is implemented and covered by authored callback/order
tests; it is not a second Pressability implementation or leaf edit. Execution
and native event-order qualification remain coordinator gates.
Ordinary macOS pointer activation requests selection without imposing a
Windows click-focus policy. Accessibility selection does not synthesize a
press or unconditionally move keyboard focus.

If a selected uncontrolled member disappears, clear to `null` and notify once;
do not select a replacement. A stale controlled value remains caller-owned,
renders no checked member, cancels its pending focus, and triggers an
effect-based development diagnostic naming the missing value. A selected
member becoming disabled retains the answer and loses navigation eligibility.
Reorder preserves selection by value. Identity change is removal plus
insertion, not migration of the answer by index.

Active removal/disable repairs the next entry to the selected eligible member
or first eligible member without selecting it. Cancel stale scheduled and
in-flight requests. Do not promise imperative restoration after removal:
current FocusTarget APIs do not prove external focus or key-window ownership.
If fewer than two members remain, the explicit invalid-composition policy
applies; changing count does not admit a one-option selection pattern.

## Conformance

All requirements derive design intent from source ID `flex-component`.
Repository Radio, qualified Label, TabList, Framework Base, and V1 desktop
code inform native adaptation and compatibility, not a second unpinned
normative source. The coordinator records the requirement/source links in
generated provenance. The following files now exist and contain the local
implementation and authored regression evidence. Tests have not been run by
this worker; package validation is serialized by the coordinator. References
to future endpoint or shared integration evidence are acceptance obligations,
not claims that those files or results exist.

No new state-style snapshot is required: the group has only structural
orientation/direction/spacing styles, covered by exact finite-axis runtime
assertions. All selected/disabled/pressed/hover/focus appearance is delegated
to the unchanged Radio stages, and legend appearance to Label. Native
geometry, contrast and scaling still require endpoint evidence.

| ID      | Contract obligation                                                                                                            | Local implementation/authored evidence                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| RGR-001 | Finite props/defaults, nullable controlled value, explicit label and owned native/root slot surface.                           | `radio-group.types.ts`, `radio-group.types.test.ts`, `useRadioGroup.ts`                                                         |
| RGR-002 | Bounded children, explicit unique identities, caller order, malformed/orphan diagnostics.                                      | `radio-group.types.test.ts`, `useRadioGroup.ts`, `useRadioGroupItem.ts`, `radio-group.test.tsx`                                 |
| RGR-003 | Real Label legend at strong/medium, visual required/disabled, no duplicate legend exposure.                                    | `useRadioGroup.ts`, `renderRadioGroup.tsx`, `radio-group.test.tsx`, `radio-group.stories.tsx`                                   |
| RGR-004 | Controlled/uncontrolled selection, no/initial answer, no-op suppression, external null clear and exact callback counts.        | `useRadioGroup.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`                                                           |
| RGR-005 | Adapter reuses all Radio stages and its one target, without changing standalone Radio semantics or adding native wrappers.     | `radio-group-item.ts`, `useRadioGroupItem.ts`, `useRadioGroupItemStyles.ts`, `renderRadioGroupItem.tsx`, `radio-group.test.tsx` |
| RGR-006 | One eligible Tab entry, Tab/Shift+Tab exit, all-disabled exclusion and no selection on focus.                                  | `RadioGroupContext.ts`, `useRadioGroupItem.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`                               |
| RGR-007 | Both arrow pairs, logical Home/End, wrap, disabled skipping, RTL, unconsumed modifiers and native activation.                  | `useRadioGroup.ts`, `useRadioGroupItem.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`                                   |
| RGR-008 | Selection/eligibility before focus, controlled acknowledgment, one request owner, genuine focus confirmation and cancellation. | `useRadioGroup.ts`, `useRadioGroupItem.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`                                   |
| RGR-009 | Stable root/item refs, cleanup and generations, replacement/unmount, no stale registrations or ref introspection.              | `radio-group.types.test.ts`, `useRadioGroupItem.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`                          |
| RGR-010 | Removal/reorder/disable policies, uncontrolled null clear, stale controlled diagnosis and no focus stealing.                   | `useRadioGroup.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`                                                           |
| RGR-011 | Actual named group with individually named radio children and native checked/selected/disabled/position state.                 | `useRadioGroup.ts`, `useRadioGroupItem.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`, future endpoint evidence         |
| RGR-012 | Semantic Select action, declaration/event agreement, original-event forwarding once, no fabricated AXPress or press.           | `useRadioGroupItem.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`, future endpoint action evidence                      |
| RGR-013 | FURN spacing, Label/Radio delegation, theme-only cache safety, user-last styles and constrained/RTL/scaled layout.             | `radio-group.styles.ts`, `useRadioGroupStyles.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`                            |
| RGR-014 | Required presentation separated from native required communication; honest platform/speech limits.                             | `radio-group.types.ts`, `radio-group.test.tsx`, `radio-group.stories.tsx`, future endpoint speech evidence                      |
| RGR-015 | Typed named WDIO stories and integrated explicit exports; no mock/bundle/skip inflated to native readiness.                    | `radio-group.stories.tsx`, future coordinator-owned export/story inclusion and endpoint reports                                 |

## Platform behavior

The front-matter platform category is the checker-required category, not a
qualification claim. macOS Fabric, Windows Fabric, and Office Win32 are
separate intended endpoints. The installed renderer source constraints in
`spec/accessibility.md` and delivery/lifetime gates in `spec/interaction.md`
remain unresolved. No mobile fallback or native-mode switch is proposed.

## Divergences from Flex

The coordinator approved these adaptation boundaries. Native projection,
required-state speech, and endpoint qualification remain explicitly deferred:

- `radio-group-explicit-item-adapter` (**adapted**): bounded group-local
  RadioGroupItem supplies identity/registration while reusing unchanged Radio.
- `radio-group-explicit-question` (**adapted**): require application content
  and children rather than turning design specimen defaults into an answer.
- `radio-group-native-naming` (**adapted, projection unknown**): an explicit
  native group name and visual-only Label replace browser naming relations.
  If the proposed root collapses children, native acceptance is blocked;
  changing to an unnamed container is not an automatic fallback.
- `radio-group-native-selection-projection` (**intent approved, native proof deferred**):
  pass matching native selected state through the unchanged Radio stage for
  Windows UIA item selection. The installed macOS role-mapping gap and
  Windows selection-container pattern need independent disposition, not
  a manufactured relation or unsupported group required state.
- `radio-group-required-communication` (**deferred**): required remains visual;
  do not author unsupported required accessibility state. Caller instructions
  and actual speech need endpoint qualification and a reviewed disposition.
- `radio-group-disabled-convenience` (**intentional extension**): #4237 asks
  for whole-group disable coverage; the convenience prop distributes disable
  to unchanged Radio leaves and visual Label, not a new interactive surface.
- `radio-group-null-and-removal` (**adapted**): explicit no answer, no
  focus-triggered answer, and uncontrolled removal clear preserve meaningful
  state instead of selecting a replacement. This deliberately differs from
  V1 focus-driven selection and its disabled-selected presentation.
- `radio-group-controlled-focus-acknowledgment` (**adapted**): do not copy
  TabList's unchecked controlled-navigation focus behavior; wait for parent
  acknowledgment before moving focus to the requested answer.
- `radio-group-native-target-navigation` (**adapted**): one local navigation
  owner, current native focusability and confirmed ref targets replace
  browser machinery. Home/End are adopted; RTL follows the V1 Win32 behavior.
- `radio-group-removal-entry-repair` (**adapted, native restoration deferred**):
  repair entry without claiming a safe first-responder transfer.
- `radio-group-native-focus-visuals` (**adapted**): retain Radio's current
  shared policy, native on Windows/macOS and custom on Win32. The issue's
  older all-custom-ring text is not an instruction to regress the leaf.
- `radio-group-hidden-legend` (**deferred**): this first proposal always
  displays the composed Label; there is no CSS visually-hidden emulation.
- Browser fieldset/form grouping, HTML label activation, DOM attributes,
  active descendants, and browser validation are **not applicable**.
  Native announcement wording, item counts, position speech, active-window
  observation, and first-responder recovery remain **unknown**.

## Integration and acceptance gates

Pre-code review approved the adapter, explicit malformed-composition errors,
nullable/no-initial-answer selection and removal semantics, controlled focus
acknowledgment, and one guarded post-selection pointer owner. Label's reviewed
interface and implementation are integrated. Matching selected/checked item
state is approved as native intent; a named Windows Group is not advertised
as a fully qualified selection-container pattern. The recorded macOS role and
state projection gaps remain native acceptance blockers, not successful
fallbacks or fabricated native properties.

Then obtain actual macOS Fabric, Windows Fabric, and Office Win32 evidence
for the named group and discoverable children, checked/disabled projection,
Tab entry/exit, navigation/RTL, callback/event order, AX/UIA Select invocation,
refs/removal, and VoiceOver/Narrator speech. Preserve native and custom focus
policy, contrast and scaled/constrained geometry. None was executed here.
An inaccessible group name, flattened child tree, competing native key loop,
or unconfirmed critical first-responder behavior blocks the corresponding
readiness claim. Record failures and capability skips; never fabricate native
properties, success defaults, or announcement guarantees.
