# Windows divergences from React Native

## Scope and baseline

This is a high-level comparison of **React Native Windows (RNW)** and
**`@office-iss/react-native-win32` (win32)** with upstream React Native. It describes
application-facing capabilities and integration contracts, not individual patches
or an exhaustive prop-by-prop compatibility matrix.

The analysis reflects this repository at `ae439afb21` and its installed upstream
baseline, `react-native@0.89.0-nightly-20261002-cd2de187e`, inspected on November 11,
2026. **Observed** capabilities below come from public source, declarations, and
samples; the implications are **inferred**, not results of running every feature.

The two Windows targets are not interchangeable:

- **RNW** is the public Windows implementation. Its new architecture uses Fabric
  with Windows Composition and Windows App SDK hosting. The repository also
  retains older XAML/Paper-era APIs.
- **win32** is the JavaScript package for Office's Win32 UI framework. Its README
  explicitly says that the native framework is not open source and the package
  is not generally consumable independently. Its public JS contracts can be
  analyzed here, but its complete native hosting, rendering, and lifecycle
  behavior cannot.
- **RNW running in a Win32 application is still RNW**, not the
  `react-native-win32` package. In particular, RNW's native
  `ReactNativeWin32App` class should not be confused with that package.[^scope]

## Overall assessment

The largest divergences are **desktop interaction**, **Windows accessibility**,
and **integration into an existing native application**. Both targets retain the
React component model and much of upstream's JavaScript surface, while extending
or adapting the contracts around it.

RNW exposes a substantial public native platform: windows, embeddable content
islands, runtime hosts, custom components, and Windows services. win32 exposes a
desktop/Office-oriented JS surface whose native implementation belongs to its
host. Similar-looking APIs therefore do not establish feature parity.

Importantly, modern upstream React Native already declares key, focus, mouse, and
pointer events, ARIA-style roles, native hosts, and render surfaces. The remaining
divergence is not simply "Windows adds keyboard support" or "Windows supports
embedding"; it is the additional behavior and platform contracts described below.[^upstream]

## 1. Focus is a desktop and window-integration concern

Upstream provides focusable elements, focus events, and imperative focus APIs.
The Windows targets build on this with desktop focus policy: tab participation,
system focus visuals, and coordination between React content and its native host.

**RNW** exposes focus-ring control and a `Pressable` policy for whether pressing a
control takes focus. Its native component API distinguishes keyboard, pointer,
and programmatic focus; allows focus transitions to be redirected or cancelled;
and supports entering an island at its first or last focusable element or
restoring focus. This makes focus crossing the native/React boundary an explicit
hosting responsibility.

**win32** additionally exports a JS `FocusManager` that distinguishes *polite*
focus from *aggressive* focus through a `setWindowFocus` argument. That is a
window-focus policy beyond merely choosing a React element. Its specialized
touchable API also exposes focused, hovered, and pressed state for rendering.

**Implication:** a reusable desktop component must consider where focus goes,
whether the containing window should receive focus, and how focus is restored.
An upstream-compatible `focus()` call alone does not capture those policies.[^focus]

## 2. Keyboard handling includes ownership of native input

Both targets retain desktop-specific **handled-key declarations** alongside
ordinary key callbacks. These declarations describe keys, modifiers, and event
phases so that an application can reserve an input rather than merely observe
it. Their JS wrappers apply propagation rules; RNW's Fabric implementation also
marks matching native key events as handled.

RNW's native component surface adds routed character, context-menu-key, pointer,
wheel, and pointer-capture integration. Its scrolling implementation handles
desktop navigation keys such as Page Up, Page Down, Home, End, and arrow keys.
The win32 declarations also expose desktop presentation controls such as tooltips
and cursors.

**Implication:** shortcuts and keyboard navigation must coexist with the
surrounding native application. This is a more substantial difference than
having an `onKeyDown` callback, which already exists upstream. The Windows and
win32 contracts are similar in purpose but should not be assumed identical in
event shape or native behavior.[^input]

