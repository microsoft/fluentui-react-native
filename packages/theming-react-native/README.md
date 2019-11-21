# Theming React Native

This package serves as an entry point which aggregates and reexports some of the various features in this repo for those who want to quickly get started.

# Getting Started

## How to make primitives theme-aware

### Step One - Update package.json to add new dependencies on this repo's packages

You'll may want a few different packages from this repo. Let's start with the following:

- `@uifabricshared/theming-react-native`
- `@uifabricshared/themed-stylesheets` for styling primitives.

E.g.

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

And then `yarn`, `npm install`, or `rush install` equivalent command to update your node_modules directory

### Step Two - Add a ThemeProvider with a ThemeRegistry to the root of your tree

```typescript
// App.tsx

import { ThemeProvider, createPlatformThemeRegistry } from '@uifabricshared/theming-react-native';

export const myThemeRegistry = createPlatformThemeRegistry();

export default function App() {
    return (
        <ThemeProvider themeRegistry={myThemeRegistry}>
            <MyAppImpl />
        </ThemeProvider>
    );
```

### Step Three - Create a Themed Stylesheet

You can learn more [themed-stylesheet's README](https://github.com/microsoft/ui-fabric-react-native/tree/master/packages/themed-stylesheet)

```typescript
import { ITheme } from '@uifabricshared/theming-react-native';

export const getThemedStyles = themedStyleSheet((t: ITheme) => {
  return {
    style1: {
      backgroundColor: t.colors.background || 'gray'
    },
    style2: {
      backgroundColor: t.palette.primaryButtonBackground || 'white'
    }
  };
});
```

### Step Four - Extract your themed styles using the theme hook

```typescript
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
