# Visual reference source adapter

Use screenshots, design renders, and other images as visual evidence only.
They can establish observable anatomy, geometry, typography, color,
iconography, and differences among captured states. They cannot prove invisible
semantics, accessibility, events, keyboard behavior, motion, or controlled
state ownership.

## Record the evidence

Record a `visual-reference` source with `authority: visual-evidence`. Give each
artifact a stable ID, location, and SHA-256 digest. Add appearance, state,
platform, scale, viewport, and locale metadata when known. Repository-relative
artifacts are digest-verified by the contract checker; do not commit images
without redistribution permission.

Inventory the capture matrix before interpreting it. A missing state is
unknown, not equivalent to the nearest visible state. Note cropping,
compression, scaling, overlays, device chrome, and any dimensions that prevent
reliable measurement.

## Derive a contract conservatively

- Describe anatomy and spatial relationships before choosing implementation
  slots or layout primitives.
- Map visible values to the nearest established FURN tokens; record genuine
  token gaps rather than inventing exact literals from noisy pixels.
- Require non-visual sources for public APIs, semantics, interactions,
  accessibility, motion, and platform behavior.
- Express uncertain conclusions as open questions, deferred divergences, or
  explicitly scoped requirements.

When visual evidence conflicts with normative design or platform evidence,
record the conflict and resolve authority for the affected requirement rather
than silently selecting the image.
