import type { Traits } from '@fluentui-react-native/design/styling';

import type { TagAppearance, TagSize } from '../tag.types';

export const tagTraits = {
  typography: {
    content: { lineHeight: 'token', weight: 'regular' },
  },
  channels: {
    root: { background: 'interactive' },
    content: { foreground: 'rest' },
  },
  hover: { base: 'enabled' },
  focusVisual: 'platform',
  geometry: {
    root: { radius: { small: 'base200', medium: 'base300' }, strokeWidth: 'none' },
  },
} as const satisfies Traits<'root' | 'content', TagAppearance, TagSize>;
