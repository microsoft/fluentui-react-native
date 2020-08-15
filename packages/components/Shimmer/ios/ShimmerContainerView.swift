import Foundation
import FluentUI


@objc(MSFShimmerContainerView)
class ShimmerContainerView: UIView {
	
	@objc var appearance: Dictionary<AnyHashable, Any> = [:] {
		didSet {
			assert(Thread.isMainThread)
			
			let oldAppearance = shimmerView.appearance
			
			let tintColor = RCTConvert.uiColor("tintColor") ?? oldAppearance.tintColor
			let cornerRadius = RCTConvert.nsNumber("cornerRadius") ?? NSNumber(value: Float(oldAppearance.cornerRadius))
			let labelCornerRadius = RCTConvert.nsNumber("labelCornerRadius") ?? NSNumber(value: Float(oldAppearance.labelCornerRadius))
			let usesTextHeightForLabels = RCTConvert.nsNumber("usesTextHeightForLabels") ?? NSNumber(booleanLiteral: oldAppearance.usesTextHeightForLabels)
			let labelHeight = RCTConvert.nsNumber("labelHeight") ?? NSNumber(value: Float(oldAppearance.labelHeight))

			shimmerView.appearance = ShimmerViewAppearance(
				tintColor: tintColor,
				cornerRadius: cornerRadius as! CGFloat,
				labelCornerRadius: labelCornerRadius as! CGFloat,
				usesTextHeightForLabels: usesTextHeightForLabels.boolValue,
				labelHeight: labelHeight as! CGFloat
			)
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
	
}
