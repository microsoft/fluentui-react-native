import { ThemeRegistry } from './Theme.types';

export interface IThemeProviderProps extends React.PropsWithChildren<{}> {
  themeName?: string;
  themeRegistry?: ThemeRegistry;
}
