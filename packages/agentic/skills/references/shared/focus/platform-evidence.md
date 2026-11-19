---
id: focus.platform-evidence
kind: evidence-reference
owner_paths:
  - packages/agentic/components
  - packages/agentic/native-core
  - packages/framework-base
---

# Desktop focus platform evidence

Version-bound observations behind the [macOS](macos.md) and [Windows and Win32](windows-win32.md) focus rules.
Each claim records what was observed, where, at which version, and its limits. These are evidence, not guarantees:
recheck the lockfile, renderer branch, and resolved component before relying on a claim, and update or retire it when
the pinned dependency changes. Installed-package paths are relative to that package's root.

## macOS

- **C-FOCUS-001:** The macOS focus guidance was reviewed against local `react-native-macos` 0.81.9, including the
  Fabric View and the repository FocusZone and Callout implementations. Observed: 2026-09-14. Limits: a Windows-based
  documentation review with no macOS native run. V1 Checkbox's macOS entrypoint warns and renders null, so it is not a
  valid macOS focus reference.
- **C-FOCUS-002:** The installed Fabric View implements focus and blur commands and responder event emission. The
  repository FocusZone requests and tracks the first responder natively. Sources: RNmacOS
  `React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm:1719-1804`;
  `packages/agentic/native-core/macos/components/FocusZone/shared/RCTFocusZone.m:24-35,122-129`;
  `packages/agentic/native-core/macos/components/FocusZone/fabric/RCTFocusZoneComponentView.mm:118-179`. Version:
  RNmacOS 0.81.9. Observed: 2026-09-14.
- **C-FOCUS-003:** V1 `useOnPressWithFocus` treats macOS as focus-capable but requests click focus only on Windows and
  Win32. The installed Fabric View overrides `needsPanelToBecomeKey` to preserve mouse-versus-keyboard focus. V1
  MenuItem focuses on hover as an owner-specific exception. Sources:
  `packages/utils/interactive-hooks/src/useOnPressWithFocus.ts:14-29`; RNmacOS `RCTViewComponentView.mm:1769-1779`;
  `packages/components/Menu/src/MenuItem/useMenuItem.ts:68-120`. Version: RNmacOS 0.81.9. Observed: 2026-09-14.
- **C-FOCUS-004:** V1 key helpers prefer key-down on macOS through `validKeysDown` and `validKeysUp`, while RNmacOS
  native handling also exposes `keyDownEvents` and `keyUpEvents`. RNmacOS Pressability activates Return and Space on
  key-down, and key-up supplies `onPressOut`. Sources: `packages/utils/interactive-hooks/src/useKeyProps.ts:8-95,114-126`;
  RNmacOS `RCTViewComponentView.mm:1807-1861`. Version: RNmacOS 0.81.9. Observed: 2026-09-14.
- **C-FOCUS-005:** The macOS FocusZone translates key events, recalculates the key-view loop, and falls back to
  mounted descendant order when AppKit collapses a Fabric-backed zone to one key-loop entry. Its Fabric wrapper does
  not become another first-responder stop; it forwards focus to its content view. Sources:
  `packages/agentic/native-core/macos/components/FocusZone/shared/RCTFocusZone.m:584-675`;
  `packages/agentic/native-core/macos/components/FocusZone/fabric/RCTFocusZoneComponentView.mm:118-195`. Observed:
  2026-09-14.
- **C-FOCUS-006:** Callout's AppKit window can become key but not main. `setInitialFocus` and `focusWindow` make the
  popup window key without choosing a child first responder, and Callout has a separate Fabric touch attachment. Its guarded
  event monitor provides popup-scoped monitor ownership. The legacy ContextualMenu waits on a macOS timer after a layout
  effect. Sources: `packages/agentic/native-core/macos/components/Callout/shared/CalloutWindow.swift:9-38`;
  `packages/agentic/native-core/macos/components/Callout/shared/CalloutView.swift:33-45,142-216`;
  `packages/agentic/native-core/macos/components/Callout/fabric/RCTCalloutComponentView.mm:96-132`;
  `packages/agentic/native-core/macos/components/Callout/shared/GuardedEventMonitor.swift:1-29`;
  `packages/components/ContextualMenu/src/ContextualMenu.tsx:39-55`. Observed: 2026-09-14.
