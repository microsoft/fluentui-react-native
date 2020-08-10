# @fluentui-react-native/native-component

A cached wrapper around `requireNativeComponent`.

This addresses two potential gotchas with calls to `requireNativeComponent`.

## Unnecessary loads

The naive way to write a component would look something like:

```tsx
const MyNativeComponent = requireNativeComponent('MyNativeComponent');

export const MyComponent = props => {
  const propsInner = doSomeStuff(props);
  return <MyNativeComponent {...propsInner} />;
};
```

The issue here is that the call to `requireNativeComponent` happens when the module is loaded, not when the component is used. This can result in unnecessary overhead as well as causing issues if the native code isn't present.

## Multiple instances

For larger projects where different components may be imported directly, it can be easy to end up with slightly different versions of the code present. While this is a performance issue, and can cause subtle behavioral issues if globals are used, in the case of native components this can cause multiple calls to register the same native component. This will cause the view manager to be registered twice resulting in runtime issues.
