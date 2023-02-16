import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { IRadioGroupType } from './RadioGroup.types';
import { radioGroupName } from './RadioGroup.types';

export const settings: IComposeSettings<IRadioGroupType> = [
  {
    tokens: {
      color: 'menuItemText',
    },
    root: {
      accessible: true,
      accessibilityRole: 'radio',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
    },
    label: {
      style: {
        fontSize: 16,
        fontWeight: '600',
      },
    },
  },
  radioGroupName,
];
