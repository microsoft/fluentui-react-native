# RadioGroup Migration

## Migration from v0 RadioGroup

In the short term, the new `RadioGroup` control is named `RadioGroupV1` while it clashes with the existing older control. Once we deprecate the old control, it will be renamed to `RadioGroup`. It may be useful to rename the control to `RadioGroup` using the import syntax to simplify the rename:

```ts
import { RadioGroupV1 as RadioGroup } from '@fluentui-react-native/radio-group';
```

### Component Renames

RadioButton is renamed to Radio.

### Props Unchanged

#### RadioGroup

- `label`

#### Radio

- `disabled`
- `componentRef`

### Props With Equivalent Functionality

#### RadioGroup

- `defaultSelectedKey` is renamed to `defaultValue`
- `selectedKey` is renamed to `value`

#### Radio

- `content` is renamed to `label`
- `buttonKey` is renamed to `value`

### Tokens Unchanged

#### RadioGroup

- Any props that are part of `FontTokens`, `IForegroundColorTokens`

#### Radio

- Any props that are part of `FontTokens`, `IForegroundColorTokens`, `IBackgroundColorTokens`, `IBorderTokens`

### Tokens with Equivalent Functionality

#### Radio

- `textBorderColor` => Use `enableFocusRing` prop to set focus border or use `borderColor` to set outline color

### Updating ThemeProvider

If you are using the older theme provider `ThemeProvider` from `@uifabricshared/theming-react-native`, you will need to update the `ThemeProvider` to pull from `@fluentui-react-native/theme` to have the control work properly with themes. Please see [this page](../../../docs/pages/Guides/UpdateThemeProvider.md) for guidance.

### Migrating customized RadioGroups

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

### Migrating composed RadioGroups

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

## Porting from FluentUI v9 RadioGroup

The FURN RadioGroup cannot be used in place of a FluentUI RadioGroup - these buttons are intended to be used on their respective platforms. See [this porting guide](../../../docs/pages/Guides/PortingFromFluentUI.md) for general guidance on coming from FluentUI to FURN.

### Property Mapping

#### RadioGroup

| v0                   | v1             |
| -------------------- | -------------- |
| `label`              | `label`        |
| `defaultSelectedKey` | `defaultValue` |
| `selectedKey`        | `value`        |
|                      | `required`     |
|                      | `disabled`     |
|                      | `layout`       |
| `testID`             |                |

#### Radio

| v0             | v1                |
| -------------- | ----------------- |
| `content`      | `label`           |
|                | `subtext`         |
| `buttonKey`    | `value`           |
| `disabled`     | `disabled`        |
|                | `labelPosition`   |
| `componentRef` | `componentRef`    |
|                | `enableFocusRing` |
