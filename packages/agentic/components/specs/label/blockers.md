# Label blockers

## Classification

- **Component kind:** higher-order component, not primitive.
- **Pure React Native feasibility:** **blocked**.

## Why blocked

The spec requires native HTML label semantics:

- a real `<label>` element
- a `for` attribute pointing at the associated control `id`
- `aria-labelledby` fallback wiring from control to labeling node

Those semantics are not available in pure React Native for Windows/macOS. The requested behavior is therefore not implementable without changing the contract away from web-native label association.

## Contract implications

The spec also requires:

- weight / size variants
- disabled visual state
- required asterisk slot
- token-driven typography and color
- label-to-control accessibility guarantees

That makes this a styled, stateful form component, not an unstyled primitive.

## Integration needs

To unblock implementation, the contract must be rewritten for React Native-native association, for example by:

- defining the control association mechanism explicitly for RN
- replacing web `<label for>` requirements with an RN-supported accessibility contract
- clarifying whether the component is purely visual or must participate in a form-field composition

Until that contract is changed, implementation should not proceed.
