---
name: compound-button
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# CompoundButton

## Scope

One command with a primary label and a supporting line. The second line explains the same command; it cannot
contain a second command or become a focus stop.

## Public contract

| Proposed prop                | Default                 | Purpose                                                                                        |
| ---------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `content / secondaryContent` | required strings        | Use a short command and a description. If no supporting line is needed, use Button.            |
| `appearance / size`          | `secondary` / `medium`  | primary, secondary, outline or subtle; small, medium or large. Color hierarchy follows Button. |
| `image / disabled / onPress` | absent / false / absent | Optional decorative leading media; disabled and activation obey the ordinary Button contract.  |

### Slots and ownership

One native Pressable ref contains optional image and a vertical text stack. Both text lines can wrap within the
width constraint. The description does not replace the command's name or change press timing.

Related contracts used by this design: [Button](../button/SPEC.md).

### Data and callbacks

`onPress` receives Button's native press event. Caller-supplied text styles may affect the two lines
independently; neither line accepts a competing activation handler. Reserve room for an image only when
supplied, and never use a fixed two-line height to clip translated or scaled text.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **CPB-001:** Expose one activation surface; support the four Button appearances, three metrics and one optional leading image.
- **CPB-002:** Increase minimum height for the two-line stack, not a fixed height; allow larger text or translations to expand the button.
- **CPB-003:** One accepted pointer, keyboard or assistive activation invokes the one command. Disabling or cancelling blocks it.
- **CPB-004:** Convey command and supporting context in reading order once. Explicit caller naming must not yield a duplicate description element.

## Platform behavior

Keep Button's modality and platform activation phase; do not add a second key listener on the text stack. Check
accessible name and description on both desktop accessibility APIs rather than assuming text concatenation.

## Divergences from Flex

- `single-compound-action` — **accepted.** Use a single native Button interaction owner with subordinate content rather than separate accessible text buttons.

## Conformance

Compare activation on the image versus each line, then enlarge text and check the accessible command and its
description on both Windows and macOS.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
