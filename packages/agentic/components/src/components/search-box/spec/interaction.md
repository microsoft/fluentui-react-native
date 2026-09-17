# SearchBox interaction

## Visual state

SearchBox resolves a single visual state for the field and hands it to the Input
pipeline, which paints the boundary and the text color from it. The precedence
is disabled, then read only, then focused, then pressed, then hovered, then
rest. SearchBox never resolves the error state: a query is transient input
rather than saved data, so there is nothing to validate.

Hover and press are tracked from the text input rather than the container, so
pointer feedback follows the text area. The clear button runs its own hover,
press, and focus visuals independently inside the field.

While disabled, the tracked focus, hover, and press flags are cleared, so
releasing a pointer outside the control or disabling a hovered field cannot
leave stale feedback behind.

## Typing

The query is a controllable string. When `value` is supplied the caller owns it
and the field shows exactly what the caller passes. Otherwise the component
holds it, starting from `defaultValue` or the empty string.

Every accepted edit reports `onChangeText` with the next query. While disabled
or read only no edit is accepted, so an internally driven query does not move
and `onChangeText` does not fire.

## Clearing

The clear button and its group are rendered only while the query is non-empty.
They appear on the first accepted character and disappear on the edit that
empties the field. There is no fade in either direction.

Activating the clear button empties the query, reports `onChangeText` with the
empty string, reports `onClear`, and returns focus to the text input so the user
can immediately retype. The button is disabled whenever the field is disabled or
read only, and a disabled press does none of that work.

Escape performs the same clear while the query is non-empty. Escape on an
already-empty field does nothing, so the key stays available to whatever
surrounds the control.

## Submitting

Return on the single-line field raises the platform submit event, and SearchBox
reports `onSearch` with the current query. `onSearch` is not called on every
keystroke: SearchBox has no debounce policy, so callers that want
search-as-you-type drive it from `onChangeText` and choose their own timing.

Submitting does not clear the query and does not move focus.

## Pointer

Pressing anywhere on the text area places the caret through the platform text
input. The container itself is not pressable, so a press on the padding or on
the leading icon does not focus the field. This matches the platform text input
rather than adding a container-wide press target that would fight the caret.

## Motion

There is no timed animation anywhere in the control, so there is no
reduced-motion branch and no animation to interrupt when the query changes
rapidly.
