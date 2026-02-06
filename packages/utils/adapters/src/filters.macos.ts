import type { ImageProps, TextProps, ViewProps } from 'react-native-macos';
import type { IFilterMask } from './filter.types';
import { getRnVersion, getImageMaskBase, getTextMaskBase, getViewMaskBase } from './filters.base';

// export core interface types
export type ITextProps = TextProps;
export type IViewProps = ViewProps;
export type IImageProps = ImageProps;

function getMacViewMask74() {
  return {
    ...getViewMaskBase(),
    acceptsFirstMouse: true,
    allowsVibrancy: true,
    draggedTypes: true,
    enableFocusRing: true,
    keyDownEvents: true,
    keyUpEvents: true,
    onDragEnter: true,
    onDragLeave: true,
    onDrop: true,
    onKeyDown: true,
    onKeyUp: true,
    onMouseEnter: true,
    onMouseLeave: true,
    passthroughAllKeyEvents: true,
    removeClippedSubviews: true,
    validKeysDown: true,
    validKeysUp: true,
    // onBlur, onFocus, onPreferredScrollerStyleDidChange, and tooltip aren't in the types but were injected
    // in the 0.74 styles, keeping them here for now.
    onBlur: true,
    onFocus: true,
    onPreferredScrollerStyleDidChange: true,
    tooltip: true,
    mouseDownCanMoveWindow: true,
  };
}

function getMacViewMask81(): IFilterMask<ViewProps> {
  return {
    ...getMacViewMask74(),
    mouseDownCanMoveWindow: true,
    tvParallaxProperties: true,
  };
}

export function getViewMask(): IFilterMask<ViewProps> {
  const rnVersion = getRnVersion();
  if (rnVersion < 78) {
    return getMacViewMask74() as unknown as IFilterMask<ViewProps>;
  }
  return getMacViewMask81();
}

export function getTextMask(): IFilterMask<TextProps> {
  // no props added in 0.81 for Text, so just return the base mask
  return {
    ...getTextMaskBase(),
    disabled: true,
    focusable: true,
    onMouseEnter: true,
    onMouseLeave: true,
    textBreakStrategy: true,
    enableFocusRing: true, // injected in 0.74 for missing types
    tooltip: true, // injected in 0.74 for missing types
  };
}

export function getImageMask(): IFilterMask<ImageProps> {
  return {
    ...getImageMaskBase(),
    tooltip: true,
  };
}
