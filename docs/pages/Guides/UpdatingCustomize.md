# Migrating from old to new customize

The customize API allows clients to make targeted styling modifications to our controls. The second version of the FluentUI composition framework changes the customize API. This guide will describe how to move from the first to second customize API for our refreshed controls.

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

There is no equivalent for `_precedence` in the new customize API. If you need this functionality, [please look at using `compose` instead](../../../packages/framework/composition/README.md#compose).

### No slots as properties

There is no equivalent for passing in new slot props in the new customize API. If you need this functionality, [please look at using the `slotProps` property under `compose` instead](./UpdatingCompose.md).
