---
name: scrollbar
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Scrollbar

## Scope

A proposed integration with a native scroll owner, not a second widget superimposed on its moving content.
Position, visibility policy, pointer dragging and accessibility remain coordinated by that owner.

## Public contract

| Proposed prop | Default    | Purpose                                                                                                                         |
| ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `scrollOwner` | required   | The actual scrollable viewport, not an arbitrary View ref or an independently supplied percent.                                 |
| `orientation` | `vertical` | Vertical or horizontal; configure the matching native indicator where supported.                                                |
| `enabled`     | true       | Permit the native indicator when the content overflows. This is not a command to override OS always-show/auto-hide preferences. |

### Slots and ownership

There is no extra painted track, focusable thumb or public thumb ref. The integration uses the owner's native
root/ref; do not insert a wrapper that takes scrolling or accessibility away from it.

### Data and callbacks

`scrollOwner` denotes one mounted scrollable instance in its own window. An integration can request that the
owner show its horizontal or vertical indicator; content extents, wheel delta conversion and native UIA/AX
scroll operations remain the owner's. No `onValueChange`, thumb renderer or independent percent is exposed.

### Requirements

- **SCB-001:** Require an actual scroll owner and reject independent thumb position/value setters.
- **SCB-002:** The host computes overflow and position from the current viewport/content, including resize, dynamic content and direction changes.
- **SCB-003:** Wheel, trackpad, keyboard and drag remain native. Never intercept scrolling just to update a React visual.
- **SCB-004:** Keep the platform's native scroll accessibility and preference behavior; no redundant adjustable progress or invisible second scroller.

## Platform behavior

An AppKit scroller or Windows scroll provider can legitimately use different thickness and idle behavior. Check
the user's OS scrollbar setting and actual host; if no controllable indicator is available, do not promise a
styled draggable one.

## Divergences from Flex

- `host-owned-indicator` — **accepted.** Prioritize OS scroll behavior and preferences over exact thin-thumb dimensions, fade timing and token styling.
- `custom-scroll-drag` — **deferred.** A future custom thumb requires a single real scroll-source/drag contract, not sampled offset and a look-alike.

## Conformance

Compare an overflowing and a fitting pane, switch OS visibility preferences, drag, wheel and page with the
keyboard, then inspect native scroll position and focus.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
