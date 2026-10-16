# @fluentui-react-native/native-core

## 0.2.0

### Minor Changes

- e2092f9: Add platform-scoped React 19 Callout and FocusZone previews built as phased
  components, with live targets, confirmed cancellable native commands, a shared
  hook-free Callout host, Swift macOS focus/placement services, and a
  cross-machine validation plan. Implement the new macOS Paper Callout commands
  in Swift behind header-independent bridges. Preserve Win32 legacy
  registrations without new managed transport.
  
  Honor explicit Windows FocusZone destinations without entry-focus redirection
  and cover live-target refusal, cancellation, and detached command handles in
  native stories.
  
  Fix the Windows Callout crash on popup creation caused by an unsupported weak
  light-dismiss revoker, and release each mount's popup, window, and
  subscriptions on unmount. Windows Callout now dismisses on outside pointer
  input and Escape, honors legacy `dismissBehaviors`, returns keyboard input to
  the owner after a focused presentation closes, and keeps the requested gap
  when placement flips. Windows FocusZone requests inside owned popups are
  accepted while the popup's owner is active, enabling flat Menu and Popover
  composition.

### Patch Changes

- f550cfb: Import `RCTI18nUtil.h` in the macOS FocusZone implementation with the canonical `<React/RCTI18nUtil.h>` form instead of by bare, differently cased header name.
- f550cfb: Mark the unused block parameters in the macOS FocusZone traversal as `__unused` so the file compiles cleanly with `-Wunused-parameter` treated as an error.
- e2092f9: Fix macOS Fabric FocusZone inside popups. Opening a Callout whose content
  starts with a FocusZone no longer aborts the app, and Escape and other
  unhandled keys now continue past the zone, so they reach the popup and dismiss
  it. Add Menu composition stories for the default and explicit `pointerFocus`
  trigger behaviors.
- f550cfb: Implement the macOS Paper Callout `focusWindow` and `blurWindow` commands in Swift so the Objective-C manager no longer imports the generated Swift header, which duplicates the manager's interface when hosts compile Swift with an Objective-C bridging header.
- 27dc8eb: Restore the macOS Paper FRNCallout manager alias for older Callout JavaScript bundles while retaining the current RCTCallout registration.
- Updated dependencies [e2092f9]
- Updated dependencies [e2092f9]
  - @fluentui-react-native/framework-base@0.9.0
  - @fluentui-react-native/interactive-hooks@0.28.12

## 0.1.0

### Minor Changes

- c547395: Initialize the native-core package with cross-platform, macOS, Windows, shared Windows/Win32, and Win32 entrypoints and a native component and TurboModule organization plan.
  
  Own the Callout and FocusZone JS wrappers, codegen specifications, macOS Paper/Fabric adapters, and Windows Fabric implementations in this shared package.
- c547395: Isolate the existing Callout and FocusZone JavaScript wrappers under native-core/legacy instead of the package root. Compatibility shims retain their exports through this submodule; native implementations and codegen specifications are unchanged.

### Patch Changes

- c547395: Fix the macOS Swift interoperability header name for the consolidated native-core pod.
