---
'@fluentui-react-native/desktop-driver': patch
---

Report a macOS application that stops answering with a reason. A read that failed because the target did not respond used to reach callers as a bare `unknown error`. The helper now marks it with `data.reason` `target-non-response`, and Node keeps that reason and `nativeCode` `automation-failed` on the error, in the operation response, and in the session journal, so an agent can wait and retry instead of treating the request as wrong.
