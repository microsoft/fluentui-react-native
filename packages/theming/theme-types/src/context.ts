import * as React from 'react';

import type { Theme } from './Theme.types';

export const ThemeContext = React.createContext<Theme>(undefined);
export const useTheme = () => React.useContext(ThemeContext);
