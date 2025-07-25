# @fluentui-react-native/memo-cache

This package implements a hierarchical memoization cache using an API pattern that mimics the react.js useMemo hook. It also provides an implementation of traditional JavaScript memoization built using react style utility.

Memoization is an optimization pattern used when a discrete set of inputs, typically parameters to an expensive function, yield a deterministic output. In this case, if the inputs match a previous call, a cached result can be retrieved. This is typically implemented as a factory function, which wraps a function in a closure, adding implicit caching.

React.js provides a hook called `useMemo` which is shifts to a more explicit model, where the keys are listed explicitly. This allows more control over the inputs than the older pattern. It's worth mentioning that the react `useMemo` hook is not a global cache, it is attached to a given component instance and compares the current execution with the previous one.

### When to Use This

This package can be beneficial in two scenarios:

#### Performance

If the routine to be memoized is expensive, then caching the results can boost performance. Note that cache lookups have cost themselves so memoizing a trivial function will likely be slower.

Also note that every additional key adds a level of depth to the hierarchical cache. This has expense and reduces the likelihood of data being already in the cache. Collapsing the inputs to a manageable set helps optimize this. For instance, if building a style from a theme definition pulls 8 values from a theme, it is more efficient to key the resulting object on the theme, than to key each property individually.

#### Object Identity

The other benefit to this pattern is maintaining object identity between subsequent calls. In react-native the object identity of the style property will sometimes be compared, even if the values within are identical, the shallow props compare will not see the objects as the same.

Similarly if a style is being turned into a CSS class (which is expensive), a `WeakMap` to map style objects to CSS classes will only work if the object identities are maintained.

## Usage guide

The baseline cache pattern is defined by the following type:

```ts
export type GetMemoValue<T, TGet = any> = (
  factory: T | () => T,
  keys: any[]
) => [T, GetMemoValue<TGet>];
```

The parameters are used as follows:

| Param     | Description                                                                                                                                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `factory` | This is typically a function, often a simple closure, which returns a value. This value will be cached for a given set of keys. Subsequent calls will just return the value without executing the function. This can also be a value type in which case that will be returned directly. |
| `keys`    | Variable parameter list, used as the keys for caching. Note that the order of keys matter. [A, B] resolves differently than [B, A].                                                                                                                                                     |

The return result is a tuple with two elements containing:

- The result of the factory function, or the value of factory if it is not a function
- A function for caching which is local to the previous keys queried

This recursive calling pattern allows for a natural pipelining of caching and memoization. Because the cache is effectively implemented as a tree, this pattern falls out fairly easily. See the examples below for more detail.

### getMemoCache

To get an instance of the memo cache to work with, a caller starts by calling `getMemoCache`.

```ts
export function getMemoCache<T = any>(globalKey?: object): GetMemoValue<T>;
```

This function takes an optional parameter `globalKey` which can be an object to use as a base cache reference.

- If `globalKey` is specified, the same cache will be retrieved from the global call with the same object reference.
- If `globalKey` is not specified the cache instance will be unique and contained entirely within the returned function.

### memoize

This library also provides a standard memoization wrapper:

```ts
export function memoize<T extends Function>(fn: T): T;
```

This should be able to handle any function as an input. It will create its own instance of the cache, use any parameters to the function as key values, and return a closure with the same signature as the input.

This should support the following:

- Function with any number of parameters
- Functions with no parameters
- Any return result
- Void functions

## Examples

The following are some examples for how to use the functions above for various optimizations.

### Merge styles to ensure object identity does not change

Given a function to merge styles together, wrap it in a memoization helper to ensure object identities don't change. Then add a helper for ensuring a CSS rule exists for a set of styles.

```ts
// standard function which will be memoized
function mergeStylesWorker(...cssStyles: CSSStyle[]): CSSStyle {
  // do the work of merging multiple styles together to form a new CSS style
}

// exported function internally has a caching layer with memoize
export const mergeStyles = memoize(mergeStylesWorker);

// all-in-one authoring of memoized function, this one to turn a style into a CSS class, traditionally
// an expensive operation in browsers
export const createRuleForStyle = memoize((style: CSSStyle) => {
  const className = // do the work of creating the rule
  return className;
});
```

### Hierarchical Theme Caching

This demonstrates a component called `MyComponent` that:

1. has a unique cache based on the component identity
2. cached a style computed against a theme
3. optionally merges a style from props and caches that result

These three levels of caching are effectively instance -> theme -> props.style.

```ts
import { getMemoCache } from '@fluentui-react-native/memo-cache';

// get a unique cache for this component
const myComponentCache = getMemoCache();

// component is a function that takes props
export const MyComponent = (props: IMyComponentProps) => {
  const theme = useContext(ThemeContext);
  const newProps = { ...props };

  // get the style, cached against the theme so it will only be called once, note that because
  const [style, themeLocalCache] = myComponentCache(() => {
    const colors = theme.colors;
    return {
      backgroundColor: colors.neutralBackground,
      color: colors.neutralForeground,
      // more stuff from theme
    };
  }, [theme]);

  // merge the styles if a style is passed in via props, caching the union to ensure consistent object identity
  newProps.style = newProps.style ? themeLocalCache(() => mergeStyles(style, newProps.style), [newProps.style])[0] : style;

  return <InnerControl {...newProps} />;
};
```
