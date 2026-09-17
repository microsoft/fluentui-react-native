import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { createFocusVisualProps_unstable } from '../../primitives/focus-visual/focus-visual';
import { getTooltipThemeStyles, tooltipStyles } from './tooltip.styles';
import type { TooltipState } from './tooltip.types';

/**
 * Applies cached token styles and slot-level styles to the Tooltip state. User styles are applied last on every slot
 * that accepts one.
 */
export function useTooltipStyles_unstable(state: TooltipState): void {
  const themeStyles = getTooltipThemeStyles(state);
  const rootStyle: StyleProp<ViewStyle> = [tooltipStyles.root, state.userStyle];
  const triggerStyle: StyleProp<ViewStyle> = [tooltipStyles.trigger, state.triggerUserStyle];
  const surfaceContentStyle: StyleProp<ViewStyle> = [tooltipStyles.surfaceContent, themeStyles.surfaceContent];
  const contentStyle: StyleProp<TextStyle> = [themeStyles.content, state.contentUserStyle];

  // The trigger focus radius matches the Popover trigger rather than the label surface: the trigger is supplied by the
  // caller and is not the surface, so the two reused triggers stay consistent with each other.
  state.focusVisualProps = createFocusVisualProps_unstable({
    borderRadius: state.tokens.borderRadius.base400,
    innerColor: state.tokens.color.strokeFocusInner,
    innerWidth: state.tokens.strokeWidth.thin,
    outerColor: state.tokens.color.strokeFocusOuter,
    outerWidth: state.tokens.strokeWidth.thick,
    visible: state.focused,
  });

  attachSlotProps(state.root, { style: rootStyle });
  attachSlotProps(state.trigger, { style: triggerStyle });
  attachSlotProps(state.surface, { style: themeStyles.surface });
  attachSlotProps(state.surfaceContent, { style: surfaceContentStyle });
  attachSlotProps(state.content, { style: contentStyle });
}
