import * as React from 'react';
import { PersonaSize, PersonaCoinColor, PersonaCoin, PersonaPresence } from '@fluentui/react-native';
import { Switch, View, Text, Picker } from 'react-native';
import { satyaPhotoUrl, undefinedText } from './styles';
import { commonTestStyles as commonStyles } from '../Common/styles';

type WithUndefined<T> = T | typeof undefinedText;

const allSizes: WithUndefined<PersonaSize>[] = [
  undefinedText,
  'size8',
  'size24',
  'size32',
  'size40',
  'size48',
  'size56',
  'size72',
  'size100',
  'size120'
];

const allColors: WithUndefined<PersonaCoinColor>[] = [
  undefinedText,
  'lightBlue',
  'blue',
  'darkBlue',
  'teal',
  'green',
  'darkGreen',
  'lightPink',
  'pink',
  'magenta',
  'purple',
  'orange',
  'darkRed',
  'violet',
  'lightRed',
  'gold',
  'burgundy',
  'warmGray',
  'coolGray',
  'cyan',
  'rust'
];
const allPresences: WithUndefined<PersonaPresence>[] = [undefinedText, 'none', 'online', 'offline', 'busy', 'dnd', 'blocked', 'away'];

export const StandardUsage: React.FunctionComponent<{}> = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [imageSize, setImageSize] = React.useState<WithUndefined<PersonaSize>>('size72');
  const [coinColor, setCoinColor] = React.useState<WithUndefined<PersonaCoinColor>>('gold');
  const [presence, setPresence] = React.useState<WithUndefined<PersonaPresence>>('online');

  const onSizeChange = React.useCallback(value => setImageSize(value), []);
  const onColorChange = React.useCallback(value => setCoinColor(value), []);
  const onPresenceChange = React.useCallback(value => setPresence(value), []);

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <View style={commonStyles.switch}>
          <Text>Show image</Text>
          <Switch value={showImage} onValueChange={setShowImage} />
        </View>

        <Picker prompt="Size" style={commonStyles.header} selectedValue={imageSize} onValueChange={onSizeChange}>
          {allSizes.map((size, index) => (
            <Picker.Item label={size} key={index} value={size} />
          ))}
        </Picker>

        <Picker prompt="Coin color" style={commonStyles.header} selectedValue={coinColor} onValueChange={onColorChange}>
          {allColors.map((color, index) => (
            <Picker.Item label={color} key={index} value={color} />
          ))}
        </Picker>

        <Picker prompt="Presence status" style={commonStyles.header} selectedValue={presence} onValueChange={onPresenceChange}>
          {allPresences.map((presence, index) => (
            <Picker.Item label={presence} key={index} value={presence} />
          ))}
        </Picker>
      </View>

      {/* component under test */}
      <PersonaCoin
        size={imageSize === undefinedText ? undefined : imageSize}
        initials="SN"
        imageDescription="Photo of Satya Nadella"
        presence={presence === undefinedText ? undefined : presence}
        imageUrl={showImage ? satyaPhotoUrl : undefined}
        coinColor={coinColor === undefinedText ? undefined : coinColor}
      />
    </View>
  );
};
