# Overriding Tokens

This document explains how to override tokens from the Fluent Design System using FURN's Theming system.

## Overriding Global Tokens

When components using tokens were developed, it was assumed that global tokens would not be allowed to change. Because of this, any global tokens that are used directly by components, such as border radius tokens or shared colors, will not have changed reflected within components even if they are overridden in a codebase.

For example, the following will not result in any changes to FURN components:

```ts
import { globalTokens } from '@fluentui-react-native/theme-tokens';

globalTokens.corner.radius.small = 5;
export const updatedGlobalTokens = globalTokens;
```

If you need to update the border radius of a component, you should [override that component's tokens](#overriding-component-tokens).

## Supplementing Global Tokens

Global tokens can be supplemented locally in your code base and used to fill in alias token values. You may, for example, want to introduce your own brand ramp. You can either store your own variables for colors, or add to the globalTokens object and reexport it.

```ts
export pinkBrandPrimary = '#ff5f7b';

OR

import { globalTokens } from '@fluentui-react-native/theme-tokens';

globalTokens.color.pinkBrand.primary = '#ff5f7b';
export const updatedGlobalTokens = globalTokens;
```

You can then use the new global tokens as values for alias tokens.

## Overriding Alias Tokens

Alias tokens are stored on the Theme object, so overriding them uses the same mechanism as described on [this page](../CustomTheme.md).

## Overriding Component Tokens

This can be done by using customize() on a component.
