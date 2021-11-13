import { Button, CompoundButton, FabButton } from '@fluentui-react-native/experimental-button';
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
      <Button appearance="primary" content="Primary" style={commonTestStyles.vmargin} />
      <Button appearance="subtle" content="Subtle" style={commonTestStyles.vmargin} />
      <Button block content="Block" style={commonTestStyles.vmargin} />
      <Button appearance="primary" block content="Block Primary" style={commonTestStyles.vmargin} />
      <Button appearance="subtle" block content="Block Subtle" style={commonTestStyles.vmargin} />
      <CompoundButton content="Default" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <CompoundButton appearance="primary" content="Primary" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <CompoundButton appearance="subtle" content="Subtle" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <FabButton icon={{ svgSource: svgProps, width: 20, height: 20 }} style={commonTestStyles.vmargin} />
      <FabButton icon={{ svgSource: svgProps, width: 20, height: 20 }} content="FAB" style={commonTestStyles.vmargin} />
    </View>
  );
};
