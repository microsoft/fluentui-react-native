/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text } from 'react-native';

import { CompoundItemLayout } from '../../primitives/compound-item-layout/compound-item-layout';
import { LayoutStableText } from '../../primitives/layout-stable-text/layout-stable-text';
import { Skeleton } from '../skeleton/skeleton';
import { getMenuItemContentLayoutStyle, getMenuItemLeadingStyle, getMenuItemTrailingStyle, menuItemStyles } from './menu-item.styles';
import type { MenuItemState } from './menu-item.types';

export function renderMenuItem_unstable(state: MenuItemState) {
  const Leading = state.avatar ?? (state.selected && state.selectedIcon ? state.selectedIcon : state.icon);
  const primary = state.isListItem ? (
    <LayoutStableText
      reserve={<Text style={state.contentReserveStyle}>{state.contentText}</Text>}
      visible={<Text style={state.contentStyle}>{state.contentText}</Text>}
    />
  ) : (
    <Text style={state.contentStyle}>{state.contentText}</Text>
  );
  const secondary = state.hasSecondaryContent ? (
    state.isListItem ? (
      <LayoutStableText
        reserve={<Text style={state.secondaryReserveStyle}>{state.secondaryContentText}</Text>}
        visible={
          <Text numberOfLines={state.secondaryContentPosition === 'right' ? 1 : undefined} style={state.secondaryStyle}>
            {state.secondaryContentText}
          </Text>
        }
      />
    ) : (
      <Text style={state.secondaryStyle}>{state.secondaryContentText}</Text>
    )
  ) : undefined;

  return (
    <state.root>
      {state.loading ? (
        <CompoundItemLayout
          contentStyle={getMenuItemContentLayoutStyle(state)}
          leading={<Skeleton style={menuItemStyles.skeletonIcon} />}
          primary={<Skeleton style={menuItemStyles.skeletonLabel} />}
          secondary={<Skeleton style={menuItemStyles.skeletonSecondary} />}
          secondaryPosition="under"
        />
      ) : (
        <CompoundItemLayout
          contentStyle={getMenuItemContentLayoutStyle(state)}
          leading={Leading ? <Leading /> : undefined}
          leadingStyle={getMenuItemLeadingStyle(state)}
          primary={primary}
          secondary={secondary}
          secondaryPosition={state.secondaryContentPosition}
          trailing={
            <>
              {state.hasChevron && <state.chevron />}
              {state.hasCheckmark && !state.hasMultiselect && <state.checkmark />}
              {state.hasMultiselect && state.multiselectCheckbox && <state.multiselectCheckbox />}
            </>
          }
          trailingStyle={getMenuItemTrailingStyle(state)}
        />
      )}
    </state.root>
  );
}
