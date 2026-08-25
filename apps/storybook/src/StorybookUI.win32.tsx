import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeProvider } from '@storybook/react-native-theming';
import { StorageProvider } from '@storybook/react-native-ui-common';
import type { SBUI, Selection } from '@storybook/react-native-ui-common';
import { Sidebar } from '@storybook/react-native-ui-lite';

import { Win32AddonsPanel } from './Win32AddonsPanel';
import { Win32CalloutPortal } from './Win32CalloutPortal';
import { Win32ResizeHandle } from './Win32ResizeHandle';

const emptyRefs = {};
const emptyStatus = {};

export const StorybookUIComponent: SBUI = ({ children, setStory, storage, story, storyHash, theme }) => {
  const storiesAnchorRef = React.useRef<View>(null);
  const addonsAnchorRef = React.useRef<View>(null);
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const [sidebarWidth, setSidebarWidth] = React.useState(280);
  const [addonsVisible, setAddonsVisible] = React.useState(true);
  const [addonsHeight, setAddonsHeight] = React.useState(280);
  const [storyDrawerOpen, setStoryDrawerOpen] = React.useState(false);
  const [addonsPanelOpen, setAddonsPanelOpen] = React.useState(false);

  const setSelection = React.useCallback(
    (selection: Selection) => {
      if (selection?.storyId) {
        setStory(selection.storyId);
        setStoryDrawerOpen(false);
        setSidebarVisible(true);
      }
    },
    [setStory],
  );
  const closeStoryDrawer = React.useCallback(() => {
    setStoryDrawerOpen(false);
    setSidebarVisible(true);
  }, []);
  const closeAddonsDrawer = React.useCallback(() => {
    setAddonsPanelOpen(false);
    setAddonsVisible(true);
  }, []);
  const resizeSidebar = React.useCallback((delta: number) => {
    setSidebarWidth((current) => Math.min(Math.max(current + delta, 200), 480));
  }, []);
  const resizeAddons = React.useCallback((delta: number) => {
    setAddonsHeight((current) => Math.min(Math.max(current - delta, 160), 520));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <StorageProvider storage={storage}>
        <View style={styles.root} testID="agentic-storybook-win32-chrome">
          {sidebarVisible ? (
            <>
              <View
                style={[
                  styles.sidebar,
                  {
                    backgroundColor: theme.background.content,
                    borderColor: theme.appBorderColor,
                    width: sidebarWidth,
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
                  <Pressable
                    accessibilityLabel="Hide story sidebar"
                    accessibilityRole="button"
                    onPress={() => setSidebarVisible(false)}
                    style={styles.headerButton}
                    testID="agentic-storybook-win32-hide-sidebar"
                  >
                    <Text style={{ color: theme.color.mediumdark }}>Hide</Text>
                  </Pressable>
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
              <Win32ResizeHandle direction="horizontal" onResize={resizeSidebar} testID="agentic-storybook-win32-sidebar-resize" />
            </>
          ) : null}
          <View style={styles.main}>
            {!sidebarVisible ? (
              <View
                accessibilityLabel="Storybook desktop toolbar"
                accessible
                style={[styles.toolbar, { backgroundColor: theme.background.content, borderBottomColor: theme.appBorderColor }]}
                testID="agentic-storybook-win32-desktop-toolbar"
              >
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSidebarVisible(true)}
                  style={[styles.toolbarButton, { backgroundColor: theme.button.background, borderColor: theme.appBorderColor }]}
                  testID="agentic-storybook-win32-show-sidebar"
                >
                  <Text style={{ color: theme.color.mediumdark }}>Show stories</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setStoryDrawerOpen(true)}
                  ref={storiesAnchorRef}
                  style={({ pressed }) => [
                    styles.toolbarButton,
                    {
                      backgroundColor: storyDrawerOpen ? theme.barSelectedColor : theme.button.background,
                      borderColor: theme.appBorderColor,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  testID="agentic-storybook-win32-popout-stories"
                >
                  <Text style={{ color: storyDrawerOpen ? theme.color.lightest : theme.color.mediumdark }}>Pop out stories</Text>
                </Pressable>
                {!addonsVisible ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setAddonsVisible(true)}
                    style={[styles.toolbarButton, { backgroundColor: theme.button.background, borderColor: theme.appBorderColor }]}
                    testID="agentic-storybook-win32-show-addons"
                  >
                    <Text style={{ color: theme.color.mediumdark }}>Show addons</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setAddonsVisible(false);
                    setAddonsPanelOpen(true);
                  }}
                  ref={addonsAnchorRef}
                  style={({ pressed }) => [
                    styles.toolbarButton,
                    {
                      backgroundColor: addonsPanelOpen ? theme.barSelectedColor : theme.button.background,
                      borderColor: theme.appBorderColor,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  testID="agentic-storybook-win32-popout-addons"
                >
                  <Text style={{ color: addonsPanelOpen ? theme.color.lightest : theme.color.mediumdark }}>Pop out addons</Text>
                </Pressable>
                <Text numberOfLines={1} style={[styles.currentStory, { color: theme.textMutedColor }]}>
                  {story ? `${story.title}/${story.name}` : 'No story selected'}
                </Text>
              </View>
            ) : null}
            <View style={styles.preview} testID="agentic-storybook-win32-preview">
              {children}
            </View>
            {addonsVisible ? (
              <>
                <Win32ResizeHandle direction="vertical" onResize={resizeAddons} testID="agentic-storybook-win32-addons-resize" />
                <View
                  style={[
                    styles.addons,
                    {
                      backgroundColor: theme.background.content,
                      height: addonsHeight,
                    },
                  ]}
                  testID="agentic-storybook-win32-inline-addons"
                >
                  <Win32AddonsPanel onClose={() => setAddonsVisible(false)} parameters={story?.parameters} storyId={story?.id} />
                </View>
              </>
            ) : null}
          </View>
          <Win32CalloutPortal
            accessibilityLabel="Storybook stories"
            directionalHint="bottomLeftEdge"
            height={600}
            onDismiss={closeStoryDrawer}
            target={storiesAnchorRef}
            testID="agentic-storybook-win32-story-drawer"
            visible={storyDrawerOpen}
            width={360}
          >
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.barTextColor }]}>Stories</Text>
              <Pressable
                accessibilityLabel="Close story drawer"
                accessibilityRole="button"
                onPress={closeStoryDrawer}
                style={styles.closeButton}
                testID="agentic-storybook-win32-close-stories"
              >
                <Text style={{ color: theme.color.mediumdark }}>Close</Text>
              </Pressable>
            </View>
            <View style={styles.drawerContent}>
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
          </Win32CalloutPortal>
          <Win32CalloutPortal
            accessibilityLabel="Storybook addons"
            directionalHint="bottomLeftEdge"
            height={480}
            onDismiss={closeAddonsDrawer}
            target={addonsAnchorRef}
            testID="agentic-storybook-win32-addons-drawer"
            visible={addonsPanelOpen}
            width={520}
          >
            <Win32AddonsPanel onClose={closeAddonsDrawer} parameters={story?.parameters} storyId={story?.id} />
          </Win32CalloutPortal>
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
  },
  sidebarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sidebarContent: {
    flex: 1,
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 8,
  },
  main: {
    flex: 1,
  },
  toolbar: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toolbarButton: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: 12,
  },
  currentStory: {
    flex: 1,
    fontSize: 11,
    marginStart: 4,
  },
  addons: {
    minHeight: 160,
  },
  drawerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 8,
  },
  drawerContent: {
    flex: 1,
    minHeight: 420,
  },
  preview: {
    flex: 1,
  },
});
