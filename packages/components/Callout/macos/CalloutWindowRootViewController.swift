import Foundation
import AppKit

class CalloutWindowRootViewController: NSViewController {

	@available(*, unavailable)
	required init(NibName: NSString?, bundle: Bundle?) {
			preconditionFailure()
	}
	
	@available(*, unavailable)
	required init?(coder: NSCoder) {
			preconditionFailure()
	}
	
	init() {
		super.init(nibName: nil, bundle: nil)
	}
	
	override func loadView() {
		view = CalloutContentView()
	}
}

class CalloutContentView: NSView {
	override var allowsVibrancy: Bool {
		get {
			return true
		}
	}
}
