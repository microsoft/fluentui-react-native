import { ILinkType } from './Link.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ILinkType> = [
  {
    tokens: {
      fontFamily: 'primary',
      fontSize: 'secondary',
      fontWeight: 'regular',
      color: 'link'
    },
    root: {
      style: {
        margin: 0,
        textDecoration: 'underline'
      }
    },
    _precedence: ['visited', 'hovered', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          color: 'linkDisabled'
        }
      },
      hovered: {
        tokens: {
          color: 'linkHovered'
        }
      },
      pressed: {
        tokens: {
          color: 'linkPressed'
        }
      },
      visited: {
        tokens: {
          color: 'linkVisited'
        }
      }
    }
  },
  'RNFLink'
];
