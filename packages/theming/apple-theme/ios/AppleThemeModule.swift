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

			"buttonBackgroundChecked" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"buttonBackgroundHovered" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonBackgroundCheckedHovered" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"buttonBackgroundPressed" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"buttonBackgroundDisabled" : RCTColorToHexString(FluentUI.Colors.gray600.cgColor),
			"buttonText" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonTextHovered" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonTextChecked" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonTextCheckedHovered" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonTextPressed" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonTextDisabled" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonBorderDisabled" : "transparent",
			"buttonBorderFocused" : "transparent",

			"primaryButtonBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"primaryButtonBackgroundHovered" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"primaryButtonBackgroundPressed" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"primaryButtonBackgroundDisabled" : RCTColorToHexString(FluentUI.Colors.gray100.cgColor),
			"primaryButtonBorder" : "transparent",
			"primaryButtonBorderFocused" : "transparent",
			"primaryButtonText" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"primaryButtonTextHovered" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"primaryButtonTextPressed" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"primaryButtonTextDisabled" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),

			"accentButtonBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"accentButtonText" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),

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

			// Set the default button tokens to match the Acrylic Button style
			"buttonBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonBorder" : "transparent",
			"buttonContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"buttonHoveredBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonHoveredBorder" : "transparent",
			"buttonHoveredContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonHoveredIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"buttonFocusedBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"buttonFocusedBorder" : "transparent",
			"buttonFocusedContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonFocusedIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"buttonPressedBackground" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"buttonPressedBorder" : "transparent",
			"buttonPressedContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonPressedIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"buttonDisabledBackground" : RCTColorToHexString(FluentUI.Colors.gray600.cgColor),
			"buttonDisabledBorder" : "transparent",
			"buttonDisabledContent" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),
			"buttonDisabledIcon" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),

			"ghostBackground" : "transparent",
			"ghostBorder" : "transparent",
			"ghostContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"ghostHoveredBackground" : "transparent",
			"ghostHoveredBorder" : "transparent",
			"ghostHoveredContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostHoveredIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"ghostFocusedBackground" : "transparent",
			"ghostFocusedBorder" : "transparent",
			"ghostFocusedContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostFocusedIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"ghostPressedBackground" : "transparent",
			"ghostPressedBorder" : "transparent",
			"ghostPressedContent" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),
			"ghostPressedIcon" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),

			"ghostDisabledBackground" : "transparent",
			"ghostDisabledBorder" : "transparent",
			"ghostDisabledContent" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),
			"ghostDisabledIcon" : RCTColorToHexString(FluentUI.Colors.Button.titleDisabled.cgColor),

			"brandBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"brandBorder" : "transparent",
			"brandContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"brandIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"brandHoveredBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"brandHoveredBorder" : "transparent",
			"brandHoveredContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"brandHoveredIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"brandFocusedBackground" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"brandFocusedBorder" : "transparent",
			"brandFocusedContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"brandFocusedIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"brandPressedBackground" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"brandPressedBorder" : "transparent",
			"brandPressedContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"brandPressedIcon" : RCTColorToHexString(FluentUI.Colors.iconPrimary.cgColor),

			"brandDisabledBackground" : RCTColorToHexString(FluentUI.Colors.gray100.cgColor),
			"brandDisabledBorder" : "transparent",
			"brandDisabledContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"brandDisabledIcon" : RCTColorToHexString(FluentUI.Colors.iconDisabled.cgColor),

			"buttonCheckedBackground" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"buttonCheckedContent" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),
			"buttonCheckedHoveredBackground" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"buttonCheckedHoveredContent" : RCTColorToHexString(FluentUI.Colors.surfacePrimary.cgColor),

			"brandCheckedBackground" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"brandCheckedContent" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"brandCheckedHoveredBackground" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint10.color.cgColor),
			"brandCheckedHoveredContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),

			"ghostCheckedBackground" : "transparent",
			"ghostCheckedContent" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),
			"ghostCheckedHoveredBackground" : "transparent",
			"ghostCheckedHoveredContent" : RCTColorToHexString(FluentUI.Colors.Palette.communicationBlueTint20.color.cgColor),
			"ghostCheckedHoveredBorder" : "transparent",

			"ghostSecondaryContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostFocusedSecondaryContent" :RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostHoveredSecondaryContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),
			"ghostPressedSecondaryContent" : RCTColorToHexString(FluentUI.Colors.communicationBlue.cgColor),

			"brandSecondaryContent" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"brandFocusedSecondaryContent" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"brandHoveredSecondaryContent" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"brandPressedSecondaryContent" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),

			"buttonDisabledSecondaryContent" : RCTColorToHexString(FluentUI.Colors.textOnAccent.cgColor),
			"buttonHoveredSecondaryContent" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
			"buttonPressedSecondaryContent" : RCTColorToHexString(FluentUI.Colors.textPrimary.cgColor),
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
