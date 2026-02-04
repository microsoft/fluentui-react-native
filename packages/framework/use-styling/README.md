# @fluentui-react-native/use-styling

This package provides a framework for building a hook function which produces opinionated styles, for both simple and higher order components. This is built with the following principles in mind:

- **Theming** - the useStyling hook allows for styles to be built from information contained in a theme object. This package is not opinionated about the shape of the theming system, it is injected when building the hook.
- **Caching** - props and styles should not be calculated more often than necessary. Results will be cached both to improve performance, and to maintain consistent object references for style objects.
- **Reuse** - the system should be designed to ensure caching uses as few keys as necessary and that generated styles be shared as much as is possible. This is important in situations like generating class names for the styles.

An extremely simple example might look like:

```tsx
// create the styling hook which can be used in the component, note that this gets created once and
// should not be done inside the component itself
const useSyling = buildUseStyling(myComponentOptions, themeHelper);

// component implementation, consuming the styling hook
const MyComponent = (props) => {
  // get some default/styled props for the container and content child components
  const { container, content } = useStyling(props);
  // render as normal but mixin those values to pass the props to the sub-components
  const { textValue, ...rest } = props;
  const merged = { ...container, ...rest };
  return (
    <View {...merged}>
      <Text {...content}>{textValue}</Text>
    </View>
  );
};
```

Now this example isn't particularly useful but demonstrates the basic role that the styling hook can play in a HOC.

## Quick Reference

At the core of this system is the idea that: **`Tokens + Theme ==> Styles`**. This can be thought of as:

- Your styles are produced via a recipe, defined as a function in `slotProps`
- The tokens are the ingredients for your recipe
- Some of those tokens come from constants
- Some of those tokens come from the theme
- Some tokens could even come from props but this is not the default and needs to be declared in `tokensThatAreAlsoProps`

The overall signature of the method is as follows:

```ts
const useStyling = buildUseStyling(
  /* options that define the component */
  {
    /* Step 1: Build up a single Tokens object with constants for the component */
    tokens?: [
      /* object */
      { },
      /* theme function */
      (theme: Theme) => ({ /* created object */ }),
      /* name to lookup */
      'NameToLookup'
    ],

    /* Step 2: Potentially apply states (if applicable) to the Tokens */
    states?: ['hovered', 'pressed', 'disabled'],

    /* Step 3: Copy some/none/all props to Tokens */
    tokensThatAreAlsoProps?: 'all' /* all props are tokens */
              | 'none' | undefined /* no props are tokens */
              | ['token1', 'token2'] /* list of tokens which also appear in props */,

    /* Step 4: Create props for child components from Tokens and Theme */
    slotProps?: {
      /* props as a constant object */
      slot1: { },
      /* props as a function of tokens and theme, with smart caching/filtering */
      slot2: buildProps((tokens: Tokens, theme: Theme) => {
        // function to generate props
        return { style: { color: tokens.token1 }}
      }, ['token1'])
      /* props as a custom function of tokens, theme, cache */
      slot3: (tokens: Tokens, theme: Theme, cache: GetMemoValue) => {
        // function to generate props
      }
    }
  },
  /* theme helper plugin, global per theming system */
  {
    /* get the active theme, usually from the context */
    useTheme: () => { return useContext(ThemeProvider) || getDefaultTheme() };

    /* lookup a component in the theme to see if token overrides are available */
    getComponentInfo: (theme: Theme, name: string) => lookupComponentInTheme(theme, name);)
  }
);
```

## Tokens

A token is simply a setting that informs the styling of the component. These can be thought of as an additional set of component props that are automatically built-up by the framework. Typically these are set at component creation time or overriden by a theme but can can come from a variety of sources:

- **Objects** - this is a set of values contained within an object. These values are assumed to be unchanging over the lifetime of the object.
- **Theme Functions** - this allows values to be set in relation to values in a theme. An example would be a color being set to a particular entry in a color palette in the theme.
- **Name Lookup** - this will query the theme for a token object or theme function for this component.

### Example

```ts
/** Tokens interface for this component */
interface Tokens {
  backgroundColor?: ColorValue;
  borderWidth?: number;
  borderRadius?: AnimatableNumericValue | string;
}

/** Build the styling hook */
const useStyling = buildUseStyling({
  tokens: [
    /* fixed object */
    {
      borderWidth: 1,
      borderRadius: 2,
    },
    /* theme function */
    (theme: Theme) => {
      backgroundColor: theme.palette.bodyBackground || 'white';
    },
    /* name lookup */
    'MyComponentName',
  ],
  ...otherSettings,
});
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

### Caching

The only variable input to this entire process is the theme. As a result the result of all of this will be cached based on:

- useStyling closure, each closure will have its own unique cached values
- theme object reference, stored in a `WeakMap`

As a result this calculation will run one time per theme, per component type.

## States

Some components may have additional states or modes that can be applied to them. As an example a Button component might have a state called hovered or pressed. In this case the Tokens interface should be as follows:

```ts
interface ButtonTokens {
  // base values
  backgroundColor?: ColorValue;
  color?: ColorValue;
  borderColor?: ColorValue;

