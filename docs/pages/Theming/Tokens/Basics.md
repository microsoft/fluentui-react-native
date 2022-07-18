# Using Tokens

With the Fluent Design System, we have a set of colors that we have agreed to use for our UI.
This page describes how to access these colors.

## Global

Our set of global tokens is the complete set of the colors that we agree to use for our UI. Each color has a specific name that is assigned to a hex value. For example, `grey74` is `#bdbdbd`.
These names and values do not change no matter the platform or theme.\*

In most cases you will not be referring to global tokens directly. The case where you may be referring to global tokens is when you're defining your own alias token, or need to access brand colors.

Global tokens can be imported directly:

`import { globalTokens } from '@fluentui-react-native\theme-tokens'`

If accessing a specific color, you can find it in the `globalTokens.color` property.

An example of usage is in our PersonaCoin, where we use colors for the coin background if an image is not used.

```ts
import { globalTokens } from '@fluentui-react-native/theme-tokens';

const colorTableFluent: { [P in PersonaCoinFluentColor]: string } = {
  cornflower: globalTokens.color.cornflower.primary,
  blue: globalTokens.color.blue.primary,
  royalBlue: globalTokens.color.royalBlue.primary,
  teal: globalTokens.color.teal.primary,
  forest: globalTokens.color.forest.primary,
  ...
};
```

\* An exception is that brand color definitions change depending on platform.

## Alias

Alias tokens are used to refer to the global tokens that are appropriate based on the current platform or theme. For example for `neutralForeground1`, in a light mode it points to a global token whose value is a light grey, but in a dark mode will change to point to a global token whose value is a dark grey. This allows component builders to point to the same color name and have it change to the correct value without having to know about the underlying theme.

Alias tokens can be accessed from the `Theme` object. Alias tokens are defined under the `colors` property on a theme. So if you have a `Theme` object and want to access the `neutralForeground1` alias token:

```ts
import { useFluentTheme } from '@fluentui-react-native/framework';

const theme = useFluentTheme();
const foreground = theme.colors.neutralForeground1;
```
