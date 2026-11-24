---
name: field
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Field

## Scope

Field composes a persistent name, one control or related group, optional instructions, and a validation
message. It does not edit values, decide when validation runs, submit forms, or own a child's boundary
or focus ring. Helper text and feedback can coexist; neither replaces the name.

## Public contract

| Proposed prop                                         | Default              | Meaning                                                                                                                            |
| ----------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `label: string`                                       | required             | Nonblank localized name.                                                                                                           |
| `renderControl: (binding: FieldBinding) => ReactNode` | required             | The caller applies binding data to **one** real control or a named group. No scanning or cloning of descendants.                   |
| `target?: LabelTarget`                                | absent               | [Label's explicit target](../label/SPEC.md) for pointer delegation; a group never forwards a click to its first option.            |
| `size`, `orientation`                                 | `medium`, `vertical` | `small \| medium \| large`; `vertical \| horizontal`. Size applies to the label and supporting text and is offered to the control. |
| `labelProps?: { weight?: 'regular' \| 'strong' }`     | absent               | Configures the label, not the control or an additional Field style axis.                                                           |
| `info?: InfoLabelHelp`                                | absent               | Selects [InfoLabel](../info-label/SPEC.md) in place of Label, using the same binding. Optional help is not a validation message.   |
| `helperText`, `validationMessage`                     | absent               | Optional localized strings. Blank strings produce no visible text or description reference.                                        |
| `status`                                              | `rest`               | Caller-owned `rest \| error \| warning \| success \| disabled`. No internal validation state.                                      |
| `required`                                            | `false`              | Independent of status. Forward to the label marker and to the control's required semantics.                                        |

`FieldBinding` contains `label: string`, `labelID: string`, `descriptionIDs: readonly string[]`,
`size`, and booleans `required`, `disabled`, `invalid`. These are **data**, not props to spread
blindly on a View. The render function uses the target's API: for example, send the name to
Input's editor, and map `invalid` to Input's `error`. The field creates stable, per-instance
native IDs for the label text and the messages; publish description IDs only while the corresponding
text is present. For a group, bind the common name to the group, not over its members' names.

`ref`, `style` and `tooltip?: string` apply once to the structural `root` View. The remaining anatomy
is the chosen label and the control column; that column contains the rendered control, helper, then
validation row. Horizontal layout places the label at logical start, not permanently on the left.
The validation icon is decorative and shares its row with the wrapping message.

### Requirements

- **FLD-001:** Render the required name and control once, without introducing a tab stop or stealing
  control refs, actions, selection or typing. Isolate IDs across concurrent and nested fields.
- **FLD-002:** A single status drives the binding. Only `error` means invalid. Show a nonblank validation
  message for error, warning or success; hide it at rest or when disabled. A missing error explanation
  is a development diagnostic, not a reason to invent a message or clear `invalid`.
- **FLD-003:** Associate the helper first and the current feedback second with the real control; remove
  stale references on hide/change. Make an updated message discoverable after any live announcement.
  A hint, color or one-time announcement alone does not establish an error relationship.
- **FLD-004:** Field-disabled keeps label and helper readable while disabling the control, any label
  forwarding and the help trigger. It preserves the required marker and suppresses old validation feedback.
- **FLD-005:** Apply the local size/orientation bindings without styling the control. Text wraps, views
  grow with text scaling, and the status is conveyed by text as well as an appropriately colored status icon.
- **FLD-006:** Announce a meaningful feedback change once, without moving focus. Do not announce the
  initial empty state, a rerender of the same message, or every keystroke independently of validation.

## Platform behavior

Use endpoint-verifiable label and description relationships on the accessible control. Accept an identical
name string when label relationships are unavailable, as [Label](../label/SPEC.md) specifies. That exception
does **not** waive a rediscoverable error description, native invalid/required state, or intelligible group
naming. Track unsupported mappings separately per renderer. Routine feedback is polite; the application
owns any separate blocking interruption. Never emit both a native live update and an imperative announcement
for the same change. See [interaction](spec/interaction.md).

## Divergences

- `explicit-control-slot` — **accepted.** The caller binds the right native target; Field does not look up an
  element by proximity, distribute logical children, or pretend the layout wrapper is the editor.
- `field-disabled-readability` — **accepted.** Field's composition-specific treatment governs label/helper
  contrast, while standalone Label/InfoLabel retain their own disabled treatment. Visual readability does
  not enable either action.
- `native-validation-relations` — **deferred.** Validate description ordering, required/invalid projection
  and one-shot speech on each endpoint. Visible text remains available even when a native relation is missing.
- `validation-appearance-motion` — **accepted.** Change content and its associations together without an
  entrance or exit animation in this draft, including when reduced motion is enabled.

## Conformance

Draft only. Exercise the binding in a two-field form and a group with individually named options.
Test status changes, repeated messages and disabled recovery while editing. Verify UIA/Narrator and
AX/VoiceOver results, including after navigating away and back; a Jest tree cannot qualify them.
Implementation, exports and endpoint qualification are not part of this contract change.
