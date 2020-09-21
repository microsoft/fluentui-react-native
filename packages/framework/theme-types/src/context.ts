import * as React from 'react';
import { ITheme } from './Theme.types';

export const ThemeContext = React.createContext<ITheme>(undefined);
export const useTheme = () => React.useContext(ThemeContext);
