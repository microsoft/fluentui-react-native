import * as React from 'react';
import { PersonaCoin, IconAlignment, IPersonaCoinTokens } from 'react-native-uifabric';
import { Switch, View, Text, TextInput } from 'react-native';
import { Slider } from '../Common/Slider';
import { styles, steveBallmerPhotoUrl } from './styles';
import { useTheme } from '@uifabricshared/theming-react-native';
import { AlignmentPicker } from '../Common/AlignmentPicker';
import { styles as commonStyles } from '../Common/styles';

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [coinColor, setCoinColor] = React.useState<string>();
  const [textColor, setTextColor] = React.useState<string>();
  const [physicalSize, setPhysicalSize] = React.useState<number>(80);
  const [iconSize, setIconSize] = React.useState<number>(24);
  const [initialsSize, setInitialsSize] = React.useState<number>(14);
  const [horizontalAlignment, setHorizontalAlignment] = React.useState<IconAlignment>();
  const [verticalAlignment, setVerticalAlignment] = React.useState<IconAlignment>();

  const theme = useTheme();
  const textBoxBorderStyle = {
    borderColor: theme.colors.inputBorder
  };

  const tokens: Partial<IPersonaCoinTokens> = {};
  if (coinColor) {
    tokens.backgroundColor = coinColor;
  }
  if (textColor) {
    tokens.color = textColor;
  }
  if (horizontalAlignment) {
    tokens.horizontalIconAlignment = horizontalAlignment;
  }
  if (verticalAlignment) {
    tokens.verticalIconAlignment = verticalAlignment;
  }
  if (iconSize) {
    tokens.iconSize = iconSize;
  }
  if (initialsSize) {
    tokens.initialsSize = initialsSize;
  }
  if (physicalSize) {
    tokens.coinSize = physicalSize;
  }

  const CustomizedPersonaCoin = PersonaCoin.customize({ tokens });

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

        <AlignmentPicker style={styles.header} label="Horizontal icon alignment" onSelectionChange={setHorizontalAlignment} />
        <AlignmentPicker style={styles.header} label="Vertical icon alignment" onSelectionChange={setVerticalAlignment} />

        <Text>Coin size</Text>
        <Slider minimum={8} maximum={200} initialValue={80} style={styles.slider} onChange={setPhysicalSize} />

        <Text>Icon size</Text>
        <Slider minimum={8} maximum={100} initialValue={24} style={styles.slider} onChange={setIconSize} />

        <Text>Font size</Text>
        <Slider minimum={5} maximum={50} initialValue={14} style={styles.slider} onChange={setInitialsSize} />
      </View>

      {/* component under test */}
      <CustomizedPersonaCoin
        initials="SB"
        imageDescription="Former CEO of Microsoft"
        presence="blocked"
        imageUrl={showImage ? steveBallmerPhotoUrl : undefined}
      />
    </View>
  );
};
