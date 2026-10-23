---
id: storybook-desktop.troubleshooting
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Troubleshoot Storybook Desktop

Triage by failure boundary:

1. **Manifest/extraction:** regenerate the platform manifest; identify the
   invalid dynamic story or callback.
2. **Native helper/app:** run `desktop-driver doctor`, then verify app identity
   and renderer. Do not edit generated products.
3. **Services/Metro:** inspect the reported instance and owned command logs.
4. **Readiness:** verify the authenticated nonce, correlated request, and
   native story root.
5. **Test result:** distinguish an assertion failure, explicit capability
   skip, unsupported operation, and incomplete run.
6. **Evidence/cleanup:** inspect the complete canonical run directory; preserve
   the primary failure if capture or cleanup also fails.

For macOS CocoaPods codegen failures, rerun the documented `prep` stage once
when ReactCodegen has a stale generated source list; diagnose the first
actionable error before editing configuration.
