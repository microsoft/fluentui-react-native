import * as React from 'react';
import { View, Text, Switch, TextInput } from 'react-native';

import { Persona } from '@fluentui/react-native';
import type { Theme } from '@fluentui-react-native/theme-types';
import { useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';

import { michaelImageUrl } from './styles';
import { Slider } from '../Common/Slider';
import { commonTestStyles as commonStyles } from '../Common/styles';

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return { textbox: { ...commonStyles.textBox, borderColor: t.colors.inputBorder } };
});

export const CustomizeUsage: React.FunctionComponent = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [coinColor, setCoinColor] = React.useState<string>();
  const [textColor, setTextColor] = React.useState<string>();

  const [textSize, setTextSize] = React.useState<number>(23);
  const [secondarySize, setSecondarySize] = React.useState<number>(20);
  const [tertiarySize, setTertiarySize] = React.useState<number>(17);
  const [optionalSize, setOptionalSize] = React.useState<number>(14);

  const [horizontalGap, setHorizontalGap] = React.useState<number>();
  const [verticalGap, setVerticalGap] = React.useState<number>();

  const theme = useTheme();
  const textBoxBorderStyle = getThemedStyles(theme);

  const CustomizedPersona = React.useMemo(() => {
    const tokens = {
      backgroundColor: coinColor,
      color: textColor,
      textFont: { fontSize: textSize },
      secondaryFont: { fontSize: secondarySize },
      tertiaryFont: { fontSize: tertiarySize },
      optionalFont: { fontSize: optionalSize },
      horizontalGap: horizontalGap,
      verticalGap: verticalGap,
    };
    return Persona.customize({ tokens });
  }, [coinColor, textColor, textSize, secondarySize, tertiarySize, optionalSize, horizontalGap, verticalGap]);

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <View style={commonStyles.switch}>
          <Text>Show image</Text>
          <Switch value={showImage} onValueChange={setShowImage} />
        </View>

        <TextInput
          accessibilityLabel="Background color"
          style={textBoxBorderStyle.textbox}
          placeholder="Background color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setCoinColor(e.nativeEvent.text);
          }}
        />

        <TextInput
          accessibilityLabel="Initials text color"
          style={textBoxBorderStyle.textbox}
          placeholder="Initials text color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setTextColor(e.nativeEvent.text);
          }}
        />

        <Text>Primary text size</Text>
        <Slider maximum={50} minimum={5} initialValue={textSize} style={commonStyles.vmargin} onChange={setTextSize} />

        <Text>Secondary text size</Text>
        <Slider maximum={50} minimum={5} initialValue={secondarySize} style={commonStyles.vmargin} onChange={setSecondarySize} />

        <Text>Tertiary text size</Text>
        <Slider maximum={50} minimum={5} initialValue={tertiarySize} style={commonStyles.vmargin} onChange={setTertiarySize} />

        <Text>Optional text size</Text>
        <Slider maximum={50} minimum={5} initialValue={optionalSize} style={commonStyles.vmargin} onChange={setOptionalSize} />

        <Text>Horizontal gap</Text>
        <Slider maximum={100} initialValue={5} minimum={0} style={commonStyles.vmargin} onChange={setHorizontalGap} />

        <Text>Vertical gap</Text>
        <Slider maximum={20} initialValue={5} minimum={0} style={commonStyles.vmargin} onChange={setVerticalGap} />
      </View>
      {/* component under test */}
      <CustomizedPersona
        initials="MJ"
        size="size72"
        text="Michael Jackson"
        secondaryText="Pop singer"
        tertiaryText="King of pop"
        optionalText="Indiana"
        imageDescription="Legendary pop singer"
        presence="offline"
        imageUrl={showImage ? michaelImageUrl : undefined}
      />
    </View>
  );
};
