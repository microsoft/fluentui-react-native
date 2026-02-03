# Icon

Icon component contains SvgIcon and FontIcon components.
It can be used when both types of icons should be supported.

```ts
import { IconV1, FontIcon, SvgIcon } from '@fluentui-react-native/icon';
```

## Sample Code

```ts
const fontBuiltInProps = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
  fontSize: 100,
  color: '#f09',
};

const svgUriProps: SvgIconProps = {
  uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
  viewBox: '0 0 1000 1000',
  width: 100,
  height: 100,
};

const svgSrcProps: SvgIconProps = {
  viewBox: '0 0 500 500',
  src: './path/name.svg',
  width: 72,
  height: 72,
};
```

```jsx
    <Icon svgSource={svgSrcProps} />
    <Icon svgSource={svgUriProps} />
    <Icon fontSource={fontBuiltInProps} />

    <SvgIcon color="green" {...svgSrcProps} />

    <FontIcon {...fontBuiltInProps} />
```

More examples on the [Test pages for the Icon](../../../apps/tester-core/src/TestComponents/Icon). Instructions on running the tester app can be found [here](../../../apps/fluent-tester/README.md).

## Visual Examples

Win32:

![Icon on win32 example](./assets/icon.png)

```ts
const svgSrcProps: SvgIconProps = {
  viewBox: '0 0 500 500',
  src: './path/name.svg',
  width: 72,
  height: 72,
  color: 'lightgreen',
};
```

```tsx
<Icon svgSource={svgSrcProps} />
```

![Font icon on win32 example](./assets/font-icon.png)

```tsx
<FontIcon fontFamily="Arial" codepoint={0x2663} fontSize={100} color="#f09" />
```

![SvgIcon on win32 example](./assets/svg-uri-icon.png)

```tsx
<SvgIcon uri="https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg" viewBox="0 0 1000 1000" width={100} height={100} />
```

## Icon API

Icon renders Font or SVG icon based on props.

### Accessibility

Icon is accessible by default. It can be changed using prop `accessible`.
`accessibilityRole` of SVG icon is `image`.

### Props

```ts
export interface IconProps {
  /*
   * Props of SVG Icon.
   */
  svgSource?: SvgIconProps;
  /*
   * Props of FontIcon.
   */
  fontSource?: FontIconProps;
}
```

## SVG Icon

Svg Icon can be rendered using `src` prop or `uri` prop.
When passing `src` then [react-native-svg-transformer](https://github.com/kristerkari/react-native-svg-transformer) should be installed and configured.

### Props

```ts
export interface SvgIconProps extends IViewProps {
  /**
   * Icon color.
   */
  color?: ColorValue;
  /**
   * Icon height.
   */
  height?: number;
  /**
   * Path to a local icon.
   */
  src?: React.FC<SvgProps>;
  /**
   * Style object which contains ImageStyle props.
   */
  style?: StyleProp<ImageStyle>;
  /**
   * URI of a remote icon.
   */
  uri?: string;
  /**
   * Viewbox defines the position and dimension of an SVG viewport.
   */
  viewBox?: string;
  /**
   * Icon width.
   */
  width?: number;
}
```

## Font Icon

Font Icon can be rendered using `codepoint` and `fontSource` props.

### Props

```ts
export interface FontIconProps extends AccessibilityProps {
  /**
   * Unicode codepoint.
   */
  codepoint: number;
  /**
   * Icon color.
   */
  color?: ColorValue;
  /**
   * Font name.
   */
  fontFamily?: string;
  /**
   * Font size in points.
   */
  fontSize?: number;
  /**
   * Path to Font file.
   */
  fontSrcFile?: string;
  /**
   * Style object which contains TextStyle props.
   */
  style?: StyleProp<TextStyle>;
  /**
   * Used to locate this view in end-to-end tests.
   */
  testID?: string | undefined;
}
```
