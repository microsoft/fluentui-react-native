import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { IRadioGroupType, radioGroupName } from './RadioGroup.types';

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
        fontFamily: 'inherit',
        fontSize: 16,
        fontWeight: '600',
      },
    },
  },
  radioGroupName,
];
