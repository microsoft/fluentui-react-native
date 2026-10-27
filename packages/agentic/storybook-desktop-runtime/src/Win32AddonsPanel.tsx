import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Tab, TabList, Text } from '@fluentui-react-native/components';
import { useTheme } from '@storybook/react-native-theming';
import type { Parameters } from 'storybook/internal/csf';
import { Addon_TypesEnum } from 'storybook/internal/types';
import type { Addon_BaseType, Addon_Collection } from 'storybook/internal/types';
import { addons } from 'storybook/manager-api';

import { useDesktopStorybookTestID } from './DesktopStorybookConfig';

type Win32AddonsPanelProps = {
  onClose: () => void;
  parameters?: Parameters;
  storyId?: string;
};

function preferredPanelId(panels: [string, Addon_BaseType][]) {
  return panels.find(([id]) => id.includes('actions'))?.[0] ?? panels[0]?.[0];
}

export function Win32AddonsPanel({ onClose, parameters, storyId }: Win32AddonsPanelProps) {
  const theme = useTheme();
  const panelTestID = useDesktopStorybookTestID('win32-addons-panel');
  const addonTestID = useDesktopStorybookTestID('win32-addon');
  const closeTestID = useDesktopStorybookTestID('win32-close-addons');
  const tabPanelNativeID = `${panelTestID}-tabpanel`;
  const panels = React.useMemo(() => {
    const allPanels: Addon_Collection<Addon_BaseType> = addons.getElements(Addon_TypesEnum.PANEL);
    return Object.entries(allPanels).filter(([, panel]) => !panel.paramKey || !parameters?.[panel.paramKey]?.disable);
  }, [parameters]);
  const [selectedPanelId, setSelectedPanelId] = React.useState(() => preferredPanelId(panels));
  const activePanel = panels.find(([id]) => id === selectedPanelId) ?? panels[0];

  React.useEffect(() => {
    if (!panels.some(([id]) => id === selectedPanelId)) {
      setSelectedPanelId(preferredPanelId(panels));
    }
  }, [panels, selectedPanelId]);

  return (
    <View style={styles.root} testID={panelTestID}>
      <View
        accessibilityLabel="Storybook addons panel"
        accessible
        style={[styles.header, { borderBottomColor: theme.appBorderColor }]}
        testID={`${panelTestID}-header`}
      >
        <ScrollView
          contentContainerStyle={styles.tabsScroller}
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
        >
          <TabList
            onSelectionChange={setSelectedPanelId}
            selectedValue={activePanel?.[0]}
            style={styles.tabs}
            testID={`${panelTestID}-tabs`}
          >
            {panels.map(([id, panel]) => {
              const title = typeof panel.title === 'function' ? panel.title({}) : panel.title;
              return (
                <Tab
                  content={String(title)}
                  controls={tabPanelNativeID}
                  key={id}
                  testID={`${addonTestID}-${id.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
                  value={id}
                />
              );
            })}
          </TabList>
        </ScrollView>
        <Button
          accessibilityLabel="Close addons panel"
          appearance="subtle"
          content="Close"
          onPress={onClose}
          style={styles.closeButton}
          testID={closeTestID}
        />
      </View>
      <ScrollView
        accessibilityLabel="Addon panel content"
        contentContainerStyle={styles.panelContent}
        key={storyId}
        keyboardShouldPersistTaps="handled"
        nativeID={tabPanelNativeID}
      >
        {!storyId ? (
          <Text>No story selected.</Text>
        ) : !activePanel ? (
          <Text>No addons loaded.</Text>
        ) : (
          <PanelRenderer panel={activePanel[1]} />
        )}
      </ScrollView>
    </View>
  );
}

function PanelRenderer({ panel }: { panel: Addon_BaseType }) {
  return panel.render({ active: true });
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 240,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tabsScroller: {
    flexGrow: 1,
  },
  tabs: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexGrow: 1,
  },
  closeButton: {
    marginHorizontal: 8,
  },
  panelContent: {
    flexGrow: 1,
    padding: 12,
  },
});
