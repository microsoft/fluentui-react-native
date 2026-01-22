import type { PartialTheme, Theme } from '@fluentui-react-native/theme-types';
import { getCurrentBrandAliasTokens } from '@fluentui-react-native/win32-theme';

export type OfficeBrand = 'Default' | 'Office' | 'Word' | 'Excel' | 'Powerpoint' | 'Outlook';
type BrandRampKey =
  | 'App1'
  | 'App2'
  | 'App3'
  | 'App4'
  | 'App5'
  | 'App6'
  | 'App7'
  | 'App8'
  | 'AppTint40'
  | 'AppTint30'
  | 'AppTint20'
  | 'AppTint10'
  | 'AppPrimary'
  | 'AppShade10'
  | 'AppShade20'
  | 'AppShade30';
type BrandRamps = { [K in OfficeBrand]: { [J in BrandRampKey]: string } };

const brandColors: BrandRamps = {
  /**
   * default brand just passes through what is in the theme
   * */
  Default: undefined,
  /**
   * Office brands, applied via a small App color ramp
   */
  Office: {
    App1: '#fff7f0',
    App2: '#fbdfd0',
    App3: '#f7bfa0',
    App4: '#f29f71',
    App5: '#ea6115',
    App6: '#d83b01',
    App7: '#a22c01',
    App8: '#6c1e01',
    AppTint40: '#f9dcd1',
    AppTint30: '#f4beaa',
    AppTint20: '#e8825d',
    AppTint10: '#dd4f1b',
    AppPrimary: '#d83b01',
    AppShade10: '#c33400',
    AppShade20: '#a52c00',
    AppShade30: '#792000',
  },
  Word: {
    App1: '#E3ECFA',
    App2: '#A5B9D1',
    App3: '#7DA3C6',
    App4: '#4A78B0',
    App5: '#3C65A4',
    App6: '#2B579A',
    App7: '#124078',
    App8: '#002050',
    AppTint40: '#D2E0F4',
    AppTint30: '#AEC6EB',
    AppTint20: '#6794D7',
    AppTint10: '#2E6AC5',
    AppPrimary: '#185ABD',
    AppShade10: '#1651AA',
    AppShade20: '#13458F',
    AppShade30: '#0E336A',
  },
  Excel: {
    App1: '#E9F5EE',
    App2: '#9FCDB3',
    App3: '#6EB38A',
    App4: '#4E9668',
    App5: '#3F8159',
    App6: '#217346',
    App7: '#0E5C2F',
    App8: '#004B1C',
    AppTint40: '#CAEAD8',
    AppTint30: '#A0D8B9',
    AppTint20: '#55B17E',
    AppTint10: '#218D51',
    AppPrimary: '#107C41',
    AppShade10: '#0F703B',
    AppShade20: '#0C5F32',
    AppShade30: '#094624',
  },
  Powerpoint: {
    App1: '#FCF0ED',
    App2: '#FDC9B5',
    App3: '#ED9583',
    App4: '#E86E58',
    App5: '#C75033',
    App6: '#B7472A',
    App7: '#A92B1A',
    App8: '#740912',
    AppTint40: '#F6DBD4',
    AppTint30: '#EDBCB0',
    AppTint20: '#DC816A',
    AppTint10: '#CB5031',
    AppPrimary: '#C43E1C',
    AppShade10: '#B13719',
    AppShade20: '#952F15',
    AppShade30: '#6E220F',
  },
  Outlook: {
    App1: '#CCE3F5',
    App2: '#B3D6F2',
    App3: '#69AFE5',
    App4: '#2488D8',
    App5: '#0078D7',
    App6: '#106EBE',
    App7: '#1664A7',
    App8: '#135995',
    AppTint40: '#C7E0F4',
    AppTint30: '#6CB8F6',
    AppTint20: '#3AA0F3',
    AppTint10: '#2899F5',
    AppPrimary: '#0078D7',
    AppShade10: '#106EBE',
    AppShade20: '#005A9E',
    AppShade30: '#004C87',
  },
};

export const brandOptions = Object.keys(brandColors).map((brand) => ({ label: brand, value: brand }));

export const applyBrand = (parent: Theme, currentBrand: string): PartialTheme => {
  if (parent.name === 'HighContrast') {
    return {};
  }

  const ramp = brandColors[currentBrand];
  return ramp
    ? {
        colors: {
          inputFocusBorderAlt: ramp.App4,
          buttonBackgroundHovered: ramp.App1,
          buttonBackgroundPressed: ramp.App2,
          buttonBorderFocused: ramp.App2,
          primaryButtonBackground: ramp.App6,
          primaryButtonBackgroundHovered: ramp.App7,
          primaryButtonBackgroundPressed: ramp.App8,
          primaryButtonBorder: ramp.App7,
          primaryButtonBorderFocused: ramp.App7,
          accentButtonBackground: ramp.App6,
          link: ramp.App6,
          linkHovered: ramp.App7,
          linkPressed: ramp.App8,
          defaultHoveredBackground: ramp.App1,
          defaultHoveredBorder: ramp.App2,
          defaultFocusedBackground: ramp.App1,
          defaultFocusedBorder: ramp.App2,
          defaultPressedBackground: ramp.App2,
          defaultPressedBorder: ramp.App5,
          brandedBackground: ramp.App6,
          defaultCheckedHoveredBackground: ramp.App1,
          ...getCurrentBrandAliasTokens(parent.name, ramp.AppPrimary),
        },
      }
    : {};
};
