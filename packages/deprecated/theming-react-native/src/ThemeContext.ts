import * as React from 'react';

import type { ThemeRegistry } from './Theme.types';
/**
 * @deprecated
 */
export { ThemeContext, useTheme } from '@uifabricshared/theming-ramp';

/**
 * @deprecated
 */
export const ThemeRegistryContext = React.createContext<ThemeRegistry>(undefined);
/**
 * @deprecated
 */
export const useThemeRegistry = () => React.useContext(ThemeRegistryContext);
