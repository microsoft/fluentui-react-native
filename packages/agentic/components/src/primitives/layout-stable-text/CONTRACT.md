# LayoutStableText contract

`LayoutStableText` prevents label changes from shifting surrounding layout.

- `reserve` is required, hidden from accessibility, and retains its text
  metrics in layout.
- `visible` is required and overlays the reserved text.
- Consumer text styles are preserved before the primitive's structural styles.
- The root remains inaccessible so the visible text supplies semantics.
- Native root and test props not owned by the primitive are forwarded.
