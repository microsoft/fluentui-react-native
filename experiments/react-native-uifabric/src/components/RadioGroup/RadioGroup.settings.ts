import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { IRadioGroupType, radioGroupName } from './RadioGroup.types';
import { ViewProps } from 'react-native';

export const settings: IComposeSettings<IRadioGroupType> = [
  {
    root: {
      accessible: true,
      accessibilityRole: 'radio',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        alignSelf: 'flex-start'
      }
    } as ViewProps,
    label: {
      style: {
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: '600'
      }
    }
  },
  radioGroupName
];
