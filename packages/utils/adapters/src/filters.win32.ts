import type { ImageProps, TextProps, ViewProps } from '@office-iss/react-native-win32';
import type { IFilterMask } from './filter.types';
import { getViewMaskBase, getImageMaskBase, getTextMaskBase } from './filters.base';

function getViewMask74() {
  return {
    ...getViewMaskBase(),
    accessibilityAccessKey: true,
    accessibilityAnnotation: true,
    accessibilityControls: true,
    accessibilityDescribedBy: true,
    accessibilityDescription: true,
    accessibilityItemType: true,
    accessibilityLevel: true,
    accessibilityPositionInSet: true,
    accessibilitySetSize: true,
    animationClass: true,
    cursor: true,
    enableFocusRing: true,
    keyDownEvents: true,
    keyUpEvents: true,
    onBlurCapture: true,
    onFocusCapture: true,
    onKeyDown: true,
    onKeyDownCapture: true,
    onKeyUp: true,
    onKeyUpCapture: true,
    onMouseEnter: true,
    onMouseLeave: true,
    tooltip: true,
    'aria-controls': true,
    'aria-describedby': true,
    'aria-description': true,
    'aria-level': true,
    'aria-multiselectable': true,
    'aria-posinset': true,
    'aria-required': true,
    'aria-setsize': true,
  };
}

export function getViewMask(): IFilterMask<ViewProps> {
  // no need for forking, types for 74 satisfy 81
  return getViewMask74();
}

function getTextMask74() {
  return {
    ...getTextMaskBase(),
    accessibilityAccessKey: true,
    accessibilityAnnotation: true,
    accessibilityControls: true,
    accessibilityDescribedBy: true,
    accessibilityDescription: true,
    accessibilityItemType: true,
    accessibilityLevel: true,
    accessibilityPositionInSet: true,
    accessibilitySetSize: true,
    focusable: true,
    keyDownEvents: true,
    keyUpEvents: true,
    onBlur: true,
    onBlurCapture: true,
    onFocus: true,
    onFocusCapture: true,
    onKeyDown: true,
    onKeyDownCapture: true,
    onKeyUp: true,
    onKeyUpCapture: true,
    textStyle: true,
    tooltip: true,
    'aria-controls': true,
    'aria-describedby': true,
    'aria-description': true,
    'aria-level': true,
    'aria-multiselectable': true,
    'aria-posinset': true,
    'aria-required': true,
    'aria-setsize': true,
  };
}

export function getTextMask(): IFilterMask<TextProps> {
  // no need for forking, types for 74 satisfy 81
  return getTextMask74();
}

function getImageMask74() {
  return {
    ...getImageMaskBase(),
    accessibilityAccessKey: true,
    accessibilityAnnotation: true,
    accessibilityControls: true,
    accessibilityDescribedBy: true,
    accessibilityDescription: true,
    accessibilityItemType: true,
    accessibilityLevel: true,
    accessibilityPositionInSet: true,
    accessibilitySetSize: true,
    'aria-controls': true,
    'aria-describedby': true,
    'aria-description': true,
    'aria-level': true,
    'aria-multiselectable': true,
    'aria-posinset': true,
    'aria-required': true,
    'aria-setsize': true,
  };
}

export function getImageMask(): IFilterMask<ImageProps> {
  // no need for forking, types for 74 satisfy 81
  return getImageMask74();
}
