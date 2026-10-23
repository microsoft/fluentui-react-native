# @fluentui-react-native/native-core

## 0.2.0

### Minor Changes

- 60121de: Add the reviewed Menu and MenuButton contracts and their macOS implementation: command rows with wrapping arrows,
  Home/End, type-ahead, two submenu levels that open on arrows, press, or hover, activation dismissal, and focus return.
  MenuButton adds Button chrome with a down chevron, Up/Down entry, and Tab past the trigger. Both are exported from the
  package root. MenuItem gains a `submenu` prop and a Menu context that supplies
  registration, type-ahead labels, and the platform's disabled-focusable default.
  
  The experimental modern Callout accepts `tabNavigation: 'cycle' | 'dismiss' | 'continue'` and reports `tab-forward` and
  `tab-backward` dismissals. On macOS, Tab in a popup family closes its outermost Tab-exiting presentation and can continue
  focus past the anchor. Legacy Callout behavior and APIs are unchanged.
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
- 60121de: Add the reviewed Popover contract and its macOS and Windows implementation: a Button trigger, a token-styled
  surface in a native popup, controlled and uncontrolled presence with native dismissal reasons, entry focus, and
  focus return to the trigger. Popover is exported from the package root.
  
  On macOS, the experimental modern Callout now presents an unstyled transparent popup window with a native shadow
  that follows its content. Pointer input on a live view anchor no longer light-dismisses it, Tab moves within the
  popup, and Paper orders modern commands after previously committed view updates. Legacy Callout behavior and APIs
  are unchanged.
- 60121de: Add opt-in disabled-focusable pressable targets and MenuItem rows that retain
  disabled semantics without enabling activation. Give Input its variant-specific
  focus-visible treatment: a shared outline ring or an additive underline
  indicator, without a competing native editor ring.
  Keep keyboard release cleanup exactly once when disabling a pressed target.
  
  Extend the experimental modern Callout focus operation with native first/last
  strategies, report observed dismissal causes without guessing unclassified
  notifications, and ignore duplicate close or late ready events for a dismissed
  presentation. Rebuild native hosts for the changed modern command schema.
  Legacy APIs and prebuilt Win32 commands are unchanged.
- 60121de: Present Popover on Office Win32 through a new `Callout` adapter in native-core's `win32` entrypoint. The adapter
  implements the modern props and presentation handle over the host's existing Callout registration and sends it no
  new commands. It supports view anchors only, and its popup sits flush against the anchor. The host draws the surface
  fill and corner radius, because its popup window has no per-pixel transparency. On Win32 the Popover trigger also
  declares `Expand` and `Collapse` accessibility actions, so UI Automation exposes its expanded state.
  
  On Windows, the modern Callout popup window now has rounded corners and the platform popup shadow. A press on the
  live view anchor no longer light-dismisses it before the anchor handles that press.
  
  The Windows desktop driver no longer reactivates a window whose owned popup is in the foreground. It also retries a
  subtree walk when a closing popup's UI Automation provider reports a transient failure.
- 60121de: Present Menu and MenuButton on Windows and Office Win32. On Windows, the modern Callout now implements
  `tabNavigation`: Tab or Shift+Tab in any popup of a nested family closes the whole family and either keeps focus at
  the owner (`dismiss`) or moves it past the anchor (`continue`). Closing an outer Callout also closes the Callouts
  nested in it, and focus requests treat a nested popup's owner window as active.
  
  Native-core's `win32` entrypoint adds a `FocusZone` adapter over the host's FocusZone registration. Its `Callout`
  adapter adds `initialFocus`, keeps the popup's focus and key events from bubbling to its owner, and closes the
  outermost popup on Tab. On Win32, Menu handles Home and End itself, and MenuButton returns Tab to its trigger.
  Because the Win32 host reports a pointer leave together with its enter, a pending submenu change there survives the
  leave until another row is hovered.
  
  The Windows desktop driver injects a character that one unmodified key of the foreground keyboard layout types as
  that virtual key, so key-based handlers such as type-ahead match it.

### Patch Changes

- cfa4c66: Write TypeScript build information to `node_modules/.cache` instead of `.cache`, so
  incremental build state is no longer included in published packages.
- cfa4c66: Add package-owned agent guidance, user entry points, and indexed references to
  components and native-core. The agentic component recipes and contract source
  adapters move into the components package, the desktop focus plan is replaced
  by `references/remaining-work.md`, and both packages publish their guidance.
  Components now restricts published contents with a `files` allowlist, and the
  callout and focus-zone shims link to native-core's architecture reference.
- f550cfb: Import `RCTI18nUtil.h` in the macOS FocusZone implementation with the canonical `<React/RCTI18nUtil.h>` form instead of by bare, differently cased header name.
- f550cfb: Mark the unused block parameters in the macOS FocusZone traversal as `__unused` so the file compiles cleanly with `-Wunused-parameter` treated as an error.
- 60121de: Keep Paper Callout view creation on the main actor under strict Swift concurrency,
  including Office-style builds without a React module. Add a reproducible Apple
  integration probe and native popup container-focus, geometry, and expanded-state
  regressions for the macOS prerequisites. Callout placement regressions first move
  the owner window to the top of its screen, so a small display cannot flip the popup
  to the opposite edge.
- e2092f9: Fix macOS Fabric FocusZone inside popups. Opening a Callout whose content
  starts with a FocusZone no longer aborts the app, and Escape and other
  unhandled keys now continue past the zone, so they reach the popup and dismiss
  it. Add Menu composition stories for the default and explicit `pointerFocus`
  trigger behaviors.
- f550cfb: Implement the macOS Paper Callout `focusWindow` and `blurWindow` commands in Swift so the Objective-C manager no longer imports the generated Swift header, which duplicates the manager's interface when hosts compile Swift with an Objective-C bridging header.
- 27dc8eb: Restore the macOS Paper FRNCallout manager alias for older Callout JavaScript bundles while retaining the current RCTCallout registration.
- Updated dependencies [cfa4c66]
- Updated dependencies [cfa4c66]
- Updated dependencies [e2092f9]
- Updated dependencies [e2092f9]
- Updated dependencies [60121de]
  - @fluentui-react-native/framework-base@0.9.0
  - @fluentui-react-native/interactive-hooks@0.28.12

## 0.1.0

### Minor Changes

- c547395: Initialize the native-core package with cross-platform, macOS, Windows, shared Windows/Win32, and Win32 entrypoints and a native component and TurboModule organization plan.
  
  Own the Callout and FocusZone JS wrappers, codegen specifications, macOS Paper/Fabric adapters, and Windows Fabric implementations in this shared package.
- c547395: Isolate the existing Callout and FocusZone JavaScript wrappers under native-core/legacy instead of the package root. Compatibility shims retain their exports through this submodule; native implementations and codegen specifications are unchanged.

### Patch Changes

- c547395: Fix the macOS Swift interoperability header name for the consolidated native-core pod.
