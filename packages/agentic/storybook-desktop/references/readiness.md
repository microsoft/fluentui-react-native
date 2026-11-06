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

Each socket receives a fresh connection epoch in a version-2 hello challenge.
The hello must echo that epoch and the manifest identity. Ready/error events
bind the epoch, request, run, and story; version-1 native markers additionally
bind the preview generation. Missing epoch or marker evidence is not readiness.
An old socket cannot authenticate or complete work on its replacement.

The local provider context carries the session lifetime ID and abort signal
separately from serializable inputs. No authenticated bridge means prompt
`bridge-unavailable`, with endpoint/renderer and effect `none`, before dispatch.
Selection waits for both HTTP navigation and correlated runtime readiness,
then the driver verifies the native marker within the same render deadline.
Disconnect promptly rejects pending work and aborts HTTP. Cancellation,
disconnect, or deadline after dispatch fences that socket and leaves the
effect unknown: the driver retains target quarantine. Late ready/error events
cannot release it. Subsequent requests return renderer-specific
`relaunch-required`; reauthentication is not quarantine recovery.

The app and runtime resolve `@storybook/react-native` **10.5.4**, with
`storybook` **10.6.3**, in the inspected installation. In those exact sources,
`dist/index.js` installs the server channel while constructing Storybook UI; Storybook's
`dist/channels/index.js` creates one WebSocket, emits `channelWSDisconnect`
on close, marks it closed, and drops later sends without reconnecting.
The React Native `dist/channelServer-D-IaG_dn.js` HTTP selection handler
broadcasts uncorrelated navigation and accepts story-ID render events;
aborting its HTTP client cannot retract the broadcast. Do not promise
transparent recovery or use HTTP completion as a render fence. Relaunch the
app when restarting the channel/driver against that running installation.
This is source evidence, not native endpoint qualification or a claim about
other dependency versions.

Do not patch generated identity or manifests. Change the app configuration or
manifest producer, regenerate, then validate the exact platform manifest.
Generated instance files remain under the consumer's ignored
`storybook-desktop.generated` and platform-specific state directories.
