# Text accessibility

- Text preserves the active React Native Text implementation's accessibility
  behavior.
- Native accessibility props, labels, roles, states, language, scaling, and
  selection settings pass through unchanged.
- Text does not assign an accessibility role or synthesize an accessibility
  label by default.
- Pressable text relies on the native `onPress` and `onLongPress` semantics and
  the accessibility props supplied by the caller.
