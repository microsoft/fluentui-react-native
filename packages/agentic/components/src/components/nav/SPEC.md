---
name: nav
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Nav

## Scope

Hierarchical application navigation with visible destination and disclosure rows. Tab visits every eligible row;
this is neither an arrow-only Tree nor a Menu for running commands.

## Public contract

| Proposed prop                                           | Default                                         | Purpose                                                                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `items / currentValue / onNavigate`                     | required model / caller route / required        | Use stable keys for destinations and categories. Emit a navigation request; the router decides when the destination becomes current.           |
| `expandedKeys / defaultExpandedKeys / onExpandedChange` | uncontrolled, initially empty                   | State of categories only. Hiding and reopening the panel does not erase route or expanded keys.                                                |
| `presentation / density`                                | `inline` / `comfortable`                        | Inline on desktop; overlay uses the AppKit DialogWindow where present. Use available container space; full Nav never becomes an icon rail.     |
| `open / defaultOpen / onOpenChange / openerRef`         | inline visible; overlay closed unless requested | The shell provides a live external reopening target for a hidden panel. Optional header/footer and labelled groups do not become destinations. |

### Slots and ownership

A named navigation View/ref with optional header/footer and a scrollable body of NavItems. The shell can place its
named toggle in the header or supply an external opener. Inline participates in layout; AppKit overlay uses a sheet,
not an authored scrim. Current ancestry comes from the data graph.

Related contracts used by this design: [NavItem](../nav-item/SPEC.md), [Drawer](../drawer/SPEC.md), [Divider](../divider/SPEC.md), [Button](../button/SPEC.md).

### Data and callbacks

Destination records have stable keys and route targets. Category records have distinct keys and ordered
descendants. `onNavigate(key)` requests a route; `onExpandedChange(nextKeys, { key })` changes category
visibility only. Show a carried current marker only while the actual current descendant is hidden.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **NVC-001:** Only the caller commits the current route. Collapsing a current child's category may show a carried marker but never changes that route.
- **NVC-002:** Keep links and disclosures in native Tab order; optional arrow traversal is supplementary. Remove collapsed descendants from navigation and accessibility together.
- **NVC-003:** Before hiding a focused panel resolve an eligible external opener. Gate modal overlay on isolation of background pointer, keyboard and assistive input; inline needs no trap.
- **NVC-004:** Use logical start placement and local measurements. Header/footer remain usable while long destination lists scroll; do not silently replace full Nav with a rail.

## Platform behavior

Native hosts may represent a named navigation region differently, but row roles and current destination must
remain discoverable. Use the Drawer/Dialog modal gate (#4379) rather than cycling focus in a nonmodal popup.

## Divergences from Flex

- `app-owned-routes` — **accepted.** The visible route comes from the application, not focus, pressed state or an internal browser location.
- `modal-nav-overlay` — **deferred.** Withhold overlay mode on hosts without true isolation; inline navigation remains an independent scope.

## Conformance

Navigate from a nested destination, collapse/reopen its category, resize and hide the focused panel. Inspect
current route, visible order, opener restoration and overlay isolation.

The [source evidence](spec/source.json) keeps Windows overlay, native hierarchy/state projection and shell focus
qualification separate from inline source behavior.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
