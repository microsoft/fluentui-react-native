import { ITextSlotProps } from './Text.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ITextSlotProps> = [
  {
    root: {
      fontFamily: 'primary',
      fontSize: 'medium',
      fontWeight: 'medium',
      color: 'bodyText',
      style: {
        margin: 0
      }
    },
    _overrides: {
      disabled: {
        root: {
          style: {
            color: 'bodyTextDisabled'
          }
        }
      }
    },
    _precedence: ['disabled']
  },
  'RNFText'
];
