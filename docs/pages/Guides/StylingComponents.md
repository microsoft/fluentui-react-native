# How to Style Components with Customize

You can use the `customize` API to modify the tokens that are part of the component. If you have your own design guidelines that diverge from our default component API, you can call `customize()` to override the styles.

Example:

```ts
const PinkButton = Button.customize({
    backgroundColor: 'pink',
  })
<PinkButton>Pink Button</PinkButton>
```

More information of Customize can be found here: [Customize API](../../../packages/framework/composition/README.md#customize)

# Why use Customize instead of style = {{...}}

In FURN, we use a token-style approach to styling our components. Token is a semantic representation of a style proerty. It allows you to customize the control directly, without needing to understand the details of the implementation.

Using inline `styles={}` is poor for performance. On the other hand, tokens can be cached. Since token values do not change on multiple instances of a customized component, token values can be caches on the first instance, and is therefore a more optimized alternative.

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

In the following code bit below, the variant value has been set for `subtle` state, but this value was not being reflected on render.

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

States with higher precedence -- `small`, `medium`, and `large` -- override the variant with their own designated value. In order to avoid this issue, the `variant` token value must be set on a state with higher precedence.

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

More information on overriding tokens can be found here: [Overrides](../../../\docs\pages\Theming\Tokens\Overrides.md)
