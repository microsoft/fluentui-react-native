import type { ImageProps, TextProps, ViewProps } from 'react-native-windows';
import type { IFilterMask } from './filter.types';
import { getViewMaskBase, getImageMaskBase, getTextMaskBase, getRnVersion } from './filters.base';

function getViewMask74() {
  return {
    ...getViewMaskBase(),
    accessibilityLevel: true,
    accessibilityPosInSet: true,
    accessibilitySetSize: true,
    enableFocusRing: true,
    keyDownEvents: true,
    keyUpEvents: true,
    onKeyDown: true,
    onKeyDownCapture: true,
    onKeyUp: true,
    onKeyUpCapture: true,
    onMouseEnter: true,
    onMouseLeave: true,
    tooltip: true,
    'aria-level': true,
    'aria-posinset': true,
    'aria-setsize': true,
  };
}

function getViewMask81(): IFilterMask<ViewProps> {
  return {
    ...getViewMask74(),
    accessibilityAnnotation: true,
    accessibilityItemType: true,
    accessibilityAccessKey: true,
    accessibilityDescription: true,
    'aria-description': true,
  };
}

export function getViewMask(): IFilterMask<ViewProps> {
  const rnVersion = getRnVersion();
  if (rnVersion < 78) {
    return getViewMask74() as unknown as IFilterMask<ViewProps>;
  }
  return getViewMask81();
}

function getTextMask74() {
  return {
    ...getTextMaskBase(),
    accessibilityLevel: true,
    accessibilityPosInSet: true,
    accessibilitySetSize: true,
    disabled: true,
    textBreakStrategy: true,
    'aria-level': true,
    'aria-posinset': true,
    'aria-setsize': true,
  };
}

function getTextMask81(): IFilterMask<TextProps> {
  return {
    ...getTextMask74(),
    accessibilityAnnotation: true,
    accessibilityItemType: true,
    accessibilityAccessKey: true,
    accessibilityDescription: true,
    'aria-description': true,
    tooltip: true,
  };
}

export function getTextMask(): IFilterMask<TextProps> {
  const rnVersion = getRnVersion();
  if (rnVersion < 78) {
    return getTextMask74() as unknown as IFilterMask<TextProps>;
  }
  return getTextMask81();
}

function getImageMask74() {
  return {
    ...getImageMaskBase(),
    accessibilityLevel: true,
    accessibilityPosInSet: true,
    accessibilitySetSize: true,
    'aria-level': true,
    'aria-posinset': true,
    'aria-setsize': true,
  };
}

function getImageMask81(): IFilterMask<ImageProps> {
  return {
    ...getImageMask74(),
    accessibilityAnnotation: true,
    accessibilityItemType: true,
    accessibilityAccessKey: true,
    accessibilityDescription: true,
    'aria-description': true,
  };
}

export function getImageMask(): IFilterMask<ImageProps> {
  const rnVersion = getRnVersion();
  if (rnVersion < 78) {
    return getImageMask74() as unknown as IFilterMask<ImageProps>;
  }
  return getImageMask81();
}