- **C-FOCUS-007:** The installed Fabric View draws a rounded AppKit focus mask only when `enableFocusRing` is true.
  Source: RNmacOS `RCTViewComponentView.mm:1729-1753`. Version: RNmacOS 0.81.9. Observed: 2026-09-14.

## Windows and Win32

- **C-FOCUS-008:** The reviewed endpoints were `@office-iss/react-native-win32` 0.81.8 (Paper, hosted by the prebuilt
  REX host in Storybook) and `react-native-windows` 0.81.35 (Fabric, Windows App SDK Composition). Observed:
  2026-09-14. Limits: these are observed dependency versions, not minimum versions for every feature.
- **C-FOCUS-009:** V1 Windows and Win32 behavior comes from focus-before-press, per-control activation, Win32 tab
  selection, and menu hover handling. Sources: `packages/utils/interactive-hooks/src/useOnPressWithFocus.ts:14-29`;
  `packages/components/Button/src/useButton.ts:15-17,40-66,99-113`;
  `packages/components/TabList/src/Tab/useTab.win32.ts:64-110`;
  `packages/components/Menu/src/MenuItem/useMenuItem.ts:68-120`. Observed: 2026-09-14.
- **C-FOCUS-010:** The Fabric FocusZone requests focus with `TryFocus(FocusState::Keyboard)` and then checks the root's
  focused component. Source: `packages/agentic/native-core/windows/NativeCore/components/FocusZone/FocusZoneComponentView.cpp:175-224`.
  Observed: 2026-09-14.
- **C-FOCUS-011:** RNW's root stores a native focus state, resolves programmatic focus with its own policy, and
  returns early when asked to focus the already-focused component. Source: RNW
  `Microsoft.ReactNative/Fabric/Composition/RootComponentView.cpp:79-118`. Version: RNW 0.81.35. Observed: 2026-09-14.
  Limits: a native implementation detail, not a public JavaScript API.
- **C-FOCUS-012:** Native qualification found Office Win32 key events with `code="Unidentified"` and a valid `key`.
  The Win32 UIA Toggle and SelectionItem patterns were unavailable without accessibility action declarations, even
  though JavaScript state was correct. Version: react-native-win32 0.81.8. Observed: 2026-09-14.
- **C-FOCUS-013:** V1 `useKeyProps` prefers key-up on Windows and Win32 and supplies Win32 handled-key descriptors. Its
  Windows branch omits descriptors because of a historical `key` versus `code` mismatch. Sources:
  `packages/utils/interactive-hooks/src/useKeyProps.ts:8-95,114-126`;
  `packages/agentic/native-core/windows/NativeCore/components/FocusZone/FocusZoneComponentView.cpp:71-133`.
  Observed: 2026-09-14.
- **C-FOCUS-014:** V1 uses native Win32 focus rings plus appearance-specific focused borders. RNW 0.81.35 has explicit
  focus hosting and native theme handling. Sources: RNW
  `Microsoft.ReactNative/Fabric/Composition/CompositionViewComponentView.cpp` and `Theme.cpp`. Observed: 2026-09-14.
- **C-FOCUS-015:** The Windows and Win32 smoke lanes each covered 18 cases with native assertions. Component focus
  cases use the `desktop-focus` tag. A disconnected input desktop left semantic cases passing while every
  physical-input case skipped. Win32's enabled-state announcement gap for editors is documented in Input's interaction
  companion. Observed: 2026-09-14. Limits: case counts change as the catalog grows.
