import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { ICalloutType } from './Callout.types';
import { calloutName } from './Callout.types';

export const settings: IComposeSettings<ICalloutType> = [
  {
    tokens: {
      backgroundColor: 'bodyStandoutBackground',
      beakWidth: 20,
      borderColor: 'bodyFrameBackground',
      borderWidth: 1,
      directionalHint: 'bottomLeftEdge',
      gapSpace: 0,
      minPadding: 0,
    },
  },
  calloutName,
];
