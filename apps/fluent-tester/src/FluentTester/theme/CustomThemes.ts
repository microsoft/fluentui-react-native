import { OfficePalette, PartialTheme, Theme } from '@fluentui-react-native/framework';
import { ThemeRecipe, ThemeReference } from '@fluentui-react-native/theme';
import { createFluentTheme, usingOfficeTheme } from './createFluentTheme';
import { createPartialOfficeTheme, fallbackOfficeModule } from '@fluentui-react-native/win32-theme';

const caterpillarBlackTheme: PartialTheme = {
  // colors: {
  //   buttonBackground: '#ffcd11',
  //   buttonBackgroundHovered: '#111',
  //   buttonBackgroundPressed: '#eee',
  //   buttonText: '#000',
  //   buttonTextPressed: '#111',
  //   buttonTextHovered: '#fff',
  // },
  components: {
    Button: {
      tokens: {
        borderWidth: 0,
        backgroundColor: '#ffcd11',
        color: '#000',
      },
      _overrides: {
        hovered: {
          tokens: {
            backgroundColor: '#111',
            color: '#fff',
          },
        },
        pressed: {
          tokens: {
            backgroundColor: '#eee',
            color: '#111',
          },
        },
      },
    },
  },
};

const caterpillarColorfulTheme: PartialTheme = {
  components: {
    Button: {
      tokens: {
        borderWidth: 0,
        backgroundColor: '#111',
        color: '#fff',
      },
      _overrides: {
        hovered: {
          tokens: {
            backgroundColor: '#ffcd11',
            color: '#000',
          },
        },
        pressed: {
          tokens: {
            backgroundColor: '#eee',
            color: '#111',
          },
        },
      },
    },
  },
};

const caterpillarTheme = (t: Theme) => {
  switch (t.name) {
    case 'Black':
      return caterpillarBlackTheme;
    case 'Colorful':
      return caterpillarColorfulTheme;
    case 'White':
    case 'DarkGray':
    default:
      return {}; // same as as the parent `t`.
  }
};

export type OfficeBrand = 'Office' | 'Word' | 'Excel' | 'Powerpoint' | 'Outlook';
type BrandRampKey = 'App1' | 'App2' | 'App3' | 'App4' | 'App5' | 'App6' | 'App7' | 'App8';
type BrandRamps = { [K in OfficeBrand]: { [J in BrandRampKey]: string } };

const brandColors: BrandRamps = {
  Office: {
    App1: '#fff7f0',
    App2: '#fbdfd0',
    App3: '#f7bfa0',
    App4: '#f29f71',
    App5: '#ea6115',
    App6: '#d83b01',
    App7: '#a22c01',
    App8: '#6c1e01',
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
  },
};

const themingModule = usingOfficeTheme ? fallbackOfficeModule : undefined;
const officeBase = themingModule
  ? createPartialOfficeTheme(themingModule, 'WhiteColors', themingModule.getPalette('RealWhiteColors') as OfficePalette)
  : {};

// This IProcessTheme takes the parent theme and shims in the brand colors selected in the RadioGroup
export function getOfficeThemeRecipes(brand?: OfficeBrand): ThemeRecipe<Theme, PartialTheme>[] {
  return [
    officeBase,
    () => {
      const ramp = brand && brandColors[brand];
      return ramp
        ? {
            colors: {
              successBackground: ramp.App6,
              buttonBackgroundHovered: ramp.App1,
              buttonBackgroundPressed: ramp.App2,
              buttonBorderFocused: ramp.App2,
              primaryButtonBackground: ramp.App6,
              primaryButtonBackgroundHovered: ramp.App4,
              primaryButtonBackgroundPressed: ramp.App7,
              primaryButtonBorder: ramp.App7,
              primaryButtonBorderFocused: ramp.App7,
              accentButtonBackground: ramp.App6,
              actionLinkHovered: ramp.App5,
              link: ramp.App6,
              linkHovered: ramp.App7,
              linkPressed: ramp.App8,
            },
          }
        : {};
    },
  ];
}

export const testerTheme = new ThemeReference(createFluentTheme(), {});

export function switchTestTheme(primary?: string, sub?: string): void {
  switch (primary) {
    case 'Office':
      testerTheme.update(...getOfficeThemeRecipes(sub as OfficeBrand));
      break;
    case 'Caterpillar':
      testerTheme.update(caterpillarTheme);
      break;
    default:
      testerTheme.update({});
  }
}
