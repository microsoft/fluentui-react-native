# StoryItem contract

`StoryItem` presents a sample followed by a short string caption.

- **STI-001:** Render children before the caption; do not reorder either part
  based on platform or style.
- **STI-002:** Forward the caller's root ref, native View props, test ID and
  root style. Expose caption style for demonstrations that need explicit
  typography.
- **STI-003:** Do not impose sample width, height, alignment or a shared
  horizontal/vertical layout. Caller constraints and styles take precedence.
- **STI-004:** The caption uses the active theme's primary foreground by
  default and remains accessible as ordinary text.
