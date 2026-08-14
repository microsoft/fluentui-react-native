# Textarea blockers

## Classification

- **Component shape:** HOC / atomic control, not a primitive.
- **Pure RN feasibility:** **blocked as written**.

## Why it is blocked

1. **The spec depends on CSS `resize`.**  
   `specs/textarea/interaction.md` and `specs/textarea/tokens.yaml` define `Resize` as `none | vertical | both` and describe a native resize handle that appears when `resize` is not `none`. React Native `TextInput` on macOS/Windows does not expose a cross-platform `resize` property or a native handle contract that matches this spec.

2. **The accessibility contract is web-native, not RN-native.**  
   `specs/textarea/accessibility.md` is written around native `<textarea>` semantics, `aria-multiline`, and ARIA state mirroring. RN can approximate accessibility state, but it does not provide the same native textarea element or resize behavior.

3. **No existing agentic TextInput pattern is available to extend.**  
   The current package canon is `Button` for HOC authoring and `Icon` for primitives. Those patterns cover slot/state composition, but they do not include a ready-made React Native multiline text control with the required resize semantics.

## What would unblock this

- Decide whether Textarea should be:
  - a **platform-native RN approximation** that drops exact resize-handle parity, or
  - a **web/CSS implementation** instead of a pure RN control.
- If the native approximation is acceptable, update the spec to explicitly allow the missing resize-handle parity and define the expected behavior for macOS/Windows `TextInput`.
