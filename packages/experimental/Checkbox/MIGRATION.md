# Checkbox Migration

## STATUS: WIP 🚧

This Migration guide is a work in progress and is not yet ready for use.

## Migration from v0 Checkbox

### Component renames

| v0 `Checkbox`                       | v1 `Checkbox`                       |
| ----------------------------------- | ----------------------------------- |
| `<Checkbox label="Hello, World" />` | `<Checkbox label="Hello, World" />` |

### Props that remain as is

- Any props that are part of `ViewProps`
- `checked`
- `componentRef`
- `defaultChecked`
- `label`
- `onChange`
- `tooltip`

### Props no longer supported with an equivalent functionality in v1 Checkbox

- `ariaLabel` => Use `accessibilityLabel` prop instead
- `boxSide` => Use `after` value for `labelPosition` prop for `start` or `before` value for `labelPosition` prop instead for `after`

### Props no longer supported without an equivalent functionality in v1 Checkbox

- `children` are not supported in the v1 Checkbox

### Tokens that remain as is

- Any props that are part of `FontTokens`, `IForegroundColorTokens`, `IBackgroundColorTokens`, `IBorderTokens`
- `checkboxBackgroundColor`
- `checkboxBorderColor`
- `checkmarkColor`

### Tokens no longer supported with an equivalent functionality in v1 Checkbox

- `checkmarkVisibility` => Use `checkmarkOpacity` token instead

### Tokens no longer supported without an equivalent functionality in v1 Checkbox

- `textBorderColor` => Removed in favor of using native based focus visuals

### Slots no longer supported with an equivalent functionality in v1 Checkbox

- `content` has been renamed to `label`.

### Updating ThemeProvider

If you are using the older theme provider `ThemeProvider` from `@uifabricshared/theming-react-native`, you will need to update the `ThemeProvider` to pull from `@fluentui-react-native/theme` to have the control work properly with themes. Please see [this page](../../../docs/pages/Guides/UpdateThemeProvider.md) for guidance.

### Migrating customized Checkboxes

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

### Migrating composed Checkboxes

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

## Porting from FluentUI v9 Checkbox

The FURN Checkbox cannot be used in place of a FluentUI Checkbox - these buttons are intended to be used on their respective platforms. See [this porting guide](../../../docs/pages/Guides/PortingFromFluentUI.md) for general guidance on coming from FluentUI to FURN.

### Props that remain as is

- `children`
- `disabled`
- `icon`
- `onClick`
- `testID`
- `tooltip`

### Props renamed to align with ReactNative

No `Checkbox` specific renames.

### Prop differences due to technical differences and limitations

- `icon` takes in a props object instead of the JSX element itself. This is due to framework differences from FluentUI.
- `iconOnly` must be supplied for components do not have any text content for them to be styled correctly. This is due to framework differences from FluentUI.
- `ref` is exposed as `componentRef`, similar to previous versions of FluentUI. This is due to framework differences from FluentUI.

### Other Prop differences

- `appearance` does not include values for `transparent` or `outline` as neither currently are used by native platforms.
- `iconPosition` uses `before` and `after` as values instead of `left` and `right` for better right to left support.

## Property mapping

| v0 `Checkbox`  | v1 `Checkbox`  |
| -------------- | -------------- |
| `componentRef` | `componentRef` |
| `content`      |                |
| `disabled`     | `disabled`     |
| `endIcon`      | `iconPosition` |
| `icon`         | `icon`         |
| `onClick`      | `onClick`      |
| `statIcon`     | `iconPosition` |
| `testId`       | `testId`       |
| `tooltip`      | `tooltip`      |
