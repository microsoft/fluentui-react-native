import * as React from 'react';
import { Theme, useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { THEME_TESTPAGE } from '../../../../E2E/src/Theme/consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Text as TextRN, View } from 'react-native';
import { Text } from '@fluentui/react-native';

import { useFluentTheme } from '@fluentui-react-native/framework';

const getThemedStyles = themedStyleSheet((theme: Theme) => {
  return {
    swatch: {
      color: theme.colors.neutralForeground1,
    },
    rootView: {
      backgroundColor: theme.colors.brandBackground,
    },
  };
});

const Panel: React.FunctionComponent = () => {
  const theme = useFluentTheme();
  const theme2 = useTheme();
  const themedStyles = getThemedStyles(theme);

  return (
    <View>
      <Text style={{ color: theme.colors.buttonBackgroundChecked }}>buttonBackgroundChecked styled text</Text>

      <Text style={{ color: theme.colors.neutralForeground1 }}>neutralForeground1 styled text</Text>

      <Text style={{ color: theme2.colors.hostColorPink }}>hostColorPink styled text</Text>

      <Text style={{ color: theme2.colors.hostColorButtonBackground }}>hostColorButtonBackground styled text</Text>

      <Text style={{ color: theme2.colors.hostColorBrandText }}>hostColorBrandText styled text</Text>

      <TextRN style={{ color: theme2.colors.yellowBrandColor }}>yellowBrandColor styled text</TextRN>

      <TextRN style={themedStyles.swatch}>Styled RN Text</TextRN>
    </View>
  );
};

const themeSections: TestSection[] = [
  {
    name: 'Component Examples',
    testID: THEME_TESTPAGE,
    component: Panel,
  },
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
