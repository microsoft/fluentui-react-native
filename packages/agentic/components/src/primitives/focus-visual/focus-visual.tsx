/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import type { FocusVisualOptions, FocusVisualProps } from './focus-visual.types';

export function createFocusVisualProps_unstable({
  borderRadius,
  innerColor,
  innerWidth,
  outerColor,
  outerWidth,
  visible,
}: FocusVisualOptions): FocusVisualProps {
  const inner =
    innerColor !== undefined && innerWidth !== undefined
      ? {
          style: {
            borderColor: innerColor,
            borderRadius,
            borderStyle: 'solid',
            borderWidth: innerWidth,
          } satisfies ViewStyle,
        }
      : undefined;

  return {
    inner,
    style: {
      borderColor: outerColor,
      borderRadius,
      borderStyle: 'solid',
      borderWidth: outerWidth,
    },
    visible,
  };
}

export const FocusVisual = directComponent<FocusVisualProps>(({ inner, style, testID = 'focus-visual', visible = false, ...rest }) => {
  return (
    <View
      {...rest}
      {...hiddenFromAccessibilityProps}
      collapsable={false}
      focusable={false}
      pointerEvents="none"
      style={[styles.ring, style, !visible && styles.hidden]}
      testID={testID}
    >
      {inner ? (
        <View
          {...inner}
          {...hiddenFromAccessibilityProps}
          collapsable={false}
          focusable={false}
          pointerEvents="none"
          style={[styles.ring, inner.style]}
          testID={inner.testID ?? `${testID}-inner`}
        />
      ) : null}
    </View>
  );
});

FocusVisual.displayName = 'FocusVisual';

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
  },
});
