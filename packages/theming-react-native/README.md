# Theming React Native

This package serves as an entry point which aggregates and re-exports some of the various features in this repo for those who want to quickly get started.

## Getting Started

### Update package.json & install dependencies

You may want a few different packages from this repo. Let's start with the following:

- `@uifabricshared/theming-react-native`
- `@uifabricshared/themed-stylesheets` for styling react-native's primitives components.

E.g. In your package.json file:

```json
{
  "name": "my-app",
  "version": "0.10.17",
  "description": "An app with lots of cool features",
  "main": "lib/index.js",
  "dependencies": {
    "@uifabricshared/theming-react-native": "0.2.0",
    "@uifabricshared/themed-stylesheet": "0.2.0"
  }
}
```

And then run `yarn`, `npm install`, `rush install`, or an equivalent command to update your node_modules.

### Add a ThemeProvider & ThemeRegistry to the root of your tree

All consumers of these theming packages will want a ThemeProvider somewhere in their UI tree.

The ThemeProvider has two primary roles:

- Supplying the Theme [react context](https://reactjs.org/docs/context.html)
- Supplying the [ThemeRegistry](../theme-registry/README.md) context, if needed.

To access the Theme context, you simply need to import & use the Theme hook, for example:

```tsx
// MyComponent.tsx

import * as React from 'react';
import { useTheme } from '@uifabricshared/theming-react-native';

export const MyComponent: React.FunctionComponent = (_props: {}) => {
  const theme = useTheme();
  const themeColor = theme.colors.bodyText;
  return <SomeComponent color={themeColor} />;
};
```

While a 'greenfield' app developer might be fine without providing a ThemeRegistry, any 'brownfield' app where there are multiple islands of react-native UI being hosted which use the same JavaScript host instance may want to avoid leaking theme information into the other islands of UX. Creating your own ThemeRegistry and providing this as additional context at the root of your component tree can help you manage this behavior.

```tsx
// App.tsx

import { ThemeProvider, createPlatformThemeRegistry } from '@uifabricshared/theming-react-native';
import { MyAppImpl } from './MyAppImpl';

export const myThemeRegistry = createPlatformThemeRegistry();

export default function App() {
  return (
    <ThemeProvider themeRegistry={myThemeRegistry}>
      <MyAppImpl />
    </ThemeProvider>
  );
}
```

The ThemeRegistry is also responsible for pre-seeding the theme object with platform defaults from the Native Module, listening to the Theming Native Module, and updating dependent themes as parent themes change (such as a platform theme change). You can read more about the [ThemeRegistry here](../theme-registry/README.md).

## Theme-aware Primitives

### Create a Themed Stylesheet

The `themed-stylesheet` package allows you to author View/Text/Image Style objects similar to `StyleSheet.create(...);`. You can learn more at the [themed-stylesheet's README](../themed-stylesheet/README.md)

```tsx
// styles.ts

import { ITheme } from '@uifabricshared/theming-react-native';

export const getThemedStyles = themedStyleSheet((t: ITheme) => {
  return {
    style1: {
      backgroundColor: t.colors.background,
      borderStyle: 'solid',
      borderWidth: 1
    },
    style2: {
      backgroundColor: t.colors.primaryButtonBackground,
      borderStyle: 'solid',
      borderWidth: 1
    }
  };
});
```

### Using the hook with themed stylesheets

```tsx
// MyAppImpl.tsx

import * as React from 'react';
import * as ReactNative from 'react-native';
import { useTheme } from '@uifabricshared/theming-react-native';
import { getThemedStyles } from './styles';

export const ThemedView: React.FunctionComponent<ReactNative.ViewProps> = (p: ReactNative.ViewProps) => {
  const { userStyle, ...rest } = p;
  const theme = useTheme();
  const styles = getThemedStyles(theme);
  return <View styles={[userStyle, styles.style1]} {...rest} />;
};

export const MyAppImpl = () => {
  return (
    <ThemedView>
      <ReactNative.Text>Hello, World!</ReactNative.Text>
    </ThemedView>
  );
};
```
