import * as React from 'react';
import { PersonaPresence, PersonaCoin, IconAlignment, IPersonaCoinTokens } from 'react-native-uifabric';
import { Switch, View, Text, Picker, TextInput } from 'react-native';
import { styles, steveBallerPhotoUrl as steveBallmerPhotoUrl } from './styles';
import { undefinedText } from './utils';
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

interface INumericInputProps {
  label: string;
  maximum?: number;
  onSubmit: (value: number | undefined) => void;
}

const NumericInput: React.FunctionComponent<INumericInputProps> = (props: INumericInputProps) => {
  const { label, onSubmit, maximum } = props;

  const theme = useTheme();
  const textBoxBorderStyle = {
    borderColor: theme.colors.inputBorder,
    width: 100
  };

  return (
    <TextInput
      placeholder={label}
      style={[styles.textBox, textBoxBorderStyle]}
      blurOnSubmit={true}
      onSubmitEditing={e => {
        const stringValue = e.nativeEvent.text;
        let numericValue = stringValue ? parseInt(stringValue) : NaN;
        if (isNaN(numericValue)) {
          onSubmit(undefined);
        } else {
          numericValue = Math.max(0, numericValue);
          if (maximum) {
            numericValue = Math.min(numericValue, maximum);
          }
          onSubmit(numericValue);
        }
      }}
    />
  );
};

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [coinColor, setCoinColor] = React.useState<string>();
  const [textColor, setTextColor] = React.useState<string>();
  const [physicalCoinSize, setPhysicalCoinSize] = React.useState<number>();
  const [iconSize, setIconSize] = React.useState<number>();
  const [initialsFontSize, setInitialsFontSize] = React.useState<number>();
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
  if (initialsFontSize) {
    tokens.initialsFontSize = initialsFontSize;
  }
  if (physicalCoinSize) {
    tokens.coinSize = physicalCoinSize;
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

        <NumericInput label="Coin size" maximum={200} onSubmit={setPhysicalCoinSize} />

        <NumericInput label="Icon size" maximum={100} onSubmit={setIconSize} />

        <NumericInput label="Font size" maximum={50} onSubmit={setInitialsFontSize} />
      </View>

      {/* component under test */}
      <CustomizedPersonaCoin
        initials="SB"
        imageDescription="Former CEO of Microsoft"
        presence={PersonaPresence.blocked}
        imageUrl={showImage ? steveBallmerPhotoUrl : undefined}
      />
    </View>
  );
};