## 3. Accessibility extends into Windows UI Automation semantics

Upstream already provides accessible names, roles, states, actions, and
announcements. The Windows targets extend those contracts for desktop controls
and Windows UI Automation (UIA).

**RNW** adds semantic information for hierarchical and collection controls, such
as level, position in a set, and set size, plus states such as read-only,
multi-selectable, and required. Its Fabric automation provider implements UIA
patterns for operations including invoke, scroll, value/range value, toggle,
expand/collapse, and selection. Custom native components can provide an
automation peer.

**win32** exposes additional relationships and document-oriented metadata:
described-by and controls relationships, access keys, item types, and annotations
such as comments, spelling issues, and tracked changes. It also extends
accessibility announcements with a `nativeID` identifying the element from which
an announcement originates.

Some desktop roles appear as additions to `accessibilityRole`, but many of the
same concepts already exist in upstream's separate `role` vocabulary. The
important divergence is the richer metadata and its Windows automation behavior,
not the mere existence of a tree or dialog role name.

**Implication:** complex desktop widgets and document UI need more than a spoken
label. Relationships, hierarchy, selection, and automation patterns become part
of their functional contract. The win32 additions above are public contracts;
their complete private native implementation is outside this review.[^accessibility]

## 4. Accessibility modes and theming go beyond light and dark

Upstream's appearance and accessibility APIs cover several platform settings.
RNW separately exports **`AppTheme`**, including Windows high-contrast state,
high-contrast system colors, and change notifications. High contrast is not
equivalent to dark mode.

RNW also lets native hosts supply custom resources for platform colors, including
resources associated with an individual React island. This allows React content
to participate in its host's theme rather than assume that every surface in the
process uses the same palette.

win32 has its own platform-color resource representation and an additional
`ColorGradientWin32` color API. Its public entry point does not expose RNW's
`AppTheme` API; the same high-contrast integration contract should not be assumed
for both targets.

**Implication:** theming adapters need to account for Windows accessibility colors
and host-provided resources, not just choose a light or dark stylesheet. Similar
`PlatformColor` calls do not imply interchangeable resource names or resolution
behavior.[^theme]

## 5. Top-level windows and overlays are explicit platform concepts

Upstream supports native windows and modal presentation through its platform
implementations, but it does not supply RNW's Windows-specific windowing contract.

**RNW's native API** separates the React content island from the containing
window. `ReactNativeWindow` can create or use an AppWindow, connect it to an
island/content bridge, and choose whether content follows the window size or the
window follows the content. The host can also supply the active top-level HWND
for APIs that need a native window.

**RNW's JS `Modal`** adds desktop window chrome controls, including a title and
title-bar/border visibility. The Fabric implementation creates a separate
Windows popup/window-backed surface and integrates native close requests and
focus handling with React.

The package also exports **`Popup` and `Flyout`**, with anchoring, placement,
light-dismiss, and focus policies. These are **legacy distinctions, not current
Fabric capabilities**: both implementations explicitly warn that they are
deprecated and unsupported in the new architecture and direct callers to
`Modal`.

For **win32**, this repository does not establish an equivalent public
top-level-window management API. Its Office-hosted nature is not evidence that
RNW's windowing APIs are available to it.

**Implication:** a desktop dialog or secondary surface involves window ownership,
activation, dismissal, and sizing, not only drawing a view above another view.
Native window-management APIs must also be distinguished from JS exports.[^windows]

## 6. Hosting separates the runtime, the React root, and the native surface

Upstream already has host and surface abstractions, including Android's
`ReactHost` and iOS's React Native/root-view factories. RNW's divergence is its
Windows-facing configuration and integration model, not the invention of
multiple roots or explicit runtime lifecycles.

**RNW** provides a `ReactNativeHost` that configures and explicitly loads, reloads,
and unloads a React instance. Instance settings expose lifecycle notifications,
bundle configuration, package providers, a UI dispatcher, and a JavaScript
engine selection contract for Hermes or V8.

