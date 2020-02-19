import { ITextType } from './Text.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ITextType> = [
  {
    tokens: {
      fontFamily: 'primary',
      fontSize: 'medium',
      fontWeight: 'medium',
      color: 'bodyText'
    },
    root: {
      style: {
        margin: 0
      }
    },
    _overrides: {
      disabled: {
        tokens: {
          color: 'bodyTextDisabled'
        }
      }
    },
    _precedence: ['disabled']
  },
  'RNFText'
];
