---
name: tree-item
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# TreeItem

## Scope

A parent-bound branch or leaf row. Disclosure, selection, primary activation and an optional quick action
describe different actions; they must not collapse into one generic press.

## Public contract

| Proposed prop                | Default                          | Purpose                                                                                                                                    |
| ---------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `value / label`              | required                         | Stable node key and localized primary text. Extra description, icon or avatar must not replace its name.                                   |
| `kind / level / state`       | provided by Tree                 | A branch has expanded state, a leaf does not. Tree supplies selection or mixed state, sibling position/count and active focus eligibility. |
| `layout / appearance / size` | `standard` / `subtle` / `medium` | standard, avatar or checkbox layout; subtle, subtleAlpha or transparent; small or medium. The parent coordinates these across rows.        |
| `quickAction / disabled`     | absent / false                   | Optional separately named Button. Disabled blocks all row and quick operations even if the owner keeps the node discoverable.              |

### Slots and ownership

Structural View/ref, primary native row target, disclosure cue for branches, optional decorative selection
marker, leading/description/badge and independent quick-action Button. The child region is scoped to this branch
and disappears from traversal on collapse.

Related contracts used by this design: [Checkbox](../checkbox/SPEC.md), [Avatar](../avatar/SPEC.md), [Badge](../badge/SPEC.md), [Button](../button/SPEC.md).

### Data and callbacks

The parent supplies `{ key, level, position, setSize, expanded?, selected?, checked? }`; absence of `expanded`
identifies a leaf. Multi-selection can expose `checked: 'mixed'`; single uses selection, not an additional
checkbox. Action authors receive the stable node key, not an index into the visible rows.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **TRI-001:** Require parent-provided hierarchy state and a stable value. Never expose expand/collapse on a leaf or add a separately writable decorative Checkbox.
- **TRI-002:** Route branch disclosure, Space selection, leaf activation and quick action to their own handlers. The quick action must not bubble into a row operation.
- **TRI-003:** Indent from logical start by level, preserve badge visibility when a quick action appears, and keep that action visible while it holds keyboard focus.
- **TRI-004:** Expose level, sibling position, expansion and the correct selection model on the primary target. Independently name the quick action and verify mixed state where applicable.

## Platform behavior

A row looking indented in RN does not establish a UIA TreeItem or AX outline relationship. Gate native hierarchy
and independent quick-action support; do not replace tree semantics with a collection of unrelated buttons.

## Divergences from Flex

- `tree-row-native-ownership` — **accepted.** The parent is the selection/disclosure authority. The checkbox artwork and chevron must not double the row's accessible actions.

## Conformance

Invoke each operation separately on branch and leaf, render a mixed parent, and remove a focused quick action.
Inspect actual native actions, roles and successor focus.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
