import type { UseStylingOptions, Theme } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles } from '@fluentui-react-native/tokens';

import { chipName, ChipColors, ChipSizes, ChipShapes, ChipAppearances } from './Chip.types';
import type { ChipCoreTokens, ChipTokens, ChipSlotProps, ChipProps, ChipConfigurableProps, ChipNamedColor } from './Chip.types';
import { defaultChipColorTokens } from './ChipColorTokens';
import { chipFontTokens } from './ChipFontTokens';
import { defaultChipTokens } from './ChipTokens';

export const coreChipStates: (keyof ChipCoreTokens)[] = [...ChipSizes, ...ChipShapes];
export const chipStates: (keyof ChipTokens)[] = [
  ...coreChipStates,
  'searchBar', // Mobile only
  ...ChipColors,
  ...ChipAppearances,
  'rtl',
  'shadowToken',
  'selected', // Mobile only
  'disabled', // Mobile only
];
const tokensThatAreAlsoProps: (keyof ChipConfigurableProps)[] = ['chipColor', 'color', 'icon', 'iconColor', 'iconPosition', 'position'];

export const stylingSettings: UseStylingOptions<ChipProps, ChipSlotProps, ChipTokens> = {
  tokens: [defaultChipTokens, defaultChipColorTokens, chipFontTokens, chipName],
  states: chipStates,
  tokensThatAreAlsoProps,
  slotProps: {
    root: buildProps(
      (tokens: ChipTokens, theme: Theme) => {
        const { chipColor, backgroundColor, position } = tokens;
        const _chipColor = !chipColor || ChipColors.includes(chipColor as ChipNamedColor) ? backgroundColor : chipColor;

        return {
          style: {
            ...getChipPosition(tokens),
            alignItems: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            justifyContent: 'center',
            width: tokens.width,
            backgroundColor: _chipColor,
            position,
            ...borderStyles.from(tokens, theme),
            ...layoutStyles.from(tokens, theme),
          },
        };
      },
      [
        'backgroundColor',
        'chipColor',
        'width',
        'minHeight',
        'bottom',
        'right',
        'top',
        'left',
        'position',
        ...borderStyles.keys,
        ...layoutStyles.keys,
      ],
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
    shadow: buildProps(
      (tokens: ChipTokens) => ({
        shadowToken: tokens.shadowToken,
      }),
      ['shadowToken'],
    ),
  },
};

export function getChipPosition(tokens: ChipCoreTokens) {
  const verticalPosition =
    tokens.top !== undefined
      ? {
          top: tokens.top,
        }
      : tokens.bottom !== undefined
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
  if (tokens.icon) {
    return tokens.iconPosition !== 'after'
      ? {
          marginStart: tokens.textMargin,
        }
      : {
          marginEnd: tokens.textMargin,
        };
  }
  return {};
}
