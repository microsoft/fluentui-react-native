import * as React from 'react';
import { FlatList, View, ViewStyle, StyleSheet, ColorValue } from 'react-native';
import { useTheme, Theme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { commonTestStyles } from '../Common/styles';
import { Button, PrimaryButton, Text, StealthButton } from '@fluentui/react-native';
import { THEME_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

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

const Panel: React.FunctionComponent = () => {
  const [disabled, setDisabled] = React.useState(false);
  const onClick = React.useCallback(() => setDisabled(!disabled), [disabled, setDisabled]);
  const themedStyles = getThemedStyles(useTheme());
  return (
    <View style={[commonTestStyles.view, themedStyles.stackStyle]}>
      <PrimaryButton onClick={onClick} content="Primary Button" disabled={disabled} />
      <Button onClick={onClick} content="Default Button" disabled={disabled} />
      <StealthButton onClick={onClick} content="Stealth Button" disabled={disabled} />
      <Text testID={THEME_TESTPAGE}>This is a text element</Text>
      <Button onClick={onClick} content="This button has longer text" disabled={disabled} />
    </View>
  );
};

const getSwatchColorStyle = (name: string, color: ColorValue): ViewStyle => {
  styles[name] = styles[name] || { backgroundColor: color };
  return styles[name];
};

type SemanticColorProps = { color: ColorValue; name: string };
const SemanticColor: React.FunctionComponent<SemanticColorProps> = (p: SemanticColorProps) => {
  const themedStyles = getThemedStyles(useTheme());
  return (
    <View style={styles.swatchItem}>
      <View style={[getSwatchColorStyle(p.name, p.color), themedStyles.swatch]} />
      <Text>{p.name}</Text>
    </View>
  );
};

const SwatchList: React.FunctionComponent = () => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);
  const palette = theme.colors;

  const aggregator = React.useCallback(
    (key: string) => {
      return { key: key + ' (' + (palette[key] as string) + ')', color: palette[key] };
    },
    [palette],
  );

  const flattenArray = React.useCallback(() => {
    return Object.keys(palette)
      .sort()
      .map(aggregator);
  }, [palette, aggregator]);

  const paletteAsArray = React.useMemo(flattenArray, [flattenArray]);
  const renderSwatch = React.useCallback(({ item }) => {
    const { color, key } = item;
    return <SemanticColor key={key} color={color} name={key} />;
  }, []);
  return (
    <View style={[commonTestStyles.view]}>
      <Text>getHostSettingsWin32(theme: ITheme).palette</Text>
      <View style={themedStyles.stackStyle}>
        <FlatList data={paletteAsArray} renderItem={renderSwatch} />
      </View>
    </View>
  );
};

const themeSections: TestSection[] = [
  {
    name: 'Component Examples',
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
    androidStatus: 'Backlog',
  };

  const description =
    'The entire color palette of the controls is themeable. We provide a set of sensible defaults, but you can override all colors individually.';

  return <Test name="Theme Test" description={description} sections={themeSections} status={status} />;
};
