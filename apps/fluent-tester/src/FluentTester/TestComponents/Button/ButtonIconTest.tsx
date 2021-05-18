/* eslint-disable @typescript-eslint/no-var-requires */
import { Button } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { View } from 'react-native';
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

  return (
    <View>
      <Stack style={stackStyle}>
        <Button icon={testImage} content="Button with png Icon" tooltip="button tooltip" />
        <Button
          icon={{ svgSource: svgProps, width: 20, height: 20, color: 'red' }}
          content="Button with svg Icon"
          tooltip="button tooltip"
        />
        <CustomizedIconButton
          icon={{ svgSource: svgProps, width: 20, height: 20 }}
          content="Button with Customized Icon"
          tooltip="button tooltip"
        />
      </Stack>
    </View>
  );
};
