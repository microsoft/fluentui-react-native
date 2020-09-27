import { Button, CompoundButton } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonVariantTest: React.FunctionComponent<{}> = () => {
  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button content="Default" style={commonTestStyles.vmargin} />
      <Button primary content="Primary" style={commonTestStyles.vmargin} />
      <Button ghost content="Ghost" style={commonTestStyles.vmargin} />
      <Button content="Fluid" fluid style={commonTestStyles.vmargin}>
        <View style={{ width: 40, height: 40, backgroundColor: 'black' }}></View>
      </Button>
      <CompoundButton content="Default" secondaryContent="sublabel" style={commonTestStyles.vmargin} />
    </View>
  );
};
