import { ITheme } from '@uifabricshared/theming-ramp';

/**
 * Functions used by Stack components to simplify style-related computations
 */

// temporary hack to unblock this code while theme spacing types are agreed upon
const _spacingKey = 'spacing';

// Helper function that converts a themed spacing key (if given) to the corresponding themed spacing value.
const _getThemedSpacing = (space: string, theme: ITheme): string => {
  const spacing = theme[_spacingKey];
  if (spacing && typeof spacing === 'object') {
    if (spacing.hasOwnProperty(space)) {
      return spacing[space];
    }
  }
  return space;
};

// Helper function that takes a gap as a string and converts it into a { value, unit } representation.
const _getValueUnitGap = (gap: string): { value: number; unit: string } => {
  const numericalPart = parseFloat(gap);
  const numericalValue = isNaN(numericalPart) ? 0 : numericalPart;
  const numericalString = isNaN(numericalPart) ? '' : numericalPart.toString();

  const unitPart = gap.substring(numericalString.toString().length);

  return {
    value: numericalValue,
    unit: unitPart || 'px',
  };
};

export interface IParseGapResult {
  rowGap: { value: number; unit: string };
  columnGap: { value: number; unit: string };
}

/**
 * Takes in a gap size in either a CSS-style format (e.g. 10 or "10px")
 *  or a key of a themed spacing value (e.g. "s1").
 * Returns the separate numerical value of the padding (e.g. 10)
 *  and the CSS unit (e.g. "px").
 */
export function parseGap(gap: number | string | undefined, theme: ITheme): IParseGapResult {
  const result: IParseGapResult = {
    rowGap: { value: 0, unit: 'px' },
    columnGap: { value: 0, unit: 'px' },
  };
  if (gap) {
    if (typeof gap === 'number') {
      result.rowGap.value = gap;
      result.columnGap.value = gap;
    } else {
      const splitGap = gap.split(' ');
      if (splitGap.length === 2) {
        result.rowGap = _getValueUnitGap(_getThemedSpacing(splitGap[0], theme));
        result.columnGap = _getValueUnitGap(_getThemedSpacing(splitGap[1], theme));
      } else {
        const calculatedGap = _getValueUnitGap(_getThemedSpacing(gap, theme));
        result.rowGap = calculatedGap;
        result.columnGap = calculatedGap;
      }
    }
  }
  return result;
}

/**
 * Takes in a padding in a CSS-style format (e.g. 10, "10px", "10px 10px", etc.)
 *  where the separate padding values can also be the key of a themed spacing value
 *  (e.g. "s1 m", "10px l1 20px l2", etc.).
 * Returns a CSS-style padding.
 */
export function parsePadding(padding: number | string | undefined, theme: ITheme): number | string | undefined {
  if (padding === undefined || typeof padding === 'number' || padding === '') {
    return padding;
  }

  const paddingValues = padding.split(' ');
  if (paddingValues.length < 2) {
    return _getThemedSpacing(padding, theme);
  }

  return paddingValues.reduce((padding1: string, padding2: string) => {
    return _getThemedSpacing(padding1, theme) + ' ' + _getThemedSpacing(padding2, theme);
  });
}
