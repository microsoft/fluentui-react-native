/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import { CompoundItemLayout } from '../../primitives/compound-item-layout/compound-item-layout';
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import { LayoutStableText } from '../../primitives/layout-stable-text/layout-stable-text';
import { Skeleton } from '../skeleton/skeleton';
import { getListboxItemIconSize, listboxItemStyles } from './listbox-item.styles';
import type { ListboxItemState } from './listbox-item.types';

export function renderListboxItem_unstable(state: ListboxItemState) {
  if (state.variant === 'sectionHeader' && state.loading) {
    return (
      <state.header>
        <View style={listboxItemStyles.loadingRow}>
          <Skeleton
            style={[
              listboxItemStyles.loadingIcon,
              {
                height: getListboxItemIconSize(),
                width: getListboxItemIconSize(),
              },
            ]}
          />
          <Skeleton
            style={[
              listboxItemStyles.loadingLabel,
              {
                height: 24,
                maxWidth: 320,
                width: '100%',
              },
            ]}
          />
        </View>
      </state.header>
    );
  }

  if (state.variant === 'sectionHeader') {
    return (
      <state.header>
        <View style={listboxItemStyles.leading}>{state.content && <state.content />}</View>
      </state.header>
    );
  }

  const ActiveIcon = state.selected ? (state.selectedIcon ?? state.icon) : state.icon;

  return (
    <state.root>
      <FocusVisual {...state.focusVisualProps} />
      <CompoundItemLayout
        contentStyle={state.secondaryContentPosition === 'under' ? listboxItemStyles.contentColumn : listboxItemStyles.contentRow}
        leading={state.avatar ? <state.avatar /> : ActiveIcon ? <ActiveIcon /> : undefined}
        leadingStyle={state.secondaryContentPosition === 'under' ? listboxItemStyles.leadingUnder : undefined}
        primary={
          state.content ? (
            state.contentHidden ? (
              <LayoutStableText reserve={<state.contentHidden />} visible={<state.content />} />
            ) : (
              <state.content />
            )
          ) : null
        }
        secondary={state.secondaryContent ? <state.secondaryContent /> : undefined}
        secondaryPosition={state.secondaryContentPosition}
        style={listboxItemStyles.leading}
        trailing={
          <>
            {state.chevronIndicator && <state.chevronIndicator />}
            {state.checkmarkIndicator && <state.checkmarkIndicator />}
            {state.checkboxIndicator && <state.checkboxIndicator />}
          </>
        }
        trailingStyle={listboxItemStyles.trailing}
      />
    </state.root>
  );
}
