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
In FURN, we a token-style approach to styling our components. A token is a semantic representation of a style proerty. It allows you to customize the control directly, without needing to understand the details of the implementation.

Using inline `styles={}` hurts performance. On the other hand, tokens are cached with `customize`. Since token values do not change on subsequent instances of the customized component, it wouldn't try to reassign tokens for every Instance, and is therefore a an optimized alternative to inlines `styles`.

# Commom Issues when styling components with Customize

## State Precedence

  If a state has a lower precedence than another state, tokens set for that state may be overridden by tokens set on a state with a higher precedence.

  For example, the following buttonStates list states in order of precedence (low to high).

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
  In the following code bit below, the variant value has been set on `subtle` state, but this change was not being reflected on render.

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
 Other states with higher precedence -- `small`, `medium`, and `large` -- were overriding the variant value with their own designated value. In order to avoid this issue, the `variant` token value needs to be set on a higher precedent state. This issue was resolved by setting the variant value on state with higher precedent, in this case when `medium` and `hasContent` states are both true.

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
      borderColor: '#005A9E'
    }
  });
```