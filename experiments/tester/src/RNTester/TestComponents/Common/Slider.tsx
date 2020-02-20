import * as React from 'react';
import { ViewProps, StyleSheet, StyleProp, ViewStyle, UIManager, findNodeHandle, View } from 'react-native';
import { ViewWin32 } from '@office-iss/react-native-win32';
import { Separator, Pressable, IPressableState } from 'react-native-uifabric';

const thumbSize = 20;

interface ISliderProps extends ViewProps {
  vertical?: boolean;
  maximum: number;
  initialValue?: number;
  onChange?: (value: number) => void;
}

const styles = StyleSheet.create({
  root: {
    minWidth: thumbSize * 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'stretch',
    height: thumbSize
  },
  track: {
    flexGrow: 1,
    flexShrink: 1
  },
  thumb: {
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbSize,
    borderWidth: 2,
    borderColor: '#7A7574',
    backgroundColor: '#FFFFFF',
    position: 'absolute'
  }
});

const Track = Separator.customize({ tokens: { separatorWidth: 4 } });


function onThumbRenderStyle(state: IPressableState, thumbLocation: number): StyleProp<ViewStyle> {
  return { 
    ...styles.thumb,
    borderColor: state.pressed ? 'black' : (state.hovered ? 'red' : '#7A7574'),
    marginLeft: thumbLocation
  };
}

function calculateNewValue(thumbLocation: number, trackWidth: number, maximum: number): [number, number] {
  const newValue = thumbLocation / trackWidth * maximum;
  const intValue = Math.min(maximum, Math.floor(newValue + 0.3));
  const newThumbLocation = trackWidth * intValue / maximum;
  return [intValue, newThumbLocation];
}

function calculateNewThumbLocation(currentThumbLocation: number, startTouchPosition: number, currentTouchPosition: number, trackWidth: number): number {
  let newLocation = currentThumbLocation + currentTouchPosition - startTouchPosition;
  newLocation = Math.max(0, newLocation);
  newLocation = Math.min(newLocation, trackWidth);
  return newLocation;
}

export const Slider: React.FunctionComponent<ISliderProps> = (props: ISliderProps) => {
  const { style: userStyle, onChange, maximum } = props;

  const [thumbLocation, setThumbLocation] = React.useState<number>(0);
  
  const startTouchPosition = React.useRef<number>(-1);
  const startTouchThumbLocation = React.useRef<number>(-1);
  const trackWidth = React.useRef<number>(-1);

  const ref = React.useRef<ViewWin32>(null);

  return (
    <ViewWin32 ref={ref} {...props} style={[userStyle, styles.root]}>
      <Track style={styles.track} />
      <Pressable
        renderStyle={state => onThumbRenderStyle(state, thumbLocation)}
        onStartShouldSetResponder={() => {
          const parent = findNodeHandle(ref.current);
          if (parent) {
            UIManager.measure(parent, (x, y, width) => {
              trackWidth.current = Math.max(0, width - thumbSize);
            });
            return true;
          } else {
            return false;
          }
        }}
        onResponderStart={e => {
          startTouchPosition.current = e.nativeEvent.pageX;
          startTouchThumbLocation.current = thumbLocation;
        }}
        onResponderMove={e => {
          if (startTouchPosition.current !== -1 && trackWidth.current > 0) {
            const newThumLocation = calculateNewThumbLocation(startTouchThumbLocation.current, startTouchPosition.current, e.nativeEvent.pageX, trackWidth.current);
            setThumbLocation(newThumLocation);
          }
        }}
        onResponderEnd={() => {
          startTouchPosition.current = -1;
          startTouchThumbLocation.current = -1;
        }}
        onResponderRelease={() => {
          if (trackWidth.current <= 0) {
            return;
          }
          const [newValue, newThumbLocation] = calculateNewValue(thumbLocation, trackWidth.current, maximum);
          setThumbLocation(newThumbLocation);
          if (onChange) {
            onChange(newValue);
          }
        }}
      />
    </ViewWin32>
  );
};
