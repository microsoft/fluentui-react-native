# FAB

## Background

The `FAB` is a `Button` that is designed for mobile scenarios. This button only renders on mobile platforms.

## Sample Code

Basic examples:

```jsx
<FAB>Text</FAB>
<FAB icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }} />
<FAB icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }}>Text</FAB>
<FAB appearance="primary">Text</FAB>
<FAB disabled>Text</FAB>
```

## API

### Slots

- `root` - The outer container representing the `Button` itself that wraps everything passed via the `children` prop.
- `icon` - If specified, renders an `icon` either before or after the `children` as specified by the `iconPosition` prop.

### Props

```ts
export interface FABProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /*
   * Text to show on the Button.
   * Only used in FAB
   */
  content?: string;

  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconSourcesType;

  innerRef?: React.ForwardedRef<IFocusable>;

  /**
   * A callback to call on button click event
   */
  onClick?: () => void;

  /**
   * Text that should show in a tooltip when the user hovers over a button.
   */
  tooltip?: string;
}
```

### Styling Tokens

```ts
export interface CompoundButtonTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {
  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * The icon color when hovering over the Button.
   */
  iconColorHovered?: ColorValue;

  /**
   * The icon color when the Button is being pressed.
   */
  iconColorPressed?: ColorValue;

  /**
   * The size of the icon.
   */
  iconSize?: number;

  /**
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;

  /**
   * The width of the button.
   */
  width?: ViewStyle['width'];

  /**
   * The amount of spacing between an icon and the content, in pixels
   */
  spacingIconContent?: number;

  /**
   * States that can be applied to a button
   */
  hovered?: ButtonTokens;
  focused?: ButtonTokens;
  pressed?: ButtonTokens;
  disabled?: ButtonTokens;
  hasContent?: ButtonTokens;
  hasIcon?: ButtonTokens;
}
```

## Behaviors

Same as base `Button`.
