---
component: Tag
---

# Tag Usage

## When to Use

- To label content with categories or keywords where the user can dismiss (remove) individual tags.
- To represent applied filters in a filter bar or search context — clicking the tag removes the filter.
- In any context where a compact, dismissible label is needed (e.g., email recipients, selected items).

### vs Button

Button triggers a discrete action or toggles a persistent toolbar state. Tag represents a label or applied filter — clicking it dismisses (removes) the tag. Use Tag when the element *is* the content (a keyword, category, or filter); use Button when the element *performs* an action.

---

## Behavior

- **Never use Tag as an action button.** Tags label or filter content — they do not trigger discrete actions. Use Button for actions.
- **Clicking anywhere on the tag dismisses it.** The entire surface is the dismiss target.
- **Always use the Fluent Iconography instance as the default INSTANCE_SWAP value.** Never use placeholder frames or custom vectors in icon slots.

> **Icon style:** All icons (leading and dismiss) use the **Regular** style. There is no Filled icon variant.

---

## Style

- **Secondary is the default.** Use it as the standard tag, suitable for most scenarios.
- **Use Primary for high emphasis tags** where the tag is central to the scenario.
- **Don't mix Style as a semantic signal.** Primary vs Secondary communicates emphasis only, not category, status, or selection. There is still no Selected state.

---

## Layout

- **Never mix icon sizes across sizes.** Small tags use 16px leading icons with a 12px dismiss icon; Medium tags use 20px leading icons with a 16px dismiss icon.

---

## Shape

- **Rounded is the default.** Use the size-based rounded-rect radius for standard tags.
- **Use Circular for pill-shaped tags** when a softer, more compact look fits — e.g., contact chips or filter pills. Circular applies `radius-circular` even with a visible label.
- **Icon only is always circular** regardless of the Shape setting.
