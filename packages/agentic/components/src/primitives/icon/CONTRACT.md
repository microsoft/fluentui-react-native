# Icon contract

`Icon` renders one image, font glyph, or SVG source without adding a styled
component boundary.

- Image, font, and SVG sources are mutually exclusive.
- Color, dimensions, accessibility, and test props are forwarded to the active
  renderer.
- The default accessibility role is `image` unless the consumer supplies one.
- A missing source renders no native element.
- The primitive does not expose a component ref because its image, text, custom
  SVG, and empty branches do not share one stable imperative instance type.
- The primitive does not select glyphs, token values, or product styling.
