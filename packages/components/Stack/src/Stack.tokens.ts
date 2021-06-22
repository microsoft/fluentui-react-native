import { Alignment, IStackTokens } from './Stack.types';
import { parseGap, parsePadding } from './StackUtils';
import { ViewStyle, ViewProps } from 'react-native';
import { ITheme } from '@uifabricshared/theming-ramp';
import { styleFunction } from '@uifabricshared/foundation-tokens';

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

function _buildInnerStyles(tokenProps: IStackTokens, theme: ITheme): ViewProps {
  const { horizontal, wrap, horizontalAlign, verticalAlign, padding } = tokenProps;

  let innerStyle: ViewStyle | undefined = undefined;
  const childrenGap = tokenProps.childrenGap || tokenProps.gap;
  const { rowGap, columnGap } = parseGap(childrenGap, theme);
  const horizontalMargin = `${-0.5 * columnGap.value}${columnGap.unit}`;
  const verticalMargin = `${-0.5 * rowGap.value}${rowGap.unit}`;

  if (wrap) {
    innerStyle = {
      marginLeft: horizontalMargin,
      marginRight: horizontalMargin,
      marginTop: verticalMargin,
      marginBottom: verticalMargin,
      padding: parsePadding(padding, theme),
      width: columnGap.value === 0 ? '100%' : `calc(100% + ${columnGap.value}${columnGap.unit})`,
    };
    _mapAlignment(!!horizontal, horizontalAlign, verticalAlign, innerStyle);
    const heightToSet = rowGap.value === 0 ? '100%' : `calc(100% + ${rowGap.value}${rowGap.unit})`;
    if (horizontal) {
      innerStyle.height = heightToSet;
    } else {
      innerStyle.maxHeight = heightToSet;
      innerStyle.height = `calc(100% + ${rowGap.value}${rowGap.unit})`;
    }
  }
  return { style: innerStyle };
}

export const buildStackInnerStyles = styleFunction<ViewProps, IStackTokens, ITheme>(_buildInnerStyles, _innerKeyProps);

function _buildRootStyles(tokenProps: IStackTokens, theme: ITheme): ViewProps {
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

export const buildStackRootStyles = styleFunction<ViewProps, IStackTokens, ITheme>(_buildRootStyles, _keyProps);
