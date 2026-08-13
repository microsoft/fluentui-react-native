/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text, View } from 'react-native';

import type { MenuItemState } from './menu-item.types';

const absoluteFill = StyleSheet.absoluteFillObject;

export function renderMenuItem_unstable(state: MenuItemState) {
  const Leading = state.avatar ?? (state.selected && state.selectedIcon ? state.selectedIcon : state.icon);

  return (
    <state.root>
      {!state.loading && Leading && (
        <View style={styles.leading}>
          <Leading />
        </View>
      )}
      {state.loading && !state.isListItem ? (
        <View style={styles.loadingRow}>
          <View style={styles.skeletonIcon} />
          <View style={styles.loadingContent}>
            <View style={styles.skeletonLabel} />
            <View style={styles.skeletonSecondary} />
          </View>
        </View>
      ) : (
        <View style={state.secondaryContentPosition === 'under' ? styles.contentColumn : styles.contentRow}>
          <View style={styles.labelContainer}>
            {state.isListItem && <Text style={[state.contentGhostStyle, styles.ghost]}>{state.contentText}</Text>}
            <Text style={[state.contentStyle, absoluteFill]}>{state.contentText}</Text>
          </View>
          {state.hasSecondaryContent && state.secondaryContentPosition === 'right' && (
            <View style={styles.secondaryContainer}>
              {state.isListItem && <Text style={[state.secondaryGhostStyle, styles.ghost]}>{state.secondaryContentText}</Text>}
              <Text numberOfLines={1} style={[state.secondaryStyle, absoluteFill]}>
                {state.secondaryContentText}
              </Text>
            </View>
          )}
          {state.hasSecondaryContent && state.secondaryContentPosition === 'under' && (
            <View style={styles.secondaryContainer}>
              {state.isListItem && <Text style={[state.secondaryGhostStyle, styles.ghost]}>{state.secondaryContentText}</Text>}
              <Text style={[state.secondaryStyle, absoluteFill]}>{state.secondaryContentText}</Text>
            </View>
          )}
        </View>
      )}
      {!state.loading && (
        <View style={styles.trailing}>
          {state.hasChevron && <state.chevron />}
          {state.hasCheckmark && !state.hasMultiselect && <state.checkmark />}
          {state.hasMultiselect && state.multiselectCheckbox && (
            <state.multiselectCheckbox>
              <state.checkmark />
            </state.multiselectCheckbox>
          )}
        </View>
      )}
    </state.root>
  );
}

const styles = StyleSheet.create({
  contentColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  contentRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  leading: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  ghost: {
    position: 'relative',
  },
  labelContainer: {
    flexShrink: 1,
    minWidth: 0,
    position: 'relative',
  },
  loadingContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  loadingRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  secondaryContainer: {
    flexShrink: 1,
    minWidth: 0,
    position: 'relative',
  },
  skeletonIcon: {
    borderRadius: 4,
    height: 20,
    width: 20,
  },
  skeletonLabel: {
    borderRadius: 4,
    height: 24,
    width: 320,
  },
  skeletonSecondary: {
    borderRadius: 4,
    height: 20,
    width: 96,
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
