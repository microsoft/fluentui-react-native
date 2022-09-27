import * as React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { RadioGroup, Radio, RadioGroupTokens, RadioTokens } from '@fluentui-react-native/experimental-radio-group';
import { commonTestStyles as commonStyles } from '../Common/styles';

const styles = StyleSheet.create({
  tokensRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tokensColumn: {
    flexDirection: 'column',
    margin: 10,
  },
});

export const CustomizedRadioGroup: React.FunctionComponent = () => {
  const [borderColor, setBorderColor] = React.useState<string>('black');
  const [borderStyle, setBorderStyle] = React.useState<string>('solid');
  const [borderWidth, setBorderWidth] = React.useState<number>(1);
  const [radioBorder, setRadioBorder] = React.useState<string>('transparent');

  const CustomRadioGroup = React.useMemo(() => {
    const tokens: RadioGroupTokens = {
      // insert disabled
      // insert required
    };
    return RadioGroup.customize(tokens);
  }, []);

  const CustomRadio = React.useMemo(() => {
    const tokens: RadioTokens = {
      borderColor,
      borderStyle,
      borderWidth,
      borderRadius,
      variant,
      color,
      radioBorder,
      radioVisibility,
      radioSize,
      radioInnerCircleSize,
      radioBorderWidth,

      disabled: {
        radioBorder,
        color,
        radioVisibility,
      }

      hovered: {
        radioBorder,
        color,
        selected: {
          radioBorder,
          radioFill,
          color,
          radioVisibility,
        }
      }

      pressed: {
        radioBorder,
        color,
        selected: {
          radioBorder,
          radioFill,
          color,
          radioVisibility,
        }
      }

      focused: {
        borderColor,
        selected: {
          radioVisibility,
        }
      }

      selected: {
        radioBorder,
        radioFill,
        color,
        radioVisibility,
        disabled: {
          radioFill,
        }
      }
    };
    return Radio.customize(tokens);
  }, [
borderCplor,
borderStyle,

  ]);

  return (
    <View style={styles.tokensColumn}>
      <View style={styles.tokensRow}>
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
            accessibilityLabel="Track border color"
            style={commonStyles.textBox}
            placeholder="Track border color"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setBorderColor(e.nativeEvent.text);
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
          <TextInput
            accessibilityLabel="Track border width"
            style={commonStyles.textBox}
            placeholder="Track border width"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setBorderWidth(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Track border radius"
            style={commonStyles.textBox}
            placeholder="Track border radius"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setBorderRadius(parseInt(e.nativeEvent.text.toString()));
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
      </View>
      <View style={styles.tokensRow}>
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
            accessibilityLabel="Minimum width"
            style={commonStyles.textBox}
            placeholder="Minimum width"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setMinWidth(parseInt(e.nativeEvent.text));
            }}
          />
          <TextInput
            accessibilityLabel="Minimum height"
            style={commonStyles.textBox}
            placeholder="Minimum height"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setMinHeight(parseInt(e.nativeEvent.text));
            }}
          />
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
      </View>

      <CustomRadioGroup label="Custom RadioGroup" accessibilityLabel="Custom Switch">
        <Radio></Radio>
      </CustomRadioGroup>
    </View>
  );
};
