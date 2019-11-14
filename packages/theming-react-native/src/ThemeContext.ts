import * as React from 'react';
import { INativeThemeRegistry, IThemeContextType } from './INativeTheme.types';

export const ThemeContext = React.createContext<IThemeContextType>(undefined);
export const useTheme = () => React.useContext(ThemeContext);

export const ThemeRegistryContext = React.createContext<INativeThemeRegistry>(undefined);
export const useThemeRegistry = () => React.useContext(ThemeRegistryContext);
