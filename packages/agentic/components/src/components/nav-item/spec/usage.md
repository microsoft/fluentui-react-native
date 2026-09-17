# NavItem usage

Use NavItem for one row of an application's navigation. Use ListItem for a row
of content, Tab for switching panels on the same view, and MenuItem for a
transient command.

NavItem is not a standalone control. Until this package publishes a navigation
container, the caller plays the parent: it owns which row is current, which
category is open, and how focus moves between rows.

```tsx
<NavItem
  icon={dashboardIcon}
  label="Dashboard"
  onPress={() => setDestination('dashboard')}
  selected={destination === 'dashboard'}
  selectedIcon={dashboardFilledIcon}
/>
```

Use `type="category"` for a row that reveals child destinations instead of
navigating. Supply `expanded` and `controls` from the parent, and render the
disclosed rows yourself with `nesting="subItem"`.

```tsx
<NavItem
  controls="reports-group"
  expanded={openGroup === 'reports'}
  label="Reports"
  onPress={() => setOpenGroup(openGroup === 'reports' ? undefined : 'reports')}
  type="category"
/>
```

Choose one density for the whole navigation surface; density is a parent-level
decision, not a per-row one. Choose one kind of leading visual: `avatar` for an
identity, `icon` for a section or concept. Supply `selectedIcon` when the
current destination should show a filled glyph.

Use `trailingContent` for a short count or status string and `trailingActions`
for at most two icon-only controls. Actions must not navigate; give any
additional actions an overflow control of their own.

Use `showLabel={false}` only for a collapsed icon rail, and always pair it with
`accessibilityLabel`. Keep the label itself short and let it wrap: the row grows
vertically instead of truncating, and the leading and trailing visuals stay
aligned to the label's first line.
