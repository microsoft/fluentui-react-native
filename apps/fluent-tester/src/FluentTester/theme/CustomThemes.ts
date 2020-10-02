import { PartialTheme, Theme } from '@fluentui-react-native/framework';
import { ThemeReference } from '@fluentui-react-native/theme';
import { createFluentTheme } from './createFluentTheme';
import { getOfficeThemeRecipes, OfficeBrand } from './getOfficeTheme';

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

export const testerTheme = new ThemeReference(createFluentTheme({ paletteName: 'TaskPane' }), {});

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
