/**
 * Projects with complex multi-platform code should use @rnx-kit/metro-plugin-typescript to properly type check against the platform they are building
 *
 * However, for build steps just using a default config of tsc, this platform neutral definition of the view types will be used.  This is more relaxed
 * and slightly less accurate than the type checking of your bundle using @rnx-kit/metro-plugin-typescript.
 */

import type { TextProps, ViewProps, ImageProps } from 'react-native';
import { Platform } from 'react-native';
import type { IFilterMask } from './filter.types';

export function getRnVersion(): number {
  return Platform.constants.reactNativeVersion.minor;
}

function getViewMask74() {
  return {
    children: true,
    accessibilityActions: true,
    accessibilityElementsHidden: true,
    accessibilityHint: true,
    accessibilityIgnoresInvertColors: true,
    accessibilityLabel: true,
    accessibilityLabelledBy: true,
    accessibilityLanguage: true,
    accessibilityLiveRegion: true,
    accessibilityRole: true,
    accessibilityState: true,
    accessibilityValue: true,
    accessibilityViewIsModal: true,
    accessible: true,
    collapsable: true,
    focusable: true,
    hasTVPreferredFocus: true,
    hitSlop: true,
    id: true,
    importantForAccessibility: true,
    isTVSelectable: true,
    nativeID: true,
    needsOffscreenAlphaCompositing: true,
    onAccessibilityAction: true,
    onAccessibilityEscape: true,
    onAccessibilityTap: true,
    onBlur: true,
    onFocus: true,
    onLayout: true,
    onMagicTap: true,
    onMoveShouldSetResponder: true,
    onMoveShouldSetResponderCapture: true,
    onPointerCancel: true,
    onPointerCancelCapture: true,
    onPointerDown: true,
    onPointerDownCapture: true,
    onPointerEnter: true,
    onPointerEnterCapture: true,
    onPointerLeave: true,
    onPointerLeaveCapture: true,
    onPointerMove: true,
    onPointerMoveCapture: true,
    onPointerUp: true,
    onPointerUpCapture: true,
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
    onTouchCancel: true,
    onTouchEnd: true,
    onTouchEndCapture: true,
    onTouchMove: true,
    onTouchStart: true,
    pointerEvents: true,
    removeClippedSubviews: true,
    renderToHardwareTextureAndroid: true,
    role: true,
    shouldRasterizeIOS: true,
    style: true,
    tabIndex: true,
    testID: true,
    tvParallaxMagnification: true,
    tvParallaxProperties: true, // removed post 74
    tvParallaxShiftDistanceX: true,
    tvParallaxShiftDistanceY: true,
    tvParallaxTiltAngle: true,
    'aria-busy': true,
    'aria-checked': true,
    'aria-disabled': true,
    'aria-expanded': true,
    'aria-hidden': true,
    'aria-label': true,
    'aria-labelledby': true,
    'aria-live': true,
    'aria-modal': true,
    'aria-selected': true,
    'aria-valuemax': true,
    'aria-valuemin': true,
    'aria-valuenow': true,
    'aria-valuetext': true,
  };
}

const viewRemovedPost74 = {
  tvParallaxProperties: false,
};

function getViewMask81(): IFilterMask<ViewProps> {
  return {
    ...getViewMask74(),
    ...viewRemovedPost74,
    accessibilityShowsLargeContentViewer: true,
    accessibilityLargeContentTitle: true,
    accessibilityRespondsToUserInteraction: true,
    collapsableChildren: true,
    screenReaderFocusable: true,
  };
}

export function getViewMaskBase(): IFilterMask<ViewProps> {
  const rnVersion = getRnVersion();
  if (rnVersion < 78) {
    return getViewMask74() as unknown as IFilterMask<ViewProps>;
  }
  return getViewMask81();
}

