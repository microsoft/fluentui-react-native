/** @jsxImportSource @fluentui-react-native/framework-base */
import { useLayoutEffect } from 'react';
import { Platform, View } from 'react-native';
import { attachSlotProps, resolveAccessibilityAction, useOptionalSlot } from '@fluentui-react-native/framework-base';
import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Icon } from '../../primitives/icon/icon';
import { renderListItem_unstable } from '../list-item/renderListItem';
import { useListItem_unstable } from '../list-item/useListItem';
import { useListItemStyles_unstable } from '../list-item/useListItemStyles';
import { Text } from '../text/text';
import { readingRow } from './list.styles';
import type { ListEntry, ListState } from './list.types';

type RowProps = { item: ListEntry; state: ListState; position: number };

export function ReadingListEntry({ item, state, position }: RowProps) {
  const presentation = state.renderItem?.(item);
  const support = presentation?.secondaryContent;
  const Leading = useOptionalSlot(Icon, presentation?.icon, {
    defaultProps: { width: 16, height: 16 },
    transform: (props) => ({ ...props, ...hiddenFromAccessibilityProps }),
  });
  const collectionMetadata = { accessibilityPosInSet: position, accessibilitySetSize: state.items.length };
  return (
    <View
      {...collectionMetadata}
      style={[readingRow.root, readingRow[state.itemSize]]}
      role="listitem"
      accessible
      accessibilityLabel={item.label}
      accessibilityHint={support}
      testID={item.testID}
      focusable={false}
    >
      {Leading && <Leading />}
      <View style={readingRow.copy} {...hiddenFromAccessibilityProps}>
        <Text {...hiddenFromAccessibilityProps}>{item.label}</Text>
        {support && <Text {...hiddenFromAccessibilityProps}>{support}</Text>}
      </View>
    </View>
  );
}

export function ManagedListEntry({ item, state, position }: RowProps) {
  const { focus, selectionMode, activate } = state;
  const select = resolveAccessibilityAction('select', Platform.OS, [{ name: 'Select', label: item.label }]);
  const key = item.key;
  const { register, requestFocus } = focus;
  const { focusable, ...focusProps } = focus.getProps(key);
  const optionalMetadata = {
    accessibilityPosInSet: position,
    accessibilitySetSize: state.items.length,
  };
  const presentation = state.renderItem?.(item);
  const row = useListItem_unstable({
    ...presentation,
    ...focusProps,
    ...optionalMetadata,
    content: item.label,
    size: state.itemSize,
    disabled: item.disabled,
    testID: item.testID,
    role: 'listitem',
    accessibilityLabel: item.label,
    accessibilityHint: presentation?.secondaryContent,
    selectionMode,
    selected: state.selected.has(key),
    focusable,
    accessibilityActions: selectionMode === 'none' || item.disabled ? undefined : select.accessibilityActions,
    onAccessibilityAction: (event) => {
      if (event.nativeEvent.actionName === select.name) activate(key, 'select');
    },
    onAccessibilityTap: item.disabled ? undefined : () => activate(key, 'primary'),
    onPress: (event) => {
      const { key: nativeKey, code } = (event?.nativeEvent as FocusKeyboardEvent['nativeEvent']) ?? {};
      if (!focusable && !nativeKey && !code && (Platform.OS === 'windows' || String(Platform.OS) === 'win32')) {
        requestFocus(key, 'pointer');
      }
      activate(key, nativeKey === ' ' || nativeKey === 'Spacebar' || code === 'Space' ? 'space' : 'primary');
    },
  });
  useLayoutEffect(() => register(key, row.focusTarget), [key, register, row.focusTarget]);
  useListItemStyles_unstable(row);
  if (selectionMode === 'none') attachSlotProps(row.root, { accessibilityState: { disabled: !!item.disabled } });
  return renderListItem_unstable(row);
}
