# Using Tokens

With the Fluent Design System, we have a set of named design values, that we have agreed to use for our UI. These values include colors, shadows, sizing, typography, stroke width, corner radius, etc. The [fluentui-design-tokens](https://github.com/microsoft/fluentui-design-tokens) repo contains all the token definitions. This page describes how to access these values in the fluentui-react-native repo.

## Global

Our set of global tokens is the complete set of the design values that we agree to use for our UI. Each token has a specific name that is assigned to a certain value. For example, `grey74` is `#bdbdbd`.

These names and values do not change no matter the platform or theme; however, there is an exception: currently brand color definitions differ depending on platform.

In most cases you will not be referring to global tokens directly. The case where you may be referring to global tokens is when you're defining your own alias token, or need to access brand colors.

Global tokens can be imported directly:

`import { globalTokens } from '@fluentui-react-native\theme-tokens'`

The full set of global tokens is here: [android](https://github.com/microsoft/fluentui-design-tokens/blob/main/src/global.android.json) / [ios](https://github.com/microsoft/fluentui-design-tokens/blob/main/src/global.ios.json) / [macOS](https://github.com/microsoft/fluentui-design-tokens/blob/main/src/global.macos.json) / [win32](https://github.com/microsoft/fluentui-design-tokens/blob/main/src/global.win32.json) / [windows](https://github.com/microsoft/fluentui-design-tokens/blob/main/src/global.windows.json)

## Alias

Alias tokens are used to refer to the global tokens that are appropriate based on the current platform or theme. For example for `neutralForeground1`, in a light mode it points to a global token whose value is a light grey, but in a dark mode will change to point to a global token whose value is a dark grey. This allows component builders to point to the same color name and have it change to the correct value without having to know about the underlying theme.

Alias tokens can be accessed from the `Theme` object. So if you have a `Theme` object and want to access the `neutralForeground1` alias token:

```ts
import { useFluentTheme } from '@fluentui-react-native/framework';

const theme = useFluentTheme();
const foreground = theme.colors.neutralForeground1;
```

## Types of tokens

### Color [in progress]

TO DO - recommended usage is through alias tokens rather than global

Special case: if accessing a specific color, you can find it in the `globalTokens.color` property.

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

### Corner Radius

You can find tokens related to corner radius in the `globalTokens.corner` property. Currently the only type of token related to corners is corner radius.

An example of usage is in our Avatar component, where we have the option of both circular and square avatars that use different corner radii.

```ts
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const defaultAvatarTokens: TokenSettings<AvatarTokens, Theme> = (t: Theme) =>
  ({
    ...
    circular: {
      borderRadius: globalTokens.corner.radiusCircular,
    },
    square: {
      borderRadius: globalTokens.corner.radius40,
    },
    size20: {
      square: {
        borderRadius: globalTokens.corner.radius20,
      },
    },
    ...
```

### Font

You can find global tokens related to fonts, including font families, sizes, and weights, in the `globalTokens.font` property.

While you _could_ use these tokens directly in `Text` elements, this is not recommended. Instead, we recommend that you use the `variant` prop or the predefined JSX types as described in the [Typography](#typography) section, as these will pull in all the needed tokens automatically.

### Size

You can find tokens related to size and spacing in the `globalTokens.size` property.

Example usage: in our Menu Item component, we use global size tokens to specific values for padding.

```ts
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  ...
  gap: globalTokens.size40,
  padding: globalTokens.size40,
  paddingHorizontal: globalTokens.size80,
  submenuIndicatorPadding: globalTokens.size20,
  ...
})
```

### Shadow

Shadow tokens are a type of alias token and can be accessed through the theme.

The shadow token is an object describing the two shadows that comprise a single Fluent shadow. In FURN, The recommended usage of the shadow token is with the custom Shadow component - more documentation can be found [here](https://github.com/microsoft/fluentui-react-native/blob/main/packages/experimental/Shadow/SPEC.md)

```ts
import { useFluentTheme } from '@fluentui-react-native/framework';

const theme = useFluentTheme();

<Shadow shadowToken={theme.shadows.shadow8}>
  <Button>Text box with shadow8</Button>
</Shadow>;
```

### Stroke

You can find tokens related to stroke in the `globalTokens.stroke` property. Currently the only type of token related to stroke is stroke width.

An example of usage is in our Avatar component, where we specify different ring thicknesses for different avatar sizes.

```ts
import { globalTokens } from '@fluentui-react-native/theme-tokens';

const strokeSize = {
  small: globalTokens.stroke.width20,
  medium: globalTokens.stroke.width30,
  large: globalTokens.stroke.width40,
};
```

### Typography

In FURN, typography alias tokens can be passed into a `TextV1` element or wrapped using a JSX type. For example:

```tsx
import { Body1, TextV1 } from '@fluentui-react-native/text';

const myText = <TextV1 variant="body1">Here is some body text</TextV1>;
const moreText = <Body1>Here is some more body text</Body1>;
```

The former is better if you want to have more fine control over the appearance of your text, while the latter is better if you're looking for the simplest way to add a pre-styled text component.

Given a `Theme` object named `theme`, you can get the available variants and their tokens by calling `theme.typography.variants`. The different text variants available on each platform can be found in the `Variants.platform.ts` files in `packages/components/text/src`. Note that not all variants are available on every platform, although most of them are.
