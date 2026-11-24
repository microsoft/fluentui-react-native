import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import type { AvatarProps } from '../avatar/avatar.types';
import { Text } from '../text/text';
import type { AvatarGroupMember, AvatarGroupOverflow, AvatarGroupProps, AvatarGroupSize, AvatarGroupState } from './avatar-group.types';

function defaultFormatOverflow(count: number): AvatarGroupOverflow {
  const text = `+${count.toLocaleString()}`;
  return { text, accessibilityLabel: text };
}

function avatarProps(avatar: AvatarGroupMember['avatar'], size: AvatarGroupSize): AvatarProps {
  const common = { size, ...hiddenFromAccessibilityProps, pointerEvents: 'none' } as const;
  if (avatar.image !== undefined) return { ...common, image: { source: avatar.image } };
  if (avatar.initials !== undefined) return { ...common, initials: avatar.initials };
  return { ...common, icon: avatar.icon };
}

export function useAvatarGroup_unstable({
  members = [],
  size = 40,
  decorative,
  accessibilityLabel,
  formatOverflow = defaultFormatOverflow,
  style: userStyle,
  ...rootProps
}: AvatarGroupProps): AvatarGroupState {
  const validMembers = members.filter((member) => member.key.trim() && member.name.trim());
  const visible = validMembers.length > 5 ? validMembers.slice(0, 4) : validMembers;
  const overflowCount = validMembers.length - visible.length;
  const overflowMarker = overflowCount ? formatOverflow(overflowCount) : undefined;
  const summary = [accessibilityLabel, ...visible.map((member) => member.name), overflowMarker?.accessibilityLabel]
    .filter((part) => part?.trim())
    .join(', ');
  return {
    ...useThemeState(),
    size,
    userStyle,
    visibleMembers: visible.map(({ key, avatar }) => ({ key, avatar: avatarProps(avatar, size) })),
    root: useSlot(View, {
      ...rootProps,
      ...(decorative || !summary ? hiddenFromAccessibilityProps : { accessible: true, role: 'group', accessibilityLabel: summary }),
      focusable: false,
    }),
    overflow: useOptionalSlot(View, overflowMarker ? { ...hiddenFromAccessibilityProps, pointerEvents: 'none' } : null),
    count: useOptionalSlot(Text, overflowMarker ? { ...hiddenFromAccessibilityProps, children: overflowMarker.text } : null),
  };
}
