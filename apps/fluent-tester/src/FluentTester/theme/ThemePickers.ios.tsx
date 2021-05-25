import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@fluentui-react-native/experimental-button';
import { MenuAction, MenuView } from '@react-native-menu/menu';
import { testerTheme } from './CustomThemes';
import { themeChoices, ThemeNames } from './applyTheme';
import { brandOptions, OfficeBrand } from './applyBrand';
import { Theme, useTheme } from '@fluentui-react-native/framework';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';

export const themePickerStyles = themedStyleSheet((t: Theme) => {
  // picker, pickerItem, dropdown used in iOS dark mode
  return {
    pickerRoot: {
      flexDirection: 'row',
    },
    picker: {
      flexDirection: 'column',
      alignItems: 'center',
      padding: 4,
      flexShrink: 0,
    },
    pickerItem: {
      color: t.colors.bodyText,
    },
    dropdown: {
      height: 200,
      width: 90,
      fontSize: 12,
    },
  };
});

export const ThemePickers: React.FunctionComponent<{}> = () => {
  const themedStyles = themePickerStyles(useTheme());

  const onBrandChange = React.useCallback((newBrand: string) => {
    testerTheme.brand = newBrand as OfficeBrand;
  }, []);

  const onThemeSelected = React.useCallback((newTheme: string) => {
    testerTheme.themeName = newTheme as ThemeNames;
  }, []);

  const themeMenuOptions: MenuAction[] = themeChoices.map((themeChoice) => ({
    id: themeChoice.value,
    title: themeChoice.label,
    state: testerTheme.themeName === themeChoice.value ? 'on' : 'off',
  }));

  const brandMenuOptions: MenuAction[] = brandOptions.map((brandOption) => ({
    id: brandOption.value,
    title: brandOption.label,
    state: testerTheme.brand === brandOption.value ? 'on' : 'off',
  }));

  return (
    <View style={themedStyles.pickerRoot}>
      <MenuView
        title="Theme"
        onPressAction={({ nativeEvent }) => {
          onThemeSelected(nativeEvent.event);
        }}
        actions={themeMenuOptions}
      >
        <Button ghost content="Theme" />
      </MenuView>
      <MenuView
        title="Brand"
        onPressAction={({ nativeEvent }) => {
          onBrandChange(nativeEvent.event);
        }}
        actions={brandMenuOptions}
      >
        <Button ghost content="Brand" />
      </MenuView>
    </View>
  );
};
