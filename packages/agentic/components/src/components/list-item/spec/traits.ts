import type { Traits } from '@fluentui-react-native/design/styling';

import type { ListItemSize } from '../list-item.types';

export const listItemTraits = {
  typography: {
    content: { lineHeight: 'token', weight: 'regular' },
    secondaryContent: { lineHeight: 'token', weight: 'regular' },
  },
  channels: {
    root: { background: 'interactive' },
    icon: { foreground: 'interactive' },
    secondaryContent: { foreground: 'interactive' },
  },
  hover: { base: 'enabled' },
  focusVisual: 'platform',
  geometry: { root: { radius: 'base300' } },
} as const satisfies Traits<'root' | 'content' | 'secondaryContent' | 'icon', never, ListItemSize>;
