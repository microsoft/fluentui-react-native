# @fluentui-react-native/use-slot

A pattern and framework for building layering components together in an efficient, pluggable, and customizable manner.

When building libraries of components, larger and more complex components are often built out of smaller and more focused components. This is great conceptually because it allows good separation of concerns and enables better and more modular designs. The boundaries in this layering are not only defined by the definition of your component, whether it be a function or a class based component, but by `React.createElement`. The `createElement` calls are what JSX is syntactic sugar for, and provides the layering for things like hooks.

## Looking a bit more deeply at rendering JSX

When the render tree is returned via `<View>` etc, these calls are turned into calls to `React.createElement`

- This creates an entry in the virtual DOM
- This entry has benefits such as allowing render passes to be initiated at that node
- It also effectively creates storage for hooks. Hooks are stored almost like stack frames for each component layer. This is why hooks cannot be conditional from render to render, it would cause stack misalignment.

If instead a function based component is rendered via a direct function call, e.g. `return Text(textProps)` this entry will not be created.

- This does not create a DOM entry, which saves overhead in the overall react tree
- This is only safe if the component does not use hooks and is a function component (not a class based one)

There are pros and cons to calling `createElement`. In most cases it is safer to do so. But with certain component patterns, particularly simple wrapping, this creates unnecessary overhead and as HOCs are built up this can become substantial. The patterns in this package attempt to alleviate this by allowing components to be authored in a way that they can be compressed safely.

## Staged Components

To solve this reliably for function components it is necessary to separate the hook calls from element tree generation. The pattern in this package is to write render functions that return a continuation function that will return the JSX tree. This pattern is as follows:

```tsx
const twoPartRender = (props: MyProps) => {
  // do the hook calls in this section */
  const theme = React.useContext(ThemeContext);
  const [state, setState] = React.useState(() => doSomeStateSetup()));

  // now return a (props) or (props, children) or (props, ...children) function that finishes the render
  return (additional: MyProps, ...children: React.ReactNode[]) => {
    const merged = { ...props, ...additional };
    return (<View {...merged}>{children}</View>)
  }
}
```

### `stagedComponent`

This type of function is not recognizable on its own as a component. This package exports a helper function `stagedComponent` that both:

- Turns a two part render function into a component that react can recognize
- Adds the means for the framework to access the initial two part function if it knows how to handle it

The helper will return a `React.FunctionComponent` that will forward props (without children) to the first call, then pass children to the continuation function.

## `useSlot`

Consuming these by hand are a bit tedious. To aid in this the `useSlot` hook function is provided. Besides enabling automatic tree compression (for component types that support it), this also allows components to be authored as pluggable bits in the render tree. Usage looks something like:

```ts
/** @jsxRuntime classic */
/** @jsx withSlots */

const baseStyle = {
  /* some text styling defaults set here */
};

// prop type that adds the ability to swap out the internal Text for something else
type TextWithOverrideProps = TextProps & { override?: React.FunctionComponent<TextProps> };

const StyledText = (props: React.PropsWithChildren<TextWithOverrideProps>) => {
  // split the children from props to forward them
  const { children, override, ...rest } = props;

  // create a merged set of props. The mergeStyle utility here will avoid creating unnecessary permutations of styles
  const mergedProps = { ...rest, style: mergeStyles<TextStyle>(baseStyle, rest.style) };

  // create a slot that can be used to render, props passed in here will be remembered in render. If override is set the slot will be changed, otherwise Text will be used
  const InnerText = useSlot(override || Text, mergedProps);

  // now just render using that slot
  return <InnerText>{children}</InnerText>;
};
```

## `withSlots`

The `withSlots` helper is required to render the slots correctly. The @jsx directive in the previous example is all that is required to make this work. This provides a helper to the @jsx processing utility that will render as a function if possible, or via createElement if not.
