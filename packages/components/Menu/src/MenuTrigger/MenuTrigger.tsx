import * as React from 'react';
import { menuTriggerName, MenuTriggerProps } from './MenuTrigger.types';
import { useMenuTrigger } from './useMenuTrigger';
import { MenuTriggerProvider } from '../context/menuTriggerContext';

export const MenuTrigger: React.FunctionComponent<MenuTriggerProps> = (props: MenuTriggerProps) => {
  if (__DEV__) {
    if (!React.Children.only(props.children)) {
      console.warn('Only expecting one child for MenuTrigger');
    }
  }

  const menuTrigger = useMenuTrigger(props.children.props);

  // In order to properly support accessibility without erasing props set on the
  // child component which may affect accessibility, we need to modify the
  // state in the inner render so we can access the child component and its props.
  const revised = React.cloneElement(props.children, menuTrigger.props);

  return <MenuTriggerProvider value={menuTrigger.hasSubmenu}>{revised}</MenuTriggerProvider>;
};
MenuTrigger.displayName = menuTriggerName;

export default MenuTrigger;
