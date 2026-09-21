# Icon contract

`Icon` renders one image, font glyph, or SVG source without adding a styled
component boundary.

- Image, font, and SVG sources are mutually exclusive.
- Color, dimensions, accessibility, and test props are forwarded to the active
  renderer.
- The font renderer owns a sized, non-shrinking View that centers the intrinsic
  Text line box. Do not impose `height` or `lineHeight` on the glyph to position
  it: a font's ascent and descent are not its em size.
- With both frame dimensions specified, the glyph is an absolute child with no
  edge offsets. This allows intrinsic height measurement even when the font's
  line box exceeds the icon frame. A normal-flow Text can still be measured
  against the frame's maximum height and render low.
- Font size is the smaller supplied dimension, or the sole supplied dimension.
  Dimensioned glyphs disable font scaling because the explicit icon dimensions,
  like image and SVG dimensions, own scaling. An undimensioned glyph retains
  native default font sizing and scaling. Android font padding is disabled.
- The font frame owns the accessibility and test props; its Text is decorative.
  Color and font family apply to the Text. Image and SVG renderers remain direct.
- The default accessibility role is `image` unless the consumer supplies one.
- A missing source renders no native element.
- The primitive does not expose a component ref because its image, font-frame, custom
  SVG, and empty branches do not share one stable imperative instance type.
- The primitive does not select glyphs, token values, or product styling.
