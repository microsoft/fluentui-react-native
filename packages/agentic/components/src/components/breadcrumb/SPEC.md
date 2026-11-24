---
name: breadcrumb
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Breadcrumb

## Scope

A location trail of ancestor destinations and one current, nonactionable location. When space is insufficient,
replace only middle destinations with a named overflow action.

## Public contract

| Proposed prop                        | Default                                     | Purpose                                                                                                                       |
| ------------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `items`                              | required ordered trail                      | Stable key and localized label per level; the last item is current. Earlier entries have one URL or app navigation operation. |
| `size / leadingIcon`                 | `medium` / absent                           | small, medium or large. Icons and generated separators are decorative; they never become keyboard stops.                      |
| `accessibilityLabel / overflowLabel` | required localized trail and overflow names | The overflow target keeps its name when the hidden set changes. Keep the full item labels available independent of tooltips.  |

### Slots and ownership

Structural navigation View/ref containing Link targets, current text and decorative separators. An optional
Button anchors the hidden-destinations list. Use native popup placement without turning destination links into
arbitrary commands.

Related contracts used by this design: [Link](../link/SPEC.md), [Button](../button/SPEC.md), [Popover](../popover/SPEC.md), [Menu](../menu/SPEC.md), [Tooltip](../tooltip/SPEC.md).

### Data and callbacks

Each ancestor has a stable key, visible label and one destination owner; the final record has a key and current
label, not a second navigation command. Only collapse when there are middle items. If resizing removes a focused
overflow entry, choose its visible counterpart or a live trigger rather than focusing a detached row.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **BRC-001:** Keep first and current visible when possible; measure the actual container and collapse middle entries in source order. Do not render a trigger for an empty overflow list.
- **BRC-002:** Tab visits visible ancestors and overflow, not current text. Escape from overflow returns to its live opener; accepted navigation may transfer to the destination.
- **BRC-003:** Handle narrow windows, RTL and long localized names without hiding the only route to a collapsed destination. Reconcile overflow after layout changes while open.
- **BRC-004:** Expose one named location trail, identifiable current location and accessible hidden links. A command Menu's role alone is not proof of navigation semantics.

## Platform behavior

Use native Link semantics for destinations and Button semantics for opening. If first/current cannot both fit in
full, preserve access to their complete names rather than adding unreachable offscreen links. Gate cross-window
focus continuation separately.

## Divergences from Flex

- `breadcrumb-link-activation` — **accepted.** Enter/native link activation follows a destination; Space is not synthesized on links even though an overflow Button also accepts Space.
- `overflow-navigation-surface` — **accepted.** Reuse popup placement and keyboard movement, not the command-only public Menu role for navigation links.

## Conformance

Measure with two then five levels, resize while the overflow is open, invoke a hidden destination, and verify
every ancestor remains reachable exactly once.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
