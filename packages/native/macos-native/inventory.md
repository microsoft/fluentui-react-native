# macOS Native Control Inventory

This inventory catalogs stock AppKit controls as candidates for thin, primitive React Native wrappers in
`@fluentui-react-native/macos-native`. "Thin wrapper" means a component that exposes the native control's core
behavior/props via `codegenNativeComponent` (paper + fabric interop) without adding Fluent styling, tokens, or
composition — that layering belongs to higher-order components built on top, in `packages/components` /
`packages/agentic-components`.

Legend for **Decision**:

- **Now** — good first-wave candidate: high value, straightforward native surface, no risky new APIs.
- **Later** — valuable but higher complexity (data-source-backed views, complex accessibility, or overlaps with
  existing FRN components) — defer until first wave ships and patterns are proven.
- **Don't implement** — not a good fit for a thin RN primitive (redundant with RN core, app-chrome-only, or better
  left as native/host-level integration rather than a component).

## Core Controls

### NSButton

- **Description**: Standard push button; supports bezel styles (rounded, textured, glass, etc.), button types
  (momentary, toggle, switch, radio via `NSButtonType`), images, and key equivalents.
- **Customizations**: title/attributed title, image + image position, bezel style (`.glass` in Tahoe), button type,
  state (on/off/mixed), key equivalent, control size, tint/accent color, enabled/highlighted state.
- **Liquid Glass**: Yes — `NSButton.BezelStyle.glass` gives the floating translucent look introduced in macOS 26 Tahoe.
- **Summary**: RN already has a pressable/Button primitive, but NSButton's native bezel styles (glass, help,
  recessed) aren't reproducible with RN Views/styling and are core to native "feel." High value as a primitive.
  **Decision: Now**

### NSSwitch

- **Description**: Toggle switch control (introduced 10.15) — binary on/off control distinct from checkbox styling.
- **Customizations**: on/off state, tint color, enabled/disabled, control size.
- **Liquid Glass**: Automatic when placed in navigation/toolbar surfaces; no explicit API needed beyond correct
  container context.
- **Summary**: Simple, self-contained, no children — ideal thin wrapper; directly maps to a native toggle FRN
  components can build on. **Decision: Now**

### NSSlider

- **Description**: Continuous or tick-marked value slider; supports linear and circular styles.
- **Customizations**: min/max/value, tick marks, tick mark position, continuous vs. commit-on-release, vertical
  orientation, number of tick marks, track/knob tinting.
- **Liquid Glass**: Yes — morphs into a translucent "glass" look during active dragging in Tahoe.
- **Summary**: Straightforward value control with clear event surface (value changed / drag end). **Decision: Now**

### NSDatePicker

- **Description**: Calendar/clock style date & time picker, with graphical (clock/calendar) and text-field element
  styles.
- **Customizations**: date value, min/max date range, mode (single value / range), element flags (year/month/day/
  hour/minute/etc.), calendar/locale/timezone, text vs. graphical style.
- **Liquid Glass**: No special glass treatment documented; renders with standard opaque chrome.
- **Summary**: Useful cross-platform gap-filler (RN has no native date picker on macOS), but locale/calendar/range
  configuration is nontrivial surface area to expose thinly and correctly. **Decision: Later**

### NSColorWell

- **Description**: Swatch control that opens the system color panel for color selection.
- **Customizations**: color value, style (default vs. minimal "expanded" well in newer macOS), enabled state,
  supports-alpha flag.
- **Liquid Glass**: No documented explicit glass treatment.
- **Summary**: Small, self-contained, exposes a system affordance (color panel) RN can't otherwise reach. Good thin
  wrapper candidate — no children, simple value + callback contract. **Decision: Later**

### NSSegmentedControl

- **Description**: Row of mutually exclusive or independently toggleable segments; text, image, or template-image
  labeled.
- **Customizations**: segment count, per-segment label/image/width/enabled/selected, tracking mode (select-one vs.
  momentary/multiple), segment style (rounded, textured, separated, capsule).
- **Liquid Glass**: Yes, supports the glass look when placed on nav bars/toolbars.
- **Summary**: A close native analogue of segmented/tab-strip UI already common in FRN design; useful as a
  primitive backing a higher-order `TabList`/`SegmentedControl` component. **Decision: Now**

## Other Standard Controls

### NSTextField / NSSecureTextField

- **Description**: Single-line (or multi-line via cell wrapping) editable text input; secure variant masks input.
- **Customizations**: placeholder, editable/selectable, secure flag, formatter, font, alignment, bezel style
  (square/rounded), continuous vs. commit-on-enter change notification.
- **Liquid Glass**: Rarely applied to text fields directly; not a typical glass surface.
- **Summary**: RN's built-in `TextInput` already renders through a native `NSTextField`-backed implementation on
  macOS via react-native-macos, so a bespoke wrapper would largely duplicate existing coverage without a clear win.
  **Decision: Don't implement**

### NSTableView / NSOutlineView

- **Description**: Data-source-backed table (flat rows/columns) and hierarchical outline (tree) views with cell
  reuse, sorting, and drag-reorder support.
