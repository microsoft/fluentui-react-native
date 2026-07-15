---
name: accordion
platform: react-native (Windows, macOS)
description: Atomic collapsible panel with an interactive header and a free body content slot. Covers chevron layout (start/end), expand/collapse state, optional leading icon, focus ring behavior, and body content slot conventions.
argument-hint: "[variant axis or behavior question, e.g. 'chevron end layout' or 'focus ring tokens']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value     |
| --------- | --------- |
| Type      | atomic    |
| Component | Accordion |

This spec covers the Accordion component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most important principle: the body slot is a free content area — never put information required for the current task inside an accordion. The Expanded axis is a variant property (not a State), and Focused is a boolean component prop — do not conflate these with the State axis.

---

# Accordion

## Spec

### Anatomy

1. **Container** — root auto-layout wrapper; owns the full component width.
2. **Header** — interactive row; owns padding, gap, border radius, and the focus ring. The only interactive surface on the component.
3. **Chevron** — 16px Fluent Iconography instance. ChevronRight at rest (Expanded=False), rotates to ChevronDown when Expanded=True. Position determined by Layout variant: at the leading edge in Chevron start, pushed to the far trailing edge in Chevron end.
4. **Leading icon** — optional 16px Fluent Iconography instance before the title. Shown by default.
5. **Title** — section label text; always Semibold (`body-small-strong`). Fills remaining header width in Chevron start layout; natural width in Chevron end layout.
6. **Body** — content panel visible only when Expanded=True. Accepts any child component via the `Body content` slot.
7. **Content placeholder** — default body content shown when no child is provided. Swap with your component.

| Slot         | Required | Default             |
| ------------ | -------- | ------------------- |
| Title        | Yes      | "Section title"     |
| Leading icon | No       | Shown               |
| Body content | No       | Content placeholder |

---

### Variants

Variant properties are ordered in the design tool: **Layout → Size → State → Expanded**.

#### Layout

| Value             | When to Use                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chevron start** | Default. Anchors the expand affordance to the leading edge; title fills remaining width.                                                            |
| **Chevron end**   | When the leading icon is the primary anchor; chevron is pushed to the far end of the header (opposite edge from the title). Title at natural width. |

#### Expanded

| Value     | Visual                                           |
| --------- | ------------------------------------------------ |
| **False** | Body hidden; chevron points right (ChevronRight) |
| **True**  | Body visible; chevron points down (ChevronDown)  |

**Expanded is a variant axis, not a State.** It runs in parallel with State — a Rest+Expanded=True accordion is valid.
