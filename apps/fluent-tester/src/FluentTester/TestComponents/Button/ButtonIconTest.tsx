/* eslint-disable @typescript-eslint/no-var-requires */
import { Button } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { stackStyle } from '../Common/styles';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from './test.svg';

const CustomizedIconButton = Button.customize({
  tokens: { iconColor: 'red' },
  content: { style: { marginStart: 5 } },
});

export const ButtonIconTest: React.FunctionComponent<{}> = () => {
  const testImage = require('./icon_24x24.png');

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  // SVG-based icons are not available on all platforms yet
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View>
      <Stack style={stackStyle}>
        <Button icon={testImage} content="Button with png Icon" tooltip="button tooltip" />
        {svgIconsEnabled ? (
          <Button
            icon={{ svgSource: svgProps, width: 20, height: 20, color: 'red' }}
            content="Button with svg Icon"
            tooltip="button tooltip"
          />
        ) : null}
        {svgIconsEnabled ? (
          <CustomizedIconButton
            icon={{ svgSource: svgProps, width: 20, height: 20 }}
            content="Button with Customized Icon"
            tooltip="button tooltip"
          />
        ) : null}
      </Stack>
    </View>
  );
};
