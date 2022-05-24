import React from 'react';

export const MenuTriggerContext = React.createContext<boolean>(false);

export const MenuTriggerProvider = MenuTriggerContext.Provider;
export const useMenuTriggerContext = () => React.useContext(MenuTriggerContext);
