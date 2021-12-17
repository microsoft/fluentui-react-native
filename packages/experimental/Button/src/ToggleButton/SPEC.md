# Toggle Button

## Background

The `ToggleButton` is a `Button` that is designed show a selected state when toggled.

## Sample Code

Basic examples:

```jsx
<ToggleButton>Text</ToggleButton>
<ToggleButton icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }} />
<ToggleButton icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }}>Text</ToggleButton>
<ToggleButton appearance="primary">Text</ToggleButton>
<ToggleButton disabled>Text</ToggleButton>
<ToggleButton size="small">Text</ToggleButton>
```

## Variants

Variant options are the same as the base `Button` component.

## API

### Slots

- `root` - The outer container representing the `Button` itself that wraps everything passed via the `children` prop.
- `icon` - If specified, renders an `icon` either before or after the `children` as specified by the `iconPosition` prop.
- `loader` - If specified, renders a `loader` before `children` while the `loading` flag is set to `true` in place of an icon. This slot is mutually exclusive to the icon slot.

### Props

```ts
export interface ToggleButtonProps extends ButtonProps {
  /**
   * Defines the controlled checked state of the `ToggleButton`.
   * Mutually exclusive to `defaultChecked`.
   * This should only be used if the checked state is to be controlled at a higher level and there is a plan to pass the
   * correct value based on handling `onClick` events and re-rendering.
   */
  checked?: boolean;

  /**
   * Defines whether the `ToggleButton` is inititally in a checked state or not when rendered.
   * Mutually exclusive to `checked`.
   */
  defaultChecked?: boolean;
}
```

### Styling Tokens

```ts
export interface CompoundButtonTokens extends ButtonTokens {
  /**
   * States that can be applied to a button.
   * These can be used to modify styles of the button when under the specified state.
   */
  checked?: ToggleButtonTokens;
}
```

## Behaviors

This button includes the same behaviors as base `Button`. It has some additional states.

### States

The following section describes the additional states a `ToggleButton` can have.

#### Checked state

A checked `ToggleButton` changes styling to communicate that the button is currently selected or toggled.
