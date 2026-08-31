# Input accessibility

## Native semantics

The text input is the accessible element. It carries
`accessibilityRole="textbox"` and defaults to `accessible={true}`. The root, the
contents row, the icon-and-text stack, the trailing icon group, the underline
view, and all three icon slots are marked `accessible={false}`, so the field is
announced once rather than as a stack of nested containers.

`accessibilityLabel`, `accessibilityHint`, `accessibilityState`, `accessible`,
`focusable`, and `testID` are accepted on the root and applied to the text
input, so callers do not have to reach into the `textInput` slot to name or
identify the field. Direct slot values win for the name, hint, accessible,
focusable, and test identifier. Accessibility state is the exception: root
state is merged over slot state, then the component writes its resolved
disabled, read-only, and invalid values.

On Windows, UI Automation reports an edit control whose value is the current
text. On macOS, VoiceOver announces a text field with its name and value.

## Naming

Input renders no visible field label, so every instance needs a name from the
surrounding form. Supply `accessibilityLabel` when there is no visible label,
and use `accessibilityHint` for supplementary guidance such as a format
requirement.

A placeholder is not a name. It disappears as soon as the user types and is not
announced as a label on either platform, so a field named only by its
placeholder loses its name mid-edit.

## State

`accessibilityState` is composed by the component and merged over any caller
value, so the following always reflect the resolved props:

| Prop       | Reported state                                                  |
| ---------- | --------------------------------------------------------------- |
| `disabled` | `disabled` is set.                                              |
| `readOnly` | `readOnly` is set.                                              |
| `error`    | `invalid` is set while the flag is true, and omitted otherwise. |

A read-only field is not reported as disabled. It keeps its value announced and
keeps its foreground at primary emphasis, so assistive technology can still read
the content the user cannot change. A disabled field is both reported as
disabled and removed from the tab order by the default `focusable` resolution.

`error` marks the field invalid but supplies no message. Render the message in
the surrounding form and reference it from the hint so the reason is announced,
not just the invalid state.

## Icons

All three icon slots are hidden from the accessibility tree. Never put meaning
in an icon alone: an icon that conveys state must be mirrored in the name, the
hint, or an adjacent announced element, and an icon that performs an action
belongs in a separate focusable control rather than an icon slot.

## Focus

`focusable` resolves to `true` unless the field is disabled. Input renders no
dedicated focus ring; focus is indicated by recoloring the boundary to the heavy
neutral stroke at the same thickness used at rest. Verify that contrast in every
shipped theme, and note that this is weaker than the shared focus visual other
components use.
