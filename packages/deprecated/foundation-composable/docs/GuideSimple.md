# Getting Started - Writing a simple component

The following guide walks through creating a simple component, which only wraps one internal control, with both a traditional approach and using the composable framework. It will start with creating an unopinionated version of the control, then layering styling on top.

## Writing UpperText and StyledUpperText the standard way

To use a traditionally contrived example, we can create a text control that will always render text in all caps. This will be called `UpperText`. This assumes that there is a primitive type called `Text` which is used to render the text string.

The text value itself will be passed as a prop called content.

```ts
export interface IUpperTextProps extends TextProps {
  content?: string;
}
```

### UpperText as a function component

Writing a simple function component this might look something like:

```jsx
const UpperText: React.FunctionComponent<IUpperTextProps> = (userProps: IUpperTextProps) => {
  const { content, ...props } = userProps;
  const upperText = changeTextToUppercaseWithLocale(content);
  return <Text {...props}>{upperText}</Text>;
};
```

This was of course straightforward and easy to write. While a real world example would likely have a lot more code and logic built in, for clarity this is a contrived and extremely simple example.

The pure functional approach works fine if the component will always be used as-is.

### Adding styling to produce StyledUpperText

To create a styled version of the UpperText control, again using react-native patterns, an implementation might look as follows:

```jsx
const myStyle = {
  fontFamily: 'Segoe UI',
  fontSize: 14,
  fontWeight: 700,
  color: 'blue'
}

const StyledUpperText: React.FunctionComponent<TextProps> = (userProps: TextProps) => {
  const mergedStyleProps = mergePropsAndStyle(userProps, myStyle);
  return (
    <UpperText {...mergedStyleProps} />;
  )
}
```

At this point has brought in a number of things:

- there needs to be some utility for resolving styles or classes passed through props with the internal styling of the control. Here this is a made up function called `mergePropsAndStyle`
- Then these are injected via props to the `<UpperText>` component.
- This has also added a layer to the hierarchy with the actual hierarchy ending up as:

```jsx
(<StyledUpperText>
  <UpperText>
    <Text>
  </UpperText>
</StyledUpperText>)
```

## Using Composable for UpperText

A composable component breaks the function into two parts, a hook for prop preparation called `usePrepareProps`, and a `render` function for returning the JSX elements.

### usePrepareProps hook function

This function takes in props, and a styling injection function, and returns the merged props in `ISlotProps` form. See the [foundation-settings](../../foundation-settings/README.md) documentation for more on `ISlotProps` and `mergeSettings`.

```ts
type ITextSlotProps = ISlotProps<TextProps>;

export function usePrepareProps(
  userProps: TextProps,
  useStyling: IUseStyling<ITextSlotProps>,
): IRenderData<ITextSlotProps, IUpperTextState> {
  const { content, ...props } = userProps;
  const children = changeTextToUppercaseWithLocale(content);
  const slotProps = mergeSettings(useStyling(props), { root: props }, { children });
  return { slotProps };
}
```

The flow of this function is as follows:

1. This starts off the same as the simple function implementation, splitting content from the rest of the props, then getting a modified version of the content prop.
1. Next it calls the passed in `useStyling` function to get any styled props. If no `useStyling` handler exists in the component the framework will set this to a function which will return nothing.
1. The styling slot props are merged with the modified props to produce the slot props to hand to render. This includes passing the modified content value into the root slot's children prop.
1. The slot props as `IRenderData`, a package that will be handed to the `render` function.

### render function

The `render` function will be handed the `IRenderData` returned from `usePrepareProps` as well as a set of Slots used for rendering. In the simple case the only slot that exists will be root. The render implementation would be as follows:

```ts
export function render(
  Slots: ISlots<ITextSlotProps>,
  renderData: IRenderData<ITextSlotProps>,
  ...children: React.ReactNode[]
): React.JSX.Element | null {
  return renderSlot(Slots.root, null, ...children);
}
```

The `Slots` parameter embeds a reference to the corresponding slot props entry from the `IRenderData`. The type used for rendering is from the `slots` option on `composable`.

In the case that render is not specified for a simple component, a default implementation that renders the root slot will be provided automatically.

### Full `<UpperText>` using `composable`

Putting this all together and writing it inline would produce the following:

```ts
export const UpperText = composable<TextProps>({
  usePrepareProps: (userProps: TextProps, useStyling: IUseStyling<ITextSlotProps>) => {
    const { content, ...props } = userProps;
    const upperText = changeTextToUppercaseWithLocale(content);
    const slotProps = mergeSettings(useStyling(props), { root: props });
    return { slotProps, state: { upperText } };
  },
  slots: {
    root: { slotType: Text },
  },
});
```

An empty `useStyling` implementation and a default `render` implementation will be set automatically.

## Using composable for StyledUpperText

To create a styled version of `<UpperText>` we simply compose the component using its `__composable` property which exposes its options and then add a `useStyling` implementation that references `myStyle` from the earlier.

```ts
export const StyledUpperText = composable<TextProps>({
  ...UpperText.__composable,
  useStyling: (props: TextProps) => {
    return { root: { style: myStyle } };
    // could also be something like return { root: { classNames='.myClass' } };
  },
});
```

This has now created a new control called `StyledUpperText` which will internally route directly to `Text` without having an intermediate `UpperText`, that shares the implementation code but just augments it by injecting a styling function.

Note that the customizations possible here go beyond adding styling. The type of the root slot could be changed, the actual hook implementation could be replaced, or the rendering function could be replaced.

## Opinionated vs. Unopinionated

It is not a requirement that controls be unopinionated. Providing an implementation for `useStyling` allows for providing styling. This can still be overriden when the control is composed.

## usePrepareProps and useStyling are hooks

These routines should always run and should not be put in conditionals. This means that it is allowable to call other hooks in these routines. A `usePrepareProps` implementation may often call `useState` and a `useStyling` implementation might query the theme via `useContext`.
