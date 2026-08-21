/** @jsxImportSource @fluentui-react-native/framework-base */
import type { StyleProp, ViewStyle } from 'react-native';

import { CompoundItemLayout } from '../../primitives/compound-item-layout/compound-item-layout';
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import { LayoutStableText } from '../../primitives/layout-stable-text/layout-stable-text';
import { listItemStyles } from './list-item.styles';
import type { ListItemState } from './list-item.types';

/**
 * Render the ListItem component.
 */
export function renderListItem_unstable(state: ListItemState) {
  const ActiveIcon = state.selected && state.selectedIcon ? state.selectedIcon : state.icon;
  const leading = state.avatar ? <state.avatar /> : ActiveIcon ? <ActiveIcon /> : undefined;
  const leadingWrapperStyle: StyleProp<ViewStyle> = [
    listItemStyles.leadingContainer,
    { marginEnd: state.metrics.leadingContentMargin },
    state.secondaryContentPosition === 'under' && ActiveIcon && !state.avatar ? { alignSelf: 'flex-start' as const } : undefined,
  ];

  return (
    <state.root>
      <FocusVisual {...state.focusVisualProps} />
      {state.selectionIndicator && <state.selectionIndicator />}
      <CompoundItemLayout
        contentStyle={state.secondaryContentPosition === 'under' ? { gap: state.metrics.contentGap } : undefined}
        leading={leading}
        leadingStyle={leadingWrapperStyle}
        primary={<LayoutStableText reserve={<state.contentHidden />} visible={<state.content />} />}
        secondary={state.secondaryContent ? <state.secondaryContent /> : undefined}
        secondaryPosition={state.secondaryContentPosition}
        trailing={state.trailing ? <state.trailing /> : undefined}
      />
    </state.root>
  );
}
