---
name: tree
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Tree

## Scope

A hierarchical collection with parent-owned disclosure, focus and optional single or cascading multiple
selection. Visible rows determine where focus can move; the full logical graph determines hierarchy and mixed
selection.

## Public contract

| Proposed prop                                                            | Default                          | Purpose                                                                                                                                                                                                |
| ------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `items / renderItem`                                                     | required                         | Stable keys and parent/child relationships. Reject cycles and duplicate keys. A partial-data owner must supply aggregate selection and sibling metadata it cannot derive from locally loaded children. |
| `openItems / defaultOpenItems / onOpenChange`                            | uncontrolled, closed             | A set of branch keys. Changing expansion alone does not select, navigate, or activate a leaf.                                                                                                          |
| `selectionMode / selectedKeys / defaultSelectedKeys / onSelectionChange` | `none` / uncontrolled, empty     | none, single or multiple. Single selection is exclusive; multiple supports descendant propagation and mixed ancestors.                                                                                 |
| `size / appearance / layout`                                             | `medium` / `subtle` / `standard` | Forward coordinated small/medium size, row treatment and standard/avatar/checkbox content to TreeItem. Quick actions remain optional and distinct.                                                     |

### Slots and ownership

Named root View/ref and recursive or flattened TreeItem presentations. Maintain an ordered visible-key index
separately from the data graph. One visible primary row is the keyboard entry; a revealed quick action can also
be reached intentionally.

Related contracts used by this design: [TreeItem](../tree-item/SPEC.md), [List](../list/SPEC.md).

### Data and callbacks

`onOpenChange(nextKeys, { key })` and `onSelectionChange(nextKeys, { key })` are separate requests. In multiple
mode callback keys represent selected leaves; a supplied branch key expands to its enabled descendant leaves.
Disabled leaves can remain externally selected but do not change as part of a branch request. IDs
represent nodes across collapse and recycling, not array positions. Derive ancestor state from the complete
graph even if its visible representation is flat; a disabled discoverable node must still refuse disclosure,
selection and primary/quick actions.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **TRE-001:** Selecting/clearing a multiple-selection branch includes collapsed descendants. Recompute ancestor checked/mixed state from complete data or caller-supplied aggregates, never just mounted rows.
- **TRE-002:** Up/Down, Home/End and type-ahead move actual focus among visible nodes. Toward descendants expands or enters; toward parent collapses or moves up. Moving focus alone never changes selection.
- **TRE-003:** Keep pending focus tied to node identity and mount generation. After removal choose a visible successor, predecessor or surviving parent/root, and cancel stale requests.
- **TRE-004:** Expose the actual tree/outline hierarchy, sibling information and valid expansion/selection operations; require evidence before supporting virtualization or independently operable nested actions.

## Platform behavior

FocusZone movement is not native tree semantics. Verify hierarchy, mixed descendants, removal and actual
accessibility actions on both Windows endpoints and AppKit; do not claim large-data support merely because a
list virtualizes.

## Divergences from Flex

- `logical-tree-data` — **accepted.** A complete model or explicit caller aggregates govern selection; rendering order alone cannot resolve unmounted descendants.
- `native-tree-capabilities` — **deferred.** Gate virtualized and quick-action variants on confirmed native hierarchy, focus and input behavior.

## Conformance

Select a collapsed branch, clear one hidden descendant through a model update, expand it, then delete the
focused node. Check mixed ancestors, correct level/position and surviving native focus.

The [source evidence](spec/source.json) captures full mounted-data support; partial/virtualized graphs require
separate capability evidence. Native hierarchy, actions, and quick-action focus remain endpoint gates.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
