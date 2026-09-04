/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import type { AvatarGroupState } from './avatar-group.types';

export function renderAvatarGroup_unstable(state: AvatarGroupState) {
  const { itemAccessibilityProps, itemOffsetStyle, itemStyle, items, overflow: Overflow, overflowText: OverflowText } = state;

  return (
    <state.root>
      {items.map((item, index) => (
        <View key={item.key} {...itemAccessibilityProps} style={index === 0 ? itemStyle : itemOffsetStyle}>
          {item.node}
        </View>
      ))}
      {Overflow && (
        <View {...itemAccessibilityProps} style={items.length === 0 ? itemStyle : itemOffsetStyle}>
          <Overflow>{OverflowText && <OverflowText />}</Overflow>
        </View>
      )}
    </state.root>
  );
}
