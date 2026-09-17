import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import type { FlexTokens, ThemeState } from '@fluentui-react-native/design';
import { getNumericStyleValueAsNumber, getThemedStateStyleFactory } from '@fluentui-react-native/design/styling';
import type { StyleDefinition } from '@fluentui-react-native/design/styling';
import { size200 } from '@fluentui-react-native/design/tokens/global';

import type { SearchBoxSize } from './search-box.types';

export const searchBoxStyles = StyleSheet.create({
  clearButtonGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    minWidth: 0,
  },
});

const sizeLevels = [['small', 'medium', 'large']] as const;
type SizeLevels = typeof sizeLevels;

/**
 * The clear button keeps the shared small button geometry at medium and large. The small field is only
 * 24pt tall, which is exactly the small button box, so the button is inset there to keep the field
 * boundary and the button's own focus visual visible.
 */
function createClearButtonStyleDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, SizeLevels> {
  const { spacing } = tokens;
  const inset = getNumericStyleValueAsNumber(spacing.componentBase50);
  return {
    small: {
      minHeight: size200,
      minWidth: size200,
      paddingHorizontal: inset,
      paddingVertical: inset,
    },
    medium: {},
    large: {},
  };
}

const getThemedClearButtonStyle = getThemedStateStyleFactory('SearchBox.clearButton', createClearButtonStyleDefinition, sizeLevels);

export function getSearchBoxClearButtonStyle(state: ThemeState, size: SearchBoxSize): ViewStyle {
  return getThemedClearButtonStyle(state, [size]);
}
