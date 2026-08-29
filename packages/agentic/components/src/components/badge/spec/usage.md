# Badge usage

Use Badge for short counts, categories, and status signals associated with a nearby item. Use `iconAndText` for a readable compact label; use `iconOnly` only when its accessible name explains the signal. Keep meaningful status available in text or in the host control’s accessible name rather than relying on color.

Use `tint` for a filled signal and `outline` where an outlined boundary is more appropriate. Select `small` or `medium` to match surrounding React Native content instead of scaling the root with custom transforms. The component intentionally leaves placement to its host.

Do not make Badge an action or use it as a replacement for a Button, Tag, or page-level feedback surface.
