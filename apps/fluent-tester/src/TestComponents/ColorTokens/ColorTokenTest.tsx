import * as React from 'react';
import type { ViewStyle, ColorValue } from 'react-native';
import { View, StyleSheet, Platform } from 'react-native';

import { Text, ToggleButton } from '@fluentui/react-native';
import { createAliasTokens } from '@fluentui-react-native/default-theme';
import { COLORTOKENS_TEST_COMPONENT, COLORTOKEN_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import type { SvgIconProps } from '@fluentui-react-native/icon';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { Theme } from '@fluentui-react-native/theme-types';
import { useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { createOfficeAliasTokens } from '@fluentui-react-native/win32-theme';
import type { SvgProps } from 'react-native-svg';
import Svg, { G, Path } from 'react-native-svg';

import { commonTestStyles } from '../Common/styles';
import { testProps } from '../Common/TestProps';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

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
  statusView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 8,
  },
  // Needed to ensure that with the button is toggled on, the top of the newly shown
  // content is visible so the user knows to scroll down
  toggleButtonAreaPadding: { paddingBottom: 10 },
  colorDescriptionStyle: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  colorDescriptionNamePadding: { paddingRight: 5 },
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
      <View style={styles.colorDescriptionStyle}>
        <Text style={styles.colorDescriptionNamePadding}>{p.colorName}</Text>
        <Text>{'(' + p.colorValue?.toString() + ')'}</Text>
      </View>
    </View>
  );
};

const getSwatch = (item) => {
  const { colorValue, colorName } = item;
  return <ColorToken key={colorName} colorValue={colorValue} colorName={colorName} />;
};

/// Alias color tokens

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

/// Global color tokens - neutral

const globalNeutralColorNamesSortedDarkToLight = Object.keys(globalTokens.color)
  .filter((globalColorName) => globalColorName.includes('grey') || globalColorName === 'black' || globalColorName === 'white')
  .sort((color1, color2) => {
    const color1hex = globalTokens.color[color1];
    const color2hex = globalTokens.color[color2];
    // All global color tokens are hex based colors, so we can make the assumption that ordering the hex values alphabetically
    // will order the colors from dark to light
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
      <View style={styles.stackStyle}>{globalNeutralColorTokensAsArray.map((item) => renderSwatch(item))}</View>
    </View>
  );
};

/// Global color tokens - shared

const globalSharedColorNames = Object.keys(globalTokens.color).filter((key) => globalTokens.color[key].primary !== undefined);
const globalSharedColorVariantsSortedDarkToLight = Object.keys(globalTokens.color.red).sort((color1, color2) => {
  const color1hex = globalTokens.color.red[color1];
  const color2hex = globalTokens.color.red[color2];
  // All global color tokens are hex based colors, so we can make the assumption that ordering the hex values alphabetically
  // will order the colors from dark to light
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

  const [showGlobalSharedColors, setShowGlobalSharedColors] = React.useState(false);

  const toggleSvg: React.FunctionComponent<SvgProps> = () => {
    const plusPath =
      'M6.5 1.75C6.5 1.33579 6.16421 1 5.75 1C5.33579 1 5 1.33579 5 1.75V5H1.75C1.33579 5 1 5.33579 1 5.75C1 6.16421 1.33579 6.5 1.75 6.5H5V9.75C5 10.1642 5.33579 10.5 5.75 10.5C6.16421 10.5 6.5 10.1642 6.5 9.75V6.5H9.75C10.1642 6.5 10.5 6.16421 10.5 5.75C10.5 5.33579 10.1642 5 9.75 5H6.5V1.75Z';
    const minusPath = 'M2.75 5.25h6.5s0.75 0 0.75 0.75v0s0 0.75 -0.75 0.75h-6.5s-0.75 0 -0.75 -0.75v0s0 -0.75 0.75 -0.75';

    const path = showGlobalSharedColors ? minusPath : plusPath;
    return (
      <Svg>
        <G>
          <Path d={path} fill="black" />
        </G>
      </Svg>
    );
  };

  const svgProps: SvgIconProps = { src: toggleSvg };
  const plusCodepoint = 0x2795;
  const minusCodepoint = 0x2796;
  const fontIconProps = {
    codepoint: showGlobalSharedColors ? minusCodepoint : plusCodepoint,
    fontSize: 10,
  };
  const toggleIconProps = Platform.OS === 'windows' ? { fontSource: fontIconProps } : { svgSource: svgProps, width: 12, height: 12 };

  return (
    <View style={styles.toggleButtonAreaPadding}>
      <View style={styles.statusView}>
        <Text variant="subheaderStandard">Show color tokens</Text>
        <ToggleButton iconOnly={true} icon={toggleIconProps} onClick={() => setShowGlobalSharedColors(!showGlobalSharedColors)} />
      </View>
      {showGlobalSharedColors && (
        <View style={commonTestStyles.view}>
          <View style={styles.stackStyle}>{globalSharedColorTokensAsArray.map((item) => renderSwatch(item))}</View>
        </View>
      )}
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
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Backlog',
    androidStatus: 'Production',
  };

  const description = 'Alias and global tokens given from token pipeline. Used to style components.';

  return <Test name="Color Tokens Test" description={description} sections={themeSections} status={status} />;
};
