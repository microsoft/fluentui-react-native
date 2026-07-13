---
name: drawer
platform: react-native (Windows, macOS)
description: Molecular secondary content surface that slides in from one edge of a layout. Covers type (Inline/Overlay), position (Start/End/Bottom), four sizes, header/body/footer anatomy, and dependency delegation to Button and Divider.
argument-hint: "[variant axis or behavior question, e.g. 'overlay vs inline' or 'bottom drawer sizing']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | molecular |
| Component | Drawer |

This spec covers the Drawer component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is reaching for a Drawer when a Popover, Tooltip, or Dialog would be more appropriate — Drawers are for supplemental content and simple actions related to the main layout, not for brief contextual labels (use Tooltip), lightweight contextual content anchored to a trigger (use Popover), or blocking confirmations (use Dialog). The Inline type coexists with main content by pushing it aside; the Overlay type floats above main content with a scrim.

---

# Drawer

## Spec

## Dependencies

- **Button** (`flex-components:button`) — used in the Header navigation slot for close/back actions and in the Footer for primary/secondary action buttons.
- **Divider** (`flex-components:divider`) — used as an optional separator between Header and Body, and between Body and Footer. Always without content (plain line only — no label or icon).

---

### Anatomy

1. **Container** — root frame; owns the surface fill, border radius, shadow (Overlay type only), and overall sizing. Positioned at the edge of the layout determined by the Position variant. **Bottom** position adds a subtle top-edge stroke (`--gnrc-color-stroke-neutral-subtle`) because the elevation shadow casts downward and cannot separate the drawer from the content above it.
2. **Header** — top region of the drawer; owns horizontal padding and vertical padding. Holds a fixed minimum height (48px = Button Medium 32px + 8px vertical padding top and bottom) so it stays the same height whether or not the close button is shown. Its content (title and navigation controls) is vertically centered.
3. **Header title** — text node displaying the drawer's heading. Uses functional body strong typography for clear hierarchy. Vertically centered within the header.
4. **Header navigation** — action slot in the header for close (dismiss) and optional back button. Uses Button Subtle Icon only instances.
5. **Body** — scrollable content area between header and footer. Accepts any child content. Fills remaining vertical space.
6. **Footer** — bottom region anchored to the drawer's bottom edge. Contains action buttons (e.g., confirm, cancel), vertically centered, with the same fixed minimum height as the header (48px). Hidden when no actions are needed.

| Slot | Required | Default |
|------|----------|---------|
| Header title | Yes | "Drawer title" |
| Header navigation | Yes | Close button (Dismiss icon) |
| Body | Yes | Content placeholder |
| Footer | No | Hidden |

> **Footer visibility:** The Footer is hidden by default. Show it when the drawer contains a form or workflow that requires explicit confirmation or cancellation actions.

---

### Variants

Variant properties are ordered in the design tool: **Type → Modal type → Position → Size → Open**.

#### Type

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Inline** | Pushes main content aside; drawer and main content coexist in the layout flow | When supplemental content should remain visible alongside the main content without obscuring it — e.g., a properties panel, a detail pane |
| **Overlay** | Floats above main content, optionally with a scrim backdrop (per Modal type) | When the drawer requires focused attention or the viewport is too narrow for side-by-side layout — e.g., mobile navigation, a filter panel on a small screen |

**Why Type is a variant axis:** Inline and Overlay fundamentally differ in layout behavior — Inline participates in the document flow and resizes the main content area, while Overlay uses fixed/absolute positioning with a scrim layer and elevation. These structural differences cannot be toggled with a single property.

#### Modal type

Applies to Overlay type only.

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Modal** | Page is dimmed and cannot be interacted with. Focus is trapped within the drawer; moving focus outside implies closing it. | Default for Overlay drawers — when focused attention on the drawer content is required |
| **Non-modal** | Page is not dimmed. Users can interact with the rest of the page. Tab focus can move outside the drawer freely. | When the drawer provides supplemental info that doesn't require exclusive attention — e.g., a chat panel or reference pane |
| **Alert** | A special modal that interrupts the workflow to communicate an important message or request a decision. Cannot be dismissed via the scrim — the user must take an explicit action through the provided options. | When the drawer contains a critical decision or confirmation that must be resolved before continuing |

