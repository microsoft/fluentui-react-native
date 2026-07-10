//
//  RCTCalloutComponentView.h
//  FRNCallout
//
//  Copyright (c) Microsoft Corporation.
//  Licensed under the MIT License.
//
//  Fabric (New Architecture) component view for the macOS Callout. The whole file is gated behind
//  RCT_NEW_ARCH_ENABLED so the package continues to build against the legacy (Paper) architecture,
//  where the Callout is provided by RCTCalloutManager / CalloutView (RCTViewManager).
//

#ifdef RCT_NEW_ARCH_ENABLED

#import <React/RCTViewComponentView.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Fabric component view backing the "RCTCallout" native component (see CalloutNativeComponent.ts).
 * It hosts the shared `FRNCalloutView` (which renders the Callout in its own floating window) and
 * bridges Fabric props, children, commands and events onto it.
 */
@interface RCTCalloutComponentView : RCTViewComponentView
@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
