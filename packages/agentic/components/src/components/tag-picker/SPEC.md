---
name: tag-picker
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# TagPicker

## Scope

A collection of committed removable values with an editable or select-only trigger. Selected tags remain
independently addressable even when wrapping to a new line.

## Public contract

| Proposed prop                                                | Default                 | Purpose                                                                                                                                 |
| ------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `options / entryMode`                                        | required / `selectOnly` | Unique option keys and names. The first implementation admits the noneditable trigger and type-ahead; editable modes are gated below.   |
| `selectedValues / defaultSelectedValues / onSelectionChange` | uncontrolled, empty     | Ordered unique keys. Toggle from the list or remove one tag, reporting the changed key and reason once.                                 |
| `open / defaultOpen / onOpenChange`                          | uncontrolled, closed    | Choose actual list presence independently of selection. Support outline/underline, medium size by default, disabled and invalid states. |
| `formatRemoveLabel`                                          | required                | Provide a localized removal name for each selected value; Field names the picker rather than overwriting tag names.                     |

### Slots and ownership

Stable structural View, a wrapping collection of dismiss-only Tags, then the trigger and trailing cue. The
surface contains list rows and optional nonoption feedback. Keep the caret and the tag focus target distinct.

Related contracts used by this design: [Combobox](../combobox/SPEC.md), [Tag](../tag/SPEC.md), [Field](../field/SPEC.md), [ListboxItem](../listbox-item/SPEC.md), [Tooltip](../tooltip/SPEC.md).

### Data and callbacks

`onSelectionChange(nextKeys, { value, reason })` distinguishes an option toggle from a remove action.
Disabled disables trigger and removals; invalid is a Field state on the trigger, not a reason to drop selections.
Filtering and freeform remain deferred until a native host can keep edit focus and reliably describe the active option.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **TGP-001:** Option activation toggles its key and leaves the list open. A successful editable commit clears the query, not the other tags.
- **TGP-002:** Backspace in nonempty text deletes text; on empty text focus the final tag first, without removing it. Removal restores a live adjacent tag or the trigger.
- **TGP-003:** Composition confirmation cannot create or select a value. Escape closes and discards uncommitted search text; Tab exits the popup without selecting a highlight.
- **TGP-004:** Expose each remove action and list selection once. Qualify editable active-option speech separately from select-only focus and type-ahead.

## Platform behavior

Use the editor-focus decision in the Combobox draft for filtering/freeform without moving focus out of the editor. A
tag roving stop is for keyboard convenience, not a reason to hide other remove actions from assistive
technology.

## Divergences from Flex

- `tag-picker-native-focus` — **accepted.** Do not use a single faux text field for the collection. Editable and select-only triggers have different native responsibilities.
- `tag-picker-host-readiness` — **deferred.** Gate editable presentation if the host cannot expose the current option while preserving composition.

## Conformance

Select two values, reach a tag from an empty query, delete it, then delete the last one. Check focus, ordered
selection, unchanged composition and native remove names in both editable and select-only modes.

The [source evidence](spec/source.json) distinguishes the select-only implementation from editable-provider
and native focus qualification.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
