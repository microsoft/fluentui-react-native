import { divider, DividerTokens, DividerSlotProps, DividerProps } from './Divider.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultDividerTokens } from './DividerTokens';
import { FlexStyle } from 'react-native';

type DividerColors = {
  [Appearance in DividerProps['appearance']]: {
    [Slot in 'wrapper' | 'line']: string;
  };
};

const DIVIDER_COLORS: DividerColors = {
  default: {
    line: 'neutralStroke2',
    wrapper: 'neutralForeground2',
  },
  subtle: {
    line: 'neutralStroke3',
    wrapper: 'neutralForeground3',
  },
  brand: {
    line: 'brandStroke1',
    wrapper: 'brandForeground1',
  },
  strong: {
    line: 'neutralStroke1',
    wrapper: 'neutralForeground1',
  },
};

type AlignContentMap = {
  [AlignContentValue in DividerProps['alignContent']]: FlexStyle['justifyContent'];
};

const ALIGN_CONTENT_MAP: AlignContentMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

export const stylingSettings: UseStylingOptions<DividerProps, DividerSlotProps, DividerTokens> = {
  tokens: [defaultDividerTokens, divider],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: DividerTokens) => ({
        style: {
          alignItems: 'center',
          justifyContent: ALIGN_CONTENT_MAP[tokens.alignContent],
          display: 'flex',
          paddingHorizontal: tokens.inset ? tokens.insetSize : 0,
          ...(tokens.vertical
            ? {
                flexDirection: 'column',
                minHeight: tokens.minHeight,
              }
            : {
                flexDirection: 'row',
                minWidth: tokens.minWidth,
              }),
        },
      }),
      [],
    ),
    beforeLine: buildProps(
      (tokens: DividerTokens, theme: Theme) => {
        return {
          style: {
            flexBasis: 8,
            flex: tokens.alignContent === 'start' ? 0 : 1,
            borderColor: tokens.color || theme.colors[DIVIDER_COLORS[tokens.appearance].line],
            borderStyle: 'solid',
            [tokens.vertical ? 'borderLeftWidth' : 'borderTopWidth']: tokens.thickness,
          },
        };
      },
      ['color'],
    ),
    afterLine: buildProps(
      (tokens: DividerTokens, theme: Theme) => {
        return {
          style: {
            flexBasis: 8,
            flex: tokens.alignContent === 'end' ? 0 : 1,
            borderColor: tokens.color || theme.colors[DIVIDER_COLORS[tokens.appearance].line],
            borderStyle: 'solid',
            [tokens.vertical ? 'borderLeftWidth' : 'borderTopWidth']: tokens.thickness,
          },
        };
      },
      ['color'],
    ),
    text: buildProps(
      (tokens: DividerTokens, theme: Theme) => ({
        style: {
          flex: 0,
          color: theme.colors[DIVIDER_COLORS[tokens.appearance].wrapper],
          // textAlign: 'center',
          [tokens.vertical ? 'marginVertical' : 'marginHorizontal']: 8,
        },
      }),
      ['color'],
    ),
  },
};
