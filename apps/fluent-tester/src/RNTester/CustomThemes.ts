import { IPartialTheme, ITheme, createPlatformThemeRegistry, ThemeRegistry } from '@uifabricshared/theming-react-native';
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

export const customRegistry: ThemeRegistry = createPlatformThemeRegistry('TaskPane');

export function registerThemes(): void {
  customRegistry.setTheme(caterpillarTheme, 'Caterpillar');
}
