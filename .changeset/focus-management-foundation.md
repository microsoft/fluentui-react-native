---
"@fluentui-react-native/framework-base": minor
"@fluentui-react-native/design": minor
"@fluentui-react-native/components": minor
"@fluentui-react-native/storybook-desktop-runtime": patch
"@fluentui-react-native/storybook-desktop": minor
---

Add ref-backed focus targets and cancellable focus requests, shared focusable pressable behavior, live focused-owner modality subscriptions, and shared-controller popup input boundaries. Migrate agentic components and commit TabList eligibility before requesting native focus. Preserve native activation, adapt unidentified Win32 key codes without duplicate presses, and expose Toggle/Select accessibility actions. Add owned targeted native focus qualification through smoke story/tag selectors.

Keep the focusable pressable implementation native-only so React-only Framework Base consumers can load the generic entrypoint without importing the React Native runtime.
