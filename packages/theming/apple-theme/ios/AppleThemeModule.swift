import Foundation
import FluentUI

@objc(MSFAppleThemeModule)
class AppleThemeModule: NSObject {

	public enum Events: CaseIterable {
		case traitCollectionDidChange

		var name: String {
			switch self {
			case .traitCollectionDidChange:
				return "traitCollectionDidChange";
			}
		}
	}

	@objc var methodQueue: DispatchQueue {
		get {
			return DispatchQueue.main
		}
	}
	
	static var theme: [AnyHashable: Any] {
		get {
			let isDarkMode = UITraitCollection.current.userInterfaceStyle == .dark
			return [
				"colors": palette(),
				"typography" : [
					"sizes" : fontSizes(),
					"weights" : fontWeights(),
					"families" : fontFamilies(),
					"variants" : fontVariants()
				],
				"host" : [
					"appearance" : isDarkMode ? "dark" : "light"
				]
			]
		}
	}

	@objc class func requiresMainQueueSetup() -> Bool {
		return true
	}

	@objc(getApplePartialThemeWithCallback:)
	func getApplePartialTheme(callback: RCTResponseSenderBlock) {
		callback([NSNull(), AppleThemeModule.theme])
	}
	
	// MARK: - Colors

	static func palette() -> [AnyHashable : Any] {
		
		// Lifted from Button.Swift's "updateBackgroundColor" method as this isn't available publicly
		let buttonBackgroundFilledPressed = UIColor(light: Colors.Palette.communicationBlueTint10.color, dark: Colors.Palette.communicationBlueTint20.color)

		return [
			/* PaletteBackgroundColors & PaletteTextColors */

			"background" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"bodyStandoutBackground" : RCTColorToHexString(FluentUI.Colors.surfaceSecondary.cgColor),
			"bodyFrameBackground" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"bodyFrameDivider" : RCTColorToHexString(FluentUI.Colors.dividerOnPrimary.cgColor),
			"bodyText" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"bodyTextChecked" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"subText" : RCTColorToHexString(FluentUI.Colors.textSecondary.cgColor),
			"bodyDivider" : RCTColorToHexString(FluentUI.Colors.dividerOnSecondary.cgColor),

			"disabledBackground" : RCTColorToHexString(FluentUI.Colors.gray100.cgColor),
			"disabledText" : RCTColorToHexString(FluentUI.Colors.textDisabled.cgColor),
			"disabledBodyText" : RCTColorToHexString(FluentUI.Colors.textDisabled.cgColor),
			"disabledSubtext" : RCTColorToHexString(FluentUI.Colors.textDisabled.cgColor),
			"disabledBodySubtext" : RCTColorToHexString(FluentUI.Colors.textDisabled.cgColor),

			"focusBorder" : "transparent",
			"variantBorder" : RCTColorToHexString(FluentUI.Colors.dividerOnPrimary.cgColor),
			"variantBorderHovered" : RCTColorToHexString(FluentUI.Colors.dividerOnPrimary.cgColor),
			"defaultStateBackground" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),

			"errorText" : RCTColorToHexString(FluentUI.Colors.Palette.dangerPrimary.color.cgColor),
			"warningText" : RCTColorToHexString(FluentUI.Colors.Palette.warningPrimary.color.cgColor),
			"errorBackground" : RCTColorToHexString(FluentUI.Colors.Palette.dangerTint10.color.cgColor),
			"blockingBackground" : RCTColorToHexString(FluentUI.Colors.Palette.dangerTint10.color.cgColor),
			"warningBackground" : RCTColorToHexString(FluentUI.Colors.Palette.warningPrimary.color.cgColor),
			"warningHighlight" : RCTColorToHexString(FluentUI.Colors.Palette.warningTint10.color.cgColor),
			"successBackground" : RCTColorToHexString(FluentUI.Colors.Palette.successTint10.color.cgColor),

			"inputBorder" : RCTColorToHexString(FluentUI.Colors.dividerOnPrimary.cgColor),
			"inputBorderHovered" : RCTColorToHexString(FluentUI.Colors.dividerOnPrimary.cgColor),
			"inputBackground" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"inputBackgroundChecked" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"inputBackgroundCheckedHovered" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"inputForegroundChecked" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"inputFocusBorderAlt" : RCTColorToHexString(FluentUI.Colors.dividerOnSecondary.cgColor),
			"smallInputBorder" : RCTColorToHexString(FluentUI.Colors.dividerOnSecondary.cgColor),
			"inputText" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"inputTextHovered" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"inputPlaceholderText" : RCTColorToHexString(FluentUI.Colors.textSecondary.cgColor),

			"buttonBackgroundChecked" : "transparent",
			"buttonBackgroundHovered" : "transparent",
			"buttonBackgroundCheckedHovered" : "transparent",
			"buttonBackgroundPressed" : "transparent",
			"buttonBackgroundDisabled" : "transparent",
			"buttonText" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonTextHovered" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonTextChecked" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonTextCheckedHovered" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonTextPressed" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),
//			"buttonTextDisabled" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),
//			"buttonBorderDisabled" : RCTColorToHexString(FluentUI.Colors.Button.borderDisabled.cgColor),
			"buttonBorderFocused" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),

			"primaryButtonBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"primaryButtonBackgroundHovered" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"primaryButtonBackgroundPressed" : RCTColorToHexString(buttonBackgroundFilledPressed.cgColor),
