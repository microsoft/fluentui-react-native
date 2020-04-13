import { ITextType } from './Text.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ITextType> = [
  {
    tokens: {
      fontFamily: 'primary',
      fontSize: 'secondary',
      fontWeight: 'regular',
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
