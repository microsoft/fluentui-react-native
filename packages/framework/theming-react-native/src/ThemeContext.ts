import * as React from 'react';
import { ThemeRegistry, ITheme } from './Theme.types';

export const ThemeContext = React.createContext<ITheme>(undefined);
export const useTheme = () => React.useContext(ThemeContext);

export const ThemeRegistryContext = React.createContext<ThemeRegistry>(undefined);
export const useThemeRegistry = () => React.useContext(ThemeRegistryContext);
