import { Button } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';

export const ButtonVariantTest: React.FunctionComponent<{}> = () => {
  return (
    <View style={stackStyle}>
      <Button content="Default" />
      <Button primary content="Primary" />
      <Button ghost content="Ghost" />
    </View>
  );
};
