# Link blockers

## Classification

- **Component shape:** higher-order / interactive text control
- **Pure React Native feasibility:** partial in principle, but blocked for the authored contract
- **Current task status:** blocked

## Analysis

Reviewed:

- `specs/link/SPEC.md`
- `specs/link/accessibility.md`
- `specs/link/interaction.md`
- `specs/link/usage.md`
- `specs/link/tokens.yaml`
- canonical `src/components/button/*`
- canonical `src/primitives/icon/*`

## Blockers

1. **The authored underline contract cannot be expressed faithfully with stable RN text styles.**
   - The spec requires underline style, thickness, and offset to vary by type set and state.
   - React Native 0.81 text styling supports underline color/style/line, but not the authored thickness/offset controls needed to match the spec exactly on Windows/macOS.

2. **The authored web-style navigation contract is not native RN behavior.**
   - `href`, `target="_blank"`, `rel="noopener noreferrer"`, copied-link affordances, and visited-state semantics are web concepts.
   - A pure RN control can approximate navigation with `Linking.openURL`, but it cannot provide full native anchor behavior or the exact browser semantics the spec describes.

3. **Inline body-text behavior needs text-native rendering.**
   - The spec requires inline links to behave like part of a text run.
   - That clashes with a simple pressable container approach and would need a text-native implementation path that still does not solve the underline geometry gap above.

## Result

Keep the `specs/link` files unchanged for now. Revisit implementation only if the authored contract is relaxed to accept RN approximations or the missing text-decoration support becomes available.
