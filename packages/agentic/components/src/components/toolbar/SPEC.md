---
name: toolbar
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Toolbar

## Scope

A compact horizontal set of commands. Toolbar coordinates keyboard entry and movement, not application state;
moving to a toggle must not execute the command or change it.

## Public contract

| Proposed prop        | Default  | Purpose                                                                                                                                     |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`           | required | Button or ToggleButton targets with stable React keys and optional noninteractive Dividers. The strip does not render unsupported children. |
| `size`               | `large`  | small or large; delegate the matching size to participating children. Toolbar does not add a medium override.                               |
| `accessibilityLabel` | required | Name the command group separately from each action. Icon-only commands need their own actual names.                                         |

### Slots and ownership

A non-actionable root View/ref surrounds the command strip. Register actual child focus refs; remember the
active enabled key. Divider contributes spacing/separation, not a navigable node.

Related contracts used by this design: [Button](../button/SPEC.md), [ToggleButton](../toggle-button/SPEC.md), [Divider](../divider/SPEC.md).

### Data and callbacks

Participating controls register their stable key and actual mounted native focus target. Keep the public ref on
the structural strip. The last active key is only an entry preference: after removal or disabling use the first
eligible command without invoking it or modifying checked state.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **TLB-001:** Accept momentary and self-toggling commands without coercing ordinary Button into a toggle or moving selected state into Toolbar.
- **TLB-002:** Tab enters one last-eligible/first enabled command and leaves the group. Logical Left/Right wrap among enabled commands; Home/End select the edge focus target only.
- **TLB-003:** Child removal, disabling and reordering repair focus eligibility by key without activating a replacement. An empty strip adds no entry stop.
- **TLB-004:** Expose a named toolbar or native grouping, each command's action/state and an actual focus change on navigation. A child receives each native activation only once.

## Platform behavior

Use native or confirmed focus-target navigation. Do not reuse menu-specific disabled discoverability or steal
modified shortcuts. Check actual Tab entry on Win32 and AppKit under their respective keyboard policies.

## Divergences from Flex

- `native-toolbar-targets` — **accepted.** Navigate registered native commands, not every descendant with text or a document tab index.

## Conformance

Arrow across both child types, check toggle value is unchanged, activate once, remove the active child and Tab
away in LTR and RTL.

The [requirement evidence](spec/source.json) distinguishes authored focus and activation coverage from outstanding
native re-entry, removal and RTL checks.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
