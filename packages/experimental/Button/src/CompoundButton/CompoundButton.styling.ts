import { compoundButtonName, CompoundButtonTokens, CompoundButtonSlotProps, CompoundButtonProps } from './CompoundButton.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { buttonStates, defaultButtonTokens } from '../ButtonTokens';
import { ButtonTokens } from '../Button.types';

export const stylingSettings: UseStylingOptions<CompoundButtonProps, CompoundButtonSlotProps, CompoundButtonTokens> = {
  tokens: [
    (t: Theme) => ({
      minHeight: 72,
      ghost: {
        secondaryContentTokens: {
          variant: 'secondaryStandard',
          color: t.colors.ghostSecondaryContent,
          hovered: {
            color: t.colors.ghostHoveredSecondaryContent,
          },
          focused: {
            color: t.colors.ghostFocusedSecondaryContent,
          },
          pressed: {
            color: t.colors.ghostPressedSecondaryContent,
          },
        },
      } as ButtonTokens,
    }),
    defaultButtonTokens,
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
          color: tokens.secondaryContentTokens?.color,
          ...fontStyles.from(tokens.secondaryContentTokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
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
