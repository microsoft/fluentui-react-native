---
'@fluentui-react-native/desktop-driver': patch
---

Add versioned private connection descriptors, a macOS owner-validated storage
adapter, and grant support for connected, attached, and WDIO-managed clients.
Descriptors require a trusted live service identity verifier before sending a
credential, then verify the authenticated service incarnation. Storage rejects
unsafe permissions, ACLs, links, oversized records, and replacement of existing
records; the macOS adapter explicitly rejects unsupported platforms, including
Windows, which has its own adapter. Protected client transports
reject redirects and keep grants out of serialized WDIO options. Extend the
gated native-helper contract to exercise the protected service boundary.
