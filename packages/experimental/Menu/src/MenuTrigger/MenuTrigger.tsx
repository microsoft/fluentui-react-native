import React from 'react';
import { stagedComponent } from '@fluentui-react-native/framework';
import { menuTriggerName, MenuTriggerProps } from './MenuTrigger.types';
import { useMenuTrigger } from './useMenuTrigger';

export const MenuTrigger = stagedComponent((props: MenuTriggerProps) => {
  const state = useMenuTrigger(props);

  return (_rest: MenuTriggerProps, children: React.ReactNode) => {
    const childrenArray = React.Children.toArray(children) as React.ReactElement[];

    if (__DEV__) {
      if (childrenArray.length !== 1) {
        console.log('Only expecting one child for MenuTrigger');
      }
    }

    const child = childrenArray[0];
    const revised = React.cloneElement(child, state);

    return <>{revised}</>;
  };
});
MenuTrigger.displayName = menuTriggerName;

export default MenuTrigger;
