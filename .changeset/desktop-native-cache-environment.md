---
"@fluentui-react-native/desktop-driver": patch
---

Treat empty native-driver environment settings as unset, and reject an explicitly empty cache path rather than writing to the working directory. Read Hardened Runtime from the CodeDirectory flags field when verifying signed macOS helpers.
