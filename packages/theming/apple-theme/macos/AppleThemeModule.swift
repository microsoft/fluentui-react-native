import Foundation
import FluentUI

extension NSColor {
	// convert the color to rgba hex notation
	var hexString: String {
		let convertedColor = self.usingColorSpace(.sRGB)!
		let red = Int(round(convertedColor.redComponent * 0xFF))
		let green = Int(round(convertedColor.greenComponent * 0xFF))
		let blue = Int(round(convertedColor.blueComponent * 0xFF))
		let alpha = Int(round(convertedColor.alphaComponent * 0xFF))
		let hexString = NSString(format: "#%02x%02x%02x%02x", red, green, blue, alpha)
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
		if let color = color {
			let systemEffect = stateToSystemEffectDictionary[effect];
			let colorWithAppliedEffect = color.withSystemEffect(systemEffect!).usingColorSpace(.sRGB)!.hexString
			successCallback([colorWithAppliedEffect])
			
		} else {
			return errorCallback([RCTMakeError("Nil color passed to colorWithEffect", nil, nil)])
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
	
	func palette() -> [AnyHashable : Any] {
		
		// Lifted from FluentUI Button as they aren't exposed publicly.
//		let brandForegroundDisabled = NSColor(named: "ButtonColors/brandForegroundDisabled", bundle: FluentUIResources.resourceBundle)
//		let brandBackgroundDisabled = NSColor(named: "ButtonColors/brandBackgroundDisabled", bundle: FluentUIResources.resourceBundle)
		let neutralInverted = NSColor(named: "ButtonColors/neutralInverted", bundle: FluentUIResources.resourceBundle) ?? NSColor.clear
//		let neutralForeground2 = NSColor(named: "ButtonColors/neutralForeground2", bundle: FluentUIResources.resourceBundle)
//		let neutralBackground2 = NSColor(named: "ButtonColors/neutralBackground2", bundle: FluentUIResources.resourceBundle)
//		let neutralStroke2 = NSColor(named: "ButtonColors/neutralStroke2", bundle: FluentUIResources.resourceBundle)
//		let neutralForeground3 = NSColor(named: "ButtonColors/neutralForeground3", bundle: FluentUIResources.resourceBundle)
//		let neutralBackground3 = NSColor(named: "ButtonColors/neutralBackground3", bundle: FluentUIResources.resourceBundle)
		
		return [
			/* PaletteBackgroundColors & PaletteTextColors */

			"background" : NSColor.windowBackgroundColor.hexString,
			"bodyStandoutBackground" : NSColor.underPageBackgroundColor.hexString,
			"bodyFrameBackground" : NSColor.windowBackgroundColor.hexString,
			"bodyFrameDivider" : NSColor.separatorColor.hexString,
			"bodyText" : NSColor.textColor.hexString,
			"bodyTextChecked" : NSColor.selectedTextColor.hexString,
			"subText" : NSColor.placeholderTextColor.hexString,
			"bodyDivider" : NSColor.separatorColor.hexString,

			"disabledBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.gray100).hexString,
			"disabledText" : NSColor.tertiaryLabelColor.hexString,
			"disabledBodyText" : NSColor.tertiaryLabelColor.hexString,
			"disabledSubtext" : NSColor.quaternaryLabelColor.hexString,
			"disabledBodySubtext" : NSColor.quaternaryLabelColor.hexString,

			"focusBorder" : NSColor.clear.hexString,
			"variantBorder" : NSColor.separatorColor.hexString,
			"variantBorderHovered" : NSColor.separatorColor.hexString,
			"defaultStateBackground" : NSColor.controlBackgroundColor.hexString,

			"errorText" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.dangerPrimary).hexString,
			"warningText" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.warningPrimary).hexString,
			"errorBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.dangerTint10).hexString,
			"blockingBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.dangerTint10).hexString,
			"warningBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.warningPrimary).hexString,
			"warningHighlight" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.warningTint10).hexString,
			"successBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.successTint10).hexString,

			"inputBorder" : NSColor.separatorColor.hexString,
			"inputBorderHovered" : NSColor.separatorColor.hexString,
			"inputBackground" : NSColor.textBackgroundColor.hexString,
			"inputBackgroundChecked" : NSColor.selectedContentBackgroundColor.hexString,
			"inputBackgroundCheckedHovered" : NSColor.selectedContentBackgroundColor.hexString,
			"inputForegroundChecked" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"inputFocusBorderAlt" : NSColor.keyboardFocusIndicatorColor.hexString,
			"smallInputBorder" : NSColor.separatorColor.hexString,
			"inputText" : NSColor.textColor.hexString,
			"inputTextHovered" : NSColor.textColor.hexString,
			"inputPlaceholderText" : NSColor.placeholderTextColor.hexString,

			"buttonBackgroundChecked" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"buttonBackgroundHovered" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"buttonBackgroundCheckedHovered" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"buttonBackgroundPressed" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"buttonBackgroundDisabled" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.disabled).hexString,
			"buttonText" : neutralInverted.hexString,
			"buttonTextHovered" : neutralInverted.hexString,
			"buttonTextChecked" : neutralInverted.withSystemEffect(.pressed).hexString,
			"buttonTextCheckedHovered" : neutralInverted.withSystemEffect(.pressed).hexString,
			"buttonTextPressed" : neutralInverted.withSystemEffect(.pressed).hexString,
			"buttonTextDisabled" : neutralInverted.withSystemEffect(.disabled).hexString,
			"buttonBorderDisabled" : NSColor.clear.hexString,
			"buttonBorderFocused" : NSColor.clear.hexString,

