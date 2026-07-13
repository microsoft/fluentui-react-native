---
name: message-bar
platform: react-native (Windows, macOS)
description: Composite status banner that communicates page-level or section-level feedback across four semantic statuses (Information, Warning, Error, Success). Covers the status-driven color palette, icon slot conventions, optional action buttons, and the dismiss control.
argument-hint: "[status or slot question, e.g. 'Error palette tokens' or 'when to show action buttons']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | composed |
| Component | MessageBar |

This spec covers the MessageBar component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (dismissal, actions, overflow, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is using MessageBar for persistent instructional copy — MessageBar is for transient feedback, not embedded help text. Each status maps to a distinct semantic palette; never apply Warning tokens to an Error context or vice versa.

---

# MessageBar

## Spec

### Dependencies

- **Button** (`flex-components:button`) — Small Subtle Button for action buttons; Small Icon only Subtle Button with circular radius for dismiss.

---

### Anatomy

1. **Container** — root auto-layout frame; owns padding, gap, border, surface fill, status background shader, and border radius. Spans full available width.
2. **Status icon container** — shrink-0 wrapper aligned to `items-start` so the icon anchors to the first line when the message wraps.
3. **Status icon** — 20px Fluent Iconography instance determined by Status. Always visible; not swappable by the consumer. See `tokens.yaml` `status-icons` for icon names, style, and foreground colors.
4. **Message text** — flexible text node (`flex: 1 0 0`) filling remaining horizontal space. Single-line with ellipsis truncation at the design level; multiline in code is consumer-controlled.
5. **Actions container** — optional slot holding up to two Small Subtle Button instances. Shrinks to content.
6. **Dismiss button** — optional icon-only Small Subtle Button with circular radius; holds a 16px Dismiss icon.

| Slot | Required | Default |
|------|----------|---------|
| Status icon | Yes | Determined by Status variant |
| Message text | Yes | "Message providing information with actionable insights." |
| Actions | No | Hidden |
| Dismiss button | No | Present |

> **Status icon alignment:** The icon container aligns to text start, not center. This ensures the icon aligns to the first line when the message wraps across multiple lines.

---

### Variants

The only variant axis is **Status**.

#### Status

| Value | Semantic |
|-------|----------|
| **Information** (Default) | Neutral informational context |
| **Warning** | Non-critical issue requiring attention |
| **Error** | Failure or blocking condition |
| **Success** | Successful completion of an action |

**Why Error uses the danger semantic palette, not "error":** The color system names the crimson semantic tier `danger` to cover both errors and destructive actions. MessageBar consumes `danger-subtle` to remain consistent with all other components that use the danger tier.

**Why all four statuses use `-subtle` backgrounds:** MessageBar sits at page/section level and should not dominate the surface. Subtle backgrounds communicate status without overwhelming adjacent content, and they render above `--gnrc-color-surface-neutral-nearer` so the opacity-backed background acts as an intentional shader instead of mixing directly with whatever page or section sits behind the bar. High-emphasis fills are reserved for small-area focused controls.
