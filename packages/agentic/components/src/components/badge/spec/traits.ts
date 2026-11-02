import type { Traits } from '@fluentui-react-native/design/styling';

import type { BadgeAppearance, BadgeSize } from '../badge.types';

export const badgeTraits = {
  typography: {
    content: { lineHeight: 'token', weight: 'regular' },
  },
  geometry: {
    root: { radius: { small: 'base100', medium: 'base200' }, strokeWidth: { tint: 'none', outline: 'thin' } },
  },
} as const satisfies Traits<'root' | 'content', BadgeAppearance, BadgeSize>;
