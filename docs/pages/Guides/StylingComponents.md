# How to Style Components with Customize
TODO

Pull info from links below and include some examples

https://github.com/microsoft/fluentui-react-native/blob/main/docs/pages/Theming/Tokens/Overrides.md#overriding-component-tokens

https://github.com/microsoft/fluentui-react-native/blob/main/docs/pages/Theming/Tokens/Overrides.md#overriding-component-tokens



# Why use Customize instead of style = {{...}}
TODO

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
##