//			"primaryButtonBackgroundDisabled" : RCTColorToHexString(FluentUI.Colors.Button.backgroundFilledDisabled.cgColor),
			"primaryButtonBorder" : "transparent",
			"primaryButtonBorderFocused" : "transparent",
//			"primaryButtonText" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"primaryButtonTextHovered" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"primaryButtonTextPressed" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"primaryButtonTextDisabled" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),

			"accentButtonBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
//			"accentButtonText" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),

			"menuBackground" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"menuDivider" : RCTColorToHexString(FluentUI.Colors.dividerOnPrimary.cgColor),
			"menuIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),
			"menuHeader" : RCTColorToHexString(FluentUI.Colors.textDominant.cgColor),
			"menuItemBackgroundHovered" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"menuItemBackgroundPressed" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"menuItemText" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"menuItemTextHovered" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),

			"listBackground" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"listText" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"listItemBackgroundHovered" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"listItemBackgroundChecked" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"listItemBackgroundCheckedHovered" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),

			"listHeaderBackgroundHovered" : RCTColorToHexString(FluentUI.Colors.textDominant.cgColor),
			"listHeaderBackgroundPressed" : RCTColorToHexString(FluentUI.Colors.textDominant.cgColor),

			"actionLink" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"actionLinkHovered" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"link" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"linkHovered" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"linkPressed" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),

			/* ControlColorTokens */

			// Set the default button tokens to match the "secondary outline" button style
			"buttonBackground" : "transparent",
			"buttonBorder" :  RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"buttonContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonIcon" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),

			"buttonHoveredBackground" :"transparent",
			"buttonHoveredBorder" :  RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"buttonHoveredContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonHoveredIcon" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),

			"buttonFocusedBackground" : "transparent",
			"buttonFocusedBorder" :  RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"buttonFocusedContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonFocusedIcon" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),

			"buttonPressedBackground" : "transparent",
			"buttonPressedBorder" :  RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint30.color.cgColor),
			"buttonPressedContent" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),
			"buttonPressedIcon" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),

			"buttonDisabledBackground" : "transparent",
//			"buttonDisabledBorder" :  RCTColorToHexString(FluentUI.Colors.Button.borderDisabled.cgColor),
//			"buttonDisabledContent" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),
//			"buttonDisabledIcon" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),

			"ghostBackground" : "transparent",
			"ghostBorder" : "transparent",
			"ghostContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostIcon" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),

			"ghostHoveredBackground" : "transparent",
			"ghostHoveredBorder" : "transparent",
			"ghostHoveredContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostHoveredIcon" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),

			"ghostFocusedBackground" : "transparent",
			"ghostFocusedBorder" : "transparent",
			"ghostFocusedContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostFocusedIcon" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),

			"ghostPressedBackground" : "transparent",
			"ghostPressedBorder" : "transparent",
			"ghostPressedContent" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),
			"ghostPressedIcon" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),

			"ghostDisabledBackground" : "transparent",
			"ghostDisabledBorder" : "transparent",
