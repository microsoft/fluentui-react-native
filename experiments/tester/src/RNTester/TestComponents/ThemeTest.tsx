import * as React from 'react';
import * as ReactNative from 'react-native';
import { getHostSettingsWin32, ThemeProvider, useTheme, IThemeDefinition } from '@uifabricshared/theming-react-native';
import { themedStyleSheet } from '@uifabricshared/themed-stylesheet';
import { commonTestStyles } from '../styles';
import { Button, PrimaryButton, Separator, StealthButton, Text, RadioGroup, RadioButton } from 'react-native-uifabric';
import { ITheme, IPartialTheme } from '@uifabricshared/theming-ramp';
import { customRegistry } from '../CustomThemes';

const Panel: React.FunctionComponent = () => {
  const [disabled, setDisabled] = React.useState(false);
  const onClick = React.useCallback(() => setDisabled(!disabled), [disabled, setDisabled]);
  const theme = useTheme();
  return (
    <ReactNative.View style={[commonTestStyles.viewStyle, commonTestStyles.stackStyle, { backgroundColor: theme.colors.background }]}>
      <PrimaryButton onClick={onClick} content="Primary Button" disabled={disabled} />
      <Button onClick={onClick} content="Default Button" disabled={disabled} />
      <StealthButton onClick={onClick} content="Stealth Button" disabled={disabled} />
      <Text>This is a text element</Text>
      <Button onClick={onClick} content="This button has longer text" disabled={disabled} />
    </ReactNative.View>
  );
};

let brand = 'Office';

const brandColors = {
  Word: ['#E3ECFA', '#A5B9D1', '#7DA3C6', '#4A78B0', '#3C65A4', '#2B579A', '#124078', '#002050'],
  Excel: ['#E9F5EE', '#9FCDB3', '#6EB38A', '#4E9668', '#3F8159', '#217346', '#0E5C2F', '#004B1C'],
  Powerpoint: ['#FCF0ED', '#FDC9B5', '#ED9583', '#E86E58', '#C75033', '#B7472A', '#A92B1A', '#740912'],
  Outlook: ['#CCE3F5', '#B3D6F2', '#69AFE5', '#2488D8', '#0078D7', '#106EBE', '#1664A7', '#135995']
};

const fakeBrandTheme: IThemeDefinition = (theme: ITheme): IPartialTheme => {
  if (brand === 'Office') return {};

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

customRegistry.setTheme(fakeBrandTheme, 'BrandedTheme');

const getThemedStyles = themedStyleSheet((theme: ITheme) => ({
  swatch: {
    width: 80,
    height: 20,
    marginRight: 5,
    borderWidth: 2,
    borderColor: theme.colors.bodyText
  },
  extraLargeStandardEmphasis: {
    color: theme['host'].palette.TextEmphasis,
    fontSize: theme.typography.sizes.xxLarge,
    fontWeight: theme.typography.weights.medium,
    fontFamily: theme.typography.families.primary
  } as ReactNative.TextStyle,
  largeStandard: {
    color: theme.colors.bodyText,
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.medium,
    fontFamily: theme.typography.families.primary,
    marginBottom: 5
  } as ReactNative.TextStyle
}));

const styles = ReactNative.StyleSheet.create({
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  }
});

const getSwatchColorStyle = (color: string): ReactNative.ViewStyle => {
  styles[color] = styles[color] || { backgroundColor: color };
  return styles[color];
};

type SemanticColorProps = { color: string; name: string };
const SemanticColor: React.FunctionComponent<SemanticColorProps> = (p: SemanticColorProps) => {
  const themedStyles = getThemedStyles(useTheme());
  return (
    <ReactNative.View style={styles.swatchItem}>
      <ReactNative.View style={[getSwatchColorStyle(p.color), themedStyles.swatch]} />
      <Text>{p.name}</Text>
    </ReactNative.View>
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
    <ReactNative.View style={[commonTestStyles.viewStyle, commonTestStyles.stackStyle]}>
      <Text style={themedStyles.largeStandard}>getHostSettingsWin32(theme: ITheme).palette</Text>
      <ReactNative.FlatList data={paletteAsArray} renderItem={renderSwatch} />
    </ReactNative.View>
  );
};

const ThemeTestInner: React.FunctionComponent = () => {
  const themedStyles = getThemedStyles(useTheme());
  const onAppChange = React.useCallback((app: string) => {
    brand = app;
    customRegistry.setTheme(fakeBrandTheme, 'BrandedTheme');
  }, []);
  return (
    <ReactNative.View>
      <RadioGroup label="Pick App Colors" onChange={onAppChange} defaultSelectedKey="Office">
        <RadioButton buttonKey="Office" content="Office" />
        {Object.keys(brandColors).map((app: string) => (
          <RadioButton key={app} buttonKey={app} content={app} />
        ))}
      </RadioGroup>
      <Text style={themedStyles.extraLargeStandardEmphasis}>Platform Theme</Text>
      <Separator />
      <Panel />
      <Text style={themedStyles.extraLargeStandardEmphasis}>Custom JS Theme</Text>
      <Separator />
      <ThemeProvider theme="Caterpillar">
        <Panel />
      </ThemeProvider>
      <Text style={themedStyles.extraLargeStandardEmphasis}>Host-specific Theme Settings</Text>
      <Separator />
      <SwatchList />
    </ReactNative.View>
  );
};

export const ThemeTest: React.FunctionComponent = () => {
  return (
    <ThemeProvider theme="BrandedTheme">
      <ThemeTestInner />
    </ThemeProvider>
  );
};
