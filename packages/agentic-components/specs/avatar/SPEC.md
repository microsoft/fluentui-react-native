---
name: avatar
platform: react-native (Windows, macOS)
description: Atomic identity element representing a person, group, or entity. Covers three mutually exclusive display modes (Image, Icon, Initials), eight numeric sizes (16 / 20 / 24 / 28 / 32 / 40 / 56 / 120 px diameter), and non-interactive state handling.
argument-hint: "[display mode or token question, e.g. 'icon avatar background token' or 'initials accessibility']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Avatar |

This spec covers the Avatar component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. Image, Icon, and Initials are mutually exclusive display modes — never show more than one simultaneously. Avatar is non-interactive; the component carries no focus ring, hover, or pressed states.

---

# Avatar

## Spec

### Anatomy

1. **Container** — circular frame; owns the fixed diameter per size, border radius, and background fill. Avatar has no container stroke — the fill defines the circle across all three content modes.
2. **Image slot** — a user photo or entity image that covers the **entire** container edge-to-edge (full-bleed). The image spans the full diameter and is clipped to the circular radius — the per-size padding (see `tokens.yaml` `spacing`) applies to the Icon and Initials slots only, **never** to Image; an image inset by padding would render as a square that never reaches the circular clip. Active only in the Image display mode.
3. **Icon slot** — centered Fluent Iconography instance representing the entity type. Active only in the Icon display mode.
4. **Initials slot** — centered text node showing 1–2 characters (1 character at size 16). Active only in the Initials display mode. Uses `line-height: 1` override at all sizes for optical centering — see `tokens.yaml` (`typography.initials-line-height-override`) for rationale.
5. **Activity ring** — a brand outline offset from the avatar container, indicating the person is active or collaborating in a shared space. The offset creates a true transparent gap that reveals the surface beneath. Both offset and stroke width scale with avatar size so the ring stays proportional at every diameter. Controlled by a boolean property. Does not affect layout dimensions (rendered as `outline` + `outline-offset`).

| Slot | Required | Default |
|------|----------|---------|
| Image | No — active in Image mode only | — |
| Icon | No — active in Icon mode only | Person icon |
| Initials | No — active in Initials mode only | "AB" |
| Activity ring | No | Hidden |

---

### Variants

Variant properties are ordered in the design tool: **Content → Size → State**.

#### Content

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Image** | Photo or entity image fills the container | When a real user photo or entity brand image is available |
| **Icon** | Fluent Iconography icon centered in a filled container | When no photo is available and entity type can be represented by an icon |
| **Initials** | 1–2 character text centered in a filled container (1 character at size 16) | When no photo is available and entity type is best represented by initials |

**Why three modes share the same component:** Image, Icon, and Initials all resolve to the same circular container with identical sizing, padding, and accessibility surface — they differ only in which inner slot is rendered. A Content variant keeps the three fallback paths consistent so callers can swap between them based on data availability without reflowing layout.

---

#### Size

Size is a numeric scale — the variant value is the container's pixel diameter. Eight sizes are valid: **16, 20, 24, 28, 32, 40, 56, 120**. The numeric scale lets the component grow new stops without naming churn while still capturing the full set of valid sizes the design system supports.

| Value | Diameter | When to Use |
|-------|----------|-------------|
| **16** | 16px | Dense surfaces: inline mentions, compact participant lists, chat bubbles. Initials are constrained to a single character at this size. |
| **20** | 20px | Dense rows where 16 reads too small but 28 reads too heavy: compact toolbars, tight list cells, status strips. |
| **24** | 24px | Dense rows where 20 reads too small but 28 reads too heavy: compact toolbars, tight list cells, status strips. |
| **28** | 28px | Compact list rows and inline person chips that need slightly more identity weight than 16 |
| **32** | 32px | Tight rows where text and avatar share a single line: input chips, condensed participant rosters |
| **40** | 40px | Default. Comment threads, assignment fields, profile headers |
| **56** | 56px | High-emphasis identity moments: profile cards, people pickers, detail views |
| **120** | 120px | Hero moments: large profile views, about pages, onboarding flows |

**Why sizes share the same content treatment:** Size changes only the container diameter, icon size, and typography scale — not semantic meaning. **Why a numeric scale rather than named buckets:** Once a system carries more than ~4 sizes, names like Small / Medium / Large / XL run out fast. A pixel-named scale keeps the contract honest while still constraining consumers to the documented set.

---

#### State

| Value | Description |
|-------|-------------|
| **Rest** | Default display |

Avatar is non-interactive — no Hover, Pressed, Focus, or Disabled states apply.
