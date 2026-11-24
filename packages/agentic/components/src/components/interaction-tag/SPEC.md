---
name: interaction-tag
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# InteractionTag

## Scope

A compact identity or category with independent primary and remove actions. The existing Tag has one dismiss
target and cannot model both simply by placing a button inside it.

## Public contract

| Proposed prop                          | Default                                           | Purpose                                                                                              |
| -------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `content / onPress / onDismiss`        | name required / callbacks supplied by owner       | The primary region opens or inspects; the secondary requests removal. The owner removes the tag.     |
| `dismissLabel / accessibilityLabel`    | localized removal name required / visible content | Name the two operations distinctly, including for an icon-only primary region.                       |
| `leadingIcon or avatar / layout`       | optional, exclusive / text                        | Render at most one leading identity visual. An icon-only presentation still requires a primary name. |
| `appearance / size / shape / disabled` | `secondary` / `medium` / `rounded` / false        | primary or secondary, small or medium, rounded or circular. Disabled applies to both regions.        |

### Slots and ownership

Structural View ref; two sibling focusable native regions with a private divider and remove icon between/inside
them. Pressed and focused feedback belongs only to the region being operated. No actionable outer wrapper.

Related contracts used by this design: [Tag](../tag/SPEC.md), [Avatar](../avatar/SPEC.md), [Button](../button/SPEC.md).

### Data and callbacks

`onDismiss(): void` requests removal without a fabricated press event. The owner updates its keyed collection
after accepting the request; an unchanged array means the tag stays. The primary callback receives only
activations of the primary region. An assistive invocation requests the same action without a fabricated gesture event.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **ITG-001:** Keep primary and remove operations independently named; do not nest one target or activation listener inside the other.
- **ITG-002:** A removal request never locally deletes the item or invokes the primary callback; surviving tags retain their keys.
- **ITG-003:** Retain a usable minimum remove target even at small size. Draw the focused region's boundary, not a ring around both.
- **ITG-004:** Provide both actions in reading order, or neither when disabled. The collection supplies a live focus successor when a focused item is removed.

## Platform behavior

Use native Button activation for each region and confirm distinct UIA/AX elements. Hosts that merge actionable
descendants cannot claim two actions based on visual separation.

## Divergences from Flex

- `two-sibling-tag-actions` — **accepted.** Compose separate native targets instead of extending the existing single-target Tag.

## Conformance

Count both callbacks for pointer and keyboard activation on each half; test removal of the final focused tag and
RTL order.

The [requirement evidence](spec/source.json) identifies the implementation and separate native stories. Focus
recovery after removing a tag belongs to the collection.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
