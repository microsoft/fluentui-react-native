# @fluentui-react-native/composition

This package contains the `composeFactory` which all components created using the `compose` function under `@fluentui-react-native/framework` use to construct the component itself. The `composeFactory` returns a [staged component](https://github.com/microsoft/fluentui-react-native/tree/master/packages/framework/use-slot) with two additional functions, `customize` and `compose`. These functions allow for these components to have a degree of extensibility.

## Customize

The `customize` API is used to modify the tokens that are part of the component. [Tokens](https://github.com/microsoft/fluentui-react-native/tree/master/packages/framework/use-tokens) control aspects of style of the component. Each control has some default value for its tokens, and these values may change based on states the control has. `Customize` allows you to change what the value of the tokens are by default or for specific states. `Customize` can be used to create multiple different overrides of the same component, which allows for greater flexibility over [using the `components` property on the `Theme` object](https://github.com/microsoft/fluentui-react-native/blob/master/docs/pages/Theming/CustomTheme.md#components) to customize your components.

Examples:

```ts
const CustomButton = Button.customize({
  iconSize: 10,
  spacingIconContentBefore: 10,
})

<CustomButton>Button with small icon and large gap between icon and label</CustomButton>

const CustomHoverButton = Button.customize({
  hovered: { backgroundColor: 'pink' },
})

<CustomHoverButton>Button with pink background on hover</CustomButton>
```

## Compose

The `compose` API on the component is used to modify the options fed into the `compose` API which builds the component. Notably this can be used to change the [slots](https://github.com/microsoft/fluentui-react-native/blob/master/CONTRIBUTING.md#slots) of a component or the functions which build the prop objects of the slots of the component, allowing for customizability of individual portions of the component. It can also allow for changes to the `render` function of the component, or which `states` get applied to the component.

Examples:

```ts
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
  },
});
```
