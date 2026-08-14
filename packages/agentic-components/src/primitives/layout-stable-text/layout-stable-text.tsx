/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { TextProps } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import type { LayoutStableTextProps } from './layout-stable-text.types';

export const LayoutStableText = directComponent<LayoutStableTextProps>(({ reserve, style, visible, ...rest }) => {
  const reserveProps: TextProps = {
    ...hiddenFromAccessibilityProps,
    style: [reserve.props.style, styles.reserve],
    testID: undefined,
  };
  const visibleProps: TextProps = {
    style: [visible.props.style, styles.visible],
  };

  return (
    <View {...rest} accessible={false} style={[styles.root, style]}>
      {React.cloneElement(reserve, reserveProps)}
      {React.cloneElement(visible, visibleProps)}
    </View>
  );
});

LayoutStableText.displayName = 'LayoutStableText';

const styles = StyleSheet.create({
  reserve: {
    opacity: 0,
  },
  root: {
    flexShrink: 1,
    minWidth: 0,
    position: 'relative',
  },
  visible: {
    ...StyleSheet.absoluteFillObject,
  },
});
