# Text Migration

## Migration from v0 Text

In the short term, the new `Text` control is named `TextV1` while it clashes with the existing older control. Once we deprecate the old control, it will be renamed to `Text`. It may be useful to rename the control to `Text` using the import syntax to simplify the rename:

```ts
import { TextV1 as Text } from '@fluentui-react-native/text';
```

### Component renames

| v0 `Text`                   | v1 `Text`                   |
| --------------------------- | --------------------------- |
| `<Text>Hello, World</Text>` | `<Text>Hello, World</Text>` |

### Props unchanged

- Any props that are part of `ViewProps` and `TextProps` from `react-native`
- `color`

### Props changed

- `variant` => Prop name remains identical, but will support a different collection of named font variants. Newly defined v1 variants can be found in [Typography.types](../../theming/theme-types/src/Typography.types.ts) under theme-types.

### Props added

- `align`
- `block`
- `font`
- `italic`
- `strikethrough`
- `size`
- `truncate`
- `underline`
- `weight`
- `wrap`

### Props removed

- `disabled` is not supported in the v1 Text

### Tokens unchanged

- Any props that are part of `FontTokens`, `IForegroundColorTokens`

### Tokens changed

- Global font tokens have been editted according to design token redlines

| Token       | Win32         |
| ----------- | ------------- |
| Family      |               |
| `Base`      | `SegoeUI`     |
| `Monospace` | `Consolas`    |
| `Numeric`   | `Bahnschrift` |
| Size        |               |
| `100`       | `10px`/`14px` |
| `200`       | `12px`/`16px` |
| `300`       | `14px`/`20px` |
| `400`       | `16px`/`22px` |
| `500`       | `20px`/`26px` |
| `600`       | `24px`/`32px` |
| `700`       | `28px`/`36px` |
| `800`       | `32px`/`40px` |
| `900`       | `40px`/`52px` |
| `1000`      | `68px`/`92px` |
| Weight      |               |
| `Regular`   | `400`         |
| `Medium`    | `500`         |
| `Semibold`  | `600`         |
| `Bold`      | `700`         |

### Tokens not supported natively on win32

- `lineHeight`
- `letterSpacing`
- `textDecorationColor`
- `textShadowColor`
- `textShadowOffset`
- `textShadowRadius`
- `textTransform`

### Updating ThemeProvider

If you are using the older theme provider `ThemeProvider` from `@uifabricshared/theming-react-native`, you will need to update the `ThemeProvider` to pull from `@fluentui-react-native/theme` to have the control work properly with themes. Please see [this page](../../../docs/pages/Guides/UpdateThemeProvider.md) for guidance.

### Migrating customized Text

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

### Other Prop differences

- `block` => On win32, instead of setting it as a boolean prop, block display is applied by default, and is overridden as inline when `<Text>` is wrapped by a parent `<Text>`.

### Slot differences

There are no slot differences for FURN `Text`
