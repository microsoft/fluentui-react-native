# Dropdown usage

## When to use

Use Dropdown to choose one value, or several, from a known set that is too
long, or too cramped, to show inline. For a few choices that should stay
visible, prefer radio buttons for one value and checkboxes for several. Use
MenuButton for actions, and a combobox when users need to type to narrow the
options.

## Composition

```tsx
<Dropdown accessibilityLabel="Fruit" defaultSelectedOptions={['apple']}>
  <ListboxItem value="apple" content="Apple" />
  <ListboxItem value="banana" content="Banana" />
  <ListboxItem value="cherry" content="Cherry" disabled />
</Dropdown>
```

```tsx
<Dropdown accessibilityLabel="Toppings" multiselect selectedOptions={toppings} onSelectedOptionsChange={setToppings}>
  <ListboxItem value="cheese" content="Cheese" />
  <ListboxItem value="olives" content="Olives" />
</Dropdown>
```

Give every option a unique `value` and string `content`, and supply options
directly or inside Fragments so the trigger can show the selection while the
list is closed.

## Guidance

- Name every Dropdown with `accessibilityLabel`, or by reference on Windows.
  The placeholder and the displayed value are not names.
- Keep option labels short and distinct. The trigger shows the selected label
  verbatim and truncates it with an ellipsis rather than paraphrasing it.
- When options carry icons, mirror the selected option's icon in `iconStart`.
- Localize `placeholder` and `formatSelectedCount`.
- Place error text beside the Dropdown and reference it from
  `accessibilityHint`; `error` changes only the visuals.
- The trigger stretches like Input. Constrain its width with style so that
  it fits the expected values.
- Never put interactive content in the trigger or a Dropdown inside an option.
