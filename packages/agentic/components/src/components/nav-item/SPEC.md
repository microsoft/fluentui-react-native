---
name: nav-item
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# NavItem

## Scope

A parent-bound row representing either a navigation destination or a disclosure category. Being current,
expanded, focused and visually carrying a hidden child's current marker are distinct conditions.

## Public contract

| Proposed prop                                       | Default                            | Purpose                                                                                                                                              |
| --------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value / label`                                     | required                           | Stable item key and visible/localized destination or category name. Rail presentation never discards the accessible name.                            |
| `type / density / nesting`                          | `item` / `comfortable` / top level | item or category, comfortable or compact, top-level or subitem. The parent supplies layout context.                                                  |
| `current / expanded / carriedCurrent`               | false / category only / false      | Caller route controls current; the parent controls expansion. carriedCurrent marks a collapsed ancestor visually without making it the current page. |
| `onNavigate or onExpandedChange / secondaryActions` | according to type / absent         | A destination requests a route, a category requests disclosure. Optional separate actions never trigger either primary operation.                    |

### Slots and ownership

Structural root/ref, one primary link or disclosure target, decorative leading icon or Avatar, label and
optional trailing badge. Category chevron is a cue, not a second disclosure button. Independent actions are
sibling targets.

Related contracts used by this design: [Link](../link/SPEC.md), [Avatar](../avatar/SPEC.md), [Button](../button/SPEC.md), [Tooltip](../tooltip/SPEC.md).

### Data and callbacks

A destination supplies a route key and one navigation operation. A category instead accepts `expanded` and
`onExpandedChange(next)`. `carriedCurrent` is only presentation derived by Nav; it is not another selected route
or a second current-page accessibility value.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **NVI-001:** Require a destination or category contract, not both. Distinguish the row key from the currently routed location.
- **NVI-002:** The primary target is its own sequential stop. Enter invokes a destination; the category uses button activation. Never navigate merely because focus changed.
- **NVI-003:** Display a carried indicator for a collapsed category when its descendant is current, without reporting two current destinations.
- **NVI-004:** Expose link versus disclosure semantics and true expansion. An icon-only row still has a real accessible name; tooltip text is supplemental.

## Platform behavior

Link supplies destination activation rather than generic button Space handling. Verify native current-item
projection separately from selected color and ensure a secondary Button does not get merged into the primary
target.

## Divergences from Flex

- `current-is-not-selection` — **accepted.** Use route-owned current state. A carried marker is not an additional current-page announcement or a selected widget.

## Conformance

Collapse a category containing the current child, inspect announcement and current markers, then activate its
secondary action with no change of route or expansion.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
