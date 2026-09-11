# Accordion interaction

The header uses React Native press handling. Pointer, touch, `Enter`, and `Space` activation request the opposite expanded value. In uncontrolled mode, that request updates internal state; in controlled mode, it only calls `onExpandedChange`, and the caller must provide the next `expanded` value. Press handling retains the consumer's native handlers through the pressable state hook.

Hover and pressed header feedback are resolved from pressable state, with pressed taking precedence. Focus is owned by the header; the body and its children manage their own focus once visible. The component does not implement sibling navigation, roving focus, or focus transfer after expansion.

The header follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy): request native focus visuals on every platform by default, with the custom visual still mounted but hidden on that path. Rendering depends on platform support. The `focused` override can preview the custom visual, but does not force native focus or its system ring.

The chevron rotates immediately and the body visibility styles change immediately. There is no component-owned motion or reduced-motion branch.