			"primaryButtonBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"primaryButtonBackgroundHovered" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"primaryButtonBackgroundPressed" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"primaryButtonBackgroundDisabled" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.disabled).hexString,
			"primaryButtonBorder" : NSColor.clear.hexString,
			"primaryButtonBorderFocused" : NSColor.clear.hexString,
			"primaryButtonText" : neutralInverted.hexString,
			"primaryButtonTextHovered" : neutralInverted.hexString,
			"primaryButtonTextPressed" : neutralInverted.withSystemEffect(.pressed).hexString,
			"primaryButtonTextDisabled" : neutralInverted.withSystemEffect(.disabled).hexString,

			"accentButtonBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlueTint10).hexString,
			"accentButtonText" : NSColor.controlTextColor.hexString,

			"menuBackground" : NSColor.clear.hexString,
			"menuDivider" : NSColor.separatorColor.hexString,
			"menuIcon" : NSColor.textColor.hexString,
			"menuHeader" : NSColor.headerTextColor.hexString,
			"menuItemBackgroundHovered" : NSColor.clear.hexString,
			"menuItemBackgroundPressed" : NSColor.selectedContentBackgroundColor.hexString,
			"menuItemText" : NSColor.textColor.hexString,
			"menuItemTextHovered" : NSColor.textColor.hexString,

			"listBackground" : NSColor.clear.hexString,
			"listText" : NSColor.textColor.hexString,
			"listItemBackgroundHovered" : NSColor.clear.hexString,
			"listItemBackgroundChecked" : NSColor.selectedContentBackgroundColor.hexString,
			"listItemBackgroundCheckedHovered" : NSColor.selectedContentBackgroundColor.hexString,

			"listHeaderBackgroundHovered" : NSColor.headerTextColor.hexString,
			"listHeaderBackgroundPressed" : NSColor.headerTextColor.hexString,

			"actionLink" : NSColor.linkColor.hexString,
			"actionLinkHovered" : NSColor.linkColor.hexString,
			"link" : NSColor.linkColor.hexString,
			"linkHovered" : NSColor.linkColor.hexString,
			"linkPressed" : NSColor.selectedControlColor.hexString,

			/* ControlColorTokens */

			"buttonBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"buttonBorder" : NSColor.clear.hexString,
			"buttonContent" : neutralInverted.hexString,
			"buttonIcon" : neutralInverted.hexString,

			"buttonHoveredBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"buttonHoveredBorder" : NSColor.clear.hexString,
			"buttonHoveredContent" : NSColor.controlTextColor.hexString,
			"buttonHoveredIcon" : NSColor.controlTextColor.hexString,

			"buttonFocusedBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"buttonFocusedBorder" : NSColor.clear.hexString,
			"buttonFocusedContent" : NSColor.controlTextColor.hexString,
			"buttonFocusedIcon" : NSColor.controlTextColor.hexString,

			"buttonPressedBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"buttonPressedBorder" : NSColor.clear.hexString,
			"buttonPressedContent" : NSColor.selectedControlTextColor.hexString,
			"buttonPressedIcon" : NSColor.selectedControlTextColor.hexString,

			"buttonDisabledBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.disabled).hexString,
			"buttonDisabledBorder" : NSColor.clear.hexString,
			"buttonDisabledContent" : NSColor.disabledControlTextColor.hexString,
			"buttonDisabledIcon" : NSColor.disabledControlTextColor.hexString,

