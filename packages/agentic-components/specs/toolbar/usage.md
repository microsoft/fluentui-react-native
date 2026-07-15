---
component: Toolbar
---

# Toolbar Usage

## When to Use

- To group related formatting or commanding actions into a horizontal strip (e.g., bold, italic, list controls in a text editor).
- When multiple icon-only buttons share a common context and should be visually unified as a single control group.
- To separate logical groups of actions with vertical dividers within a single control strip.

### vs Button

Button is an atomic interactive control that triggers a single action. Toolbar is a molecular container that arranges multiple Buttons (and Dividers) into a cohesive horizontal strip with managed spacing. Use Button alone for standalone actions; use Toolbar when actions belong to a shared context and need grouped layout.

---

## Behavior

- **Never apply a background fill or stroke to the toolbar container.** Toolbar is a transparent layout wrapper — visual weight comes from the child buttons, not the container.
- **Always use icon-only Subtle buttons inside the toolbar.** The toolbar pattern is designed for icon-only controls. If you need labeled actions, use a different container pattern.
- **Always use Divider to separate logical groups.** Do not use extra gap or spacer elements — the Divider sub-component provides the correct visual and semantic separation.
- **Never mix Button sizes within a single toolbar.** Large toolbar uses Large buttons; Small toolbar uses Small buttons. Mixing sizes breaks vertical alignment and visual rhythm.

---

## Layout

- **Always use the correct gap token for the toolbar size.** See the platform token file (`tokens.yaml`) for size-to-token mapping. Do not hardcode pixel values.
