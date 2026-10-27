import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@fluentui-react-native/components';
import { useFocusTarget } from '@fluentui-react-native/framework-base';
import { ThemeProvider } from '@storybook/react-native-theming';
import { StorageProvider } from '@storybook/react-native-ui-common';
import type { SBUI } from '@storybook/react-native-ui-common';

import { useDesktopStorybookTestID } from './DesktopStorybookConfig';
import { Win32AddonsPanel } from './Win32AddonsPanel';
import { Win32CalloutPortal } from './Win32CalloutPortal';
import { Win32ResizeHandle } from './Win32ResizeHandle';
import { getStoryAncestorIDs, getStoryBranchIDs, Win32StoryNavigator } from './Win32StoryNavigator';

export const StorybookUIComponent: SBUI = ({ children, setStory, storage, story, storyHash, storyBackgroundColor, theme }) => {
  const storiesAnchorRef = React.useRef<View>(null);
  const addonsAnchorRef = React.useRef<View>(null);
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const [sidebarWidth, setSidebarWidth] = React.useState(280);
  const [navigationQuery, setNavigationQuery] = React.useState('');
  const [navigationExpanded, setNavigationExpanded] = React.useState<Record<string, boolean>>({});
  const [navigationSearchActive, setNavigationSearchActive] = React.useState(false);
  const [focusSelectedStoryID, setFocusSelectedStoryID] = React.useState<string>();
  const [addonsVisible, setAddonsVisible] = React.useState(true);
  const [addonsHeight, setAddonsHeight] = React.useState(280);
  const [storyDrawerOpen, setStoryDrawerOpen] = React.useState(false);
  const [addonsPanelOpen, setAddonsPanelOpen] = React.useState(false);
  const [pendingFocusDestination, setPendingFocusDestination] = React.useState<
    'showSidebar' | 'hideSidebar' | 'showAddons' | 'popoutAddons' | null
  >(null);
  const hideSidebarFocus = useFocusTarget(sidebarVisible);
  const showSidebarFocus = useFocusTarget(!sidebarVisible);
  const showAddonsFocus = useFocusTarget(!addonsVisible);
  const popoutAddonsFocus = useFocusTarget(!sidebarVisible);
  const popoutAddonsFocusTargetRef = popoutAddonsFocus.focusTargetRef;
  const popoutAddonsButtonRef = React.useCallback<React.RefCallback<View>>(
    (instance) => {
      addonsAnchorRef.current = instance;
      const cleanup = popoutAddonsFocusTargetRef(instance);
      if (instance && cleanup) {
        return () => {
          cleanup();
          if (addonsAnchorRef.current === instance) {
            addonsAnchorRef.current = null;
          }
        };
      }
      return undefined;
    },
    [popoutAddonsFocusTargetRef],
  );
  const chromeTestID = useDesktopStorybookTestID('win32-chrome');
  const sidebarTestID = useDesktopStorybookTestID('win32-sidebar');
  const sidebarResizeTestID = useDesktopStorybookTestID('win32-sidebar-resize');
  const toolbarTestID = useDesktopStorybookTestID('win32-desktop-toolbar');
  const showSidebarTestID = useDesktopStorybookTestID('win32-show-sidebar');
  const popoutStoriesTestID = useDesktopStorybookTestID('win32-popout-stories');
  const showAddonsTestID = useDesktopStorybookTestID('win32-show-addons');
  const popoutAddonsTestID = useDesktopStorybookTestID('win32-popout-addons');
  const previewTestID = useDesktopStorybookTestID('win32-preview');
  const addonsResizeTestID = useDesktopStorybookTestID('win32-addons-resize');
  const inlineAddonsTestID = useDesktopStorybookTestID('win32-inline-addons');
  const storyDrawerTestID = useDesktopStorybookTestID('win32-story-drawer');
  const closeStoriesTestID = useDesktopStorybookTestID('win32-close-stories');
  const addonsDrawerTestID = useDesktopStorybookTestID('win32-addons-drawer');
  const hideSidebarTestID = useDesktopStorybookTestID('win32-hide-sidebar');

  const expandStoryAncestors = React.useCallback(
    (storyId: string) => {
      const ancestors = getStoryAncestorIDs(storyHash, storyId);
      if (ancestors.length) {
        setNavigationExpanded((current) => {
          const next = { ...current };
          let changed = false;
          for (const id of ancestors) {
            if (current[id] !== true) {
              next[id] = true;
              changed = true;
            }
          }
          return changed ? next : current;
        });
      }
    },
    [storyHash],
  );
  const selectStory = React.useCallback(
    (storyId: string) => {
      expandStoryAncestors(storyId);
      setStory(storyId);
      setStoryDrawerOpen(false);
      setSidebarVisible(true);
      setNavigationSearchActive(false);
      if (storyDrawerOpen || navigationSearchActive) {
        setFocusSelectedStoryID(storyId);
      }
    },
    [expandStoryAncestors, navigationSearchActive, setStory, storyDrawerOpen],
  );
  const updateExpanded = React.useCallback((id: string, value: boolean) => {
    setNavigationExpanded((current) => (current[id] === value ? current : { ...current, [id]: value }));
  }, []);
  const expandAll = React.useCallback(
    (value: boolean) => {
      setNavigationExpanded((current) => {
        const next = { ...current };
        for (const id of getStoryBranchIDs(storyHash)) {
          next[id] = value;
        }
        return next;
      });
    },
    [storyHash],
  );
  React.useEffect(() => {
    if (story?.id) {
      expandStoryAncestors(story.id);
    }
  }, [expandStoryAncestors, story?.id]);
  const dismissStoryDrawer = React.useCallback(() => {
    setStoryDrawerOpen(false);
  }, []);
  const returnStoryDrawerInline = React.useCallback(() => {
    setStoryDrawerOpen(false);
    setSidebarVisible(true);
    setNavigationSearchActive(false);
    if (story?.id) {
      expandStoryAncestors(story.id);
      setFocusSelectedStoryID(story.id);
    } else {
      setPendingFocusDestination('hideSidebar');
    }
  }, [expandStoryAncestors, story?.id]);
  const closeAddonsDrawer = React.useCallback(() => {
    setAddonsPanelOpen(false);
    setAddonsVisible(true);
    setPendingFocusDestination('popoutAddons');
  }, []);
  const closeInlineAddons = React.useCallback(() => {
    setAddonsVisible(false);
    setPendingFocusDestination(sidebarVisible ? 'hideSidebar' : 'showAddons');
  }, [sidebarVisible]);
  const resizeSidebar = React.useCallback((delta: number) => {
    setSidebarWidth((current) => Math.min(Math.max(current + delta, 200), 480));
  }, []);
  const resizeAddons = React.useCallback((delta: number) => {
    setAddonsHeight((current) => Math.min(Math.max(current + delta, 160), 520));
  }, []);
  const onSelectedStoryFocus = React.useCallback((storyId: string) => {
    setFocusSelectedStoryID((current) => (current === storyId ? undefined : current));
  }, []);
  const onSelectedStoryFocusUnavailable = React.useCallback((storyId: string) => {
    setFocusSelectedStoryID((current) => (current === storyId ? undefined : current));
    setPendingFocusDestination('hideSidebar');
  }, []);
  const hideSidebarTarget = hideSidebarFocus.focusTarget;
  const hideSidebarFocused = hideSidebarFocus.focused;
  const showSidebarTarget = showSidebarFocus.focusTarget;
  const showSidebarFocused = showSidebarFocus.focused;
  const showAddonsTarget = showAddonsFocus.focusTarget;
  const showAddonsFocused = showAddonsFocus.focused;
  const popoutAddonsTarget = popoutAddonsFocus.focusTarget;
  const popoutAddonsFocused = popoutAddonsFocus.focused;

  React.useEffect(() => {
    if (!pendingFocusDestination) {
      return;
    }

    const target =
      pendingFocusDestination === 'showSidebar'
        ? { focusTarget: showSidebarTarget, focused: showSidebarFocused }
        : pendingFocusDestination === 'hideSidebar'
          ? { focusTarget: hideSidebarTarget, focused: hideSidebarFocused }
          : pendingFocusDestination === 'showAddons'
            ? { focusTarget: showAddonsTarget, focused: showAddonsFocused }
            : { focusTarget: popoutAddonsTarget, focused: popoutAddonsFocused };
    if (target.focused) {
      setPendingFocusDestination(null);
      return;
    }
    if (!target.focusTarget.current) {
      return;
    }

    const request = target.focusTarget.requestFocus('restore');
    if (request.status === 'requested') {
      return;
    }
    if (request.status === 'confirmed') {
      setPendingFocusDestination(null);
      return;
    }

    console.warn(`Win32 Storybook chrome could not restore focus to ${pendingFocusDestination}: ${request.status}.`);
    setPendingFocusDestination(null);
  }, [
    hideSidebarTarget,
    hideSidebarFocused,
    pendingFocusDestination,
    popoutAddonsTarget,
    popoutAddonsFocused,
    showAddonsTarget,
    showAddonsFocused,
    showSidebarTarget,
    showSidebarFocused,
  ]);

  return (
    <ThemeProvider theme={theme}>
      <StorageProvider storage={storage}>
        <View style={[styles.root, { backgroundColor: theme.background.app }]} testID={chromeTestID}>
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
                testID={sidebarTestID}
              >
                <View accessibilityLabel="Storybook sidebar" accessible style={styles.sidebarHeader} testID={`${sidebarTestID}-header`}>
                  <Text style={[styles.sidebarTitle, { color: theme.barTextColor }]}>Stories</Text>
                  <Button
                    accessibilityLabel="Hide story sidebar"
                    appearance="subtle"
                    content="Hide"
                    onBlur={hideSidebarFocus.onBlur}
                    onFocus={hideSidebarFocus.onFocus}
                    onPress={() => {
                      setPendingFocusDestination('showSidebar');
                      setSidebarVisible(false);
                    }}
                    ref={hideSidebarFocus.focusTargetRef}
                    style={styles.headerButton}
                    testID={hideSidebarTestID}
                  />
                </View>
                <View style={styles.sidebarContent}>
                  <Win32StoryNavigator
                    expanded={navigationExpanded}
                    index={storyHash}
                    onExpandedChange={updateExpanded}
                    onExpandAll={expandAll}
                    onQueryChange={setNavigationQuery}
                    onSelectedStoryFocus={onSelectedStoryFocus}
                    onSelectedStoryFocusUnavailable={onSelectedStoryFocusUnavailable}
                    onSearchActiveChange={setNavigationSearchActive}
                    onSelectStory={selectStory}
                    query={navigationQuery}
                    searchActive={navigationSearchActive}
                    focusSelectedStoryID={focusSelectedStoryID}
                    selectedStoryId={story?.id}
                    testID={`${sidebarTestID}-navigation`}
                  />
                </View>
              </View>
              <Win32ResizeHandle
                canDecrease={sidebarWidth > 200}
                canIncrease={sidebarWidth < 480}
                direction="horizontal"
                onResize={resizeSidebar}
                testID={sidebarResizeTestID}
              />
            </>
          ) : null}
          <View style={styles.main}>
            {!sidebarVisible ? (
              <View
                style={[styles.toolbar, { backgroundColor: theme.background.content, borderBottomColor: theme.appBorderColor }]}
                testID={toolbarTestID}
              >
                <Button
                  appearance="secondary"
                  content="Show stories"
                  onBlur={showSidebarFocus.onBlur}
                  onFocus={showSidebarFocus.onFocus}
                  onPress={() => {
                    setPendingFocusDestination('hideSidebar');
                    setSidebarVisible(true);
                  }}
                  ref={showSidebarFocus.focusTargetRef}
                  style={[styles.toolbarButton, { backgroundColor: theme.button.background, borderColor: theme.appBorderColor }]}
                  testID={showSidebarTestID}
                />
                <Button
                  appearance="secondary"
                  content="Pop out stories"
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
                  testID={popoutStoriesTestID}
                />
                {!addonsVisible ? (
                  <Button
                    appearance="secondary"
                    content="Show addons"
                    onBlur={showAddonsFocus.onBlur}
                    onFocus={showAddonsFocus.onFocus}
                    onPress={() => {
                      setPendingFocusDestination('popoutAddons');
                      setAddonsVisible(true);
                    }}
                    ref={showAddonsFocus.focusTargetRef}
                    style={[styles.toolbarButton, { backgroundColor: theme.button.background, borderColor: theme.appBorderColor }]}
                    testID={showAddonsTestID}
                  />
                ) : null}
                <Button
                  appearance="secondary"
                  content="Pop out addons"
                  onBlur={popoutAddonsFocus.onBlur}
                  onFocus={popoutAddonsFocus.onFocus}
                  onPress={() => {
                    setAddonsVisible(false);
                    setAddonsPanelOpen(true);
                  }}
                  ref={popoutAddonsButtonRef}
                  style={({ pressed }) => [
                    styles.toolbarButton,
                    {
                      backgroundColor: addonsPanelOpen ? theme.barSelectedColor : theme.button.background,
                      borderColor: theme.appBorderColor,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  testID={popoutAddonsTestID}
                />
                <Text numberOfLines={1} style={[styles.currentStory, { color: theme.textMutedColor }]}>
                  {story ? `${story.title}/${story.name}` : 'No story selected'}
                </Text>
              </View>
            ) : null}
            <View style={[styles.preview, { backgroundColor: storyBackgroundColor ?? theme.background.preview }]} testID={previewTestID}>
              {children}
            </View>
            {addonsVisible ? (
              <>
                <Win32ResizeHandle
                  canDecrease={addonsHeight > 160}
                  canIncrease={addonsHeight < 520}
                  direction="vertical"
                  onResize={resizeAddons}
                  testID={addonsResizeTestID}
                />
                <View
                  style={[
                    styles.addons,
                    {
                      backgroundColor: theme.background.content,
                      height: addonsHeight,
                    },
                  ]}
                  testID={inlineAddonsTestID}
                >
                  <Win32AddonsPanel onClose={closeInlineAddons} parameters={story?.parameters} storyId={story?.id} />
                </View>
              </>
            ) : null}
          </View>
          <Win32CalloutPortal
            accessibilityLabel="Storybook stories"
            directionalHint="bottomLeftEdge"
            height={600}
            onDismiss={dismissStoryDrawer}
            target={storiesAnchorRef}
            testID={storyDrawerTestID}
            visible={storyDrawerOpen}
            width={360}
          >
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.barTextColor }]}>Stories</Text>
              <Button
                accessibilityLabel="Close story drawer"
                appearance="subtle"
                content="Close"
                onPress={returnStoryDrawerInline}
                style={styles.closeButton}
                testID={closeStoriesTestID}
              />
            </View>
            <View style={styles.drawerContent}>
              <Win32StoryNavigator
                expanded={navigationExpanded}
                index={storyHash}
                onExpandedChange={updateExpanded}
                onExpandAll={expandAll}
                onQueryChange={setNavigationQuery}
                onSelectedStoryFocus={onSelectedStoryFocus}
                onSelectedStoryFocusUnavailable={onSelectedStoryFocusUnavailable}
                onSearchActiveChange={setNavigationSearchActive}
                onSelectStory={selectStory}
                query={navigationQuery}
                searchActive={navigationSearchActive}
                focusSelectedStoryID={focusSelectedStoryID}
                selectedStoryId={story?.id}
                testID={`${storyDrawerTestID}-navigation`}
              />
            </View>
          </Win32CalloutPortal>
          <Win32CalloutPortal
            accessibilityLabel="Storybook addons"
            directionalHint="bottomLeftEdge"
            height={480}
            onDismiss={closeAddonsDrawer}
            target={addonsAnchorRef}
            testID={addonsDrawerTestID}
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
