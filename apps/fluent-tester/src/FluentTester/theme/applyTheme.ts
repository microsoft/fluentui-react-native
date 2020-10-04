import { OfficePalette, PartialTheme, Theme } from '@fluentui-react-native/framework';
import { createPartialOfficeTheme, getThemingModule } from '@fluentui-react-native/win32-theme';
import { testerTheme } from './CustomThemes';

export type ThemeNames = 'Fluent' | 'Office' | 'Caterpillar';

export const themeChoices = [
  { label: 'Fluent', value: 'Fluent' },
  { label: 'Office', value: 'Office' },
  { label: 'Caterpillar', value: 'Caterpillar' },
];

export function applyCaterpillarTheme(parent: Theme): PartialTheme {
  return parent.host?.appearance === 'dark'
    ? {
        colors: {
          buttonBackground: '#111111',
          buttonBackgroundHovered: '#ffcd11',
          buttonBackgroundPressed: '#eeeeee',
          buttonText: '#ffffff',
          buttonTextPressed: '#111111',
          buttonTextHovered: '#000000',
        },
        components: {
          Button: {
            borderWidth: 0,
            tokens: {
              borderWidth: 0,
            },
          },
        },
      }
    : {
        colors: {
          buttonBackground: '#ffcd11',
          buttonBackgroundHovered: '#111111',
          buttonBackgroundPressed: '#eeeeee',
          buttonText: '#000000',
          buttonTextPressed: '#111111',
          buttonTextHovered: '#ffffff',
        },
        components: {
          Button: {
            borderWidth: 0,
            tokens: {
              borderWidth: 0,
            },
          },
        },
      };
}

let currentTheme: ThemeNames = 'Fluent';

const themingModule = getThemingModule()[0];
const officeBase = themingModule
  ? createPartialOfficeTheme(themingModule, 'WhiteColors', themingModule.getPalette('WhiteColors') as OfficePalette)
  : {};

export function setCurrentTheme(newTheme: ThemeNames): void {
  currentTheme = newTheme;
  testerTheme.invalidate();
}

export function getCurrentTheme(): ThemeNames {
  return currentTheme;
}

export function applyTheme(parent: Theme): PartialTheme {
  switch (currentTheme) {
    case 'Office':
      return officeBase;
    case 'Caterpillar':
      return applyCaterpillarTheme(parent);
    default:
      return {};
  }
}
