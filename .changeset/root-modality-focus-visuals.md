---
"@fluentui-react-native/components": minor
---

Add useFocusVisuals and shared focus-ring styling, and migrate focusable components to optional FocusRing state slots. Windows and macOS default to native rings; Win32 defaults to keyboard-modality-aware custom rings. The hook supports native-ring overrides and always-visible focused custom rings. Component scenes now require ThemedRoot, and unstable state no longer carries focusVisualProps or Checkbox's local focusVisible flag.
