import { compoundButtonName, CompoundButtonTokens, CompoundButtonSlotProps, CompoundButtonProps } from './CompoundButton.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { buttonStates, defaultButtonTokens } from '../ButtonTokens';
import { ButtonTokens } from '../Button.types';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { ImageProps } from 'react-native';

export const stylingSettings: UseStylingOptions<CompoundButtonProps, CompoundButtonSlotProps, CompoundButtonTokens> = {
  tokens: [
    defaultButtonTokens,
    (t: Theme) => ({
      minHeight: 72,
      secondaryContentFont: {
        variant: 'secondaryStandard',
      },
      ghost: {
        secondaryContentColor: t.colors.ghostSecondaryContent,
        hovered: {
          secondaryContentColor: t.colors.ghostHoveredSecondaryContent,
        },
        focused: {
          secondaryContentColor: t.colors.ghostFocusedSecondaryContent,
        },
        pressed: {
          secondaryContentColor: t.colors.ghostPressedSecondaryContent,
        },
      } as ButtonTokens,
    }),
    compoundButtonName,
  ],
  states: buttonStates,
  slotProps: {
    root: buildProps(
      (tokens: CompoundButtonTokens, theme: Theme) =>
        ({
          style: {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            justifyContent: 'center',
            paddingStart: 16,
            paddingEnd: 16,
            backgroundColor: tokens.backgroundColor,
            ...borderStyles.from(tokens, theme),
            ...layoutStyles.from(tokens, theme),
          },
        } as React.PropsWithRef<IViewWin32Props>),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    contentContainer: {
      style: {
        display: 'flex',
        flexDirection: 'column',
      },
    },
    content: buildProps(
      (tokens: CompoundButtonTokens, theme: Theme) =>
        ({
          style: {
            color: tokens.color,
            ...fontStyles.from(tokens, theme),
          },
        } as TextProps),
      ['color', ...fontStyles.keys],
    ),
    secondaryContent: buildProps(
      (tokens: CompoundButtonTokens, theme: Theme) =>
        ({
          style: {
            color: tokens.secondaryContentColor,
            ...fontStyles.from(tokens.secondaryContentFont, theme),
          },
        } as TextProps),
      ['secondaryContentColor', 'secondaryContentFont'],
    ),
    icon: buildProps(
      (tokens: CompoundButtonTokens) =>
        ({
          style: {
            tintColor: tokens.iconColor,
          },
        } as ImageProps),
      ['iconColor'],
    ),
  },
};
