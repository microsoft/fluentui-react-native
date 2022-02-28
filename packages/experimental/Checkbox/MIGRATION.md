# Checkbox Migration

## STATUS: WIP 🚧

This Migration guide is a work in progress and is not yet ready for use.

## Migration from v0 Checkbox

### Component renames

| v0 `Checkbox`                       | v1 `Checkbox`                       |
| ----------------------------------- | ----------------------------------- |
| `<Checkbox label="Hello, World" />` | `<Checkbox label="Hello, World" />` |

### Props unchanged

- Any props that are part of `ViewProps`
- `checked`
- `componentRef`
- `defaultChecked`
- `label`
- `onChange`
- `tooltip`

### Props repurposed

- `ariaLabel` => Use `accessibilityLabel` prop instead
- `boxSide` => Use `after` value for `labelPosition` prop instead of `start` or `before` value for `labelPosition` prop instead of `after`

### Props removed

- `children` are not supported in the v1 Checkbox

### Tokens unchanged

- Any props that are part of `FontTokens`, `IForegroundColorTokens`, `IBackgroundColorTokens`, `IBorderTokens`
- `checkboxBackgroundColor`
- `checkboxBorderColor`
- `checkmarkColor`

### Tokens repurposed

- `checkmarkVisibility` => Use `checkmarkOpacity` token instead

### Tokens removed

- `textBorderColor` => Removed in favor of using native based focus visuals

### Slots repurposed

- `content` has been renamed to `label`.

### Updating ThemeProvider

If you are using the older theme provider `ThemeProvider` from `@uifabricshared/theming-react-native`, you will need to update the `ThemeProvider` to pull from `@fluentui-react-native/theme` to have the control work properly with themes. Please see [this page](../../../docs/pages/Guides/UpdateThemeProvider.md) for guidance.

### Migrating customized Checkboxes

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

### Migrating composed Checkboxes

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

## Porting from FluentUI React v9 Checkbox

The FURN Checkbox cannot be used in place of a FluentUI React Checkbox - these buttons are intended to be used on their respective platforms. See [this porting guide](../../../docs/pages/Guides/PortingFromFluentUI.md) for general guidance on coming from FluentUI to FURN.

### Props unchanged

- `labelPosition`
- `shape`
- `size`

### Props renamed to align with ReactNative

No `Checkbox` specific renames.

### Prop differences due to technical differences and limitations

- `onChange` does not pass native event info due to typing difficulties.

### Other Prop differences

- `checked` does not support `mixed` as it is not used by native platforms.
- `defaultChecked` does not support `mixed` as it is not used by native platforms.

### Slot differences

- `input` => use `root` instead as primary slot.
- `indicator` is split into `checkbox` and `checkmark` slots.

## Property mapping

| v0 `Checkbox`    | v1 `Checkbox`        |
| ---------------- | -------------------- |
| `ariaLabel`      | `accessibilityLabel` |
| `boxSide`        | `labelPosition`      |
| `checked`        | `checked`            |
| `children`       |                      |
| `componentRef`   | `componentRef`       |
| `defaultChecked` | `defaultChecked`     |
| `disabled`       | `disabled`           |
| `label`          | `label`              |
| `onChange`       | `onChange`           |
| `tooltip`        | `tooltip`            |
