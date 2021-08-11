import { Button, CompoundButton } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from './test.svg';

export const ButtonVariantTest: React.FunctionComponent = () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 32,
  };

  const testImage = require('./icon_24x24.png');

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button fab icon={{ svgSource: svgProps, width: 20, height: 20 }} style={commonTestStyles.vmargin} />
      <Button fab icon={{ svgSource: svgProps, width: 20, height: 20 }} content="FAB" style={commonTestStyles.vmargin} />
      <Button
        icon={{ fontSource: fontBuiltInProps, width: 100, height: 100, color: '#060' }}
        content="Font icon"
        style={commonTestStyles.vmargin}
      />
      <Button icon={{ fontSource: fontBuiltInProps, width: 100, height: 100 }} content="Font icon" style={commonTestStyles.vmargin} />
      <Button
        primary
        icon={{ fontSource: fontBuiltInProps, width: 100, height: 100 }}
        content="Font icon"
        style={commonTestStyles.vmargin}
      />
      {svgIconsEnabled ? (
        <Button
          primary
          icon={{ svgSource: svgProps, width: 20, height: 20, color: 'red' }}
          content="SVG"
          style={commonTestStyles.vmargin}
        />
      ) : null}
      {svgIconsEnabled ? (
        <Button icon={{ svgSource: svgProps, width: 20, height: 20 }} content="SVG" style={commonTestStyles.vmargin} />
      ) : null}
      <Button primary icon={testImage} content="PNG" style={commonTestStyles.vmargin} />
      <Button icon={testImage} content="PNG" style={commonTestStyles.vmargin} />
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
