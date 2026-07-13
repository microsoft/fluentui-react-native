---
name: textarea
platform: react-native (Windows, macOS)
description: Atomic multi-line text entry control for longer free-form content. Covers resize behavior (None, Vertical, Both), and seven states including Focus, Error, and Read only.
argument-hint: "[variant axis or behavior question, e.g. 'Resize variants' or 'Focus state stroke']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Textarea |

This spec covers the Textarea component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. Textarea is a bare multi-line text entry surface — it does not own labels, helper text, validation messages, or character counts. Wrap Textarea in a Field component when those are needed. The most common misuse is using Input for content that may span multiple lines; if the expected input could exceed one line, use Textarea instead.

---

# Textarea

## Spec

### Anatomy

1. **Root** — outer container; owns border radius and overflow clipping.
2. **Contents** — inner container; owns background fill, the full border stroke, and overflow clipping.
3. **.Text** — multi-line text area; owns vertical and horizontal padding, text wrapping, and scroll behavior. Displays placeholder text (tertiary foreground) when empty and value text (primary foreground) when populated.
4. **Resize Handle** — **design-only affordance.** In Figma it is a 12×12px glyph at the bottom-right corner of Contents (`--gnrc-color-stroke-neutral-soft`, inset ~2px / `--gnrc-spacing-component-base-50`) that communicates the textarea is resizable. **It is not rendered as an element in code.** The real affordance is the platform/OS-native resize handle produced by the CSS `resize` property; implementations must not draw a custom handle graphic. The Figma BOOLEAN is shown by default to mirror the default Vertical resize behavior — it maps to native handle visibility (present when `resize` is not `none`), not to a DOM node.

| Slot | Required | Default |
|------|----------|---------|
| .Text | Yes | Empty (placeholder visible) |
| Resize Handle | No (Figma-only; native in code) | Visible |

---

### Variants

Variant properties are ordered in the design tool: **Size → State**.

> Resize is a code-only property (no visual difference between values) and is excluded from the Figma component set. See tokens.yaml for details.

#### Resize

| Value | Description | When to Use |
|-------|-------------|-------------|
| **None** | Fixed dimensions; no user resizing | When the available space is constrained or consistent height is required by layout |
| **Vertical (Default)** | User can drag to resize vertically only | Default — allows the user to expand for longer content without breaking horizontal layout |
| **Both** | User can drag to resize in both axes | Rare; use only when horizontal expansion is meaningful — e.g., code editors or wide-format composition |

**Why Vertical is the default:** Horizontal resizing breaks the parent container's layout in most form contexts. Vertical-only resize lets users expand for longer content while respecting the column width established by the surrounding layout.

#### Size

| Value | When to Use |
|-------|-------------|
| **Small** | Dense surfaces: toolbars, data-table cells, compact forms |
| **Medium (Default)** | General-purpose across all form surfaces |
| **Large** | High-touch surfaces, prominent fields, or contexts requiring larger tap targets |

**Why three sizes share the same color tokens:** Size changes spacing, typography, border radius, and min-height only — not semantic meaning. Using the same background, foreground, and stroke tokens across sizes ensures a Medium Textarea and a Large Textarea carry identical visual weight per their context.

#### State

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Rest** | Default idle appearance | Textarea is interactive but not active |
| **Hover** | Stroke uses the inline hover value from `tokens.yaml` | Cursor is over the textarea |
| **Pressed** | Stroke uses the inline pressed value from `tokens.yaml` | Mousedown on the textarea (transient — immediately transitions to Focus) |
| **Focus** | Heavy stroke on the full border; caret active | Textarea has been clicked or focused and is accepting text entry |
| **Error** | Danger stroke on the full border | Validation has failed — use with Field for error messaging |
| **Disabled** | Disabled stroke and foreground; no interaction | Textarea is unavailable |
| **Read only** | Disabled-weight stroke, primary foreground | Value is visible but not editable |

**Pressed is transient:** Clicking a textarea immediately triggers Focus, so the pressed visual is only visible for the instant between mousedown and entry. Pressed is included so every hover value has a corresponding pressed value.

**Focus state maps to DOM focus.** In implementation, Focus is represented by DOM focus (`:focus` / `:focus-visible`) and keyboard entry behavior.

**Bases vs hover/pressed values.** Rest, Focus, Error, Disabled, and Read only are mutually exclusive *bases* — each defines the active stroke. Hover and Pressed use the active base's inline state value from `tokens.yaml`. Focus is a higher-priority base than Rest, so a focused-and-hovered textarea shifts the Focus stroke (`--gnrc-color-stroke-neutral-heavy`), not the Rest stroke; Pressed composes the same way. Error, Disabled, and Read only suppress hover and pressed entirely.

**Single style:** Textarea uses outline (full border) only. Unlike Input which offers an underline variant for inline contexts, multi-line entry always needs clear containment to distinguish content boundaries.
