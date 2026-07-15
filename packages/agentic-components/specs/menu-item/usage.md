---
component: MenuItem
---

# MenuItem Usage

## When to Use

- As an individual option inside a Menu container — actions, navigation targets, or selection choices.
- To group items under a Section Header label within a menu.
- When an item needs to indicate persistent selection state — use the Selected axis.
- When items need a secondary action zone — use the related MenuSplitItem component.

### vs Button

Button triggers a discrete action and lives in the page flow. MenuItem lives inside a transient overlay (Menu) and represents a choice within a set. Do not use MenuItem outside of a Menu surface.

### vs Tag

Tag represents applied metadata or filters and is dismissed on click. MenuItem represents available options within a menu. MenuItem's Selected state means "this option is chosen"; Tag has no Selected state.

---

## Behavior

- **Never use Section Header as an interactive item.** Section Headers are non-focusable labels. Use List Item for all interactive options.
- **Never use MenuItem outside of a Menu container.** MenuItem relies on the parent Menu for keyboard navigation, focus management, and ARIA context.
- **Never mix Checkmark and Multiselect on the same item.** Checkmark indicates single-select (radio); Multiselect uses a Checkbox component instance for multi-select. The parent menu determines which pattern is active.
- **Always use a label-hidden Checkbox instance for Multiselect.** The Checkbox component's label is hidden — the MenuItem label serves as the accessible name. Use square style only.
- **Always prevent layout reflow on selectable items.** When the Selected axis is active, the label weight changes from Regular to Semibold. Reserve layout space at Semibold width using a ghost node or hidden pseudo-element.

---

## Content

- **Always use the functional type ramp on labels.** Menus are interactive UI chrome — the content ramp is reserved for editorial and AI-generated content.
