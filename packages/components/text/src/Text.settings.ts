import { textName, ITextType } from './Text.types';
import { TextStyle } from 'react-native';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ITextType> = [
  {
    tokens: {
      variant: 'secondaryStandard',
      color: 'bodyText',
    },
    root: {
      style: {
        margin: 0,
      } as TextStyle,
    },
    _overrides: {
      disabled: {
        tokens: {
          color: 'disabledText',
        },
      },
    },
    _precedence: ['disabled'],
  },
  textName,
];
