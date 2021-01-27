# Apple-theme

Code and definitions for creating an apple office theme for the components

Some heuristics followed in this theme:

- For most tokens, we default to prefer the apple system colors, using the FluentUI Apple Palette where it makes sense. These mappings are subject to change as we increment on the design.
- On macOS, there tends to not be a "hover" state for components such as Button, so those tokens are mapped to be identical to the rest state tokens.
- Similarily, there is not a "checked" state for most components on Apple platforms, so those tokens are mapped to the pressed state tokens.
- The typography is designed to match the variants provided by the [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/typography/) for regular and "emphasized". As such, the "Semibold" variants do not always map to the semibold weight, but whatever weight the Apple HIG specifies.
