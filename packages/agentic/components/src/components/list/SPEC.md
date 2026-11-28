---
name: list
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# List

## Scope

A flat collection of independent rows with optional selection. A reading list, a navigable list of rows and rows
with independently operable actions do not share the same focus behavior.

## Public contract

| Proposed prop                                            | Default                                | Purpose                                                                                                                                                              |
| -------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items / renderItem`                                     | required / optional presentation       | Stable unique string key and label per entry. `renderItem` can supply supporting text and icon presentation, not an interactive child or a replacement focus target. |
| `navigationMode / selectionMode`                         | `passive` / `none`                     | `passive` or `items`; selection can be none, single or multiple. Selection or an `onAction` upgrades passive navigation to items.                                    |
| `selectedKeys / defaultSelectedKeys / onSelectionChange` | uncontrolled, empty                    | An ordered key set under group ownership. A row never toggles itself independently. Single mode accepts at most one key.                                             |
| `onAction / size / accessibilityLabel`                   | optional / `medium` / supplied context | Primary row activation is distinct from selecting. Small, medium or large is delegated to ListItem.                                                                  |

### Slots and ownership

Structural View/ref and logical rows. Passive rows do not register press handlers. In items mode use actual row
focus targets and ListItem presentation. Composite and virtualized modes are not exposed by the first public
implementation; a decorative trailing slot is not a substitute for an accessible action.

Related contracts used by this design: [ListItem](../list-item/SPEC.md), [Divider](../divider/SPEC.md).

### Data and callbacks

`onAction(key, detail)` is distinct from `onSelectionChange(nextKeys, { key })`. On a selectable primary row,
pointer or Enter first requests the primary action, then selection unless the action's `preventSelection()` is
used. Space on a selectable row requests selection only. An independent inner action must not also request
primary action or selection. This is owner coordination, not a manufactured native press event.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **LST-001:** Keep active focus, selected keys and primary actions separate. Reordering or recycling rows never transfers selection by index.
- **LST-002:** A passive reading list adds no managed row stops. Items mode offers one entry plus Up/Down and Home/End. Composite mode explicitly routes into/out of nested actions without also activating the row.
- **LST-003:** Expose list, row labels, positions and supported selection. Prove nested actions remain independently reachable before admitting composite mode.
- **LST-004:** With partial data, use caller-supplied order and selection information. Resolve a removed focused row to the next eligible row or prior one, not to a recycled view.

## Platform behavior

Do not assume native option/listbox semantics for generic independent rows. Office Win32 admits passive rows;
items mode is gated on child-host and focus behavior (#4344). Virtualization and composite navigation are
capability gates, not implied by accepting an array of items.

## Divergences from Flex

- `native-list-modes` — **accepted.** Keep passive semantics and managed row focus separate; use actual mounted targets rather than virtual browser focus.
- `list-virtual-action-gate` — **deferred.** Require removal, scrolling, recycling and nested-action evidence for the corresponding modes.

## Conformance

Try rows with equal labels and different keys, select then reorder them, unmount the focused row and invoke a
nested action. Verify callback separation and focus after scrolling.

The [requirement evidence](spec/source.json) separates the mounted-list behavior from endpoint checks and deferred
composite/virtualized behavior. The Win32 child-host gate is not closed by this contract review.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
