# Dropdown accessibility

## Trigger

The trigger is a single Pressable with the `combobox` role, and the root and
every wrapper inside the trigger are inaccessible. The trigger's name comes
from `accessibilityLabel` or, on Windows and Win32, `accessibilityLabelledBy`.
Neither the placeholder nor the displayed value is a name, so Dropdown warns
in development when both naming props are absent.

`accessibilityState` reports `expanded` from the list's actual presence and
`disabled` from the resolved prop, merged over any caller state.
`accessibilityValue.text` lists every selected label in option order,
separated by commas, even while the trigger shows the count summary, and is
empty when nothing displayable is selected. The leading icon, value text,
chevron, and focus indicator are inaccessible.

The trigger handles the expand and collapse accessibility actions by setting
the requested presence and reporting `trigger`. Windows exposes them through
the ExpandCollapse pattern. On Win32 the trigger also declares them, because
UI Automation there exposes ExpandCollapse only for an element that declares
them.

Pressable carries no invalid state on any renderer, so `error` changes only
the visuals (`dropdown-invalid-state`). Render the error message beside the
Dropdown and reference it from `accessibilityHint`. Dropdown supplies no
default hint.

React Native has no typed has-popup, controls, or active-descendant property,
so the expanded state, the value, and real option focus stand in for them
(`dropdown-combobox-relationships`).

## List

The list surface has the `list` role and never a dialog role. Its name
defaults to the trigger's string `accessibilityLabel`; supply
`listbox.accessibilityLabel` when the trigger is named by reference. It
reports `multiselectable` from the mode and `required: false`, which Windows
exposes as a List with the Selection pattern. The scroll container and focus
zone are inaccessible.

## Options

Each option is a ListboxItem bound to the list (LBI-006). It has the
`listitem` role, its label as its name, `selected` and `disabled` state, and
its one-based position among the options and the option count. Windows exposes
it as a ListItem with the SelectionItem pattern. Section headers keep their
own role and are not counted. The checkmark and checkbox indicator are
presentational.

Each option declares the select, add-to-selection, and remove-from-selection
actions, lowercase on Windows Fabric and title case elsewhere
(`dropdown-list-roles`):

| Action                | Single mode                                                            | Multiple mode                                       |
| --------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| Select                | Commits the option, closes the list, and returns focus to the trigger. | Replaces the selection with the option; stays open. |
| Add to selection      | Commits the option when nothing is selected; otherwise refused.        | Adds the option; stays open.                        |
| Remove from selection | Refused.                                                               | Removes the option; stays open.                     |

A disabled option, or an option of a disabled Dropdown, refuses every action.
Accepted actions report through `onSelectedOptionsChange` exactly as
activation does, and a controlled Dropdown shows only the selection its caller
supplies. Dropdown applies an action first and then forwards the original
event to the option's caller handler exactly once.

## Announcements

After a single-mode commit, focus returns to the trigger, which announces its
collapsed state and new value. A multiple-mode toggle updates the focused
option's selected state in place; the trigger's value changes without a live
announcement.

## Qualification

Each renderer must qualify the trigger's role, name, value, expanded state,
and focus return; the list's role, name, and selection state; and each
option's role, selected state, position, and selection actions, with Narrator
on Windows Fabric and Win32 and with VoiceOver on macOS. Invoke the
ExpandCollapse and SelectionItem patterns rather than inferring them from
pointer or keyboard results.
