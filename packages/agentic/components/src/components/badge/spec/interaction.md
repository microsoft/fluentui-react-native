# Badge interaction

Badge has no pressable state and is not a keyboard target. It does not respond to pointer, touch, `Enter`, `Space`, hover, focus, selection, or disabled state. A parent control owns any activation and its `FocusVisual`.

Badge does not animate its visual changes and has no reduced-motion branch. It flows in normal React Native layout; a parent may position it alongside or over a host without changing the Badge interaction contract.
