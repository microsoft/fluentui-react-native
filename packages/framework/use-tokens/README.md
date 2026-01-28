# @fluentui-react-native/use-tokens

This package provides the means to create a hook function to build a set of tokens from a passed in theme as well as a cache object unique to the pairing of the given hook function and theme. These resolved tokens should then be used to build the styles for your component. This way the look and feel of a component can be built up from constants, theme globals, and even component specific overrides.

## Tokens

A token is simply a setting that informs the styling of the component. These can be thought of as an additional set of component props that are automatically built-up by the framework. Typically these are set at component creation time or overriden by a theme but can can come from a variety of sources:

- **Objects** - this is a set of values contained within an object. These values are assumed to be unchanging over the lifetime of the object.
- **Theme Functions** - this allows values to be set in relation to values in a theme. An example would be a color being set to a particular entry in a color palette in the theme.
- **Name Lookup** - this will query the theme for a token object or theme function for this component.

## Examples

At the core of this system is the idea that: **`Tokens + Theme ==> Styles`**. This can be thought of as:

- Your styles are produced via a recipe, ideally memoized via the returned cache or by the use of a `useMemo` hook or its equivalent
- The tokens are the ingredients for your recipe
- Some of those tokens come from constants
- Some of those tokens come from the theme

The overall signature of the method is as follows:

```ts
export type StyledTextTokens = Pick<TextProps[style], 'color', 'fontFamily', 'fontWeight', 'fontSize'>;

const useTokens = buildUseTokens<StyledTextTokens, Theme>(
  /* function for looking up a component in a theme, allows this to be used independently of the shape of the theme */
  getComponentInfoFromTheme,

  /* Start of tokens, these are applied in order */
  /* object, these are effectively constants to be used as defaults */
  { token1: 'foo', token2: 400 },
  /* theme function */
  (theme: Theme) => ({ token3: theme.colors.backgroundColor }),
  /* name to lookup */
  'NameToLookup',
);
```

This `useTokens` hook can then be used to build styles for the component as follows:

```tsx
const StyledText: React.FunctionComponent<TextProps> = (props) => {
  // split the props
  const { style, children, ...rest } = props;

  // left out of the hook to allow theme to be obtained in whatever way is appropriate. Generally from a context.
  const theme = useTheme();

  // get a set of tokens from the theme
  const [tokens, cache] = useTokens(theme);

  // create a style object from the tokens using the cache. Note that if all the tokens are actually directly styles the tokens could be used
  // directly. This is just to illustrate the pattern for a more complex component
  const [tokenStyle] = cache(() => ({ ...tokens }), []);

  // now merge any styles coming from the props in on top as they should override
  const mergedStyles = mergeStyles<TextStyle>(tokenStyle, style);

  // now just render the text element
  return (
    <Text {...rest} style={mergedStyles}>
      {children}
    </Text>
  );
};
```

### Layering

These tokens will be deeply merged in the order they appear in the array.

```js
const mergedTokens = merge(
  ...options.tokens.map(entry => {
    // string gets converted to object or function (or empty object)
    if (typeof entry === 'string') {
      entry = themeHelper.getComponentInfo(entry) || {};
    }
    // return either the function call (which will produce an object) or the object
    return typeof entry === 'function' ? entry(theme) : entry;
  });
);
```
