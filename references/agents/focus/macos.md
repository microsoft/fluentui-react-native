---
id: focus.macos
kind: instruction-reference
owner_paths:
  - packages/agentic/components
  - packages/framework-base
---

# macOS focus authoring

Read [common focus authoring](common.md) first. Match shared accessibility goals,
but do not transplant Windows click-focus, modifier, or key-up policies into
AppKit.

Version-bound observations behind these rules are in the
[platform evidence](platform-evidence.md), C-FOCUS-001 to C-FOCUS-007. Verify the
renderer branch and resolved component before use. A `.macos.tsx` file can be a
stub that is not a valid macOS focus reference (C-FOCUS-001).

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

Evidence: C-FOCUS-002.

## Pointer focus and click-through

Do not force Windows-style focus-before-press on ordinary macOS controls. V1
requests click focus only on Windows/Win32, and the Fabric View preserves
mouse-versus-keyboard focus (C-FOCUS-003).

`acceptsFirstMouse` controls click-through in an inactive window; it is not an
alias for `focusable`, first-responder acceptance, or keyboard ring visibility.
Test first click to activate a window separately from an actual control action.
Menus can intentionally focus on hover, so document that owner-specific
exception rather than forcing all click/hover paths into one rule.

Evidence: C-FOCUS-003.

## Keyboard navigation, shortcuts, and editing

- V1 and RNmacOS expose both key-down and key-up handling paths, and V1 prefers
  key-down on macOS (C-FOCUS-004). Resolve and validate the compatibility path
  instead of configuring both indiscriminately.
- Matching native handled-key entries suppress AppKit's `super` handling.
  Register only keys owned by the control/scope so key equivalents, native
  navigation, and text editing are not swallowed.
- Preserve Command shortcuts, Option text movement, Control/VoiceOver chords,
  IME composition, and the distinction between Return and Space/default-button
  activation. Do not copy Win32's modifier allowance or TabList Ctrl+Tab behavior.
- Confirm exactly-once keyboard/accessibility activation; an AX action is not
  equivalent evidence to a physical key sequence.
- RNmacOS Pressability activates on key-down and releases on key-up
  (C-FOCUS-004). Keep native press cleanup separate from Windows keyup-activation
  pairing. Intervening keys, caller cancellation, blur, disable, and target
  replacement must not strand pressed feedback or duplicate release callbacks.
  Retain a pooled event only with `persist()` and release that reference when
  the keyboard press ends.
- Use AppKit's key-view loop where applicable. Respect keyboard-navigation/Full
  Keyboard Access settings and test enabled/disabled settings explicitly.
  `NSApplication.isFullKeyboardAccessEnabled` is not KVO-observable according to
  Apple; do not invent a KVO subscription or assume one cached startup value
  remains current.
- The shared native focus stories enter through an editable control and Tab,
  rather than forcing ordinary pointer clicks to focus. The all-controls lane
  requires Keyboard navigation enabled; record that setting, obtain permission
  before changing a developer's setting, and restore changes authorized as
  temporary. Keep it enabled on development/CI Macs unless the owner chooses
  otherwise; locking the desktop gates physical input, not this preference.
  A Windows-only pointer
  assertion may be a no-op on macOS, but the shared focus/activation assertions
  must still execute.
- Do not equate VoiceOver navigation focus with the application's keyboard first
  responder. Validate role/name/value and native action behavior in both modes.

Evidence: C-FOCUS-004.

## FocusZone and Fabric wrapper lifetime

The macOS FocusZone owns key translation and key-view-loop recalculation, and its
Fabric wrapper forwards focus rather than becoming another first-responder stop
(C-FOCUS-005).

Preserve that single-owner behavior. Do not add a second JS roving loop to the
same keys. Recompute eligibility when children mount/unmount and when props
change, and clear the default responder on recycle. Retain direction, wrap/stop,
RTL, nested zones, scrolling, and editable-child semantics.

Evidence: C-FOCUS-005.

## Popup windows and lifecycle

Making a popup window key does not establish a particular child as first
responder, and React ancestry is not sufficient evidence for popup input capture
(C-FOCUS-006).

Define and test initial child focus after content attachment, Escape, nested
popup dismissal, outside click, window/application deactivation, and guarded
return to the parent control. Do not reactivate the application or steal the
outside-click target's focus as an unconditional cleanup action.

Treat the legacy ContextualMenu's post-layout timer (C-FOCUS-006) as evidence of
a native readiness problem, not a reusable delay constant. Prefer a
mount/window-ready handshake with cancellation and focus confirmation. Keep a
bounded, documented workaround only if the supported renderer has no such path.

Reuse lifecycle-safe local event-monitor/observer ownership: install once for
the owning popup/window, remove exactly once, and capture weak native owners.
Do not install OS-global keyboard hooks or require desktop-driver permissions
for ordinary production focus behavior.

Evidence: C-FOCUS-006.

## Native versus custom ring drawing

Keep native macOS rings enabled by default unless the reviewed control requires
a custom path. The Fabric View draws its focus mask only when `enableFocusRing`
is true (C-FOCUS-007). A focusable view or an enum property by itself is
not proof that the ring mask/drawing is implemented correctly.

When drawing a custom ring, disable the competing native path and preserve the
decorative/hit-testing contract. Revalidate mask bounds after layout/radius
changes, key-window transitions, clipping, appearance, Increase Contrast, and
backing-scale changes. Use AppKit points and conversions; do not copy Windows
Composition physical-pixel calculations into NSView layout.

Evidence: C-FOCUS-007 and Apple's focus-mask documentation below. Ring colors remain a native/theme concern;
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
as an independently qualified endpoint.

## Public references

- [AppKit makeFirstResponder](<https://developer.apple.com/documentation/appkit/nswindow/makefirstresponder(_:)>)
- [AppKit first responder and key-view loop](https://developer.apple.com/documentation/appkit/nswindow)
- [Click-through and acceptsFirstMouse](<https://developer.apple.com/documentation/appkit/nsview/acceptsfirstmouse(for:)>)
- [Full Keyboard Access query](https://developer.apple.com/documentation/appkit/nsapplication/isfullkeyboardaccessenabled)
- [AppKit field editor](https://developer.apple.com/library/archive/documentation/TextFonts/Conceptual/CocoaTextArchitecture/TextEditing/TextEditing.html)
- [Focus ring mask bounds](https://developer.apple.com/documentation/appkit/nsview/focusringmaskbounds)
- [Focus ring mask drawing](<https://developer.apple.com/documentation/appkit/nsview/drawfocusringmask()>)
