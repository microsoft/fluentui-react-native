# LayoutStableText contract

`LayoutStableText` prevents label changes from shifting surrounding layout.

- `reserve` is required, hidden from accessibility, and retains its text
  metrics in layout.
- `visible` is required and is vertically centered in an absolute-fill View over
  the reserved text. The visible Text retains its own measured line box rather
  than stretching to the reserve's height.
- Both labels use the same available width so wrapping and truncation remain
  consistent. The caller supplies a reserve large enough for every visible state.
- Consumer text styles are preserved before the primitive's structural styles.
- The root remains inaccessible so the visible text supplies semantics.
- The overlay does not intercept input intended for the visible Text or its
  owning control.
- Native root and test props not owned by the primitive are forwarded.
