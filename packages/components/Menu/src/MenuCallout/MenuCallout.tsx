import { Callout } from '@fluentui-react-native/callout';
import { mergeProps, phasedComponent, directComponent } from '@fluentui-react-native/framework-base';

import type { MenuCalloutProps } from './MenuCallout.types';
import { menuCalloutName } from './MenuCallout.types';

export const MenuCallout = phasedComponent((props: MenuCalloutProps) => {
  return directComponent<MenuCalloutProps>((innerProps: MenuCalloutProps) => {
    const { children, ...rest } = innerProps;
    const mergedProps = mergeProps(props, rest);

    return <Callout {...mergedProps}>{children}</Callout>;
  });
});

MenuCallout.displayName = menuCalloutName;

export default MenuCallout;
