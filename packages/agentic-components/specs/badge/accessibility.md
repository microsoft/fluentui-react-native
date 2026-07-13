---
component: Badge
platform: react-native (Windows, macOS)
---

# Badge Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:**
  - **Decorative Badge** (label or context already announced by the host control): `aria-hidden="true"` on the Badge element so screen readers do not announce it twice.
  - **Informative Badge** (Badge is the sole signal — e.g., a colored dot indicating unread, or a counter that is not in the host's accessible name): `role="img"` with `aria-label` describing the meaning ("3 unread messages", "Active", "Warning").
  - **Inline-text Badge** (Badge wraps a counter or short word that should be announced as part of the host's accessible name): no role; the Badge renders as inline text and the host control's accessible name pulls the Badge's text content via `aria-label` or `aria-describedby`.
- **Required attributes:**
  - `aria-label` — required when `role="img"` is applied. Describe the meaning, not the visual ("3 unread messages", not "red circle with 3").
  - `aria-hidden="true"` — required when the same information is already announced by the host control's accessible name (avoids double announcement).
- **WCAG:**
  - **1.3.1 — Info and Relationships:** Information communicated by Badge color (status, severity) must also be available in the accessible name or surrounding text. A red Badge alone is not enough.
  - **1.4.1 — Use of Color:** Color is never the sole carrier of meaning. Pair color with text, an icon, or an accessible label.
  - **1.4.3 — Contrast (Minimum):** Label text and icon foreground must meet 4.5:1 against the Badge background at all Color × Style combinations. Verify Tint combinations on neutral surfaces; the `*-soft` backgrounds plus `*-primary` foregrounds are tuned to pass, but recheck on non-neutral host surfaces.
  - **1.4.11 — Non-text Contrast:** When Badge is the sole UI indicator (Icon only, or color-coded state), the container background or stroke must meet 3:1 against the adjacent host surface. Outline style relies on stroke contrast; verify the stroke against the parent background.
- **Keyboard:** Not applicable — Badge is not focusable and is not part of the tab order.
- **Screen reader:** Announcement depends on the role applied above. The most common correct pattern is to fold the Badge content into the host control's `aria-label` (e.g., `<button aria-label="Inbox, 3 unread messages">Inbox <Badge>3</Badge></button>`) and mark the Badge `aria-hidden="true"`.

---

## Usage

- **Folding Badge into the host's accessible name is the preferred pattern.** It produces the most natural screen reader output and avoids the double-announce problem. Apply `aria-hidden="true"` to the Badge in this case.
- **Use `role="img"` only when the Badge is the sole signal.** A colored dot next to a channel name indicating unread activity, or a Danger-colored Badge on a list row indicating an error — these need an explicit `aria-label` because nothing else in the DOM communicates the meaning.
- **Icon-only Badges require an `aria-label` describing the meaning, not the icon.** "Warning" or "Verified", not "triangle icon" or "checkmark icon". Because Badge is not focusable, a hover/focus tooltip does not apply as the visible alternative — give sighted users the meaning through adjacent text or the host control's visible label, never the icon glyph alone.
- **Decorative Badge on a Disabled host:** the host control's `aria-disabled` is sufficient. Do not add Badge-specific disabled attributes — Badge has no disabled state.
- **Zoom and reflow:** Badge uses token-driven typography and padding. Avoid fixed widths — let the container size to its content so reflow at 200% zoom works without clipping.
- **Color and color vision deficiency:** Never use Color alone to differentiate Badges in a list (e.g., "the red ones are errors"). Pair with an Icon or include the status word in the host's accessible name.
- **High contrast / forced colors mode:** Outline style and stroke-based color signals may render in system colors. Verify both styles in Windows High Contrast and `forced-colors: active` to ensure the Badge remains visible and distinguishable from adjacent UI.
