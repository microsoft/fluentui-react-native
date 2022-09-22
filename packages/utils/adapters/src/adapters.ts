import { TextProps, ViewProps, ImageProps, PressableProps } from 'react-native';
import { IFilterMask } from './filter.types';
import type { ITextWin32Props, IViewWin32Props } from '@office-iss/react-native-win32';

// export core interface types
export type ITextProps = TextProps & Partial<ITextWin32Props>;
export type IViewProps = ViewProps & Partial<IViewWin32Props>;
export type IImageProps = ImageProps;

// GH #1035: Tempoarily create this type while it is missing from DefinitelyTyped
type PressableHoverProps = {
  /**
   * Duration to wait after hover in before calling `onHoverIn`.
   */
  delayHoverIn?: number;

  /**
   * Duration to wait after hover out before calling `onHoverOut`.
   */
  delayHoverOut?: number;

  /**
   * Called when the hover is activated to provide visual feedback.
   */
  onHoverIn?: (event: MouseEvent) => any;

  /**
   * Called when the hover is deactivated to undo visual feedback.
   */
  onHoverOut?: (event: MouseEvent) => any;
};

// Extend PressableProps to include platform specific props
export type AdaptedPressableProps = PressableProps & IViewProps & PressableHoverProps;

const _viewMask: IFilterMask<IViewProps> = {
  children: true,
  accessible: true,
  accessibilityAccessKey: true,
  accessibilityControls: true,
  accessibilityItemType: true,
  accessibilityLabel: true,
  accessibilityRole: true,
  accessibilityState: true,
  accessibilityHint: true,
  accessibilityValue: true,
  enableFocusRing: true,
  hitSlop: true,
  onLayout: true,
  pointerEvents: true,
  removeClippedSubviews: true,
  style: true,
  testID: true,
  nativeID: true,
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
  importantForAccessibility: true,
  accessibilityActions: true,
  accessibilityElementsHidden: true,
  accessibilityIgnoresInvertColors: true,
  accessibilityLiveRegion: true,
  accessibilityViewIsModal: true,
  collapsable: true,
  needsOffscreenAlphaCompositing: true,
  isTVSelectable: true,
  renderToHardwareTextureAndroid: true,
  shouldRasterizeIOS: true,
  hasTVPreferredFocus: true,
  tvParallaxMagnification: true,
  tvParallaxProperties: true,
  tvParallaxShiftDistanceX: true,
  tvParallaxShiftDistanceY: true,
  tvParallaxTiltAngle: true,
  focusable: true,
  accessibilityAnnotation: true,
  accessibilityDescription: true,
  accessibilityDescribedBy: true,
  accessibilityLabeledBy: true,
  accessibilityLevel: true,
  accessibilityPositionInSet: true,
  accessibilitySetSize: true,
  animationClass: true,
  cursor: true,
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
  onMouseEnter: true,
  onMouseLeave: true,
  tooltip: true,
  type: true,
};

const _textMask: IFilterMask<ITextProps> = {
  children: true,
  accessibilityActions: true,
  accessibilityControls: true,
  accessibilityElementsHidden: true,
  accessibilityHint: true,
  accessibilityIgnoresInvertColors: true,
  accessibilityItemType: true,
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
  textBreakStrategy: true,
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
  style: true,
  nativeID: true,
  maxFontSizeMultiplier: true,
  adjustsFontSizeToFit: true,
  minimumFontScale: true,
  selectable: true,
  selectionColor: true,
  suppressHighlighting: true,
  accessibilityDescribedBy: true,
  accessibilityLabeledBy: true,
  keyDownEvents: true,
  keyUpEvents: true,
  onKeyDown: true,
  onKeyDownCapture: true,
  onKeyUp: true,
  onKeyUpCapture: true,
  textStyle: true,
  tooltip: true,
  onTextLayout: true,
  dataDetectorType: true,
  focusable: true,
  onBlur: true,
  onBlurCapture: true,
  onFocus: true,
  onFocusCapture: true,
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
  onPartialLoad: true,
  onProgress: true,
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
  blurRadius: true,
  capInsets: true,
  width: true,
  height: true,
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
