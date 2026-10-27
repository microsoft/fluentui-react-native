# StoryGroup contract

`StoryGroup` gives related story samples a caption followed by one content
container.

- **STG-001:** Render the string label before the children inside a single
  content View. Do not assign group semantics that hide interactive children.
- **STG-002:** Forward the caller's root ref, native View props, test ID and
  root style. Expose optional label test ID/style and content-container style.
- **STG-003:** Preserve caller layout and constrained geometry. The component
  provides only a small default gap and does not impose a row/column direction
  or sample width.
- **STG-004:** The caption uses the active theme's primary foreground by
  default; caller label style is applied last.
