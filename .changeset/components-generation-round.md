---
'@fluentui-react-native/components': minor
'@fluentui-react-native/framework-base': minor
'@fluentui-react-native/callout': minor
---

Add Label, Popover, RadioGroup, Toolbar, and a macOS-first Menu with reviewed React Native contracts,
explicit composition stages, native root refs, runtime/type coverage, and
executable desktop stories. RadioGroupItem and ToolbarButton preserve their
existing leaf components' externally driven selection and activation.

Extend shared accessibility action resolution for expansion/collapse and allow
partial slot-style overrides without rendering optional slots prematurely.

Add opt-in presentation-scoped Callout focus and guarded close behavior while
preserving legacy native defaults and the prebuilt Win32 transport. Native
endpoint qualification and the full macOS-first Menu family endpoint acceptance remain separately gated; Menu use on Windows
and Win32 is explicitly rejected pending platform admission. This change does
not claim complete catalog or production readiness.
