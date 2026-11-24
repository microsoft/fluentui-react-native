---
name: radio-group
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# RadioGroup

## Scope

A named group of mutually exclusive options. The group owns the selection; a Radio renders the value it is
given. A group label never selects the first option when clicked.

## Public contract

| Proposed prop                          | Default                        | Purpose                                                                                                                                   |
| -------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                              | required                       | Ordered, unique keys with localized labels and optional disabled state. Render Radio targets, not a pressable group of nested pressables. |
| `value / defaultValue / onValueChange` | uncontrolled, no selection     | One key or null. A controlled group requests a new value once and renders what the caller supplies.                                       |
| `orientation / required / disabled`    | `vertical` / false / false     | Vertical or horizontal layout. Required means a choice is necessary, not that the first Radio is selected automatically.                  |
| `label or accessibilityLabel`          | meaningful group name required | A Field may bind its visible label to the group. Never overwrite individual option names.                                                 |

### Slots and ownership

Structural root/ref with optional visible legend and an options region. Each child exposes one actual Radio and
its checked state. Maintain a live entry target without adding a focusable legend or group wrapper.

Related contracts used by this design: [Radio](../radio/SPEC.md), [Label](../label/SPEC.md), [Field](../field/SPEC.md).

### Data and callbacks

Each entry supplies `{ value: string; label: string; disabled?: boolean }`. `onValueChange(value)` is a
selection request, not a synthetic Radio press. A group with no enabled choices does not use its legend as a
substitute keyboard stop. The owner may supply selected-but-disabled state without permitting new activation
there.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **RDG-001:** Enforce mutual exclusion by stable key; group disable blocks all changes. Removing the selected option does not fabricate a user selection callback.
- **RDG-002:** Tab enters at the selected enabled option or first enabled one. All four arrows wrap through enabled members
  and request the newly reached value once, independently of layout; Tab then leaves.
- **RDG-003:** Expose a named radio group, individually named radios and a coherent checked state. Actuating native Select and pointer activation use the same selection owner.
- **RDG-004:** Lay out options along the requested axis, keeping legend and options separate and individual Radio styling delegated.

## Platform behavior

V1 Win32 supplies the behavioral baseline for both Windows endpoints. Confirm native selection/focus sequencing
after the state commits. AppKit keyboard access preferences are not grounds to make all radio options
independent Tab stops.

## Divergences from Flex

- `native-group-binding` — **accepted.** Use an explicit group binding and real Radio targets rather than an implicit document-wide radio name.

## Conformance

Enter with no selection, move across a disabled option, wrap, remove the focused option, and compare UIA/AX
selection with exactly one change per accepted choice.

The [requirement evidence](spec/source.json) separates the implemented group from native Select, removal and
controlled-rejection qualification on each endpoint.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
