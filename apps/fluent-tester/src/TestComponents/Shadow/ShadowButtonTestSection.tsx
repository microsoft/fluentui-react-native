import * as React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { FAB } from '@fluentui/react-native';
import { stackStyle } from '../Common/styles';
import { shadowTestPageStyles } from './ShadowTestPageStyles';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { iconProps } from '../Common/iconExamples';
import { Shadow } from '@fluentui-react-native/experimental-shadow';
import { ButtonV1 as Button } from '@fluentui-react-native/button';

const styles = StyleSheet.create({ marginBetweenComponentsWithShadow: { margin: 10 } });

const CustomFABNoShadow = FAB.customize({ shadowToken: undefined });
const CustomFABShadow64 = FAB.customize({
  shadowToken: { ambient: { x: 0, y: 0, blur: 8, color: '#00000033' }, key: { x: 0, y: 32, blur: 64, color: '#0000003d' } },
});

export const ShadowButtonTestSection: React.FunctionComponent = () => {
  const t = useFluentTheme();

  return (
    <View style={shadowTestPageStyles(t).backgroundColor}>
      {Platform.OS === 'ios' && (
        <View style={stackStyle}>
          <FAB icon={iconProps} style={styles.marginBetweenComponentsWithShadow}>
            FAB with default shadow
          </FAB>
          <CustomFABShadow64 icon={iconProps} style={styles.marginBetweenComponentsWithShadow}>
            Custom FAB with shadow64
          </CustomFABShadow64>
          <CustomFABNoShadow icon={iconProps} style={styles.marginBetweenComponentsWithShadow}>
            Custom FAB with no shadow
          </CustomFABNoShadow>
        </View>
      )}
      {Platform.OS !== 'android' && (
        <View style={stackStyle}>
          <Shadow shadowToken={t.shadows['shadow16']}>
            <Button style={styles.marginBetweenComponentsWithShadow}>Button with shadow16</Button>
          </Shadow>
          <View>
            <Button style={styles.marginBetweenComponentsWithShadow}>Button without shadow</Button>
          </View>
        </View>
      )}
    </View>
  );
};
