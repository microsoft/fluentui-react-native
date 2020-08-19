import Foundation
import FluentUI


@objc(MSFShimmerContainerView)
class ShimmerContainerView: UIView {

	@objc var appearance: NSDictionary = NSDictionary() {
		didSet {
			updateShimmerViewAppearance()
		}
	}
	
	@objc var shimmerAppearance: NSDictionary = NSDictionary() {
		didSet {
			updateShimmerAppearance()
		}
	}

// MARK: - UIView

	override public func layoutSubviews() {
		super.layoutSubviews()

		// Shimmer, by default, only considers top-level views when shimmering. This is
		// incompatible with Flexbox, which wants you to wrap everything in more views to achieve
		// a specific layout. The solution is to get a list of all the leaves of the subview tree
		// and shimmer those by creating "mirror" views to mirror the RCTViews in a flat heirarchy in
		// the shimmer container.
		mirrors.forEach { $0.removeFromSuperview() }
		mirrors = []

		var leaves = [UIView]()
		containerLeaves(view: self, leaves: &leaves)

		for leaf in leaves {
			guard let superview = leaf.superview, leaf != currentShimmerView else {
				continue
			}

			let frame = superview.convert(leaf.frame, to: self.subviews.first)

			let mirror = leaf is RCTTextView ? UILabel(frame: frame) : UIView(frame: frame)
			mirrors.append(mirror)

			self.addSubview(mirror)
		}

		if let shimmer = currentShimmerView {
			self.bringSubviewToFront(shimmer)
		}
	}
	
// MARK: - UIView+React

	override func didUpdateReactSubviews() {
		super.didUpdateReactSubviews()
		
		// Exclude the react subview in favor of the flattened mirror views
		excludedViews = reactSubviews()
	}
	
// MARK: - Private
	
	private func updateShimmerView(excludedViews: [UIView] = []) {
		currentShimmerView?.removeFromSuperview()
		let shimmerView = ShimmerView(containerView: self,
									  excludedViews: excludedViews,
									  animationSynchronizer: Self.animationSynchronizer)
		shimmerView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
		currentShimmerView = shimmerView
		self.addSubview(shimmerView)
	}
	
	private func containerLeaves(view: UIView, leaves: inout [UIView]) {
		for v in view.subviews {
			if v.subviews.isEmpty && v != currentShimmerView {
				leaves.append(v)
			} else if !v.isHidden {
				containerLeaves(view: v, leaves: &leaves)
			}
		}
	}
	
	private func updateShimmerViewAppearance() {
		assert(Thread.isMainThread)
		
		if let currentShimmerView = currentShimmerView {
			let oldAppearance = currentShimmerView.appearance
			
			let tintColor = RCTConvert.uiColor(appearance["tintColor"] as? NSNumber) ?? oldAppearance.tintColor
			let cornerRadius = appearance["cornerRadius"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldAppearance.cornerRadius))
			let labelCornerRadius = appearance["labelCornerRadius"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldAppearance.labelCornerRadius))
			let usesTextHeightForLabels = appearance["usesTextHeightForLabels"] as? NSNumber ?? NSNumber(booleanLiteral: oldAppearance.usesTextHeightForLabels)
			let labelHeight = appearance["labelHeight"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldAppearance.labelHeight))

			currentShimmerView.appearance = ShimmerViewAppearance(
				tintColor: tintColor,
				cornerRadius: CGFloat(truncating: cornerRadius),
				labelCornerRadius: CGFloat(truncating: labelCornerRadius),
				usesTextHeightForLabels: Bool(truncating: usesTextHeightForLabels),
				labelHeight: CGFloat(truncating: labelHeight)
			)
		}
	}
	
	private func updateShimmerAppearance() {
		assert(Thread.isMainThread)
		
		if let currentShimmerView = currentShimmerView {
			let oldShimmerAppearance = currentShimmerView.shimmerAppearance
			
			let alpha = shimmerAppearance["alpha"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.alpha))
			let width = shimmerAppearance["width"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.width))
			let angle = shimmerAppearance["angle"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.angle))
			let speed = shimmerAppearance["speed"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.speed))
			let delay = shimmerAppearance["delay"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.delay))

			currentShimmerView.shimmerAppearance = ShimmerAppearance(
				alpha: CGFloat(truncating: alpha),
				width: CGFloat(truncating: width),
				angle: CGFloat(truncating: angle),
				speed: CGFloat(truncating: speed),
				delay: TimeInterval(truncating: delay)
			)
		}
	}

	/// Views excluded from shimmer consideration (updating will re-create the shimmer view)
	private var excludedViews: [UIView]? {
		didSet {
			assert(Thread.isMainThread)
			updateShimmerView(excludedViews: excludedViews ?? [])
		}
	}

	private var currentShimmerView: ShimmerView?

	/// Array of views that are currently mirroring the react subviews
	private var mirrors: [UIView] = []
	
	private static let animationSynchronizer = AnimationSynchronizer()

}
