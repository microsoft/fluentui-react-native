---
component: Link
platform: react-native (Windows, macOS)
---

# Link Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** `link` (native `<a href>` element preferred; `role="link"` on non-anchor elements requires manual keyboard event handling and forfeits platform-native behaviors like middle-click, right-click "Copy link," and `target="_blank"` handling).
- **Required attributes:**
  - `href` — always required on a Link. A link without `href` is not a link and not focusable by native platform behavior.
  - `aria-label` — required when the visible link text is not meaningful in isolation, when the link opens in a new tab/window (e.g., "View report (opens in new tab)"), or when multiple links on the page share the same visible text but point to different destinations.
  - `target="_blank"` + `rel="noopener noreferrer"` — required together for any link that opens in a new tab. `rel="noopener"` prevents the opened page from accessing `window.opener`; `rel="noreferrer"` strips the Referer header.
  - `aria-disabled="true"` — use when a Link is non-interactive but must remain present in the DOM. Prefer removing the `href` attribute or rendering the text as a non-link element when the destination is unavailable; a disabled link is a known a11y anti-pattern.
- **WCAG:**
  - **1.4.1 — Use of Color:** Inline links must not rely on color alone to be distinguishable from surrounding text. The Inline=true variant satisfies this by adding the underline at Rest.
  - **1.4.3 — Contrast (Minimum):** Link foreground (`--gnrc-color-foreground-neutral-primary`) must meet 4.5:1 against the surrounding surface. Because Link uses the same color as body text, contrast is satisfied wherever surrounding text is legible — but this also means **color is not an affordance for Link**. The underline must always carry the interactivity signal (see 1.4.1).
  - **2.1.1 — Keyboard:** Enter must activate the link.
  - **2.4.4 — Link Purpose (In Context):** Link text plus its programmatically determinable context must convey the destination. "Click here" fails this; "View the 2026 fiscal report" passes.
  - **2.4.7 — Focus Visible:** Focus ring must be visible in all non-disabled states. Use the universal dual-outline focus ring (see `flex-system:styling`).
  - **2.4.9 — Link Purpose (Link Only, AAA):** Where possible, link text alone (without surrounding context) should convey the destination. This is AAA and not always achievable inline; an `aria-label` can supply isolated meaning when the visible text is short.
  - **3.2.5 — Change on Request (AAA):** Opening a new window must be initiated by the user and announced. Pair the Open icon with an "opens in new tab" cue in the accessible name.
  - **4.1.2 — Name, Role, Value:** Native `<a href>` provides role and accessible name automatically. Custom implementations must supply both explicitly.
- **Screen reader:** Announces label (or `aria-label`), role ("link"), and visited state on supporting platforms. For `target="_blank"` links, the accessible name should include "opens in new tab" so the behavior is announced before activation.

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Underline carries the entire affordance:** Link uses `--gnrc-color-foreground-neutral-primary`, which is the same color as surrounding body text. The underline is therefore the only visual signal that the text is interactive. For Inline=false at Rest the underline is hidden — surrounding context (whitespace isolation, list grouping, navigation landmark) must supply the affordance. If a standalone link sits with no contextual cues, mark it Inline=true so the underline persists.
- **New-tab announcement:** The Open icon is a visual cue; the accessible name supplement ("opens in new tab") is the assistive technology cue. Both are required — neither replaces the other.
- **Zoom:** At 200% and 400% zoom, inline link underlines must remain visually distinct from text-decoration-related artifacts (e.g., dotted underlines from spell-check). Verify dotted Content links retain their visible pattern at small font sizes after zoom.
- **Disabled links anti-pattern:** Browsers do not natively support disabled `<a>` elements. If a destination is unavailable, prefer removing the `href` and rendering the text as a non-link; do not add `aria-disabled="true"` to a focusable link unless the workflow requires the link to remain in the tab order with an announcement of its unavailable state.
- **Adjacent link target size:** When multiple standalone links sit in a column or row, the parent layout must enforce sufficient spacing — WCAG 2.5.8 (Target Size, Minimum, AA) requires a 24×24px effective target. The Link component does not enforce hit-area padding (padding would shift inline baselines); the parent controls it.
