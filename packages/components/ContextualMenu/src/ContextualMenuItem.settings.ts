import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { ContextualMenuItemType } from './ContextualMenuItem.types';
import { contextualMenuItemName } from './ContextualMenuItem.types';

export const settings: IComposeSettings<ContextualMenuItemType> = [
  {
    tokens: {
      backgroundColor: 'menuBackground',
      color: 'menuItemText',
      borderColor: 'transparent',
      borderWidth: 2,
    },
    root: {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        width: '100%',
      },
    },
    icon: { style: { marginEnd: 5 } },
    stack: {
      style: {
        display: 'flex',
        paddingStart: 7,
        paddingEnd: 7,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        minWidth: 80,
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
      hovered: {
        tokens: {
          color: 'menuItemTextHovered',
          backgroundColor: 'menuItemBackgroundHovered',
        },
      },
      focused: {
        tokens: {
          color: 'menuItemTextHovered',
          backgroundColor: 'menuItemBackgroundHovered',
          borderColor: 'focusBorder',
        },
        _overrides: {
          hovered: {
            tokens: {
              borderColor: 'transparent',
            },
          },
        },
      },
    },
  },
  contextualMenuItemName,
];
