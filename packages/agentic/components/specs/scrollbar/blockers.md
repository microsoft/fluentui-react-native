# Scrollbar blockers

Decision: **blocked**.

The current Scrollbar spec cannot be implemented as a pure agentic-components component without new native/platform support.

## Why it is blocked

- The spec depends on native scroll-container behavior (`usage.md`, `interaction.md`) and explicitly says the thumb should mirror native scrolling rather than own keyboard or wheel handling. That means the component needs live scroll metrics and platform scrollbar control, not just a visual slot.
- React Native’s public `ScrollView` API only exposes `showsVerticalScrollIndicator`, `showsHorizontalScrollIndicator`, `indicatorStyle` (`default` / `black` / `white`), and `scrollIndicatorInsets` (`react-native/Libraries/Components/ScrollView/ScrollView.d.ts`). It does **not** expose the tokenized thumb thickness, radius, or overlay fade behavior described in `SPEC.md` and `tokens.yaml`.
- The spec’s show/hide and drag-to-scroll behavior in `interaction.md` requires scroll-start, scroll-idle, and pointer-capture hooks. Those are not available as cross-platform agentic-components primitives today; implementing them would require a native host component or platform-specific bridge code.

## Classification

If this is ever implemented, it should be treated as a **higher-order component**, not a primitive, because it owns token-driven appearance and scroll-state behavior.

## Needed before implementation

1. A concrete public API for the scroll source/container and live scroll metrics.
2. A native or platform-specific scrollbar host that can control thumb geometry, visibility, and drag interaction.
3. Updated spec props and tests that match the actual supported platform API.
