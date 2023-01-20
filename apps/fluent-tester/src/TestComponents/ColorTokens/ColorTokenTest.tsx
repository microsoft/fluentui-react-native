import * as React from 'react';
import { View, ViewStyle, StyleSheet, ColorValue } from 'react-native';
import { useTheme, Theme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { createOfficeAliasTokens } from '@fluentui-react-native/win32-theme';
import { createAliasTokens } from '@fluentui-react-native/default-theme';
import { commonTestStyles } from '../Common/styles';
import { Text } from '@fluentui/react-native';
import { Test, TestSection, PlatformStatus } from '../Test';
import { COLORTOKENS_TEST_COMPONENT, COLORTOKEN_TESTPAGE } from '../../../../E2E/src/ColorTokens/consts';
import { testProps } from '../Common/TestProps';

const getThemedStyles = themedStyleSheet((theme: Theme) => {
  return {
    swatch: {
      width: 80,
      height: 20,
      marginRight: 5,
      borderWidth: 2,
      borderColor: theme.colors.bodyText,
    },
  };
});

const styles = StyleSheet.create({
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  stackStyle: {
    borderWidth: 2,
    padding: 12,
    margin: 8,
  },
});

const getSwatchColorStyle = (colorName: string, colorValue: ColorValue): ViewStyle => {
  styles[colorName] = styles[colorName] || { backgroundColor: colorValue };
  return styles[colorName];
};

type ColorTokenProps = { colorValue: ColorValue; colorName: string };
const ColorToken: React.FunctionComponent<ColorTokenProps> = (p: ColorTokenProps) => {
  if (p.colorValue === undefined) {
    console.warn('Color token ' + p.colorName + ' is undefined');
  }

  const themedStyles = getThemedStyles(useTheme());
  return (
    <View style={styles.swatchItem}>
      <View
        style={[getSwatchColorStyle(p.colorName, p.colorValue), themedStyles.swatch]}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(COLORTOKENS_TEST_COMPONENT)}
      />
      <View>
        <Text>{p.colorName + ' (' + p.colorValue?.toString() + ')'}</Text>
      </View>
    </View>
  );
};

const AliasColorTokensSwatchList: React.FunctionComponent = () => {
  const theme = useTheme();

  const isOfficeTheme =
    theme.name === 'White' ||
    theme.name === 'Colorful' ||
    theme.name === 'DarkGray' ||
    theme.name === 'Black' ||
    theme.name === 'HighContrast';

  const aliasColorTokens = isOfficeTheme
    ? createOfficeAliasTokens(theme.name)
    : createAliasTokens(getCurrentAppearance(theme.host.appearance, 'light'));

  const aggregator = React.useCallback(
    (colorName: string) => {
      return { colorName: colorName, colorValue: aliasColorTokens[colorName] };
    },
    [aliasColorTokens],
  );

  const flattenArray = React.useCallback(() => {
    return Object.keys(aliasColorTokens).map(aggregator);
  }, [aliasColorTokens, aggregator]);

  const aliasColorTokensAsArray = React.useMemo(flattenArray, [flattenArray]);

  const renderSwatch = React.useCallback((item) => {
    const { colorName, colorValue } = item;
    return <ColorToken key={colorName} colorName={colorName} colorValue={colorValue} />;
  }, []);

  return (
    <View style={commonTestStyles.view}>
      <View style={styles.stackStyle}>{aliasColorTokensAsArray.map((item) => renderSwatch(item))}</View>
    </View>
  );
};

const themeSections: TestSection[] = [
  {
    name: 'Alias Color Tokens',
    testID: COLORTOKEN_TESTPAGE,
    component: () => <AliasColorTokensSwatchList />,
  },
];

export const ColorTokensTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Backlog',
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Experimental',
  };

  const description = 'Alias and global tokens given from token pipeline. Used to style components.';

  return <Test name="Color Tokens Test" description={description} sections={themeSections} status={status} />;
};
