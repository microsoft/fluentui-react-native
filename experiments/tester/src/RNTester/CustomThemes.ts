import { IPartialTheme, createPlatformThemeRegistry, ThemeRegistry } from '@uifabricshared/theming-react-native';

const caterpillarTheme: IPartialTheme = {
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

export const customRegistry: ThemeRegistry = createPlatformThemeRegistry('TaskPane');

export function registerThemes(): void {
  customRegistry.setTheme(caterpillarTheme, 'Caterpillar');
}
