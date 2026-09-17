# Tab accessibility

## Native semantics

The root is the accessible element. It sets `accessibilityRole="tab"` and
publishes `selected` and `disabled` through `accessibilityState`, merged over
any state the caller passes so a caller cannot contradict the rendered
selection. The `controls` prop is forwarded to the platform as the
controlled-element relationship, which is how a screen reader user moves from
the tab to the panel it shows.

On Windows the root maps to a UI Automation tab item that exposes the selection
state; Narrator reads the name, the control type, and whether the tab is
selected. On macOS it maps to the equivalent tab element for VoiceOver, which
reads the same parts. Icons set `accessible={false}` so they add nothing to the
announcement, and the hidden width-reservation copy of the label is removed from
the accessibility tree, so the label is announced exactly once.

## Accessibility actions

Framework Base resolves the component-owned select to `select` on Windows
Fabric, `Select` on Win32, and the existing `Select` custom action on macOS.
Use the same resolved name for the declaration and event comparison. Caller
spellings of the owned action are normalized and duplicate names are removed,
preserving order, the first supplied label, and other custom names.

An enabled action requests selection from TabList and then forwards the
original `onAccessibilityAction` event exactly once. Standalone tabs do not
mutate selection; a custom group handles this native callback itself.
Disabled tabs (including a disabled TabList) do not request selection, but the
caller still receives the event. Custom actions are likewise forwarded without
selecting. No accessibility action synthesizes `onPress`, and `activate` is
not an additional selection path.

The [shared action foundation](../../../../../../framework-base/src/accessibility/AGENTS.md)
records RNW 0.81.35, Win32 0.81.8, and RNmacOS 0.81.9 source evidence.
macOS Fabric custom actions emit the exact declared names and ignore display
labels; default AXPress support is not established by that path. Native
qualification must invoke UIA SelectionItem.Select or the AX custom action and
assert selection plus callback counts, not just read selection after a click.

## Naming

In the default layout the visible text is the accessible name. Keep it short and
make it name the panel's content, since the tab and its panel are announced
together.

Icon-only tabs have no text, so `accessibilityLabel` is required by the type
shape and the compiler rejects an icon-only tab without one. Development builds
additionally warn once when an icon-only tab reaches runtime with no name and no
labelled-by reference. Name the panel, not the glyph: "Activity", not "Bell".

## Panel wiring

`controls` must match the identifier of the element that renders the panel, and
the panel must exist while the tab is rendered. Point every tab at its own panel
identifier; reusing one identifier across tabs breaks the relationship for all
of them.

The panel itself is entirely the caller's responsibility. TabList supplies the
grouping semantics and its accessible name; it does not render or hide panels.

## Focus and keyboard

A standalone Tab is focusable while enabled and is removed from the tab order
while disabled. Inside TabList, exactly one enabled Tab is focusable and each
Tab receives its one-based position and the total set size. Disabled Tabs remain
in the accessibility tree and report their disabled state while roving
navigation skips them.

TabList owns arrow, Home, and End movement and the selection-follows-focus
policy. It overrides grouped selection and focusability while preserving the
Tab's name, controlled-panel relationship, and consumer handlers.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.

## Contrast and state

Selection is carried by a filled heavy background with the on-heavy foreground
and a heavier label weight, not by color alone at the same fill. The disabled
state keeps the same structure and shifts both layers to the disabled tokens, so
a disabled selected tab still reads as selected.

The icon takes the same resolved foreground as the label at every state, so the
two never disagree.
