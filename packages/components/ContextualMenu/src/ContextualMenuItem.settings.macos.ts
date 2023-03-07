import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { ContextualMenuItemType } from './ContextualMenuItem.types';
import { contextualMenuItemName } from './ContextualMenuItem.types';

export const settings: IComposeSettings<ContextualMenuItemType> = [
  {
    tokens: {
      color: 'menuItemText',
    },
    root: {
      enableFocusRing: false,
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        width: '100%',
        borderRadius: 5,
      },
    },
    content: {},
    icon: { style: { marginEnd: 5 } },
    stack: {
      style: {
        display: 'flex',
        paddingHorizontal: 5,
        paddingVertical: 3,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',

        justifyContent: 'flex-start',
      },
    },
    _precedence: ['focused', 'hovered', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'menuBackground',
          color: 'disabledText',
        },
      },
      pressed: {
        tokens: {
          backgroundColor: 'menuItemBackgroundPressed',
          color: 'menuItemTextHovered',
        },
      },
      focused: {
        tokens: {
          color: 'menuItemTextHovered',
          backgroundColor: 'menuItemBackgroundHovered',
        },
      },
    },
  },
  contextualMenuItemName,
];
