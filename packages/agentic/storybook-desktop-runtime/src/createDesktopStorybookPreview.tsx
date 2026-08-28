import { StyleSheet, View } from 'react-native';
import type { Preview } from '@storybook/react-native';

import { DesktopStoryRoot } from './DesktopStoryRoot';
import { StorybookThemeProvider } from './StorybookTheme';

export function createDesktopStorybookPreview(): Preview {
  return {
    decorators: [
      (Story, context) => (
        <StorybookThemeProvider>
          <DesktopStoryRoot storyId={context.id}>
            <View style={styles.story}>
              <Story />
            </View>
          </DesktopStoryRoot>
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
