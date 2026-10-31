# ListboxItem usage

Use ListboxItem for an option in a consumer-owned selection surface. Keep the
selected value in that owner and update it from `onPress`.

```tsx
<ListboxItem content="Descending" selected={sortOrder === 'descending'} onPress={() => setSortOrder('descending')} />
```

Use `sectionHeader` only for a group heading. Use `checkmark` for a selected
single-choice visual or `multiselect` for its checkbox-like visual, but do not
use both. Select `under` secondary content when the description needs a second
line; use `right` for compact metadata. A chevron is visual only—the owner
must perform any nested-navigation action.

Inside a Dropdown, give each option a unique `value` and string `content`, and
omit `selected`, `checkmark`, and `multiselect`; the Dropdown owns them.

```tsx
<Dropdown accessibilityLabel="Sort order">
  <ListboxItem value="ascending" content="Ascending" />
  <ListboxItem value="descending" content="Descending" />
</Dropdown>
```

## Scene root

Render the scene inside `ThemedRoot` so focus policy can query `useRootSettings`.
A nested theme boundary may override appearance without creating a separate
input-modality tracker. Component test scenes use the shared themed renderer.
