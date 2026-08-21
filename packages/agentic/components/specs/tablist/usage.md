---
component: Tablist
---

# Tablist Usage

## When to Use

- To group related Tab components into a horizontal navigation strip for switching between content panels.
- When content is organized into mutually exclusive categories and the user needs to navigate between them.
- When an optional end-content action (e.g., overflow menu, add tab) should be aligned to the trailing edge of the tab strip.

### vs Toolbar

Toolbar groups action Buttons for commanding (bold, italic, undo). Tablist groups Tab components for content navigation. Toolbar's children trigger discrete actions; Tablist's children activate content panels. Both treat the container as a single navigation group with focus delegated across its children.

---

## Behavior

- **Never apply a background fill or stroke to the Tablist container.** Tablist is a transparent layout wrapper — visual weight comes from the child Tabs, not the container.
- **Always ensure exactly one Tab is Selected=True.** A Tablist must always have one active tab — zero or multiple selected tabs is invalid state.
- **Never mix Tab layouts within a single Tablist.** Use either all Icon + label or all Icon only tabs. Mixing layouts breaks visual rhythm and creates inconsistent hit targets.
- **Always place end-content actions in the End content slot.** Do not append standalone Buttons as siblings of Tab children — the End content slot provides correct layout alignment and separation from the tab strip.

---

## Layout

- **Always use the correct gap token.** See the platform token file (`tokens.yaml`) for the gap value. Do not hardcode pixel values.
