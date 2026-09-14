# macOS focus authoring

Read [common focus authoring](focus.md) first. Match shared accessibility goals,
but do not transplant Windows click-focus, modifier, or key-up policies into
AppKit.

**Reviewed implementation:** local `react-native-macos` 0.81.9, including Fabric
View, repository FocusZone, and Callout implementations, September 14, 2026.
Verify the renderer branch and resolved component before use. A `.macos.tsx`
file can be a stub: V1 Checkbox's macOS entrypoint warns and renders null, so it
is not a valid macOS focus reference.

## First responder, key window, and actual target

AppKit routes keyboard input through the key window and its first responder.
Keep window activation separate from control focus. A window can retain a first
responder while inactive; React `focused` alone does not describe whether its
focus visual should be presented as active.

- Prefer a supported native host ref/command. In native adapters request focus
  with the owning window's first-responder mechanism on the main thread.
- Do not treat `makeFirstResponder` returning true as conclusive proof that the
  requested view owns focus. The current responder can refuse to resign, and
  AppKit documents a case where the window becomes responder when the requested
  object refuses. Confirm the actual target through focus events/observation.
- Resolve the actual editable control. An NSTextField may use the window's
  shared field editor; the first responder can therefore differ from the visible
  control/ref. Native focus-within mapping must recognize this relationship.
- Keep native view identity scoped to the mounted window/surface. Clear it on
  detach/recycle and use common React 19 ref composition, not legacy componentRef
  exposure or global numeric-tag lookup.

Local references:
`packages\components\FocusZone\macos\RCTFocusZone.m:24-35,122-129`;
`packages\components\FocusZone\macos\RCTFocusZoneComponentView.mm:118-179`.
Installed RNmacOS `React\Fabric\Mounting\ComponentViews\View\RCTViewComponentView.mm:1719-1804`
implements focus/blur commands and responder event emission.

## Pointer focus and click-through

Do not force Windows-style focus-before-press on ordinary macOS controls.
V1 `useOnPressWithFocus` recognizes macOS as focus-capable but only requests
click focus on Windows/Win32. The installed Fabric View also overrides
`needsPanelToBecomeKey` with a comment preserving mouse-versus-keyboard focus.

`acceptsFirstMouse` controls click-through in an inactive window; it is not an
alias for `focusable`, first-responder acceptance, or keyboard ring visibility.
Test first click to activate a window separately from an actual control action.
Menus can intentionally focus on hover, so document that owner-specific
exception rather than forcing all click/hover paths into one rule.

Evidence: `packages\utils\interactive-hooks\src\useOnPressWithFocus.ts:14-29`;
installed RNmacOS `RCTViewComponentView.mm:1769-1779`;
`packages\components\Menu\src\MenuItem\useMenuItem.ts:68-120`.

## Keyboard navigation, shortcuts, and editing

- V1 key helpers prefer key-down on macOS, versus key-up on Windows/Win32.
  The macOS branches use `validKeysDown`/`validKeysUp`; current RNmacOS native
  handling also has `keyDownEvents`/`keyUpEvents`. Resolve and validate the
  compatibility path instead of configuring both indiscriminately.
- Matching native handled-key entries suppress AppKit's `super` handling.
  Register only keys owned by the control/scope so key equivalents, native
  navigation, and text editing are not swallowed.
- Preserve Command shortcuts, Option text movement, Control/VoiceOver chords,
  IME composition, and the distinction between Return and Space/default-button
  activation. Do not copy Win32's modifier allowance or TabList Ctrl+Tab behavior.
- Confirm exactly-once keyboard/accessibility activation; an AX action is not
  equivalent evidence to a physical key sequence.
- Use AppKit's key-view loop where applicable. Respect keyboard-navigation/Full
  Keyboard Access settings and test enabled/disabled settings explicitly.
  `NSApplication.isFullKeyboardAccessEnabled` is not KVO-observable according to
  Apple; do not invent a KVO subscription or assume one cached startup value
  remains current.
- Do not equate VoiceOver navigation focus with the application's keyboard first
  responder. Validate role/name/value and native action behavior in both modes.

Evidence: `packages\utils\interactive-hooks\src\useKeyProps.ts:8-95,114-126`;
installed RNmacOS `RCTViewComponentView.mm:1807-1861`.

## FocusZone and Fabric wrapper lifetime

The local macOS FocusZone translates key events, recalculates the key-view loop,
and falls back to mounted descendant order when AppKit collapses a Fabric-backed
zone to one key-loop entry. The Fabric wrapper deliberately does not participate
as another first-responder stop; it forwards focus to its content view.

