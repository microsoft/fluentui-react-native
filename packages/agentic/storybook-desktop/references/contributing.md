---
id: storybook-desktop.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Contributing

Configuration and platform adapters live under `src/config/`; manifest
extraction and target identity live under `src/driver/`; command lifecycle
and service ownership live under `src/cli/`; CSF callback extraction and worker
execution live under `src/testing/`.

Keep story callbacks statically extractable and authentication checks
fail-closed. Update references when commands, supported config, outputs, or
readiness contracts change.

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` from this
package. Validate static manifests and the affected app's bundle/native smoke
when changing runtime behavior.
