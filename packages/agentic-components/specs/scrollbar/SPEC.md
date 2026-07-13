---
name: scrollbar
platform: react-native (Windows, macOS)
description: Atomic visual indicator that reflects current scroll position and the proportion of visible content inside an overflowing container. Covers orientation (vertical/horizontal), thumb anatomy, and the implicit-track model where the scroll container's overflow lane substitutes for a rendered track.
argument-hint: "[variant axis or token question, e.g. 'scrollbar thumb color' or 'orientation differences']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value     |
| --------- | --------- |
| Type      | atomic    |
| Component | Scrollbar |

This spec covers the Scrollbar component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is treating the Scrollbar as a custom interactive widget: it is the visible thumb that mirrors a native scroll position. The platform's scroll machinery owns keyboard handling, wheel input, and pointer drag; this component only specifies the thumb's appearance. The second common pitfall is rendering a track shape: there is no track stroke or background — the scrollable container's overflow lane is the implicit track, which keeps the thumb visually quiet at rest and avoids competing with content.

---

# Scrollbar

## Spec

### Anatomy

1. **Track** — Implicit. The scrollable container's overflow lane is treated as the track; no stroke, background, or surface is rendered. The Scrollbar component does not own the track region's dimensions — they are derived from the parent container's content overflow.
2. **Thumb** — A 2px-thick rounded rectangle that represents the visible portion of the content. Its length is proportional to `viewport-length / content-length` and its position is proportional to `scroll-offset / scrollable-length`. The thumb uses `--gnrc-color-foreground-neutral-tertiary` so it reads as a foreground mark on the page surface rather than a chrome border.

| Slot  | Required      | Default                                                  |
| ----- | ------------- | -------------------------------------------------------- |
| Track | No (implicit) | Hidden — overflow lane only                              |
| Thumb | Yes           | Visible when content overflows; hidden when content fits |

> **Why the track is implicit:** A visible track competes with the underlying content and creates a permanent vertical/horizontal stripe even when the user is not scrolling. By suppressing the track and exposing only the thumb, the Scrollbar stays out of the way until interaction is needed, mirroring the overlay-scrollbar pattern that modern macOS and Windows shells use.

---

### Variants

Variant properties are ordered in the design tool: **Orientation**.

#### Orientation

| Value                  | Description                                                                                                                              | When to Use                                                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vertical (Default)** | Thumb runs top to bottom along the right edge (LTR) / left edge (RTL) of the scrollable region. Height is the proportional thumb length. | Default. Use for vertical scroll overflow — the dominant pattern for lists, panels, and reading surfaces.                                                                               |
| **Horizontal**         | Thumb runs left to right along the bottom edge of the scrollable region. Width is the proportional thumb length.                         | Use only when the parent container also overflows horizontally (wide tables, image strips, code blocks). Prefer reflowing content vertically first; horizontal scroll is a last resort. |

**Why Orientation is a variant axis, not a property:** The thumb's primary geometry inverts between values — its long axis follows the scroll direction. Anchoring also flips edges (trailing edge of the container in each axis). This is a structural layout change, not a style toggle.
