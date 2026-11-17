---
id: storybook-desktop.windows
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Storybook on Windows

Use `prep`, `bundle`, `build`, and `smoke` through the app's `storybook`
script. Project generation and native registration are generated outputs; fix
the owning config or script rather than generated solutions.

Configure smoke with `createWindowsSmokeOptions`. Windows Fabric uses Metro
port 8081 and refuses an occupied port before build/registration/launch.
The neutral supervisor owns services and their cancellation/cleanup. Its
channel resource retains the native-launched app and protected attach lease.
After story traversal and session deletion it disposes that channel/app
generation, launches a fresh one, and verifies the first manifest story before
authored tests; Metro stays warm. An uncertain native close or changed private
lease is a cleanup failure, never permission to signal an observed PID.
PowerShell is limited to the package/framework registration leaf and must not
unregister or terminate an existing application. Registration must verify this
build's install location; a shared package identity must not silently launch
another checkout.

CI builds and diagnoses the native helper before app preparation, then pins
resolution to the verified artifact. GitHub-hosted runners are not physical
input qualification environments; report disabled input as a skip, not a
native pass.

Keep app-specific story exclusions in the consumer's `desktop.config.mts`.
Use the target-scoped desktop-driver capture path for native evidence.
