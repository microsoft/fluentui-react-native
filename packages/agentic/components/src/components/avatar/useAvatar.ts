import * as React from 'react';
import { Image, View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useDevWarning, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';

import { hasAccessibleName } from '../../common/accessibility';
import { semanticIconSources } from '../../common/iconSources';
import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';
import type { AvatarProps, AvatarState } from './avatar.types';

const defaultAvatarIcon = {
  fontSource: semanticIconSources.person,
} as const;

function normalizeInitialsChildren(children: React.ReactNode, size: number): React.ReactNode {
  if (typeof children !== 'string' && typeof children !== 'number') {
    return children;
  }

  const normalized = String(children).trim().toUpperCase();
  if (normalized.length === 0) {
    return children;
  }

  return normalized.slice(0, size === 16 ? 1 : 2);
}

export function useAvatar_unstable(props: AvatarProps): AvatarState {
  const {
    accessibilityElementsHidden,
    accessibilityLabel,
    accessible,
    activityRing = false,
    icon: iconProp,
    image: imageProp,
    importantForAccessibility,
    initials: initialsProp,
    size = 40,
    style: userStyle,
    ...rest
  } = props;

  const hasImage = imageProp !== null && imageProp !== undefined;
  const hasIcon = iconProp !== null && iconProp !== undefined;
  const hasInitials = initialsProp !== null && initialsProp !== undefined;
  const contentMode = hasImage ? 'image' : hasInitials ? 'initials' : 'icon';
  const isInformative = hasAccessibleName({ accessibilityLabel, ...rest });
  const isAccessible = accessible ?? isInformative;

  useDevWarning([hasImage, hasIcon, hasInitials].filter(Boolean).length > 1, 'Avatar: provide only one content mode at a time.');

  const themeState = useThemeState();
  const root = useSlot(View, {
    ...rest,
    accessible: isAccessible,
    accessibilityElementsHidden: isAccessible ? accessibilityElementsHidden : true,
    accessibilityLabel,
    role: 'img',
    importantForAccessibility: isAccessible ? importantForAccessibility : 'no-hide-descendants',
  });

  const image = useOptionalSlot(Image, contentMode === 'image' ? imageProp : null);
  const icon = useOptionalSlot(Icon, contentMode === 'icon' ? iconProp : null, {
    defaultProps: defaultAvatarIcon,
    renderByDefault: true,
  });
  const initials = useOptionalSlot(Text, contentMode === 'initials' ? initialsProp : null, {
    defaultProps: { children: 'AB' },
    transform: (props) => ({
      ...props,
      children: normalizeInitialsChildren(props.children, size),
    }),
  });

  return {
    root,
    image,
    icon,
    initials,
    activityRing,
    contentMode,
    size,
    userStyle,
    ...themeState,
  };
}
