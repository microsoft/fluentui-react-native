import { StyleSheet, View } from 'react-native';
import type { Preview } from '@storybook/react-native';

import { StorybookThemeProvider } from './StorybookTheme';

export function createDesktopStorybookPreview(): Preview {
  return {
    decorators: [
      (Story) => (
        <StorybookThemeProvider>
          <View style={styles.story}>
            <Story />
          </View>
        </StorybookThemeProvider>
      ),
    ],
    parameters: {},
  };
}

const styles = StyleSheet.create({
  story: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});
