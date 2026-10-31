import AppKit

/// React Native macOS uses a flipped coordinate space by default. Let's stay consistent and
/// ensure any views hosting React Native views are also flipped. This helps RCTTouchHandler
/// register clicks in the right location.
internal class FlippedVisualEffectView: NSVisualEffectView {
	override var isFlipped: Bool {
		return true
	}
}

/// Transparent flipped host for Callout content, drawn above the optional legacy backdrop.
internal class FlippedContentView: NSView {
	override var isFlipped: Bool {
		return true
	}
}
