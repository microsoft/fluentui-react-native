import type { Traits } from '@fluentui-react-native/design/styling';

import type { CardSize } from '../card.types';

export const cardTraits = {
  channels: {
    root: { background: 'interactive', stroke: 'rest' },
  },
  hover: { base: 'enabled' },
  focusVisual: 'platform',
  geometry: {
    root: { radius: { small: 'base600', large: 'base700' }, strokeWidth: 'thin' },
  },
} as const satisfies Traits<'root', never, CardSize>;
