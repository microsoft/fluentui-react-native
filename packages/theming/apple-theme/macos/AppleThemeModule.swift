import Foundation

extension NSColor {
	var hexString: String {
		let red = Int(round(self.redComponent * 0xFF))
		let green = Int(round(self.greenComponent * 0xFF))
		let blue = Int(round(self.blueComponent * 0xFF))
		let hexString = NSString(format: "#%02X%02X%02X", red, green, blue).lowercased
		return hexString as String
	}
}

@objc(MSFAppleThemeModule)
class AppleThemeModule: NSObject {

	// MARK: - Colors
	
	let stateToSystemEffectDictionary: [NSString : NSColor.SystemEffect] = [
		"hover": .rollover,
		"pressed": .pressed,
		"disabled": .disabled
	]
	
	@objc(colorWithEffect:effect:errorCallback:successCallback:)
	func colorWithEffect(color: NSColor?,
						 effect: NSString,
						 errorCallback: RCTResponseSenderBlock,
						 successCallback: RCTResponseSenderBlock
	) {
		guard color != nil else {
			return errorCallback([RCTMakeError("Nil color passed to colorWithEffect", nil, nil)])
		}
		
		if let color = color {
//			let systemEffect = stateToSystemEffectDictionary[effect];
//			let colorWithAppliedEffect = color.withSystemEffect(systemEffect!).usingColorSpace(.sRGB)!.hexString
//			successCallback([colorWithAppliedEffect])
			successCallback(["orangered"])
		}
	}
	
	// MARK: - Typography
	
	func fontFamilies() -> [AnyHashable : Any] {
		return [
			"primary" : NSFont.systemFont(ofSize: 0).familyName!,
			"secondary" : NSFont.systemFont(ofSize: 0).familyName!,
			"cursive" : NSFont.systemFont(ofSize: 0).familyName!,
			"monospace" : NSFont.systemFont(ofSize: 0).familyName!,
			"sansSerif" : NSFont.systemFont(ofSize: 0).familyName!,
			"serif" : NSFont.systemFont(ofSize: 0).familyName!,
		]
	}
	
	/// Map the current FluentUI React Native font sizes approximately to their corresponding apple text style,
	/// For older vesrions of macOS, fallback to the values described in the apple HIG:
	/// https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/typography/
	/// These mappings and variants are subject to change as we moved to a unified cross platform Fluent typography ramp
	func fontSizes() -> [AnyHashable : Any] {
		if #available(OSX 11.0, *) {
			return [
				"caption" : NSFont.preferredFont(forTextStyle: .caption1, options: [:]).pointSize,
				"secondary" : NSFont.preferredFont(forTextStyle: .callout, options: [:]).pointSize,
				"body" : NSFont.preferredFont(forTextStyle: .body, options: [:]).pointSize,
				"subheader" : NSFont.preferredFont(forTextStyle: .subheadline, options: [:]).pointSize,
				"header" : NSFont.preferredFont(forTextStyle: .headline, options: [:]).pointSize,
				"hero" : NSFont.preferredFont(forTextStyle: .title1, options: [:]).pointSize,
				"heroLarge" : NSFont.preferredFont(forTextStyle: .largeTitle, options: [:]).pointSize
			]
		} else {
			// Fallback on earlier versions of macOS
			return [
				"caption" : 10,
				"secondary" : 11,
				"body" : 13,
				"subheader" : 16,
				"header" : 20,
				"hero" : 22,
				"heroLarge" : 26
			]
		}
	}
	
	func fontWeights() -> [NSFont.Weight : Any] {
		/// Assume that the 9 values of Apples NSFont.Weight ramp map to the W3C font-weight ramp in the css-fonts spec
		/// https://www.w3.org/TR/css-fonts-4/#font-weight-prop
		return [
			.ultraLight : "100",
			.thin : "200",
			.light : "300",
			.regular : "400",
			.medium : "500",
			.semibold : "600",
			.bold : "700",
			.heavy : "800",
			.black : "900",
		]
	}
	
	func fontVariants() -> [AnyHashable : Any] {
		let families = fontFamilies()
		let sizes = fontSizes()
		let weights = fontWeights()
		return [
			"captionStandard": [
				"face" : families["primary"],
				"size" : sizes["caption"],
				"weight" : weights[.medium],
			],
			"secondaryStandard": [
				"face" : families["primary"],
				"size" : sizes["secondary"],
				"weight" : weights[.regular],
			],
			"secondarySemibold": [
				"face" : families["primary"],
				"size" : sizes["secondary"],
				"weight" : weights[.semibold],
			],
			"bodyStandard": [
				"face" : families["primary"],
				"size" : sizes["body"],
				"weight" : weights[.regular],
			],
			"bodySemibold": [
				"face" : families["primary"],
				"size" : sizes["body"],
				"weight" : weights[.semibold],
			],
			"subheaderStandard": [
				"face" : families["primary"],
				"size" : sizes["subheader"],
				"weight" : weights[.regular],
			],
			"subheaderSemibold": [
				"face" : families["primary"],
				"size" : sizes["subheader"],
				"weight" : weights[.semibold],
			],
			"headerStandard": [
				"face" : families["primary"],
				"size" : sizes["header"],
				"weight" : weights[.bold],
			],
			"headerSemibold": [
				"face" : families["primary"],
				"size" : sizes["header"],
				"weight" : weights[.heavy],
			],
			"heroStandard": [
				"face" : families["primary"],
				"size" : sizes["hero"],
				"weight" : weights[.regular],
			],
			"heroSemibold": [
				"face" : families["primary"],
				"size" : sizes["hero"],
				"weight" : weights[.bold],
			],
			"heroLargeStandard": [
				"face" : families["primary"],
				"size" : sizes["heroLarge"],
				"weight" : weights[.regular],
			],
			"heroLargeSemibold": [
				"face" : families["primary"],
				"size" : sizes["heroLarge"],
				"weight" : weights[.bold],
			],
		]
	}
	
	@objc func constantsToExport() -> [String : Any]! {
		return [
			"macosTypography" : [
				"sizes" : fontSizes(),
				"weights" : fontWeights(),
				"families" : fontFamilies(),
				"variants" : fontVariants()
			],
		]
	}
	
	@objc class func requiresMainQueueSetup() -> Bool {
		return true
	}
	
	@objc func methodQueue() -> Dispatch.DispatchQueue
	{
		return DispatchQueue.main;
	}
}
