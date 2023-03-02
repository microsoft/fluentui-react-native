import * as React from 'react';
import { Platform, View, StyleSheet, Pressable } from 'react-native';

import { FAB, Text } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Shadow } from '@fluentui-react-native/experimental-shadow';
import { useFluentTheme } from '@fluentui-react-native/framework';

import { shadowTestPageStyles } from './ShadowTestPageStyles';
import { iconProps } from '../Common/iconExamples';
import { stackStyle } from '../Common/styles';

const styles = StyleSheet.create({ marginBetweenComponentsWithShadow: { margin: 10 } });

const CustomFABNoShadow = FAB.customize({ shadowToken: undefined });
const CustomFABShadow64 = FAB.customize({
  shadowToken: { ambient: { x: 0, y: 0, blur: 8, color: '#00000033' }, key: { x: 0, y: 32, blur: 64, color: '#0000003d' } },
});

const platformSupportsShadow = Platform.OS !== 'android';
const platformSupportsFAB = Platform.OS === 'ios' || Platform.OS === 'android';

export const ShadowButtonTestSection: React.FunctionComponent = () => {
  const t = useFluentTheme();
  const [hovered1, setHovered1] = React.useState(false);
  const [hovered2, setHovered2] = React.useState(false);
  const [hovered3, setHovered3] = React.useState(false);

  if (platformSupportsShadow) {
    return (
      <View>
        <Shadow shadowToken={hovered1 ? t.shadows.shadow8 : undefined}>
          <Pressable
            onHoverIn={() => {
              console.log('on hover in 1');
              setHovered1(true);
            }}
            onHoverOut={() => {
              console.log('on hover out 1');
              setHovered1(false);
            }}
          >
            <View style={{ width: 50, height: 50, backgroundColor: 'red', margin: 10 }}></View>
          </Pressable>
        </Shadow>
        <Shadow shadowToken={hovered2 ? t.shadows.shadow8 : undefined}>
          <Pressable
            onHoverIn={() => {
              console.log('on hover in 2');
              setHovered2(true);
            }}
            onHoverOut={() => {
              console.log('on hover out 2');
              setHovered2(false);
            }}
          >
            <View style={{ width: 50, height: 50, backgroundColor: 'red', margin: 10 }}></View>
          </Pressable>
        </Shadow>
        <Shadow shadowToken={hovered3 ? t.shadows.shadow8 : undefined}>
          <Pressable
            onHoverIn={() => {
              console.log('on hover in 3');
              setHovered3(true);
            }}
            onHoverOut={() => {
              console.log('on hover out 3');
              setHovered3(false);
            }}
          >
            <View style={{ width: 50, height: 50, backgroundColor: 'red', margin: 10 }}></View>
          </Pressable>
        </Shadow>

        {/* {platformSupportsShadow && platformSupportsFAB && (
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
        {platformSupportsShadow && (
          <View style={stackStyle}>
            <Shadow shadowToken={t.shadows['shadow16']}>
              <Button style={styles.marginBetweenComponentsWithShadow}>Button with shadow16</Button>
            </Shadow>
            <View>
              <Button style={styles.marginBetweenComponentsWithShadow}>Button without shadow</Button>
            </View>
          </View>
        )} */}
      </View>
    );
  } else {
    return (
      <View style={stackStyle}>
        <Text>Shadows not implemented on this platform at this time</Text>
      </View>
    );
  }
};
