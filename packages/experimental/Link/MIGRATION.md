# Link Migration

## Migration from v0 Link (Once moved from Experimental to Components)

In the short term, the new `Link` control is named `LinkV1` while it clashes with the existing older control. Once we deprecate the old control, it will be renamed to `Link`. It may be useful to rename the control to `Link` using the import syntax to simplify the rename:

```ts
import { LinkV1 as Link } from '@fluentui-react-native/text';
```

### Component renames

| v0 `Link`                                                           | v1 `Link`                                                            |
| ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `<Link url="https://www.bing.com/" content="Click to navigate." />` | `<Link inline url="https://www.bing.com/">Click to Navigate.</Link>` |

### Props unchanged

- Any props that are part of `ViewProps` and `TextProps` from `react-native`
- `url`
- `componentRef`

### Props added

- `appearance`
- `enableFocusRing`
- `inline`
- `tooltip`

### Props removed

- `content` is not supported in the v1 Link. Text to display as Link is passed in as a child of the component

### Props only supported natively on win32 and windows

- `onKeyUp`
- `onKeyDown`
- `keyUpEvents`
- `keyDownEvents`
- `onMouseEnter`
- `onMouseLeave`

### Tokens unchanged

- Any props that are part of `FontTokens` as `TextTokens` and `IForegroundColorTokens`

### Tokens changed

- Event states are added as `LinkTokens` 

| Token       | Win32       |
| ----------- | ----------- |
| `hovered`   | LinkTokens  |
| `pressed`   | LinkTokens  |
| `focused`   | LinkTokens  |
| `visited`   | LinkTokens  |
| `disabled`  | LinkTokens  |
| `inline`    | LinkTokens  |
| `subtle`    | LinkTokens  |

### Updating ThemeProvider

If you are using the older theme provider `ThemeProvider` from `@uifabricshared/theming-react-native`, you will need to update the `ThemeProvider` to pull from `@fluentui-react-native/theme` to have the control work properly with themes. Please see [this page](../../../docs/pages/Guides/UpdateThemeProvider.md) for guidance.

### Migrating customized Link

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.


### Slot differences

There are no differences between block and inline Links

| Default Link |             |
| -----------  | ----------- |
| Slot         | Type        |
| -----------  | ----------- |
| root         | `View`      |
| content      | `Text`      |

| Inline Link  |             |
| -----------  | ----------- |
| Slot         | Type        |
| -----------  | ----------- |
| content      | `Text`      |