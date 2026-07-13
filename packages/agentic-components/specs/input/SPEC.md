---
name: input
platform: react-native (Windows, macOS)
description: Atomic text entry control for short, free-form data. Covers style (Outline/Underline), three sizes, six states including Focus, Error, and Read only, and optional leading/trailing icon slots.
argument-hint: "[variant axis or token question, e.g. 'Underline Focus underline token' or 'Error state stroke color']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Input |

This spec covers the Input component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. Input is a bare text entry surface — it does not own labels, helper text, or validation messages. Wrap Input in a Field component when those are needed. The most common misuse is building validation UI directly into Input instead of delegating to Field.

---

# Input

## Spec

### Anatomy

1. **Root** — outer container; owns border radius (Outline only) and overflow clipping.
2. **Contents** — inner flex row; owns background fill, the stroke (full border for Outline, bottom edge for Underline), gap between Icon-Text-stack and Icon End, and overflow clipping.
3. **Icon-Text-stack** — flex row containing the optional leading icon and the text area; owns horizontal padding.
4. **Icon Start** — optional leading Fluent Iconography instance. Hidden by default.
5. **.Text** — text input area; owns vertical padding and text overflow behavior. Displays placeholder text (tertiary foreground) when empty and value text (primary foreground) when populated.
6. **Icon End** — optional trailing icon container; holds up to two icon slots side by side. Hidden by default.
7. **Icon End 1** — primary trailing Fluent Iconography instance. Visible when Icon End 1 is true.
8. **Icon End 2** — secondary trailing Fluent Iconography instance. Visible when Icon End 2 is true; nested inside Icon End alongside Icon End 1.
9. **Underline** — bottom-edge indicator (Underline style only). A single stroke on the bottom edge of Contents that swaps tokens per state; on Focus it swaps to heavy weight to carry the focus indication.

| Slot | Required | Default |
|------|----------|---------|
| Icon Start | No | Hidden |
| Icon End 1 | No | Hidden |
| Icon End 2 | No | Hidden; requires Icon End 1 to be visible |

---

### Variants

Variant properties are ordered in the design tool: **Style → Size → State**.

#### Style

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Outline** | Full border on all sides; contained appearance | Default for most form contexts — clear boundary communicates interactivity |
| **Underline** | Bottom-edge indicator only; minimal appearance | Inline or embedded contexts where a full border adds visual noise — e.g., within tables, dense toolbars, or content-adjacent surfaces |

**Why two styles instead of one configurable border:** Outline applies a stroke to all sides of Contents; Underline applies it only to the bottom edge. Same single-stroke model and same per-state token swaps — the surface area is the only thing that differs.

#### Size

| Value | When to Use |
|-------|-------------|
| **Small** | Dense surfaces: toolbars, data-table cells, compact forms |
| **Medium (Default)** | General-purpose across all form surfaces |
| **Large** | High-touch surfaces, prominent search fields, or contexts requiring larger tap targets |

**Why three sizes share the same color tokens:** Size changes spacing, typography, icon size, and border radius only — not semantic meaning. Using the same background, foreground, and stroke tokens across sizes ensures a Medium Input and a Large Input carry identical visual weight per their context.

#### State

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Rest** | Default idle appearance | Input is interactive but not active |
| **Hover** | Stroke uses the inline hover value from `tokens.yaml` | Cursor is over the input |
| **Pressed** | Stroke uses the inline pressed value from `tokens.yaml` | Mousedown on the input (transient — immediately transitions to Focus) |
| **Focus** | Heavy stroke (Outline) or heavy underline (Underline); caret active | Input has keyboard focus and is accepting text entry |
| **Error** | Danger stroke on the boundary (full border for Outline, bottom edge for Underline) | Validation has failed — use with Field for error messaging |
| **Disabled** | Disabled stroke and foreground; no interaction | Input is unavailable |
| **Read only** | Disabled-weight stroke, primary foreground | Value is visible but not editable |

**Pressed is transient:** Clicking an input immediately triggers Focus, so the pressed visual is only visible for the instant between mousedown and focus. Unlike Button, Input does not perform an action on click; it enters an editing mode. Pressed is included so every hover value has a corresponding pressed value.

**Bases vs hover/pressed values.** Rest, Focus, Error, Disabled, and Read only are mutually exclusive *bases* — each defines the active stroke. Hover and Pressed use the active base's inline state value from `tokens.yaml`. Focus is a higher-priority base than Rest, so a focused-and-hovered input shifts the Focus stroke (`--gnrc-color-stroke-neutral-heavy`), not the Rest stroke; Pressed composes the same way. Error, Disabled, and Read only suppress hover and pressed entirely.
