import { Button, CompoundButton } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from './test.svg';

export const ButtonVariantTest: React.FunctionComponent = () => {
  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

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
      <Button fab icon={{ svgSource: svgProps, width: 20, height: 20 }} style={commonTestStyles.vmargin} />
      <Button fab icon={{ svgSource: svgProps, width: 20, height: 20 }} content="FAB" style={commonTestStyles.vmargin} />
    </View>
  );
};
