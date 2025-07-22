import type { ViewStyle, ViewProps } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';
import type { UseStylingOptions, GetMemoValue } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles } from '@fluentui-react-native/tokens';

import { stackName } from './Stack.types';
import type { Alignment, StackSlotProps, StackTokens, StackProps, StackTokenProps } from './Stack.types';
import { parseGap, parsePadding } from './StackUtils';

const nameMap: { [key: string]: Alignment } = {
  start: 'flex-start',
  end: 'flex-end',
};

function _mapAlignment(horizontal: boolean, horizontalAlign: Alignment, verticalAlign: Alignment, style: ViewStyle): void {
  const alignValue = horizontal ? verticalAlign : horizontalAlign;
  if (alignValue) {
    style.alignItems = (nameMap[alignValue] || alignValue) as ViewStyle['alignItems'];
  }

  const justifyValue = horizontal ? horizontalAlign : verticalAlign;
  if (justifyValue) {
    style.justifyContent = (nameMap[justifyValue] || justifyValue) as ViewStyle['justifyContent'];
  }
}

const tokensThatAreAlsoProps: (keyof StackTokenProps)[] = [
  'childrenGap',
  'disableShrink',
  'gap',
  'grow',
  'horizontal',
  'horizontalAlign',
  'maxHeight',
  'maxWidth',
  'padding',
  'reversed',
  'verticalAlign',
  'verticalFill',
  'wrap',
];

const nowrapProps: ViewProps = {};

const buildInnerProps = (tokenProps: StackTokens, theme: Theme, cache: GetMemoValue) => {
  // if wrapping is disabled just return a fixed empty object without doing any additional work
  if (!tokenProps.wrap) {
    return nowrapProps;
  }

  // otherwise return a cached props object keyed on the four properties we care about
  const { horizontal, horizontalAlign, verticalAlign, padding } = tokenProps;
  return !tokenProps.wrap
    ? nowrapProps
    : cache<ViewProps>(() => {
        const childrenGap = tokenProps.childrenGap || tokenProps.gap;
        const { rowGap, columnGap } = parseGap(childrenGap, theme);

        const innerStyle: ViewStyle = {
          display: 'flex',
          flexWrap: 'wrap',
          overflow: 'visible',
          rowGap: rowGap,
          columnGap: columnGap,
          padding: parsePadding(padding, theme),
          width: '100%',
        };
        _mapAlignment(!!horizontal, horizontalAlign, verticalAlign, innerStyle);
        if (horizontal) {
          innerStyle.height = '100%';
        } else {
          innerStyle.maxHeight = '100%';
          innerStyle.height = `100%`;
        }

        return { style: innerStyle };
      }, [horizontal, horizontalAlign, verticalAlign, padding])[0];
};

const buildRootProps = buildProps<ViewProps, StackTokens>(
  (tokenProps: StackTokens, theme: Theme) => {
    const { grow, horizontal, horizontalAlign, verticalAlign, maxHeight, maxWidth, padding, wrap, reversed, verticalFill } = tokenProps;

    const rootStyle: ViewStyle = {
      maxHeight,
      maxWidth,
      backgroundColor: tokenProps.backgroundColor,
      display: 'flex',
      flexDirection: horizontal ? (reversed ? 'row-reverse' : 'row') : reversed ? 'column-reverse' : 'column',
      ...(wrap && { flexWrap: 'wrap', height: '100%', overflow: 'visible' }),
      ...(verticalFill && { height: '100%' }),
      ...borderStyles.from(tokenProps, theme),
    };
    _mapAlignment(!!horizontal, horizontalAlign, verticalAlign, rootStyle);
    if (grow && !wrap) {
      rootStyle.flexGrow = typeof grow === 'boolean' ? (grow ? 1 : 0) : grow;
      rootStyle.overflow = 'hidden';
    }
    if (!wrap) {
      rootStyle.padding = parsePadding(padding, theme);
    }
    return { style: rootStyle };
  },
  [
    'grow',
    'horizontal',
    'horizontalAlign',
    'verticalAlign',
    'maxHeight',
    'maxWidth',
    'padding',
    'wrap',
    'reversed',
    'verticalFill',
    'backgroundColor',
    ...borderStyles.keys,
  ],
);

export const stylingSettings: UseStylingOptions<StackProps, StackSlotProps, StackTokens> = {
  tokens: [stackName],
  tokensThatAreAlsoProps,
  slotProps: {
    root: buildRootProps,
    inner: buildInnerProps,
  },
};
