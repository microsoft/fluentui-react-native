# Compound Button

## Background

The `CompoundButton` is a `Button` that is designed to show an extra line of text.

## Sample Code

Basic examples:

```jsx
<CompoundButton secondaryContent="A second line">Text</CompoundButton>
<CompoundButton icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }} secondaryContent="A second line" />
<CompoundButton icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }} secondaryContent="A second line">Text</CompoundButton>
<CompoundButton appearance="primary" secondaryContent="A second line">Text</CompoundButton>
<CompoundButton disabled secondaryContent="A second line">Text</CompoundButton>
<CompoundButton size="small" secondaryContent="A second line">Text</CompoundButton>
```

More examples in the Tester App.

## Variants

Variant options are the same as the base `Button` component. This section will note main differences in design from the the base `Button` component.

### Icon

The space for the icon is larger in a `CompoundButton`. The `CompoundButton` is designed so that it can hold an illustration in the place of an icon.

## API

### Slots

- `root` - The outer container representing the `Button` itself that wraps everything passed via the `children` prop.
- `icon` - If specified, renders an `icon` either before or after the `children` as specified by the `iconPosition` prop.
- `loader` - If specified, renders a `loader` before `children` while the `loading` flag is set to `true` in place of an icon. This slot is mutually exclusive to the icon slot.

### Props

```ts
export interface CompoundButtonProps extends ButtonProps {
  /**
   * Second line of text that describes the action this button takes.
   */
  secondaryContent?: string;
}
```

### Styling Tokens

```ts
export interface CompoundButtonTokens extends ButtonTokens {
  /**
   * Font of the second line of text on the button.
   */
  secondaryContentFont?: FontTokens;

  /**
   * Color of the second line of text on the button.
   */
  secondaryContentColor?: ColorValue;

  /**
   * States that can be applied to a button.
   * These can be used to modify styles of the button when under the specified state.
   */
  hovered?: CompoundButtonTokens;
  focused?: CompoundButtonTokens;
  pressed?: CompoundButtonTokens;
  disabled?: CompoundButtonTokens;
  primary?: CompoundButtonTokens;
  subtle?: CompoundButtonTokens;
  small?: CompoundButtonTokens;
  medium?: CompoundButtonTokens;
  large?: CompoundButtonTokens;
}
```

## Behaviors

Same as base `Button`.
