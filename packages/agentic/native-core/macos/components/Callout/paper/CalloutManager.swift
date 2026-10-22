import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(RCTCalloutManager)
class CalloutManager: RCTViewManager, FRNCalloutPropertyManager {
	override func view()->NSView! {
		nonisolated(unsafe) let manager = self
		return MainActor.assumeIsolated {
			CalloutView(bridge: manager.bridge)
		}
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

	// Legacy commands: React Native calls these on the module's method queue; views can only be looked up on the main
	// queue.
	@objc func focusWindow(_ viewTag: NSNumber) {
		nonisolated(unsafe) let manager = self
		DispatchQueue.main.async {
			(manager.bridge?.uiManager?.view(forReactTag: viewTag) as? CalloutView)?.focusWindow()
		}
	}

	@objc func blurWindow(_ viewTag: NSNumber) {
		nonisolated(unsafe) let manager = self
		DispatchQueue.main.async {
			(manager.bridge?.uiManager?.view(forReactTag: viewTag) as? CalloutView)?.blurWindow()
		}
	}

	@objc func requestFocus(_ viewTag: NSNumber, generation: Int, requestId: Int, targetTag: Int, strategy: String) {
		withCallout(viewTag) { view, registry in
			view.requestFocus(generation, requestId: requestId, target: registry[NSNumber(value: targetTag)],
				strategy: strategy)
		}
	}

	@objc func close(_ viewTag: NSNumber, generation: Int, requestId: Int) {
		withCallout(viewTag) { view, _ in view.close(generation, requestId: requestId) }
	}

	@objc func reposition(_ viewTag: NSNumber, generation: Int, requestId: Int) {
		withCallout(viewTag) { view, _ in view.reposition(generation, requestId: requestId) }
	}

	/// Runs a modern command after the view updates React committed before it. Commands arrive on the UI manager
	/// queue, and a UI block runs on the main queue after the pending property updates, so a command observes the
	/// rendered state its caller requested it for, such as content made focusable just before a focus request.
	private func withCallout(_ viewTag: NSNumber,
		_ body: @escaping @MainActor @Sendable (CalloutView, [NSNumber: NSView]) -> Void) {
		bridge?.uiManager?.addUIBlock { _, registry in
			MainActor.assumeIsolated {
				guard let registry = registry, let view = registry[viewTag] as? CalloutView else { return }
				body(view, registry)
			}
		}
	}

	// Paper applies view properties on the main queue; the ObjC bridge resolves the tag in this bridge's registry.
	@objc(setAnchor:forView:)
	func setAnchor(_ anchor: NSView?, for view: NSView) {
		MainActor.assumeIsolated {
			(view as? CalloutView)?.setAnchorView(anchor)
		}
	}
}

// Keep the Paper component name used by older Callout JS bundles.
@objc(FRNCalloutManager)
class LegacyCalloutManager: CalloutManager {}
