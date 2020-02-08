import * as React from 'react';
import { PersonaSize, PersonaPresence, PersonaCoin } from '../../../components/PersonaCoin';
import { Switch, View, Text, Picker, TextInput } from 'react-native';
import { styles, steveBallerPhotoUrl } from './styles';
import { getAllEnumValues } from './utils';
import { useTheme } from '@uifabricshared/theming-react-native';

const allPresences = getAllEnumValues(PersonaPresence);

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [imageSize] = React.useState(PersonaSize.size56);
  const [coinColor, setCoinColor] = React.useState<string | undefined>(undefined);
  const [presence, setPresence] = React.useState(PersonaPresence.none);

  const theme = useTheme();
  const textBoxBorderStyle = {
    borderColor: theme.colors.inputBorder
  };

  const CustomizedPersonaCoin = PersonaCoin.customize({
    tokens: {
      backgroundColor: coinColor
    }
  });

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
          onChange={e => console.log(e.nativeEvent.text)}
          onSubmitEditing={e => {
            setCoinColor(e.nativeEvent.text);
          }}
        />

        <Picker
          prompt="Presence status"
          style={styles.header}
          selectedValue={PersonaPresence[presence]}
          onValueChange={presence => setPresence(PersonaPresence[presence as string])}
        >
          {allPresences.map((presence, index) => (
            <Picker.Item label={presence} key={index} value={presence} />
          ))}
        </Picker>
      </View>

      {/* component under test */}
      <View style={styles.personaContainer}>
        <CustomizedPersonaCoin
          size={imageSize}
          initials="SB"
          imageDescription="Former CEO of Microsoft"
          presence={presence}
          imageUrl={showImage ? steveBallerPhotoUrl : undefined}
        />
      </View>
    </View>
  );
};
