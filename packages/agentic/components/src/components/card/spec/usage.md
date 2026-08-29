# Card usage

Use Card for a repeatable unit of related React Native content, such as a report summary, person, or file. Use `default` for one content block, `nested` for an additional inset region, and `structured` when header and footer regions are useful. Use `padding="none"` for supplied edge-to-edge media rather than text.

Add `onPress` only when the complete card has one clear button-like action. Label that interactive action. A card with several independent actions should remain static and expose those actions from its slots. If a selectable collection owns its selection, pass each card its `selected` value and update it from `onPress`.

Use horizontal direction only where the parent can accommodate its responsive stack below 480 layout units. Card neither supplies navigation behavior nor turns a press into a destination.
