/* eslint-disable */

import { ThemeRegistry } from './Theme.types';

export interface IThemeProviderProps extends React.PropsWithChildren<{}> {
  theme?: string;
  registry?: ThemeRegistry;
}
