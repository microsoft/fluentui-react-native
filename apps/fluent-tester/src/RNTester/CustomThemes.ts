import { IPartialTheme, ITheme, createPlatformThemeRegistry, ThemeRegistry, ThemingModuleHelper } from '@uifabricshared/theming-react-native';
import { IProcessTheme } from '@uifabricshared/theme-registry';

const caterpillarBlackTheme: IPartialTheme = {
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
        color: '#000'
      },
      _overrides: {
        hovered: {
          tokens: {
            backgroundColor: '#111',
            color: '#fff'
          }
        },
        pressed: {
          tokens: {
            backgroundColor: '#eee',
            color: '#111'
          }
        }
      }
    }
  }
};

const caterpillarColorfulTheme: IPartialTheme = {
  components: {
    Button: {
      tokens: {
        borderWidth: 0,
        backgroundColor: '#111',
        color: '#fff'
      },
      _overrides: {
        hovered: {
          tokens: {
            backgroundColor: '#ffcd11',
            color: '#000'
          }
        },
        pressed: {
          tokens: {
            backgroundColor: '#eee',
            color: '#111'
          }
        }
      }
    }
  }
};

const caterpillarTheme: IProcessTheme<ITheme, IPartialTheme> = (t: ITheme) => {
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

// const brandColors = {
//   Word: { App1: '#E3ECFA', App2: '#A5B9D1', App3: '#7DA3C6', App4: '#4A78B0', App5: '#3C65A4', App6: '#2B579A', App7: '#124078', App8: '#002050' },
//   Excel: { App1: '#E9F5EE', App2: '#9FCDB3', App3: '#6EB38A', App4: '#4E9668', App5: '#3F8159', App6: '#217346', App7: '#0E5C2F', App8: '#004B1C' },
//   Powerpoint: { App1: '#FCF0ED', App2: '#FDC9B5', App3: '#ED9583', App4: '#E86E58', App5: '#C75033', App6: '#B7472A', App7: '#A92B1A', App8: '#740912' },
//   Outlook: { App1: '#CCE3F5', App2: '#B3D6F2', App3: '#69AFE5', App4: '#2488D8', App5: '#0078D7', App6: '#106EBE', App7: '#1664A7', App8: '#135995' },
// };

// This IProcessTheme takes the parent theme and shims in the brand colors selected in the RadioGroup
const getFakeBrandTheme = (brand: string) => {
  return (theme: ITheme) => {
    if (brand === 'Office' || theme === undefined) {
      return {};
    }

    // const brandValues = Object.values(theme.host.colors);
    // const brandedTheme = { colors: {}, host: { palette: {} } };
    // Object.keys(theme.colors).forEach((value: string) => {
    //   if (typeof theme.colors[value] === 'string') {
    //     const index = brandValues.indexOf(theme.colors[value].toString());
    //     if (index !== -1) brandedTheme.colors[value] = brandColors[brand][index];
    //   }
    // });

    // const hostThemeSettings = getHostSettingsWin32(theme);
    // if (hostThemeSettings === undefined) return brandedTheme;

    // Object.keys(hostThemeSettings.palette).forEach((value: string) => {
    //   const index = brandValues.indexOf(hostThemeSettings.palette[value].toString());
    //   if (index !== -1) brandedTheme.host.palette[value] = brandColors[brand][index];
    // });
    return {};//brandedTheme;
  };
}

export const customRegistry: ThemeRegistry = createPlatformThemeRegistry('TaskPane');

// this applies the shim to the default theme
customRegistry.setTheme(getFakeBrandTheme('Office'));
// this registers platform white colors
customRegistry.setTheme(ThemingModuleHelper.getPlatformThemeDefinition('WhiteColors'), 'RealWhiteColors');
// this applies the shim to the white colors theme
customRegistry.setTheme(getFakeBrandTheme('Office'), 'WhiteColors', 'RealWhiteColors');


export function setAppColors(app: string) {
  customRegistry.setTheme(getFakeBrandTheme(app));
  customRegistry.setTheme(getFakeBrandTheme(app), 'WhiteColors', 'RealWhiteColors');
}

export function registerThemes(): void {
  customRegistry.setTheme(caterpillarTheme, 'Caterpillar');
}
