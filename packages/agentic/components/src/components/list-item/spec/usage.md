# ListItem usage

Use ListItem for a pressable row whose owner supplies its selected value. Use
`selectionMode="single"` or `"multiple"` only to choose the row's visual
glyph; coordinate selected rows in the surrounding component.

```tsx
<ListItem
  content="Inbox"
  secondaryContent="12 unread"
  icon={inboxIcon}
  selected={currentFolder === 'inbox'}
  selectionMode="single"
  onPress={() => setCurrentFolder('inbox')}
/>
```

Use `secondaryContentPosition="under"` when supporting text needs its own
line. Supply `selectedIcon` only when the selected presentation needs a
replacement icon. Use `trailing` for noninteractive display content; this
component does not isolate nested actions from the root press.
