import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';
import { attachSlotProps } from '@fluentui-react-native/framework-base';

import type { FocusVisualsState } from './useFocusVisuals';

const getStyles = themedStyleSheetFactory('FocusRing', ({ tokens }) =>
  StyleSheet.create({
    outer: {
      borderColor: tokens.color.strokeFocusOuter,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thick,
    },
    inner: {
      borderColor: tokens.color.strokeFocusInner,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thin,
    },
  }),
);

/**
 * Applies shared theme defaults without replacing the hook's visibility decision.
 */
export function applyFocusRingStyles(
  FocusRing: FocusVisualsState['FocusRing'],
  theme: ThemeState,
  borderRadius?: ViewStyle['borderRadius'],
): void {
  if (FocusRing) {
    const styles = getStyles(theme);
    const radius = { borderRadius };
    attachSlotProps(FocusRing, {
      style: [styles.outer, radius],
      inner: { style: [styles.inner, radius] },
    });
  }
}
