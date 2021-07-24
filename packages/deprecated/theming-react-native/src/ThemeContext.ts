import * as React from 'react';
import { ThemeRegistry } from './Theme.types';
export { ThemeContext, useTheme } from '@uifabricshared/theming-ramp';

export const ThemeRegistryContext = React.createContext<ThemeRegistry>(undefined);
export const useThemeRegistry = () => React.useContext(ThemeRegistryContext);
