---
'@fluentui-react-native/desktop-test': patch
---

Stop redacting short environment values such as `true` or `0` from command output. Variables named like a token, secret, password, nonce, or authorization header are only registered as secrets when their value is at least 8 characters long, so machine-readable output like `"delegated":true` is no longer rewritten to `[REDACTED]`.
