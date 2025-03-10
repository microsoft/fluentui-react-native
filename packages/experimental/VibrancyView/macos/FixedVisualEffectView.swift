import AppKit

#if USE_REACT_AS_MODULE
  import React
#endif  // USE_REACT_AS_MODULE

/// React Native macOS inherits some assumptions from React Native on iOS / UIKit.
/// This serves as an issue when we want to write our own native components derived from NSView, as we don't
/// inherit the "fixes" we need from RCTView to get views working properly.. This subclass "fixes" the minimal amount
/// so that our native component works as expected.
internal class FixedVisualEffectView: NSVisualEffectView {

  /// React Native macOS uses a flipped coordinate space by default. to match the other platforms.
  /// Let's stay consistent and ensure any views hosting React Native views are also flipped.
  /// This helps RCTTouchHandler register clicks in the right location, and ensures `layer.geometryFlipped` is true.
  override var isFlipped: Bool {
    return true
  }
}
