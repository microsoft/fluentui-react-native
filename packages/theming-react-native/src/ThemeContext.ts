import * as React from 'react';
import { ThemeContext } from './ThemeLayer';
import { INativeThemeRegistry } from './INativeTheme.types';

export const useTheme = () => React.useContext(ThemeContext);

export const ThemeRegistryContext = React.createContext<INativeThemeRegistry>(undefined);
export const useThemeRegistry = () => React.useContext(ThemeRegistryContext);
