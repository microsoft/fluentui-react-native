import type * as React from 'react';
import type { View } from 'react-native';

import type { Slot } from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';
import type { ButtonProps, ButtonSlots, ButtonState } from '../button/button.types';
import type { MenuPopupState, MenuStateProps, MenuSurfaceProps } from '../menu/menu.types';

export type MenuButtonSlots = Pick<ButtonSlots, 'root' | 'content' | 'icon'>;

export type MenuButtonProps = Omit<ButtonProps, 'selected' | 'shape' | 'iconPosition' | 'selectedIcon'> &
  MenuStateProps & {
    /** Props for the menu surface. Its name defaults to the trigger's string content. */
    menu?: MenuSurfaceProps;
    /** MenuItem list rows and Dividers. */
    children: React.ReactNode;
  };

export type MenuButtonState = ButtonState &
  MenuPopupState & {
    /** The private, always-present down chevron. */
    chevron: Slot<typeof Icon>;
    /** The trigger's focus target and popup anchor bindings, composed for the root. */
    triggerRef: React.RefCallback<React.ComponentRef<typeof View>>;
  };
