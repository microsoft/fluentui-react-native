import { compoundButtonName, CompoundButtonTokens, CompoundButtonSlotProps, CompoundButtonPropsWithInnerRef } from './CompoundButton.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultButtonColorTokens } from '../ButtonColorTokens';
import { buttonStates, contentStyling } from '../Button.styling';
import { defaultButtonTokens } from '../ButtonTokens';
import { defaultCompoundButtonColorTokens } from './CompoundButtonColorTokens';
import { defaultCompoundButtonTokens } from './CompoundButtonTokens';

export const stylingSettings: UseStylingOptions<CompoundButtonPropsWithInnerRef, CompoundButtonSlotProps, CompoundButtonTokens> = {
  tokens: [
    defaultButtonTokens,
    defaultButtonColorTokens,
    defaultCompoundButtonTokens,
    defaultCompoundButtonColorTokens,
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
      (tokens: CompoundButtonTokens, theme: Theme) => {
        return {
          style: {
            ...contentStyling(tokens, theme, tokens.color, tokens),
          },
        };
      },
      ['color', 'spacingIconContent', ...fontStyles.keys],
    ),
    secondaryContent: buildProps(
      (tokens: CompoundButtonTokens, theme: Theme) => {
        return {
          style: {
            ...contentStyling(tokens, theme, tokens.secondaryContentColor, tokens.secondaryContentFont),
          },
        };
      },
      ['secondaryContentColor', 'secondaryContentFont', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: CompoundButtonTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
  },
};
