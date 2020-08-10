# @fluentui-react-native/native-component

A cached wrapper around `requireNativeComponent`.

## Issues

This addresses two potential gotchas with calls to `requireNativeComponent`.

### Unnecessary loads

The naive way to write a component would look something like:

```tsx
const MyNativeComponent = requireNativeComponent('MyNativeComponent');

export const MyComponent = props => {
  const propsInner = doSomeStuff(props);
  return <MyNativeComponent {...propsInner} />;
};
```

The issue here is that the call to `requireNativeComponent` happens when the module is loaded, not when the component is used. This can result in unnecessary overhead as well as causing issues if the native code isn't present.

### Multiple instances

For larger projects where different components may be imported directly, it can be easy to end up with slightly different versions of the code present. While this is a performance issue, and can cause subtle behavioral issues if globals are used, in the case of native components this can cause multiple calls to register the same native component. This will cause the view manager to be registered twice resulting in runtime issues.

## Usage

### `queryNativeComponent`

This API is simply a drop-in replacement for `requireNativeComponent` except that it is safe to call multiple times.

### `NativeComponent`

This is a functional component wrapper that wraps a call to `queryNativeComponent` internally. As a result, the following:

```tsx
const MyNativeComponent = NativeComponent('MyNativeComponent');

export const MyComponent = props => {
  const propsInner = doSomeStuff(props);
  return <MyNativeComponent {...propsInner} />;
};
```

will delay requiring the native component until the first render.

This will create a wrapped component which will add a small bit of inefficiency so the component also has an attached function called `_bind` which will create the actual `HostComponent` returned from `requireNativeComponent`.

```tsx
const MyWrappedNativeComponent = NativeComponent(`RCTSomething`);
const RawNativeComponent = MyWrappedNativeComponent._bind();
```

### lateBindComponent

This routine accepts a component, and if it is a wrapped `NativeComponent` with a `_bind` routine will replace with a bound element, otherwise it will return itself.
