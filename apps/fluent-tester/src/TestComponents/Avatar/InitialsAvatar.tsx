import React, { FunctionComponent } from 'react';
import { AvatarColors, Avatar, getHashCodeWeb } from '@fluentui-react-native/avatar';
import { TextInput, View } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const InitialsAvatar: FunctionComponent = () => {
  const [name, setName] = React.useState('Kat Larsson');
  const color = AvatarColors[getHashCodeWeb(name) % AvatarColors.length];

  return (
    <View style={commonStyles.root}>
      <TextInput value={name} onChangeText={setName} style={commonStyles.textBox} />
      <Avatar name={name} size={120} avatarColor={color} style={{ marginLeft: 20 }} />
    </View>
  );
};
