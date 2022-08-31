# Shadow

## Background

A `Shadow` is a component that can be used to add Fluent shadows to other components.

Shadows defined in the Fluent design system are actually comprised of two shadows. The **key shadow** is used to create a feeling of distance, and the **ambient shadow** is used to define the edges of the shape.

## Shadow Depth Ramp

These are the current `Shadow` variants:

|                 | Light mode                                                                                                                                                                | Dark mode                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Regular shadows | <img width="820" alt="light" src="https://user-images.githubusercontent.com/78454019/187567525-64592ead-c64c-4cc1-acd3-a21abdea2d35.png"> | <img width="820" alt="dark" src="https://user-images.githubusercontent.com/78454019/187567552-3b376f4d-eacd-482d-a395-a261c374c9f6.png"> |
| Brand shadows   | <img width="820" alt="light-brand" src="https://user-images.githubusercontent.com/78454019/187567541-c939ceaa-35b1-4cd6-84b5-55d8a5032e0c.png"> | <img width="820" alt="dark-brand" src="https://user-images.githubusercontent.com/78454019/187567558-79783f9b-2bff-463c-b7b5-7ec692b000fd.png"> |

## Sample Code

Examples adding some Shadows to some text:

```tsx
<Shadow shadowToken={theme.shadows.shadow8}>
  <Text>Text box with shadow8</Text>
</Shadow>
```

```tsx
<Shadow shadowToken={theme.shadows.shadow8brand}>
  <Text>Text box with shadow8brand</Text>
</Shadow>
```

For more examples of using Shadow, please see the [ShadowTest test page](https://github.com/microsoft/fluentui-react-native/tree/main/apps/fluent-tester/src/TestComponents/Shadow) in the [Fluent Tester app](https://github.com/microsoft/fluentui-react-native/blob/main/apps/fluent-tester/README.md).

For an example of adding a Shadow as a slot to a Fluent component, please see the [FAB component](https://github.com/microsoft/fluentui-react-native/tree/main/packages/components/Button/src/FAB) - this component exists on both iOS and Android, but currently only the iOS version uses the Shadow component. The [Notification component](https://github.com/microsoft/fluentui-react-native/tree/main/packages/components/Notification) is another example that uses the Shadow component.

## API

### Props

The `Shadow` component takes in one prop called `ShadowToken`. The variants of ShadowToken are all defined in the theme.
If `undefined` is passed into the `shadowToken` prop, no shadow will be rendered.

`Shadow` must take exactly one child, which must support a style that derives from ViewStyle (ex. View, Text)

## Notes

- Known issue: there may be some slight rounding discrepancies due to hex to decimal rounding errors, ex. opacity 0.24 may end up at 0.25.
