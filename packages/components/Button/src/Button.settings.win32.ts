import { buttonName, IButtonType } from './Button.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const settings: IComposeSettings<IButtonType> = [
  {
    tokens: {
      backgroundColor: 'neutralBackground1',
      color: 'neutralForeground1',
      borderColor: 'neutralStroke1',
      borderWidth: 1,
      borderRadius: 4,
    },
    root: {
      accessible: true,
      focusable: true,
      accessibilityRole: 'button',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        alignSelf: 'flex-start',
      },
    } as IViewProps,
    endIcon: {
      style: {
        marginStart: 2
      }
    },
    startIcon: {
      style: {
        marginEnd: 2
      }
    },
    content: {
      style: {
        marginStart: 2,
        marginEnd: 2
      }
    },
    stack: {
      style: {
        display: 'flex',
        paddingStart: 6,
        paddingEnd: 6,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 24,
        minWidth: 32,
        justifyContent: 'center',
      },
    },
    _precedence: ['hovered', 'focused', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'neutralBackgroundDisabled',
          color: 'neutralForegroundDisabled',
          borderColor: 'neutralStrokeDisabled',
        },
      },
      hovered: {
        tokens: {
          backgroundColor: 'neutralBackground1Hover',
          color: 'neutralForeground1',
          borderColor: 'neutralStroke1',
        },
      },
      pressed: {
        tokens: {
          backgroundColor: 'neutralBackground1Pressed',
          color: 'neutralForeground1',
          borderColor: 'neutralStroke1',
        },
      },
      focused: {
        tokens: {
          backgroundColor: 'neutralBackground1Hover',
          color: 'neutralForeground1',
          borderColor: 'strokeFocus2',
        },
      },
    },
  },
  buttonName,
];
