---
name: search-box
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# SearchBox

## Scope

A query editor with a leading search cue and one conditional clear action. It does not filter data, debounce
network requests, expose a suggestion popup, or announce result counts on the application's behalf.

## Public contract

| Proposed prop                         | Default                                   | Purpose                                                                                                     |
| ------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `value / defaultValue / onChangeText` | uncontrolled, empty                       | The query string. An accepted clear requests the empty string exactly once.                                 |
| `onSubmitQuery`                       | absent                                    | If supplied, report the current query on explicit editor submission; otherwise editing alone drives search. |
| `clearLabel / accessibilityLabel`     | required localized action and field names | A visible field label can supply the editor name instead. Placeholder text never substitutes for the name.  |
| `variant / size / disabled`           | `outline` / `medium` / false              | outline or underline; small, medium or large. Disabled blocks both editing and clearing.                    |

### Slots and ownership

Structural View ref; Input chrome and a native editor, a decorative search glyph, and a sibling clear Button
when the query is nonempty. The clear operation must not live in Input's decorative icon slot.

Related contracts used by this design: [Input](../input/SPEC.md), [Button](../button/SPEC.md), [Field](../field/SPEC.md).

### Data and callbacks

`onSubmitQuery(query: string)` is distinct from `onChangeText(query: string)` and from results updates. Clearing
requests one string change, not an additional submission. Provide a translated clear label whenever the
affordance may appear, even when the initial query is empty.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **SRB-001:** Distinguish externally supplied empty text from uncontrolled state. Removing the clear action must not replace the editor.
- **SRB-002:** Clear with the named button or unmodified Escape on a nonempty query; preserve or return real editor focus. Empty Escape remains unhandled.
- **SRB-003:** Keep a usable clear target at every density, even where a web icon frame is smaller than a native Button target.
- **SRB-004:** Expose one named searchable editor and a separately named clear button when present. IME confirmation is never a search submission or clear.

## Platform behavior

Request native search semantics where supported, retaining edit/value semantics on hosts without a distinct
search role. Do not mark every SearchBox as a separate application search landmark.

## Divergences from Flex

- `search-editor-owner` — **accepted.** Use the actual input and an independent button; result announcements and landmark scope belong to the containing screen.

## Conformance

Clear with mouse, keyboard and assistive invocation; assert one change and the actual editor focus. Exercise
empty Escape and composing Return against a containing dialog.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
