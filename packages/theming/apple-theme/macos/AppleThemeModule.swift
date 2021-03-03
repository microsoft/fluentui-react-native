import Foundation
import FluentUI

@objc(MSFAppleThemeModule)
class AppleThemeModule: RCTEventEmitter {

	public enum Events: CaseIterable {
		case AppleInterfaceThemeChanged
		case AppleColorPreferencesChanged

		var name: String {
			switch self {
			case .AppleInterfaceThemeChanged:
				return "AppleInterfaceThemeChanged";
			case .AppleColorPreferencesChanged:
				return "AppleColorPreferencesChanged";
			}
		}
	}

	override var methodQueue: DispatchQueue {
		get {
			return DispatchQueue.main
		}
	}
	
	static var theme: [AnyHashable: Any] {
		get {
			// https://stackoverflow.com/questions/56968587/nscolor-systemcolor-not-changing-when-dark-light-mode-switched
			// Due to some weirdness in how macOS handles appearance changes, we need this extra logic in order to convert
			// the system colors to their corrent hex strings at the time of this method invokation.
			let appearance = NSApp.effectiveAppearance
			var _theme: [AnyHashable: Any]  = [:]
			if #available(OSX 11.0, *) {
				appearance.performAsCurrentDrawingAppearance({
					_theme = calculateTheme()
				})
			} else {
				NSAppearance.current = appearance
				_theme = calculateTheme()
			}
			return _theme
		}
	}

	static private func calculateTheme() -> [AnyHashable : Any] {
		let isDarkMode = NSApplication.shared.effectiveAppearance.bestMatch(from: [.darkAqua]) == .darkAqua
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

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

	@objc(getApplePartialThemeWithCallback:)
	func getApplePartialTheme(callback: RCTResponseSenderBlock) {
		callback([NSNull(), AppleThemeModule.theme])
	}
	
	// MARK: - Colors

	static func palette() -> [AnyHashable : Any] {

		// Lifted from FluentUI Button as they aren't exposed publicly.
		let brandForegroundDisabled = NSColor(named: "ButtonColors/brandForegroundDisabled", bundle: FluentUIResources.resourceBundle)!
		let brandBackgroundDisabled = NSColor(named: "ButtonColors/brandBackgroundDisabled", bundle: FluentUIResources.resourceBundle)!
		let neutralInverted = NSColor(named: "ButtonColors/neutralInverted", bundle: FluentUIResources.resourceBundle)!
		
		return [
			/* PaletteBackgroundColors & PaletteTextColors */

			"background" : RCTColorToHexString(NSColor.windowBackgroundColor.cgColor),
			"bodyStandoutBackground" : RCTColorToHexString(NSColor.underPageBackgroundColor.cgColor),
			"bodyFrameBackground" : RCTColorToHexString(NSColor.windowBackgroundColor.cgColor),
			"bodyFrameDivider" : RCTColorToHexString(NSColor.separatorColor.cgColor),
			"bodyText" : RCTColorToHexString(NSColor.textColor.cgColor),
			"bodyTextChecked" : RCTColorToHexString(NSColor.selectedTextColor.cgColor),
			"subText" : RCTColorToHexString(NSColor.placeholderTextColor.cgColor),
			"bodyDivider" : RCTColorToHexString(NSColor.separatorColor.cgColor),

			"disabledBackground" : RCTColorToHexString(FluentUI.Colors.color(from: FluentUI.Colors.Palette.gray100).cgColor),
			"disabledText" : RCTColorToHexString(NSColor.tertiaryLabelColor.cgColor),
			"disabledBodyText" : RCTColorToHexString(NSColor.tertiaryLabelColor.cgColor),
			"disabledSubtext" : RCTColorToHexString(NSColor.quaternaryLabelColor.cgColor),
			"disabledBodySubtext" : RCTColorToHexString(NSColor.quaternaryLabelColor.cgColor),

			"focusBorder" : "transparent",
			"variantBorder" : RCTColorToHexString(NSColor.separatorColor.cgColor),
			"variantBorderHovered" : RCTColorToHexString(NSColor.separatorColor.cgColor),
			"defaultStateBackground" : RCTColorToHexString(NSColor.controlBackgroundColor.cgColor),

			"errorText" : RCTColorToHexString(FluentUI.Colors.color(from: FluentUI.Colors.Palette.dangerPrimary).cgColor),
			"warningText" : RCTColorToHexString(FluentUI.Colors.color(from: FluentUI.Colors.Palette.warningPrimary).cgColor),
			"errorBackground" : RCTColorToHexString(FluentUI.Colors.color(from: FluentUI.Colors.Palette.dangerTint10).cgColor),
			"blockingBackground" : RCTColorToHexString(FluentUI.Colors.color(from: FluentUI.Colors.Palette.dangerTint10).cgColor),
			"warningBackground" : RCTColorToHexString(FluentUI.Colors.color(from: FluentUI.Colors.Palette.warningPrimary).cgColor),
			"warningHighlight" : RCTColorToHexString(FluentUI.Colors.color(from: FluentUI.Colors.Palette.warningTint10).cgColor),
			"successBackground" : RCTColorToHexString(FluentUI.Colors.color(from: FluentUI.Colors.Palette.successTint10).cgColor),

			"inputBorder" : RCTColorToHexString(NSColor.separatorColor.cgColor),
			"inputBorderHovered" : RCTColorToHexString(NSColor.separatorColor.cgColor),
			"inputBackground" : RCTColorToHexString(NSColor.textBackgroundColor.cgColor),
			"inputBackgroundChecked" : RCTColorToHexString(NSColor.selectedContentBackgroundColor.cgColor),
			"inputBackgroundCheckedHovered" : RCTColorToHexString(NSColor.selectedContentBackgroundColor.cgColor),
			"inputForegroundChecked" : RCTColorToHexString(FluentUI.Colors.color(from: FluentUI.Colors.Palette.communicationBlue).cgColor),
			"inputFocusBorderAlt" : RCTColorToHexString(NSColor.keyboardFocusIndicatorColor.cgColor),
			"smallInputBorder" : RCTColorToHexString(NSColor.separatorColor.cgColor),
			"inputText" : RCTColorToHexString(NSColor.textColor.cgColor),
			"inputTextHovered" : RCTColorToHexString(NSColor.textColor.cgColor),
			"inputPlaceholderText" : RCTColorToHexString(NSColor.placeholderTextColor.cgColor),

			"buttonBackgroundChecked" : RCTColorToHexString(NSColor.controlAccentColor.withSystemEffect(.pressed).cgColor),
			"buttonBackgroundHovered" : RCTColorToHexString(NSColor.controlAccentColor.cgColor),
			"buttonBackgroundCheckedHovered" : RCTColorToHexString(NSColor.controlAccentColor.withSystemEffect(.pressed).cgColor),
			"buttonBackgroundPressed" : RCTColorToHexString(NSColor.controlAccentColor.withSystemEffect(.pressed).cgColor),
			"buttonBackgroundDisabled" : RCTColorToHexString(NSColor.controlAccentColor.withSystemEffect(.disabled).cgColor),
			"buttonText" : RCTColorToHexString(neutralInverted.cgColor),
			"buttonTextHovered" : RCTColorToHexString(neutralInverted.cgColor),
			"buttonTextChecked" : RCTColorToHexString(neutralInverted.withSystemEffect(.pressed).cgColor),
			"buttonTextCheckedHovered" : RCTColorToHexString(neutralInverted.withSystemEffect(.pressed).cgColor),
			"buttonTextPressed" : RCTColorToHexString(neutralInverted.withSystemEffect(.pressed).cgColor),
			"buttonTextDisabled" : RCTColorToHexString(brandForegroundDisabled.cgColor),
			"buttonBorderDisabled" : "transparent",
			"buttonBorderFocused" : "transparent",

			"primaryButtonBackground" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"primaryButtonBackgroundHovered" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"primaryButtonBackgroundPressed" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.pressed).cgColor),
			"primaryButtonBackgroundDisabled" : RCTColorToHexString(brandBackgroundDisabled.cgColor),
			"primaryButtonBorder" : "transparent",
			"primaryButtonBorderFocused" : "transparent",
			"primaryButtonText" : RCTColorToHexString(neutralInverted.cgColor),
			"primaryButtonTextHovered" : RCTColorToHexString(neutralInverted.cgColor),
			"primaryButtonTextPressed" : RCTColorToHexString(neutralInverted.withSystemEffect(.pressed).cgColor),
			"primaryButtonTextDisabled" : RCTColorToHexString(brandForegroundDisabled.cgColor),

			"accentButtonBackground" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"accentButtonText" : RCTColorToHexString(neutralInverted.cgColor),

			"menuBackground" : "transparent",
			"menuDivider" : RCTColorToHexString(NSColor.separatorColor.cgColor),
			"menuIcon" : RCTColorToHexString(NSColor.textColor.cgColor),
			"menuHeader" : RCTColorToHexString(NSColor.headerTextColor.cgColor),
			"menuItemBackgroundHovered" : "transparent",
			"menuItemBackgroundPressed" : RCTColorToHexString(NSColor.selectedContentBackgroundColor.cgColor),
			"menuItemText" : RCTColorToHexString(NSColor.textColor.cgColor),
			"menuItemTextHovered" : RCTColorToHexString(NSColor.textColor.cgColor),

			"listBackground" : "transparent",
			"listText" : RCTColorToHexString(NSColor.textColor.cgColor),
			"listItemBackgroundHovered" : "transparent",
			"listItemBackgroundChecked" : RCTColorToHexString(NSColor.selectedContentBackgroundColor.cgColor),
			"listItemBackgroundCheckedHovered" : RCTColorToHexString(NSColor.selectedContentBackgroundColor.cgColor),

			"listHeaderBackgroundHovered" : RCTColorToHexString(NSColor.headerTextColor.cgColor),
			"listHeaderBackgroundPressed" : RCTColorToHexString(NSColor.headerTextColor.cgColor),

			"actionLink" : RCTColorToHexString(NSColor.linkColor.cgColor),
			"actionLinkHovered" : RCTColorToHexString(NSColor.linkColor.cgColor),
			"link" : RCTColorToHexString(NSColor.linkColor.cgColor),
			"linkHovered" : RCTColorToHexString(NSColor.linkColor.cgColor),
			"linkPressed" : RCTColorToHexString(NSColor.selectedControlColor.cgColor),

			/* ControlColorTokens */

			"buttonBackground" : RCTColorToHexString(NSColor.controlAccentColor.cgColor),
			"buttonBorder" : "transparent",
			"buttonContent" : RCTColorToHexString(neutralInverted.cgColor),
			"buttonIcon" : RCTColorToHexString(neutralInverted.cgColor),

			"buttonHoveredBackground" : RCTColorToHexString(NSColor.controlAccentColor.cgColor),
			"buttonHoveredBorder" : "transparent",
			"buttonHoveredContent" : RCTColorToHexString(neutralInverted.cgColor),
			"buttonHoveredIcon" : RCTColorToHexString(neutralInverted.cgColor),

			"buttonFocusedBackground" : RCTColorToHexString(NSColor.controlAccentColor.cgColor),
			"buttonFocusedBorder" : "transparent",
			"buttonFocusedContent" : RCTColorToHexString(neutralInverted.cgColor),
			"buttonFocusedIcon" : RCTColorToHexString(neutralInverted.cgColor),

			"buttonPressedBackground" : RCTColorToHexString(NSColor.controlAccentColor.withSystemEffect(.pressed).cgColor),
			"buttonPressedBorder" : "transparent",
			"buttonPressedContent" : RCTColorToHexString(neutralInverted.withSystemEffect(.pressed).cgColor),
			"buttonPressedIcon" : RCTColorToHexString(neutralInverted.withSystemEffect(.pressed).cgColor),

			"buttonDisabledBackground" : RCTColorToHexString(NSColor.controlAccentColor.withSystemEffect(.disabled).cgColor),
			"buttonDisabledBorder" : "transparent",
			"buttonDisabledContent" : RCTColorToHexString(brandForegroundDisabled.cgColor),
			"buttonDisabledIcon" : RCTColorToHexString(brandForegroundDisabled.cgColor),

			"ghostBackground" : "transparent",
			"ghostBorder" : "transparent",
			"ghostContent" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"ghostIcon" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),

			"ghostHoveredBackground" : "transparent",
			"ghostHoveredBorder" : "transparent",
			"ghostHoveredContent" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"ghostHoveredIcon" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),

			"ghostFocusedBackground" : "transparent",
			"ghostFocusedBorder" : "transparent",
			"ghostFocusedContent" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"ghostFocusedIcon" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),

			"ghostPressedBackground" : "transparent",
			"ghostPressedBorder" : "transparent",
			"ghostPressedContent" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.deepPressed).cgColor),
			"ghostPressedIcon" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.deepPressed).cgColor),

			"ghostDisabledBackground" : "transparent",
			"ghostDisabledBorder" : "transparent",
			"ghostDisabledContent" : RCTColorToHexString(brandForegroundDisabled.cgColor),
			"ghostDisabledIcon" : RCTColorToHexString(brandForegroundDisabled.cgColor),

			"brandBackground" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"brandBorder" : "transparent",
			"brandContent" : RCTColorToHexString(neutralInverted.cgColor),
			"brandIcon" : RCTColorToHexString(neutralInverted.cgColor),

			"brandHoveredBackground" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"brandHoveredBorder" : "transparent",
			"brandHoveredContent" : RCTColorToHexString(neutralInverted.cgColor),
			"brandHoveredIcon" : RCTColorToHexString(neutralInverted.cgColor),

			"brandFocusedBackground" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"brandFocusedBorder" : "transparent",
			"brandFocusedContent" : RCTColorToHexString(neutralInverted.cgColor),
			"brandFocusedIcon" : RCTColorToHexString(neutralInverted.cgColor),

			"brandPressedBackground" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.pressed).cgColor),
			"brandPressedBorder" : "transparent",
			"brandPressedContent" : RCTColorToHexString(neutralInverted.cgColor),
			"brandPressedIcon" : RCTColorToHexString(neutralInverted.cgColor),

			"brandDisabledBackground" : RCTColorToHexString(brandBackgroundDisabled.cgColor),
			"brandDisabledBorder" : "transparent",
			"brandDisabledContent" : RCTColorToHexString(brandForegroundDisabled.cgColor),
			"brandDisabledIcon" : RCTColorToHexString(brandForegroundDisabled.cgColor),

			"buttonCheckedBackground" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.pressed).cgColor),
			"buttonCheckedContent" : RCTColorToHexString(neutralInverted.withSystemEffect(.pressed).cgColor),
			"buttonCheckedHoveredBackground" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.pressed).cgColor),
			"buttonCheckedHoveredContent" : RCTColorToHexString(neutralInverted.cgColor),

			"brandCheckedBackground" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.pressed).cgColor),
			"brandCheckedContent" : RCTColorToHexString(neutralInverted.withSystemEffect(.pressed).cgColor),
			"brandCheckedHoveredBackground" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.pressed).cgColor),
			"brandCheckedHoveredContent" : RCTColorToHexString(neutralInverted.cgColor),

			"ghostCheckedBackground" : "transparent",
			"ghostCheckedContent" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.deepPressed).cgColor),
			"ghostCheckedHoveredBackground" : "transparent",
			"ghostCheckedHoveredContent" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.deepPressed).cgColor),
			"ghostCheckedHoveredBorder" : "transparent",

			"ghostSecondaryContent" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"ghostFocusedSecondaryContent" :RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"ghostHoveredSecondaryContent" : RCTColorToHexString(FluentUI.Colors.primary.cgColor),
			"ghostPressedSecondaryContent" : RCTColorToHexString(FluentUI.Colors.primary.withSystemEffect(.deepPressed).cgColor),

			"brandSecondaryContent" : RCTColorToHexString(neutralInverted.cgColor),
			"brandFocusedSecondaryContent" : RCTColorToHexString(neutralInverted.cgColor),
			"brandHoveredSecondaryContent" : RCTColorToHexString(neutralInverted.cgColor),
			"brandPressedSecondaryContent" : RCTColorToHexString(neutralInverted.withSystemEffect(.pressed).cgColor),

			"buttonDisabledSecondaryContent" : RCTColorToHexString(brandForegroundDisabled.cgColor),
			"buttonHoveredSecondaryContent" : RCTColorToHexString(neutralInverted.cgColor),
			"buttonPressedSecondaryContent" : RCTColorToHexString(neutralInverted.cgColor),
		]
	}

	// MARK: - Typography

	static func fontFamilies() -> [AnyHashable : Any] {
		if #available(OSX 10.15, *) {
			return [
				"primary" : NSFont.systemFont(ofSize: 0).familyName ?? "System",
				"monospace" : NSFont.monospacedSystemFont(ofSize: 0, weight: .regular).familyName ?? "System",
				"secondary": NSFont.systemFont(ofSize: 0).familyName ?? "System",
				"cursive": NSFont.systemFont(ofSize: 0).familyName ?? "System",
				"sansSerif": NSFont.systemFont(ofSize: 0).familyName ?? "System",
				"serif": NSFont.systemFont(ofSize: 0).familyName ?? "System"
			]
		} else {
			return [
				"primary" : NSFont.systemFont(ofSize: 0).familyName ?? "System",
				"monospace" :  NSFont.systemFont(ofSize: 0).familyName ?? "System",
				"secondary": NSFont.systemFont(ofSize: 0).familyName ?? "System",
				"cursive": NSFont.systemFont(ofSize: 0).familyName ?? "System",
				"sansSerif": NSFont.systemFont(ofSize: 0).familyName ?? "System",
				"serif": NSFont.systemFont(ofSize: 0).familyName ?? "System"
			]
		}
	}

	/// Map the current FluentUI React Native font sizes approximately to their corresponding apple text style,
	/// For older vesrions of macOS, fallback to the values described in the apple HIG:
	/// https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/typography/
	/// These mappings and variants are subject to change as we moved to a unified cross platform Fluent typography ramp
	static func fontSizes() -> [AnyHashable : Any] {
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

	static func fontWeights() -> [NSFont.Weight : Any] {
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

	static func fontVariants() -> [AnyHashable : Any] {
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

	// MARK: - Event Emitter

	override func supportedEvents() -> [String]! {
		return Events.allCases.map { $0.name }
	}

	override func startObserving() {
		hasListeners = true;
		
			
		kvoToken = NSApplication.shared.observe(\.effectiveAppearance) { (application, change) in
			guard self.bridge != nil else {
				return
			}
			self.sendEvent(withName: Events.AppleInterfaceThemeChanged.name, body: AppleThemeModule.theme)
		}
		
		// Observe changes to control accent color
		let notificationCenter = DistributedNotificationCenter.default()
		notificationCenter.addObserver(forName: NSColor.systemColorsDidChangeNotification, object: nil, queue: OperationQueue.main) { (notification) in
			if (self.hasListeners) {
				guard self.bridge != nil else {
					return
				}
				self.sendEvent(withName: Events.AppleInterfaceThemeChanged.name, body: AppleThemeModule.theme)
			}
		}

		
	}

	override func stopObserving() {
		let notificationCenter = DistributedNotificationCenter.default()
		notificationCenter.removeObserver(self)
		kvoToken?.invalidate()
		hasListeners = false;
	}

	private var hasListeners = false
	
	private var kvoToken: NSKeyValueObservation?
}
