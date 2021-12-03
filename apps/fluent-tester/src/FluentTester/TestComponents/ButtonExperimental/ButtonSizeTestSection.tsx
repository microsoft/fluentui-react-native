import { Button, CompoundButton } from '@fluentui-react-native/experimental-button';
import { SvgIconProps } from '@fluentui-react-native/icon';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';
import TestSvg from './test.svg';

export const ButtonSizeTest: React.FunctionComponent = () => {
  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      {svgIconsEnabled && (
        <>
          <Button iconOnly size="small" icon={{ svgSource: svgProps }} style={commonTestStyles.vmargin} />
          <Button iconOnly size="medium" icon={{ svgSource: svgProps }} style={commonTestStyles.vmargin} />
          <Button iconOnly size="large" icon={{ svgSource: svgProps }} style={commonTestStyles.vmargin} />
          <Button size="small" icon={{ svgSource: svgProps }} style={commonTestStyles.vmargin}>
            Small Button with icon
          </Button>
          <Button size="medium" icon={{ svgSource: svgProps }} style={commonTestStyles.vmargin}>
            Medium Button with icon
          </Button>
          <Button size="large" icon={{ svgSource: svgProps }} style={commonTestStyles.vmargin}>
            Large Button with icon
          </Button>
        </>
      )}
      <Button size="small" style={commonTestStyles.vmargin}>
        Small
      </Button>
      <Button size="medium" style={commonTestStyles.vmargin}>
        Medium
      </Button>
      <Button size="large" style={commonTestStyles.vmargin}>
        Large
      </Button>
      <CompoundButton content="Compound Button" secondaryContent="rounded" shape="rounded" style={commonTestStyles.vmargin} />
      <CompoundButton content="Compound Button" secondaryContent="square" shape="square" style={commonTestStyles.vmargin} />
      <CompoundButton content="Compound Button" secondaryContent="circular" shape="circular" style={commonTestStyles.vmargin} />
    </View>
  );
};
