import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { Preview } from '@storybook/react-native';

import { DesktopStoryRoot } from './DesktopStoryRoot';
import { useDesktopStorybookTestID } from './DesktopStorybookConfig';

export function Win32StoryViewport({ children }: { children: ReactNode }) {
  const testID = useDesktopStorybookTestID('story-viewport');
  return (
    <ScrollView contentContainerStyle={styles.story} keyboardShouldPersistTaps="handled" style={styles.viewport} testID={testID}>
      {children}
    </ScrollView>
  );
}

export function createDesktopStorybookPreview(): Preview {
  return {
    decorators: [
      (Story, context) => (
        <DesktopStoryRoot storyId={context.id}>
          <Win32StoryViewport>
            <Story />
          </Win32StoryViewport>
        </DesktopStoryRoot>
      ),
    ],
    parameters: {},
  };
}

const styles = StyleSheet.create({
  story: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  viewport: {
    flex: 1,
  },
});
