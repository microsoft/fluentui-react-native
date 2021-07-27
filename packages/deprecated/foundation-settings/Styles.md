# Style Handling

Settings structures internally contain entries for style objects. These follow the same pattern as react-native stock controls, allowing objects, and recursive arrays of objects. When settings are merged these require special handling.

## IStyleProp

This is a copy of the StyleProp definition from `react-native`. This is copied primarily in the case where it is used in web code where adding a dependency on the `react-native` package itself is not desireable.

The StyleProp pattern itself is allows a style to be provided as a style or a recursive array of styles. So the following pattern is allowed:

    props = {
      style: [
        { ...style1 },
        [
          { ...style2 },
          { ...style3 },
          [
            { ...style4 }
          ]
        ],
        { ...style5 }
      ]
    }

In this model merging styles can be effectively deferred by the following:

    const styleToMerge = { ...values };
    props.style = [props.style, styleToMerge];

The registered style pattern referenced in the type is still not implemented in react-native, even after being in there with a todo for several years. It is an interesting pattern and the use of an augmented number object might be something to explore.

## flattenStyle

This is a port of the flatten routine from react-native. While this is provided as part of the style sheet implementation, the base function itself is not directly exposed.

This routine simply merges all of the styles together in the order they are found and produces a single flattened and merged style object.

## mergeStyles

This routine is used as the merge handler when merging `IComponentSettings` objects which contain styles. It will merge and flatten the styles together.

This routine has a built-in caching layer that will attempt to ensure that object identity remains consistent. This means that style A + style B, where the references to A and B are the same, will always produce object C, where the reference will also be the same.
