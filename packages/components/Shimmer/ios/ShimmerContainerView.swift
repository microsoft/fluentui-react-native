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
	
	var excludedViews: [UIView]? {
		didSet {
			assert(Thread.isMainThread)
			
			shimmerView.removeFromSuperview()
			let newShimmerView = ShimmerView(containerView: self, excludedViews: excludedViews ?? [], animationSynchronizer: AnimationSynchronizer())
			newShimmerView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
			addSubview(newShimmerView)
			shimmerView = newShimmerView
			updateShimmerViewAppearance()
			updateShimmerAppearance()
		}
	}
	
	var shimmerView: ShimmerView = ShimmerView()
	
	private var mirrors: [UIView] = []
	
	override init(frame: CGRect) {
		super.init(frame: frame)
	}
	
	required init?(coder: NSCoder) {
		fatalError("init(coder:) has not been implemented")
	}
	
// MARK: - UIView
	
    /// Shimmer, by default, only consider top-level views when shimmering. This is
    /// incompatible with Flexbox, which wants you to wrap everything in more views to achieve
    /// a specific layout. The solution is to get a list of all the leaves of the subview tree
    /// and shimmer those by creating "mirror" views to mirror the RCTViews in a flat heirarchy in
    /// the shimmer container.
	override func layoutSubviews() {
		super.layoutSubviews()
		
		for mirror in mirrors {
			mirror.removeFromSuperview()
		}
		mirrors = []
		
		let leaves = containerLeaves(in: self)
		
		for leaf in leaves {
			if (leaf.superview == nil || leaf == self.shimmerView) {
				continue
			}
			
			let frame = leaf.superview?.convert(leaf.frame, to: self.subviews.first) ?? CGRect.zero
			let mirror = leaf.isKind(of: RCTTextView.self) ? UILabel(frame: frame): UIView(frame: frame)
			
			mirrors.append(mirror)
			addSubview(mirror)
		}
		
		bringSubviewToFront(shimmerView)
	}
	
// MARK: - UIView+React

	override func didUpdateReactSubviews() {
		super.didUpdateReactSubviews()
		
		// Exclude the react subview in favor of the flattened mirror views
		excludedViews = reactSubviews()
	}
	
// MARK: - Private
	
	private func containerLeaves(in view: UIView) -> [UIView] {
		assert(Thread.isMainThread)
		
		var leaves: [UIView] = []
		
		for view in view.subviews {
			if (view.subviews.count == 0 && view != shimmerView) {
				leaves.append(view)
			} else if (!view.isHidden) {
				leaves.append(contentsOf: containerLeaves(in: view))
			}
		}

		return leaves
	}
	
	private func updateShimmerViewAppearance() {
		assert(Thread.isMainThread)
		
		let oldAppearance = shimmerView.appearance
		
		let tintColor = RCTConvert.uiColor(appearance["tintColor"] as? NSNumber) ?? oldAppearance.tintColor
		let cornerRadius = appearance["cornerRadius"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldAppearance.cornerRadius))
		let labelCornerRadius = appearance["labelCornerRadius"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldAppearance.labelCornerRadius))
		let usesTextHeightForLabels = appearance["usesTextHeightForLabels"] as? NSNumber ?? NSNumber(booleanLiteral: oldAppearance.usesTextHeightForLabels)
		let labelHeight = appearance["labelHeight"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldAppearance.labelHeight))

		shimmerView.appearance = ShimmerViewAppearance(
			tintColor: tintColor,
			cornerRadius: CGFloat(truncating: cornerRadius),
			labelCornerRadius: CGFloat(truncating: labelCornerRadius),
			usesTextHeightForLabels: Bool(truncating: usesTextHeightForLabels),
			labelHeight: CGFloat(truncating: labelHeight)
		)
	}
	
	private func updateShimmerAppearance() {
		assert(Thread.isMainThread)
		
		let oldShimmerAppearance = shimmerView.shimmerAppearance
		
		let alpha = shimmerAppearance["alpha"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.alpha))
		let width = shimmerAppearance["width"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.width))
		let angle = shimmerAppearance["angle"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.angle))
		let speed = shimmerAppearance["speed"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.speed))
		let delay = shimmerAppearance["delay"] as? NSNumber ?? NSNumber(floatLiteral: Double(oldShimmerAppearance.delay))

		shimmerView.shimmerAppearance = ShimmerAppearance(
			alpha: CGFloat(truncating: alpha),
			width: CGFloat(truncating: width),
			angle: CGFloat(truncating: angle),
			speed: CGFloat(truncating: speed),
			delay: TimeInterval(truncating: delay)
		)
	}
}
