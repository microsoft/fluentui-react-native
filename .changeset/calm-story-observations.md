---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/storybook-desktop': patch
---

Add bounded, service-local story selection timings and per-case execution/lifecycle observations without changing authenticated readiness, preview remounts, or worker/session isolation. Part of #4435.

Use authenticated direct navigation for driver-owned story selection and cache complete extracted test maps by source content within the owning run. Preserve normal args support, protected args refusal, manifest-digest verification, and the legacy HTTP default for direct library consumers.
