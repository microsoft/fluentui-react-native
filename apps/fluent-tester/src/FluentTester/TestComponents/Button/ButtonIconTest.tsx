/* eslint-disable @typescript-eslint/no-var-requires */
import { Button } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { stackStyle } from '../Common/styles';
import { SvgIconProps, FontIconProps } from '@fluentui-react-native/icon';
const TestSvg = require('./test.svg');

const CustomizedIconButton = Button.customize({
  tokens: { iconColor: 'red' },
  content: { style: { marginStart: 5 } },
});

export const ButtonIconTest: React.FunctionComponent<{}> = () => {
  if (Platform.OS == ('win32' as any)) {
    const testImage = require('./icon_24x24.png');
    const testTtf = require('./Font Awesome 5 Free-Solid-900.otf');

    const fontProps: FontIconProps = {
      fontFamily: `Font Awesome 5 Free`,
      fontSrcFile: testTtf,
      codepoint: 0xf083,
      fontSize: 16,
    };

    const svgProps: SvgIconProps = {
      src: TestSvg,
      viewBox: '0 0 500 500',
    };

    return (
      <View>
        <Stack style={stackStyle}>
          <Button icon={testImage} content="Button with png Icon" tooltip="button tooltip" />
          <Button icon={{ fontSource: fontProps, color: 'blue' }} content="Button with font Icon" tooltip="button tooltip" />
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
  } else {
    return (
      <View>
        <Stack style={stackStyle}>
          <Button icon={require('./icon_24x24.png')} content="Button with Icon" tooltip="button tooltip" />
          <CustomizedIconButton icon={require('./icon_24x24.png')} content="Button with Customized Icon" tooltip="button tooltip" />
        </Stack>
      </View>
    );
  }
};
