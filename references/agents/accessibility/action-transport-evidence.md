---
id: accessibility.action-transport-evidence
kind: evidence-reference
owner_paths:
  - packages/framework-base/src/accessibility
---

# Accessibility action transport evidence

Version-bound observations behind the toggle and select transport contract in the
[framework-base accessibility instructions](../../../packages/framework-base/src/accessibility/AGENTS.md). Installed
paths are relative to each platform package's root. Recheck these claims when a pinned renderer version changes.

- **C-A11Y-001:** React Native Windows Fabric dispatches lowercase `toggle` and `select` action names from
  `Microsoft.ReactNative/Fabric/Composition/CompositionDynamicAutomationProvider.cpp`.
  `UiaHelpers.cpp::DispatchAccessibilityAction` compares names case-sensitively and emits once for every matching
  declaration, so duplicate declarations produce duplicate callbacks. Version: `react-native-windows` 0.81.35. Observed:
  2026-09-17 (PR #4314).
- **C-A11Y-002:** Office Win32 declares the UIA action names `Toggle` and `Select` in
  `Libraries/Components/View/ViewAccessibility.d.ts`, and FURN V1 Checkbox and Switch use `Toggle`. Version:
  `@office-iss/react-native-win32` 0.81.8. Observed: 2026-09-17 (PR #4314). Limits: these are type declarations;
  native UIA invocation still needs target-platform verification.
- **C-A11Y-003:** React Native macOS Fabric exposes declared custom action names verbatim through
  `accessibilityCustomActions` in `React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm`, constructs them
  from `name` while ignoring `label`, and emits the exact name from `didActivateAccessibilityCustomAction`. Its
  `accessibilityActivate` only forwards `onAccessibilityTap`. Version: `react-native-macos` 0.81.9. Observed: 2026-09-17
  (PR #4314). Limits: these are custom actions, not an `AXPress` mapping.
- **C-A11Y-004:** React Native macOS Paper maps a custom action's label back to its declared name and implements
  `accessibilityPerformPress` with `activate` or `onAccessibilityTap` in `React/Views/RCTView.m`. Version:
  `react-native-macos` 0.81.9. Observed: 2026-09-17 (PR #4314). Limits: Paper behavior is not evidence for Fabric.
- **C-A11Y-005:** The React Native macOS Fabric View does not project `accessibilityState.disabled` or `selected` to
  AXEnabled or AXSelected. Version: `react-native-macos` 0.81.9. Observed: 2026-09-17 (PR #4314). Limits: revisit
  when the renderer is upgraded.
