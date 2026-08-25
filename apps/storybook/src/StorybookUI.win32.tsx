import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemeProvider } from '@storybook/react-native-theming';
import { StorageProvider } from '@storybook/react-native-ui-common';
import type { SBUI, Selection } from '@storybook/react-native-ui-common';
import { Sidebar } from '@storybook/react-native-ui-lite';

const emptyRefs = {};
const emptyStatus = {};

export const StorybookUIComponent: SBUI = ({ children, setStory, storage, story, storyHash, theme }) => {
  const setSelection = React.useCallback(
    (selection: Selection) => {
      if (selection?.storyId) {
        setStory(selection.storyId);
      }
    },
    [setStory],
  );

  return (
    <ThemeProvider theme={theme}>
      <StorageProvider storage={storage}>
        <View style={styles.root} testID="agentic-storybook-win32-chrome">
          <View
            style={[
              styles.sidebar,
              {
                backgroundColor: theme.background.content,
                borderRightColor: theme.appBorderColor,
              },
            ]}
            testID="agentic-storybook-win32-sidebar"
          >
            <View
              accessibilityLabel="Storybook sidebar"
              accessible
              style={styles.sidebarHeader}
              testID="agentic-storybook-win32-sidebar-header"
            >
              <Text style={[styles.sidebarTitle, { color: theme.barTextColor }]}>Stories</Text>
              {story ? (
                <Text numberOfLines={1} style={[styles.currentStory, { color: theme.textMutedColor }]}>
                  {story.title}/{story.name}
                </Text>
              ) : null}
            </View>
            <View style={styles.sidebarContent}>
              <Sidebar
                index={storyHash}
                indexError={undefined}
                previewInitialized
                refs={emptyRefs}
                setSelection={setSelection}
                status={emptyStatus}
                storyId={story?.id}
              />
            </View>
          </View>
          <View style={styles.preview} testID="agentic-storybook-win32-preview">
            {children}
          </View>
        </View>
      </StorageProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    borderRightWidth: 1,
    width: 280,
  },
  sidebarHeader: {
    gap: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentStory: {
    fontSize: 11,
  },
  sidebarContent: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
});
