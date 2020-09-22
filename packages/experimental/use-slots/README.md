# @fluentui-react-native/use-slots

A pattern and framework for building layering components together in an efficient, pluggable, and customizable manner.

When building libraries of components, larger and more complex components are often built out of smaller and more focused components. This is great conceptually because it allows good separation of concerns and enables better and more modular designs. The boundaries in this layering are not only defined by the definition of your component, whether it be a function or a class based component, but by `React.createElement`. The `createElement` calls are what JSX is syntactic sugar for, and provides the layering for things like hooks.

The issue is that this layering adds overhead as well. When building HOCs the number of elements in the JSX tree, can be far greater than the actual number of primitives rendered in the DOM. While it is possible to render a function component by calling it directly, this has to be done with caution if that component contains hooks. The storage for hooks is effectively an array indexed from the last `createElement` call. If a `useState` call were to happen on one render pass, but be skipped in the next, all subsequent hook calls would be misaligned.

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

## Consuming staged components

Staged components could be consumed by hand. This might look something like:

```ts
// create the BaseComponent as a staged component, this can still be rendered via <BaseComponent />
const BaseComponent = stagedComponent(/* some implementation */);

// create a wrapper component
const WrapperComponent = stagedComponent((props) => {
  // grab the children, do some prop transformations, etc.
  const { children, ...rest } = props;
  const propsForBase = doSomethingWithProps(rest);
  // call the first part of the function
  const continuation = BaseComponent._staged(propsForBase);
  // now render that component just by calling the function
  return continuation({}, children)
}
```

Note that in this example the `WrapperComponent` is leveraging the code of the `BaseComponent` but will not create a dedicated tree entry. Also the `WrapperComponent` itself could be implemented as a staged component.

### Consuming staged components via a `useSlots` hook

TBD
