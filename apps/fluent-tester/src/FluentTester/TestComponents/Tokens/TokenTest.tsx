import * as React from 'react';
import { FlatList, View, ViewStyle, StyleSheet, ColorValue } from 'react-native';
import { useTheme, Theme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { createOfficeAliasTokens } from '@fluentui-react-native/win32-theme';
import { createAliasTokens } from '@fluentui-react-native/default-theme';
import { commonTestStyles } from '../Common/styles';
import { Text } from '@fluentui/react-native';
import { Test, TestSection, PlatformStatus } from '../Test';
import { TOKENS_TEST_COMPONENT, TOKEN_TESTPAGE } from './consts';

const getThemedStyles = themedStyleSheet((theme: Theme) => {
  return {
    swatch: {
      width: 80,
      height: 20,
      marginRight: 5,
      borderWidth: 2,
      borderColor: theme.colors.bodyText,
    },
    stackStyle: {
      borderWidth: 2,
      padding: 12,
      margin: 8,
    },
  };
});

const styles = StyleSheet.create({
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

const getSwatchColorStyle = (name: string, color: ColorValue): ViewStyle => {
  styles[name] = styles[name] || { backgroundColor: color };
  return styles[name];
};

type ColorTokenProps = { color: ColorValue; name: string };
const ColorToken: React.FunctionComponent<ColorTokenProps> = (p: ColorTokenProps) => {
  const themedStyles = getThemedStyles(useTheme());
  return (
    <View style={styles.swatchItem}>
      <View style={[getSwatchColorStyle(p.name, p.color), themedStyles.swatch]} testID={TOKENS_TEST_COMPONENT} />
      <Text>{p.name}</Text>
    </View>
  );
};

const AliasTokensSwatchList: React.FunctionComponent = () => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);
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
    (key: string) => {
      return { key: key + ' (' + (aliasColorTokens[key] as string) + ')', color: aliasColorTokens[key] };
    },
    [aliasColorTokens],
  );

  const flattenArray = React.useCallback(() => {
    return Object.keys(aliasColorTokens).map(aggregator);
  }, [aliasColorTokens, aggregator]);

  const aliasTokensAsArray = React.useMemo(flattenArray, [flattenArray]);
  const renderSwatch = React.useCallback(({ item }) => {
    const { color, key } = item;
    return <ColorToken key={key} color={color} name={key} />;
  }, []);
  return (
    <View style={[commonTestStyles.view]}>
      <Text>Alias Color Tokens from Token Pipeline</Text>
      <View style={themedStyles.stackStyle}>
        <FlatList data={aliasTokensAsArray} renderItem={renderSwatch} />
      </View>
    </View>
  );
};

const themeSections: TestSection[] = [
  {
    name: 'Alias Color Tokens',
    testID: TOKEN_TESTPAGE,
    component: () => <AliasTokensSwatchList />,
  },
];

export const TokenTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Alias tokens given from token pipeline. Currently values are pulled from web. Will be used to style components.';

  return <Test name="Token Test" description={description} sections={themeSections} status={status} />;
};