Root content is managed separately through view hosts and view options, then
connected to a `ReactNativeIsland` or window. A native application can manage the
runtime lifetime independently from attaching or detaching its UI surfaces.
`ReactNativeAppBuilder` supplies a convenience path for a standalone Windows app,
rather than requiring all integrations to own those pieces manually.

The host/context also supplies shared properties and notifications for native
integration. These services, together with the dispatcher and lifecycle
contracts, matter when React is embedded in an application that already owns its
threads, resources, and UI.

**win32** is explicitly host-dependent, but the public package does not reveal
enough of Office's native instance manager to characterize its instance-sharing,
threading, or teardown guarantees. It would be misleading to attribute every
RNW host API to win32 or to infer its runtime topology from the JS package.

**Implication:** integrating either target is not necessarily equivalent to
launching a self-contained React application. For RNW, native hosts have an
explicit public lifecycle contract; for win32, that contract must also be
obtained from the owning host.[^hosting]

## 7. Native modules and custom controls have Windows-specific authoring contracts

The JS concepts of native modules, TurboModules, and Fabric components are shared
with upstream. The native implementation and registration APIs are not.

**RNW** exposes WinRT package/module builders, C++ attributed-module helpers, and
managed module infrastructure. Its Fabric custom-component API supplies hooks
for layout, state, events, commands, composition visuals, focus, and automation
peers. Content-island components can embed another native island, enabling
integration with UI outside the ordinary React view tree.

These are Windows counterparts to upstream's platform-native extension points,
not a claim that upstream lacks custom native UI. They also do not imply that
every legacy managed or XAML integration is interchangeable with a current
Fabric component.

**win32** connects its JS components to Office-native implementations. Its
published JS package is not a standalone native-component SDK equivalent to RNW.

**Implication:** sharing a component's JS interface does not eliminate the need
for a Windows implementation, registration path, and accessibility/input
integration. Native extension portability is a separate concern from JS API
portability.[^native]

## 8. Viewport and sizing assumptions differ in embedded desktop UI

Upstream's `Dimensions` and `useWindowDimensions` offer a convenient window/screen
model. Desktop embedding can have several independently sized React surfaces
inside one application.

**RNW** exposes per-island measurement, arrangement, scale, and size changes, plus
window/content resize policies. This is a native-host contract for fitting React
content into a particular surface.

**win32's `Dimensions` implementation explicitly documents that a global window
and screen model is too simple for its environment.** It exposes font scaling
while warning that other window dimension information can be undefined. Code
that assumes a meaningful global window width therefore has a concrete
portability risk.

**Implication:** responsive desktop components should use the dimensions of their
actual containing surface or layout, rather than automatically treating a
process-wide window metric as the available space.[^sizing]

## 9. Text entry and component composition have desktop-specific behavior

Both targets extend text input with configurable submit-key combinations and an
option to clear text synchronously when submitting. RNW also carries the desktop
focus, tooltip, and handled-key contracts onto text input.

These additions are useful for editors, command fields, and other keyboard-heavy
UI where Enter, modified Enter, and native shortcut handling have distinct
meanings. They are separate from upstream's existing selection, editing, and
submission APIs.

There are also restrictions rather than additions: the current win32 `View`
implementation rejects nesting a `View` inside `Text`. Familiar component names
therefore do not guarantee identical composition behavior.

**Implication:** text-heavy cross-platform UI needs explicit keyboard policy and
verification of supported inline content, not just a shared visual layout.[^text]

## 10. The extra component surface reflects different platform priorities

RNW retains Windows-oriented exports such as `Glyph`, `Popup`, and `Flyout`.
`Glyph` is a wrapper for a XAML glyph control; the overlay exports have the
new-architecture limitation described above. These should not be presented as a
uniform set of current Fabric primitives.

win32 exports specialized components such as `ViewWin32`, `ButtonWin32`, and
`TouchableWin32`, as well as `PersonaCoin`, a native identity/avatar-and-presence
control. Its touchable API explicitly supports rendering from focus, hover, and
press state.