Preserve that single-owner behavior. Do not add a second JS roving loop to the
same keys. Recompute eligibility when children mount/unmount and when props
change, and clear the default responder on recycle. Retain direction, wrap/stop,
RTL, nested zones, scrolling, and editable-child semantics.

Evidence: `packages\components\FocusZone\macos\RCTFocusZone.m:584-675`;
`packages\components\FocusZone\macos\RCTFocusZoneComponentView.mm:118-195`.

## Popup windows and lifecycle

Callout's AppKit window can become key but not main. Its `setInitialFocus` and
`focusWindow` make the popup window key; that alone does not establish a particular
child as first responder. Its separate Fabric touch attachment also demonstrates
why React ancestry is not sufficient evidence for popup input capture.

Define and test initial child focus after content attachment, Escape, nested
popup dismissal, outside click, window/application deactivation, and guarded
return to the parent control. Do not reactivate the application or steal the
outside-click target's focus as an unconditional cleanup action.

The legacy ContextualMenu uses a macOS timer after a layout effect. Treat it as
evidence of a native readiness problem, not a reusable delay constant. Prefer a
mount/window-ready handshake with cancellation and focus confirmation. Keep a
bounded, documented workaround only if the supported renderer has no such path.

Reuse lifecycle-safe local event-monitor/observer ownership: install once for
the owning popup/window, remove exactly once, and capture weak native owners.
Do not install OS-global keyboard hooks or require desktop-driver permissions
for ordinary production focus behavior.

Evidence:
`packages\native\Callout\macos\CalloutWindow.swift:9-38`;
`packages\native\Callout\macos\CalloutView.swift:33-45,142-216`;
`packages\native\Callout\macos\RCTCalloutComponentView.mm:96-132`;
`packages\native\Callout\macos\GuardedEventMonitor.swift:1-29`;
`packages\components\ContextualMenu\src\ContextualMenu.tsx:39-55`.

## Native versus custom ring drawing

Keep native macOS rings enabled by default unless the reviewed control requires
a custom path. The installed Fabric View draws a rounded AppKit focus mask only
when `enableFocusRing` is true. A focusable view or an enum property by itself is
not proof that the ring mask/drawing is implemented correctly.

When drawing a custom ring, disable the competing native path and preserve the
decorative/hit-testing contract. Revalidate mask bounds after layout/radius
changes, key-window transitions, clipping, appearance, Increase Contrast, and
backing-scale changes. Use AppKit points and conversions; do not copy Windows
Composition physical-pixel calculations into NSView layout.

Evidence: installed RNmacOS `RCTViewComponentView.mm:1729-1753` and Apple's
focus-mask documentation below. Ring colors remain a native/theme concern;
do not resolve opaque system colors through a guessed web-color fallback.

## Native service candidates and qualification

An opt-in native projection can help with window activity, keyboard-navigation
preferences, renderer-scoped target observation, or popup readiness if public
React Native APIs do not supply them. A TurboModule is suitable for a non-view
capability/snapshot service; view focus belongs to refs or typed native commands.
Keep generated Apple glue in Objective-C++ as required by the pinned codegen;
use AppKit/Swift/C++ behind that boundary without introducing UIKit assumptions.

Run physical keyboard/pointer scenarios, VoiceOver, active/inactive windows,
first-click behavior, keyboard-navigation settings, editable field editors, and
native/custom rings. Include Paper only where it remains supported and Fabric
as an independently qualified endpoint. This Windows-based documentation
investigation did not execute a macOS native run.

## Public references

- [AppKit makeFirstResponder](<https://developer.apple.com/documentation/appkit/nswindow/makefirstresponder(_:)>)
- [AppKit first responder and key-view loop](https://developer.apple.com/documentation/appkit/nswindow)
- [Click-through and acceptsFirstMouse](<https://developer.apple.com/documentation/appkit/nsview/acceptsfirstmouse(for:)>)
- [Full Keyboard Access query](https://developer.apple.com/documentation/appkit/nsapplication/isfullkeyboardaccessenabled)
- [AppKit field editor](https://developer.apple.com/library/archive/documentation/TextFonts/Conceptual/CocoaTextArchitecture/TextEditing/TextEditing.html)
- [Focus ring mask bounds](https://developer.apple.com/documentation/appkit/nsview/focusringmaskbounds)
- [Focus ring mask drawing](<https://developer.apple.com/documentation/appkit/nsview/drawfocusringmask()>)
