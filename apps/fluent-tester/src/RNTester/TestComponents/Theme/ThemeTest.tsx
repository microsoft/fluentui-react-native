import * as React from 'react';
import { FlatList, View, ViewStyle, TextStyle, Text, StyleSheet } from 'react-native';
import { getHostSettingsWin32, ThemeProvider, useTheme, IThemeDefinition, ThemingModuleHelper } from '@uifabricshared/theming-react-native';
import { themedStyleSheet } from '@uifabricshared/themed-stylesheet';
import { commonTestStyles } from '../Common/styles';
import { Button, PrimaryButton, StealthButton } from '@fluentui-react-native/button';
import { Separator } from '@fluentui-react-native/separator';
import { RadioGroup, RadioButton } from '@fluentui-react-native/radio-group';
import { ITheme, IPartialTheme } from '@uifabricshared/theming-ramp';
import { customRegistry } from './CustomThemes';
import { THEME_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

let brand = 'Office';

const brandColors = {
  Word: ['#E3ECFA', '#A5B9D1', '#7DA3C6', '#4A78B0', '#3C65A4', '#2B579A', '#124078', '#002050'],
  Excel: ['#E9F5EE', '#9FCDB3', '#6EB38A', '#4E9668', '#3F8159', '#217346', '#0E5C2F', '#004B1C'],
  Powerpoint: ['#FCF0ED', '#FDC9B5', '#ED9583', '#E86E58', '#C75033', '#B7472A', '#A92B1A', '#740912'],
  Outlook: ['#CCE3F5', '#B3D6F2', '#69AFE5', '#2488D8', '#0078D7', '#106EBE', '#1664A7', '#135995']
};

// This IProcessTheme takes the parent theme and shims in the brand colors selected in the RadioGroup
const fakeBrandTheme: IThemeDefinition = (theme: ITheme): IPartialTheme => {
  if (brand === 'Office') {
    return {};
  }

  const brandValues = theme.colors.brand.values;
  const brandedTheme = { colors: {}, host: { palette: {} } };
  Object.keys(theme.colors).forEach((value: string) => {
    if (typeof theme.colors[value] === 'string') {
      const index = brandValues.indexOf(theme.colors[value].toString());
      if (index !== -1) brandedTheme.colors[value] = brandColors[brand][index];
    }
  });

  const hostThemeSettings = getHostSettingsWin32(theme);
  if (hostThemeSettings === undefined) return brandedTheme;

  Object.keys(hostThemeSettings.palette).forEach((value: string) => {
    const index = brandValues.indexOf(hostThemeSettings.palette[value].toString());
    if (index !== -1) brandedTheme.host.palette[value] = brandColors[brand][index];
  });
  return brandedTheme;
};

// this applies the shim to the default theme
customRegistry.setTheme(fakeBrandTheme, 'Default');
// this registers platform white colors
customRegistry.setTheme(ThemingModuleHelper.getPlatformThemeDefinition('WhiteColors'), 'RealWhiteColors');
// this applies the shim to the white colors theme
customRegistry.setTheme(fakeBrandTheme, 'WhiteColors', 'RealWhiteColors');

const getThemedStyles = themedStyleSheet((theme: ITheme) => {
  const hostSettings = getHostSettingsWin32(theme);
  return {
    swatch: {
      width: 80,
      height: 20,
      marginRight: 5,
      borderWidth: 2,
      borderColor: theme.colors.bodyText
    },
    extraLargeStandardEmphasis: {
      color: hostSettings ? hostSettings.palette.TextEmphasis : theme.colors.bodyText,
      fontSize: theme.typography.sizes.header,
      fontWeight: theme.typography.weights.regular,
      fontFamily: theme.typography.families.primary
    } as TextStyle,
    largeStandard: {
      color: theme.colors.bodyText,
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.regular,
      fontFamily: theme.typography.families.primary,
      marginBottom: 5
    } as TextStyle,
    stackStyle: {
      borderWidth: 2,
      borderColor: theme.colors.focusBorder,
      padding: 12,
      margin: 8,
      backgroundColor: theme.colors.background
    }
  };
});

const styles = StyleSheet.create({
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  }
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

const SwatchList: React.FunctionComponent = () => {
  const hostSettings = getHostSettingsWin32(useTheme());
  const themedStyles = getThemedStyles(useTheme());

  if (hostSettings === undefined) return <Text>Error</Text>;

  const aggregator = React.useCallback(
    (key: string) => {
      return { name: key + ' (' + hostSettings.palette[key] + ')', color: hostSettings.palette[key] };
    },
    [hostSettings.palette]
  );

  const flattenArray = React.useCallback(() => {
    return Object.keys(hostSettings.palette)
      .sort()
      .map(aggregator);
  }, [hostSettings.palette, aggregator]);

  const paletteAsArray = React.useMemo(flattenArray, [flattenArray]);
  const renderSwatch = React.useCallback(({ item }) => {
    const { color, name } = item;
    return <SemanticColor key={name} color={color} name={name} />;
  }, []);
  return (
    <View style={[commonTestStyles.view]}>
      <Text style={themedStyles.largeStandard}>getHostSettingsWin32(theme: ITheme).palette</Text>
      <View style={themedStyles.stackStyle}>
        <FlatList data={paletteAsArray} renderItem={renderSwatch} />
      </View>
    </View>
  );
};

const ThemeTestInner: React.FunctionComponent = () => {
  const themedStyles = getThemedStyles(useTheme());
  const onAppChange = React.useCallback((app: string) => {
    brand = app;
    // Invalidate the DAG children of the shimmed brand colors
    customRegistry.setTheme(fakeBrandTheme, 'Default');
    customRegistry.setTheme(fakeBrandTheme, 'WhiteColors', 'RealWhiteColors');
  }, []);

  const [theme, setTheme] = React.useState('Default');
  return (
    <View>
      <Text style={themedStyles.extraLargeStandardEmphasis} testID={THEME_TESTPAGE}>
        Configure Theme
      </Text>
      <Separator />
      <View style={styles.pickerContainer}>
        <RadioGroup label="Pick App Colors" onChange={onAppChange} defaultSelectedKey="Office">
          <RadioButton buttonKey="Office" content="Office" />
          {Object.keys(brandColors).map((app: string) => (
            <RadioButton key={app} buttonKey={app} content={app} />
          ))}
        </RadioGroup>
        <Separator vertical />
        <RadioGroup label="Pick Theme" onChange={setTheme} defaultSelectedKey="Default">
          <RadioButton buttonKey="Default" content="Default (GrayB / TaskPane)" />
          <RadioButton buttonKey="Caterpillar" content="Caterpillar (Custom JS Theme)" />
          <RadioButton buttonKey="WhiteColors" content="WhiteColors (Platform Theme)" />
        </RadioGroup>
      </View>

      <Text style={themedStyles.extraLargeStandardEmphasis}>{theme + ' Theme'}</Text>
      <Separator />
      <ThemeProvider theme={theme}>
        <Panel />
      </ThemeProvider>

      <Text style={themedStyles.extraLargeStandardEmphasis}>Host-specific Theme Settings</Text>
      <Separator />
      <SwatchList />

    </View>
  );
};

const themeSections: TestSection[] = [
  {
    name: 'Theme Test',
    component: ThemeTestInner
  },
];

export const ThemeTest: React.FunctionComponent = () => {

  const status: PlatformStatus = {
    win32Status: 'beta',
    uwpStatus: 'experimental',
    iosStatus: 'experimental',
    macosStatus: 'experimental',
    androidStatus: 'backlog'
  }

  const description = 'The entire color palette of the controls is themeable. We provide a set of sensible defaults, but you can override all colors individually.'

  return (
    <ThemeProvider theme="Default">
      <Test name="Theme Test" description={description} sections={themeSections} status={status}></Test>
    </ThemeProvider>
  );
};