function getTextMask74() {
  return {
    children: true,
    accessibilityActions: true,
    accessibilityElementsHidden: true,
    accessibilityHint: true,
    accessibilityIgnoresInvertColors: true,
    accessibilityLabel: true,
    accessibilityLabelledBy: true,
    accessibilityLanguage: true,
    accessibilityLiveRegion: true,
    accessibilityRole: true,
    accessibilityState: true,
    accessibilityValue: true,
    accessibilityViewIsModal: true,
    accessible: true,
    adjustsFontSizeToFit: true,
    allowFontScaling: true,
    android_hyphenationFrequency: true,
    dataDetectorType: true,
    dynamicTypeRamp: true,
    ellipsizeMode: true,
    id: true,
    importantForAccessibility: true,
    lineBreakMode: true,
    lineBreakStrategyIOS: true,
    maxFontSizeMultiplier: true,
    minimumFontScale: true,
    nativeID: true,
    numberOfLines: true,
    onAccessibilityAction: true,
    onAccessibilityEscape: true,
    onAccessibilityTap: true,
    onLayout: true,
    onLongPress: true,
    onMagicTap: true,
    onPress: true,
    onPressIn: true,
    onPressOut: true,
    onTextLayout: true,
    role: true,
    selectable: true,
    selectionColor: true,
    style: true,
    suppressHighlighting: true,
    testID: true,
    'aria-busy': true,
    'aria-checked': true,
    'aria-disabled': true,
    'aria-expanded': true,
    'aria-hidden': true,
    'aria-label': true,
    'aria-labelledby': true,
    'aria-live': true,
    'aria-modal': true,
    'aria-selected': true,
    'aria-valuemax': true,
    'aria-valuemin': true,
    'aria-valuenow': true,
    'aria-valuetext': true,
  };
}

function getTextMask81(): IFilterMask<TextProps> {
  return {
    ...getTextMask74(),
    accessibilityShowsLargeContentViewer: true,
    accessibilityLargeContentTitle: true,
    accessibilityRespondsToUserInteraction: true,
    disabled: true,
    pointerEvents: true,
    pressRetentionOffset: true,
    screenReaderFocusable: true,
    textBreakStrategy: true,
  };
}

export function getTextMaskBase(): IFilterMask<TextProps> {
  const rnVersion = getRnVersion();
  if (rnVersion < 78) {
    return getTextMask74() as unknown as IFilterMask<TextProps>;
  }
  return getTextMask81();
}

function getImageMask74() {
  return {
    children: true,
    accessibilityActions: true,
    accessibilityElementsHidden: true,
    accessibilityHint: true,
    accessibilityIgnoresInvertColors: true,
    accessibilityLabel: true,
    accessibilityLabelledBy: true,
    accessibilityLanguage: true,
    accessibilityLiveRegion: true,
    accessibilityRole: true,
    accessibilityState: true,
    accessibilityValue: true,
    accessibilityViewIsModal: true,
    accessible: true,
    alt: true,
    blurRadius: true,
    borderBottomLeftRadius: true,
    borderBottomRightRadius: true,
    borderRadius: true,
    borderTopLeftRadius: true,
    borderTopRightRadius: true,
    capInsets: true,
    crossOrigin: true,
    defaultSource: true,
    fadeDuration: true,
    height: true,
    id: true,
    importantForAccessibility: true,
    loadingIndicatorSource: true,
    nativeID: true,
    onAccessibilityAction: true,
    onAccessibilityEscape: true,
    onAccessibilityTap: true,
    onError: true,
    onLayout: true,
    onLoad: true,
    onLoadEnd: true,
    onLoadStart: true,
    onMagicTap: true,
    onPartialLoad: true,
    onProgress: true,
    progressiveRenderingEnabled: true,
    referrerPolicy: true,
    resizeMethod: true,
    resizeMode: true,
    role: true,
    source: true,
    src: true,
    srcSet: true,
    style: true,
    testID: true,
    tintColor: true,
    width: true,
    'aria-busy': true,
    'aria-checked': true,
    'aria-disabled': true,
    'aria-expanded': true,
    'aria-hidden': true,
    'aria-label': true,
    'aria-labelledby': true,
    'aria-live': true,
    'aria-modal': true,
    'aria-selected': true,
    'aria-valuemax': true,
    'aria-valuemin': true,
    'aria-valuenow': true,
    'aria-valuetext': true,
  };
}

function getImageMask81(): IFilterMask<ImageProps> {
  return {
    ...getImageMask74(),
    accessibilityShowsLargeContentViewer: true,
    accessibilityLargeContentTitle: true,
    accessibilityRespondsToUserInteraction: true,
    screenReaderFocusable: true,
  };
}

export function getImageMaskBase(): IFilterMask<ImageProps> {
  const rnVersion = getRnVersion();
  if (rnVersion < 78) {
    return getImageMask74() as unknown as IFilterMask<ImageProps>;
  }
  return getImageMask81();
}