			"ghostBackground" : NSColor.clear.hexString,
			"ghostBorder" : NSColor.clear.hexString,
			"ghostContent" : NSColor.controlTextColor.hexString,
			"ghostIcon" : NSColor.controlTextColor.hexString,

			"ghostHoveredBackground" : NSColor.clear.hexString,
			"ghostHoveredBorder" : NSColor.clear.hexString,
			"ghostHoveredContent" : NSColor.controlTextColor.hexString,
			"ghostHoveredIcon" : NSColor.controlTextColor.hexString,

			"ghostFocusedBackground" : NSColor.clear.hexString,
			"ghostFocusedBorder" : NSColor.clear.hexString,
			"ghostFocusedContent" : NSColor.controlTextColor.hexString,
			"ghostFocusedIcon" : NSColor.controlTextColor.hexString,

			"ghostPressedBackground" : NSColor.clear.hexString,
			"ghostPressedBorder" : NSColor.clear.hexString,
			"ghostPressedContent" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"ghostPressedIcon" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,

			"ghostDisabledBackground" : NSColor.clear.hexString,
			"ghostDisabledBorder" : NSColor.clear.hexString,
			"ghostDisabledContent" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.disabled).hexString,
			"ghostDisabledIcon" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.disabled).hexString,

			"brandBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"brandBorder" : NSColor.clear.hexString,
			"brandContent" : NSColor.controlTextColor.hexString,
			"brandIcon" : NSColor.controlTextColor.hexString,

			"brandHoveredBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"brandHoveredBorder" : NSColor.clear.hexString,
			"brandHoveredContent" : NSColor.controlTextColor.hexString,
			"brandHoveredIcon" : NSColor.controlTextColor.hexString,

			"brandFocusedBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).hexString,
			"brandFocusedBorder" : NSColor.clear.hexString,
			"brandFocusedContent" : NSColor.controlTextColor.hexString,
			"brandFocusedIcon" : NSColor.controlTextColor.hexString,

			"brandPressedBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"brandPressedBorder" : NSColor.clear.hexString,
			"brandPressedContent" : NSColor.controlTextColor.hexString,
			"brandPressedIcon" : NSColor.controlTextColor.hexString,

			"brandDisabledBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.disabled).hexString,
			"brandDisabledBorder" : NSColor.clear.hexString,
			"brandDisabledContent" : NSColor.disabledControlTextColor.hexString,
			"brandDisabledIcon" : NSColor.disabledControlTextColor.hexString,

			"buttonCheckedBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"buttonCheckedContent" : NSColor.controlTextColor.hexString,
			"buttonCheckedHoveredBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"buttonCheckedHoveredContent" : NSColor.controlTextColor.hexString,

			"brandCheckedBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"brandCheckedContent" : NSColor.controlTextColor.hexString,
			"brandCheckedHoveredBackground" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"brandCheckedHoveredContent" : NSColor.controlTextColor.hexString,

			"ghostCheckedBackground" : NSColor.clear.hexString,
			"ghostCheckedContent" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"ghostCheckedHoveredBackground" : NSColor.clear.hexString,
			"ghostCheckedHoveredContent" : FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).withSystemEffect(.pressed).hexString,
			"ghostCheckedHoveredBorder" : NSColor.clear.hexString,

			"ghostSecondaryContent" : NSColor.secondaryLabelColor.hexString,
			"ghostFocusedSecondaryContent" : NSColor.secondaryLabelColor.hexString,
			"ghostHoveredSecondaryContent" : NSColor.secondaryLabelColor.hexString,
			"ghostPressedSecondaryContent" : NSColor.secondaryLabelColor.hexString,

			"brandSecondaryContent" : NSColor.secondaryLabelColor.hexString,
			"brandFocusedSecondaryContent" : NSColor.secondaryLabelColor.hexString,
			"brandHoveredSecondaryContent" : NSColor.secondaryLabelColor.hexString,
			"brandPressedSecondaryContent" : NSColor.tertiaryLabelColor.hexString,

			"buttonDisabledSecondaryContent" : NSColor.disabledControlTextColor.hexString,
			"buttonHoveredSecondaryContent" : NSColor.secondaryLabelColor.hexString,
			"buttonPressedSecondaryContent" : NSColor.tertiaryLabelColor.hexString,
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
			"macosPalette": palette()
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
