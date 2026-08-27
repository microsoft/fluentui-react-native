# FocusVisual contract

`FocusVisual` is an unstyled, decorative focus-ring structure.

- The outer ring is always mounted; an optional inner ring enables a dual-ring
  visual.
- Visibility changes opacity without mounting or removing configured rings.
- Rings do not participate in hit testing or the accessibility tree.
- Native root and test props not owned by the primitive are forwarded.
- `createFocusVisualProps_unstable` converts ring geometry and colors into
  `FocusVisualProps`; its composition contract may change.
