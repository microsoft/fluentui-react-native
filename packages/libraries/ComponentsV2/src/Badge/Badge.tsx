import * as React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useFluentTheme } from '@fluentui-react-native/framework';

import { badgeSizeTokens, resolveBadgeColorTokens } from './Badge.tokens';
import type { BadgeProps } from './Badge.types';

function renderContent(children: React.ReactNode, color: TextStyle['color'], fontSize: number, lineHeight: number, testID?: string) {
  if (children === undefined || children === null) {
    return null;
  }

  if (typeof children === 'string' || typeof children === 'number') {
    return (
      <Text
        accessible={false}
        numberOfLines={1}
        style={[styles.text, { color, fontSize, height: lineHeight, lineHeight }]}
        testID={testID ? `${testID}-text` : undefined}
      >
        {children}
      </Text>
    );
  }

  return (
    <View accessible={false} style={styles.customContent} testID={testID ? `${testID}-content` : undefined}>
      {children}
    </View>
  );
}

export const Badge = React.forwardRef<React.ElementRef<typeof View>, BadgeProps>((props, ref) => {
  const {
    appearance = 'filled',
    children,
    color = 'brand',
    icon,
    iconPosition = 'before',
    shape = 'circular',
    size = 'medium',
    style,
    testID,
    ...rest
  } = props;
  const theme = useFluentTheme();
  const sizeTokens = badgeSizeTokens[size];
  const colors = resolveBadgeColorTokens(theme, appearance, color);
  const hasContent = React.Children.toArray(children).length > 0;
  const radius = shape === 'circular' ? sizeTokens.height / 2 : shape === 'rounded' ? sizeTokens.roundedRadius : 0;
  const iconElement =
    icon === undefined || icon === null ? null : (
      <View
        accessible={false}
        style={[
          styles.icon,
          {
            height: sizeTokens.iconSize,
            width: sizeTokens.iconSize,
          },
          hasContent && (iconPosition === 'before' ? { marginRight: sizeTokens.textGap } : { marginLeft: sizeTokens.textGap }),
        ]}
        testID={testID ? `${testID}-icon` : undefined}
      >
        {icon}
      </View>
    );
  const content = renderContent(children, colors.foregroundColor, sizeTokens.fontSize, sizeTokens.lineHeight, testID);

  return (
    <View
      {...rest}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderRadius: radius,
          borderWidth: appearance === 'ghost' ? 0 : 1,
          height: sizeTokens.height,
          minWidth: sizeTokens.height,
          paddingHorizontal: sizeTokens.paddingHorizontal,
        },
        style as StyleProp<ViewStyle>,
      ]}
      testID={testID}
    >
      {iconPosition === 'before' ? iconElement : null}
      {content}
      {iconPosition === 'after' ? iconElement : null}
    </View>
  );
});

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  customContent: {
    alignItems: 'center',
    flexShrink: 1,
    justifyContent: 'center',
    maxHeight: '100%',
  },
  icon: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    flexShrink: 1,
    fontFamily: 'Segoe UI',
    fontWeight: '600',
    includeFontPadding: false,
    maxWidth: '100%',
    padding: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
  } satisfies TextStyle,
});
