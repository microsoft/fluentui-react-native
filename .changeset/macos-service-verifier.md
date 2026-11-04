---
'@fluentui-react-native/desktop-driver': minor
---

Add the macOS service verifier: `describeMacOSService` and `createMacOSServiceVerifier` on the `/authority` entry, backed by a new one-shot `--service-identity` mode in the macOS helper that checks the process identity, audit session, and exclusive loopback listener before a credential is sent.
