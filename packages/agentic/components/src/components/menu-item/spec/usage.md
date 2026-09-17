# MenuItem usage

Use MenuItem within a menu owner that keeps selected values and responds to
presses. Use `menuStyle="section-header"` for a noninteractive group label.

```tsx
<MenuItem content="Comfortable" hasCheckmark selected={density === 'comfortable'} onPress={() => setDensity('comfortable')} />
```

Use `hasMultiselect` for a checkbox-style choice and `hasCheckmark` for a
radio-style choice. Do not supply both—the current implementation gives
multiselect precedence and only warns in development. `hasChevron` supplies an
indicator and hint; the surrounding menu must open the submenu. Use `under`
secondary content for a description and `right` for compact metadata.

## Scene root

Render the scene inside `ThemedRoot` so focus policy can query `useRootSettings`.
A nested theme boundary may override appearance without creating a separate
input-modality tracker. Component test scenes use the shared themed renderer.
