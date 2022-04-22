import React from 'react';
import { stagedComponent } from '@fluentui-react-native/framework';
import { menuTriggerName, MenuTriggerProps } from './MenuTrigger.types';

export const MenuTrigger = stagedComponent((_props: MenuTriggerProps) => {
  return (_rest: MenuTriggerProps, children: React.ReactNode) => {
    return <>{children}</>;
  };
});
MenuTrigger.displayName = menuTriggerName;

export default MenuTrigger;
