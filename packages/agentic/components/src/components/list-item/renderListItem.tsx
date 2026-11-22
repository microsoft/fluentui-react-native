/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import { CompoundItemLayout } from '../../primitives/compound-item-layout/compound-item-layout';
import { LayoutStableText } from '../../primitives/layout-stable-text/layout-stable-text';
import type { ListItemState } from './list-item.types';

/**
 * Render the ListItem component.
 */
export function renderListItem_unstable(state: ListItemState) {
  const ActiveIcon = state.selected && state.selectedIcon ? state.selectedIcon : state.icon;
  const leading = state.avatar ? <state.avatar /> : ActiveIcon ? <ActiveIcon /> : undefined;
  const leadingWrapperStyle: StyleProp<ViewStyle> = [
    state.chrome?.leading,
    state.secondaryContentPosition === 'under' && ActiveIcon && !state.avatar ? { alignSelf: 'flex-start' as const } : undefined,
  ];

  return (
    <state.root ref={state.focusTargetRef}>
      {state.FocusRing && <state.FocusRing />}
      {state.selectionMode === 'single' && (
        <View {...hiddenFromAccessibilityProps} testID="list-item-radio-indicator" style={state.chrome?.indicator.style}>
          {state.selected && <View testID="list-item-radio-dot" style={state.chrome?.dot} />}
        </View>
      )}
      {state.selectionMode === 'multiple' && (
        <CheckboxIndicator
          {...hiddenFromAccessibilityProps}
          testID="list-item-checkbox-indicator"
          style={state.chrome?.indicator.style}
          status={state.selected ? 'checked' : 'unchecked'}
          {...state.chrome?.indicator.props}
        />
      )}
      <CompoundItemLayout
        contentStyle={state.chrome?.contentGroup}
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
