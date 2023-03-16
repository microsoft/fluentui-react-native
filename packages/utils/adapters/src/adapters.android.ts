import type { TextProps, TextPropsIOS, ViewProps, ViewPropsIOS, ImageProps, ImagePropsIOS } from 'react-native';

import type { IFilterMask } from './filter.types';

// export core interface types
export type ITextProps = Omit<TextProps, keyof TextPropsIOS>;
export type IViewProps = Omit<ViewProps, keyof ViewPropsIOS>;
export type IImageProps = Omit<ImageProps, keyof ImagePropsIOS>;

const _viewMask: IFilterMask<IViewProps> = {
  children: true,
  accessible: true,
  accessibilityLabel: true,
  accessibilityRole: true,
  accessibilityState: true,
  accessibilityValue: true,
  accessibilityHint: true,
  collapsable: true,
  hitSlop: true,
  onLayout: true,
  pointerEvents: true,
  removeClippedSubviews: true,
  style: true,
  testID: true,
  nativeID: true,
  needsOffscreenAlphaCompositing: true,
  onStartShouldSetResponder: true,
  onStartShouldSetResponderCapture: true,
  onMoveShouldSetResponder: true,
  onMoveShouldSetResponderCapture: true,
  onResponderEnd: true,
  onResponderGrant: true,
  onResponderMove: true,
  onResponderReject: true,
  onAccessibilityAction: true,
  onAccessibilityEscape: true,
  onAccessibilityTap: true,
  onMagicTap: true,
  onResponderRelease: true,
  onResponderStart: true,
  onResponderTerminate: true,
  onResponderTerminationRequest: true,
  onTouchCancel: true,
  onTouchEnd: true,
  onTouchEndCapture: true,
  onTouchMove: true,
  onTouchStart: true,
  renderToHardwareTextureAndroid: true,
  importantForAccessibility: true,
  accessibilityActions: true,
  accessibilityElementsHidden: true,
  accessibilityIgnoresInvertColors: true,
  accessibilityLiveRegion: true,
  accessibilityViewIsModal: true,
  focusable: true,
};

const _textMask: IFilterMask<ITextProps> = {
  children: true,
  accessibilityActions: true,
  accessibilityElementsHidden: true,
  accessibilityHint: true,
  accessibilityIgnoresInvertColors: true,
  accessibilityLabel: true,
  accessibilityLiveRegion: true,
  accessibilityRole: true,
  accessibilityState: true,
  accessibilityValue: true,
  accessibilityViewIsModal: true,
  accessible: true,
  disabled: true,
  onAccessibilityAction: true,
  onAccessibilityEscape: true,
  onAccessibilityTap: true,
  importantForAccessibility: true,
  testID: true,
  allowFontScaling: true,
  ellipsizeMode: true,
  lineBreakMode: true,
  numberOfLines: true,
  onLayout: true,
  onLongPress: true,
  onMagicTap: true,
  onPress: true,
  onPressIn: true,
  onPressOut: true,
  selectable: true,
  selectionColor: true,
  style: true,
  textBreakStrategy: true,
  nativeID: true,
  maxFontSizeMultiplier: true,
  onTextLayout: true,
  dataDetectorType: true,
  android_hyphenationFrequency: true,
};

const _imageMask: IFilterMask<IImageProps> = {
  children: true,
  accessibilityActions: true,
  accessibilityElementsHidden: true,
  accessibilityHint: true,
  accessibilityIgnoresInvertColors: true,
  accessibilityLabel: true,
  accessibilityLiveRegion: true,
  accessibilityRole: true,
  accessibilityState: true,
  accessibilityValue: true,
  accessibilityViewIsModal: true,
  accessible: true,
  onAccessibilityAction: true,
  onAccessibilityEscape: true,
  onAccessibilityTap: true,
  importantForAccessibility: true,
  style: true,
  onError: true,
  onLayout: true,
  onLoad: true,
  onLoadEnd: true,
  onLoadStart: true,
  onMagicTap: true,
  borderBottomLeftRadius: true,
  borderBottomRightRadius: true,
  borderRadius: true,
  borderTopLeftRadius: true,
  borderTopRightRadius: true,
  progressiveRenderingEnabled: true,
  source: true,
  resizeMethod: true,
  resizeMode: true,
  loadingIndicatorSource: true,
  testID: true,
  defaultSource: true,
  fadeDuration: true,
  nativeID: true,
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
