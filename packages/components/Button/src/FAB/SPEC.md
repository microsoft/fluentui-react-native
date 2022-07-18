# FAB

## Background

`FAB` stands for `Floating Action Button`. The `FAB` is a `Button` that is designed for mobile scenarios to signal primary actions to the user. This button only renders on mobile platforms.

## Requirements

If using FURN's theming, the `FAB` requires use of the `ThemeProvider` from `@fluentui-react-native/theme` to work properly with themes. Please see [this page](../../../../../docs/pages/Guides/UpdateThemeProvider.md) for information on updating your `ThemeProvider` if using the version from `@uifabricshared/theming-react-native`.

## Sample Code

Basic examples:

```jsx
<FAB>Text</FAB>
<FAB icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }} />
<FAB icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }}>Text</FAB>
<FAB appearance="primary">Text</FAB>
<FAB disabled>Text</FAB>
```

More examples on the [Test pages for the Button](../../../../../apps/fluent-tester/src/FluentTester/TestComponents/Button). Instructions on running the tester app can be found [here](../../../../../apps/fluent-tester/README.md).

## Visual Examples

Android:

![FAB with text on Android example](../../assets/fab_example_android.png)

```tsx
<FAB>Text</FAB>
```

## API

### Slots

The `FAB` component has two slots, or parts. The slots behave as follows:

- `root` - The outer container representing the `FAB` itself that wraps everything passed via the `children` prop.
- `icon` - If specified, renders an `icon` either before or after the `children` as specified by the `iconPosition` prop.
- `content` - If specified, renders the first entry of `children` as text.
- `shadow` - By default renders a shadow on the FAB. The depth of the shadow can be customized.

The slots can be modified using the `compose` function on the `FAB`. For more information on using the `compose` API, please see [this page](../../../../framework/composition/README.md).

### Props

```ts
export interface FABProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /*
   * Text to show on the Button.
   * Only used in FAB
   */
  content?: string;

  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconSourcesType;

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

Tokens can be used to customize the styling of the control by using the `customize` function on the `FAB`. For more information on using the `customize` API, please see [this page(../../../../framework/composition/README.md). The `FAB` has the following tokens:

```ts
export interface CompoundButtonTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {
  /**
   * The icon color.
   */
  iconColor?: ColorValue;

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
   * The amount of spacing between an icon and the content when iconPosition is set to 'before', in pixels
   */
  spacingIconContentBefore?: number;

  /**
   * States that can be applied to a button
   */
  hovered?: ButtonTokens;
  focused?: ButtonTokens;
  pressed?: ButtonTokens;
  disabled?: ButtonTokens;
  hasContent?: ButtonTokens;
  hasIconBefore?: ButtonTokens;
}
```

## Behaviors

Same as base `Button`.
