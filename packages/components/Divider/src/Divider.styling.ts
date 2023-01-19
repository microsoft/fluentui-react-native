import { divider, DividerTokens, DividerSlotProps, DividerProps } from './Divider.types';
import { Theme, UseStylingOptions, buildProps, layoutStyles } from '@fluentui-react-native/framework';
import { defaultDividerTokens } from './DividerTokens';

export const dividerStates: (keyof DividerTokens)[] = [
  'alignStart',
  'alignEnd',
  'hasChildren',
  'isVertical',
  'default',
  'subtle',
  'brand',
  'strong',
];

export const stylingSettings: UseStylingOptions<DividerProps, DividerSlotProps, DividerTokens> = {
  tokens: [defaultDividerTokens, divider],
  tokensThatAreAlsoProps: ['color', 'inset', 'vertical'],
  states: dividerStates,
  slotProps: {
    root: buildProps(
      (tokens: DividerTokens, theme: Theme) => ({
        style: {
          alignItems: 'center',
          justifyContent: tokens.alignment,
          display: 'flex',
          flexDirection: tokens.vertical ? 'column' : 'row',
          ...layoutStyles.from(tokens, theme),
          ...(tokens.vertical
            ? {
                paddingVertical: tokens.inset ? tokens.insetSize : 0,
                height: '100%',
              }
            : {
                paddingHorizontal: tokens.inset ? tokens.insetSize : 0,
              }),
        },
      }),
      ['inset', 'vertical'],
    ),
    beforeLine: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          flexBasis: 8,
          flex: tokens.flexBefore,
          borderColor: tokens.color || tokens.lineColor,
          borderStyle: 'solid',
          [tokens.vertical ? 'borderLeftWidth' : 'borderTopWidth']: tokens.thickness,
        },
      }),
      ['color', 'vertical'],
    ),
    afterLine: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          flexBasis: 8,
          flex: tokens.flexAfter,
          borderColor: tokens.color || tokens.lineColor,
          borderStyle: 'solid',
          [tokens.vertical ? 'borderLeftWidth' : 'borderTopWidth']: tokens.thickness,
        },
      }),
      ['color', 'vertical'],
    ),
    wrapper: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          flex: 0,
          [tokens.vertical ? 'paddingVertical' : 'paddingHorizontal']: 8,
        },
      }),
      ['vertical'],
    ),
    text: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          color: tokens.color || tokens.contentColor,
        },
      }),
      ['color'],
    ),
    icon: buildProps(
      (tokens: DividerTokens) => ({
        color: tokens.color || tokens.contentColor,
        style: { color: tokens.color || tokens.contentColor },
      }),
      ['color'],
    ),
  },
};
