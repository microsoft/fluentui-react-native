import { StyleSheet } from 'react-native';
import type { ColorValue } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { FlexTokens } from '@fluentui-react-native/design';

import type { InputVisualState } from '../input/input.types';

// The hidden row that measures the full selected labels may grow this wide.
const measureWidth = 4096;

export const dropdownStyles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
  },
  trigger: {
    overflow: 'hidden',
  },
  valueBox: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  measure: {
    flexDirection: 'row',
    left: 0,
    opacity: 0,
    position: 'absolute',
    top: 0,
    width: measureWidth,
  },
  measureText: {
    flexShrink: 0,
  },
});

/** Popover's surface bindings with the list's reduced padding; options stack without a gap. */
export const getDropdownThemeStyles = themedStyleSheetFactory('Dropdown.listbox', ({ tokens }) =>
  StyleSheet.create({
    surface: {
      backgroundColor: tokens.color.surfaceNeutralNearer.rest,
      borderColor: tokens.color.strokeNeutralSubtle.rest,
      borderRadius: tokens.borderRadius.base400,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thin,
      padding: tokens.spacing.componentBase100,
    },
  }),
);

/** The chevron is disabled when disabled, primary in error or while the focus indicator shows, and secondary otherwise. */
export function getDropdownChevronColor(tokens: FlexTokens, visualState: InputVisualState, focusVisible: boolean): ColorValue {
  if (visualState === 'disabled') {
    return tokens.color.foregroundNeutralDisabled.rest;
  }
  if (visualState === 'error' || focusVisible) {
    return tokens.color.foregroundNeutralPrimary.rest;
  }
  return tokens.color.foregroundNeutralSecondary.rest;
}
