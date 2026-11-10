# CheckboxIndicator contract

`CheckboxIndicator` is an unstyled, decorative indicator for checkbox state.

- `status` selects no glyph, a checkmark, or an indeterminate mark.
- Checked and indeterminate glyph sources are independently replaceable `SvgIconSource` components. The defaults are
  the Fluent checkmark and subtract icons, drawn at the optical size nearest `iconSize`.
- `iconColor` and `iconSize` are forwarded to the rendered `Icon`. Without `iconColor` the glyph keeps the default SVG
  fill, which is black.
- The root remains inaccessible so the owning checkbox supplies semantics.
- Native root, accessibility, and test props not owned by the primitive are
  forwarded.
