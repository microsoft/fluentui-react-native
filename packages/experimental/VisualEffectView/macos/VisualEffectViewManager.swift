import Foundation

@objc(FRNVisualEffectViewManager)
class VisualEffectViewManager: RCTViewManager {

  override func view()->NSView! {
	let outerView = RCTView()
	outerView.backgroundColor = .clear
    let view = NSVisualEffectView()
	view.autoresizingMask = [.width, .height]
	view.blendingMode = .withinWindow
	outerView.addSubview(view)
	outerView.clipsToBounds = true
	return outerView
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
