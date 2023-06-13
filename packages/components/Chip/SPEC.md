# Chip

## Background

A cross-platform Chip component using the Fluent Design System. A chip is an additional visual descriptor for UI elements.

```ts
import { Chip } from '@fluentui-react-native/chip';
```

## Sample Code

Basic examples:

```jsx
  <Chip>999+</Chip>
  <Chip appearance="filled">999+</Chip>
  <Chip shape="rounded" size="large" />
  <Chip icon={{ svgSource: { src: TestSvg, viewBox: '0 0 500 500' } }} iconPosition="after" />
```

More examples on the [Test pages for the Chip](../../../apps/fluent-tester/src/TestComponents/Chip). Instructions on running the tester app can be found [here](../../../apps/fluent-tester/README.md).

## Visual Examples

Win32:

![Chip with text on win32 example](./assets/basic_chip_example_win32.png)

```tsx
<Chip>999+</Chip>
```

![Chip with icon on win32 example](./assets/chip_with_icon_example_win32.png)

```tsx
<Chip appearance="severe" icon={{ svgProps }} iconPosition="after">WARNING</Button>
```

## BasicChip

## Variants

### Shape

The Basic Chip supports a square, rounded and circular shape.

### Sizes

`Chip` supports next sizes: `tiny`, `extraSmall`, `small`, `medium`, `large`, `extraLarge`.
On Android only `small`, `medium` are supported.

### Appearance

The `Chip` can be `filled`, `outline`, `tint`, `ghost`.

### Color

The Chip supports preset and custom colors: `brand`, `danger`, `important`, `informative`, `severe`, `subtle`, `success`, `warning`.
On Android `neutral` is the default and `brand`, `danger`, `severe`, `success`, `warning` are supported.

### Icon

The `Chip` component can include an `icon`.
Out of `small` and `medium` sizes for Android, the `icon` is shown only for `medium` size.
Android also supports a default close icon in `selected` state. This is controlled by `showCloseIcon` prop.
Note - Close icon is shown even for `small` size.

### Image

An `image` can be added to the Chip as an optional content.
Example:

```jsx
<Chip>
  Chip with
  <Image source={{ uri: './path.png' }} />
  <Text style={{ backgroundColor: 'yellow' }}>optional content</Text>
</Chip>
```

### Content

Content is passed as part of `children` prop.
For long Chips it's up to consumer how they want to truncate/hide the content.

### Search Bar Chip

Special styling is applied when the `Chip` is used in a `SearchBar` component.
To enable this pass the `searchBar` prop to the `Chip`. Limited to Android.

### States

The following section describes the additional states a `Chip` can have.

#### Selected state

A selected `Chip` changes styling to communicate that the chip is currently selected or toggled. This is limited to Android.

## API

### Slots

The `Chip` component has the following slots:

- `root` - The outer container representing the `Chip` wrapper.
- `icon` - If specified, renders an `icon`.
- `text` - This slot is used to render text content.

The slots can be modified using the `compose` function on the `Chip`. For more information on using the `compose` API, please see [this page](../../framework/composition/README.md).

### Props

```ts
export interface ChipConfigurableProps {
  /**
   * A Chip can be one of preset colors
   * @defaultvalue brand
   */
  chipColor?: ChipColor;

  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * Chip position
   * @defaultvalue absolute
   */
  position?: FlexStyle['position'];

  /**
   * Sets shadow style with `ambient` and `key` props
   */
  shadowToken?: ShadowToken;
}
```

```ts
export interface ChipCoreProps {
  /**
   * A Chip can be square, circular or rounded.
   * Not supported on Android.
   * @defaultvalue circular
   */
  shape?: ChipShape;

  /** Sets style of Chip to a preset size style
   * @defaultvalue medium
   */
  size?: ChipSize;
}

export interface ChipProps extends ChipCoreProps, ChipConfigurableProps {
  /**
   * A Chip can have its content and borders styled for greater emphasis or to be subtle.
   * It can be filled, outline, ghost, inverted
   * @defaultvalue filled
   */
  appearance?: ChipAppearance;

  /*
   * Source URL or name of the icon to show on the Chip.
   */
  icon?: IconSourcesType;

  /**
   * Icon can be placed before or after Chip's content.
   * @default before
   */
  iconPosition?: ChipIconPosition;

  /**
   * Whether the Chip is disabled or not.
   * @platform android
   */
  disabled?: boolean;

  /**
   * Selected state. Mutually exclusive to 'defaultSelected'. Use this if you control the selected state at a higher level
   * and plan to pass in the correct value based on handling onChange events and re-rendering.
   * @platform android
   */
  selected?: boolean;

  /**
   * Default selected state. Mutually exclusive to 'selected'. Use this if you want an uncontrolled component, and
   * want the Chip instance to maintain its own state.
   * @platform android
   */
  defaultSelected?: boolean;

  /**
   * Callback that is called when the selected value has changed.
   * @platform android
   */
  onSelectionChange?: (e: InteractionEvent, isSelected: boolean) => void;

  /**
   * Apply when chip is intended to be used in a search bar.
   * Special styling is applied to the chip.
   * @platform android
   */
  searchBar?: boolean;

  /**
   * Show close icon when in 'selected' state.
   * @platform android
   */
  showCloseIcon?: boolean;
}
```

### Styling Tokens

Tokens can be used to customize the styling of the control by using the `customize` function on the `Chip`. For more information on using the `customize` API, please see [this page](../../framework/composition/README.md). The `Chip` has the following tokens:

```ts
export interface ChipCoreTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {
  /**
   * Set the bottom edge of the Chip
   */
  bottom?: FlexStyle['bottom'];

  /**
   * The height of the Chip.
   */
  height?: number;

  /**
   * The icon size.
   */
  iconSize?: number;

  /**
   * Set the left edge of the Chip
   */
  left?: FlexStyle['left'];

  /**
   * Set the right edge of the Chip
   */
  right?: FlexStyle['right'];

  /**
   * Set the top edge of the Chip
   */
  top?: FlexStyle['top'];

  /**
   * The width of the Chip.
   */
  width?: number;

  /**
   * Sizes of the Chip
   */
  tiny?: ChipTokens;
  extraSmall?: ChipTokens;
  small?: ChipTokens;
  medium?: ChipTokens;
  large?: ChipTokens;
  extraLarge?: ChipTokens;

  /**
   * Shapes of the Chip
   */
  rounded?: ChipTokens;
  circular?: ChipTokens;
  square?: ChipTokens;
}
export interface ChipTokens extends ChipCoreTokens, ChipConfigurableProps {
  /**
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;

  /**
   * Additional states that can be applied to a Chip
   */
  filled?: ChipTokens;
  outline?: ChipTokens;
  tint?: ChipTokens;
  ghost?: ChipTokens;

  /**
   * Colors of the Chip
   */
  brand?: ChipTokens;
  danger?: ChipTokens;
  important?: ChipTokens;
  informative?: ChipTokens;
  severe?: ChipTokens;
  subtle?: ChipTokens;
  success?: ChipTokens;
  warning?: ChipTokens;
  disabled?: ChipTokens;
  searchBar?: ChipTokens;
  /**
   * Selected state tokens for Chip
   */
  selected?: ChipTokens;
}
```

### Accessibility

Basic Chips do not recieve focus and are not accessible on all platforms other than Android.
Information about the chip should be added to the element that hosts the Chip through the element's `accessibilityLabel`.
