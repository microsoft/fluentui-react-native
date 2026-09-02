# HTML and CSS source adapter

Use HTML/CSS evidence to recover observable anatomy, content flow, layout,
computed values, and visual state differences. It does not by itself establish
native semantics, controlled-state ownership, event contracts, or platform
accessibility.

## Capture reproducible evidence

Record an `html-css` source with its origin and sorted immutable artifacts.
Supported artifacts are HTML, CSS, computed-style captures, accessibility-tree
captures, and screenshots. Each artifact needs a stable ID, kind, location,
and SHA-256 digest. Store only evidence that may be redistributed; otherwise
use an HTTPS identity and retain restricted material outside the public
repository.

Capture the relevant matrix when available:

- variants, sizes, appearances, and interaction states;
- viewport, zoom or scale, color scheme, direction, and locale;
- inherited versus explicitly assigned typography and color;
- computed dimensions, spacing, wrapping, truncation, and overflow;
- browser accessibility output separately from visual output.

## Adapt the evidence

Map element anatomy to typed React Native slots only when consumers need the
slot. Convert CSS inheritance into explicit theme/token defaults at the owning
native boundary. Translate pseudo-classes to component state and precedence.
Treat layout values as observations, then choose the appropriate React Native
layout and minimum-target behavior.

Mark semantics, keyboard behavior, motion, state ownership, and inaccessible
states as unknown unless another source establishes them. Never infer an API
solely from class names, data attributes, or a single rendered DOM snapshot.
