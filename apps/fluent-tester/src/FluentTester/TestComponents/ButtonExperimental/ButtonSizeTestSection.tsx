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
      <Button loading size="small" style={commonTestStyles.vmargin}>
        Loading Button Small
      </Button>
      <Button loading size="medium" style={commonTestStyles.vmargin}>
        Loading Button Medium
      </Button>
      <Button loading size="large" style={commonTestStyles.vmargin}>
        Loading Button Large
      </Button>
      <CompoundButton secondaryContent="Small compound button" size="small" style={commonTestStyles.vmargin}>
        Compound Button
      </CompoundButton>
      <CompoundButton secondaryContent="Medium compound button" size="medium" style={commonTestStyles.vmargin}>
        Compound Button
      </CompoundButton>
      <CompoundButton secondaryContent="Large compound button" size="large" style={commonTestStyles.vmargin}>
        Compound Button
      </CompoundButton>
      <CompoundButton icon={{ svgSource: svgProps }} secondaryContent="SecondaryContent" size="small" style={commonTestStyles.vmargin}>
        Content
      </CompoundButton>
      <CompoundButton icon={{ svgSource: svgProps }} secondaryContent="SecondaryContent" size="medium" style={commonTestStyles.vmargin}>
        Content
      </CompoundButton>
      <CompoundButton icon={{ svgSource: svgProps }} secondaryContent="SecondaryContent" size="large" style={commonTestStyles.vmargin}>
        Content
      </CompoundButton>
    </View>
  );
};
