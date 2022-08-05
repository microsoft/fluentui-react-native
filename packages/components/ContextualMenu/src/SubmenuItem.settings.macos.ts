import { submenuItemName, SubmenuItemType } from './SubmenuItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<SubmenuItemType> = [
  {
    tokens: {
      backgroundColor: 'menuBackground',
      borderColor: 'transparent',
      borderWidth: 2,
      chevronColor: 'black',
      color: 'menuItemText',
    },
    root: {
      enableFocusRing: false,
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        width: '100%',
        borderRadius: 5,
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
        justifyContent: 'flex-start',
      },
    },
    endstack: {
      style: {
        display: 'flex',
        paddingEnd: 5,
        alignItems: 'center',
        flexDirection: 'row',
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
        },
      },
      focused: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered',
          chevronColor: 'white',
          color: 'white',
        },
      },
    },
  },
  submenuItemName,
];
