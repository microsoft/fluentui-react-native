import type { Spacing, Theme } from '@fluentui-react-native/framework';

/**
 * Functions used by Stack components to simplify style-related computations
 */

// temporary hack to unblock this code while theme spacing types are agreed upon
const _spacingKey = 'spacing';

// Helper function that converts a themed spacing key (if given) to the corresponding themed spacing value.
const _getThemedSpacing = (space: `${number}` | `${number}px` | keyof Spacing, theme: Theme): number => {
  const spacing = theme[_spacingKey];
  if (spacing && typeof spacing === 'object' && typeof space === 'string') {
    if (spacing.hasOwnProperty(space)) {
      space = spacing[space];
    }
  }

  const numericalPart = parseFloat(space);
  const numericalValue = isNaN(numericalPart) ? 0 : numericalPart;
  return numericalValue;
};

export interface IParseGapResult {
  rowGap: number;
  columnGap: number;
}
type SpacingGapValue = `${number}px` | `${number}` | keyof Spacing;

/**
 * Takes in a gap size in either a CSS-style format (e.g. 10 or "10px")
 *  or a key of a themed spacing value (e.g. "s1").
 * Returns the separate numerical value of the padding (e.g. 10)
 *  and the CSS unit (e.g. "px").
 */
export function parseGap(
  gap: number | SpacingGapValue | `${SpacingGapValue} ${SpacingGapValue}` | undefined,
  theme: Theme,
): IParseGapResult {
  const result: IParseGapResult = {
    rowGap: 0,
    columnGap: 0,
  };
  if (gap) {
    if (typeof gap === 'number') {
      result.rowGap = gap;
      result.columnGap = gap;
    } else {
      const splitGap = gap.split(' ');
      if (splitGap.length === 2) {
        result.rowGap = _getThemedSpacing(splitGap[0] as SpacingGapValue, theme);
        result.columnGap = _getThemedSpacing(splitGap[1] as SpacingGapValue, theme);
      } else {
        const calculatedGap = _getThemedSpacing(gap as `${number}px` | keyof Spacing, theme);
        result.rowGap = calculatedGap;
        result.columnGap = calculatedGap;
      }
    }
  }
  return result;
}

/**
 * Takes in a padding in a CSS-style format (e.g. 10, "10px"), or a key of a themed spacing value
 *  (e.g. "s1")
 */
export function parsePadding(padding: keyof Spacing | number | `${number}px` | undefined, theme: Theme): number | undefined {
  if (padding === undefined || typeof padding === 'number') {
    return padding as undefined | number;
  }

  return _getThemedSpacing(padding, theme);
}