**Implication:** some divergence is an intentionally larger desktop/Office
component surface, not a change to React's rendering model. Those exports create
dependencies on the corresponding platform and, for win32 native controls, its
host framework.[^components]

## 11. Application services and compatibility require platform decisions

The targets identify themselves separately as `Platform.OS === 'windows'` and
`Platform.OS === 'win32'`. Their `Platform.select` implementations select their
own key, then `native`, then `default`; win32 does not automatically choose a
`windows` branch.

Application services also have host-specific behavior. RNW permits native hosts
to retain ownership of back navigation rather than forward it to JS. Its alert
adapter and win32's alert adapter invoke different native services; win32
explicitly throws for `Alert.prompt`. Mobile-oriented facilities can be adapted
or fall back rather than preserve mobile behavior, as with win32's `SafeAreaView`
falling back to `View`.

Both packages reuse substantial upstream JS and then overlay platform files.
Consequently, **an export or a type declaration is not by itself proof of a
working native capability**. This is particularly important for mobile-specific
APIs, newer upstream features, and legacy Windows exports.

**Implication:** platform selection, renderer generation, and host capabilities
must all be considered. "Works on Windows" is not a sufficiently precise
compatibility claim.[^compatibility]

## Practical boundary for shared code

The best high-level dividing line is:

- **Generally shared:** React composition and state, much of the core component
  vocabulary, and application logic that does not assume a particular native
  host or platform service.
- **Desktop adaptation:** focus policy, shortcut ownership, rich accessibility
  semantics, high contrast, surface sizing, and text-entry interaction.
- **Platform/host integration:** top-level windows, runtime and surface
  lifecycles, native modules/components, resource providers, and Office-native
  controls.

RNW and win32 address overlapping desktop needs, but they are **different
platform contracts**, not two package names for the same Windows implementation.

## Representative source references

Paths are relative to the repository root unless identified as upstream. These
are evidence entry points, not an inventory of every changed file.

[^scope]: `vnext\README.md` (new architecture);
    `packages\@office-iss\react-native-win32\README.md` (native framework boundary);
    `vnext\Microsoft.ReactNative\ReactNativeAppBuilder.idl`;
    `vnext\package.json` and `packages\@office-iss\react-native-win32\package.json`
    (upstream version pins).

