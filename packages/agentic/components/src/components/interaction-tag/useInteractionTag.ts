import * as React from 'react';
import { Pressable, View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useOptionalSlot, usePressableState, useSlot } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { semanticIconSources } from '../../common/iconSources';
import { Icon } from '../../primitives/icon/icon';
import { Avatar } from '../avatar/avatar';
import { Text } from '../text/text';
import type { InteractionTagActionProps, InteractionTagProps, InteractionTagState } from './interaction-tag.types';

const defaultDismissIcon = {
  fontSource: semanticIconSources.dismiss,
};

const dividerProps = {
  ...hiddenFromAccessibilityProps,
  collapsable: false,
  focusable: false,
  pointerEvents: 'none',
} as const;

const emptyActionProps: InteractionTagActionProps = {};

export function useInteractionTag_unstable(props: InteractionTagProps): InteractionTagState {
  const {
    appearance = 'secondary',
    avatar: avatarProp,
    content: contentProp,
    disabled = false,
    dismiss: dismissProp,
    dismissIcon: dismissIconProp,
    layout = 'iconAndText',
    leadingIcon: leadingIconProp,
    primaryAction: primaryActionProp,
    ref: rootRef,
    shape = 'rounded',
    size = 'medium',
    style: userStyle,
    ...rest
  } = props;

  const hasAvatar = avatarProp !== undefined && avatarProp !== null;
  const hasLeadingIcon = leadingIconProp !== undefined && leadingIconProp !== null;
  const hasLeadingContent = hasAvatar || hasLeadingIcon;
  const hasContent = contentProp !== undefined && contentProp !== null;
  const iconOnly = layout === 'iconOnly';

  const { as: primaryAs, ref: primaryRef, ...primaryRest } = primaryActionProp ?? emptyActionProps;
  const { as: dismissAs, ref: dismissRef, ...dismissRest } = dismissProp ?? emptyActionProps;

  useAccessibilityLabelWarning({
    accessibilityLabel: primaryRest.accessibilityLabel ?? primaryRest['aria-label'],
    accessibilityLabelledBy: primaryRest.accessibilityLabelledBy ?? primaryRest['aria-labelledby'],
    componentName: 'InteractionTag',
    requireLabel: iconOnly,
    warning: 'InteractionTag: icon-only tags require an accessibilityLabel on the primaryAction slot.',
  });

  useAccessibilityLabelWarning({
    accessibilityLabel: dismissRest.accessibilityLabel ?? dismissRest['aria-label'],
    accessibilityLabelledBy: dismissRest.accessibilityLabelledBy ?? dismissRest['aria-labelledby'],
    componentName: 'InteractionTag',
    requireLabel: true,
    warning: 'InteractionTag: the dismiss slot requires an accessibilityLabel that names the tag it removes.',
  });

  React.useEffect(() => {
    if (__DEV__ && iconOnly && !hasLeadingContent) {
      console.warn('InteractionTag: icon-only tags require a leading icon or an avatar.');
    }
  }, [hasLeadingContent, iconOnly]);

  React.useEffect(() => {
    if (__DEV__ && hasAvatar && hasLeadingIcon) {
      console.warn('InteractionTag: provide a leading icon or an avatar, not both. The avatar is used.');
    }
  }, [hasAvatar, hasLeadingIcon]);

  const themeState = useThemeState();

  const [primaryPressableProps, primaryState] = usePressableState({
    ...primaryRest,
    accessibilityRole: 'button',
    accessibilityState: {
      ...primaryRest.accessibilityState,
      disabled,
    },
    accessible: primaryRest.accessible ?? true,
    disabled,
    focusable: primaryRest.focusable ?? !disabled,
  });

  const [dismissPressableProps, dismissState] = usePressableState({
    ...dismissRest,
    accessibilityRole: 'button',
    accessibilityState: {
      ...dismissRest.accessibilityState,
      disabled,
    },
    accessible: dismissRest.accessible ?? true,
    disabled,
    focusable: dismissRest.focusable ?? !disabled,
  });

  const root = useSlot(View, { ...rest, ref: rootRef });
  const primaryAction = useSlot(Pressable, { ...primaryPressableProps, as: primaryAs, ref: primaryRef });
  const divider = useSlot(View, dividerProps);
  const dismiss = useSlot(Pressable, { ...dismissPressableProps, as: dismissAs, ref: dismissRef });

  const avatar = useOptionalSlot(Avatar, avatarProp, { renderByDefault: false });
  const leadingIcon = useOptionalSlot(Icon, hasAvatar ? null : leadingIconProp, { renderByDefault: false });
  const content = useOptionalSlot(Text, iconOnly ? null : contentProp, {
    defaultProps: { children: 'Tag text' },
    renderByDefault: true,
  });
  const dismissIcon = useOptionalSlot(Icon, dismissIconProp, {
    defaultProps: defaultDismissIcon,
    renderByDefault: true,
  });

  return {
    root,
    primaryAction,
    avatar,
    leadingIcon,
    content,
    divider,
    dismiss,
    dismissIcon,
    disabled,
    layout,
    shape,
    size,
    dismissState,
    hasAvatar,
    hasContent,
    hasLeadingContent,
    hasLeadingIcon,
    iconOnly,
    primaryState,
    userStyle,
    ...themeState,
    appearance,
  };
}
