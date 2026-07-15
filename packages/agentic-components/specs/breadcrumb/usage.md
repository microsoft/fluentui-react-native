---
component: Breadcrumb
---

# Breadcrumb Usage

## When to Use

- To help users understand where they are in a multi-level hierarchy (three or more levels deep) and navigate back to ancestor pages.
- As a secondary wayfinding aid on page-level surfaces — place it near the top of the content area, below primary navigation.
- When users may arrive at a deep page via search, a link, or a notification and need spatial context to orient themselves.

Do not use Breadcrumb as the sole navigation mechanism — it supplements primary navigation (sidebar, top nav) rather than replacing it. For flat or single-level navigation, the overhead of a breadcrumb trail is unnecessary.

---

## Behavior

- **Always show the first and last (Current) items.** When using the Collapsed overflow variant, the first ancestor and the CurrentItem must remain visible. Middle items may be hidden behind the OverflowButton, but the trail endpoints must always be present to preserve spatial context.
- **CurrentItem is never interactive.** Do not apply a link, button behavior, or hover state to the current page item — the user is already there. Use the Current state value, not Disabled, for the final item.
- **Never use Disabled to suppress a navigation item unless the destination is genuinely unavailable.** If a parent page exists but is contextually inaccessible (e.g. due to permissions), use Disabled on that BreadcrumbItem. Do not use Disabled as a placeholder when the trail is still loading.
- **Overflow disclosure uses a Popover.** The Collapsed variant exposes an OverflowButton; activating it opens an anchored Popover presenting the hidden middle items as a navigable list. The Popover light-dismisses on Escape, click outside, or item activation — no separate collapse action is needed. See `interaction.md` for the full keyboard and focus lifecycle.
- **Maintain consistent icon presence across the trail.** If one BreadcrumbItem carries a leading icon, all BreadcrumbItems in the same trail should carry one. Use the Without icon variant by default; switch to With icon only when every item in the trail has a distinct, recognizable icon.
- **Show a Tooltip on the OverflowButton.** On hover or focus over the `•••` button, display a Tooltip indicating how many items are hidden (e.g. "3 items"). If the count is small enough, listing the item names is also acceptable. This gives people a preview before they open the Popover.
- **Show a Tooltip on truncated labels.** If a BreadcrumbItem label is too long for the available space and is truncated with an ellipsis, show a Tooltip on hover or focus with the full label text.

---

## Layout

- **One Breadcrumb per page surface.** Multiple breadcrumb trails on the same page create conflicting location signals. If a surface has nested regions that each need wayfinding, use in-region headings or secondary tabs instead.
- **Breadcrumb sits above the page title, not below it.** The trail provides context for the title — it belongs in the header area before the primary H1 so the user reads location before content.
- **Match Size to the surrounding density.** Use Small in toolbars, data-table headers, or any dense surface where vertical rhythm is tight. Use Medium as the default across standard page layouts. Use Large only when the Breadcrumb is a prominent wayfinding element on a spacious page header.
- **Horizontal overflow:** Breadcrumb is a single-line, horizontally scrolling element by default. Use the Collapsed (Overflow) variant rather than wrapping to a second line — wrapped breadcrumbs are visually ambiguous and harder to parse.

---

## Content

- **Use the same page title as the destination.** BreadcrumbItem labels should match the `<h1>` or document title of the page they link to exactly — so people recognize the destination before they navigate. Do not abbreviate, paraphrase, or editorialize.
- **CurrentItem label matches the current page title.** The CurrentItem should always reflect the page title of the current page so people can correlate the breadcrumb with the content they see.
- **Use sentence case.** Breadcrumb labels follow the same capitalization as page titles — sentence case unless the title is a proper noun — to stay consistent with page title conventions and avoid creating artificial emphasis. Do not capitalize every word.
- **Keep labels short.** Long page titles should be truncated in BreadcrumbItem labels if necessary (with a visible tooltip on hover to expose the full title), but CurrentItem should prefer full title visibility since it is the person's immediate location reference.
- **Avoid verbs.** BreadcrumbItems represent places, not actions — use noun-form labels ("Settings", "Account", "Documents"), not imperative phrases ("Go to Settings", "Open Account").
