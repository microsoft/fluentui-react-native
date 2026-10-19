# Menu usage

## When to use

Use Menu for a short list of commands opened from a button-styled trigger,
such as a toolbar's overflow or an object's actions. Use MenuButton when the
trigger should carry Button's full chrome and a chevron. Use Popover for
free-form content, and Dropdown to pick a value.

## Composition

```tsx
<Menu trigger={{ content: 'Edit' }} surface={{ accessibilityLabel: 'Edit' }}>
  <MenuItem content="Cut" onPress={cut} />
  <MenuItem content="Copy" onPress={copy} />
  <Divider label={null} />
  <MenuItem content="Share" submenu={{ children: <MenuItem content="Email" onPress={email} /> }} />
</Menu>
```

Compose only MenuItem rows, section headers, and Dividers. Each row's `onPress`
runs its command; Menu closes itself afterward, so callers do not close it
from `onPress`. Checkable rows keep their externally owned `selected` value and
still close the menu when activated.

## Guidance

- Give the menu a name through `surface.accessibilityLabel` when the trigger
  has no text.
- Keep submenus to two levels. Prefer flattening a menu with section headers
  over adding a level.
- Prefer hiding unavailable commands. Show a disabled row when users must know
  the command exists; set `disabledFocusable` to keep it discoverable on macOS.
- Do not place a Menu inside a Popover surface or another Menu's rows; use a
  MenuItem `submenu` instead.
