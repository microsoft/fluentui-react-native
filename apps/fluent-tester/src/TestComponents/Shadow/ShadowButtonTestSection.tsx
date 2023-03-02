import * as React from 'react';
import { Platform, View, StyleSheet, Pressable } from 'react-native';

import { FAB, Text } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Shadow } from '@fluentui-react-native/experimental-shadow';
import { useTheme } from '@fluentui-react-native/framework';

// import { shadowTestPageStyles } from './ShadowTestPageStyles';
import { iconProps } from '../Common/iconExamples';
import { stackStyle } from '../Common/styles';

const styles = StyleSheet.create({ marginBetweenComponentsWithShadow: { margin: 10 } });

const CustomFABNoShadow = FAB.customize({ shadowToken: undefined });
const CustomFABShadow64 = FAB.customize({
  shadowToken: { ambient: { x: 0, y: 0, blur: 8, color: '#00000033' }, key: { x: 0, y: 32, blur: 64, color: '#0000003d' } },
});

const platformSupportsShadow = Platform.OS !== 'android';
const platformSupportsFAB = Platform.OS === 'ios' || Platform.OS === 'android';

export const ShadowBlockTest: React.FunctionComponent = () => {
  const t = useTheme();
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  return (
    <Shadow shadowToken={hovered ? t.shadows.shadow8 : undefined}>
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <View style={{ borderWidth: focused ? 3 : 1, borderColor: 'black', backgroundColor: 'red', margin: 10, width: 300 }}>
          <Text>hover = {hovered.valueOf().toString()}</Text>
          <Text>focus = {focused.valueOf().toString()}</Text>
        </View>
      </Pressable>
    </Shadow>
  );
};

export const ShadowButtonTestSection: React.FunctionComponent = () => {
  const t = useTheme();

  if (platformSupportsShadow) {
    return (
      <View>
        <ShadowBlockTest />
        <ShadowBlockTest />
        <ShadowBlockTest />
        {platformSupportsShadow && platformSupportsFAB && (
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
        )}
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
