import type { StyleProp, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { useInputStyles_unstable } from '../input/useInputStyles';

import { searchBoxStyles } from './search-box.styles';
import type { SearchBoxState } from './search-box.types';

export function useSearchBoxStyles_unstable(state: SearchBoxState) {
  // The field pipeline resolves and attaches every chrome, size, typography, and visual-state binding.
  // SearchBox only renames the shared test identifiers and styles the two surfaces it adds.
  useInputStyles_unstable(state.field);

  attachSlotProps(state.root, { testID: 'search-box-root' });
  if (state.contents) {
    attachSlotProps(state.contents, { testID: 'search-box-contents' });
  }
  if (state.iconTextStack) {
    attachSlotProps(state.iconTextStack, { testID: 'search-box-icon-text-stack' });
  }
  if (state.underline) {
    attachSlotProps(state.underline, { testID: 'search-box-underline' });
  }

  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: state.field.iconColor,
      height: state.field.iconSize,
      width: state.field.iconSize,
    });
  }

  if (state.clearButtonGroup) {
    const clearButtonGroupStyle: StyleProp<ViewStyle> = [searchBoxStyles.clearButtonGroup, state.clearButtonGroupStyle];
    attachSlotProps(state.clearButtonGroup, {
      accessibilityElementsHidden: false,
      accessible: false,
      style: clearButtonGroupStyle,
      testID: 'search-box-clear-group',
    });
  }
}
