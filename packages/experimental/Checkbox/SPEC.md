# Checkbox

## Background

The `Checkbox` component enables users to select one or more items from a group, or switch between two mutually exclusive options (checked or unchecked).

## Requirements

If using FURN's theming, the `Checkbox` requires use of the `ThemeProvider` from `@fluentui-react-native/theme` to work properly with themes. Please see [this page](https://github.com/microsoft/fluentui-react-native/blob/master/docs/pages/Guides/UpdateThemeProvider.md) for information on updating your `ThemeProvider` if using the version from `@uifabricshared/theming-react-native`.

## Sample Code

Basic examples:

```jsx
<Checkbox label="Example Checkbox" />
<Checkbox label="Circular Checkbox" circular size="large" />
<Checkbox label="Controlled Checkbox" onChange={onChangeFunction} checked={checked} />
```

More examples on the [Test pages for the Checkbox](https://github.com/microsoft/fluentui-react-native/tree/master/apps/fluent-tester/src/FluentTester/TestComponents/CheckboxExperimental). Instructions on running the tester app can be found [here](https://github.com/microsoft/fluentui-react-native/blob/master/apps/fluent-tester/README.md).

## Visual Examples

Win32:

![Checkbox with text on win32 example](./assets/Checkbox_example_win32.png)

```tsx
<Checkbox>Text</Checkbox>
```

![Checkbox with text and primary appearance on win32 example](./assets/Checkbox_primary_example_win32.png)

```tsx
<Checkbox appearance="primary">Text</Checkbox>
```

## Variants

### Appearance

The `Checkbox` component has several apparance variants depending on where it's being used:

- The default `Checkbox` is rendered with its default styling indicating a trigger for an action.
- appearance="primary": The `Checkbox` is styled to emphasize that it represents the primary action.
- appearance="subtle": The `Checkbox` is styled to blend into its background to become less emphasized.

### Icon

The `Checkbox` component can include an `icon` that appears before or after its `children`. If an `icon` is provided without any other `children` passed into `Checkbox`, then the `Checkbox` becomes an icon-only `Checkbox`.

### Shape

- shape="rounded": The Checkbox as rounded corners. This is the default if shape is not set.
- shape="circular": The Checkbox has completely round corners. A Checkbox of equal width and height will be a circle.
- shape="square": The Checkbox has right-angle corners.

### Sizes

The `Checkbox` component supports different sizing with at least three different sizes: `small`, `medium`, and `large`. `Small` is the default on `win32`, `medium` is the default on other platforms.

### Block

The `Checkbox` component can completely fill the width of its container.

### Loading

The `Checkbox` component can be loading if it's waiting for another action to occur before allowing itself to be interacted with.

## API

### Slots

The `Checkbox` component has three slots, or parts. The slots behave as follows:

- `root` - The outer container representing the `Checkbox` itself that wraps everything passed via the `children` prop.
- `icon` - If specified, renders an `icon` either before or after the `children` as specified by the `iconPosition` prop.
- `content` - If specified, renders the first entry of `children` as text.

The slots can be modified using the `compose` function on the `Checkbox`. For more information on using the `compose` API, please see [this page](../../framework/composition/README.md).

### Props

Below is the set of props the Checkbox supports:

```ts
export interface CheckboxProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /**
   * A Checkbox can have its content and borders styled for greater emphasis or to be subtle.
   * - 'primary': Emphasizes the Checkbox as a primary action.
   * - 'subtle': Minimzes emphasis to blend into the background until hovered or focused.
   */
  appearance?: 'primary' | 'subtle';

  /**
   * A Checkbox can fill the width of its container.
   * @default false
   */
  block?: boolean;

  /**
   * A RefObject to access the ICheckbox interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Icon slot that, if specified, renders an icon either before or after the `children` as specified by the
   * `iconPosition` prop.
   */
  icon?: IconSourcesType;

  /**
   * Checkbox contains only icon, there's no text content
   * Must be set for Checkbox to style correctly when Checkbox has not content.
   */
  iconOnly?: boolean;

  /**
   * A Checkbox can format its icon to appear before or after its content.
   * @default 'before'
   */
  iconPosition?: 'before' | 'after';

  /**
   * A Checkbox can show a loading indicator if it is waiting for another action to happen before allowing itself to
   * be interacted with.
   * @default false
   */
  loading?: boolean;

  /**
   * A Checkbox can be rounded, circular, or square.
   * @default 'rounded'
   */
  shape?: 'rounded' | 'circular' | 'square';

  /**
   * A Checkbox supports different sizes.
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Text that should show in a tooltip when the user hovers over a Checkbox.
   */
  tooltip?: string;

  /**
   * A callback to call on Checkbox click event
   */
  onClick?: () => void;
}
```

### Styling Tokens

Tokens can be used to customize the styling of the control by using the `customize` function on the `Checkbox`. For more information on using the `customize` API, please see [this page](../../framework/composition/README.md). The `Checkbox` has the following tokens:

```ts
export interface CheckboxTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {
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
   * The width of the Checkbox.
   */
  width?: ViewStyle['width'];

  /**
   * The amount of spacing between an icon and the content when iconPosition is set to 'before', in pixels
   */
  spacingIconContentBefore?: number;

  /**
   * The amount of spacing between an icon and the content when iconPosition is set to 'after', in pixels
   */
  spacingIconContentAfter?: number;

  /**
   * States that can be applied to a Checkbox.
   * These can be used to modify styles of the Checkbox when under the specified state.
   */
  hovered?: CheckboxTokens;
  focused?: CheckboxTokens;
  pressed?: CheckboxTokens;
  disabled?: CheckboxTokens;
  hasContent?: CheckboxTokens;
  hasIconAfter?: CheckboxTokens;
  hasIconBefore?: CheckboxTokens;
  primary?: CheckboxTokens;
  subtle?: CheckboxTokens;
  block?: CheckboxTokens;
  small?: CheckboxTokens;
  medium?: CheckboxTokens;
  large?: CheckboxTokens;
  rounded?: CheckboxTokens;
  circular?: CheckboxTokens;
  square?: CheckboxTokens;
}
```

## Behaviors

### States

The following section describes the different states which `Checkbox` can be in as a result of interaction.

#### Enabled and Disabled states

An enabled `Checkbox` communicates interaction by having styling that invites the user to click/tap on it to trigger an action.

A disabled `Checkbox` is non-interactive, disallowing the user to click/tap on it to trigger an action.

#### Hovered state

A hovered `Checkbox` changes styling to communicate that the user has placed a cursor above it.

#### Focused state

A focused `Checkbox` changes styling to communicate that the user has placed keyboard focus on it. This styling is usually the same to the one in the hovered state plus extra styling on the outline to indicate keyboard focus has been placed on the component.

#### Pressed state

A pressed `Checkbox` changes styling to communicate that the user is currently pressing it.

#### Loading state

A loading `Checkbox` renders a `loader` before all the other content to indicate that it is waiting for another action before allowing itself to be interacted with.

### Interaction

#### Keyboard interaction

The following is a set of keys that interact with the `Checkbox` component:

| Key     | Description                                           |
| ------- | ----------------------------------------------------- |
| `Enter` | Executes the function passed into the `onClick` prop. |
| `Space` | Executes the function passed into the `onClick` prop. |

#### Cursor interaction

- Cursor moves onto botton: Should immediately change the styling of the `Checkbox` so that it appears to be hovered.
- Cursor moves out of botton: Should immediately remove the hovered styling of the `Checkbox`.
- Mouse click: Should execute the `Checkbox` and move focus to its target.

#### Touch interaction

The same behavior as above translated for touch events. This means that there is no equivalent for `onHoverIn` and `onHoverOut`, which makes it so that the hovered state cannot be accessed.

## Accessibility

### Expected behavior

- Should default to adding `role="Checkbox"` to the root slot.
- Should mix in the accessibility props expected for a `Checkbox` component.
- Should be keyboard tabbable and focusable.

See [`useCheckbox` hook](https://github.com/microsoft/fluentui-react-native/blob/master/packages/experimental/Checkbox/src/useCheckbox.ts) for details on accessibility props
