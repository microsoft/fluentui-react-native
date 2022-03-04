import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Text } from '@fluentui-react-native/experimental-text';
import { Icon, SvgIconProps } from '@fluentui-react-native/icon';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';
import TestSvg from './test.svg';
import { InteractionEvent, isGestureResponderEvent } from '@fluentui-react-native/interactive-hooks';

const CustomText = Text.customize({ fontSize: 'header', color: 'hotpink' });
const CustomButton = Button.customize({ backgroundColor: 'pink' });
const CustomIconButton = Button.customize({ iconColor: 'yellow' });
const ComposedButton = Button.compose({
  slots: {
    root: View,
    icon: Icon,
    content: CustomText,
  },
  slotProps: {
    content: {
      style: { marginTop: -1, marginBottom: 1, marginStart: 0, marginEnd: -2 },
    },
  },
});
const svgProps: SvgIconProps = {
  src: TestSvg,
  viewBox: '0 0 500 500',
};

export const ButtonHOCTest: React.FunctionComponent = () => {
  const buttonRef = React.useRef(null);
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View style={stackStyle}>
      <CustomButton style={commonTestStyles.vmargin} componentRef={buttonRef}>
        Customized Button with ref
      </CustomButton>
      {svgIconsEnabled && <CustomIconButton icon={{ svgSource: svgProps }}>Customized Icon Button</CustomIconButton>}
      <Button
        style={commonTestStyles.vmargin}
        onClick={(e: InteractionEvent) => {
          console.log(e.timeStamp);

          if (isGestureResponderEvent(e)) {
            console.log('I was clicked!');
          }

          if (buttonRef.current) {
            buttonRef.current.focus();
          }
        }}
      >
        Press to focus Customized Button
      </Button>
      <ComposedButton style={commonTestStyles.vmargin}>Composed button using customized Text for text slot</ComposedButton>
    </View>
  );
};
