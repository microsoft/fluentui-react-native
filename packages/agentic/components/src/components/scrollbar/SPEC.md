---
name: scrollbar
platform: react-native (Windows, macOS)
status: implemented
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
| `scrollOwner` | required   | Native ScrollView props for the one viewport this component renders, including its content and scroll callbacks.                |
| `orientation` | `vertical` | Vertical or horizontal; configure the viewport axis and the matching native indicator.                                          |
| `enabled`     | true       | Permit the native indicator when the content overflows. This is not a command to override OS always-show/auto-hide preferences. |

### Slots and ownership

There is no extra painted track, focusable thumb or public thumb ref. The integration uses the owner's native
root/ref; do not insert a wrapper that takes scrolling or accessibility away from it.

### Data and callbacks

Configure the owner declaratively rather than patching an already-mounted instance. `ref` reaches that `ScrollView`;
root `style` applies after `scrollOwner.style`. The owner cannot override the two indicator booleans or the axis.
Content extents, wheel delta conversion and native UIA/AX operations remain the owner's. No `onValueChange`, thumb
renderer or independent percent is exposed.

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

The [requirement evidence](spec/source.json) records the declarative owner and authored checks. Native thumb
drag, keyboard paging, OS visibility preferences and accessible scroll actions remain separate qualification gates.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
