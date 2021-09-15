import * as React from 'react';
import { PersonaSize, PersonaCoinFluentColor, PersonaCoin, PersonaPresence } from '@fluentui/react-native';
import { Switch, View, Text, Picker, ColorValue } from 'react-native';
import { satyaPhotoUrl, undefinedText } from './styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';

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
  'size120',
];

const allColors: WithUndefined<PersonaCoinFluentColor>[] = [
  undefinedText,
  'cornflower',
  'blue',
  'royalBlue',
  'teal',
  'forest',
  'darkGreen',
  'berry',
  'hotPink',
  'grape',
  'purple',
  'pumpkin',
  'red',
  'burgundy',
  'orchid',
  'brass',
  'darkRed',
  'beige',
  'platinum',
  'steel',
  'brown',
];

const allPresences: WithUndefined<PersonaPresence>[] = [undefinedText, 'none', 'online', 'offline', 'busy', 'dnd', 'blocked', 'away'];

const StyledPicker = props => {
  const { prompt, selected, onChange, collection } = props;
  const theme = useTheme();
  const pickerStyles = { color: theme.colors.inputText as ColorValue, ...commonStyles.header };
  return (
    <Picker prompt={prompt} style={pickerStyles} selectedValue={selected} onValueChange={onChange}>
      {collection.map((value, index) => (
        <Picker.Item label={value} key={index} value={value} />
      ))}
    </Picker>
  );
};

export const StandardUsage: React.FunctionComponent = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [imageSize, setImageSize] = React.useState<WithUndefined<PersonaSize>>('size72');
  const [coinColor, setCoinColor] = React.useState<WithUndefined<PersonaCoinFluentColor>>('brass');
  const [presence, setPresence] = React.useState<WithUndefined<PersonaPresence>>('online');

  const onSizeChange = React.useCallback(value => setImageSize(value), []);
  const onColorChange = React.useCallback(value => setCoinColor(value), []);
  const onPresenceChange = React.useCallback(value => setPresence(value), []);

  const theme = useTheme();
  const textStyles = { color: theme.colors.inputText as ColorValue };

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <View style={commonStyles.switch}>
          <Text style={textStyles}>Show image</Text>
          <Switch value={showImage} onValueChange={setShowImage} />
        </View>

        <StyledPicker prompt="Size" selected={imageSize} onChange={onSizeChange} collection={allSizes} />
        <StyledPicker prompt="Coin color" selected={coinColor} onChange={onColorChange} collection={allColors} />
        <StyledPicker prompt="Presence status" selected={presence} onChange={onPresenceChange} collection={allPresences} />
      </View>

      {/* component under test */}
      <PersonaCoin
        size={imageSize === undefinedText ? undefined : imageSize}
        initials="SN"
        imageDescription="Photo of Satya Nadella"
        presence={presence === undefinedText ? undefined : presence}
        imageUrl={showImage ? satyaPhotoUrl : undefined}
        coinColorFluent={coinColor === undefinedText ? undefined : coinColor}
      />
    </View>
  );
};
