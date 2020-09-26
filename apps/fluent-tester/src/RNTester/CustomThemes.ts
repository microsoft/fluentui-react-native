import { IPartialTheme, ITheme, createPlatformThemeRegistry, ThemeRegistry, getHostSettingsWin32, ThemingModuleHelper } from '@uifabricshared/theming-react-native';
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

const brandColors = {
  Word: ['#E3ECFA', '#A5B9D1', '#7DA3C6', '#4A78B0', '#3C65A4', '#2B579A', '#124078', '#002050'],
  Excel: ['#E9F5EE', '#9FCDB3', '#6EB38A', '#4E9668', '#3F8159', '#217346', '#0E5C2F', '#004B1C'],
  Powerpoint: ['#FCF0ED', '#FDC9B5', '#ED9583', '#E86E58', '#C75033', '#B7472A', '#A92B1A', '#740912'],
  Outlook: ['#CCE3F5', '#B3D6F2', '#69AFE5', '#2488D8', '#0078D7', '#106EBE', '#1664A7', '#135995'],
};

// This IProcessTheme takes the parent theme and shims in the brand colors selected in the RadioGroup
const getFakeBrandTheme = (brand: string) => {
  return (theme: ITheme) => {
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
