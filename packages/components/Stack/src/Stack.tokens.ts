import type { ViewStyle, ViewProps } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';
import { styleFunction } from '@uifabricshared/foundation-tokens';

import type { Alignment, IStackTokens } from './Stack.types';
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

const _innerKeyProps: (keyof IStackTokens)[] = [
  'horizontal',
  // 'reversed',
  'gap',
  'horizontalAlign',
  'verticalAlign',
  // 'disableShrink',
  'childrenGap',
  'padding',
];

function _buildInnerStyles(tokenProps: IStackTokens, theme: Theme): ViewProps {
  const { horizontal, wrap, horizontalAlign, verticalAlign, padding } = tokenProps;

  let innerStyle: ViewStyle | undefined = undefined;
  const childrenGap = tokenProps.childrenGap || tokenProps.gap;
  const { rowGap, columnGap } = parseGap(childrenGap, theme);

  if (wrap) {
    innerStyle = {
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
      innerStyle.height = '100%';
    }
  }
  return { style: innerStyle };
}

export const buildStackInnerStyles = styleFunction<ViewProps, IStackTokens, Theme>(_buildInnerStyles, _innerKeyProps);

function _buildRootStyles(tokenProps: IStackTokens, theme: Theme): ViewProps {
  const { grow, horizontal, horizontalAlign, verticalAlign, maxHeight, maxWidth, padding, wrap } = tokenProps;
  // const childrenGap = tokenProps.childrenGap || tokenProps.gap;
  // const { rowGap, columnGap } = parseGap(childrenGap, theme);

  const rootStyle: ViewStyle = {
    maxHeight,
    maxWidth,
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
  // verticalFill,
  // reversed,
  // disableShrink,
}
const _keyProps: (keyof IStackTokens)[] = [
  // 'verticalFill',
  'horizontal',
  // 'reversed',
  // 'gap',
  'grow',
  'wrap',
  'horizontalAlign',
  'verticalAlign',
  // 'disableShrink',
  // 'childrenGap',
  'maxHeight',
  'maxWidth',
  'padding',
];

export const buildStackRootStyles = styleFunction<ViewProps, IStackTokens, Theme>(_buildRootStyles, _keyProps);
