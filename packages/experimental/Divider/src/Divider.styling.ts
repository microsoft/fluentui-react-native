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
  tokensThatAreAlsoProps: ['color', 'insetSize', 'vertical'],
  states: dividerStates,
  slotProps: {
    root: buildProps(
      (tokens: DividerTokens, theme: Theme) => ({
        style: {
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: tokens.vertical ? 'column' : 'row',
          ...layoutStyles.from(tokens, theme),
          ...(tokens.vertical
            ? {
                paddingVertical: tokens.insetSize,
                height: '100%',
              }
            : {
                paddingHorizontal: tokens.insetSize,
              }),
        },
      }),
      ['insetSize', 'vertical'],
    ),
    beforeLine: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          flexBasis: 8,
          flex: tokens.flexBefore,
          borderColor: tokens.color || tokens.lineColor,
          borderStyle: 'solid',
          ...(tokens.vertical
            ? { borderLeftWidth: tokens.thickness, marginBottom: tokens.contentPadding }
            : { borderTopWidth: tokens.thickness, marginRight: tokens.contentPadding }),
        },
      }),
      ['color', 'contentPadding', 'flexBefore', 'lineColor', 'thickness', 'vertical'],
    ),
    afterLine: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          flexBasis: 8,
          flex: tokens.flexAfter,
          borderColor: tokens.color || tokens.lineColor,
          borderStyle: 'solid',
          ...(tokens.vertical
            ? { borderLeftWidth: tokens.thickness, marginTop: tokens.contentPadding }
            : { borderTopWidth: tokens.thickness, marginLeft: tokens.contentPadding }),
        },
      }),
      ['color', 'contentPadding', 'flexAfter', 'lineColor', 'thickness', 'vertical'],
    ),
    text: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          flex: 0,
          color: tokens.color || tokens.contentColor,
        },
      }),
      ['color', 'contentColor'],
    ),
    icon: buildProps(
      (tokens: DividerTokens) => ({
        color: tokens.color || tokens.contentColor,
        style: {
          flex: 0,
        },
      }),
      ['color', 'contentColor'],
    ),
  },
};
