---
component: Avatar
platform: react-native (Windows, macOS)
---

# Avatar Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:**
  - Informative avatar (sole identifier in context): `role="img"` with `aria-label` describing the person or entity.
  - Decorative avatar (name or title shown adjacent): `aria-hidden="true"`.
- **Required attributes:**
  - `aria-label` — required when `role="img"` is applied. Describe the person or entity, not the visual (e.g., "Lydia Mitchelson", not "Circular profile photo").
  - `alt` — required on `<img>` elements in the Image slot; use empty string (`alt=""`) for decorative instances.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Initials text and icon foreground must meet 4.5:1 against the avatar background.
  - **1.4.11 — Non-text Contrast:** The avatar container fill must meet 3:1 against adjacent surfaces where the avatar functions as a UI component indicator rather than purely decorative content. On surfaces whose lightness approaches the fill, place the avatar on a stronger surface or use Image mode.
  - **2.5.8 — Target Size (Minimum, AA):** Avatar is non-interactive — no target size requirement applies. If wrapped in an interactive control, the wrapper must meet the 24×24px minimum.
- **Keyboard:** Not applicable — Avatar is not focusable.
- **Screen reader:** Announces the `aria-label` on informative avatars; decorative avatars marked `aria-hidden="true"` are skipped so the adjacent name or title is not announced twice.

---

## Usage

- **Decorative vs informative:** If the person's name or entity title appears adjacent (e.g., in a list row or comment thread), mark the avatar `aria-hidden="true"` to avoid announcing the identity twice. If the avatar is the only identifier in context, provide `aria-label`.
- **Image alt text:** When the photo is informative, mirror the avatar's `aria-label` in the inner `<img alt="">`. When the avatar is decorative (`aria-hidden="true"`), use empty `alt=""` so the image is also skipped.
- **Activity ring labeling:** The activity ring is a visual presence cue only — it has no inherent semantics. When the ring is the sole signal that someone is active or collaborating, supplement it with a textual indicator (visible label or tooltip) so the status is announced to assistive technology.
- **Zoom:** Avatar containers are fully circular, which maintains their shape at any zoom level. Ensure the container diameter is set in a zoom-resilient unit in contexts that require scaling.
- **Motion:** Avatar has no animated state transitions. No reduced-motion accommodation is required on the component itself.
