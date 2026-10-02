# RadioGroup native accessibility contract and qualification gates

RGR-003 and RGR-011 through RGR-014 specify intended native output. They are
not executed accessibility results.

## Group and legend

The implemented root is a native View with `accessibilityRole="radiogroup"`,
`accessible=true`, and `focusable=false`, using current TabList as a
feasibility precedent. Its explicit `accessibilityLabel` defaults to the
required scalar `label`; a supplied override must be nonblank. Do not derive
text by traversing arbitrary React elements or use an asterisk in the name.
Unrelated accessibility state is preserved, with effective group disabled
applied last. The group has no checked or selected state.

Its private Label legend uses `content=label`, `weight="strong"`,
`size="medium"`, the group presentation flags, and `accessible=false`.
Label remains outside the key loop; its required marker is decorative.
Do not hide the options subtree while hiding the legend. A nativeID or
View/Text ref does not establish a label relationship. The contract excludes
`accessibilityLabelledBy`, `aria-labelledby`, and competing name aliases.

The actual native root must retain each radio child as a separately named,
actionable element. `accessible=true` is a candidate, not proof that AX/UIA
preserves that structure. Reading React props or querying a mock by role does
not discharge this gate. If an endpoint flattens the children, stop that
endpoint's acceptance and obtain a reviewed native solution. Do not silently
switch to `accessible=false`, repeat the question in every option's name, or
substitute an unrelated role to disguise the missing group.

## Items and actions

The local adapter supplies Radio with its effective selected and disabled
booleans. Radio continues to own `accessibilityRole="radio"` and checked
state, derives its default name from its visible label, and retains explicit
caller names/hints. Its indicator and text descendants remain hidden by its
existing render stage. There is no extra accessible/focusable wrapper.

The adapter supplies `accessibilityState.selected` with the same answer boolean
through Radio's existing state passthrough, alongside its checked state.
Both fields are collection-owned, not independent consumer values. This is
an approved adapter projection to meet the installed
Windows UIA item-selection precondition; it does not establish a native
selection-container relationship or fix macOS AX selected projection.

Provide one-based membership position and total membership size through the
supported native item props, including disabled items in the count.
These props express intent; no portable count or position announcement is
promised. A disabled selected item retains checked state and remains readable,
but cannot activate or participate in directional/Tab navigation. A group
with no answer exposes every item unchecked.

The adapter uses `resolveAccessibilityAction('select', Platform.OS,
callerActions)` for both declaration and event comparison. This gives the
current `select` transport on Windows Fabric and `Select` on Office Win32
and macOS custom-action transport. Deduplicate while retaining caller action
labels/custom names through that shared helper.

An enabled owned Select requests group selection once. Then forward the
original caller action event once, including unrelated and disabled action
events. Do not synthesize `onPress`; an arrow is also not a press. Do not
add a second activation handler for Enter/Space. Declaring Select does not
prove UIA SelectionItemPattern support, AX default activation, or AXPress.
The adapter may not invent an `activate` fallback or rely on Paper behavior
for a Fabric gesture.

## Observed renderer constraints

The installed versions consulted are RNmacOS 0.81.9, RNW 0.81.35, and Office
Win32 0.81.8. These are source observations, not newly executed native tests:

- RNW's `UiaHelpers.cpp` maps radiogroup to UIA Group and radio to UIA
  RadioButton. `CompositionDynamicAutomationProvider.cpp` reads the explicit
  name and checked ToggleState, but requires `accessibilityState.selected`
  to expose SelectionItemPattern. A Select declaration alone cannot provide
  that pattern. Its native Select dispatch uses the lowercase resolver name.
- The same RNW provider recognizes a selection container only when both
  multiselectable and required state are present. This first proposal does
  not add unsupported cross-platform fields to obtain that pattern.
  A named Group with children is not proof of native peer selection-container
  semantics. Reviewer/native owner must decide the minimum accepted group
  projection or approve a narrow endpoint-specific foundation contract.
