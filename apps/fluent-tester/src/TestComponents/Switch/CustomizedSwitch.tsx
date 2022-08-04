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
  const [focusBorderRadius, setFocusBorderRadius] = React.useState<number>(4);
  const [focusBorderWidth, setFocusBorderWidth] = React.useState<number>(1);
  const [thumbRadius, setThumbRadius] = React.useState<number>(20);
  const [padding, setPadding] = React.useState<number>(4);
  const [color, setColor] = React.useState<string>('black');

  const CustomSwitch = React.useMemo(() => {
    const tokens = {
      trackWidth,
      trackHeight,
      thumbSize,
      thumbRadius,
      padding,
      color,

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

        hovered: {
          thumbColor: thumbColorOff,
        },

        pressed: {
          thumbColor: thumbColorOff,
        },
      },

      focused: {
        focusBorderRadius,
        focusStrokeColor,
        focusBorderWidth,
      },
    };
    return Switch.customize(tokens);
  }, [
    trackColor,
    thumbColorOn,
    thumbColorOff,
    thumbSize,
    thumbRadius,
    trackWidth,
    trackHeight,
    focusStrokeColor,
    focusBorderRadius,
    focusBorderWidth,
    padding,
    color,
  ]);

  return (
    <View>
      <View>
        <Text>Track Tokens</Text>
        <TextInput
          accessibilityLabel="Track color"
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
        <TextInput
          accessibilityLabel="Thumb radius"
          style={commonStyles.textBox}
          placeholder="Thumb radius"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setThumbRadius(parseInt(e.nativeEvent.text));
          }}
        />
      </View>
      <View>
        <Text>Focus Stroke Tokens</Text>
        <TextInput
          accessibilityLabel="Focus stroke color"
          style={commonStyles.textBox}
          placeholder="Focus stroke color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setFocusStrokeColor(e.nativeEvent.text);
          }}
        />
        <TextInput
          accessibilityLabel="Focus stroke border radius"
          style={commonStyles.textBox}
          placeholder="Focus stroke border radius"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setFocusBorderRadius(parseInt(e.nativeEvent.text));
          }}
        />
        <TextInput
          accessibilityLabel="Focus stroke border width"
          style={commonStyles.textBox}
          placeholder="Focus stroke border width"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setFocusBorderWidth(parseInt(e.nativeEvent.text));
          }}
        />
      </View>
      <View>
        <Text>Other Tokens</Text>
        <TextInput
          accessibilityLabel="Padding"
          style={commonStyles.textBox}
          placeholder="Padding"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setPadding(parseInt(e.nativeEvent.text));
          }}
        />
        <TextInput
          accessibilityLabel="Text colors"
          style={commonStyles.textBox}
          placeholder="Text colors"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setColor(e.nativeEvent.text);
          }}
        />
      </View>

      <CustomSwitch label="Custom Switch" onText="On" offText="Off" accessibilityLabel="Custom Switch" />
    </View>
  );
};
