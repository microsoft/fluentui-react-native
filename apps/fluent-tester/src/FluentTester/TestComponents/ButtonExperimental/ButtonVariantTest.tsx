import { Button, CompoundButton } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonVariantTest: React.FunctionComponent<{}> = () => {
  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button content="Default" />
      <Button primary content="Primary" />
      <Button ghost content="Ghost" />
      <CompoundButton content="Default" secondaryContent="sublabel" />
    </View>
  );
};