- RNmacOS Fabric `RCTViewComponentView.mm` assigns explicit names and
  builds a textual accessibility value from radio and checked/unchecked
  state. Its inspected traits conversion and `RCTUIKit.h` AX-role conversion
  have no radio/radiogroup mapping; the latter defaults to unknown role.
  This is a concrete AX role gate, not a guarantee that the JS role becomes
  AXRadioButton/AXRadioGroup. Its disabled/selected update block is excluded
  on macOS. Do not equate textual checked output with a native AX state field.
- That macOS Fabric view exposes declared custom action names verbatim and
  does not infer default AX activation from Select. Grouped accessibility
  children and explicit names are source mechanisms to inspect, not proof
  that the proposed tree remains discoverable or that VoiceOver speaks it.
- Office Win32's public declarations include radio/radiogroup roles, Select,
  checked/selected state, and Win32-only required state. Declarations and V1
  usage support feasibility, not new UIA pattern/announcement evidence.
  Win32-only required does not authorize a cross-desktop required contract.

For macOS, qualify the actual default role/value/tree before choosing an
approved native projection repair. For Windows, inspect child Select and the
group relationship before accepting a Group-only projection or requesting
a reviewed selection-container adapter. Those decisions belong to the
coordinator/native owner; this worker edits neither renderer nor Radio.

## Required communication

`required=true` displays Label's marker but does not select an answer,
validate a form, prevent clearing, or create an unsupported
`accessibilityState.required`. Do not forward web required attributes as if
they were qualified desktop semantics. The application supplies localized
required-choice instructions using appropriate native hints or surrounding
form content. The group owns no guessed English "required" suffix.

Instructions or hint props alone do not prove the requirement is announced.
Review whether each endpoint can expose native required semantics or reliably
communicate the constraint through the approved instructions. Until that
disposition and speech evidence exist, required presentation is supported
as visual presentation and full required-state conformance is gated.
Do not claim Label's required flag solves this native gap.

## Endpoint evidence plan

For macOS Fabric, Windows Fabric, and Office Win32 independently:

- Inspect the actual named radiogroup, parent/child relationships, item
  discovery, absence of a duplicate legend/marker, and native item names.
- Assert actual checked state before/after pointer, keyboard, controlled
  acknowledgment, external null clear, removal, and native Select invocation.
  Do not default an unavailable driver property to the expected value.
- Inspect native selected state and selection-container patterns independently
  of checked state. Do not pass a SelectionItemPattern test using only a
  declared action or textual checked value.
- Verify disabled projection separately from JS guards and Tab exclusion.
  RNmacOS's recorded AX enabled/selected gaps are a warning to inspect
  checked projection, not proof that checked works or that it is unavailable.
- Exercise UIA SelectionItemPattern.Select or the actual AX custom action;
  count group callbacks and original caller events. A click followed by a
  checked-state read is not action-dispatch evidence.
- Record Narrator/VoiceOver group entry/reentry, question, option name,
  answer state, and required instructions. Do not prescribe exact speech,
  position wording, or question-repetition frequency without observation.
- Separate keyboard first responder from AT navigation focus; cover native
  Tab/Shift+Tab, both arrow pairs, RTL, all-disabled groups, and scaled/contrast
  text and focus visibility.

Driver trees cannot prove speech. An unrun lane is unrun; a missing critical
capability or projection is an acceptance blocker, not a passing assertion
or intended platform divergence. The implementation worker performed no
native run. Subsequent coordinator results are recorded in the round's
[integrated evidence](../../../../PLAN.md#integrated-evidence); they do not
qualify AX/UIA or speech. Runtime tests inspect JS intent and callback counts.
The native action story explicitly skips named Select invocation until
endpoint tooling supports it; checked/selected AX projection is isolated from
executable navigation/callback cases.
