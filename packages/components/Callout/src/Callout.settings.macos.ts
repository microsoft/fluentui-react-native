import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { ICalloutType } from './Callout.types';
import { calloutName } from './Callout.types';

export const settings: IComposeSettings<ICalloutType> = [
  {
    tokens: {
      backgroundColor: 'bodyStandoutBackground',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 5,
      directionalHint: 'bottomLeftEdge',
    },
    root: {
      style: {
        position: 'absolute',
      },
    },
  },
  calloutName,
];
