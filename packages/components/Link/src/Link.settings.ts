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
      acceptsKeyboardFocus: true,
      style: {
        margin: 0,
        textDecorationLine: 'underline',
        display: 'flex',
        alignItems: 'flex-start',
      } as IViewProps['style']
    },
    content: {
      style: {
        textDecorationLine: 'underline',
        borderStyle: 'dotted',
        borderColor: 'transparent',
        borderWidth: 1
      }
    },
    _precedence: ['visited', 'hovered', 'focused', 'pressed', 'disabled'],
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
      },
      focused: {
        content: {
          style: {
            borderColor: 'rgba(128, 128, 128, 1)',
          }
        }
      }
    }
  },
  linkName
];
