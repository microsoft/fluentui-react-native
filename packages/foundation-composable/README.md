# Composable - un-opinionated and composable base components

This package provides a framework for writing unopinionated functional components that can easily be extended to inject styling, and composed together in an efficient manner.

This provides a foundation for writing both simple and higher order components with the following characteristics:

- **Unopinionated** - Components can be written such that they encapsulate the core functionality of a component, without having opinions on what styling system to use. There are myriad styling systems and all involve tradeoffs between flexibility, simplicity, and performance. Writing components which allow injection of a styling system allows consumers to optimize for their scenarios.
- **Reusable** - Modern practice in react encourages making functionality reusable via hooks. This framework provides a standardized pattern for hooks and how their results are communicated to the actual rendering. This allows replacing or augmenting either the hook or rendering portions without the need of writing everything from scratch.
- **Customizeable** - Typical customization patterns involve either passing customizations via props, or customizing via wrapping. Passing customizations via props explode the complexity of the props and cause issues with cacheability and performance. Wrapping components adds additional layers to the react hierarchy and still precludes access to internals of the component.
- **Composable** - This framework provides a repeatable pattern which allows for a wrapped component, or a part of a higher order component, to be executed functionally without adding extra layers to the react hierarchy.
- **Scalable** - Composable components can be used for both simple and higher order components. The framework uses the concept of slots to make targeting and customizing sub-components easier.
- **Flexible** - This pattern is suitable for use with both react and react-native. None of the concepts are platform specific.

## Getting Started - writing a simple component

To use a traditionally contrived example, we can create a text control that will always render text in all caps. While this would work just as well holding something like a 'span', for the purposes of this example we will assume this is rendering something like a react-native text element. Writing a simple function component this might look something like:

```jsx
const UpperText: React.FunctionComponent<TextProps> = (userProps: TextProps) => {
  const { children, ...props } = userProps;
  const newChildren = changeTextToUppercaseWithLocale(children);
  return <Text {...props}>{newChildren}</Text>;
};
```

In the simplest case this is extremely fast to write. This is fine if it will always be used as-is. In the case that implicit styling should be added one could do the following:

```jsx
// myStyle would likely be a StyleSheet for RN or a css-class for web
const myStyle = {
  fontFamily: 'Segoe UI',
  fontSize: 14,
  fontWeight: 700,
  color: 'blue'
}

const StyledUpperText: React.FunctionComponent<TextProps> = (userProps: TextProps) => {
  // do something that merged any style/classes coming from props with style above
  const mergedStyleProps = mergePropsAndStyle(userProps, myStyle);
  return (
    <UpperText {...mergedStyleProps} />;
  )
}
```

At this point has brought in a number of things:

- there needs to be some utility for resolving styles or classes passed through props with the internal styling of the control.
- Then these are injected via props to the `<UpperText>` component.
- This has also added a layer to the hierarchy as using `<StyledUpperText>` will contain an `<UpperText>` which will contain a `<Text>`.

### Using Composable for UpperText

A composable component breaks the function into two parts, a hook for prop preparation called `usePrepareProps`, and a `render` function for returning the JSX elements.

#### usePrepareProps hook function

This function takes in props, and a styling injection function, and returns the merged props in `ISlotProps` form. See the [foundation-settings](../foundation-settings/README.md) documentation for more on `ISlotProps` and `mergeSettings`.

```ts
type ITextSlotProps = ISlotProps<TextProps>;

export function usePrepareProps(
  userProps: TextProps,
  useStyling: IUseStyling<ITextSlotProps>
): IRenderData<ITextSlotProps> {
  const { children, ...props } = userProps;
  const props.children = changeTextToUppercaseWithLocale(children);
  const styleSlotProps = useStyling(props);
  return { slotProps: mergeSettings(styleProps, { root: props }) };
}
```

The flow of this function is as follows:

1. This starts off in a very similar manner to the simple function implementation, creating a new set of props and modifying the children to make the text string all uppercase via an external routine.
1. Next it calls the passed in `useStyling` function to get any styled props. If no `useStyling` handler exists in the component the framework will set this to a function which will return nothing.
1. Finally the styling slot props are merged with the modified props to produce the slot props to hand to render.

#### render function

The `render` function will be handed the `IRenderData` returned from `usePrepareProps` as well as a set of Slots used for rendering. In the simple case the only slot that exists will be root. The render implementation would be as follows:

```ts
export function render(Slots: ISlots<ITextSlotProps>, renderData: IRenderData<ITextSlotProps>): JSX.Element | null {
  return renderSlot(Slots.root);
}
```

The passed in `Slots` parameter embeds a reference to the corresponding slot props entry from the `IRenderData`. The type used for rendering is from the `slots` option on `composable`.

In the case that render is not specified for a simple component, a default implementation that simply renders the root slot will be provided automatically.

Putting this all together and writing it inline would produce the following:

#### Full `<UpperText>` using `composable`

```ts
export const UpperText = composable<TextProps>({
  usePrepareProps: (userProps: TextProps, useStyling: IUseStyling<ITextSlotProps>) => {
    const { children, ...props } = userProps;
    const props.children = changeTextToUppercaseWithLocale(children);
    const styleSlotProps = useStyling(props);
    return { slotProps: mergeSettings(styleProps, { root: props }) };
  },
  slots: {
    root: { slotType: Text }
  }
})
```

An empty `useStyling` implementation and a default `render` implementation will be set automatically.

### Using composable for StyledUpperText

To create a styled version of `<UpperText>` we simply compose the component using its `__composable` property which exposes its options and then add a `useStyling`

```ts
export const StyledUpperText = composable<TextProps>({
  ...UpperText.__composable,
  useStyling: (props: TextProps) => {
    return { root: { myStyle } };
  }
});
```

This has now created a new control called `StyledUpperText` which will internally route directly to `Text` without having an intermediate `UpperText`, that shares the implementation code but just augments it by injecting a styling function.

Note that the customizations possible here go beyond adding styling. The type of the root slot could be changed, the actual hook implementation could be replaced, or the rendering function could be replaced.

## Writing a Higher Order Component

While the composable pattern works for simple components, it is designed to help manage the complexity of higher order components. Let's use writing a simple Button as an example, this time working backwards from `render`.
