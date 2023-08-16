import AppKit

@objc(FRNVibrancyView)
open class VibrancyView: RCTView {

	@objc public convenience init() {
		self.init(frame: .zero)
	}

	public override init(frame frameRect: NSRect) {
		super.init(frame: frameRect)

		visualEffectView.autoresizingMask = [.width, .height]
		clipsToBounds = true

		addSubview(visualEffectView)
	}

	public required init?(coder: NSCoder) {
		fatalError("init(coder:) has not been implemented")
	}

	open override func insertReactSubview(_ subview: NSView!, at atIndex: Int) {
		visualEffectView.addSubview(subview)
	}

	@objc public func setMaterial(_ material: NSVisualEffectView.Material) {
		visualEffectView.material = material
	}

	@objc public func setBlendingMode(_ blendingMode: NSVisualEffectView.BlendingMode) {
		visualEffectView.blendingMode = blendingMode
	}

	@objc public func setState(_ state: NSVisualEffectView.State) {
		visualEffectView.state = state
	}

	private let visualEffectView = FixedVisualEffectView()
}
