import { ILinkSlotProps } from './Link.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ILinkSlotProps> = [
  {
    root: {
      fontFamily: 'primary',
      fontSize: 'medium',
      fontWeight: 'medium',
      color: 'link',
      style: {
        margin: 0,
        textDecoration: 'underline'
      }
    },
    _precedence: ['visited', 'hovered', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        root: {
          color: 'linkDisabled'
        }
      },
      hovered: {
        root: {
          color: 'linkHovered'
        }
      },
      pressed: {
        root: {
          color: 'linkPressed'
        }
      },
      visited: {
        root: {
          color: 'linkVisited'
        }
      }
    }
  },
  'RNFLink'
];
