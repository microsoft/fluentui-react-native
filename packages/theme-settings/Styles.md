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

## mergeAndFinalizeStyles

This routine is used as the merge handler when merging `IComponentSettings` objects which contain styles. It will merge and flatten the styles together and optionally resolve theme values if a theme and finalizer are passed in.

The flattening is done here so that if and when values are cached they are cached in a form that is ready to apply to the actual components. With caching comes the assumption that work done before the caching happens will happen less frequently than the usage outside.

## Future Explorations

Here are some quick thoughts on future explorations to do here.

- Explore filling in the number & { } pattern in props to create a reference to a common index. This could be used for things like caching repeated merge results. An example would be looking up that merging #1 and #2 should produce #3. If #1 and #2 are encountered again #3 can be used without needing to create a new object.
- The number pattern is interesting for web because of CSS rule creation being expensive. When styles are turned into rules it is important that we create the minimum number of rules. This is really the same optimization as creating the minimum number of objects.
- Look at adding rule creation for web as part of the finalization.
