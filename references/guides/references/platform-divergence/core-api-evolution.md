# Core API evolution after 0.81

[Guide](../../platform-divergence.md) | [Platform capabilities](platform-capabilities.md) | [Evidence](evidence.md)

FURN pins core React Native 0.81.6. This article records core APIs added or changed through **0.88.1**, the latest
stable release on the research date (published October 27, 2026), that narrow gaps described in the guide.
It compares the published npm packages for 0.81.6, every minor release from 0.82.0 to 0.88.0, and 0.88.1 with the
[0.88.1 changelog](https://github.com/facebook/react-native/blob/v0.88.1/CHANGELOG.md).
Release-candidate changes are listed separately because they can still change.

Read every row with three qualifiers:

- **Availability.** _Default_ means active without configuration. _Flag-gated_ means the feature flag defaults to
  false in 0.88.1 and has no OSS Stable or Canary override. _Canary_ means only the OSS Canary release level, and
  the Experimental level that inherits it, enables it. _First stable_ is the first stable package that contains the
  change at any availability level. See the [JavaScript flag defaults](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/src/private/featureflags/ReactNativeFeatureFlags.js)
  and [Canary overrides](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/ReactCommon/react/featureflags/ReactNativeFeatureFlagsOverridesOSSCanary.h).
- **Platform scope.** Core implements iOS and Android. A JavaScript declaration does not implement macOS, Windows
  or Win32 behavior, and source inspection is not native qualification.
- **Adoption path.** A core API reaches FURN only after FURN adopts a fork built on that core version and the
  backend implements it. The [desktop fork table](#desktop-fork-releases) shows the latest fork releases.

## Architecture baseline

Core no longer supports the legacy architecture on iOS and Android. 0.82.0 removes the New Architecture opt-out
and crashes apps that force the legacy architecture. Core 0.86.0 no longer ships the Paper JavaScript renderer
(`ReactNativeRenderer`) or its `shims/ReactNative` entry, so `RendererImplementation` renders only through Fabric;
this comes from comparing the [0.85.0](https://github.com/facebook/react-native/tree/v0.85.0/packages/react-native/Libraries/Renderer/shims)
and [0.86.0](https://github.com/facebook/react-native/tree/v0.86.0/packages/react-native/Libraries/Renderer/shims)
packages, not from a changelog entry. 0.87.0 removes iOS legacy symbols such as `RCTCxxBridge`, and 0.88.0 lets
CocoaPods and SwiftPM consumers opt into removing legacy module and component interop.

The DOM, focus and event APIs below therefore apply to Fabric refs. FURN's Paper lanes, macOS Paper and Win32,
depend on forks that keep legacy paths. The RNmacOS 0.83.0 and Win32 0.85.0 packages still ship the Paper renderer,
but RNmacOS 0.83.0 [forces the New Architecture](#inferred-macos-upgrade-risk) under CocoaPods. A fork built on
core 0.86 or later would have to carry the Paper renderer itself; this is inferred from package contents.

## API matrix

| API                                                                                | First stable                            | 0.88.1 availability                  | Core implementation                                                                                                                                                                                                                                                                                                            | Gap narrowed                                        | Remaining gap                                                                                                                                               |
| ---------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| View `focus`/`blur` commands                                                       | 0.83.0                                  | Flag-gated (`enableImperativeFocus`) | `ref.focus()` sends non-text hosts to `ViewCommands` only when the flag is on; otherwise it focuses text inputs only. Android `requestFocusFromJS`/`clearFocusFromJS` check the flag. iOS handles the command; from 0.86.0 `canBecomeFirstResponder` returns the flag                                                          | Imperative focus of ordinary Views                  | Commands return void: no refusal, readiness or confirmed result ([focus](focus-proposal.md))                                                                |
| View `onKeyDown`/`onKeyUp` and capture variants                                    | 0.84.0 (flag from 0.83.0)               | Flag-gated (`enableKeyEvents`)       | Android only: root views send hardware key events to `JSKeyDispatcher`, which dispatches to the focused view. Payload: `key`, `code`, modifier flags, optional `repeat` and `isComposing`                                                                                                                                      | Generic key payloads on View                        | The root always continues native dispatch; no handled-key declaration or native-default consumption ([keyboard](keyboard-proposal.md))                      |
| DOM APIs on host refs                                                              | 0.82.0                                  | Default (Fabric)                     | Fabric refs are `ReactNativeElement` instances: `enableAccessToHostTreeInFabric` defaults to true in 0.82.0 and is removed in 0.83.0. Includes `isConnected`, `contains`, `getRootNode`, `compareDocumentPosition` and `getBoundingClientRect`. 0.87.0, backported to 0.86.3, fixes `parentNode` across Modal and nested roots | Live-target checks, containment and anchor geometry | Fabric only: Paper refs, such as Win32, lack these methods. Layout-tree geometry only; no presentation owner, readiness or cross-window coordinate contract |
| `IntersectionObserver`                                                             | 0.83.0 (private opt-in setup in 0.81.6) | Canary                               | `enableIntersectionObserverByDefault`; 0.87.0 exposes the `IntersectionObserverEntry` global                                                                                                                                                                                                                                   | Visibility observation                              | Not a Stable default                                                                                                                                        |
| `EventTarget` on refs (`addEventListener`, `removeEventListener`, `dispatchEvent`) | 0.86.0 (gated); Canary from 0.88.0      | Canary (`enableImperativeEvents`)    | 0.86.0 adds `enableNativeEventTargetEventDispatching`, which makes nodes extend `EventTarget` and defaults to true from 0.88.0. The public methods are removed unless `enableImperativeEvents` is on; 0.88.0 enables it in Canary                                                                                              | Listener registration outside props                 | Not a Stable default; JS listeners do not consume native defaults                                                                                           |
| `experimental_accessibilityOrder`                                                  | Declared in 0.81.6                      | Canary (`enableAccessibilityOrder`)  | The Experimental level enables it from 0.83.0 to 0.86.0; the Canary override enables it from 0.87.0, which also fixes a renderer path that dropped the prop                                                                                                                                                                    | Explicit accessibility traversal order              | Experimental name; not a Stable default                                                                                                                     |
| `sendAccessibilityEvent(..., 'windowStateChange')`                                 | 0.85.0                                  | Default                              | Android                                                                                                                                                                                                                                                                                                                        | Announcing window or pane changes                   | Android only                                                                                                                                                |
| `announceForAccessibilityWithOptions` `priority`                                   | 0.84.0                                  | Default                              | iOS `UIAccessibilityPriority` (`'low'`, `'default'`, `'high'`); Android ignores the options                                                                                                                                                                                                                                    | Announcement priority                               | iOS only                                                                                                                                                    |
| Accessibility action labels                                                        | 0.84.0                                  | Default                              | iOS Fabric: VoiceOver presents an action's `label` and maps activation back to its declared `name`                                                                                                                                                                                                                             | Localized action labels with stable names           | iOS only; no standard action names or desktop adoption                                                                                                      |
| `AccessibilityInfo.setAccessibilityFocus`                                          | Deprecated in 0.85.0                    | Deprecated                           | Use `sendAccessibilityEvent(ref, 'focus')`                                                                                                                                                                                                                                                                                     | None                                                | Accessibility focus remains separate from keyboard focus                                                                                                    |
| Full Keyboard Access roles                                                         | 0.88.0                                  | Default                              | iOS: checkbox, radio, combobox, dropdownlist, menuitem, spinbutton, tab, option, searchbox, slider and treeitem roles become reachable                                                                                                                                                                                         | Keyboard reachability of composite-control roles    | iOS only; no collection metadata                                                                                                                            |
| Pressable Text `link` role                                                         | 0.84.0                                  | Default                              | Text with `onPress` or `onLongPress` and neither `role` nor `accessibilityRole` defaults to `link`                                                                                                                                                                                                                             | Role inference                                      | Unroled pressable Text changes its announced role                                                                                                           |
| ScrollView `scrollsChildToFocus`                                                   | 0.85.0                                  | Default                              | Android                                                                                                                                                                                                                                                                                                                        | Controls scrolling when a child receives focus      | Android only                                                                                                                                                |
| TextInput `onChange` `selection`                                                   | 0.85.0 (TypeScript 0.87.0)              | Default                              | iOS and Android                                                                                                                                                                                                                                                                                                                | Cursor state on change                              | Desktop editors need their own implementation                                                                                                               |
| Appearance `'auto'` override                                                       | 0.87.0                                  | Default                              | `Appearance.setColorScheme('auto')`; `'unspecified'` is deprecated. `useColorScheme()` returns `ColorSchemeName \| null`; StatusBar adds `barStyle="auto"`                                                                                                                                                                     | Override vocabulary                                 | Light/dark only; contrast stays in platform-specific `AccessibilityInfo` queries                                                                            |
| `PlatformColor(...names, {fallback})`                                              | 0.88.0                                  | Default                              | iOS and Android: a lazy raw color is used when native names fail to resolve                                                                                                                                                                                                                                                    | Safer platform color tokens                         | Desktop forks must implement the option                                                                                                                     |
| Modal `animated` prop                                                              | Removed in 0.87.0                       | Removed                              | Use `animationType`; `PublicModalInstance` is replaced by `ModalInstance`                                                                                                                                                                                                                                                      | None                                                | Breaking for callers passing `animated`                                                                                                                     |
| `ExtraWindowEventListener`                                                         | 0.86.0                                  | Default                              | Android native modules observe window creation and destruction, such as Modal dialogs                                                                                                                                                                                                                                          | Native window lifecycle awareness                   | Android native interface; no JavaScript surface context                                                                                                     |
| iOS SceneDelegate lifecycle                                                        | 0.88.0                                  | Default                              | iOS host lifecycle support. 0.87.0 removes `SceneTracker`, so `AppRegistry.runApplication` no longer sets the active scene                                                                                                                                                                                                     | Multi-scene host lifecycle                          | Native iOS host lifecycle, not a JavaScript surface context                                                                                                 |
| `LayoutContext` viewport size                                                      | 0.86.0                                  | Default                              | C++ renderer layout input                                                                                                                                                                                                                                                                                                      | Per-surface viewport during layout                  | Not a JavaScript root-scoped metrics API                                                                                                                    |

Other related changes:

- **Focus and editing.** Android defers View focus until attachment (0.83.0); `TextInput.isFocused()` fixes a false
  positive (0.85.0); a focused TextInput blurs before it unregisters on unmount (0.88.0).
- **Accessibility.** `aria-hidden` covers Text, non-editable TextInput and Image (0.82.0). Android views default
  to clickable based on `pointerEvents`, and `View.setEnabled()` follows `accessibilityState.disabled` (0.84.0).
  Android changes screen-reader behavior for `accessibilityState.expanded` (0.87.0).
- **Appearance and metrics.** Font-scale changes update layout by default (0.82.0), and `Appearance.setColorScheme`
  no longer accepts null (0.82.0). Android `OverrideColorScheme` gains change listeners (0.84.0). The iOS
  `isDarkerSystemColorsEnabled` and Android `isHighTextContrastEnabled` queries predate 0.81; 0.86.0 fixes promises
  that never resolved. The CSS `contrast` filter (0.83.0) is an image effect, not a contrast preference.
- **Presentation.** `parentNode` and `parentElement` return the containing element for Modal and other nested root
  host views instead of the document (0.87.0, backported to 0.86.3), restoring capture and bubble propagation to
  ancestors.
- **Pointer and responders.** Pressable accepts `blockNativeResponder` (0.82.0). The pointer callbacks in
  0.88.1 `ViewPropTypes` are still marked experimental and not ready for use.

## Not found in 0.88.1

The inspected packages and changelog contain no Popover, Portal or anchored-surface component; no forced-colors or
cross-platform contrast-preference query beyond the platform-specific iOS and Android queries; no handled-key declaration or native-default consumption; no focus outcome or result API; and
no root-scoped JavaScript surface metrics context. The typed collection metadata and standard accessibility action
names discussed in the [accessibility proposal](accessibility-proposal.md) were not found in the inspected diff.
These are absence-in-inspected-source findings, not proof that upstream work does not exist.

## Release candidate (not stable)

[0.89.0-rc.1](https://github.com/facebook/react-native/releases/tag/v0.89.0-rc.1) reports the following changes:

- iOS: `aria-modal` on View sets `accessibilityViewIsModal`; VoiceOver announces "collapsed" for
  `aria-expanded={false}` on the new architecture; `role="slider"` receives the adjustable trait.
- iOS: `AccessibilityInfo.isShowBordersEnabled()` and `showBordersChanged` report Show Borders, formerly Button
  Shapes. This is a shape preference, not a contrast or forced-colors signal.
- Android: Views with `aria-live` are no longer flattened, and `aria-live` on Text sets the live region.
- TV: the deprecated `hasTVPreferredFocus` prop is removed.

## Desktop fork releases

Newer desktop forks exist, but FURN has not adopted them. Their focus and keyboard sources show that the core
additions do not arrive uniformly:

| Package                          | FURN lock | Latest npm (core base) | Imperative View focus                                                                                                                                                                                                                                    | Key events                                                            |
| -------------------------------- | --------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `react-native-macos`             | 0.81.9    | 0.83.0 (0.83.10)       | The AppKit `focus` command calls `makeFirstResponder` without checking the flag; `acceptsFirstResponder` follows `focusable`. Fabric `ref.focus()` reaches it only when `enableImperativeFocus` is on; no macOS override was found                       | Keeps macOS `keyDownEvents`/`keyUpEvents` and its own `KeyEvent`      |
| `react-native-windows`           | 0.81.35   | 0.85.0 (0.85.3)        | The host overrides `enableImperativeFocus` to true. Composition Views focus through `TrySetFocusedComponent(..., Programmatic)`; a source TODO notes that blur does not restore a previous element                                                       | Keeps RNW `onKeyDown` with `keyDownEvents` beside core's declarations |
| `@office-iss/react-native-win32` | 0.81.9    | 0.85.0 (0.85.3)        | Paper: `TextInputState.win32.js` uses Win32 commands, and neither the Fabric flag path nor DOM ref methods apply; Paper public instances are `ReactNativeFiberHostComponent`. Native behavior is Office-owned and not verifiable from the public package | Keeps `ViewWin32` `keyDownEvents`                                     |

Sources: [RNmacOS View](https://github.com/microsoft/react-native-macos/blob/19f618c032c9f07967281ed5c462dc3259e8e7e1/packages/react-native/React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm)
and [element](https://github.com/microsoft/react-native-macos/blob/19f618c032c9f07967281ed5c462dc3259e8e7e1/packages/react-native/src/private/webapis/dom/nodes/ReactNativeElement.js)
at `react-native-macos@0.83.0`; [RNW host flags](https://github.com/microsoft/react-native-windows/blob/react-native-windows_v0.85.0/vnext/Microsoft.ReactNative/ReactHost/ReactHost.cpp),
[Composition View](https://github.com/microsoft/react-native-windows/blob/react-native-windows_v0.85.0/vnext/Microsoft.ReactNative/Fabric/Composition/CompositionViewComponentView.cpp),
[RNW View props](https://github.com/microsoft/react-native-windows/blob/react-native-windows_v0.85.0/vnext/src-win/Libraries/Components/View/ViewPropTypes.windows.js),
[Win32 View props](https://github.com/microsoft/react-native-windows/blob/react-native-windows_v0.85.0/packages/@office-iss/react-native-win32/src-win/Libraries/Components/View/ViewPropTypes.win32.js)
and [Win32 text-input state](https://github.com/microsoft/react-native-windows/blob/react-native-windows_v0.85.0/packages/@office-iss/react-native-win32/src-win/Libraries/Components/TextInput/TextInputState.win32.js).
The RNW tag's Win32 package declares version 0.85.0, matching npm.

### Inferred macOS upgrade risk

At FURN's 0.81.9 lock, Fabric refs route `focus()` through `TextInputState`, and RNmacOS lets that path focus any
View. FURN's [host focus record](../../../../packages/framework-base/src/hooks/hostFocusRecord.native.ts) compensates
for the resulting bookkeeping. In 0.83.0, DOM refs are the default and `ReactNativeElement.focus()` sends non-text
Views to `ViewCommands` only when `enableImperativeFocus` is on. The fork's
[`TextInputState` comment](https://github.com/microsoft/react-native-macos/blob/19f618c032c9f07967281ed5c462dc3259e8e7e1/packages/react-native/Libraries/Components/TextInput/TextInputState.js) names facebook/react-native#52472
as the intended fix for focusing arbitrary Views.

`enableImperativeFocus` is a native flag, and the JavaScript `override()` accepts only JavaScript-only flags, so a
host must enable it natively. Unless a macOS host does, Fabric `ref.focus()` on an ordinary View may do nothing.
FURN calls `focus()` on host refs in [focus targets](../../../../packages/framework-base/src/hooks/focusTarget.ts)
and in the [menu popup](../../../../packages/agentic/components/src/components/menu/menuPopup.tsx) edge, row and
type-ahead focus. The native-core `focus()` calls are in Win32 adapters, which use the Paper path.

The Paper JavaScript path still calls `TextInputState`, but the RNmacOS 0.83.0
[CocoaPods setup](https://github.com/microsoft/react-native-macos/blob/19f618c032c9f07967281ed5c462dc3259e8e7e1/packages/react-native/scripts/react_native_pods.rb) warns when the New Architecture is disabled and sets
`RCT_NEW_ARCH_ENABLED` and `RCT_FABRIC_ENABLED` to 1. FURN's macOS Paper lane builds the
[Storybook Podfile](../../../../apps/storybook/macos/Podfile) with `RCT_NEW_ARCH_ENABLED=0`, so it may not survive
the upgrade. Office builds that do not use CocoaPods were not inspected.
**This is inferred from source and build scripts and needs native execution before an upgrade.**

## Upgrade checks for FURN

1. Enable `enableImperativeFocus` natively in each Fabric host that relies on ordinary-View `ref.focus()`, because
   JavaScript overrides cannot set it. Then rerun focus fixtures on macOS Fabric and Paper, Windows Fabric and
   Win32 Paper. Confirm the actual focused native target, not just the command.
2. Keep desktop handled-key declarations; core key events are Android-only, flag-gated and non-consuming.
3. On Fabric backends, evaluate `isConnected`, `contains` and `getBoundingClientRect` for focus-target liveness and
   anchor geometry before replacing native-core checks. Win32 Paper refs do not have these methods.
4. Decide the macOS Paper lane before adopting RNmacOS 0.83.0, which forces the New Architecture under CocoaPods.
   Check whether a Win32 package built on core 0.86 or later still ships the Paper renderer.
5. Recheck pressable Text that has no explicit role, because it now defaults to `link`. A search of FURN TypeScript
   sources at the baseline found no uses of `setAccessibilityFocus`, the `'unspecified'` color scheme, a null
   `Appearance.setColorScheme` argument or Modal `animated`.

Core sources: [View commands](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/Libraries/Components/View/ViewNativeComponent.js),
[element focus](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/src/private/webapis/dom/nodes/ReactNativeElement.js),
[node DOM methods](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/src/private/webapis/dom/nodes/ReadOnlyNode.js),
[iOS View](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm),
[Android View manager](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views/view/ReactViewManager.kt),
[Android root](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/ReactRootView.java),
[key dispatcher](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/uimanager/JSKeyDispatcher.kt),
[View props](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/Libraries/Components/View/ViewPropTypes.js),
[AccessibilityInfo](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo.js),
[Modal](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/Libraries/Modal/Modal.js) and
[iOS PlatformColor](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/Libraries/StyleSheet/PlatformColorValueTypes.ios.js).
