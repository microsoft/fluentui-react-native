# Migrating from old to new compose

The compose API allows clients to supply new arguments for creating the control with specialized requirements. The second version of the FluentUI composition framework changes the compose API. The compose API has a large range of inputs and is very flexible. This guide will cover more common scenarios. Please open an issue on the repo is additional examples of migrating to the new API are necessary for a particular scenario.

## Old compose

The old customize API takes in an argument of type `Partial<IComposeOptions<ITProps, ITSlotProps, ITTokens, ITState, ITStatics>>`. This allows users to change the slots of a control, how props for those slots are prepared, how tokens are mapped to slots, and how the component is rendered. It can also take care of what the customize API does. Most commonly it's used to change the slot's types.

Here is an example:

```jsx
const CustomText = Text.customize({ tokens: { fontSize: 'header', color: 'hotpink' } });
const ComposedButton = Button.compose({
  slots: {
    content: CustomText,
  },
  settings: [
    {
      content: {
        style: { marginTop: -1, marginBottom: 1, marginStart: 0, marginEnd: -2 },
      },
    },
  ],
});
```

## New compose

The new customize API takes in an argument of type `Partial<ComposeFactoryOptions<TProps, TSlotProps, TTokens, TTheme, TStatics>>`. This allows users to change the slots of a control, how props for those slots are prepared, states of the control, and how the component is rendered. It can also take care of what the customize API does. Most commonly it's used to change the slot's types.

Here is an example of a more common use case:

```jsx
const CustomText = Text.customize({ fontSize: 'header', color: 'hotpink' });
const ComposedButton = Button.compose({
  slots: {
    root: View,
    icon: Icon,
    content: CustomText,
  },
  slotProps: {
    content: {
      // Only overrides the style prop of the content slot - other props and slots are left alone
      style: { marginTop: -1, marginBottom: 1, marginStart: 0, marginEnd: -2 },
    },
  },
});
```

## Moving from old to new

### DisplayName

The `displayName` property stays the same between the two versions.

### Replacing slots

The general structure of the slots property stays the same between the old and new versions, however the slots themselves may have changed between the old and new version of a component.

### Passing tokens and other styling to a slot

The old API took care of this through the `settings` and `styles` properties. The new API does both under the `slotProps` property. The `slotProps` property takes an object with properties corresponding to the slot names of the control, and the properties can either be objects of the prop type for the slot, or they can be a mapped to a helper function (`buildProps`) which will generate the prop object based on the control's token values and the theme:

```ts
import { Theme, buildProps } from '@fluentui-react-native/framework';

slotProps: {
    // Object example
    content: {
      style: { marginTop: -1, marginBottom: 1, marginStart: 0, marginEnd: -2 },
    },
    // Function example
    root: buildProps(
      (tokens: TTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          width: tokens.width,
          backgroundColor: tokens.backgroundColor,
          borderColor: theme.colors.neutralStroke1,
        },
      }),
      ['backgroundColor', 'width'], // Keys to be used for caching. These are the names of the tokens that the props depend on
    ),
}
```

The `slotProps` property only takes care of the properties of `settings` that are named after slots. For migrating the token portions, you can add a `token` propery with the customized tokens defined. The content of the `token` property would be what you would pass into the customize API. See guidance on how to migrate the customize API [here](./UpdatingCustomize.md) for formatting guidance.

### Replacing `usePrepareProps`

There is no direct equivalent for `usePrepareProps` in the new compose API. Hooks that used to be put in `usePrepareProps` are now in the outer closure of the `render` function. Migrating from `usePrepareProps` can be difficult, so if there are any issues please open an issue on our repo and we will be happy to help.
