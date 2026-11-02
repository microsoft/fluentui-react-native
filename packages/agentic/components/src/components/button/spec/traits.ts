import type { Traits } from '@fluentui-react-native/design/styling';

import type { ButtonAppearance, ButtonSize } from '../button.types';

export const buttonTraits = {
  typography: { content: { lineHeight: 'token', weight: 'regular' } },
  channels: {
    root: { background: 'interactive', stroke: 'rest' },
    content: { foreground: 'interactive' },
  },
  hover: { base: 'enabled' },
  focusVisual: 'platform',
  geometry: { root: { radius: { small: 'base200', medium: 'base300', large: 'base400' }, strokeWidth: 'thin' } },
} as const satisfies Traits<'root' | 'content', ButtonAppearance, ButtonSize>;
