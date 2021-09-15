import * as React from 'react';
import { View, Text, Switch, TextInput, TextStyle } from 'react-native';
import { IPersonaTokens, Persona } from '@fluentui/react-native';
import { michaelImageUrl } from './styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { Slider } from '../Common/Slider';

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

  const tokens: Partial<IPersonaTokens> = {};
  if (coinColor) {
    tokens.coinBackgroundColor = coinColor;
  }
  if (textColor) {
    tokens.color = textColor;
  }
  if (textSize) {
    tokens.textFont = { fontSize: textSize };
  }
  if (secondarySize) {
    tokens.secondaryFont = { fontSize: secondarySize };
  }
  if (tertiarySize) {
    tokens.tertiaryFont = { fontSize: tertiarySize };
  }
  if (optionalSize) {
    tokens.optionalFont = { fontSize: optionalSize };
  }
  if (horizontalGap !== undefined) {
    tokens.horizontalGap = horizontalGap;
  }
  if (verticalGap !== undefined) {
    tokens.verticalGap = verticalGap;
  }

  const theme = useTheme();
  const textBoxBorderStyle: TextStyle = {
    borderColor: theme.colors.inputBorder,
  };

  const CustomizedPersona = Persona.customize({ tokens });
  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <View style={commonStyles.switch}>
          <Text>Show image</Text>
          <Switch value={showImage} onValueChange={setShowImage} />
        </View>

        <TextInput
          style={[commonStyles.textBox, textBoxBorderStyle]}
          placeholder="Background color"
          blurOnSubmit={true}
          onSubmitEditing={e => {
            setCoinColor(e.nativeEvent.text);
          }}
        />

        <TextInput
          style={[commonStyles.textBox, textBoxBorderStyle]}
          placeholder="Initials text color"
          blurOnSubmit={true}
          onSubmitEditing={e => {
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
