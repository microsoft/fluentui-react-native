import * as React from 'react';
import { PersonaCoin, IconAlignment, IPersonaCoinTokens } from 'react-native-uifabric';
import { Switch, View, Text, Picker, TextInput } from 'react-native';
import { styles, steveBallmerPhotoUrl, undefinedText } from './styles';
import { useTheme } from '@uifabricshared/theming-react-native';
import { NumericInput } from '../Common/NumericInput';
import { styles as commonStyles } from '../Common/styles';

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
  const [physicalSize, setPhysicalCoinSize] = React.useState<number>();
  const [iconSize, setIconSize] = React.useState<number>();
  const [initialsSize, setInitialsFontSize] = React.useState<number>();
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

        <AlignmentPicker label="Horizontal icon alignment" onSelectionChange={setHorizontalAlignment} />

        <AlignmentPicker label="Vertical icon alignment" onSelectionChange={setVerticalAlignment} />

        <NumericInput label="Coin size" maximum={200} onSubmit={setPhysicalCoinSize} />

        <NumericInput label="Icon size" maximum={100} onSubmit={setIconSize} />

        <NumericInput label="Font size" maximum={50} onSubmit={setInitialsFontSize} />
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
