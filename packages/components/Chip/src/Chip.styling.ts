import type { UseStylingOptions, Theme } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles } from '@fluentui-react-native/tokens';

import { chipName, ChipColors, ChipSizes } from './Chip.types';
import type { ChipTokens, ChipSlotProps, ChipProps, ChipConfigurableProps } from './Chip.types';
import { defaultChipColorTokens } from './ChipColorTokens';
import { chipFontTokens } from './ChipFontTokens';
import { defaultChipTokens } from './ChipTokens';

export const chipStates: (keyof ChipTokens)[] = [...ChipSizes, 'searchBar', ...ChipColors, 'rtl', 'selected', 'disabled'];
const tokensThatAreAlsoProps: (keyof ChipConfigurableProps)[] = ['icon', 'iconColor'];

export const stylingSettings: UseStylingOptions<ChipProps, ChipSlotProps, ChipTokens> = {
  tokens: [defaultChipTokens, defaultChipColorTokens, chipFontTokens, chipName],
  states: chipStates,
  tokensThatAreAlsoProps,
  slotProps: {
    root: buildProps(
      (tokens: ChipTokens, theme: Theme) => {
        return {
          style: {
            ...getChipPosition(tokens),
            alignItems: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            justifyContent: 'center',
            width: tokens.width,
            backgroundColor: tokens.backgroundColor,
            ...borderStyles.from(tokens, theme),
            ...layoutStyles.from(tokens, theme),
          },
        };
      },
      ['backgroundColor', 'width', 'minHeight', 'bottom', 'right', 'left', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    icon: buildProps(
      (tokens: ChipTokens) => ({
        color: tokens.iconColor || tokens.color,
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconSize', 'iconColor', 'color'],
    ),
    text: buildProps(
      (tokens: ChipTokens, theme: Theme) => {
        return {
          style: {
            ...fontStyles.from(tokens, theme),
            color: tokens.color,
            ...getTextMargin(tokens),
          },
        };
      },
      ['color', 'textMargin', ...fontStyles.keys],
    ),
  },
};

export function getChipPosition(tokens: ChipTokens) {
  const verticalPosition =
    tokens.bottom !== undefined
      ? {
          bottom: tokens.bottom,
        }
      : {};
  const horizontalPosition =
    tokens.left !== undefined
      ? {
          left: tokens.left,
        }
      : tokens.right !== undefined
        ? {
            right: tokens.right,
          }
        : {};

  return {
    ...verticalPosition,
    ...horizontalPosition,
  };
}

export function getTextMargin(tokens: ChipTokens) {
  return tokens.icon && { marginStart: tokens.textMargin };
}
