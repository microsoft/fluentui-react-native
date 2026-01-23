import * as React from 'react';
import type { ColorValue, ViewStyle } from 'react-native';
import { Text as TextRN, View } from 'react-native';
import { StyleSheet } from 'react-native';

import { Text } from '@fluentui/react-native';
import { THEME_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { useFluentTheme } from '@fluentui-react-native/framework';
import type { Theme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';

import { commonTestStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

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

const styles = StyleSheet.create({
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  panel: {
    ...commonTestStyles.view,
    borderWidth: 2,
    padding: 12,
    margin: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  stackStyle: {
    borderWidth: 2,
    padding: 12,
    margin: 8,
  },
});

const Panel: React.FunctionComponent = () => {
  const theme = useFluentTheme();
  const themedStyles = getThemedStyles(theme);

  return (
    <View>
      <Text style={{ color: theme.colors.buttonBackgroundChecked }}>buttonBackgroundChecked styled text</Text>

      <Text style={{ color: theme.colors.neutralForeground1 }}>neutralForeground1 styled text</Text>

      <Text style={{ color: theme.colors.hostColorPink }}>hostColorPink styled text</Text>

      <Text style={{ color: theme.colors.hostColorButtonBackground }}>hostColorButtonBackground styled text</Text>

      <Text style={{ color: theme.colors.hostColorBrandText }}>hostColorBrandText styled text</Text>

      <TextRN style={{ color: theme.colors.yellowBrandColor }}>yellowBrandColor styled text</TextRN>

      <TextRN style={themedStyles.swatch}>Styled RN Text</TextRN>
    </View>
  );
};

const getSwatchColorStyle = (name: string, color: ColorValue): ViewStyle => {
  styles[name] = styles[name] || { backgroundColor: color };
  return styles[name];
};

type SemanticColorProps = { color: ColorValue; name: string };
const SemanticColor: React.FunctionComponent<SemanticColorProps> = (p: SemanticColorProps) => {
  const themedStyles = getThemedStyles(useFluentTheme());
  return (
    <View style={styles.swatchItem}>
      <View style={[getSwatchColorStyle(p.name, p.color), themedStyles.swatch]} />
      <Text>{p.name}</Text>
    </View>
  );
};

const SwatchList: React.FunctionComponent = () => {
  const theme = useFluentTheme();
  const palette = theme.colors;

  const aggregator = React.useCallback(
    (key: string) => {
      return { key: key + ' (' + (palette[key] as string) + ')', color: palette[key] };
    },
    [palette],
  );

  const flattenArray = React.useCallback(() => {
    return Object.keys(palette).sort().map(aggregator);
  }, [palette, aggregator]);

  const paletteAsArray = React.useMemo(flattenArray, [flattenArray]);
  const renderSwatch = React.useCallback((item) => {
    const { color, key } = item;
    return <SemanticColor key={key} color={color} name={key} />;
  }, []);
  return (
    <View style={commonTestStyles.view}>
      <Text>getColorsAndroid(theme: ITheme).palette</Text>
      <View style={styles.stackStyle}>{paletteAsArray.map((item) => renderSwatch(item))}</View>
    </View>
  );
};
const themeSections: TestSection[] = [
  {
    name: 'Component Examples',
    testID: THEME_TESTPAGE,
    component: Panel,
  },
  {
    name: 'Theme.colors',
    component: () => <SwatchList />,
  },
];

export const ThemeTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Beta',
  };

  const description =
    'The entire color palette of the controls is themeable. We provide a set of sensible defaults, but you can override all colors individually.';

  return <Test name="Theme Test" description={description} sections={themeSections} status={status} />;
};
