# Badge usage

Use Badge for short counts, categories, and status signals associated with a nearby item. Use `iconAndText` for a readable compact label; use `iconOnly` only when its accessible name explains the signal. Keep meaningful status available in text or in the host control’s accessible name rather than relying on color.

Use `tint` or `outline` for status. For a notification, choose `layout="counter"` with a caller-formatted `count` (such as `"99+"`), or `layout="dot"` for a mark without content. Both imply `filled`. Put count or unread meaning in the host’s accessible name or visible text; do not rely on the mark or its color. Select `small` or `medium` to match surrounding content; placement belongs to the host.

Do not make Badge an action or use it as a replacement for a Button, Tag, or page-level feedback surface.
