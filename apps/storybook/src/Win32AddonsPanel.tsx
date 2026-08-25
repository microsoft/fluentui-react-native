import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@storybook/react-native-theming';
import type { Parameters } from 'storybook/internal/csf';
import { Addon_TypesEnum } from 'storybook/internal/types';
import type { Addon_BaseType, Addon_Collection } from 'storybook/internal/types';
import { addons } from 'storybook/manager-api';

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
    <View style={styles.root} testID="agentic-storybook-win32-addons-panel">
      <View
        accessibilityLabel="Storybook addons panel"
        accessible
        style={[styles.header, { borderBottomColor: theme.appBorderColor }]}
        testID="agentic-storybook-win32-addons-panel-header"
      >
        <ScrollView
          contentContainerStyle={styles.tabs}
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
        >
          {panels.map(([id, panel]) => {
            const title = typeof panel.title === 'function' ? panel.title({}) : panel.title;
            const selected = id === activePanel?.[0];

            return (
              <Pressable
                accessibilityLabel={String(title)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={id}
                onPress={() => setSelectedPanelId(id)}
                style={[
                  styles.tab,
                  selected && {
                    borderBottomColor: theme.barSelectedColor,
                    borderBottomWidth: 2,
                  },
                ]}
                testID={`agentic-storybook-win32-addon-${id.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
              >
                <Text style={{ color: selected ? theme.barSelectedColor : theme.color.mediumdark }}>{String(title)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          accessibilityLabel="Close addons panel"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.closeButton}
          testID="agentic-storybook-win32-close-addons"
        >
          <Text style={{ color: theme.color.mediumdark }}>Close</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.panelContent} key={storyId} keyboardShouldPersistTaps="handled">
        {!storyId ? (
          <Text style={{ color: theme.color.mediumdark }}>No story selected.</Text>
        ) : !activePanel ? (
          <Text style={{ color: theme.color.mediumdark }}>No addons loaded.</Text>
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
  tabs: {
    alignItems: 'stretch',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  panelContent: {
    flexGrow: 1,
    padding: 12,
  },
});
