import * as React from 'react';

import type { MenuTriggerProps } from './MenuTrigger.types';
import { menuTriggerName } from './MenuTrigger.types';
import { useMenuTrigger } from './useMenuTrigger';
import { MenuTriggerProvider } from '../context/menuTriggerContext';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { extractProps } from '@fluentui-react-native/framework-base';

export const MenuTrigger: React.FunctionComponent<MenuTriggerProps> = (props: MenuTriggerProps) => {
  if (__DEV__) {
    if (!React.Children.only(props.children)) {
      console.warn('Only expecting one child for MenuTrigger');
    }
  }

  const childrenProps = extractProps<IViewProps>(props.children);
  const menuTrigger = useMenuTrigger(childrenProps);

  // In order to properly support accessibility without erasing props set on the
  // child component which may affect accessibility, we need to modify the
  // state in the inner render so we can access the child component and its props.
  const revised = React.cloneElement(props.children, {
    ...(childrenProps?.tooltip && { alwaysShowToolTip: true }),
    ...menuTrigger.props,
  });

  return <MenuTriggerProvider value={menuTrigger.hasSubmenu}>{revised}</MenuTriggerProvider>;
};
MenuTrigger.displayName = menuTriggerName;

export default MenuTrigger;
