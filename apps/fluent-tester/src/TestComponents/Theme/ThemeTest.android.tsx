import * as React from 'react';
import { Theme, useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { THEME_TESTPAGE } from '../../../../E2E/src/Theme/consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Text, View } from 'react-native';

import { useFluentTheme } from '@fluentui-react-native/framework'

const getThemedStyles = themedStyleSheet((theme: Theme) => {
  return {
    swatch: {
      color: theme.colors.neutralForeground1,
    },
    rootView: {
      backgroundColor: theme.colors.brandBackground
    },
  };
});

const Panel: React.FunctionComponent = () => {
  const theme = useFluentTheme();
  const theme2 = useTheme();
  const themedStyles = getThemedStyles(theme);

  return (
    <View>
      <Text
        style={{ color: theme.colors.buttonBackground }}>Overriden buttonBackground color.</Text>
      <Text
        style={{ color: theme.colors.neutralBackground1 }}>Overriden color access in theme.</Text>
      <Text
        style={{ color: theme.colors.myCustomeHostColor }}>Custom background Color myCustomeHostColor</Text>

      <Text style={{ color: theme2.colors.myCustomBackgroundColor }} >myCustomBackgroundColor styled tex</Text>
      <Text style={{ color: theme2.colors.hostBrandColor }} >hostBrandColor styled tex</Text>
      <Text style={{ color: theme2.colors.yellowBrandColor }} >yellowBrandColor styled tex</Text>

      <Text style={themedStyles.swatch} >Styled Text</Text>

      {/* <Text style={{ fontVariant: theme.typography.variants.body1 }}> RN Text </Text>
        // The style types are not 1-1 for typography, so no straight way to map.
      */}
    </View >

  );
};


const themeSections: TestSection[] = [
  {
    name: 'Component Examples',
    testID: THEME_TESTPAGE,
    component: Panel,
  }
];

export const ThemeTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    'The entire color palette of the controls is themeable. We provide a set of sensible defaults, but you can override all colors individually.';

  return <Test name="Theme Test" description={description} sections={themeSections} status={status} />;
};