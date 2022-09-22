import type { ITextWin32Props, IViewWin32Props } from '@office-iss/react-native-win32';
import { ImageProps, PressableProps } from 'react-native';
import { IFilterMask } from './filter.types';

// export core interface types
export type ITextProps = ITextWin32Props;
export type IViewProps = IViewWin32Props;
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
  accessibilityActions: true,
  accessibilityAnnotation: true,
  accessibilityControls: true,
  accessibilityDescription: true,
  accessibilityDescribedBy: true,
  accessibilityItemType: true,
  accessibilityLabel: true,
  accessibilityLabeledBy: true,
  accessibilityLevel: true,
  accessibilityPositionInSet: true,
  accessibilityRole: true,
  accessibilitySetSize: true,
  accessibilityState: true,
  accessibilityHint: true,
  accessibilityValue: true,
  animationClass: true,
  cursor: true,
  enableFocusRing: true,
  hitSlop: true,
  onLayout: true,
  pointerEvents: true,
  removeClippedSubviews: true,
  style: true,
  testID: true,
  nativeID: true,
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
  onStartShouldSetResponder: true,
  onStartShouldSetResponderCapture: true,
  onMoveShouldSetResponder: true,
  onMoveShouldSetResponderCapture: true,
  onResponderEnd: true,
  onResponderGrant: true,
  onResponderMove: true,
  onResponderReject: true,
  onAccessibilityAction: true,
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
  tooltip: true,
  type: true,
  focusable: true,
};

const _textMask: IFilterMask<ITextProps> = {
  children: true,
  accessibilityActions: true,
  accessibilityControls: true,
  accessibilityDescribedBy: true,
  accessibilityHint: true,
  accessibilityItemType: true,
  accessibilityLabel: true,
  accessibilityLabeledBy: true,
  accessibilityRole: true,
  accessibilityState: true,
  accessibilityValue: true,
  accessible: true,
  onAccessibilityAction: true,
  onAccessibilityTap: true,
  testID: true,
  allowFontScaling: true,
  ellipsizeMode: true,
  lineBreakMode: true,
  numberOfLines: true,
  keyDownEvents: true,
  keyUpEvents: true,
  onKeyDown: true,
  onKeyDownCapture: true,
  onKeyUp: true,
  onKeyUpCapture: true,
  onLayout: true,
  onLongPress: true,
  onPress: true,
  onPressIn: true,
  onPressOut: true,
  onTextLayout: true,
  style: true,
  selectable: true,
  nativeID: true,
  maxFontSizeMultiplier: true,
  textStyle: true,
  tooltip: true,
  focusable: true,
  onBlur: true,
  onBlurCapture: true,
  onFocus: true,
  onFocusCapture: true,
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
