import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { ILinkType } from './Link.types';
import { linkName } from './Link.types';

export const settings: IComposeSettings<ILinkType> = [
  {
    tokens: {
      variant: 'secondaryStandard',
      color: 'link',
      borderColor: 'transparent',
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: 4,
      textDecorationLine: 'underline',
    },
    root: {
      accessible: true,
      focusable: true,
      ...{ cursor: 'pointer' },
      accessibilityRole: 'link',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
      } as IViewProps['style'],
    },
    content: {
      style: {
        textDecorationLine: 'underline',
        textAlign: 'center',
      },
    },
    _precedence: ['visited', 'hovered', 'focused', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          color: 'link',
        },
      },
      hovered: {
        tokens: {
          color: 'linkHovered',
        },
      },
      pressed: {
        tokens: {
          color: 'linkPressed',
        },
      },
      visited: {
        tokens: {
          color: 'link',
        },
      },
      focused: {
        tokens: {
          borderColor: 'focusBorder',
        },
      },
    },
  },
  linkName,
];
