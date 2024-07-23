# Usage with component tokens

This page covers how to access color tokens to fill out a component's tokens.

## Building styling out of tokens

Most components in FURN build a component's styling out of the tokens and theme that are fed into the component. The `compose` framework takes in an object with a `tokens` property, which you can use to define how a component's tokens are filled out. The `tokens` property can be assigned to a function which takes a `Theme` object as an argument and returns an object that is the component's `Token` type. Inside the function, you can access the alias function from the theme as you would if you had the theme inside a component's render function.

```tsx
/** @jsxRuntime classic */
/** @jsx withSlots */
import { Theme, TokenSettings, buildProps, compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { fontStyles } from '@fluentui-react-native/tokens';
import { Text } from '@fluentui-react-native/experimental-text';

export const tokens: TokenSettings<TTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.neutralStrokeAccessible,
  } as TTokens);

export const Foo = compose<FooType>({
  displayName: fooName,
  tokens: tokens,
  slots: {
    root: Text,
  },
  slotProps: {
    root: buildProps(
      (tokens: TTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
  },
  useRender: (userProps: TProps, useSlots: UseSlots<TType>) => {
    // Grab the styled slots.
    const Slots = useSlots(userProps);
    // Return the handler to finish render.
    return (final: TProps, ...children: React.ReactNode[]) => {
      const mergedProps = mergeProps(tabsItem.props, final);

      return <Slots.root {...mergedProps}>{children}</Slots.root>;
    };
  },
});

export default Foo;
```

Our [Radio control](../../../../packages/components/RadioGroup/src/Radio/RadioTokens.ts) uses this system to integrate alias tokens.

## Using useTokens hook

If you'd rather not use the entire `compose` framework, you can instead use the `useTokens` hook to build a set of component tokens from a theme to style your component.

```tsx
import { useFluentTheme, buildUseTokens } from '@fluentui-react-native/framework';

const useTokens = buildUseTokens<TTokens, Theme>((theme: Theme) => ({ color: theme.colors.neutralStrokeAccessible }));

export const Component = (props: TProps) => {
  const { style, ...rest } = props;
  const theme = useFluentTheme();
  const [tokens, cache] = useTokens(theme);
  const [tokenStyle] = cache(() => ({ ...tokens }), []);
  const mergedStyles = mergeStyles(tokenStyle, style);

  return (
    <Text {...rest} style={mergedStyles}>
      Hello World!
    </Text>
  );
};
```

This hook is what the `compose` framework uses to create style tokens based on the current theme. You can read more on `useTokens` [here](../../../../packages/framework/use-tokens/README.md).
