---
"@fluentui-react-native/callout": patch
"@fluentui-react-native/components": patch
"@fluentui-react-native/focus-zone": patch
"@fluentui-react-native/native-core": patch
---

Add package-owned agent guidance, user entry points, and indexed references to
components and native-core. The agentic component recipes and contract source
adapters move into the components package, the desktop focus plan is replaced
by `references/remaining-work.md`, and both packages publish their guidance.
Components now restricts published contents with a `files` allowlist, and the
callout and focus-zone shims link to native-core's architecture reference.
