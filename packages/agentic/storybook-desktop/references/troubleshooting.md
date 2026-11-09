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

For `driver --agent`, a readiness timeout means the channel service did not
publish the connection: inspect the `storybook-channel` log. Publication needs
the verified native helper and an owner-only storage root. A macOS lease
warning naming more than one running application means another instance with
the same bundle identifier is open; leases resume once only one remains. The
app's runtime bridge does not reconnect, so after restarting the driver,
relaunch an app left running; until then story renders report
`story-not-ready`. Quit the app first: on macOS, `run` only reactivates an
instance that is already open.

On Windows and Win32, an agent `open` that cannot find the application means
the agent identity names a different build: rebuild and register the app, then
restart the driver. A Windows Debug app that shows "bundler is not running" or
leaves stories at `story-not-ready` is not reading the driver's Metro; it loads
from port 8081, so stop whatever else holds that port before `driver --agent`.
Physical input can be refused with `window-activation-failed`, "The target
window did not become the foreground window: …" (rejected, no effect). The
message names the foreground holder by opaque handle and process id and the
cause: an elevated window, a window that is not responding, another window of
the app, or a lost foreground (lock, disconnect, or secure desktop). Address
that window and retry, or use the semantic `activate` action. A physical click
is not retried automatically.

On Windows Fabric, only `smoke` writes the application lease that WDIO sessions
verify, so `storybook test --windows` fails with "Opening the application lease
file failed" against a separately launched app. Run
`STORYBOOK_SMOKE_STORY=<story-id> yarn storybook smoke --windows --mode
stories-and-tests` and read the selected callbacks in its `run.json`.

For macOS CocoaPods codegen failures, rerun the documented `prep` stage once
when ReactCodegen has a stale generated source list; diagnose the first
actionable error before editing configuration.
