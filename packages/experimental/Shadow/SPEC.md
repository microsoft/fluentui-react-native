# Shadow

## Background

A `Shadow` is a component that can be used to add Fluent shadows to other components.

Shadows defined in the Fluent design system are actually comprised of two shadows. The **key shadow** is used to create a feeling of distance, and the **ambient shadow** is used to define the edges of the shape.

## Shadow Depth Ramp

These are the current `Shadow` variants:

|                 | Light mode                                                                                                                                                                | Dark mode                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Regular shadows | <img width="801" alt="Screen Shot 2022-08-12 at 10 46 45 AM" src="https://user-images.githubusercontent.com/78454019/184426272-fe23d23f-3c60-4811-82d8-16ae8dc501d9.png"> | <img width="788" alt="Screen Shot 2022-08-12 at 12 08 56 PM" src="https://user-images.githubusercontent.com/78454019/184427236-0b93d797-fdde-4367-9caa-751bcf335eea.png"> |
| Brand shadows   | <img width="802" alt="Screen Shot 2022-08-12 at 12 09 15 PM" src="https://user-images.githubusercontent.com/78454019/184427300-06dacedc-5f39-4dc1-b07b-536186115d2e.png"> | <img width="789" alt="Screen Shot 2022-08-12 at 12 09 03 PM" src="https://user-images.githubusercontent.com/78454019/184427338-c322d223-4719-4593-a550-8360c45aa2e5.png"> |

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