**Why Modal type is a variant axis:** Each value fundamentally changes the focus model, scrim presence, and dismiss behavior — Modal traps focus with light-dismiss, Non-modal frees focus with no scrim, and Alert traps focus without light-dismiss. These are structural interaction differences, not style toggles.

#### Position

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Start** | Slides in from the start edge (left in LTR, right in RTL) | Default for navigation drawers, filter panels, and tree views |
| **End** | Slides in from the end edge (right in LTR, left in RTL) | Detail panes, property inspectors, and contextual information related to a selected item |
| **Bottom** | Slides up from the bottom edge | Mobile-first patterns, action sheets, and supplemental content on narrow viewports |

**Why Position is a variant axis:** Each position changes the slide direction, the edge the container anchors to, and the border radius pattern (Bottom drawers round only the top corners). These are structural layout differences, not stylistic toggles.

#### Size

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Small** | 320px — narrow drawer for minimal supplemental content | Simple lists, navigation links, or brief details |
| **Medium** | 592px — standard drawer width | Default for most use cases — property panels, filter forms, detail views |
| **Large** | 940px — wide drawer for complex content | Multi-column layouts, rich editing forms, or content requiring more horizontal space |
| **Full** | 100vw — fills the entire viewport width | Mobile viewports or immersive experiences where the drawer replaces the main view |
| **Custom** | User-specified width via style override | When none of the predefined sizes match the content requirements — e.g., a specific layout constraint or a responsive calculation |

**Why five sizes:** Drawer width must adapt to both content complexity and viewport constraints. Fixed widths per size ensure consistent, predictable layouts. Full is necessary for mobile-first patterns where the drawer occupies the entire screen. Custom allows developers to override the width style property for edge cases where the predefined sizes don't fit the content or layout requirements.

#### Responsive reflow

When an Inline drawer's configured width would leave insufficient usable space for the main content, the drawer automatically transitions to Overlay mode. This prevents the main content area from being compressed to an unusable width.

| Condition | Behavior |
|-----------|----------|
| Viewport width ≥ drawer width + minimum main content width (320px) | Inline drawer renders normally, pushing main content aside |
| Viewport width < drawer width + minimum main content width (320px) | Drawer switches to Overlay mode (Modal by default) with the same Size and Position |

**Implementation notes:**

- The minimum main content width threshold is 320px — below this, the inline layout is considered unusable and the drawer must overlay.
- When the viewport widens again past the breakpoint, the drawer returns to Inline mode without user intervention.
- The transition between Inline and Overlay should not cause content loss or reset scroll position within the drawer body.
- If the drawer is already Overlay type, no reflow occurs — Overlay drawers are viewport-independent by design.
- Full-size drawers are unaffected because they span the entire viewport regardless of type.

#### Open

| Value | Description |
|-------|-------------|
| **False** | Drawer is hidden; not rendered or off-screen |
| **True** | Drawer is visible; slides into view from the Position edge |

**Open is a boolean variant axis, not a State.** It describes the drawer's visibility, not its interactive condition. A drawer can be Open=True in a Rest or Hover state simultaneously.

---

### Figma representation

The design-tool component simplifies the full variant matrix to only visually distinct axes. Behavioral-only differences are documented in code/spec but omitted from Figma.

| Spec axis | Figma treatment | Rationale |
|-----------|----------------|-----------|
| **Type** | Variant axis (Inline / Overlay) | Structural visual difference — elevation, shadow, scrim |
| **Size** | Variant axis (Small / Medium / Large / Full) | Distinct widths |
| **Bottom** | Boolean variant axis (false / true) | Only visually distinct Position — controls top corner radius (`BorderRadius/Base/400` on top-left and top-right when true) |
| **Modal type** | Not represented | Behavioral only — focus model, scrim presence, and dismiss behavior are indistinguishable visually in a static component |
| **Position (Start / End)** | Not represented | Visually identical — mirroring is a runtime/layout concern |
| **Open** | Not represented | Component depicts the open (visible) state; closed state is absence of the component |

**Figma variant order:** Type → Size → Bottom

**Figma component properties (non-variant):**

| Property | Type | Default | Controls |
|----------|------|---------|----------|
| Title string | TEXT | "Drawer title" | Header title text content |
| Footer | BOOLEAN | false | Footer region visibility |
| Close button | BOOLEAN | true | Dismiss button visibility in Header navigation |
