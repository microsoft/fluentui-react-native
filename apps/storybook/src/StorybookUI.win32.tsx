import * as React from 'react';
import { StyleSheet, View } from 'react-native';

export function StorybookUIComponent({ children }: React.PropsWithChildren) {
  return (
    <View style={styles.root} testID="agentic-storybook-win32-preview">
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
