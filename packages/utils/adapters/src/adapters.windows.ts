import { IViewWindowsProps } from 'react-native-windows';
import { PressableProps, TextProps } from 'react-native';
import { ImageProps } from 'react-native';
import { IFilterMask } from './filter.types';

// export core interface types from RN
export type ITextProps = TextProps;
export type IViewProps = IViewWindowsProps;
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
  accessibilityActions: true,
  accessibilityElementsHidden: true,
  accessibilityIgnoresInvertColors: true,
  accessibilityLabel: true,
  accessibilityLiveRegion: true,
  accessibilityPosInSet: true,
  accessibilityRole: true,
  accessibilitySetSize: true,
  accessibilityState: true,
  accessibilityValue: true,
  accessibilityViewIsModal: true,
  accessibilityHint: true,
  collapsable: true,
  hitSlop: true,
  onLayout: true,
  pointerEvents: true,
  removeClippedSubviews: true,
  style: true,
  testID: true,
  nativeID: true,
  hasTVPreferredFocus: true,
  importantForAccessibility: true,
  isTVSelectable: true,
  keyDownEvents: true,
  keyUpEvents: true,
  needsOffscreenAlphaCompositing: true,
  onKeyDown: true,
  onKeyDownCapture: true,
  onKeyUp: true,
  onKeyUpCapture: true,
  onMagicTap: true,
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
  shouldRasterizeIOS: true,
  tvParallaxMagnification: true,
  tvParallaxProperties: true,
  tvParallaxShiftDistanceX: true,
  tvParallaxShiftDistanceY: true,
  tvParallaxTiltAngle: true,
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
  style: true,
  nativeID: true,
  maxFontSizeMultiplier: true,
  adjustsFontSizeToFit: true,
  minimumFontScale: true,
  suppressHighlighting: true,
  selectable: true,
  selectionColor: true,
  textBreakStrategy: true,
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
