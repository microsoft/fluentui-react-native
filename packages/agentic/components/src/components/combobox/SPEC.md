---
name: combobox
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Combobox

## Scope

An editable option picker. The text being edited, the option being explored and the committed selection are
three independent values. Filtering may narrow the list without silently choosing its first match.

## Public contract

| Proposed prop                                                        | Default              | Purpose                                                                                                                                               |
| -------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options / selectionMode`                                            | required / `single`  | Unique values, localized labels, optional disabled entries; single or multiple. Supply results in reading order.                                      |
| `selectedOptions / defaultSelectedOptions / onSelectedOptionsChange` | uncontrolled, empty  | String keys; single commits close, multiple toggles remain open. External changes do not fire user callbacks.                                         |
| `query / defaultQuery / onQueryChange`                               | uncontrolled, empty  | Native edit buffer. Filtering defaults to case-insensitive containment; custom filtering may be caller-owned. Preserve composing text.                |
| `entryMode / clearable`                                              | `filtering` / false  | Filtering accepts options only; freeform allows a validated typed value. Clear is a separate named action, not a second picker.                       |
| `open / defaultOpen / onOpenChange`                                  | uncontrolled, closed | Request presence with a reason; disabled prevents presentation. Support Input's size (medium), outline/underline (outline), naming and error binding. |

### Slots and ownership

Structural root ref, native editor, optional leading decoration, trailing open/clear affordance and anchored
list of ListboxItem options. The popup uses native placement but must not borrow Popover's automatic entry focus
or Dropdown's noneditable trigger.

Related contracts used by this design: [Input](../input/SPEC.md), [Field](../field/SPEC.md), [Popover](../popover/SPEC.md), [ListboxItem](../listbox-item/SPEC.md), [Dropdown](../dropdown/SPEC.md).

### Data and callbacks

Option data is `{ value: string; label: string; disabled?: boolean }`. `onQueryChange(text)` reports edits;
`onSelectedOptionsChange(keys, { value, reason })` reports a select, remove, clear or accepted freeform commit.
Caller-owned asynchronous filtering must discard stale results. Opening on edit requires available results or a
deliberate no-results state; focusing a closed editor alone does not select or commit.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **CMB-001:** Keep editing and committed keys independent. An unmatched filtering query reverts on commit/blur; validated freeform text can commit on Enter or genuine edit completion.
- **CMB-002:** Arrow exploration updates the active enabled option without taking the caret. Enter selects only after composition ends. Escape closes first without a commit; a subsequent Escape reverts the draft.
- **CMB-003:** Single commit closes; multiple toggles keep the list open and clear the filtering buffer for another search. A no-results message is not an option.
- **CMB-004:** Expose editor value/expanded state, actual list relationship, highlighted option and selected values independently. Gate a host that cannot communicate active-option changes with edit focus intact.

## Platform behavior

Use a non-focus-stealing editable popup; the existing Popover/Dropdown entry behavior is not suitable as-is.
Test native composition/candidate windows, active-option speech and pointer dismissal on each host; a
programmatic focus request is not proof of caret ownership.

## Divergences from Flex

- `caret-preserving-popup` — **accepted.** Keep actual native focus in the editor, not on a popup row or a surrogate invisible field.
- `editable-option-announcement` — **deferred.** An expanded flag or spoken result count alone does not identify the active option. Do not expose the editable mode until the host can convey it.

## Conformance

Type using an IME, filter to no matches, replace results while the list is open and explore a duplicate display
label by key. Assert caret, active option, selection and callback count separately.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
