# MessageBar blockers

## Classification

- **Component shape:** higher-order / composed
- **Pure React Native feasibility:** partial

## Analysis

I reviewed:

- `specs/message-bar/SPEC.md`
- `specs/message-bar/usage.md`
- `specs/message-bar/interaction.md`
- `specs/message-bar/accessibility.md`
- `specs/message-bar/tokens.yaml`
- canonical `src/components/button/*`
- canonical `src/primitives/icon/*`

## What is feasible

- The layout, text, dismiss control, action buttons, accessibility role, and parent-owned dismissal behavior are all implementable in React Native with the existing `Button` and `Icon` primitives.
- The component is clearly a composed/HOC surface, not a primitive.

## Blocker

- The authored spec requires four specific Fluent status icons, but this package does not contain a cross-platform icon asset/source mapping for them.
- The only icon primitive available here is codepoint/source driven, and the repository does not provide the corresponding status icon font family or SVG source set for Windows + macOS.
- Because this task scope forbids touching shared icon resources or other components, I cannot add the missing icon source without going out of bounds.

## Result

I could not fully implement MessageBar to the authored spec within the allowed scope. Leaving the spec companions in `specs/message-bar/` unchanged and blocking the build-out until a canonical cross-platform status icon source is available.
