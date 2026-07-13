---
component: Badge
---

# Badge Usage

## When to Use

- To communicate a count of related items (unread messages, pending tasks, notification count) next to the host control they belong to.
- To label content with a short status or category (`New`, `Beta`, `Updated`, `Internal`).
- To surface a quiet, glanceable signal — Badge is read at a glance, not interacted with.

### vs Tag

Tag is a **dismissible, interactive** label for keywords, categories, or applied filters — clicking removes it. Badge is a **non-interactive** indicator that decorates another element and never receives focus. Use Tag when the element *is* the content the user manipulates; use Badge when the element annotates something else.

### vs Button

Button performs an action. Badge does not. If users need to act on what the badge represents (e.g., open the inbox the badge counts), the action lives on the surrounding Button, NavItem, or ListItem — never on the Badge itself.

### vs Message Bar

Message Bar communicates page-level or section-level status with optional actions. Badge communicates per-item status inline. If the message needs to be read and acknowledged on its own, use Message Bar; if it's a small annotation on a host control, use Badge.

---

## Behavior

- **Never make Badge interactive.** Badge does not receive focus, does not respond to hover or pressed, and is not part of the tab order. Interactivity belongs to the host control.
- **Always anchor Badge to a host control.** A floating Badge with no obvious owner has no semantic context. Place Badge adjacent to or overlaid on the element it describes.
- **Never use color alone to communicate meaning.** A red Badge conveys nothing to screen readers and nothing to a user with red-green color vision deficiency. Pair color with a label, an icon, or text in the host control's accessible name. See `accessibility.md` for the patterns.
- **Always use the Fluent Iconography instance as the default INSTANCE_SWAP value.** Never use placeholder frames or custom vectors in the Icon slot.

> **Icon style:** All Badge icons use the **Regular** style. There is no Filled icon variant in v1.

---

## Layout

- **Match Size to the host.** Small Badge on small icons or avatars (16–24px) and in dense rows; Medium Badge on standard icons or avatars (28–40px) and in regular-density layouts.
- **Pair Shape with the surrounding chrome.** Circular Badge next to circular avatars or icon buttons; Rounded Badge in rectangular contexts (cards, tables, rows of inputs).
- **Anchor counter Badges to the top-right corner of their host.** A counter Badge that floats elsewhere (top-left, bottom) breaks the convention users already have from notification systems.
- **Never resize Badge with CSS to fit a container.** If the size feels wrong, change the Size variant. Resizing breaks token-driven typography and padding ratios.
- **Never mix icon sizes within a Size.** Small uses 12px icons; Medium uses 16px icons. Do not swap a 20px icon into a Medium Badge.

---

## Content

- **Keep labels short — counter, single word, or two-word maximum.** Badge is read at a glance; long text reflows the host layout and defeats the purpose. For longer text, use Tag or inline body text.
- **Counter values that exceed legible width should truncate with `999+`** (or the locale-equivalent overflow token). Do not let a 4–5 digit count expand the Badge.
- **Use Color semantically, not decoratively.**
  - **Brand** — featured, promoted, branded content
  - **Danger** — errors, blocked items, destructive state
  - **Success** — completed, healthy, confirmed
  - **Warning** — caution, attention-needed, non-blocking issue
  - **Informative** — quiet metadata, counts, neutral status
- **Avoid mixing colors in a single row.** A row of Badges with mixed Brand / Danger / Success colors creates visual noise. Pick the most relevant color per item or settle on one color across the row.
