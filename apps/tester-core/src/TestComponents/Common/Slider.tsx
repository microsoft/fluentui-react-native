import * as React from 'react';
import type { ViewProps, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Separator, Pressable } from '@fluentui/react-native';
import type { IPressableState } from '@fluentui-react-native/interactive-hooks';

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
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    minWidth: thumbSize * 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'stretch',
    height: thumbSize,
    width: 200,
  },
  track: {
    flexGrow: 1,
  },
  thumb: {
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbSize,
    borderWidth: 2,
    borderColor: '#7A7574',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  label: {
    margin: 8,
    fontSize: 12,
  },
});

const Track = Separator.customize({ separatorWidth: 4 });

function onThumbRenderStyle(state: IPressableState, thumbLocation: number): ViewStyle {
  return {
    ...styles.thumb,
    borderColor: state.pressed ? 'black' : state.hovered ? 'red' : '#7A7574',
    marginLeft: thumbLocation,
  };
}

function calculateThumbLocationAndValue(
  startTouchThumbLocation: number,
  startTouchPosition: number,
  currentTouchPosition: number,
  trackLength: number,
  minimum: number,
  maximum: number,
): [number, number] {
  let newThumbLocation = startTouchThumbLocation + currentTouchPosition - startTouchPosition;
  newThumbLocation = Math.max(0, newThumbLocation);
  newThumbLocation = Math.min(newThumbLocation, trackLength);

  const newValue = minimum + (newThumbLocation / trackLength) * (maximum - minimum);
  const intValue = Math.min(maximum, Math.floor(newValue + 0.3)); // snap to nearest integer value
  newThumbLocation = (trackLength * (intValue - minimum)) / (maximum - minimum);

  return [newThumbLocation, intValue];
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
  const sliderValue = React.useRef<number>(initialValue);

  const ref = React.useRef<View>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.measure((_x, _y, width) => {
        if (width <= 0) {
          return;
        }

        // track length is the entire view width subtracted by the thumb size.
        trackLength.current = Math.max(0, width - thumbSize);

        const initialThumbLocation = (trackLength.current * (initialValue! - minimum!)) / (maximum! - minimum!);
        setThumbLocation(initialThumbLocation);
      });
    }
  }, [ref, initialValue, maximum, minimum]);

  return (
    <View style={[userStyle, styles.root]}>
      <View ref={ref} {...props} style={styles.slider}>
        <Track style={styles.track} />
        {trackLength.current > 0 && (
          <Pressable
            renderStyle={(state) => onThumbRenderStyle(state, thumbLocation)}
            onStartShouldSetResponder={() => trackLength.current > 0}
            onResponderStart={(e) => {
              startTouchPosition.current = e.nativeEvent.pageX;
              startTouchThumbLocation.current = thumbLocation;
            }}
            onResponderMove={(e) => {
              if (startTouchPosition.current !== -1 && trackLength.current > 0) {
                const [newThumbLocation, newValue] = calculateThumbLocationAndValue(
                  startTouchThumbLocation.current,
                  startTouchPosition.current,
                  e.nativeEvent.pageX,
                  trackLength.current,
                  minimum || defaultMinimumValue,
                  maximum || defaultMaximumValue,
                );

                sliderValue.current = newValue;
                setThumbLocation(newThumbLocation);
              }
            }}
            onResponderEnd={() => {
              startTouchPosition.current = -1;
              startTouchThumbLocation.current = -1;
            }}
            onResponderRelease={() => {
              if (onChange) {
                onChange(sliderValue.current);
              }
            }}
          />
        )}
      </View>

      <Text style={styles.label}>{sliderValue.current}</Text>
    </View>
  );
};
