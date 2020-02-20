import * as React from 'react';
import { ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ViewWin32 } from '@office-iss/react-native-win32';
import { Separator, Pressable, IPressableState } from 'react-native-uifabric';

interface ISliderProps extends ViewProps {
  vertical?: boolean;
  maximum: number;
  initialValue?: number;
  onChange?: (value: number) => void;
}

const styles = StyleSheet.create({
  root: {
    minWidth: 50,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'stretch',
    height: 20
  },
  track: {
    flexGrow: 1,
    flexShrink: 1
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7A7574',
    backgroundColor: '#FFFFFF',
    position: 'absolute'
  }
});

const Track = Separator.customize({ tokens: { separatorWidth: 4 } });

function onThumbRenderStyle(state: IPressableState, value: number): StyleProp<ViewStyle> {
  const style: ViewStyle = { ...styles.thumb };
  if (state.pressed) {
    style.borderColor = '#000000';
  } else if (state.hovered) {
    style.borderColor = 'red';
  } else {
    style.borderColor = '#7A7574';
  }

  style.marginLeft = value;

  return style;
}

function calculateNewValue(startTouchPosition: number, currentTouchPosition: number): number {
  let value = currentTouchPosition - startTouchPosition;
  value = Math.min(value, 180);
  value = Math.max(value, 0);
  return value;
}

export const Slider: React.FunctionComponent<ISliderProps> = (props: ISliderProps) => {
  const { style: userStyle, initialValue, onChange } = props;

  const [currentValue, setCurrentValue] = React.useState<number>(initialValue || 0);
  const startTouchPosition = React.useRef<number>(-1);

  return (
    <ViewWin32 {...props} style={[userStyle, styles.root]}>
      <Track style={styles.track} />
      <Pressable
        renderStyle={state => onThumbRenderStyle(state, currentValue)}
        onStartShouldSetResponder={() => true}
        onResponderStart={e => {
          startTouchPosition.current = e.nativeEvent.pageX - currentValue;
        }}
        onResponderMove={e => {
          if (startTouchPosition.current !== -1) {
            setCurrentValue(calculateNewValue(startTouchPosition.current, e.nativeEvent.pageX));
          }
        }}
        onResponderEnd={e => {
          if (startTouchPosition.current !== -1) {
            setCurrentValue(calculateNewValue(startTouchPosition.current, e.nativeEvent.pageX));
          }
        }}
        onResponderRelease={() => {
          startTouchPosition.current = -1;
          if (onChange) {
            onChange(currentValue);
          }
        }}
      />
    </ViewWin32>
  );
};
