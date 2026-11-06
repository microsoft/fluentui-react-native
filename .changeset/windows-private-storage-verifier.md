---
'@fluentui-react-native/desktop-driver': patch
---

Add a Windows owner-only private storage adapter and service identity verifier for private connection descriptors. `createWindowsPrivateStorage`, `describeWindowsService`, and `createWindowsServiceVerifier` call two new restricted one-shot modes of the Windows helper, `--private-storage` and `--service-identity`. The storage mode checks the owner, the protected DACL, the ancestors, reparse points, hard links, the volume, and the pinned root identity from open handles, and publishes without replacing a record. The verifier mode checks the live process start time, executable, user, and interactive session and that the claimed process alone owns the loopback listener, so a credential is sent only to a verified service. Adds native self-tests and opt-in `privateStorage` and `serviceIdentity` native contracts.
