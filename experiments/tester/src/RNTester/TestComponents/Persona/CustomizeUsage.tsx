import * as React from 'react';
import { View, Text, Switch, TextInput } from 'react-native';
import { IPersonaTokens, Persona } from 'react-native-uifabric';
import { styles, michaelImageUrl } from './styles';
import { styles as commonStyles } from '../Common/styles';
import { useTheme } from '@uifabricshared/theming-react-native';
import { NumericInput } from '../Common/NumericInput';
import { Slider } from '../Common/Slider';

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [coinColor, setCoinColor] = React.useState<string>();
  const [textColor, setTextColor] = React.useState<string>();

  const [textSize, setTextSize] = React.useState<number>();
  const [secondarySize, setSecondarySize] = React.useState<number>();
  const [tertiarySize, setTertiarySize] = React.useState<number>();
  const [optionalSize, setOptionalSize] = React.useState<number>();

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
  const textBoxBorderStyle = {
    borderColor: theme.colors.inputBorder
  };

  const CustomizedPersona = Persona.customize({ tokens });
  return (
    <View style={styles.root}>
      {/* settings */}
      <View style={styles.settings}>
        <View style={styles.switch}>
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
        <Slider maximum={60} style={{ width: 200 }} onChange={setTextSize} />

        <Text>Secondary text size</Text>
        <Slider maximum={60} style={{ width: 200 }} onChange={setSecondarySize} />

        <Text>Tertiary text size</Text>
        <Slider maximum={60} style={{ width: 200 }} onChange={setTertiarySize} />

        <Text>Optional text size</Text>
        <Slider maximum={60} style={{ width: 200 }} onChange={setOptionalSize} />

        <NumericInput label="Horizontal gap" maximum={100} onSubmit={setHorizontalGap} />
        <NumericInput label="Vertical gap" maximum={100} onSubmit={setVerticalGap} />
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
