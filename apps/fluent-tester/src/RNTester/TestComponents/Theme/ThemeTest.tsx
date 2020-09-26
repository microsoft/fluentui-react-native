import * as React from 'react';
import { FlatList, View, ViewStyle, TextStyle, Text, StyleSheet } from 'react-native';
import { getHostSettingsWin32, useTheme } from '@uifabricshared/theming-react-native';
import { themedStyleSheet } from '@uifabricshared/themed-stylesheet';
import { commonTestStyles } from '../Common/styles';
import { Button, PrimaryButton, StealthButton, Separator } from '@fluentui/react-native';
import { ITheme } from '@uifabricshared/theming-ramp';
import { THEME_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';


const getThemedStyles = themedStyleSheet((theme: ITheme) => {
  const hostSettings = getHostSettingsWin32(theme);
  return {
    swatch: {
      width: 80,
      height: 20,
      marginRight: 5,
      borderWidth: 2,
      borderColor: theme.colors.bodyText,
    },
    extraLargeStandardEmphasis: {
      color: hostSettings ? hostSettings.palette.TextEmphasis : theme.colors.bodyText,
      fontSize: theme.typography.sizes.header,
      fontWeight: theme.typography.weights.regular,
      fontFamily: theme.typography.families.primary,
    } as TextStyle,
    largeStandard: {
      color: theme.colors.bodyText,
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.regular,
      fontFamily: theme.typography.families.primary,
      marginBottom: 5,
    } as TextStyle,
    stackStyle: {
      borderWidth: 2,
      borderColor: theme.colors.focusBorder,
      padding: 12,
      margin: 8,
      backgroundColor: theme.colors.background,
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
      <Text>This is a text element</Text>
      <Button onClick={onClick} content="This button has longer text" disabled={disabled} />
    </View>
  );
};

const getSwatchColorStyle = (color: string): ViewStyle => {
  styles[color] = styles[color] || { backgroundColor: color };
  return styles[color];
};

type SemanticColorProps = { color: string; name: string };
const SemanticColor: React.FunctionComponent<SemanticColorProps> = (p: SemanticColorProps) => {
  const themedStyles = getThemedStyles(useTheme());
  return (
    <View style={styles.swatchItem}>
      <View style={[getSwatchColorStyle(p.color), themedStyles.swatch]} />
      <Text>{p.name}</Text>
    </View>
  );
};

const SwatchList: React.FunctionComponent<{ hostKey: string }> = ({ hostKey }: { hostKey: string }) => {
  const hostSettings = getHostSettingsWin32(useTheme());
  const themedStyles = getThemedStyles(useTheme());

  if (hostSettings === undefined) return <Text>Error</Text>;

  const aggregator = React.useCallback(
    (key: string) => {
      return { name: key + ' (' + hostSettings[hostKey][key] + ')', color: hostSettings[hostKey][key] };
    },
    [hostSettings[hostKey]]
  );

  const flattenArray = React.useCallback(() => {
    return Object.keys(hostSettings[hostKey]).sort().map(aggregator);
  }, [hostSettings[hostKey], aggregator]);

  const paletteAsArray = React.useMemo(flattenArray, [flattenArray]);
  const renderSwatch = React.useCallback(({ item }) => {
    const { color, name } = item;
    return <SemanticColor key={name} color={color} name={name} />;
  }, []);
  return (
    <View style={[commonTestStyles.view]}>
      <Text style={themedStyles.largeStandard}>getHostSettingsWin32(theme: ITheme).{hostKey}</Text>
      <View style={themedStyles.stackStyle}>
        <FlatList data={paletteAsArray} renderItem={renderSwatch} />
      </View>
    </View>
  );
};

const ThemeTestInner: React.FunctionComponent = () => {
  const themedStyles = getThemedStyles(useTheme());
  return (
    <View testID={THEME_TESTPAGE}>
      <Panel />
      <Text style={themedStyles.extraLargeStandardEmphasis}>Host-specific Theme Settings</Text>
      <Separator />
      <SwatchList hostKey="palette" />
      <SwatchList hostKey="colors" />
    </View>
  );
};

const themeSections: TestSection[] = [
  {
    name: 'Theme Test',
    component: ThemeTestInner,
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

  return (
    <Test name="Theme Test" description={description} sections={themeSections} status={status}></Test>
  );
};
