import type { ImageProps, TextProps, ViewProps } from 'react-native-macos';

import type { IFilterMask } from './filter.types';

// export core interface types
export type ITextProps = TextProps;
export type IViewProps = ViewProps;
export type IImageProps = ImageProps;

const _viewMask: IFilterMask<IViewProps> = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  acceptsFirstMouse: true,
  acceptsKeyboardFocus: true,
  accessible: true,
  accessibilityActions: true,
  accessibilityElementsHidden: true,
  accessibilityHint: true,
  accessibilityIgnoresInvertColors: true,
  accessibilityLabel: true,
  accessibilityLiveRegion: true,
  accessibilityRole: true,
  accessibilityState: true,
  accessibilityValue: true,
  children: true,
  draggedTypes: true,
  enableFocusRing: true,
  focusable: true,
  hitSlop: true,
  importantForAccessibility: true,
  nativeID: true,
  nextKeyViewTag: true,
  onLayout: true,
  onAccessibilityAction: true,
  onAccessibilityEscape: true,
  onBlur: true,
  onDragEnter: true,
  onDragLeave: true,
  onDrop: true,
  onFocus: true,
  onKeyUp: true,
  onMouseEnter: true,
  onMouseLeave: true,
  onMoveShouldSetResponder: true,
  onMoveShouldSetResponderCapture: true,
  onPreferredScrollerStyleDidChange: true,
  onResponderEnd: true,
  onResponderGrant: true,
  onResponderMove: true,
  onResponderReject: true,
  onResponderRelease: true,
  onResponderStart: true,
  onResponderTerminate: true,
  onResponderTerminationRequest: true,
  onStartShouldSetResponder: true,
  onStartShouldSetResponderCapture: true,
  pointerEvents: true,
  removeClippedSubviews: true,
  style: true,
  testID: true,
  tooltip: true,
  validKeysDown: true,
  validKeysUp: true,
};

const _textMask: IFilterMask<ITextProps> = {
  accessibilityActions: true,
  accessibilityElementsHidden: true,
  accessibilityHint: true,
  accessibilityIgnoresInvertColors: true,
  accessibilityLabel: true,
  accessibilityRole: true,
  accessibilityState: true,
  accessibilityValue: true,
  accessible: true,
  adjustsFontSizeToFit: true,
  allowFontScaling: true,
  children: true,
  dataDetectorType: true,
  disabled: true,
  ellipsizeMode: true,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  enableFocusRing: true,
  lineBreakMode: true,
  maxFontSizeMultiplier: true,
  minimumFontScale: true,
  nativeID: true,
  numberOfLines: true,
  onAccessibilityAction: true,
  onAccessibilityEscape: true,
  sydufsh: true,
  onAccessibilityTap: true,
  onLayout: true,
  onLongPress: true,
  onPress: true,
  onPressIn: true,
  onPressOut: true,
  onTextLayout: true,
  selectionColor: true,
  selectable: true,
  style: true,
  suppressHighlighting: true,
  testID: true,
  tooltip: true,
};

const _imageMask: IFilterMask<IImageProps> = {
  accessibilityActions: true,
  accessibilityElementsHidden: true,
  accessibilityHint: true,
  accessibilityIgnoresInvertColors: true,
  accessibilityLabel: true,
  accessibilityLiveRegion: true,
  accessibilityRole: true,
  accessibilityState: true,
  accessibilityValue: true,
  accessible: true,
  blurRadius: true,
  borderBottomLeftRadius: true,
  borderBottomRightRadius: true,
  borderRadius: true,
  borderTopLeftRadius: true,
  borderTopRightRadius: true,
  capInsets: true,
  children: true,
  defaultSource: true,
  importantForAccessibility: true,
  loadingIndicatorSource: true,
  onAccessibilityAction: true,
  onAccessibilityEscape: true,
  onAccessibilityTap: true,
  onError: true,
  onLayout: true,
  onLoad: true,
  onLoadEnd: true,
  onLoadStart: true,
  onPartialLoad: true,
  onProgress: true,
  progressiveRenderingEnabled: true,
  resizeMethod: true,
  resizeMode: true,
  source: true,
  style: true,
  testID: true,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  tooltip: true,
};

export function filterViewProps(propName: string): boolean {
  return _viewMask[propName];
}

export function filterTextProps(propName: string): boolean {
  return _textMask[propName];
}

export function filterImageProps(propName: string): boolean {
  return _imageMask[propName];
}
