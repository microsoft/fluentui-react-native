# Theming React Native

This package serves as an entry point which aggregates and re-exports some of the various features in this repo for those who want to quickly get started.

## Getting Started

### Update package.json & install dependencies

You may want a few different packages from this repo. Let's start with the following:

- `@uifabricshared/theming-react-native`
- `@fluentui-react-native/themed-stylesheets` for styling react-native's primitives components.

E.g. In your package.json file:

```json
{
  "name": "my-app",
  "version": "0.10.17",
  "description": "An app with lots of cool features",
  "main": "lib/index.js",
  "dependencies": {
    "@uifabricshared/theming-react-native": "^0.2.0",
    "@fluentui-react-native/themed-stylesheet": "^0.2.0"
  }
}
```

And then run `yarn`, `npm install`, `rush install`, or an equivalent command to update your node_modules.

## The ThemeProvider

All consumers of these theming packages will want at least one `ThemeProvider` in their tree. Descendents of a `ThemeProvider` will have access to the current theme object via a [react context](https://reactjs.org/docs/context.html).

| Property | Type                                          | Description                                                                                                                                                                                                                                                                                                                                                                         |
| -------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| theme    | string?                                       | Changes the ThemeContext.Value to the Theme object in the current registry with the given name. If unspecified, or set to '', the default theme will be used.                                                                                                                                                                                                                       |
| registry | [ThemeRegistry?](../theme-registry/README.md) | Changes the theme registry context (which also changes the theme to this registry's default theme if no `theme` prop is provided). The active theme registry will be used for all Theme lookups performed by this and descendant `ThemeProviders`. Most consumers will want at least one `ThemeProvider` near the root of their Component tree that specifies the primary registry. |

### Accessing the ThemeContext

Once you've added a ThemeProvider to your tree, functional component descendents will have access to the Theme context via the useTheme hook. To access the theme from within a functional component, see below:

```tsx
// MyComponent.tsx

import * as React from 'react';
import { useTheme } from '@uifabricshared/theming-react-native';

export const MyComponent: React.FunctionComponent = (_props: {}) => {
  // This hook retrieves the theme from the context set by the nearest parent ThemeProvider
  const theme = useTheme();
  const themeColor = theme.colors.bodyText;
  return <SomeComponent color={themeColor} />;
};
```

If you're writing class components instead of functional components, you'll need use the `ThemeContext.Consumer` directly like so:

```tsx
// OtherComponent.tsx

import * as React from 'react';
import { ThemeContext, ITheme } from '@uifabricshared/theming-react-native';

export class OtherComponent extends React.Component {
  public render(): React.JSX.Element {
    return (
      <ThemeContext.Consumer>
        {(theme: ITheme) => {
          const themeColor = theme.colors.bodyText;
          return <SomeComponent color={themeColor} />;
        }}
      </ThemeContext.Consumer>
    );
  }
}
```

### Using a ThemeRegistry with a ThemeProvider

While a 'greenfield' app developer might be fine without setting a ThemeRegistry with their ThemeProvider, any 'brownfield' app where there are multiple islands of react-native UI being hosted which use the same JavaScript host instance may want to avoid leaking theme information into the other islands of UX. Creating your own ThemeRegistry and providing this as additional context **near the root** of your component tree can help you manage this behavior.

**Note:** Many users will only need a single theme registry. This should be provided to the top ThemeProvider which is above all other ThemeProviders and theme-aware UI. Subsequent ThemeProviders will be used to change the Theme context.

```tsx
// App.tsx

import { ThemeProvider, createPlatformThemeRegistry } from '@uifabricshared/theming-react-native';
import { MyAppImpl } from './MyAppImpl';

export const myThemeRegistry = createPlatformThemeRegistry();

export default function App() {
  return (
    <ThemeProvider registry={myThemeRegistry}>
      <MyAppImpl />
    </ThemeProvider>
  );
}
```

The ThemeRegistry is a crucial piece. It's responsible for

- Initializing theme object with platform defaults from the Native Module
- Listening to the Theming Native Module for changes to the platform theme
- Updating dependent themes as parent themes change (such as a platform theme change)

You can read more about the [ThemeRegistry here](../theme-registry/README.md).

## Theme-aware Primitives

### Create a Themed Stylesheet

The `themed-stylesheet` package allows you to author View/Text/Image Style objects similar to `StyleSheet.create(...);`. You can learn more at the [themed-stylesheet's README](../../framework/themed-stylesheet/README.md)

```tsx
// styles.ts

import { ITheme } from '@uifabricshared/theming-react-native';

export const getThemedStyles = themedStyleSheet((t: ITheme) => {
  return {
    style1: {
      backgroundColor: t.colors.background,
      borderStyle: 'solid',
      borderWidth: 1,
    },
    style2: {
      backgroundColor: t.colors.primaryButtonBackground,
      borderStyle: 'solid',
      borderWidth: 1,
    },
  };
});
```

### Using the hook with themed stylesheets

```tsx
// MyAppImpl.tsx

import * as React from 'react';
import { Text, ViewProps } from 'react-native';
import { useTheme } from '@uifabricshared/theming-react-native';
import { getThemedStyles } from './styles';

export const ThemedView: React.FunctionComponent<ViewProps> = (p: ViewProps) => {
  const { userStyle, ...rest } = p;
  const theme = useTheme();
  const styles = getThemedStyles(theme);
  return <View styles={[userStyle, styles.style1]} {...rest} />;
};

export const MyAppImpl = () => {
  return (
    <ThemedView>
      <Text>Hello, World!</Text>
    </ThemedView>
  );
};
```

## Using different Platform Themes

Certain platforms will have multiple platform theme definitions. If you want the default theme to be initialized with a specific platform theme, or want to use a different platform theme for a portion of your UI, you can get the platform themes through the ThemingModuleHelper.

```tsx
// App.tsx

import { ThemeProvider, createPlatformThemeRegistry, ThemingModuleHelper } from '@uifabricshared/theming-react-native';

// Initializes the Default Theme with the 'TaskPane' platform theme, implicitly pulled from ThemingModuleHelper
export const myThemeRegistry = createPlatformThemeRegistry('TaskPane');
// Get the 'TaskPaneCard' theme from the ThemingModuleHelper
const taskPaneCardTheme = ThemingModuleHelper.createPlatformThemeDefinition('TaskPaneCard');
// Registers it with the name 'PlatformTaskPaneCard'
myThemeRegistry.registerTheme(taskPaneCardTheme, 'PlatformTaskPaneCard');

export default function App() {
  return (
    <ThemeProvider registry={myThemeRegistry}>
      <SomeComponent />
      <ThemeProvider theme="PlatformTaskPaneCard">
        <SomeComponent />
      </ThemeProvider>
    </ThemeProvider>
  );
}
```
