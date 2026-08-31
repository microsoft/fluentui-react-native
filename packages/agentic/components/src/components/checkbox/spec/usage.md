# Checkbox usage

Use Checkbox for an independent option that takes effect at a later submission
step. When the option should apply the moment it is toggled, use Switch
instead. When exactly one value may be chosen from a set, use Radio.

```tsx
<Checkbox label="Save drafts automatically" onStatusChange={setAutoSave} />
```

`standard` is the default indicator shape. Choose `circular` only when the
surrounding product language uses rounded form controls; the two variants share
every other value, so mixing them within one form reads as an inconsistency
rather than a distinction.

## Owning the status

Leave `status` off for a self-contained option and read changes from
`onStatusChange`. Supply `status` when a parent owns the value, such as a
select-all row that computes a mixed value from its children:

```tsx
<Checkbox
  label="All options"
  onStatusChange={selectOrClearAll}
  status={allSelected ? 'checked' : someSelected ? 'indeterminate' : 'unchecked'}
/>
```

Reserve `indeterminate` for a roll-up of other checkboxes. It is not a "not
answered yet" value, and a press moves it to `checked` rather than back through
mixed. Do not use `disabled` to represent an unselected value.

## Text

`label` is both the visible text and the accessible-name fallback, so keep it
set even when `showLabel` is `false`. Add `accessibilityLabel` when the visible
text alone would not identify the option out of context.

Enable `showSecondaryText` for a short clarification of what selecting the
option does. It needs a visible label, stays at secondary emphasis for every
status, and is announced as supporting context rather than as part of the
name. Keep consequences and validation messaging in the surrounding form rather
than in this text.

```tsx
<Checkbox label="Notify me" secondaryText="We will only send critical updates." showSecondaryText />
```

Both text nodes wrap when a consumer constrains the root width. Constrain the
root through `style` rather than truncating the text.