- **Customizations**: columns (width/title/sort descriptor), row height, selection mode (single/multi), grouping,
  expand/collapse (outline), alternating row colors, drag & drop reordering.
- **Liquid Glass**: Not a glass surface — remains an opaque content layer per Apple's guidance (glass is reserved for
  chrome, not content lists).
  **Summary**: High potential value (native list virtualization + sorting/grouping RN's `FlatList` lacks on macOS),
  but the data-source/cell-provider bridging model is substantial native + JS bridge work, well beyond a thin
  wrapper. Needs its own design pass. **Decision: Later**

### NSComboBox

- **Description**: Text field combined with a dropdown list of suggestions/choices; supports free-form entry.
- **Customizations**: item list, editable flag, number of visible items, completion behavior, button (arrow) visible.
- **Liquid Glass**: No documented explicit glass styling.
- **Summary**: Overlaps with NSPopUpButton but adds free-text entry complexity; moderate value, not urgent for a
  first wave. **Decision: Later**

### NSPopUpButton

- **Description**: Button that reveals a pull-down or pop-up menu of choices (i.e., a native "select").
- **Customizations**: item titles/images, pull-down vs. pop-up style, selected index, bezel style, preferred edge.
- **Liquid Glass**: Inherits button glass styling when using glass bezel style.
- **Summary**: Fills a real gap — RN has no native macOS "select"/dropdown primitive — and its menu-of-titles API is
  simple to expose thinly. **Decision: Now**

### NSProgressIndicator

- **Description**: Determinate (bar) or indeterminate (spinner) progress indicator.
- **Customizations**: style (bar/spinner), determinate flag, min/max/value, animating on/off, control size.
- **Liquid Glass**: Yes, switches to a glass look when floating in overlay/toolbar contexts.
- **Summary**: RN's `ActivityIndicatorView` on macOS already covers the spinner case; the bar/determinate case adds
  modest incremental value. Small enough to fold in without new risk. **Decision: Now**

### NSStepper

- **Description**: Small twin up/down arrows control for incrementing/decrementing a numeric value.
- **Customizations**: min/max/value, increment amount, autorepeat, wraps-around flag, orientation (vertical only).
- **Liquid Glass**: No documented explicit glass treatment.
- **Summary**: Simple, self-contained value control frequently paired with a text field; low implementation risk.
  **Decision: Now**

### NSImageView

- **Description**: Displays a static image, optionally editable (drag & drop) and animatable (e.g., animated GIF).
- **Customizations**: image source, scaling/alignment, editable, allows-cut-copy-paste, symbol configuration
  (SF Symbols rendering mode/weight/scale), animates flag.
- **Liquid Glass**: No special glass treatment.
- **Summary**: RN's `Image`/`react-native-macos` Image component already covers static image rendering; the main
  differentiator (SF Symbols rendering configuration, drag & drop) is niche. **Decision: Don't implement**

### NSScrollView

- **Description**: Scrollable container, typically hosting a document view (table, outline, text, custom content).
- **Customizations**: scroller style (legacy/overlay), elasticity, scroll indicators, magnification (zoom), rulers.
- **Liquid Glass**: Not a glass surface itself; N/A.
- **Summary**: RN's `ScrollView` already wraps native scrolling on macOS; a bespoke primitive would duplicate
  existing, well-tested coverage. **Decision: Don't implement**

### NSCollectionView, NSTabView, NSToolbar (grouped: complex composite views)

- **Description**: `NSCollectionView` — flow/grid layout of reusable item views; `NSTabView` — classic tabbed
  container switching between full subviews; `NSToolbar` — window-level toolbar with customizable items.
- **Customizations**: layout (grid/flow) and item templates (collection view); tab items/labels/icons (tab view);
  toolbar item set, customization palette, display mode (icon/label/both), sidebar-toggle item (toolbar).
- **Liquid Glass**: `NSToolbar` is a primary glass surface in Tahoe (automatic); `NSTabView`/`NSCollectionView`
  are not.
- **Summary**: All three are powerful but are window/app-chrome or data-source-driven composite views, not simple
  primitives — they need dedicated design work (and, for toolbar, deeper integration with the RN window/root view
  than a typical child component allows). **Decision: Later** (toolbar), **Later** (collection view), **Don't
  implement** (tab view — RN's own navigation/tab patterns are the idiomatic solution here).

## Container / Navigation Controls

### NSStackView

- **Description**: Auto-layout-driven horizontal/vertical stack that arranges its arranged subviews with spacing/
  alignment/distribution rules.
- **Customizations**: orientation, spacing, alignment, distribution, edge insets.
- **Liquid Glass**: N/A (layout container, not a rendered surface).
- **Summary**: RN's Flexbox layout (View + style) already provides equivalent (and more flexible, cross-platform)
  stacking behavior; wrapping NSStackView would fight against RN's own layout engine. **Decision: Don't implement**

### NSSplitView

- **Description**: Resizable split container (2+ panes) with draggable dividers; commonly used for sidebar +
  content layouts.
- **Customizations**: orientation (vertical/horizontal split), divider style, collapse behavior per pane, min/max
  pane size, autosave of divider position.
- **Liquid Glass**: Sidebar panes commonly host glass material (via `NSVisualEffectView`), but the split view itself
  is a layout/interaction control, not a glass surface.
- **Summary**: Native, resizable master-detail/sidebar layout has no RN equivalent and is a common desktop app
  pattern; worth a primitive once core controls are validated. **Decision: Later**

### NSVisualEffectView (vibrancy/blur; predecessor to Liquid Glass on window chrome)

- **Description**: Renders system blur/vibrancy materials behind or around content (sidebar, sheet, popover,
  titlebar, hud, etc. materials).
- **Customizations**: material, blending mode (behind window / within window), state (active/inactive/follows-
  window), emphasized flag.
- **Liquid Glass**: Complements/underlies glass effects; still the primary API for vibrancy materials pre- and
  alongside Tahoe's new glass APIs.
- **Summary**: High value — RN has no built-in way to get native background blur/vibrancy on macOS, and it's a
  simple container (no data source, just a material + children). Strong first-wave candidate. **Decision: Now**

### NSGlassEffectView / NSGlassEffectContainerView

- **Description**: New Tahoe (macOS 26) API for applying the "Liquid Glass" floating/lensing material to custom
  views, and for grouping multiple glass elements into a single coherent glass surface for performance/visual
  consistency.
- **Customizations**: corner radius/shape (via `cornerConfiguration` or similar), tint color, content view; the
  container variant additionally manages spacing and morphing between grouped glass elements.
- **Liquid Glass**: This IS the Liquid Glass API surface.
- **Summary**: Directly relevant to the "special appearance for liquid glass" ask in the plan — a thin wrapper here
  would let FRN consumers opt into custom glass surfaces (e.g., floating action bars) that match system chrome.
  Requires macOS 26+ availability guards and careful fallback for older OS versions. **Decision: Now** (flagged as
  higher risk due to newness/availability gating — validate against the target minimum OS deployment first).

### SwiftUI DisclosureGroup

- **Description**: Expandable container with a native disclosure indicator, text label, and content region.
- **Customizations**: label, expanded state, disabled state, and arbitrary React Native child content.
- **Liquid Glass**: No explicit glass API; it follows the surrounding SwiftUI environment.
- **Summary**: Provides native macOS disclosure interaction and accessibility semantics while remaining a small
  container primitive. **Decision: Now**

## Overall Recommendations (Decision Summary)

| Control                                        | Decision                                     |
| ---------------------------------------------- | -------------------------------------------- |
| NSButton                                       | Now                                          |
| NSSwitch                                       | Now                                          |
| NSSlider                                       | Now                                          |
| NSDatePicker                                   | Later                                        |
| NSColorWell                                    | Later                                        |
| NSSegmentedControl                             | Now                                          |
| NSTextField / NSSecureTextField                | Don't implement (covered by RN `TextInput`)  |
| NSTableView / NSOutlineView                    | Later                                        |
| NSComboBox                                     | Later                                        |
| NSPopUpButton                                  | Now                                          |
| NSProgressIndicator                            | Now                                          |
| NSStepper                                      | Now                                          |
| NSImageView                                    | Don't implement (covered by RN `Image`)      |
| NSScrollView                                   | Don't implement (covered by RN `ScrollView`) |
| NSCollectionView                               | Later                                        |
| NSToolbar                                      | Later                                        |
| NSTabView                                      | Don't implement (use RN navigation patterns) |
| NSStackView                                    | Don't implement (use RN Flexbox)             |
| NSSplitView                                    | Later                                        |
| NSVisualEffectView                             | Now                                          |
| NSGlassEffectView / NSGlassEffectContainerView | Now (higher risk — new/OS-gated API)         |
| SwiftUI DisclosureGroup                        | Now                                          |

**Implemented controls**: NSButton, NSSwitch, NSSlider, NSSegmentedControl, NSPopUpButton, NSProgressIndicator,
NSStepper, NSVisualEffectView, and SwiftUI DisclosureGroup. These share a small typed prop surface and native event
contract suitable for `framework-base` primitives with `codegenNativeComponent`. See
`@fluentui-react-native/macos-native` (`packages/native/macos-native`) and its `SPEC.md` for the implementation. The
Liquid Glass views (NSGlassEffectView / NSGlassEffectContainerView) remain unimplemented pending confirmation of a
minimum macOS 26 deployment target.

**Second wave ("Later")**: NSColorWell, NSDatePicker, NSTableView/NSOutlineView, NSComboBox, NSCollectionView,
NSToolbar, NSSplitView — each needs a dedicated design pass (data source bridging, window-level integration, or
complex locale/range configuration) before implementation. NSColorWell was moved from the first wave to this list
after further review.

**Excluded ("Don't implement")**: NSTextField/NSSecureTextField, NSImageView, NSScrollView, NSStackView, NSTabView —
all substantially overlap with existing React Native (or react-native-macos) core components or RN's own layout/
navigation model, so a bespoke native wrapper would add maintenance cost without a clear capability gain.
