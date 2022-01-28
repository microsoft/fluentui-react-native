# @fluentui-react-native/composition

This package contains the component factory for all components created using the `compose` function under `@fluentui-react-native/framework`. We generally refer to this as the `compose` framework. This framework has built-in functionality for integrating a theme with a component to style it, and allows for extensibility of the created component using two additional functions, `customize` and `compose`, which you can call on the component to create a new component.

The component factory takes in a set of options. The options object allows the component's author to define a component's [slots](https://github.com/microsoft/fluentui-react-native/blob/master/CONTRIBUTING.md#slots), how the props for those slots are calculated, additional states of the component (such as hovered, pressed, or selected), the component's [tokens](https://github.com/microsoft/fluentui-react-native/tree/master/packages/framework/use-tokens) and their default values, and the component's render function.

## Customize

The `customize` API is used to modify the tokens that are part of the component. [Tokens](https://github.com/microsoft/fluentui-react-native/tree/master/packages/framework/use-tokens) control aspects of style of the component. Each control has some default value for its tokens, and these values may change based on states the control has. `Customize` allows you to change what the value of the tokens are by default or for specific states of the component. Each state of a component has an entry in a component's token set with the type `TTokens` which can be modified to set the tokens for that state. `Customize` can be used to create multiple different overrides of the same component, which allows for greater flexibility over [using the `components` property on the `Theme` object](https://github.com/microsoft/fluentui-react-native/blob/master/docs/pages/Theming/CustomTheme.md#components) to customize your components. The `customize` API will take in args of type `TokenSettings<TTokens, TTheme>`.

NOTE: Do not use this function to create a component inside a render function, otherwise the customized components will be recreated on each render.

Examples:

```ts
import { Theme } from '@fluentui-react-native/framework';

const CustomButton = Button.customize({
  iconSize: 10,
  spacingIconContentBefore: 10,
})

<CustomButton>Button with small icon and large gap between icon and label</CustomButton>

const CustomHoverButton = Button.customize({
  hovered: { backgroundColor: 'pink' },
})

<CustomHoverButton>Button with pink background on hover</CustomButton>

const CustomThemeButton = Button.customize((t: Theme) => ({ tokens: { backgroundColor: t.colors.neutralBackground1 }}));

<CustomHoverButton>Button uses theme entries for customization</CustomButton>
```

## Compose

The `compose` API on the component is used to modify the options fed into the `compose` API which builds the component. Notably this can be used to change the [slots](https://github.com/microsoft/fluentui-react-native/blob/master/CONTRIBUTING.md#slots) of a component or the functions which build the prop objects of the slots of the component, allowing for customizability of individual portions of the component. It can also allow for changes to the `render` function of the component, or which `states` get applied to the component. The compose function takes in an object of type `Partial<ComposeFactoryOptions<TProps, TSlotProps, TTokens, TTheme, TStatics>>`.

NOTE: Do not use this function to create a component inside a render function, otherwise the composed components will be recreated on each render.

Examples:

```ts
import { Theme, buildProps } from '@fluentui-react-native/framework';

const CustomText = Text.customize({ fontSize: 'header', color: 'hotpink' });
const ComposedButton = Button.compose({
  slots: {
    root: View,
    icon: Icon,
    content: CustomText, // changed the content slot to use large hotpink text component
  },
  slotProps: {
    content: {
      // Change the style prop of the content slot to only style margins, dropping styles from tokens.
      style: { marginTop: -1, marginBottom: 1, marginStart: 0, marginEnd: -2 },
    },
    root: buildProps(
      (tokens: ButtonTokens, _theme: Theme) => ({
        style: {
          backgroundColor: tokens.backgroundColor,
        },
      }),
      ['backgroundColor'], // key used for caching
    ),
  },
});
```
