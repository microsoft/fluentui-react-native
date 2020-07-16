import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { linkName, ILinkType } from './Link.types';
import { IViewProps } from '@fluentui-react-native/adapters';

export const settings: IComposeSettings<ILinkType> = [
  {
    tokens: {
      variant: 'secondaryStandard',
      color: 'link',
      borderColor: 'transparent',
      borderStyle: 'dotted',
      borderWidth: 1,
    },
    root: {
      accessible: true,
      acceptsKeyboardFocus: true,
      accessibilityRole: 'link',
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
        tokens: {
          borderColor: 'focusBorder'
        }
      }
    }
  },
  linkName
];
