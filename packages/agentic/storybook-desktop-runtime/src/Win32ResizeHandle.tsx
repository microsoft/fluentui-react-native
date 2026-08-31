import * as React from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { useTheme } from '@storybook/react-native-theming';

type Win32ResizeHandleProps = {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  testID: string;
};

export function Win32ResizeHandle({ direction, onResize, testID }: Win32ResizeHandleProps) {
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
          const nextDelta = horizontal ? gestureState.dx : gestureState.dy;
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
      {...panResponder.panHandlers}
      accessibilityLabel={horizontal ? 'Resize story sidebar' : 'Resize addons panel'}
      accessibilityRole="adjustable"
      accessible
      style={[
        horizontal ? styles.horizontal : styles.vertical,
        {
          backgroundColor: active ? theme.barSelectedColor : 'transparent',
          borderColor: active ? theme.barSelectedColor : theme.appBorderColor,
        },
      ]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    alignSelf: 'stretch',
    borderLeftWidth: 1,
    width: 6,
  },
  vertical: {
    borderTopWidth: 1,
    height: 6,
    width: '100%',
  },
});
