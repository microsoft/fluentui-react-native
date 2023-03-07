import * as React from 'react';
import type { ColorValue } from 'react-native';
import { Switch, View, Text } from 'react-native';

import type { PersonaSize, PersonaCoinFluentColor, PersonaPresence } from '@fluentui/react-native';
import { PersonaCoin } from '@fluentui/react-native';
import { useTheme } from '@fluentui-react-native/theme-types';

import { satyaPhotoUrl, undefinedText } from './styles';
import { StyledPicker } from '../Common/StyledPicker';
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

export const StandardUsage: React.FunctionComponent = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [imageSize, setImageSize] = React.useState<WithUndefined<PersonaSize>>('size72');
  const [coinColor, setCoinColor] = React.useState<WithUndefined<PersonaCoinFluentColor>>('brass');
  const [presence, setPresence] = React.useState<WithUndefined<PersonaPresence>>('online');

  const onSizeChange = React.useCallback((value) => setImageSize(value), []);
  const onColorChange = React.useCallback((value) => setCoinColor(value), []);
  const onPresenceChange = React.useCallback((value) => setPresence(value), []);

  const theme = useTheme();
  const textStyles = { color: theme.colors.inputText as ColorValue };

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settingsPicker}>
        <View style={commonStyles.switch}>
          <Text style={textStyles}>Show image</Text>
          <Switch value={showImage} onValueChange={setShowImage} />
        </View>
        <StyledPicker prompt="Size" selected={imageSize} onChange={onSizeChange} collection={allSizes} />
        <StyledPicker prompt="Coin color" selected={coinColor} onChange={onColorChange} collection={allColors} />
        <StyledPicker prompt="Presence status" selected={presence} onChange={onPresenceChange} collection={allPresences} />
      </View>

      {/* component under test */}
      <View style={commonStyles.pickerControlled}>
        <PersonaCoin
          size={imageSize === undefinedText ? undefined : imageSize}
          initials="SN"
          imageDescription="Photo of Satya Nadella"
          presence={presence === undefinedText ? undefined : presence}
          imageUrl={showImage ? satyaPhotoUrl : undefined}
          coinColorFluent={coinColor === undefinedText ? undefined : coinColor}
        />
      </View>
    </View>
  );
};
