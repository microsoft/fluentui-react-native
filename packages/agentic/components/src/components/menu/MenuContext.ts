import * as React from 'react';
import type { MenuScope } from './menu.controller';

export const MenuContext = React.createContext<MenuScope | undefined>(undefined);
