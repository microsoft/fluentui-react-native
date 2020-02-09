import * as React from 'react';
import { PersonaSize, PersonaPresence, PersonaCoin, IconAlignment } from '../../../components/PersonaCoin';
import { Switch, View, Text, Picker, TextInput } from 'react-native';
import { styles, steveBallerPhotoUrl } from './styles';
import { getAllEnumValues, undefinedText } from './utils';
import { useTheme } from '@uifabricshared/theming-react-native';

const allPresences = getAllEnumValues(PersonaPresence);
const alignments: IconAlignment[] = ['(undefined)', 'start', 'center', 'end'];

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [imageSize] = React.useState(PersonaSize.size56);
  const [coinColor, setCoinColor] = React.useState<string | undefined>(undefined);
  const [textColor, setTextColor] = React.useState<string | undefined>(undefined);
  const [presence, setPresence] = React.useState(PersonaPresence.none);
  const [horizontalAlignment, setHorizontalAlignment] = React.useState<IconAlignment>();
  const [verticalAlignment, setVerticalAlignment] = React.useState<IconAlignment>();

  const theme = useTheme();
  const textBoxBorderStyle = {
    borderColor: theme.colors.inputBorder
  };

  const CustomizedPersonaCoin = PersonaCoin.customize({
    tokens: {
      backgroundColor: coinColor,
      color: textColor
    }
  });

  const backgroundColor = React.useRef<string>();
  const color = React.useRef<string>();

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
          onChange={e => (backgroundColor.current = e.nativeEvent.text)}
          onSubmitEditing={() => {
            setCoinColor(backgroundColor.current);
          }}
        />

        <TextInput
          style={[styles.textBox, textBoxBorderStyle]}
          placeholder="Initials text color"
          blurOnSubmit={true}
          onChange={e => (color.current = e.nativeEvent.text)}
          onSubmitEditing={() => {
            setTextColor(color.current);
          }}
        />

        <Picker
          prompt="Presence status"
          style={styles.header}
          selectedValue={presence ? PersonaPresence[presence] : undefinedText}
          onValueChange={presence => setPresence(PersonaPresence[presence as string])}
        >
          {allPresences.map((presence, index) => (
            <Picker.Item label={presence} key={index} value={presence} />
          ))}
        </Picker>
      </View>

      {/* component under test */}
      {/* <View style={styles.personaContainer}> */}
      <CustomizedPersonaCoin
        size={imageSize}
        initials="SB"
        imageDescription="Former CEO of Microsoft"
        presence={presence}
        imageUrl={showImage ? steveBallerPhotoUrl : undefined}
      />
      {/* </View> */}
    </View>
  );
};
