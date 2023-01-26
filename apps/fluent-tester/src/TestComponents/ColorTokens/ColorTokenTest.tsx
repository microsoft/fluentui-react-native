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
import { globalTokens } from '@fluentui-react-native/theme-tokens';

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
    console.log('Color token ' + p.colorName + ' is undefined');
  }

  const themedStyles = getThemedStyles(useTheme());
  return (
    <View style={styles.swatchItem}>
      <View
        style={[getSwatchColorStyle(p.colorName, p.colorValue), themedStyles.swatch]}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(COLORTOKENS_TEST_COMPONENT)}
      />
      <Text>{p.colorName + ' (' + p.colorValue?.toString() + ')'}</Text>
    </View>
  );
};

const getSwatch = (item) => {
  const { colorValue, colorName } = item;
  return <ColorToken key={colorName} colorValue={colorValue} colorName={colorName} />;
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

  const renderSwatch = React.useCallback(getSwatch, []);

  return (
    <View style={commonTestStyles.view}>
      <View style={styles.stackStyle}>{aliasColorTokensAsArray.map((item) => renderSwatch(item))}</View>
    </View>
  );
};

const globalNeutralColorNamesSortedDarkToLight = Object.keys(globalTokens.color)
  .filter((globalColorName) => globalColorName.includes('grey') || globalColorName === 'black' || globalColorName === 'white')
  .sort((color1, color2) => {
    const color1hex = globalTokens.color[color1];
    const color2hex = globalTokens.color[color2];
    return color1hex === color2hex ? 0 : color1hex < color2hex ? -1 : 1;
  });

const globalNeutralColorTokensAsArray = globalNeutralColorNamesSortedDarkToLight.map((colorName: string) => {
  return {
    colorName: colorName,
    colorValue: globalTokens.color[colorName],
  };
});

const GlobalNeutralColorTokensSwatchList: React.FunctionComponent = () => {
  const renderSwatch = React.useCallback(getSwatch, []);

  return (
    <View style={commonTestStyles.view}>
      <View style={styles.stackStyle}>{renderSwatch(globalNeutralColorTokensAsArray[0])}</View>
    </View>
  );
};

const globalSharedColorNames = Object.keys(globalTokens.color).filter((key) => globalTokens.color[key].primary !== undefined);
const globalSharedColorVariantsSortedDarkToLight = Object.keys(globalTokens.color.red).sort((color1, color2) => {
  const color1hex = globalTokens.color.red[color1];
  const color2hex = globalTokens.color.red[color2];
  return color1hex === color2hex ? 0 : color1hex < color2hex ? -1 : 1;
});
const globalSharedColorTokensAsArray = globalSharedColorNames
  .map((sharedColorName) => {
    return globalSharedColorVariantsSortedDarkToLight.map((variant) => {
      return {
        colorName: sharedColorName + '.' + variant,
        colorValue: globalTokens.color[sharedColorName][variant],
      };
    });
  })
  .reduce((accumulator, sharedColor) => accumulator.concat(sharedColor));

const GlobalSharedColorTokensSwatchList: React.FunctionComponent = () => {
  const renderSwatch = React.useCallback(getSwatch, []);

  return (
    <View style={commonTestStyles.view}>
      <View style={styles.stackStyle}>{globalSharedColorTokensAsArray.map((item) => renderSwatch(item))}</View>
    </View>
  );
};

const themeSections: TestSection[] = [
  {
    name: 'Alias Color Tokens',
    testID: COLORTOKEN_TESTPAGE,
    component: () => <AliasColorTokensSwatchList />,
  },
  {
    name: 'Global Color Tokens - Neutral Colors',
    component: () => <GlobalNeutralColorTokensSwatchList />,
  },
  {
    name: 'Global Color Tokens - Shared Colors',
    component: () => <GlobalSharedColorTokensSwatchList />,
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
