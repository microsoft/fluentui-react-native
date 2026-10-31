import * as React from 'react';

/** True inside a Popover surface, so a nested Popover can be diagnosed. */
export const PopoverSurfaceContext = React.createContext(false);
