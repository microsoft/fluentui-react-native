import * as React from 'react';
import { View } from 'react-native';
import { Avatar, Button } from '@fluentui/react-native';
import { AVATAR_TESTPAGE } from './consts';

export const AvatarTest: React.FunctionComponent<{}> = () => {

  return (
    <View testID={AVATAR_TESTPAGE}>
      <Avatar
      />
      <Button />
    </View>
  );
};
