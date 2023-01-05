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
  // RadioGroup
  const [groupColor, setGroupColor] = React.useState<string>('black');
  const [requiredColor, setRequiredColor] = React.useState<string>('red');
  const [requiredPadding, setRequiredPadding] = React.useState<number>(2);

  // Radio
  const [borderColor, setBorderColor] = React.useState<string>('white');
  const [borderWidth, setBorderWidth] = React.useState<number>(1);
  const [borderRadius, setBorderRadius] = React.useState<number>(1);
  const [radioBorderWidth, setRadioBorderWidth] = React.useState<number>(1);
  const [radioVisibility, setRadioVisibility] = React.useState<number>(1);
  const [radioBorder, setRadioBorder] = React.useState<string>('black');
  const [radioSize, setRadioSize] = React.useState<number>(20);
  const [radioInnerCircleSize, setRadioInnerCircleSize] = React.useState<number>(10);
  const [radioFill, setRadioFill] = React.useState<string>('blue');
  const [color, setColor] = React.useState<string>('black');
  const [marginTop, setMarginTop] = React.useState<number>(6);
  const [marginRight, setMarginRight] = React.useState<number>(6);
  const [marginBottom, setMarginBottom] = React.useState<number>(6);
  const [marginLeft, setMarginLeft] = React.useState<number>(4);
  const [labelMarginTop, setLabelMarginTop] = React.useState<number>(5);
  const [labelMarginRight, setLabelMarginRight] = React.useState<number>(2);
  const [labelMarginLeft, setLabelMarginLeft] = React.useState<number>(0);
  const [subtextMarginTop, setSubtextMarginTop] = React.useState<number>(2);
  const [subtextMarginBottom, setSubtextMarginBottom] = React.useState<number>(2);

  const CustomRadioGroup = React.useMemo(() => {
    const tokens: RadioGroupTokens = {
      color: groupColor,
      requiredColor,
      requiredPadding,
      disabled: {
        color: groupColor,
      },
    };
    return RadioGroup.customize(tokens);
  }, [groupColor, requiredColor, requiredPadding]);

  const CustomRadio = React.useMemo(() => {
    const tokens: RadioTokens = {
      borderColor,
      borderWidth,
      borderRadius,
      radioBorderWidth,
      radioVisibility,
      radioBorder,
      radioSize,
      radioInnerCircleSize,
      color,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      labelMarginTop,
      labelMarginRight,
      labelMarginLeft,
      subtextMarginTop,
      subtextMarginBottom,

      labelPositionBelow: {
        marginLeft: marginLeft,
      },

      disabled: {
        radioBorder,
        color,
        radioVisibility,
      },
      hovered: {
        radioBorder,
        color,
        selected: {
          radioBorder,
          radioFill,
          color,
          radioVisibility,
        },
      },
      pressed: {
        radioBorder,
        color,
        selected: {
          radioBorder,
          radioFill,
          color,
          radioVisibility,
        },
      },
      focused: {
        borderColor,
        selected: {
          radioVisibility,
        },
      },
      selected: {
        radioBorder,
        radioFill,
        color,
        radioVisibility,
        disabled: {
          radioFill,
        },
      },
    };
    return Radio.customize(tokens);
  }, [
    borderColor,
    borderWidth,
    borderRadius,
    radioBorderWidth,
    radioVisibility,
    radioBorder,
    radioSize,
    radioInnerCircleSize,
    radioFill,
    color,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    labelMarginTop,
    labelMarginRight,
    labelMarginLeft,
    subtextMarginTop,
    subtextMarginBottom,
  ]);

  return (
    <View style={styles.tokensColumn}>
      <View style={styles.tokensRow}>
        <View>
          <Text>RadioGroup Tokens</Text>
          <TextInput
            accessibilityLabel="RadioGroup color"
            style={commonStyles.textBox}
            placeholder="color"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setGroupColor(e.nativeEvent.text);
            }}
          />
          <TextInput
            accessibilityLabel="RadioGroup required color"
            style={commonStyles.textBox}
            placeholder="requiredColor"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setRequiredColor(e.nativeEvent.text);
            }}
          />
          <TextInput
            accessibilityLabel="RadioGroup required padding"
            style={commonStyles.textBox}
            placeholder="requiredPadding"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setRequiredPadding(parseInt(e.nativeEvent.text.toString()));
            }}
          />
        </View>
      </View>
      <View style={styles.tokensRow}>
        <View>
          <Text>Radio Border Tokens</Text>
          <TextInput
            accessibilityLabel="Radio border color"
            style={commonStyles.textBox}
            placeholder="borderColor"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setBorderColor(e.nativeEvent.text);
            }}
          />
          <TextInput
            accessibilityLabel="Radio border width"
            style={commonStyles.textBox}
            placeholder="borderWidth"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setBorderWidth(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio border radius"
            style={commonStyles.textBox}
            placeholder="borderRadius"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setBorderRadius(parseInt(e.nativeEvent.text.toString()));
            }}
          />
        </View>
        <View>
          <Text>Radio Button Tokens</Text>
          <TextInput
            accessibilityLabel="Radio button border width"
            style={commonStyles.textBox}
            placeholder="radioBorderWidth"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setRadioBorderWidth(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio button visibility"
            style={commonStyles.textBox}
            placeholder="radioVisibility"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setRadioVisibility(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio button border"
            style={commonStyles.textBox}
            placeholder="radioBorder"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setRadioBorder(e.nativeEvent.text);
            }}
          />
          <TextInput
            accessibilityLabel="Radio button size"
            style={commonStyles.textBox}
            placeholder="radioSize"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setRadioSize(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio button inner circle size"
            style={commonStyles.textBox}
            placeholder="radioInnerCircleSize"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setRadioInnerCircleSize(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio button fill"
            style={commonStyles.textBox}
            placeholder="radioFill"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setRadioFill(e.nativeEvent.text);
            }}
          />
          <TextInput
            accessibilityLabel="Radio button margin top"
            style={commonStyles.textBox}
            placeholder="marginTop"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setMarginTop(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio button margin right"
            style={commonStyles.textBox}
            placeholder="marginRight"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setMarginRight(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio button margin bottom"
            style={commonStyles.textBox}
            placeholder="marginBottom"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setMarginBottom(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio button margin left"
            style={commonStyles.textBox}
            placeholder="marginLeft"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setMarginLeft(parseInt(e.nativeEvent.text.toString()));
            }}
          />
        </View>
        <View>
          <Text>Radio Label Tokens</Text>
          <TextInput
            accessibilityLabel="Radio label color"
            style={commonStyles.textBox}
            placeholder="color"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setColor(e.nativeEvent.text);
            }}
          />
          <TextInput
            accessibilityLabel="Radio label margin top"
            style={commonStyles.textBox}
            placeholder="marginTop"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setLabelMarginTop(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio label margin right"
            style={commonStyles.textBox}
            placeholder="marginRight"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setLabelMarginRight(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio label margin left"
            style={commonStyles.textBox}
            placeholder="marginLeft"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setLabelMarginLeft(parseInt(e.nativeEvent.text.toString()));
            }}
          />
        </View>
        <View>
          <Text>Radio Subtext Tokens</Text>
          <TextInput
            accessibilityLabel="Radio subtext margin top"
            style={commonStyles.textBox}
            placeholder="marginTop"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setSubtextMarginTop(parseInt(e.nativeEvent.text.toString()));
            }}
          />
          <TextInput
            accessibilityLabel="Radio subtext margin bottom"
            style={commonStyles.textBox}
            placeholder="marginBottom"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setSubtextMarginBottom(parseInt(e.nativeEvent.text.toString()));
            }}
          />
        </View>
      </View>

      <CustomRadioGroup required label="Custom RadioGroup" accessibilityLabel="Custom Switch">
        <CustomRadio label="Apple" subtext="Fruit" value="Apple"></CustomRadio>
        <CustomRadio label="Pear" value="Pear"></CustomRadio>
        <CustomRadio label="Banana" value="Banana"></CustomRadio>
        <CustomRadio label="Orange" value="Orange"></CustomRadio>
      </CustomRadioGroup>
    </View>
  );
};
