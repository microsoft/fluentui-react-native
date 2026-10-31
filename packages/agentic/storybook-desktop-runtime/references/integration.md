---
id: storybook-desktop-runtime.integration
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop-runtime
---

# Runtime integration

The app directly depends on `@fluentui-react-native/storybook-desktop-runtime`
and its React Native/Storybook peer packages. The CLI package remains
peer-free. Consumers use the runtime app and preview factories through the
Storybook integration; do not recreate app identity, native test IDs, or
generated runtime config in the consumer.

The package exposes its native entry and `./metro` config. The Metro config
may generate a polyfill when loaded. Use the owning app's declared scripts and
do not import this config as a supposedly side-effect-free inspection step.

App-specific identity, story package discovery, platform exclusions, and test
ID prefix remain in the consuming app's config and `app.json`.

For general desktop target setup, use the configuration guide from
`@fluentui-react-native/desktop-test`. The Storybook CLI and story discovery
belong to `@fluentui-react-native/storybook-desktop`.
