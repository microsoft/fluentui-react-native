# Input usage

Use Input for a single line of free-form text inside a form. It is the entry
control only: the field label, the helper text, the error message, and the
validation rules belong to the surrounding form.

```tsx
<Input accessibilityLabel="Display name" placeholder="How others see you" onChangeText={setDisplayName} value={displayName} />
```

Do not use Input for multi-line notes, for a value picked from a list, or for a
search box with its own result behavior. Those need controls that own their
extra affordances.

## Variant

`outline` is the default and is the right choice for a standalone field, a
dialog, or a form on a plain surface, because the full border makes the target
area unambiguous. Use `underline` for dense rows where a full border would
crowd the layout, such as a settings list or a compact toolbar. Keep one variant
per form.

## Size

`medium` is the default. Use `small` for dense secondary surfaces and `large`
for a primary field on a spacious layout or where a larger touch target is
needed. Size drives typography, padding, minimum height, icon size, and the
outline corner radius together, so pick it from the surrounding density rather
than adjusting individual metrics.

## Value

Supplying `value` makes the field externally driven, in which case
`onChangeText` must write the next value back or the text will not change.
Supply `defaultValue` instead to let the component keep the value while still
observing edits.

## Disabled and read only

Use `disabled` when the field is not applicable yet, for example when it depends
on a choice that has not been made. Use `readOnly` when the value matters and
should still be readable and copyable but cannot be edited here, for example a
generated identifier. Read-only fields stay reachable and keep primary
foreground emphasis; disabled fields are dimmed and leave the tab order.

## Error

`error` selects the danger boundary and marks the field invalid, but it renders
no message. Always pair it with a visible message near the field, and reference
that reason from `accessibilityHint` so it is announced. Set the flag when the
user can act on the problem rather than on every keystroke.

## Icons

`iconStart` suits a category marker such as a currency or unit symbol.
`iconEnd1` and `iconEnd2` suit trailing status or affordance indicators, and
`iconEnd2` requires `iconEnd1`. Icons are decorative and non-interactive here:
anything the user must click, such as a reveal toggle or a clear action, belongs
in a separate control next to the field.

## Naming

Give every field a name. Use a visible label in the form and mirror it with
`accessibilityLabel`, or supply `accessibilityLabel` alone when the layout has no
room for a visible label. A placeholder is a hint about the expected content and
is not a substitute for either.
