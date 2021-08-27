# Themed `StyleSheets`

Themed `StyleSheets` allow you to create a `StyleSheet` using information from a FURN theme. The resulting objects are memoized onto the `Theme` object itself, so if you access them again they'll be cached if the `Theme` hasn't changed. You can then access styles off the `StyleSheet` as you usually would and pass them into components as the value for a `style` prop.

## Defining a themed `StyleSheet`

Defining a themed `StyleSheet` is similar to creating a RN `StyleSheet`, but it takes in a theme as an arg.

```ts
// Component.styles.ts
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { Theme } from '@fluentui-react-native/framework';

export const getThemedStyles = themedStyleSheet((theme: Theme) => {
  return {
    root: { minHeight: 382, paddingHorizontal: 16 },
    container: { backgroundColor: theme.colors.background },
    list: { flexDirection: 'row' },
    content: { margin: 8 },
  };
});
```

## Using a themed `StyleSheet`

You can use a themed `StyleSheet` as you would an RN `StyleSheet` that's generated via a function:

```ts
// Component.ts
import { getThemedStyles } from './Component.styles.ts';
import { useTheme } from '@fluentui-react-native/framework';

export const Component = () => {
  const styles = getThemedStyles(useTheme());

  return (
    <View style={styles.root}>
      <Text style={styles.content}>Hello World!</Text>
    </View>
  );
};
```

## Additional Reading

For more detailed information, check out [our README](https://github.com/microsoft/fluentui-react-native/blob/master\packages\framework\themed-stylesheet\README.md).
