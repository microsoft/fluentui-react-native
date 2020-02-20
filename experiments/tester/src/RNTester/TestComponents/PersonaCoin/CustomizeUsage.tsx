import * as React from 'react';
import { PersonaCoin, IconAlignment, IPersonaCoinTokens } from 'react-native-uifabric';
import { Switch, View, Text, Picker, TextInput } from 'react-native';
import { Slider } from '../Common/Slider';
import { styles, steveBallmerPhotoUrl, undefinedText } from './styles';
import { useTheme } from '@uifabricshared/theming-react-native';

const alignmentValues: Array<typeof undefinedText | IconAlignment> = [undefinedText, 'start', 'center', 'end'];

interface IAlignmentPickerProps {
  label: string;
  onSelectionChange: (value: IconAlignment | undefined) => void;
}

const AlignmentPicker: React.FunctionComponent<IAlignmentPickerProps> = (props: IAlignmentPickerProps) => {
  const { label, onSelectionChange } = props;
  return (
    <Picker
      prompt={label}
      style={styles.header}
      selectedValue={undefinedText}
      onValueChange={(value, index) => onSelectionChange(index == 0 ? undefined : value)}
    >
      {alignmentValues.map((alignment, index) => (
        <Picker.Item label={alignment} key={index} value={alignment} />
      ))}
    </Picker>
  );
};

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
          style={[styles.textBox, textBoxBorderStyle]}
          placeholder="Background color"
          blurOnSubmit={true}
          onSubmitEditing={e => {
            setCoinColor(e.nativeEvent.text);
          }}
        />

        <TextInput
          style={[styles.textBox, textBoxBorderStyle]}
          placeholder="Initials text color"
          blurOnSubmit={true}
          onSubmitEditing={e => {
            setTextColor(e.nativeEvent.text);
          }}
        />

        <AlignmentPicker label="Horizontal icon alignment" onSelectionChange={setHorizontalAlignment} />

        <AlignmentPicker label="Vertical icon alignment" onSelectionChange={setVerticalAlignment} />

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
