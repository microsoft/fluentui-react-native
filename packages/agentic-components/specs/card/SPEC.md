---
name: card
platform: react-native (Windows, macOS)
description: Molecular surface container that groups related content and actions into a single, bounded unit. Covers the translucent surface boundary, Size / Padding / Layout / Direction variant axes, the Header / Content / Footer slot model, and how an optional clickable mode is layered on.
argument-hint: "[variant axis or slot question, e.g. 'Nested vs Structured layout' or 'Padding=None tokens']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | molecular |
| Component | Card |

This spec covers the Card component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is treating Card as a decorative box: Card is a *grouping boundary* for related content and actions, not a wrapper applied for visual weight. The second is making the whole surface clickable while also placing interactive controls inside it — a card is interactive only when it has a single primary navigation target, and nested controls must remain independently operable.

---

# Card

## Spec

### Dependencies

Card is molecular: it provides the surface and slot structure, and composes other components inside its slots. It does not bake in a fixed content schema.

- **Avatar** (`flex-components:avatar`) — consumed inside the Header slot to represent a person or entity (e.g. alongside a title or identity metadata).
- **Button** (`flex-components:button`) — consumed inside the Header and Footer slots. Prefer **icon-only or overflow** Buttons in the Header so it stays compact and the title keeps hierarchy; the Footer can carry full-label Buttons for primary/secondary actions. Card delegates all button tokens and interaction to `flex-components:button`.

> Arranging cards in a horizontally-scrolling **carousel** is a layout pattern — see `usage.md` → Layout for carousel guidance (paging controls, item sizing, reflow). This spec covers Card and its Header / Content / Footer slots only.

---

### Anatomy

1. **Surface** — the root container and the card's only structural boundary. Owns the translucent surface fill, thin neutral stroke, border radius, and `overflow: clip` so nested media and the Content block are masked to the corner radius. Content is inset from the boundary by default and can run edge-to-edge when padding is removed (see Padding). Height is content-driven — the surface grows to fit its slots, with no fixed height — and width is capped at a max so cards do not stretch arbitrarily wide.
2. **Header slot** — present in **Structured** layout. Holds card identity and metadata — a title, supporting metadata (authors, avatars, timestamps, counts), and optional compact actions. Aligned to the top of the card.
3. **Content 01 slot** — the primary body/media region. Present in every layout; in **Default** it sits directly on the surface.
4. **Content 02 slot** — a second content region added in **Nested** layout, rendered as a nested rounded block with its own translucent fill and inner radius, inset from the surface.
5. **Footer slot** — present in **Structured** layout. Holds secondary actions, supplementary metadata, or other contextual controls. Aligned to the bottom of the card.

Which slots are populated is driven by Layout:

| Layout | Header | Content 01 | Content 02 | Footer |
|--------|--------|-----------|-----------|--------|
| **Default** | — | ✓ | — | — |
| **Nested** | — | ✓ | ✓ (nested block) | — |
| **Structured** | ✓ | ✓ | optional | ✓ |

> **Boundary, not elevation:** At rest the card is defined by a translucent surface fill + thin stroke, not a drop shadow. The stroke is what carries the grouping boundary and must meet non-text contrast (see `accessibility.md`). An interactive card *may* gain a shadow on hover/press to reinforce the click affordance; a static card never lifts.

---

### Variants

Variant properties are ordered in the design tool: **Size → Padding → Layout → Direction**.

#### Size

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Small** | Compact surface with a tighter corner radius. | Dense grids, sidebars, and feeds where many cards share the viewport. |
| **Large** | Full surface (up to the max width) with the largest corner radius. | Primary content surfaces, hero cards, and detail-level groupings. |

**Why Size drives corner radius:** Larger surfaces carry a larger radius so the corner reads proportionally to the surface; the Small footprint steps the radius down so corners do not dominate the smaller area. See `tokens.yaml` → `radius`.

#### Padding

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Default** | Content sits inset from the card edge on all sides. | Text-led cards, and any card whose content should sit inside the edge. |
| **None** | Content runs all the way to the card edge (the corners still clip it). | Full-bleed media cards where an image or preview should meet the edge. |

**Why padding is its own axis:** The card keeps its rounded, clipped edge whether or not there's padding. Removing padding just lets media reach that edge — so there's no need for a separate "bleed" card. The gap between Header, Content, and Footer stays the same either way.

#### Layout

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Default** | A single Content region sits directly on the surface. No nested block, no enforced Header/Footer. | The simplest grouping — one block of content inside a bounded surface. |
| **Nested** | Adds a second content region (Content 02) as a rounded block set inside the card, with its own fill. Its corners follow the card's corners, stepping with Size. See `tokens.yaml` → `radius`. | When a piece of media needs to look like its own tile sitting *on* the card — for example a file preview or thumbnail, an embedded chart or map, or a linked object you want to feel separate from the rest of the card. |
| **Structured** | Promotes the Header and Footer slots: content is organized into stacked Header → Content → Footer. | Rich cards with a titled header, a body/media region, and an actions footer. |

**Why three layouts instead of always-on slots:** Most cards are a single content block (Default). Nested adds an inner container only when the content needs to read as a distinct object on the surface. Structured promotes the Header/Footer slots to first-class regions only when the card genuinely has header and footer content — avoiding empty slots and their gaps on simpler cards.

#### Direction

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Vertical** | Slots / content stack top-to-bottom. | Default reading order; portrait media; feed and grid cards. |
| **Horizontal** | Media and content sit side-by-side. | List-style rows and cards where a thumbnail leads a block of text. |

Note the reflow consequence: a Horizontal card must collapse to a single column at narrow viewports — see `accessibility.md` → Reflow.

#### State

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Rest** | The default resting surface. | Always — and the **only** state a static (non-interactive) card uses. |
| **Hover** | Pointer-over feedback hook for interactive cards. | Interactive cards only; no component-owned hover color token is authored in `tokens.yaml`. |
| **Pressed** | Active/press feedback hook for interactive cards. | Interactive cards only; no component-owned pressed color token is authored in `tokens.yaml`. |
| **Selected** | Persistent "chosen" state for a card within a set. | Selectable cards (e.g. pick-one or multi-select grids). Soft neutral fill + soft neutral stroke. |
| **Disabled** | The whole card unit is unavailable. | Rare — disable a single action instead when only that action is unavailable. |

See `tokens.yaml` → `tokens.background` / `tokens.stroke` for the per-state assignments and `interaction.md` for behavior.
