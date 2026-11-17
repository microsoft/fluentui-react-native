---
id: portable.accessibility
kind: instruction-reference
owner_paths:
  - packages/framework-base
  - packages/agentic/components
---

# Accessibility authoring and qualification

Specify role, accessible name/value/state, disabled behavior, interaction,
keyboard/focus ownership, and assistive actions in the reviewed component
contract. Images and web anatomy alone cannot establish those semantics.

For semantic action helpers, read
`@fluentui-react-native/framework-base/references/accessibility.md`. The shared
[action transport evidence](../accessibility/action-transport-evidence.md)
defines its `C-A11Y` observations. Preserve their inspected renderer versions,
dates, and limitations; recheck the actual target before extending a claim.

For focusable controls, use [common focus authoring](../focus/common.md) and
only the matching platform topic. Keep activation, native self-focus,
focus-within, selection, and input modality separate.

Declare and compare the same exact native action name. Preserve caller-owned
labels/handlers, and prevent duplicate activation owners. Do not synthesize a
pointer event or infer an accessibility action from a passing physical click.
The installed helper documentation owns its exact casing and deduplication
contract; do not create another platform action registry here.

Qualify native actions through the actual UIA pattern or AX action and assert
native state plus callback count/order. Qualify physical keyboard/pointer
behavior separately, with the intended renderer, host, and accessibility
settings. A mock, snapshot, JavaScript event, source inspection, or bundle is
not proof that an assistive action was delivered. Report unavailable
capabilities and skipped platforms explicitly.
