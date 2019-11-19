import { INativeThemeRegistry } from './INativeTheme.types';

export interface IThemeProviderProps extends React.PropsWithChildren<{}> {
  themeName?: string;
  themeRegistry?: INativeThemeRegistry;
}
