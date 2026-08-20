---
component: Textarea
platform: react-native (Windows, macOS)
---

# Textarea Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus to and from the textarea.
- **Typing** — enters text when focused. All printable characters are accepted. Text wraps automatically within the textarea width.
- **Enter** — inserts a newline within the textarea. Unlike Input, Enter does not submit a form — the textarea captures it as content.
- **Escape** — implementation-dependent; may blur focus depending on context. Does not clear the field.
- **Ctrl+A / Cmd+A** — selects all text within the textarea.

## Focus management

Focus is the clicked-in editing state in the component model. On web, Focus maps to DOM focus (`:focus` / `:focus-visible`) on the native `<textarea>` element.

Textarea does **not** use the standard dual-outline focus ring described in `flex-system:styling` — instead, the boundary stroke itself serves as the indicator. In Focus state, the stroke swaps to `--gnrc-color-stroke-neutral-heavy`.

Hover and Pressed are resolved state values, not base states of their own — they ride on top of whichever base is active. When the textarea is focused and hovered, the inline Focus hover value from `tokens.yaml` shifts the Focus stroke, not the Rest stroke. In CSS, write `:focus-visible` before `:hover` and `:active` so the hover/pressed value wins via cascade order.

## Resize behavior

The Resize variant maps directly to the CSS `resize` property:

| Resize value | CSS                | Behavior                                          |
| ------------ | ------------------ | ------------------------------------------------- |
| None         | `resize: none`     | Fixed dimensions; no drag handle                  |
| Vertical     | `resize: vertical` | Vertical drag handle; horizontal dimension locked |
| Both         | `resize: both`     | Full drag handle; resizable in both axes          |

The resize handle is platform-native. It appears at the bottom-right corner of the textarea on supported platforms. The handle should respect the border radius — it sits inside the stroked boundary.

**Do not render a custom resize-handle graphic.** The handle shown in the Figma component is a design-only asset that communicates resizability; in code, rely entirely on the platform/OS-native handle produced by the CSS `resize` property. The Figma "Resize Handle" boolean does not map to a DOM element — native handle visibility follows the `resize` value (hidden when `resize: none`).

## Animation

State transitions (Rest → Hover, Rest → Focus) are platform-driven color transitions on the stroke. Duration and easing reference motion tokens once defined; until then, keep transitions short (≤150ms) with standard ease-in-out so the focus-state shift does not lag behind caret appearance.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant. No scale, translate, or opacity animation is used on Textarea.
