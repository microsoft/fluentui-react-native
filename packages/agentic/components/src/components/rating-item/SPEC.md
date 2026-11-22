---
name: rating-item
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# RatingItem

## Scope

One decorative unit of a rating. It describes star rendering for an editable or read-only parent; it is not a
tiny selectable button.

## Public contract

| Proposed prop        | Default        | Purpose                                                                                          |
| -------------------- | -------------- | ------------------------------------------------------------------------------------------------ |
| `fill`               | `empty`        | empty, half or full, derived by its parent from the current presentation value.                  |
| `size`               | `medium`       | small, medium or large. The icon measure changes; it is not a separate keyboard or touch target. |
| `disabled / preview` | false / absent | Parent-supplied visual inputs only. A preview never changes committed value.                     |

### Slots and ownership

A private noninteractive View encloses aligned outline and fill artwork. The clipping boundary begins at logical
start; the glyph itself is not flipped. The ref, if composed, denotes the visual root only.

### Data and callbacks

Only `fill: 'empty' | 'half' | 'full'` and parent-supplied presentation affect the glyph. Keep the filled and
outline shapes registered to the same frame. This is a documented internal part, not a free-standing control
users must import.

### Requirements

- **RTI-001:** Keep the unit parent-bound and omit action, value and navigation callbacks.
- **RTI-002:** Render empty, half and full with the same frame; a half in RTL fills from the right without moving the outline.
- **RTI-003:** Restore committed fill when the parent clears a preview; changing the artwork cannot set a rating.
- **RTI-004:** Hide the unit and both artwork layers from assistive navigation and hit testing.

## Platform behavior

Native clipping and fractional geometry must preserve a recognisable half star at nonintegral display scale. The
editable parent's input target, not the clipped glyph, supplies the accessible value.

## Divergences from Flex

- `parent-only-rating-semantics` — **accepted.** The parent's single adjustment target governs; the shared visual unit has no independent activation or role.

## Conformance

Inspect half fill in both directions and verify a native accessibility traversal cannot focus, invoke or adjust
any individual star.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
