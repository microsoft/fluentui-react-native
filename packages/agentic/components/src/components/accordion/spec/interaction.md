# Accordion interaction

The header uses React Native press handling. Pointer, touch, `Enter`, and `Space` activation request the opposite expanded value. In uncontrolled mode, that request updates internal state; in controlled mode, it only calls `onExpandedChange`, and the caller must provide the next `expanded` value. Press handling retains the consumer's native handlers through the pressable state hook.

Hover and pressed header feedback are resolved from pressable state, with pressed taking precedence. Focus is owned by the header; the body and its children manage their own focus once visible. The component does not implement sibling navigation, roving focus, or focus transfer after expansion.

The chevron rotates immediately and the body visibility styles change immediately. There is no component-owned motion or reduced-motion branch.
