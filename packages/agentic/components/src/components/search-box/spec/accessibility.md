# SearchBox accessibility

## Accessible element

The text input is the accessible element. The root view, the contents row, the
icon-and-text stack, the clear button group, and the underline are all marked
non-accessible so a screen reader reaches exactly one control for the query
plus, when it is present, one control for clearing it.

`accessibilityLabel`, `accessibilityHint`, `accessibilityState`, `accessible`,
`focusable`, and `testID` supplied on the SearchBox root are moved onto the text
input. A value set directly on the `textInput` slot wins over the lifted value.

## Name

SearchBox ships no default accessible name, because the package ships no
localized strings. Supply `accessibilityLabel` on the root, or set
`accessibilityLabelledBy` to the identifier of a visible label. In development
builds the component warns once when neither is supplied.

`placeholder` is not a name. It is an unreliable substitute on both platforms,
it disappears as soon as the user types, and it is not read as a name by
Narrator or VoiceOver in every context.

## Role and state

The text input reports `role="searchbox"`. Its accessibility state carries
`disabled` from the `disabled` prop and `readOnly` from the `readOnly` prop, so
assistive technology can distinguish a field that cannot be reached from a
field that can be read but not edited.

The search icon is decorative and is removed from the accessibility tree. It
carries no name, so it never introduces a second reading of the field's purpose.

## Clear button

The clear button is a separate accessible control with `role="button"`. It ships
the default accessible name `Clear search`; replace it through the
`clearButton` slot when the surrounding screen needs a different phrasing or a
different language.

The clear button is present only while the query is non-empty, so the number of
focus stops inside the control changes as the user types. This matches what a
sighted user sees and keeps a disabled, unreachable-looking control out of the
tab order. When the field is disabled or read only the button is still rendered
while a query is present, but it reports the disabled state and does not act.

After a clear, focus moves back to the text input. Focus is never left on a
control that has just been removed from the tree.

## Keyboard

The field is a single tab stop and the clear button is the next one. SearchBox
does not intercept the platform tab order.

Return submits the query. Escape clears a non-empty query. Both are reported by
the platform text input rather than captured globally, so they only apply while
the field itself holds focus.

Escape and the clear button reach the same result, so clearing never depends on
pointer input alone.
