import { Button, CompoundButton, ToggleButton } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonVariantTest: React.FunctionComponent<{}> = () => {
  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button content="Default" style={commonTestStyles.vmargin} />
      <Button primary content="Primary" style={commonTestStyles.vmargin} />
      <Button ghost content="Ghost" style={commonTestStyles.vmargin} />
      <Button fluid content="Fluid" style={commonTestStyles.vmargin} />
      <Button primary fluid content="Fluid Primary" style={commonTestStyles.vmargin} />
      <Button ghost fluid content="Fluid Ghost" style={commonTestStyles.vmargin} />
      <CompoundButton content="Default" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <CompoundButton primary content="Primary" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <CompoundButton ghost content="Ghost" secondaryContent="Compound" style={commonTestStyles.vmargin} />
    </View>
  );
};
