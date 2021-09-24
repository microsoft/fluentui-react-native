import { compoundButtonName, CompoundButtonTokens, CompoundButtonSlotProps, CompoundButtonProps } from './CompoundButton.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultButtonColorTokens } from '../ButtonColorTokens';
import { ButtonTokens } from '../Button.types';
import { buttonStates } from '../Button.styling';

export const stylingSettings: UseStylingOptions<CompoundButtonProps, CompoundButtonSlotProps, CompoundButtonTokens> = {
  tokens: [
    defaultButtonColorTokens,
    (t: Theme): ButtonTokens =>
      ({
        minHeight: 72,
        secondaryContentFont: {
          variant: 'secondaryStandard',
        },
        secondaryContentColor: t.colors.neutralForeground2,
        hovered: {
          secondaryContentColor: t.colors.neutralForeground2Hover,
        },
        focused: {
          secondaryContentColor: t.colors.neutralForeground2Hover,
        },
        pressed: {
          secondaryContentColor: t.colors.neutralForeground2Pressed,
        },
        primary: {
          secondaryContentColor: t.colors.neutralForegroundOnBrand,
          hovered: {
            secondaryContentColor: t.colors.neutralForegroundOnBrand,
          },
          focused: {
            secondaryContentColor: t.colors.neutralForegroundOnBrand,
          },
          pressed: {
            secondaryContentColor: t.colors.neutralForegroundOnBrand,
          },
        },
        subtle: {
          secondaryContentColor: t.colors.neutralForeground2,
          hovered: {
            secondaryContentColor: t.colors.neutralForeground2Hover,
          },
          focused: {
            secondaryContentColor: t.colors.neutralForeground2Hover,
          },
          pressed: {
            secondaryContentColor: t.colors.neutralForeground2Pressed,
          },
        },
      } as ButtonTokens),
    compoundButtonName,
  ],
  states: buttonStates,
  slotProps: {
    root: buildProps(
      (tokens: CompoundButtonTokens, theme: Theme) => ({
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
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    contentContainer: {
      style: {
        display: 'flex',
        flexDirection: 'column',
      },
    },
    content: buildProps(
      (tokens: CompoundButtonTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    secondaryContent: buildProps(
      (tokens: CompoundButtonTokens, theme: Theme) => ({
        style: {
          color: tokens.secondaryContentColor,
          ...fontStyles.from(tokens.secondaryContentFont, theme),
        },
      }),
      ['secondaryContentColor', 'secondaryContentFont'],
    ),
    icon: buildProps(
      (tokens: CompoundButtonTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
      }),
      ['iconColor'],
    ),
  },
};
