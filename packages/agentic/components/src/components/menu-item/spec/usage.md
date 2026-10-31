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

Native indicator actions arrive through `onAccessibilityAction` as the
original platform event. If the owner updates selection from those actions,
guard disabled state and coordinate peer selection and menu lifetime there;
the component does not convert an accessibility action into `onPress`.

Use `disabled disabledFocusable` when a disabled command must remain a keyboard
focus stop. It is still unavailable and cannot activate. Do not set it on a
section header; headers never become focus stops. The default is false for
standalone rows.

## Scene root

Render the scene inside `ThemedRoot` so focus policy can query `useRootSettings`.
A nested theme boundary may override appearance without creating a separate
input-modality tracker. Component test scenes use the shared themed renderer.
