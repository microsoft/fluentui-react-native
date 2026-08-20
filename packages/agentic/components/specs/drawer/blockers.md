# Drawer blockers

## Classification

- **Component kind:** HOC, not primitive.
- **Pure React Native fit:** **does not fully satisfy the contract**.

## Blocking issues

1. **Focus trap over arbitrary drawer body content**
   - The spec requires Modal/Alert drawers to trap focus, and the drawer body accepts arbitrary children.
   - Pure RN does not provide a built-in focus-trap/FocusZone primitive that can enumerate and cycle through unknown descendants across Windows/macOS.
   - Source: `specs/drawer/interaction.md`, `specs/drawer/accessibility.md`.

2. **Return-focus-to-trigger is not self-contained**
   - The contract requires focus to return to the element that opened the drawer.
   - The drawer spec does not define a trigger ref / return-focus target prop, and the trigger lives outside the component boundary.
   - Pure RN cannot reliably infer or restore focus to an arbitrary opener without additional platform or parent-owned focus plumbing.
   - Source: `specs/drawer/interaction.md`, `specs/drawer/accessibility.md`.

3. **Modal/Alert semantics depend on platform focus behavior**
   - `aria-modal`, `dialog`, and `alertdialog` are available, but they do not by themselves enforce the modal keyboard contract.
   - The spec also requires Escape handling, scrim dismissal rules, and seamless overlay/inline reflow while preserving focus state.
   - That combination needs either native/platform focus management or an explicit higher-level focus controller contract.
   - Source: `specs/drawer/interaction.md`, `specs/drawer/usage.md`, `specs/drawer/accessibility.md`.

## Conclusion

Drawer should remain specified here until the implementation contract adds a supported focus-management path or uses platform-native focus trapping. Moving it to `src/` would overstate what pure RN can guarantee today.
