import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { getLabelContentColor, getLabelIndicatorColor, getLabelThemedStyles, getLabelTypography, labelStyles } from './label.styles';
import type { LabelState } from './label.types';

export function useLabelStyles_unstable(state: LabelState): void {
  const styles = getLabelThemedStyles(state);
  const typography = getLabelTypography(state);
  attachSlotProps(state.root, { style: [styles.root, state.userStyle] });
  attachSlotProps(state.content, {
    style: [labelStyles.content, typography, getLabelContentColor(state), state.userContentStyle],
  });
  if (state.requiredIndicator) {
    attachSlotProps(state.requiredIndicator, {
      style: [labelStyles.requiredIndicator, typography, getLabelIndicatorColor(state), state.userRequiredIndicatorStyle],
    });
  }
}
