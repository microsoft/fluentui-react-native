---
component: Tab
---

# Tab Usage

## When to Use

- To switch between related content panels within a persistent container (e.g., Files, People, Chats).
- As a navigation affordance within a Tablist where only one panel is visible at a time.
- When the user needs to compare categories of related information without leaving the current surface.

### vs Button

Button triggers a discrete action (submit, delete, open). Tab navigates between content views within a persistent container. Button is a standalone focus target; Tab is part of a navigation group owned by Tablist. Button has a Style axis (Primary, Secondary, Outline, Subtle); Tab has a single implicit style with selected/unselected visual distinction.

### vs Tag

Tag labels, categorizes, or filters content and can be dismissed. Tab navigates between content panels. Tag uses `brand-heavy` fill at rest regardless of selection; Tab uses `transparent` at rest and `neutral-heavy` only when selected. Tag supports a dismiss action; Tab does not.

---

## Behavior

- **Never use Disabled to represent an inactive tab.** Disabled means the tab is unavailable. Use Selected=False for the non-active tab.
- **Always ensure exactly one tab is Selected=True.** A tablist must always have one active tab — zero or multiple selected tabs is invalid.
- **Always apply the correct radius token per layout.** Icon + label uses `--gnrc-border-radius-base-300`; Icon only uses `--gnrc-border-radius-circular`. Do not hardcode pixel values.
- **Always prevent layout reflow on toggle.** When Selected changes, the label weight changes from Regular to Semibold. Reserve layout space at Semibold width using the ghost node pattern. See Anatomy.
- **Always use the Fluent Iconography Image icon as the default INSTANCE_SWAP value.** Never use placeholder frames, shapes, or custom vectors in icon slots.
- **Never use Tab outside of a Tablist.** Tab is not a standalone control — it must be a child of a Tablist container to function correctly.

---

## Content

- **Always use functional typography on labels.** Never apply content-set type to tab labels — tabs are interactive UI chrome, not editorial content.
