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
    <View style={themedStyles.rootView}>
      <Text
        style={{ color: theme.colors.neutralForeground1, fontSize: 30 }}>RN Text</Text>
      {/* Expected this to show blue text, but just showed normal RN default style text */}
      <Text style={themedStyles.swatch} >Styled Text</Text>

      <Text style={{ color: theme2.colors.brandStroke1}} >Styled Text</Text>


      {/* <Text style={{ fontVariant: theme.typography.variants.body1 }}> RN Text </Text> */}
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
