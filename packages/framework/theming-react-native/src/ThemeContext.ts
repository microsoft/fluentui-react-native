import * as React from 'react';
import { ThemeRegistry } from './Theme.types';
import { ThemeContext } from '@uifabricshared/theming-ramp';
export { ThemeContext } from '@uifabricshared/theming-ramp';

export const useTheme = () => React.useContext(ThemeContext);

export const ThemeRegistryContext = React.createContext<ThemeRegistry>(undefined);
export const useThemeRegistry = () => React.useContext(ThemeRegistryContext);
