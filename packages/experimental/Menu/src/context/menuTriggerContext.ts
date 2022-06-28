import React from 'react';

/**
 * This context keeps track of whether a trigger component is for a submenu.
 * This allows the trigger to show a submenu indicator.
 */
export const MenuTriggerContext = React.createContext<boolean>(false);

export const MenuTriggerProvider = MenuTriggerContext.Provider;
export const useMenuTriggerContext = () => React.useContext(MenuTriggerContext);
