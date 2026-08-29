# Button usage

Use Button for a discrete action such as saving, creating, confirming, or
opening a command surface. Use navigation components for destinations and a
dedicated menu or split-button component when the action has choices.

`secondary` is the default appearance. Reserve `primary` for the highest
emphasis action in a surface, use `outline` for lighter containment, and use
`subtle` where the action should not compete with surrounding content.

```tsx
<Button appearance="primary" content="Save" onPress={save} />
<Button content="Add item" icon={addIcon} onPress={addItem} />
<Button accessibilityLabel="Close dialog" icon={closeIcon} onPress={close} />
```

Icon-only buttons need an action-oriented accessible label and visible product
context such as a tooltip. Small buttons are intended for dense command
surfaces; medium is the general default; large gives an action more physical
presence.

## Externally controlled selection

The existing FURN API permits toggle presentation on Button. Treat the value
as controlled state:

```tsx
const [favorite, setFavorite] = useState(false);

<Button
  content="Favorite"
  icon={regularStar}
  selected={favorite}
  selectedIcon={filledStar}
  onPress={() => setFavorite((value) => !value)}
/>;
```

Do not use `disabled` to represent an unselected value. Avoid introducing new
uses of this Button-specific selection API when a dedicated ToggleButton
contract is required for alignment with current Flex guidance.

Content wraps when a consumer constrains the root. Supply a content-slot
override only when a product deliberately needs a different truncation or
text presentation policy.
