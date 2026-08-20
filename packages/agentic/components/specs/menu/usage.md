---
component: Menu
---

# Menu Usage

## When to Use

- To present a set of actions triggered from a button, icon, or right-click context.
- As a dropdown menu attached to a trigger element (button, input, or avatar).
- To display a list of selectable options in a popover context.
- When items need to be organized into labeled groups using Section Headers.

### vs Popover

Popover is a generic floating surface with no built-in selection model — it accepts arbitrary content. Menu is a Popover specialized for a list of actions or options, with keyboard navigation, focus management, and ARIA menu semantics. If the floating surface needs free-form content (headings, form controls, mixed elements), use Popover; if it is a list of actions or selectable options, use Menu.

### vs Tooltip

Tooltip is a non-interactive contextual label for plain-text descriptions of a UI element. Menu is interactive — items receive focus and can be activated. If the floating surface only labels something, use Tooltip; if the user picks from it, use Menu.

### When NOT to Use

- Do not use as a persistent navigation surface — use a nav component or sidebar.
- Do not use for inline option selection within a form — use a dropdown/combobox.
- Do not use for toast or alert messages — use a MessageBar or dialog.

---

## Behavior

- **Never render Menu inline in the page flow.** Menu is an overlay surface — it must be positioned above other content using portal/popover rendering.
- **Never nest more than two levels of submenus.** Deep nesting creates navigation complexity. Redesign the information architecture if more than two levels are needed.
- **Always dismiss the menu when a non-submenu item is activated.** Persistent menus after action selection confuse the interaction model.
- **Always use MenuItem components as children.** Do not place arbitrary content inside the Menu container — use MenuItem's slots and properties to compose item content.