  // states
  hovered?: ButtonTokens;
  pressed?: ButtonTokens;
}
```

In this case the `states` option should be provided as follows:

```ts
const useStyling = buildUseStyling({
  tokens: [
    /* token settings */
  ],
  states: ['hovered', 'pressed'],
  ...otherSettings,
});
```

For each entry in the `states` array, in the order they appear, the following will happen:

- Evaluate whether the state applies. This will be true if props[state] is truthy, or if a passed in closure evaluates as truthy. More about this below.
- If the state is true, and tokens contains a sub-object matching that name, the sub-object will be merged into the parent object.

The generated `useStyling` hook has an optional second parameter which is a function of the form:

```ts
type HasLayer = (state: string) => boolean;
```

This allows states to be set based on states in addition to props. An example might look like:

```tsx
interface ButtonState {
  hovered?: boolean;
  pressed?: boolean;
}

const Button = (props: ButtonProps) => {
  // get some state value that figures out whether the button is pressed and/or hovered
  const buttonState: ButtonState = useButtonState(props);
  // get styling values based on props and the current state
  const { container, icon, label } = useStyling(props, (stateName) => buttonState[stateName]);

  const buttonProps = useButtonMagic(props, container);
  return (
    <View {...buttonProps}>
      <Image {...icon} source={props.iconSrc} />
      <Text {...label}>{props.text}</Text>
    </View>
  );
};
```

## Tokens and Props

The ideal scenario from a caching perspective, is for tokens and props to be completely separate. This keeps variability very low and reduces the need for frequent style recalculations. From the perspective of someone using the components this sharply limits flexibility. As a result it may be useful for some tokens to be surfaced as props on the component.

Because props are not provided to the final stage of the `useStyling` workflow, if any props are also tokens, they need to be declared so that they can override the token values coming from the theme or constants. This is done via the `tokensThatAreAlsoProps` property. This has three behaviors:

| Value                   | Behavior                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `'none'` or `undefined` | No properties are tokens and tokens will be left as is.                                         |
| `'all'`                 | All properties should be considered tokens. This equates to: `tokens = { ...tokens, ...props }` |
| `(keyof Tokens)[]`      | Provides a discrete list of values to copy from props to tokens (if present)                    |

## Slot Props

Part of the challenge of building a higher order component, particularly one that is customizeable, is figuring out how to map a single set of props into a multiple internal components. While it is standard to expose a `style` on the `props` interface of a component, this can only map to one of the internal components.

Customizing HOCs by directly targeting the styles of the sub-components is problematic in that it leaks the implementation details. As a result, it becomes challenging to maintain or update the component long term without breaking customers.

The solution used by the `useStyling` module is to allow focus customization on the various Token values, then have a defined mapping of how those Tokens translate to props for each child component. In the parlance of this library, each child component is referred to as a slot.

Each slot returns its own props object, either directly or via a function.

### Direct Objects

The simplest way to provide props for a slot is by providing an object directly. While limited in applicability, it looks as follows:

```ts
const useStyling = buildUseStyling({
  ...precedingOptions,
  slotProps: {
    slot1: { style: { display: 'flex' } },
  },
});
```

### Functions

The functions are assumed to have the following signature:

```ts
function propBuilder(tokens: Tokens, theme: Theme, cache: GetMemoValue<Props>): Props;
```

While tokens and theme have been discussed at length above, the cache will be a cache instance keyed on:

- The theme
- The tokens coming from the theme
- This slot

If there are no tokens which are also props, i.e. if `tokensProps` is falsy, this is sufficient and the function could be written as:

```ts
const slotFn = (tokens: Tokens, theme: Theme, cache: GetMemoValue<Props>) =>
  cache(
    () => {
      return {
        style: {
          backgroundColor: tokens.backgroundColor,
          // etc.
        },
      };
    },
    [
      /* no keys, just direct cache the function result*/
    ],
  )[0];
```

If some all props are tokens then those keys should be considered in the caching. This would then turn into:

```ts
const slotFn = (tokens: Tokens, theme: Theme, cache: GetMemoValue<Props>) => {
  const { backgroundColor, color, borderRadius } = tokens;
  return cache(
    () => ({
      style: { backgroundColor, color, borderRadius },
    }),
    [backgroundColor, color, borderRadius],
  )[0];
};
```

#### buildProps helper

The library provides a helper called buildProps to make this more ergonomic. It provides an implementation for the full caching function above and would be used as follows:

```ts
const slotFn = buildProps(
  (tokens: Tokens, theme: Theme) => ({
    style: {
      backgroundColor: tokens.backgroundColor,
      color: tokens.color,
      borderRadius: tokens.borderRadius,
    },
  }),
  ['backgroundColor', 'color', 'borderRadius'],
);
```

The primary benefit this function provides is that `buildUseStyling` knows how to refine these lists when constructing the hooks. As a result the caching will adjust automatically based on what is specified in `tokenProps`.