[^upstream]: Upstream baseline:
    [View event contracts](https://github.com/facebook/react-native/blob/cd2de187e/packages/react-native/Libraries/Components/View/ViewPropTypes.js),
    [accessibility roles](https://github.com/facebook/react-native/blob/cd2de187e/packages/react-native/Libraries/Components/View/ViewAccessibility.js),
    [Android ReactHost](https://github.com/facebook/react-native/blob/cd2de187e/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/ReactHost.kt),
    and [iOS factory](https://github.com/facebook/react-native/blob/cd2de187e/packages/react-native/Libraries/AppDelegate/RCTReactNativeFactory.h).
    These files were inspected in the installed upstream package.

[^focus]: `vnext\Microsoft.ReactNative\ComponentView.idl`;
    `vnext\Microsoft.ReactNative\ReactNativeIsland.idl`;
    `vnext\src-win\Libraries\Components\Pressable\Pressable.windows.js`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Utilities\FocusManager.win32.js`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Components\Touchable\TouchableWin32.Props.tsx`.

[^input]: `vnext\src-win\Libraries\Components\View\View.windows.js`;
    `vnext\Microsoft.ReactNative\Fabric\Composition\CompositionViewComponentView.cpp`
    (`OnKeyDown`/`OnKeyUp`);
    `vnext\Microsoft.ReactNative\Fabric\Composition\ScrollViewComponentView.cpp`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Components\View\View.win32.js`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Components\View\ViewPropTypes.d.ts`.

[^accessibility]: `vnext\src-win\Libraries\Components\View\ViewAccessibility.windows.js`;
    `vnext\src-win\Libraries\Components\View\ViewPropTypes.windows.js`;
    `vnext\Microsoft.ReactNative\Fabric\Composition\CompositionDynamicAutomationProvider.h`;
    `vnext\Microsoft.ReactNative\IReactViewComponentBuilder.idl`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Components\View\ViewAccessibility.d.ts`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Components\AccessibilityInfo\AccessibilityInfo.win32.js`;
    `packages\@office-iss\react-native-win32-tester\src\js\examples-win32\Accessibility\AccessibilityExampleWin32.tsx`.

[^theme]: `vnext\src-win\Libraries\AppTheme\AppTheme.js`;
    `vnext\Microsoft.ReactNative\Modules\AppThemeModuleUwp.cpp`;
    `vnext\Microsoft.ReactNative\Theme.idl`;
    `vnext\Microsoft.ReactNative\ReactNativeIsland.idl`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\StyleSheet\PlatformColorValueTypes.win32.js`;
    `packages\@office-iss\react-native-win32\src-win\index.win32.js`.

[^windows]: `vnext\Microsoft.ReactNative\ReactNativeWindow.idl`;
    `vnext\Microsoft.ReactNative\ReactCoreInjection.idl`;
    `vnext\src-win\Libraries\Modal\Modal.d.ts`;
    `vnext\Microsoft.ReactNative\Fabric\Composition\Modal\WindowsModalHostViewComponentView.cpp`;
    `vnext\src-win\Libraries\Components\Popup\Popup.js`;
    `vnext\src-win\Libraries\Components\Flyout\Flyout.js`.

[^hosting]: `vnext\Microsoft.ReactNative\ReactNativeHost.idl`;
    `vnext\Microsoft.ReactNative\ReactInstanceSettings.idl`;
    `vnext\Microsoft.ReactNative\ReactCoreInjection.idl`;
    `vnext\Microsoft.ReactNative\IReactContext.idl`;
    `vnext\Microsoft.ReactNative\ReactNativeAppBuilder.idl`;
    `packages\@office-iss\react-native-win32\README.md`.
    Many of the island, view-host, and app-builder APIs are marked experimental.

[^native]: `vnext\Microsoft.ReactNative\IReactPackageBuilder.idl`;
    `vnext\templates\cpp-lib\windows\MyLib\ReactPackageProvider.cpp`;
    `vnext\template\cs-lib\src\ReactNativeModule.cs`;
    `vnext\Microsoft.ReactNative\IReactViewComponentBuilder.idl`;
    `vnext\Microsoft.ReactNative\CompositionComponentView.idl`.

[^sizing]: `vnext\Microsoft.ReactNative\ReactNativeIsland.idl`;
    `vnext\Microsoft.ReactNative\Fabric\Composition\ReactNativeWindow.cpp`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Utilities\Dimensions.win32.js`.

[^text]: `vnext\src-win\Libraries\Components\TextInput\TextInput.flow.windows.js`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Components\TextInput\TextInput.flow.win32.js`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Components\View\View.win32.js`.

[^components]: `vnext\src-win\index.windows.js`;
    `vnext\src-win\Libraries\Components\Glyph\Glyph.js`;
    `packages\@office-iss\react-native-win32\src-win\index.win32.js`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\PersonaCoin\PersonaCoin.tsx`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\PersonaCoin\PersonaCoinTypes.ts`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Components\Touchable\TouchableWin32.Props.tsx`.

[^compatibility]: `vnext\src-win\Libraries\Utilities\Platform.windows.js`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Utilities\Platform.win32.js`;
    `vnext\Microsoft.ReactNative\QuirkSettings.idl`;
    `vnext\src-win\Libraries\Alert\Alert.windows.js`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Alert\Alert.win32.js`;
    `packages\@office-iss\react-native-win32\src-win\Libraries\Components\SafeAreaView\SafeAreaView.win32.js`;
    `packages\@rnw-scripts\just-task\copyRNLibraries.js`.
