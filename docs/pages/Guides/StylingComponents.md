# How to Style Components with Customize

You can use the `customize` API to modify the tokens that are part of the component. If you have your own design guidelines that diverge from our default component API, you can call `customize()` to override the styles.

Example:

```ts
const PinkButton = Button.customize({
    backgroundColor: 'pink',
  })
<PinkButton>Pink Button</PinkButton>
```

More information on the Customize API can be found here: [Customize API](../../../packages/framework/composition/README.md#customize)

# Why use Customize instead of style = {{...}}

In FURN, we use a token-style approach to style our components. Token is a semantic representation of a style property. It allows you to customize the control directly, without needing to understand the details of the implementation.

Using inline `styles={}` can be detrimental to performance. This is why we encourage our uses to customize their components using tokens instead. Token values that do not change across multiple instances can be cached on the first instance, and is therefore a more optimized alternative.

# Commom Issues when styling components with Customize

## State Precedence

If a state has lower precedence than another, tokens set for that given state may be overridden by those set on a state with higher precedence.

For example, look at the following `buttonStates` list in order of precedence (low to high).

```ts
export const buttonStates: (keyof ButtonTokens)[] = [
  'primary',
  'subtle',
  'hovered',
  'small',
  'medium',
  'large',
  'hasContent',
  'focused',
  'pressed',
  'disabled',
];
```

In the following code bit below, the variant token has been set for `subtle` state, but this value was not being reflected on render.

```ts
const CustomizedButton = Button.customize({
  subtle: {
    backgroundColor: 'transparent',
    color: props.color,
    iconColor: props.color,
    variant: 'body2Strong',
    disabled: {
      color: props.disabledColor,
    },
    pressed: {
      color: props.pressedColor,
    },
  },
  medium: {
    hasContent: {
      minWidth: 0,
      padding: globalTokens.sizeNone,
      paddingHorizontal: globalTokens.sizeNone,
    },
  },
});
```

States with higher precedence -- `small`, `medium`, and `large` -- override the token with their own designated value for `variant`. In order to avoid this issue, the `variant` token value must be set on a state with higher precedence.

The given issue was resolved by setting the variant value when `medium` and `hasContent` states are both true.

```ts
const CustomizedButton = Button.customize({
  subtle: {
    backgroundColor: 'transparent',
    color: props.color,
    iconColor: props.color,
    disabled: {
      color: props.disabledColor,
    },
    pressed: {
      color: props.pressedColor,
    },
  },
  medium: {
    hasContent: {
      minWidth: 0,
      padding: globalTokens.sizeNone,
      paddingHorizontal: globalTokens.sizeNone,
      variant: 'body2Strong',
    },
  },
});
```

## Overriding both default and state tokens in one customized component

Components have tokens set for states which override default tokens. These can also be customized.

```ts
const CustomRadioButton = RadioButton.customize({
  backgroundColor: '#000000',
  borderColor: '#000000',
  selected: {
    backgroundColor: '#005A9E',
    borderColor: '#005A9E',
  },
});
```

More information on overriding tokens can be found here: [Overrides](../Theming/Tokens/Overrides.md)

## Using Customize with Compose

You may have a scenario where you need to modify the styling and the options that build the component itself. You can achieve this by using both `compose` and `customize` or you can include style customizations in `compose` directly.

Example using both `compose` and `customize`:

```ts
const ComposedButton = Button.compose({
  slotProps: {
    root: buildProps(
      (tokens: ButtonTokens) => ({
        style: {
          backgroundColor: tokens.backgroundColor,
        },
      }),
      ['backgroundColor'],
    ),
  },
});

const CustomizedButton = ComposedButton.customize({
  subtle: { hovered: { backgroundColor: 'red' } },
});
```

Example only using `compose`:

```ts
const ComposedButton = Button.compose({
  tokens: [{ subtle: { hovered: { backgroundColor: 'red', color: 'green' } } }],
  slotProps: {
    root: buildProps(
      (tokens: ButtonTokens) => ({
        style: {
          backgroundColor: tokens.backgroundColor,
        },
      }),
      ['backgroundColor'],
    ),
  },
});
```
