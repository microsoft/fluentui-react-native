import { compoundButtonName, CompoundButtonTokens, CompoundButtonSlotProps, CompoundButtonProps } from './CompoundButton.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { buttonStates, defaultButtonTokens } from '../ButtonTokens';
import { ButtonTokens } from '../Button.types';

export const stylingSettings: UseStylingOptions<CompoundButtonProps, CompoundButtonSlotProps, CompoundButtonTokens> = {
  tokens: [
    defaultButtonTokens,
    (t: Theme): ButtonTokens =>
      ({
        minHeight: 72,
        secondaryContentFont: {
          variant: 'secondaryStandard',
        },
        secondaryContentColor: t.colors.defaultSecondaryContent,
        hovered: {
          secondaryContentColor: t.colors.defaultHoveredSecondaryContent,
        },
        focused: {
          secondaryContentColor: t.colors.defaultFocusedSecondaryContent,
        },
        pressed: {
          secondaryContentColor: t.colors.defaultPressedSecondaryContent,
        },
        primary: {
          secondaryContentColor: t.colors.brandedSecondaryContent,
          hovered: {
            secondaryContentColor: t.colors.brandedHoveredSecondaryContent,
          },
          focused: {
            secondaryContentColor: t.colors.brandedFocusedSecondaryContent,
          },
          pressed: {
            secondaryContentColor: t.colors.brandedPressedSecondaryContent,
          },
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
