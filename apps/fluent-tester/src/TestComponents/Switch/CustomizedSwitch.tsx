import * as React from 'react';
import { View, TextInput, Text } from 'react-native';
import { Switch } from '@fluentui-react-native/switch';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const CustomizedSwitch: React.FunctionComponent = () => {
  const [trackColor, setTrackColor] = React.useState<string>('blue');
  const [thumbColorOn, setThumbColorOn] = React.useState<string>('white');
  const [thumbColorOff, setThumbColorOff] = React.useState<string>('grey');
  const [thumbSize, setThumbSize] = React.useState<number>(20);
  const [trackWidth, setTrackWidth] = React.useState<number>(100);
  const [trackHeight, setTrackHeight] = React.useState<number>(30);
  const [focusStrokeColor, setFocusStrokeColor] = React.useState<string>('black');
  const [focusStrokeRadius, setFocusStrokeRadius] = React.useState<number>(4);
  const [focusBorderWidth, setFocusBorderWidth] = React.useState<number>(1);

  const CustomSwitch = React.useMemo(() => {
    const tokens = {
      trackWidth,
      trackHeight,
      thumbSize,
      focusStrokeColor,
      focusStrokeRadius,
      focusBorderWidth,

      toggleOn: {
        thumbColor: thumbColorOn,
        trackColor,
        borderColor: trackColor,

        hovered: {
          borderColor: trackColor,
          trackColor,
          thumbColor: thumbColorOn,
        },

        pressed: {
          borderColor: trackColor,
          trackColor,
          thumbColor: thumbColorOn,
        },
      },

      toggleOff: {
        thumbColor: thumbColorOff,
      },
    };
    return Switch.customize(tokens);
  }, [trackColor, thumbColorOn, thumbColorOff, thumbSize, trackWidth, trackHeight, focusStrokeColor, focusStrokeRadius, focusBorderWidth]);

  return (
    <View>
      <View>
        <Text>Track Tokens</Text>
        <TextInput
          accessibilityLabel="Track Color"
          style={commonStyles.textBox}
          placeholder="Track color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setTrackColor(e.nativeEvent.text);
          }}
        />
        <TextInput
          accessibilityLabel="Track width"
          style={commonStyles.textBox}
          placeholder="Track width"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setTrackWidth(parseInt(e.nativeEvent.text.toString()));
          }}
        />
        <TextInput
          accessibilityLabel="Track height"
          style={commonStyles.textBox}
          placeholder="Track height"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setTrackHeight(parseInt(e.nativeEvent.text.toString()));
          }}
        />
      </View>
      <View>
        <Text>Thumb Tokens</Text>
        <TextInput
          accessibilityLabel="Thumb on color"
          style={commonStyles.textBox}
          placeholder="Thumb on color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setThumbColorOn(e.nativeEvent.text);
          }}
        />
        <TextInput
          accessibilityLabel="Thumb off color"
          style={commonStyles.textBox}
          placeholder="Thumb off color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setThumbColorOff(e.nativeEvent.text);
          }}
        />
        <TextInput
          accessibilityLabel="Thumb size"
          style={commonStyles.textBox}
          placeholder="Thumb size"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setThumbSize(parseInt(e.nativeEvent.text));
          }}
        />
      </View>
      <View>
        <Text>Focus Stroke Tokens</Text>
        <TextInput
          accessibilityLabel="Focus Stroke Color"
          style={commonStyles.textBox}
          placeholder="Focus Stroke Color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setFocusStrokeColor(e.nativeEvent.text);
          }}
        />
        <TextInput
          accessibilityLabel="Focus Stroke Radius"
          style={commonStyles.textBox}
          placeholder="Focus Stroke Radius"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setFocusStrokeRadius(parseInt(e.nativeEvent.text));
          }}
        />
        <TextInput
          accessibilityLabel="Focus Stroke Border Width"
          style={commonStyles.textBox}
          placeholder="Focus Stroke Border Width"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setFocusBorderWidth(parseInt(e.nativeEvent.text));
          }}
        />
      </View>

      <CustomSwitch />
    </View>
  );
};
