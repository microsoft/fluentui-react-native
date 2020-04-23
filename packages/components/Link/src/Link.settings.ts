import { linkName, ILinkType } from './Link.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
// import { IViewWin32Props } from '@office-iss/react-native-win32';
import { IViewProps } from '@fluentui-react-native/adapters';

export const settings: IComposeSettings<ILinkType> = [
  {
    tokens: {
      variant: 'secondaryStandard',
      color: 'link'
    },
    root: {
      style: {
        margin: 0,
        textDecorationLine: 'underline'
      } as IViewProps['style']
    },
    content: {
      style: {
        textDecorationLine: 'underline'
      }
    },
    _precedence: ['visited', 'hovered', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          color: 'link'
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
          color: 'link'
        }
      }
    }
  },
  linkName
];
