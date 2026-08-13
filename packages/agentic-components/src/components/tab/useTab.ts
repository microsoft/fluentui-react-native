import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { PressableProps } from 'react-native';

import { usePressableState, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import type { TabProps, TabState } from './tab.types';
import { Icon } from '../../primitives/icon/icon';

/**
 * Hook to create the state for a Tab component.
 */
export function useTab_unstable(props: TabProps): TabState {
  const {
    accessibilityState,
    controls,
    content: contentProp,
    disabled = false,
    icon: iconProp,
    layout = 'iconAndText',
    selected = false,
    selectedIcon: selectedIconProp,
    style: userStyle,
    ...rest
  } = props;
  const iconOnly = layout === 'iconOnly';

  React.useEffect(() => {
    if (__DEV__ && iconOnly && !rest.accessibilityLabel) {
      console.warn('Tab: icon-only tabs require an accessibilityLabel that describes the content panel.');
    }
  }, [iconOnly, rest.accessibilityLabel]);

  const themeState = useThemeState();
  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessibilityRole: 'tab',
    accessibilityState: {
      ...accessibilityState,
      disabled,
      selected,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: rest.focusable ?? !disabled,
  });

  const root = useSlot(
    Pressable,
    {
      ...pressableProps,
      accessibilityControls: controls,
    } as PressableProps & { accessibilityControls: string },
  );
  const icon = useOptionalSlot(Icon, iconProp);
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp);
  const contentSlotProp = iconOnly ? null : contentProp ?? 'Tab';
  const content = useOptionalSlot(Text, contentSlotProp);
  const contentHidden = useOptionalSlot(Text, contentSlotProp);
  const contentContainer = useOptionalSlot(View, iconOnly ? null : {});

  return {
    root,
    icon,
    selectedIcon,
    content,
    contentHidden,
    contentContainer,
    disabled,
    layout,
    controls,
    selected,
    iconOnly,
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
