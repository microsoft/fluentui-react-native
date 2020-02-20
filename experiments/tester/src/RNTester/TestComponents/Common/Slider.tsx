import * as React from 'react';
import { ViewProps, StyleSheet, StyleProp, ViewStyle, UIManager, findNodeHandle } from 'react-native';
import { ViewWin32 } from '@office-iss/react-native-win32';
import { Separator, Pressable, IPressableState } from 'react-native-uifabric';

const thumbSize = 20;
const defaultMaximumValue = 100;
const defaultMinimumValue = 1;

interface ISliderProps extends ViewProps {
  minimum?: number;
  maximum?: number;
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

function calculateNewValue(thumbLocation: number, trackLength: number, minimum: number, maximum: number): [number, number] {
  const newValue = minimum + (thumbLocation / trackLength * (maximum - minimum));
  const intValue = Math.min(maximum, Math.floor(newValue + 0.3));   // snap to nearest integer value
  const newThumbLocation = trackLength * (intValue - minimum) / (maximum - minimum);
  return [intValue, newThumbLocation];
}

function calculateNewThumbLocation(currentThumbLocation: number, startTouchPosition: number, currentTouchPosition: number, trackLength: number): number {
  let newLocation = currentThumbLocation + currentTouchPosition - startTouchPosition;
  newLocation = Math.max(0, newLocation);
  newLocation = Math.min(newLocation, trackLength);
  return newLocation;
}

function verifyProps(initialValue: number, minimum: number, maximum: number) {
  if (minimum >= maximum) {
    throw new Error(`'minimum' must not be greater than or equal 'maximum'.`);
  }

  if (initialValue < minimum) {
    throw new Error(`'initialValue' must not be less than 'minimum'.`);
  }

  if (initialValue > maximum) {
    throw new Error(`'initialValue' must not be greater than 'maximum'.`);
  }
}

export const Slider: React.FunctionComponent<ISliderProps> = (props: ISliderProps) => {
  let { minimum, maximum, initialValue } = props;
  minimum = minimum || defaultMinimumValue;
  maximum = maximum || defaultMaximumValue;
  initialValue = initialValue || minimum;
  verifyProps(initialValue, minimum, maximum);

  const { style: userStyle, onChange } = props;

  const [thumbLocation, setThumbLocation] = React.useState<number>(0);
  
  const startTouchPosition = React.useRef<number>(-1);
  const startTouchThumbLocation = React.useRef<number>(-1);
  const trackLength = React.useRef<number>(-1);

  const ref = React.useRef<ViewWin32>(null);

  React.useEffect(()=> {
    const parent = findNodeHandle(ref.current);
    if (parent) {
      UIManager.measure(parent, (x, y, width) => {
        // the track length is the entire view width subtracted by the thumb size.
        trackLength.current = Math.max(0, width - thumbSize);
        
        const initialThumbLocation = trackLength.current * (initialValue! - minimum!) / (maximum! - minimum!);
        setThumbLocation(initialThumbLocation);
      });
    }
  }, [ref.current, initialValue, maximum, minimum]);

  return (
    <ViewWin32 ref={ref} {...props} style={[userStyle, styles.root]}>
      <Track style={styles.track} />
      <Pressable
        renderStyle={state => onThumbRenderStyle(state, thumbLocation)}
        onStartShouldSetResponder={() => trackLength.current > 0}
        onResponderStart={e => {
          startTouchPosition.current = e.nativeEvent.pageX;
          startTouchThumbLocation.current = thumbLocation;
        }}
        onResponderMove={e => {
          if (startTouchPosition.current !== -1 && trackLength.current > 0) {
            const newThumLocation = calculateNewThumbLocation(startTouchThumbLocation.current, startTouchPosition.current, e.nativeEvent.pageX, trackLength.current);
            setThumbLocation(newThumLocation);
          }
        }}
        onResponderEnd={() => {
          startTouchPosition.current = -1;
          startTouchThumbLocation.current = -1;
        }}
        onResponderRelease={() => {
          if (trackLength.current <= 0) {
            return;
          }
          const [newValue, newThumbLocation] = calculateNewValue(thumbLocation, trackLength.current, minimum || defaultMinimumValue, maximum || defaultMaximumValue);
          setThumbLocation(newThumbLocation);
          if (onChange) {
            onChange(newValue);
          }
        }}
      />
    </ViewWin32>
  );
};