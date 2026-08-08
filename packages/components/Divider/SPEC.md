# Divider

## Background

The `Divider` component represents a visual separator on a given page. On desktop platforms, a `Divider` can be horizontal or vertical, and it can contain content, text or an icon, for aesthetic purposes.

Note:

For mobile platforms, only horizontal `Divider` is supported.

Content, text or an icon are also not supported on mobile platforms.

## Sample Code

Add the Divider package to your project.

```ts
npm i @fluentui-react-native/divider
```

### Basic Divider

```ts
import { Divider } from '@fluentui-react-native/divider';
```

```tsx
<>
  <Divider /> // This is a horizontal divider with no content.
  <Divider insetSize={16} /> // Divider with a defined inset
  <Divider vertical /> // Vertical divider
  <Divider appearance="brand" /> // Divider with a set appearance
</>
```

### Divider With Text

```tsx
<>
  <Divider>Lorem ipsum</Divider> // Center-aligned horizontal divider
  <Divider alignContent="start">Dolor sit</Divider> // Start-aligned horizontal divider
  <Divider alignContent="end" vertical>
    Amet consectetur
  </Divider>{' '}
  // End-aligned vertical divider
</>
```

### Divider With Icon

```tsx
const svgIconProps = {...} // insert svg icon props here
const fontIconProps = {...} // insert font icon props here

<>
  <Divider icon={{ svgSource: svgIconProps }} /> // With svg icon
  <Divider icon={{ fontSource: fontIconProps }} /> // With font icon
</>
```

## Variants

### Vertical

The `Divider` will be rendered as a vertical line, take up a minimum height of 84px, and not take up the entire row if the `vertical` prop is set to `true`.

### With Content

If text as passed as a child, or the icon prop is set, the `Divider` will render the content between the dividing line. It will also take up more width and height depending on the `Divider` orientation.

#### Alignment

Users can control where content appears in the `Divider`.

- If `alignContent` is equal to "start", the content appears towards the left of the `Divider` if it's horizontal or towards the top if vertical.
- If `alignContent` is equal to "end", the content appears towards the right of the `Divider` if it's horizontal or towards the bottom if vertical.
- If `alignContent` is equal to "center" or not set, the content appears exactly in the middle of the dividing line.

## API

### Slots

The `Divider` uses 6 total slots:

- `root` [View] The outer container of the component
- `beforeLine` [View] The dividing line rendered before passed content. If no content is passed, this is the only slot rendered.
- `afterLine` [View] The dividing line rendered after passed content. Not rendered if no content is passed.
- `wrapper` [View] If content is passed, this is the outer container of the content between `beforeLine` and `afterLine` which provides the correct padding for the content.
- `text` [TextV1] If text is passed as a child, this renders inside `wrapper`.
- `icon` [IconV1] If the `icon` prop is set, an icon will render inside `wrapper`. If text is also passed while the `icon` prop is set, then this slot will not render.

Because the Divider is built using the `compressible` framework, these slots are currently not able to be modified.

### Props

Below is the set of props `Divider` supports.

```tsx
export interface DividerProps {
  /**
   * If a text or icon is passed, this dictates where content appears in the divider: at the start, centered, or towards the end.
   * @default 'center'
   * Note: This prop is not supported on mobile platforms(Android & iOS).
   */
  alignContent?: DividerAlignment;
  /**
   * If no color tokens are set, the divider and its content are colored using different theme tokens depending on the value of this prop.
   * @default 'default'
   * Note: This prop is not supported on mobile platforms(Android & iOS).
   */
  appearance?: DividerAppearance;
  /**
   * Pass an icon source to render an icon as content in the divider. Will not render if text is passed via children.
   * Note: This prop is not supported on mobile platforms(Android & iOS).
   */
  icon?: IconProps;
  /**
   * The size of the Divider inset - the margin before the start and after the end of the divider.
   * @default 0
   * Note : For mobile platforms, the insetSize prop is only applied to start of the component.
   */
  insetSize?: DividerInsetSize;
  /**
   * Whether the divider is rendered as a horizontal line or a vertical line.
   * @default false
   * Note: This prop is not supported on mobile platforms(Android & iOS).
   */
  vertical?: boolean;
}
```

### Styling Tokens

Tokens can be used to customize the styling of the control by using the customize function on the `Divider`. For more information on using the customize API, please see [this page](https://github.com/microsoft/fluentui-react-native/blob/main/packages/framework/composition/README.md). The `Divider` has the following tokens:

```tsx
export interface DividerTokens extends LayoutTokens, Omit<FontTokens, 'fontDynamicTypeRamp' | 'fontMaximumSize'> {
  /**
   * The color of the content passed into the divider.
   */
  contentColor?: ColorValue;
  /**
   * The padding of divider content between the start and end lines.
   * @default 12
   */
  contentPadding?: string | number;
  /**
   * The flex value of the line after content, set to 0 if `alignContent` = `end`.
   * @default 1
   */
  flexAfter?: number;
  /**
   * The flex value of the line before content, set to 0 if `alignContent` = `start`.
   * @default 1
   */
  flexBefore?: number;
  /**
   * Color of the divider lines.
   */
  lineColor?: ColorValue;
  /**
   * The minimum size of a line shrunken by a non-centered divider.
   * @default 8
   */
  minLineSize?: number;
  /**
   * The thickness of the Divider lines
   * @default 1
   */
  thickness?: number;
}
```

In addition to the tokens listed here, Divider also has tokens to control text and layout styling.

#### Text Tokens

If text is passed into the divider, the following tokens can be used to add styling to the text.

```tsx
// not an actual type - these are the properties DividerTokens inherit
type DividerFontTokens = {
  /**
   * Change the font family of the passed text
   */
  fontFamily?: string;
  /**
   * Increase or decrease the size of the passed text.
   */
  fontSize?: keyof Typography['sizes'] | TextStyle['fontSize'];
  /**
   * Make text bolder or thinner.
   */
  fontWeight?: keyof Typography['weights'] | TextStyle['fontWeight'];
  /**
   * Change the height of each line of text rendered.
   */
  fontLineHeight?: number;
  /**
   * Add spacing between each character within the text string.
   */
  fontLetterSpacing?: number;
  /**
   * Use to make text italic.
   */
  fontStyle?: 'normal' | 'italic';
  /**
   * Render an underline, a strikethrough-line, or both with the text.
   */
  textDecorationLine?: 'normal' | 'underline' | 'line-through' | 'underline line-through';
  /**
   * Pass a variant type in to use a preset set of Fluent text styles for different purposes (e.g. styling a header, a caption).
   *
   * If you specify a variant while modifying a text style (e.g. passing a variant while also passing a custom fontSize), your styles will take precedence.
   */
  variant?: Variants;
};
```

#### Layout Tokens

To apply margins / padding to the divider, adjust these tokens.

```tsx
// not an actual type - these are the properties DividerTokens inherit
type DividerLayoutTokens = {
  /**
   * Adjust the tokens below to set ceilings and floors on the divider width and height.
   */
  minWidth?: string | number;
  maxWidth?: string | number;
  /**
   * For minHeight, there are different default values:
   * @default 0 for horizontal dividers
   * @default 20 for vertical dividers without children
   * @default 84 for vertical dividers with children
   */
  minHeight?: string | number;
  maxHeight?: string | number;
  /**
   * Adjust the tokens below to set custom spacing for the divider (if inset is not enough).
   */
  padding?: string | number;
  paddingHorizontal?: string | number;
  paddingVertical?: string | number;
  paddingStart?: string | number;
  paddingEnd?: string | number;
};
```
