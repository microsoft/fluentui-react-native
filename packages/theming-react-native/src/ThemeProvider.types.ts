import { INativeThemeRegistry } from './INativeTheme';

export interface IThemeProviderProps extends React.PropsWithChildren<{}> {
  themeName?: string;
  themeRegistry?: INativeThemeRegistry;
}
