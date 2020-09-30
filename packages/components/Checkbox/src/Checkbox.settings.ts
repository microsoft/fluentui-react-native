import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { checkboxName, CheckboxProps, CheckboxSlotProps, CheckboxTokens, CheckboxType } from './Checkbox.types';

import { StylingSettings, Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/use-styling';

export const checkboxSelectActionLabel = 'Toggle the Checkbox';

export const stylingSettings: UseStylingOptions<CheckboxProps, CheckboxSlotProps, CheckboxTokens> = {
  tokens: [
    (t) => ({
      borderColor: t.colors.menuItemText,
      color: t.colors.menuItemText,
      backgroundColor: t.colors.menuBackground,
      textBorderColor: 'transparent',
      focused: {
        backgroundColor: t.colors.menuItemBackgroundHovered,
        textBorderColor: t.colors.focusBorder,
      },
      hovered: {
        backgroundColor: t.colors.menuItemBackgroundHovered,
      },
      disabled: {
        borderColor: t.colors.buttonBorderDisabled,
        color: t.colors.disabledBodyText,
        backgroundColor: t.colors.background,
      },
      pressed: {
        backgroundColor: t.colors.menuItemBackgroundPressed,
      },
    }),
    checkboxName,
  ],
  states: ['disabled', 'boxAtEnd', 'hovered', 'focused', 'pressed', 'checked'],
  slotProps: {
    root: buildProps(
      (tokens: CheckboxTokens, theme: Theme) => ({
        accessible: true,
        acceptsKeyboardFocus: true,
        accessibilityRole: 'checkbox',
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          minHeight: 14,
          marginTop: 0,
          position: 'relative',
        },
      }),
      [],
    ),
    checkbox: buildProps((t) => ({}), []),
    checkmark: buildProps((t) => ({}), []),
    content: buildProps((t) => ({}), []),
  },
};

/*
focused: {
  tokens: {
    backgroundColor: 'menuItemBackgroundHovered',
    textBorderColor: 'focusBorder'
  }
},
checked: {
  checkmark: {
    style: {
      opacity: 1
    }
  }
},
hovered: {
  tokens: {
    backgroundColor: 'menuItemBackgroundHovered'
  }
},
disabled: {
  tokens: {
    borderColor: 'buttonBorderDisabled',
    color: 'disabledBodyText',
    backgroundColor: 'background'
  }
},
boxAtEnd: {
  checkbox: {
    style: {
      marginStart: 4,
      marginEnd: 0
    }
  }
},
pressed: {
  tokens: {
    backgroundColor: 'menuItemBackgroundPressed'
  }
}
}
*/

export const settings: IComposeSettings<CheckboxType> = [
  {
    tokens: {
      borderColor: 'menuItemText',
      color: 'menuItemText',
      backgroundColor: 'menuBackground',
      textBorderColor: 'transparent',
    },
    root: {
      accessible: true,
      acceptsKeyboardFocus: true,
      accessibilityRole: 'checkbox',
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 14,
        marginTop: 0,
        position: 'relative',
      },
    },
    checkbox: {
      style: {
        height: 14,
        width: 14,
        marginEnd: 4,
        borderStyle: 'solid',
        borderWidth: 1,
      },
    },
    checkmark: {
      style: {
        position: 'relative',
        opacity: 0,
        fontSize: 10,
        marginStart: 2,
        top: -1,
      },
    },
    content: {
      variant: 'bodyStandard',
      style: {
        borderStyle: 'dotted',
        borderWidth: 1,
        marginTop: 3,
      },
    },
    _precedence: ['disabled', 'boxAtEnd', 'hovered', 'focused', 'pressed', 'checked'],
    _overrides: {
      focused: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered',
          textBorderColor: 'focusBorder',
        },
      },
      checked: {
        checkmark: {
          style: {
            opacity: 1,
          },
        },
      },
      hovered: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered',
        },
      },
      disabled: {
        tokens: {
          borderColor: 'buttonBorderDisabled',
          color: 'disabledBodyText',
          backgroundColor: 'background',
        },
      },
      boxAtEnd: {
        checkbox: {
          style: {
            marginStart: 4,
            marginEnd: 0,
          },
        },
      },
      pressed: {
        tokens: {
          backgroundColor: 'menuItemBackgroundPressed',
        },
      },
    },
  },
  checkboxName,
];
