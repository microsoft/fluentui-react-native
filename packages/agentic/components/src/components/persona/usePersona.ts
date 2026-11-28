import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Avatar } from '../avatar/avatar';
import { PresenceBadge } from '../presence-badge/presence-badge';
import { Text } from '../text/text';
import type { PersonaProps, PersonaState } from './persona.types';

const hidden = { ...hiddenFromAccessibilityProps, pointerEvents: 'none' } as const;
const textProps = (text?: string) => (text?.trim() ? { ...hidden, children: text } : null);
const hasText = (text?: string): text is string => !!text?.trim();

export function usePersona_unstable({
  name,
  secondaryText,
  tertiaryText,
  quaternaryText,
  avatar,
  size = 32,
  layout = 'afterAvatar',
  alignment = 'top',
  presence,
  decorative,
  formatIdentity,
  style: userStyle,
  ...rootProps
}: PersonaProps): PersonaState {
  const status = presence?.label.trim() ? presence : undefined;
  const parts = [name, secondaryText, tertiaryText, quaternaryText, status?.label].filter(hasText);
  const identity = {
    name,
    secondaryText: hasText(secondaryText) ? secondaryText : undefined,
    tertiaryText: hasText(tertiaryText) ? tertiaryText : undefined,
    quaternaryText: hasText(quaternaryText) ? quaternaryText : undefined,
    presenceLabel: status?.label,
  };
  const summary = !decorative && hasText(name) ? formatIdentity?.(identity) || parts.join(', ') : undefined;
  const portrait =
    avatar?.image !== undefined
      ? { image: { source: avatar.image } }
      : avatar?.icon !== undefined
        ? { icon: avatar.icon }
        : avatar?.initials !== undefined
          ? { initials: avatar.initials }
          : {};
  return {
    ...useThemeState(),
    size,
    alignment,
    layout,
    userStyle,
    hasName: hasText(name),
    root: useSlot(View, {
      ...rootProps,
      ...(decorative ? hiddenFromAccessibilityProps : { accessible: true, role: 'group', accessibilityLabel: summary }),
      focusable: false,
    }),
    portrait: useSlot(View, hidden),
    avatar: useSlot(Avatar, { ...portrait, size, accessible: false, pointerEvents: 'none' }),
    presence: useOptionalSlot(
      PresenceBadge,
      status ? { status: status.status, size: size < 24 ? 'extraSmall' : size < 40 ? 'small' : size < 56 ? 'medium' : 'large' } : null,
    ),
    textColumn: useSlot(View, hidden),
    name: useSlot(Text, { ...hidden, children: name }),
    secondary: useOptionalSlot(Text, textProps(secondaryText)),
    tertiary: useOptionalSlot(Text, textProps(tertiaryText)),
    quaternary: useOptionalSlot(Text, textProps(quaternaryText)),
  };
}
