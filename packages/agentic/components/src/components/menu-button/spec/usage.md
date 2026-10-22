# MenuButton usage

## When to use

Use MenuButton to gather related actions behind one button-styled trigger,
such as Insert, Sort, or New, including when the trigger stands in for a
primary action. Use Button for one action, Dropdown to choose a value, and a
plain Menu for low-emphasis overflow.

## Composition

```tsx
<MenuButton content="New" menu={{ accessibilityLabel: 'New' }}>
  <MenuItem content="Message" onPress={newMessage} />
  <MenuItem content="Event" onPress={newEvent} />
</MenuButton>
```

Compose list rows and Dividers only; section headers are diagnosed. A row that
opens more actions uses MenuItem's `submenu`, not a nested MenuButton.

## Guidance

- The label names the category of actions and never changes to the chosen
  action. Item labels omit that category.
- Give an icon-only trigger an `accessibilityLabel` and pair it with a
  Tooltip.
- Match `appearance` and `size` to sibling Buttons, and place the MenuButton
  at the end of an action group with room for the menu to extend.
- Prefer hiding unavailable actions; show a disabled row only when users must
  know the action exists.
