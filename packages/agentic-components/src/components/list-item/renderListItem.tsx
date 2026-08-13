/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { listItemStyles } from './list-item.styles';
import type { ListItemState } from './list-item.types';

/**
 * Render the ListItem component.
 */
export function renderListItem_unstable(state: ListItemState) {
  const ActiveIcon = state.selected && state.selectedIcon ? state.selectedIcon : state.icon;
  const showLeading = state.avatar || ActiveIcon;
  const leadingWrapperStyle: StyleProp<ViewStyle> = [
    listItemStyles.leadingContainer,
    { marginEnd: state.metrics.leadingContentMargin },
    state.secondaryContentPosition === 'under' && ActiveIcon && !state.avatar ? { alignSelf: 'flex-start' as const } : undefined,
  ];

  return (
    <state.root>
      {state.selectionIndicator && <state.selectionIndicator />}
      {showLeading && (
        <View style={leadingWrapperStyle}>
          {state.avatar && <state.avatar />}
          {!state.avatar && ActiveIcon && <ActiveIcon />}
        </View>
      )}
      <View
        style={[
          {
            alignItems: state.secondaryContentPosition === 'right' ? 'center' : 'flex-start',
            flexDirection: state.secondaryContentPosition === 'right' ? 'row' : 'column',
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
          },
          state.secondaryContentPosition === 'under' ? { gap: state.metrics.contentGap } : undefined,
        ]}
      >
        <View style={[listItemStyles.primaryStack, { flexGrow: 1 }]}>
          <state.contentHidden />
          <state.content />
        </View>
        {state.secondaryContent && <state.secondaryContent />}
      </View>
      {state.trailing && <state.trailing />}
    </state.root>
  );
}
