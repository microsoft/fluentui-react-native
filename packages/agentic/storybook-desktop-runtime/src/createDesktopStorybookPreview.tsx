import { StyleSheet, View } from 'react-native';
import type { Preview } from '@storybook/react-native';

import { DesktopStoryRoot } from './DesktopStoryRoot';

export function createDesktopStorybookPreview(): Preview {
  return {
    decorators: [
      (Story, context) => (
        <DesktopStoryRoot storyId={context.id}>
          <View style={styles.story}>
            <Story />
          </View>
        </DesktopStoryRoot>
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
