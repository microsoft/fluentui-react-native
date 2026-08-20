# @fluentui-react-native/macos-native

Thin React Native wrappers for stock macOS AppKit controls. Each component here is a **primitive**: it maps a
native AppKit control's core props/events into React Native with no Fluent styling, tokens, or composition layered
on top. Higher-order, styled components should be built on top of these primitives in `packages/components` /
`packages/agentic-components`, not inside this package.

See `packages/native/macos-native/PLAN.md` for the original plan and `inventory.md` for the full control inventory
and decisions (Now / Later / Don't implement).

## Components in this package (first wave — "Now")

| Component           | AppKit control                     | Notes                                                                                                                              |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Button`            | `NSButton` (momentary push button) | `bezelStyle` includes `'glass'` (macOS 26 Tahoe Liquid Glass), which falls back to the default rounded bezel on older OS versions. |
| `DisclosureGroup`   | SwiftUI `DisclosureGroup`          | Expandable native container that hosts React Native children and reports expansion changes.                                        |
| `Switch`            | `NSSwitch`                         | Simple on/off toggle.                                                                                                              |
| `Slider`            | `NSSlider`                         | Continuous or commit-on-release value slider, with optional tick marks.                                                            |
| `SegmentedControl`  | `NSSegmentedControl`               | Array-of-segments API; segments rebuild natively whenever the `segments` prop changes.                                             |
| `PopUpButton`       | `NSPopUpButton`                    | Native "select"/dropdown; supports pop-up (selection) and pull-down (action menu) styles.                                          |
| `ProgressIndicator` | `NSProgressIndicator`              | Determinate bar or indeterminate spinner; `animating` starts/stops the native animation.                                           |
| `Stepper`           | `NSStepper`                        | Small increment/decrement control, typically paired with a text field or label.                                                    |
| `VisualEffectView`  | `NSVisualEffectView`               | Re-exported from `@fluentui-react-native/vibrancy-view` (see below) rather than re-implemented.                                    |

`NSColorWell`, `NSDatePicker`, `NSTableView`/`NSOutlineView`, `NSComboBox`, `NSCollectionView`, `NSToolbar`, and
`NSSplitView` are deferred to a follow-up design pass (see inventory.md's "Later" list) and are intentionally not
implemented in this package yet.

## Why VisualEffectView re-exports vibrancy-view

`NSVisualEffectView` was already implemented natively as `@fluentui-react-native/vibrancy-view`
(`packages/experimental/VibrancyView`). To avoid two competing native views for the same AppKit control, this
package depends on that package and re-exports it as `VisualEffectView` instead of duplicating its Swift/podspec
implementation.

## Native implementation pattern

Every component (other than `VisualEffectView`) follows the same shape, mirroring existing FRN native components
such as `packages/experimental/Checkbox` and `packages/components/MenuButton`:

- `macos/FRN<Name>.swift` — a thin `NS<Control>` subclass exposing an `@objc` event block property (e.g.
  `onPress`/`onChange`/`onValueChange`) wired to the control's native target/action.
- `macos/FRN<Name>Manager.swift` — an `RCTViewManager` subclass whose `view()` returns a new instance of the Swift
  view above.
- `macos/FRN<Name>Manager.m` — the Objective-C `RCT_EXTERN_MODULE`/`RCT_EXPORT_VIEW_PROPERTY` bridge (plus
  `RCTConvert` categories for enum/array-valued props), following the interop pattern used by existing FRN native
  view managers so the component works under both the old (Paper) and new (Fabric) architectures.
- `src/<Name>/<Name>NativeComponent.ts` — `requireNativeComponent` typing used by the old architecture.
- `src/<Name>/<Name>NativeComponent.macos.ts` — `codegenNativeComponent` typing used for Fabric codegen.
- `src/<Name>/<Name>.types.ts` — the public, documented prop types for the component.
- `src/<Name>/<Name>.tsx` — the thin RN component that renders the native host component and reshapes native
  event payloads into plain callback arguments (e.g. `onValueChange?: (value: number) => void`).
- `src/<Name>/<Name>.stories.tsx` — a colocated Storybook story (Storybook CSF3, `Meta`/`StoryObj`).

`DisclosureGroup` additionally embeds SwiftUI through `NSHostingView` and redirects React Native child views into the
SwiftUI disclosure content. On macOS 10.15, where SwiftUI's `DisclosureGroup` is unavailable, it falls back to a plain
React Native container.

All native `.swift`/`.h`/`.m` sources live together under a single `macos/` directory and are packaged by
`FRNMacosNative.podspec`, matching the single-package structure requested by `PLAN.md`.

## Known limitations / follow-ups

- **Storybook host**: the colocated stories are loaded by `apps/storybook`, which directly
  depends on this package so React Native autolinking includes the macOS pod. Use that app for native build and runtime
  verification.
- **Liquid Glass availability gating**: `Button`'s `'glass'` bezel style is guarded with `@available(macOS 26.0, *)`
  and falls back to `rounded` on older OS versions; this has not been runtime-verified against an actual macOS 26
  device/simulator.
- **FluentTester test pages / E2E tests** (per AGENTS.md's component onboarding steps) have not been added; these
  are primitives without a design/token layer, so a decision on whether full E2E coverage is warranted for this
  package is still open (see PLAN.md's "Open decisions").
