import * as React from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { Button } from '@fluentui-react-native/components';
import { useTheme } from '@storybook/react-native-theming';

type Win32ResizeHandleProps = {
  canDecrease: boolean;
  canIncrease: boolean;
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  testID: string;
};

export function Win32ResizeHandle({ canDecrease, canIncrease, direction, onResize, testID }: Win32ResizeHandleProps) {
  const theme = useTheme();
  const previousDeltaRef = React.useRef(0);
  const [active, setActive] = React.useState(false);
  const horizontal = direction === 'horizontal';
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          previousDeltaRef.current = 0;
          setActive(true);
        },
        onPanResponderMove: (_, gestureState) => {
          const nextDelta = horizontal ? gestureState.dx : -gestureState.dy;
          onResize(nextDelta - previousDeltaRef.current);
          previousDeltaRef.current = nextDelta;
        },
        onPanResponderRelease: () => setActive(false),
        onPanResponderTerminate: () => setActive(false),
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [horizontal, onResize],
  );

  return (
    <View
      accessibilityLabel={horizontal ? 'Resize story sidebar' : 'Resize addons panel'}
      accessibilityRole="adjustable"
      accessible
      style={[horizontal ? styles.horizontal : styles.vertical, { borderColor: active ? theme.barSelectedColor : theme.appBorderColor }]}
      testID={testID}
    >
      <Button
        accessibilityLabel={horizontal ? 'Decrease story sidebar width' : 'Decrease addons panel height'}
        appearance="subtle"
        content="−"
        disabled={!canDecrease}
        onPress={() => onResize(-32)}
        size="small"
        style={styles.stepButton}
        testID={`${testID}-decrease`}
      />
      <View
        {...panResponder.panHandlers}
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          horizontal ? styles.horizontalDrag : styles.verticalDrag,
          { backgroundColor: active ? theme.barSelectedColor : 'transparent' },
        ]}
        testID={`${testID}-drag`}
      />
      <Button
        accessibilityLabel={horizontal ? 'Increase story sidebar width' : 'Increase addons panel height'}
        appearance="subtle"
        content="+"
        disabled={!canIncrease}
        onPress={() => onResize(32)}
        size="small"
        style={styles.stepButton}
        testID={`${testID}-increase`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  horizontal: {
    alignItems: 'center',
    borderRightWidth: 1,
    flexDirection: 'column',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginEnd: -32,
    width: 38,
  },
  vertical: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 38,
    justifyContent: 'space-between',
    marginBottom: -32,
    width: '100%',
  },
  horizontalDrag: {
    alignSelf: 'stretch',
    flex: 1,
    minHeight: 16,
    width: 6,
  },
  verticalDrag: {
    alignSelf: 'stretch',
    flex: 1,
    minWidth: 16,
  },
  stepButton: {
    minHeight: 24,
    minWidth: 28,
  },
});
