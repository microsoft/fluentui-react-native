---
component: Button
---

# Button Usage

## When to Use

- To trigger a single, discrete action (submit, save, delete, open).
- As the primary call to action on a surface — use Primary style.
- In toolbars and command bars where toggle behavior is needed — use the Selected axis.

---

## Behavior

- **Never use Disabled to represent a toggled-off state.** Disabled means the control is unavailable. Use Selected=False for the inactive toggle state.
- **Always apply the correct radius token per layout.** Do not hardcode pixel values. If the design source contains a literal that is not covered by tokens, flag it as a token gap before building.
- **Always use the Fluent Iconography Image icon as the default INSTANCE_SWAP value.** Never use placeholder frames, shapes, or custom vectors in icon slots.
- **Always prevent layout reflow on toggle buttons.** When the Selected axis is active, the label weight changes from Regular to Semibold, which shifts the text width. Reserve layout space at Semibold width so the container does not resize on toggle. In CSS, use a hidden pseudo-element or ghost span with Semibold weight and zero height; in Figma, use the ghost node pattern. Non-toggle buttons (no Selected axis) do not need this.

> **Icon style rule:** Selected=False renders the **Regular** icon; Selected=True renders the **Filled** icon. This applies across all platforms — in code, swap the icon asset when the selected state changes; in Figma, bind Regular props to Selected=False nodes and Filled props to Selected=True nodes.

---

## Layout

- **Never use more than one Primary button per surface.** Multiple Primaries eliminate hierarchy and create visual noise.
- **Never mix icon sizes across sizes.** Small buttons use 16px icons; Medium and Large use 20px icons. Mismatched icon sizes break the proportional relationship between icon weight and container height.

---

## Content

- **Always use the functional type ramp on labels.** Buttons are interactive UI chrome — the content ramp is reserved for editorial and AI-generated content.
