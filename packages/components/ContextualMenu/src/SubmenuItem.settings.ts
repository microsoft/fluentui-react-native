import { submenuItemName, SubmenuItemType } from './SubmenuItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<SubmenuItemType> = [
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
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        width: '100%',
        justifyContent: 'space-between',
      },
    },
    icon: {
      style: {
        marginEnd: 5,
        color: 'menuIcon',
      },
    },
    startstack: {
      style: {
        display: 'flex',
        flexGrow: 1,
        paddingStart: 5,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        justifyContent: 'flex-start',
      },
    },
    endstack: {
      style: {
        display: 'flex',
        paddingEnd: 5,
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 32,
        width: 12,
        justifyContent: 'flex-end',
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
  submenuItemName,
];
