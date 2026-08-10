import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { useFluentTheme } from '@fluentui-react-native/framework';
import { Path, Svg } from 'react-native-svg';

import {
  presenceBadgeIconPaths,
  presenceBadgeSizeTokens,
  presenceBadgeStatusLabels,
  resolvePresenceBadgeColor,
  resolvePresenceBadgeIcon,
} from './PresenceBadge.tokens';
import type { PresenceBadgeProps, PresenceBadgeStatus } from './PresenceBadge.types';

export function getPresenceBadgeAccessibilityLabel(status: PresenceBadgeStatus, outOfOffice: boolean): string {
  const statusLabel = presenceBadgeStatusLabels[status];
  return outOfOffice && status !== 'out-of-office' ? `${statusLabel} out of office` : statusLabel;
}

export const PresenceBadge = React.forwardRef<React.ElementRef<typeof View>, PresenceBadgeProps>((props, ref) => {
  const {
    accessibilityLabel,
    accessibilityRole,
    accessible,
    outOfOffice = false,
    size = 'medium',
    status = 'available',
    style,
    testID,
    ...rest
  } = props;
  const theme = useFluentTheme();
  const tokens = presenceBadgeSizeTokens[size];
  const icon = resolvePresenceBadgeIcon(status, outOfOffice);
  const color = resolvePresenceBadgeColor(status, outOfOffice);

  return (
    <View
      {...rest}
      accessibilityLabel={accessibilityLabel ?? getPresenceBadgeAccessibilityLabel(status, outOfOffice)}
      accessibilityRole={accessibilityRole ?? 'image'}
      accessible={accessible ?? true}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.neutralBackground1,
          borderColor: theme.colors.neutralBackground1,
          borderRadius: tokens.size / 2,
          borderWidth: tokens.borderWidth,
          height: tokens.size,
          width: tokens.size,
        },
        style as StyleProp<ViewStyle>,
      ]}
      testID={testID}
    >
      <Svg
        accessible={false}
        height={tokens.size}
        pointerEvents="none"
        style={{ left: -tokens.borderWidth, position: 'absolute', top: -tokens.borderWidth }}
        testID={testID ? `${testID}-icon` : undefined}
        viewBox="0 0 16 16"
        width={tokens.size}
      >
        <Path d={presenceBadgeIconPaths[icon]} fill={color} />
      </Svg>
    </View>
  );
});

PresenceBadge.displayName = 'PresenceBadge';

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
