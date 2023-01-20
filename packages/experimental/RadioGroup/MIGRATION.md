# RadioGroup Migration

## Migration from v0 RadioGroup

In the short term, the new `RadioGroup` control is named `RadioGroupV1` while it clashes with the existing older control. Once we deprecate the old control, it will be renamed to `RadioGroup`. It may be useful to rename the control to `RadioGroup` using the import syntax to simplify the rename:

```ts
import { RadioGroupV1 as RadioGroup } from '@fluentui-react-native/radio-group';
```

### Component Renames

RadioButton is renamed to Radio.

### Tokens Unchanged

RadioGroup

- Any props that are part of `FontTokens`, `IForegroundColorTokens`

Radio

- Any props that are part of `FontTokens`, `IForegroundColorTokens`, `IBackgroundColorTokens`, `IBorderTokens`
- `textBorderColor`

### Slots Differences

RadioGroup

- `label` is now optional and

Radio

### Updating ThemeProvider

If you are using the older theme provider `ThemeProvider` from `@uifabricshared/theming-react-native`, you will need to update the `ThemeProvider` to pull from `@fluentui-react-native/theme` to have the control work properly with themes. Please see [this page](../../../docs/pages/Guides/UpdateThemeProvider.md) for guidance.

### Migrating customized Buttons

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

If you were using `PrimaryButton` or `StealthButton`, any color customizations will need to be applied under the `primary` and `subtle` tokens, respectively:

```ts
const Custom = StealthButton.customize({
  tokens: {
    borderWidth: 0,
    color: 'white',
    backgroundColor: 'red',
  },
});
```

would become

```ts
const Custom = Button.customize({
  subtle: {
    borderWidth: 0,
    color: 'white',
    backgroundColor: 'red',
  },
});
```

### Migrating composed Buttons

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

## Porting from FluentUI v9 Button

The FURN RadioGroup cannot be used in place of a FluentUI RadioGroup - these buttons are intended to be used on their respective platforms. See [this porting guide](../../../docs/pages/Guides/PortingFromFluentUI.md) for general guidance on coming from FluentUI to FURN.

### Props that remain as is

- `children`
- `disabled`
- `icon`
- `onClick`
- `testID`
- `tooltip`

### Props renamed to align with ReactNative

No `Button` specific renames.

### Prop differences due to technical differences and limitations

- `icon` takes in a props object instead of the JSX element itself. This is due to framework differences from FluentUI.
- `iconOnly` must be supplied for components do not have any text content for them to be styled correctly. This is due to framework differences from FluentUI.
- `ref` is exposed as `componentRef`, similar to previous versions of FluentUI. This is due to framework differences from FluentUI.

### Other Prop differences

- `appearance` does not include values for `transparent` or `outline` as neither currently are used by native platforms.
- `iconPosition` uses `before` and `after` as values instead of `left` and `right` for better right to left support.

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
