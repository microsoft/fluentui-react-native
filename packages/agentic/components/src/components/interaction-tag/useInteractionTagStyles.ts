import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { createFocusVisualProps_unstable } from '../../primitives/focus-visual/focus-visual';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';

import {
  getInteractionTagActionStyle,
  getInteractionTagBackgroundStyle,
  getInteractionTagContainerStyle,
  getInteractionTagContentStyle,
  getInteractionTagDividerColorStyle,
  getInteractionTagForegroundStyle,
  getInteractionTagIconSize,
  getInteractionTagLeadingCornerStyle,
  getInteractionTagThemedStyles,
  getInteractionTagTrailingCornerStyle,
  interactionTagStyles,
} from './interaction-tag.styles';
import type { InteractionTagState } from './interaction-tag.types';

/**
 * Layers a region's outer corner radii over the focus visual rings. `createFocusVisualProps_unstable` accepts a single
 * radius, and each action region rounds only the edge that does not meet the divider.
 */
function withCorners(props: FocusVisualProps, corners: ViewStyle, testID: string): FocusVisualProps {
  return {
    ...props,
    inner: props.inner ? { ...props.inner, style: [props.inner.style, corners] } : props.inner,
    style: [props.style, corners],
    testID,
  };
}

export function useInteractionTagStyles_unstable(state: InteractionTagState) {
  const { disabled, dismissState, primaryState, size } = state;
  const themedStyles = getInteractionTagThemedStyles(state);
  const foreground = getInteractionTagForegroundStyle(state);
  const containerStyle = getInteractionTagContainerStyle(state);
  const actionStyle = getInteractionTagActionStyle(state);
  const leadingCorners = getInteractionTagLeadingCornerStyle(state);
  const trailingCorners = getInteractionTagTrailingCornerStyle(state);
  const iconSizes = getInteractionTagIconSize(size);

  const rootStyle: StyleProp<ViewStyle> = [interactionTagStyles.root, containerStyle, state.userStyle];
  const primaryActionStyle: StyleProp<ViewStyle> = [
    interactionTagStyles.action,
    interactionTagStyles.primaryAction,
    actionStyle,
    leadingCorners,
    getInteractionTagBackgroundStyle(state, primaryState),
  ];
  const dismissStyle: StyleProp<ViewStyle> = [
    interactionTagStyles.action,
    interactionTagStyles.dismiss,
    actionStyle,
    trailingCorners,
    getInteractionTagBackgroundStyle(state, dismissState),
  ];
  const dividerStyle: StyleProp<ViewStyle> = [
    interactionTagStyles.divider,
    themedStyles.divider,
    getInteractionTagDividerColorStyle(state),
  ];
  const contentStyle: StyleProp<TextStyle> = [interactionTagStyles.content, getInteractionTagContentStyle(state), foreground];

  const focusVisualOptions = {
    innerColor: state.tokens.color.strokeFocusInner,
    innerWidth: state.tokens.strokeWidth.thin,
    outerColor: state.tokens.color.strokeFocusOuter,
    outerWidth: state.tokens.strokeWidth.thick,
  };

  state.primaryFocusVisualProps = withCorners(
    createFocusVisualProps_unstable({ ...focusVisualOptions, visible: primaryState.focused && !disabled }),
    leadingCorners,
    'focus-visual-primary-action',
  );
  state.dismissFocusVisualProps = withCorners(
    createFocusVisualProps_unstable({ ...focusVisualOptions, visible: dismissState.focused && !disabled }),
    trailingCorners,
    'focus-visual-dismiss',
  );

  attachSlotProps(state.root, { style: rootStyle });
  attachSlotProps(state.primaryAction, { style: primaryActionStyle });
  attachSlotProps(state.divider, { style: dividerStyle });
  attachSlotProps(state.dismiss, { style: dismissStyle });

  if (state.avatar) {
    attachSlotProps(state.avatar, { ...hiddenFromAccessibilityProps, size: iconSizes.avatar });
  }
  if (state.leadingIcon) {
    attachSlotProps(state.leadingIcon, {
      accessible: false,
      color: foreground.color,
      height: iconSizes.leading,
      style: interactionTagStyles.icon,
      width: iconSizes.leading,
    });
  }
  if (state.content) {
    attachSlotProps(state.content, { style: contentStyle });
  }
  if (state.dismissIcon) {
    attachSlotProps(state.dismissIcon, {
      accessible: false,
      color: foreground.color,
      height: iconSizes.dismiss,
      style: interactionTagStyles.icon,
      width: iconSizes.dismiss,
    });
  }
}
