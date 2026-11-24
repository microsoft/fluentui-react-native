---
name: destructive-button
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# DestructiveButton

## Scope

A discrete, high-consequence command using danger presentation. It is its own component, not a new appearance on
Button, and it neither decides whether confirmation is needed nor executes an irreversible operation by itself.

## Public contract

| Proposed prop                          | Default                        | Purpose                                                                                                                             |
| -------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `appearance / size`                    | `subtle` / `medium`            | Only subtle and primary danger treatments; small, medium or large. Use primary deliberately for the emphasized destructive command. |
| `content / leadingIcon / trailingIcon` | content or named icon required | Icon-only requires a specific action name. Trailing decoration is permitted with text.                                              |
| `shape / disabled / onPress`           | `rounded` / false / absent     | rounded or circular; reuse native Button activation and disable behavior.                                                           |

### Slots and ownership

A single Pressable owns the ref, name and target. Optional icons are decorative; use the Button metrics and
focus treatment, not a danger-colored focus ring. Any confirmation surface is outside this subtree.

Related contracts used by this design: [Button](../button/SPEC.md).

### Data and callbacks

The API does not accept `selected`, `defaultSelected` or a toggle action. The secondary/subtle distinction is
significant: the permitted lower-emphasis danger treatment is **subtle**, not Button's ordinary secondary
appearance. A confirm dialog receives its own safe focus target independently of the initiating control.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **DSB-001:** Reject outline and secondary danger appearances; do not add a destructive mode to ordinary Button.
- **DSB-002:** Apply danger foreground/fill only when available; disabled presentation uses the neutral disabled family. Preserve a visible native or custom focus ring.
- **DSB-003:** Pressing the button sends one command request. No implicit confirmation, scheduling or delayed second press is part of the control.
- **DSB-004:** Expose a named button, never a fabricated danger role. The label must communicate the consequence without depending on red.

## Platform behavior

Desktop Button is the platform reference. Mobile danger-button source is informative only; mobile interaction or
styling is not an additional desktop requirement. If confirmation is shown, its owner manages entry and return
focus.

## Divergences from Flex

- `distinct-danger-api` — **accepted.** Reuse Button behavior behind a constrained public control rather than allowing invalid appearance combinations on Button.

## Conformance

Verify enabled, disabled and icon-only cases, one callback, label clarity without color, and focus return
managed by a caller-owned confirmation.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