//			"ghostDisabledContent" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),
//			"ghostDisabledIcon" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),

			"brandBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"brandBorder" : "transparent",
//			"brandContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"brandIcon" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),

			"brandHoveredBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"brandHoveredBorder" : "transparent",
//			"brandHoveredContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"brandHoveredIcon" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),

			"brandFocusedBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"brandFocusedBorder" : "transparent",
//			"brandFocusedContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"brandFocusedIcon" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),

			"brandPressedBackground" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"brandPressedBorder" : "transparent",
//			"brandPressedContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"brandPressedIcon" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),

//			"brandDisabledBackground" : RCTColorToHexString(FluentUI.Colors.Button.backgroundFilledDisabled.cgColor),
			"brandDisabledBorder" : "transparent",
//			"brandDisabledContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"brandDisabledIcon" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),

			"buttonCheckedBackground" : "transparent",
			"buttonCheckedContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonCheckedHoveredBackground" : "transparent",
			"buttonCheckedHoveredContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),

			"brandCheckedBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
//			"brandCheckedContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
			"brandCheckedHoveredBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
//			"brandCheckedHoveredContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),

			"ghostCheckedBackground" : "transparent",
			"ghostCheckedContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostCheckedHoveredBackground" : "transparent",
			"ghostCheckedHoveredContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostCheckedHoveredBorder" : "transparent",

			"ghostSecondaryContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostFocusedSecondaryContent" :RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostHoveredSecondaryContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostPressedSecondaryContent" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),

//			"brandSecondaryContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"brandFocusedSecondaryContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"brandHoveredSecondaryContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),
//			"brandPressedSecondaryContent" : RCTColorToHexString(FluentUI.Colors.Button.titleWithFilledBackground.cgColor),

//			"buttonDisabledSecondaryContent" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),
			"buttonHoveredSecondaryContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonPressedSecondaryContent" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),
		]
	}

	// MARK: - Typography

	static func fontFamilies() -> [AnyHashable : Any] {
			
		let systemFontFamilyName = UIFont.systemFont(ofSize: 0).familyName
		let monospaceFontFamilyName = UIFont.monospacedSystemFont(ofSize: 0, weight: .regular).familyName
		return [
			"primary" : systemFontFamilyName,
			"monospace" : monospaceFontFamilyName,
			"secondary": systemFontFamilyName,
			"cursive": systemFontFamilyName,
			"sansSerif": systemFontFamilyName,
			"serif": systemFontFamilyName
		]

	}

	/// Map the current FluentUI React Native font sizes approximately to their corresponding FluentUI Apple  text style,
	/// These mappings and variants are subject to change as we moved to a unified cross platform Fluent typography ramp
	static func fontSizes() -> [AnyHashable : Any] {
			return [
				"caption" : FluentUI.Fonts.caption2.pointSize,
				"secondary" : FluentUI.Fonts.caption1.pointSize,
				"body" : FluentUI.Fonts.body.pointSize,
				"subheader" : FluentUI.Fonts.subhead.pointSize,
				"header" : FluentUI.Fonts.headline.pointSize,
				"hero" : FluentUI.Fonts.title1.pointSize,
				"heroLarge" : FluentUI.Fonts.largeTitle.pointSize
			]
	}

	static func fontWeights() -> [UIFont.Weight : Any] {
		/// Assume that the 9 values of Apples UIFont.Weight ramp map to the W3C font-weight ramp in the css-fonts spec
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

	static func fontVariants() -> [AnyHashable : Any] {
		let families = fontFamilies()
		let sizes = fontSizes()
		let weights = fontWeights()
		return [
			"captionStandard": [
				"face" : families["primary"],
				"size" : sizes["caption"],
				"weight" : weights[.regular],
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
				"weight" : weights[.semibold],
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
				"weight" : weights[.semibold],
			],
			"heroLargeStandard": [
				"face" : families["primary"],
				"size" : sizes["heroLarge"],
				"weight" : weights[.regular],
			],
			"heroLargeSemibold": [
				"face" : families["primary"],
				"size" : sizes["heroLarge"],
				"weight" : weights[.semibold],
			],
		]
	}
}
