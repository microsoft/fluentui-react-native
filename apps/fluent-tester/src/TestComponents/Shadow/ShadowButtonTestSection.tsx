import * as React from 'react';
import { Platform, View } from 'react-native';
import { FAB, Text } from '@fluentui/react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';
import { shadowTestPageStyles } from './ShadowTestPageStyles';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { iconProps } from '../Common/iconExamples';

const CustomFABNoShadow = FAB.customize({ shadowToken: undefined });
const CustomFABShadow64 = FAB.customize({
  shadowToken: { ambient: { x: 0, y: 0, blur: 8, color: '#00000033' }, key: { x: 0, y: 32, blur: 64, color: '#0000003d' } },
});

export const ShadowButtonTestSection: React.FunctionComponent = () => {
  const t = useFluentTheme();

  if (Platform.OS === 'ios') {
    return (
      <View style={shadowTestPageStyles(t).backgroundColor}>
        <FAB icon={iconProps} style={commonTestStyles.vmargin}>
          FAB with default shadow
        </FAB>
        <CustomFABShadow64 icon={iconProps} style={commonTestStyles.vmargin}>
          Custom FAB with shadow64
        </CustomFABShadow64>
        <CustomFABNoShadow icon={iconProps} style={commonTestStyles.vmargin}>
          Custom FAB with no shadow
        </CustomFABNoShadow>
      </View>
    );
  } else {
    return (
      <View style={stackStyle}>
        <Text>Shadows only implemented for iOS at this time</Text>
      </View>
    );
  }
};
