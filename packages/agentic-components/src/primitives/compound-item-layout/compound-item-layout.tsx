/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';

import type { CompoundItemLayoutProps } from './compound-item-layout.types';

export const CompoundItemLayout = directComponent<CompoundItemLayoutProps>(
  ({
    contentStyle,
    leading,
    leadingStyle,
    primary,
    primaryStyle,
    secondary,
    secondaryPosition = 'right',
    secondaryStyle,
    style,
    trailing,
    trailingStyle,
    ...rest
  }) => (
    <View {...rest} style={[styles.root, style]}>
      {leading ? <View style={[styles.edge, leadingStyle]}>{leading}</View> : null}
      <View style={[secondaryPosition === 'under' ? styles.contentColumn : styles.contentRow, contentStyle]}>
        <View style={[styles.primary, primaryStyle]}>{primary}</View>
        {secondary ? <View style={[styles.secondary, secondaryStyle]}>{secondary}</View> : null}
      </View>
      {trailing ? <View style={[styles.edge, styles.trailing, trailingStyle]}>{trailing}</View> : null}
    </View>
  ),
);

CompoundItemLayout.displayName = 'CompoundItemLayout';

const styles = StyleSheet.create({
  contentColumn: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  edge: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  primary: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  secondary: {
    flexShrink: 1,
    minWidth: 0,
  },
  trailing: {
    flexDirection: 'row',
  },
});
