# Icon Migration

### Component renames

| v0 `Icon`                                                                                               | v1 `Icon`                                                                                 |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `<Icon svgSource={svgUriProps} width={100} height={100} color="red" accessibilityLabel="Wheelchair" />` | `<Icon svgSource={allSvgProps} />`                                                        |
| `<Icon svgSource={{src: TestSvg, viewBox: '0 0 500 500'}} width={100} height={100} color="yellow" />`   | `<SvgIcon src={TestSvg} viewBox="0 0 500 500" width={100} height={100} color="yellow" />` |
| `<Icon fontSource={fontBuiltInProps} color="#060" />`                                                   | `<Icon fontSource={allFontProps} />`                                                      |
| `<Icon fontSource={fontBuiltInProps} color="#060" />`                                                   | `<FontIcon fontFamily="Arial" codepoint={0x2663} fontSize={32} />`                        |
| `<Icon rasterImageSource={{ src: { uri: 'path/image.png' } }} width={100} height={100} />`              | `<Image source={{ uri: 'path/image.png', width: 100, height: 100 }} />`                   |

### Not supported functionality

Image Icon is not supported anymore.
React Native Image should be used instead.

```jsx
import { Image } from 'react-native';
<Image source={{ uri: 'path/image.png', width: 100, height: 100 }} />;
```

### Props that remain as is

- `fontSource`
- `svgSource`

### Props no longer supported

- `rasterImageSource` => Image icons are not supported anymore.
- `testID` => is part of ViewProps.

### Props no longer supported with an equivalent functionality in Icon V1

- `color` => Part of SvgIconProps and FontIconProps.
- `style` => Part of SvgIconProps and FontIconProps.
- `width` => Part of SvgIconProps.
- `height` => Part of SvgIconProps.
