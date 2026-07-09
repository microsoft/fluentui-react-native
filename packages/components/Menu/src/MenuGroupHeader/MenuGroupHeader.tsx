/** @jsxImportSource @fluentui-react-native/framework-base */
import { compose } from '@fluentui-react-native/framework';
import { mergeProps } from '@fluentui-react-native/framework-base';
import type { UseSlots } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './MenuGroupHeader.styling';
import type { MenuGroupHeaderProps, MenuGroupHeaderType } from './MenuGroupHeader.types';
import { menuGroupHeaderName } from './MenuGroupHeader.types';
import { directComponent } from '@fluentui-react-native/framework-base';

export const MenuGroupHeader = compose<MenuGroupHeaderType>({
  displayName: menuGroupHeaderName,
  ...stylingSettings,
  slots: {
    root: Text,
  },
  useRender: (userProps: MenuGroupHeaderProps, useSlots: UseSlots<MenuGroupHeaderType>) => {
    const Slots = useSlots(userProps);

    return directComponent(({ children, ...final }: MenuGroupHeaderProps) => {
      const { ...mergedProps } = mergeProps(userProps, final);

      return (
        <Slots.root accessible={userProps.accessible} {...mergedProps}>
          {children}
        </Slots.root>
      );
    });
  },
});
