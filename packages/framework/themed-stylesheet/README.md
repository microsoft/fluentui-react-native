# Themed StyleSheet

A convenience wrapper to create style sheets which depend upon values in a theme, and use them in a manner
where they are built and cached once per theme. This doesn't have a huge amount of code, it is mainly about standardizing the usage patterns.

## Caching Strategy

The style sheets will be cached in the themes themselves under a common symbol key. Each style sheet will have a unique symbol key as part of its closure that keeps the caches distinct.

In the case where no theme is provided they will be cached in a single internal global cache.

## Implementation

This function provides a caching layer around a function that produces a set of named styles from a theme.

```ts
export type INamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function themedStyleSheet<T extends INamedStyles<T>>(
  generator: (theme: object) => INamedStyles<T>
): (theme: object) => INamedStyles<T> {
```

The `INamedStyles` type matches the `NamedStyles` type in the react-native types project for use with `StyleSheet.create`. It is a set of types which extend either `ViewStyle`, `TextStyle`, or `ImageStyle`. Note that this is a mapped type where the type will be inferred from the return value of the function provided to `themedStyleSheet`. The mapping ensures that if your stylesheet has two sheets called sheet1 and sheet2, TypeScript can infer the existence of these entries when using the sheet in code.

Usage of `themedStyleSheet` is designed to be very similar to that of `StyleSheet.create` and replace that usage when style sheets should be theme aware.

So normal style sheet usage would look something like this:

```tsx
const styles = StyleSheet.create({
  style1: {
    backgroundColor: 'blue'
  },
  style2: {
    backgroundColor: 'red'
  }
})

const MyComponent = (props: IMyProps) => {
  return <MyComponent style={styles.style1}>;
}
```

Using a themed style sheet, given a theme type called `ITheme` would look something like this:

```tsx
const getThemedStyles = themedStyleSheet((t: ITheme) => {
  return {
    style1: {
      backgroundColor: t.palette.buttonBackground || 'gray'
    },
    style2: {
      backgroundColor: t.palette.windowBackground || 'white'
    }
  };
});

const MyComponent = (props: IMyProps) => {
  const theme = React.useContext(ThemeContext);
  const styles = getThemedStyles(theme);
  return <MyComponent style={styles.style1}>;
}
```

## Variations

In practice there are a couple of practices that can be adopted when using this routine.

### Strongly typed themes

Note that the theme type is generic for the base implementation, this is to allow the type signature of the style sheet to be easily inferred.

If the theme should be strongly typed a theming system can provide a wrapped implementation with the theme strongly typed. This could optionally include the call to useContext. Including useContext in the implementation is great in the simple case but would either require a different signature or a second useContext call if the theme needs to be used elsewhere.

### Empty themes

It is allowed to have a null or undefined theme, if that happens the stylesheet will be cached at the global level. If it is possible for the theme to be null or undefined in your theming system the functions should be written with that in mind. Using the example above this might look like:

```ts
const getThemedStyles = themedStyleSheet((t: ITheme) => {
  return {
    style1: {
      backgroundColor: (t && t.palette.buttonBackground) || 'gray',
    },
    style2: {
      backgroundColor: (t && t.palette.windowBackground) || 'white',
    },
  };
});
```
