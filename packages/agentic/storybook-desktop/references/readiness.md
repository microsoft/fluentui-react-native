---
id: storybook-desktop.readiness
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Manifest and runtime readiness

The generated manifest binds app identity, platform, renderer, target, story
catalog, and test plan. Static plans must be portable, deterministic, and
serializable; invalid or dynamic plans fail generation rather than silently
disappearing. The manifest records exact-platform and portable-plan digests.
Legacy `parameters.desktopDriver` plans remain supported for compatibility;
new story test authoring uses `wdio` callbacks.

The runtime bridge authenticates readiness with a private nonce and correlates
instance, target, request, run, catalog, digest, and preview generation. The
selected native story root must be verified before tests run. Only the
authenticated bridge can complete or fail navigation; ignore uncorrelated
channel events.

At startup, require both an authenticated runtime hello and the initial
`storyRendered` event on the same connection. The hello alone can precede
Storybook's navigation handlers after an app restart. Startup render readiness
does not replace request-correlated readiness for each requested story.

Do not patch generated identity or manifests. Change the app configuration or
manifest producer, regenerate, then validate the exact platform manifest.
Generated instance files remain under the consumer's ignored
`storybook-desktop.generated` and platform-specific state directories.
