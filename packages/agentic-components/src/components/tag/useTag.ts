import * as React from 'react';
import { Pressable, Text } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, usePressableState, useSlot } from '@fluentui-react-native/framework-base';

import { Icon } from '../../primitives/icon/icon';
import type { TagProps, TagState } from './tag.types';

const defaultDismissIcon = {
  fontSource: {
    codepoint: 0x2715,
    fontFamily: 'Arial',
  },
};

export function useTag_unstable(props: TagProps): TagState {
  const {
    accessibilityState,
    appearance = 'secondary',
    content: contentProp,
    dismiss = true,
    dismissIcon: dismissIconProp,
    disabled = false,
    layout = 'iconAndText',
    leadingIcon: leadingIconProp,
    shape = 'rounded',
    size = 'medium',
    style: userStyle,
    ...rest
  } = props;

  const hasContent = contentProp !== undefined && contentProp !== null;
  const hasLeadingIcon = leadingIconProp !== undefined && leadingIconProp !== null;
  const iconOnly = layout === 'iconOnly';
  const showDismissIcon = dismiss;

  React.useEffect(() => {
    if (__DEV__ && iconOnly && !rest.accessibilityLabel) {
      console.warn('Tag: icon-only tags require an accessibilityLabel that describes the tag.');
    }
    if (__DEV__ && iconOnly && !hasLeadingIcon) {
      console.warn('Tag: icon-only tags require a leading icon.');
    }
  }, [hasLeadingIcon, iconOnly, rest.accessibilityLabel]);

  const themeState = useThemeState();
  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessibilityRole: 'button',
    accessibilityState: {
      ...accessibilityState,
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: rest.focusable ?? !disabled,
  });

  const root = useSlot(Pressable, pressableProps);
  const content = useOptionalSlot(Text, iconOnly ? null : contentProp, {
    defaultProps: { children: 'Tag text' },
    renderByDefault: true,
  });
  const leadingIcon = useOptionalSlot(Icon, leadingIconProp, {
    renderByDefault: false,
  });
  const dismissIcon = useOptionalSlot(Icon, showDismissIcon ? dismissIconProp : null, {
    defaultProps: defaultDismissIcon,
    renderByDefault: true,
  });

  return {
    root,
    content,
    leadingIcon,
    dismissIcon,
    disabled,
    appearance,
    layout,
    size,
    shape,
    dismiss,
    hasContent,
    hasLeadingIcon,
    iconOnly,
    showDismissIcon,
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
