import { Button } from '@fluentui-react-native/experimental-button';
import { Icon } from '@fluentui-react-native/icon';
import * as React from 'react';
import { View, Text } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonHOCTest: React.FunctionComponent = () => {
  const buttonRef = React.useRef(null);
  const CustomButton = Button.customize({ backgroundColor: 'pink' });
  const ComposedButton = Button.compose({
    slots: {
      root: View,
      icon: Icon,
      content: Text,
    },
  });

  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <CustomButton style={commonTestStyles.vmargin} ref={buttonRef}>
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
      <ComposedButton style={commonTestStyles.vmargin}>Composed button using RNText for text slot</ComposedButton>
    </View>
  );
};
