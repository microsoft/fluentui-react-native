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

	// React Native calls these on the module's method queue; views can only be looked up on the main queue.
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
		nonisolated(unsafe) let manager = self
		DispatchQueue.main.async {
			guard let uiManager = manager.bridge?.uiManager,
				let view = uiManager.view(forReactTag: viewTag) as? CalloutView else { return }
			view.requestFocus(generation, requestId: requestId,
				target: uiManager.view(forReactTag: NSNumber(value: targetTag)), strategy: strategy)
		}
	}

	@objc func close(_ viewTag: NSNumber, generation: Int, requestId: Int) {
		nonisolated(unsafe) let manager = self
		DispatchQueue.main.async {
			(manager.bridge?.uiManager?.view(forReactTag: viewTag) as? CalloutView)?.close(generation, requestId: requestId)
		}
	}

	@objc func reposition(_ viewTag: NSNumber, generation: Int, requestId: Int) {
		nonisolated(unsafe) let manager = self
		DispatchQueue.main.async {
			(manager.bridge?.uiManager?.view(forReactTag: viewTag) as? CalloutView)?.reposition(generation, requestId: requestId)
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
