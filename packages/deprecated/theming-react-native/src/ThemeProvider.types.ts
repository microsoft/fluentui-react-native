/* eslint-disable */

import { ThemeRegistry } from './Theme.types';

/**
 * @deprecated
 */
export interface IThemeProviderProps extends React.PropsWithChildren<{}> {
  theme?: string;
  registry?: ThemeRegistry;
}
