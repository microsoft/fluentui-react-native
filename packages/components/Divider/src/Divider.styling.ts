import { divider, DividerTokens, DividerSlotProps, DividerProps } from './Divider.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultDividerTokens } from './DividerTokens';

export const dividerStates: (keyof DividerTokens)[] = [
  'alignStart',
  'alignEnd',
  'hasChildren',
  'vertical',
  'inset',
  'default',
  'subtle',
  'brand',
  'strong',
];

export const stylingSettings: UseStylingOptions<DividerProps, DividerSlotProps, DividerTokens> = {
  tokens: [defaultDividerTokens, divider],
  tokensThatAreAlsoProps: ['color'],
  states: dividerStates,
  slotProps: {
    root: buildProps((tokens: DividerTokens) => {
      const ret: any = {
        style: {
          alignItems: 'center',
          justifyContent: tokens.alignment,
          display: 'flex',
          flexDirection: tokens.rootFlexDirection,
          height: tokens.height,
          minHeight: tokens.minHeight,
          minWidth: tokens.minWidth,
          maxHeight: tokens.maxHeight,
          maxWidth: tokens.maxWidth,
          [tokens.insetStyleProp]: tokens.insetSize,
        },
      };
      console.log(tokens);
      console.log(ret);
      return ret;
    }, []),
    beforeLine: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          flexBasis: 8,
          flex: tokens.lineBeforeFlex,
          borderColor: tokens.color || tokens.lineColor,
          borderStyle: 'solid',
          [tokens.lineStyleProp]: tokens.thickness,
        },
      }),
      ['color'],
    ),
    afterLine: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          flexBasis: 8,
          flex: tokens.lineAfterFlex,
          borderColor: tokens.color || tokens.lineColor,
          borderStyle: 'solid',
          [tokens.lineStyleProp]: tokens.thickness,
        },
      }),
      ['color'],
    ),
    wrapper: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          flex: 0,
          paddingHorizontal: tokens.contentMarginHorizontal,
          paddingVertical: tokens.contentMarginVertical,
        },
      }),
      [],
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
        style: {
          color: tokens.color || tokens.contentColor,
        },
      }),
      ['color'],
    ),
  },
};
