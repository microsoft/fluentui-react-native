# @fluentui-react-native/merge-props

Utilities for merging styles and props (which contain styles)

## Merging Props

The `mergeProps` routine handles merging props together. Generally this is a standard per property merge identical to the behavior of `Object.assign` with the following two exceptions:

- Objects under `props.style` will be merged using `mergeStyle` above, including caching the resolved styles
- Strings contained in `props.className` will be joined together using spaces as a delimiter.

## Merging Styles

Styles are defined using the standard react-native pattern and will be merged in a way that maintains object identity where possible.

### StyleProp

This is a copy of the StyleProp definition from `react-native`. This is copied primarily in the case where it is used in web code where adding a dependency on the `react-native` package itself is not desireable.

The StyleProp pattern itself is allows a style to be provided as a style or a recursive array of styles. So the following pattern is allowed:

```ts
props = {
  style: [{ ...style1 }, [{ ...style2 }, { ...style3 }, [{ ...style4 }]], { ...style5 }],
};
```

In this model merging styles can be effectively deferred by the following:

```ts
const styleToMerge = { ...values };
props.style = [props.style, styleToMerge];
```

### mergeStyles

This routine merges one or more react-native styles together. The inputs are styles in the `StyleProp` format referenced above. The various input styles will be flattened and merged together to produce a single non-flattened output style.

```ts
function mergeStyles<T>(...styles: StyleProp<T>[]): T;
```

This routine has a built-in caching layer that will attempt to ensure that object identity remains consistent. This means that style A + style B, where the references to A and B are the same, will always produce object C, where the reference will also be the same.
