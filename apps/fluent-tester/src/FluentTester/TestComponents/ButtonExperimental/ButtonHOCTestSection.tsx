import { Button } from '@fluentui-react-native/experimental-button';
import { Text } from '@fluentui-react-native/experimental-text';
import { Icon } from '@fluentui-react-native/icon';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonHOCTest: React.FunctionComponent = () => {
  const buttonRef = React.useRef(null);
  const CustomText = Text.customize({ fontSize: 'header', color: 'hotpink' });
  const CustomButton = Button.customize({ backgroundColor: 'pink' });
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

  return (
    <View style={stackStyle}>
      <CustomButton style={commonTestStyles.vmargin} componentRef={buttonRef}>
        Customized Button with ref
      </CustomButton>
      <Button
        style={commonTestStyles.vmargin}
        onClick={() => {
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
