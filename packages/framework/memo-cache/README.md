# Memo cache package

This package implements a hierarchical memoization cache using an API pattern that mimics the react.js useMemo hook.

Memoization is an optimization pattern used when a discrete set of inputs, typically parameters to an expensive function, yield a deterministic output. In this case if the inputs match a cached result can be retrieved. This is typically implemented as a wrapper which accepts a function and exposes itself as a function with the same signature with implicit caching.

React.js provides a hook called `useMemo` which is shifts to a more explicit model, where the keys are listed explicitly. This allows more control over the inputs than the older pattern. It's worth mentioning that the react `useMemo` hook is not a global cache, it is attached to a given component instance and compares the current execution with the previous one.

### When to Use

This package can be beneficial in two scenarios:

- **Performance** - if the routine to be memoized is expensive, then caching the results can boost performance. Note that cache lookups have cost themselves so memoizing a trivial function will likely be slower.
- **Object Identity** - this ensures that the result of the processing function is the same object. This is particularly useful if the identity of the object will be compared to see if it has changed, or if the resulting object will be used to index into a `WeakMap`.

## Usage guide

```ts
function memoValue<T, TGet = any>(factory: T | () => T, keys: any[]): [T, GetMemoValue<TGet>]
```

### Parameters

| Param     | Description                                                                                                                                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `factory` | This is typically a function, often a simple closure, which returns a value. This value will be cached for a given set of keys. Subsequent calls will just return the value without executing the function. This can also be a value type in which case that will be returned directly. |
| `keys`    | Variable parameter list, used as the keys for caching                                                                                                                                                                                                                                   |

### Return Result

The return result is a tuple with two elements.

| Index | Type                 | Description                                                                                        |
| ----- | -------------------- | -------------------------------------------------------------------------------------------------- |
| 0     | `T`                  | The created and cached value type.                                                                 |
| 1     | `GetMemoValue<TGet>` | a function with the same signature as memoValue, that provides a cache scoped to this set of keys. |

### Examples
