---
name: textarea
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Textarea

## Scope

A multiline native text editor for unstructured text. Field may provide a persistent label, instructions and
error. Textarea must not change the existing single-line Input into a multiline control.

## Public contract

| Proposed prop                         | Default                      | Purpose                                                                                                              |
| ------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `value / defaultValue / onChangeText` | uncontrolled, empty          | One string including line breaks. Controlled edits request the next string; prop updates do not echo callbacks.      |
| `size / placeholder`                  | `medium` / absent            | small, medium or large with a size-specific minimum height; a placeholder is neither content nor an accessible name. |
| `readOnly / disabled / error`         | all false                    | Read-only supports selection and copy. Disabled blocks editing and user callbacks; error does not disable editing.   |
| `textInput / style`                   | native editor props / absent | Address the multiline editor via its slot/ref and size the enclosing view through layout. No resize-handle prop.     |

### Slots and ownership

A structural View ref surrounds one multiline TextInput. Keep scrolling, selection, undo, caret and composition
in the editor. Lift naming and required/invalid semantics to that element, not the root. Field owns validation
text.

Related contracts used by this design: [Input](../input/SPEC.md), [Field](../field/SPEC.md).

### Data and callbacks

`onChangeText(next: string)` reports accepted native text edits, not selection-only movement, layout changes or
controlled prop updates. The `textInput` slot is the editable target for Field; connect `FieldBinding` there. Do
not silently catch pasted tabs, transform newline sequences into submits, or disable selection to implement
read-only.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **TXA-001:** Expose string control in either direction and a real editor ref without changing the identity of the root or adding a second focus stop.
- **TXA-002:** Return inserts a newline; native editing shortcuts and IME confirmation keep their meaning. Do not interpret either as form submission.
- **TXA-003:** Read-only preserves readable/selectable content; disabled suppresses changes. Changing error or size must not reset the selection.
- **TXA-004:** Report multiline edit role, name, value and supported state on the editor. Do not infer multiline read-only parity from the repository's single-line fixes.

## Platform behavior

Let the host layout constrain the field and scroll its contents. Verify multiline selection/copy, line wrapping
and actual read-only/disabled projection independently on Windows Fabric, Win32 and both macOS renderers.

## Divergences from Flex

- `host-sized-multiline` — **accepted.** Do not emulate a CSS drag handle or promise width/height resizing gestures; the layout owner can resize around the editor.

## Conformance

Type two paragraphs with an IME, paste a multiline string, then switch to read-only, copy, resize and disable.
Verify value and selection behavior, not just rendered text.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
