import type { ICalloutType } from './Callout.types';
import { calloutName } from './Callout.types';
import type { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ICalloutType> = [
  {
    tokens: {
      backgroundColor: 'bodyStandoutBackground',
      beakWidth: 20,
      borderColor: 'bodyFrameBackground',
      borderWidth: 1,
      directionalHint: 'bottonLeftEdge',
      gapSpace: 0,
      minPadding: 0,
    },
    root: {
      style: {
        position: 'absolute',
      },
    },
  },
  calloutName,
];
