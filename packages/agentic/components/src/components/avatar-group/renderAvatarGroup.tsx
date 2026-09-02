/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { View } from 'react-native';

import type { AvatarGroupState } from './avatar-group.types';

export function renderAvatarGroup_unstable(state: AvatarGroupState) {
  const { itemAccessibilityProps, itemOffsetStyle, itemStyle, overflow: Overflow, overflowText: OverflowText } = state;
  const items = React.Children.toArray(state.children);

  return (
    <state.root>
      {items.map((item, index) => (
        <View
          key={React.isValidElement(item) && item.key !== null ? item.key : index}
          {...itemAccessibilityProps}
          style={index === 0 ? itemStyle : itemOffsetStyle}
        >
          {item}
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
