# Migrating from old to new customize

The customize API off our components allows clients to add additional styling in order for them to meet their needs. In moving controls from the old to new framework, the customize API usage changes slightly. This guide will describe how to move from the old to new customize API for our refreshed controls.

## Old customize

The old customize API takes in an argument of type `IDefineComposeSettings<TSlotProps, TTokens>`. This allows the object passed in to have each of the base control's slot prop builders (i.e. `root`), `tokens`, `_overrides` (which define how new states create differences in control styling) and `_precedence` (which defines the ordering of how states are applied) properties customized.

This example is taken from our checkbox control:

```jsx
const CircleColorCheckbox = Checkbox.customize({
  tokens: { borderRadius: 50, checkboxBackgroundColor: 'white' },
  _overrides: {
    checked: {
      tokens: {
        checkboxBackgroundColor: 'green',
        checkboxBorderColor: 'green',
        checkmarkColor: 'white',
      },
    },
    focused: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
    hovered: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
    pressed: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundPressed' } },
  },
});
```

## New customize

The new customize API takes in an argument of type `TokenSettings<TTokens, TTheme>[]`. This allows the object passed in to have each of the base control's `tokens` customized. The object passed in can be an array, and you can pass in a function which takes a theme and creates an object of type `TTokens` (actual type depends on the base control). Notably this does not allow for slot props builders to be modified, a difference from the old customize API.

This example is taken from our checkbox control:

```jsx
const CircleColorCheckbox = Checkbox.customize({
  borderRadius: 50,
  checkboxBackgroundColor: 'white',
  checked: {
    checkboxBackgroundColor: 'green',
    checkboxBorderColor: 'green',
    checkmarkColor: 'white',
  },
  focused: { checkboxBackgroundColor: 'menuItemBackgroundHovered' },
  hovered: { checkboxBackgroundColor: 'menuItemBackgroundHovered' },
  pressed: { checkboxBackgroundColor: 'menuItemBackgroundPressed' },
});
```

## Moving from old to new

### No `tokens` property

All tokens that were previously under `tokens` are now at the top level of the object passed into `customize()`

### No `_overrides` property

All states that were previously under `_overrides` are now at the top level of the object passed into `customize()`

### No `_precedence` property

There is no equivalent for `_precedence` in the new customize API. Instead, you can change the token entries when the right combination os states is applied.

### No slot props as properties

There is no equivalent for passing in new slot prop building functions in the new customize API. If you need this functionality, [please look at using `compose` instead](https://github.com/microsoft/fluentui-react-native/tree/master/packages/framework/composition#compose).
