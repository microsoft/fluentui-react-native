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

Console output summarizes each step as one header, such as `✔ pod install (42s)`
or `✖ rnx-cli build (4m 03s): exit code 65`. A failed step prints the end of its
log and a `Full log:` path; the complete output of every step is under the run's
`commands/` directory, and `--verbose` streams it live. In a smoke run, read the
`Story tests` header: `N of M story tests executed` says how many of the M
tests reached ran, and the counts after the colon account for the rest as
skipped or unsupported. A run that stops at its first failure adds
`(stopped early; K of S stories not run)`. `no story tests executed (0 of M)`
means none ran, even if nothing failed.

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
Physical input to a host started from a background process can be refused with
"The target window did not become the foreground window" (rejected, no effect);
bring the window forward, or use the semantic `activate` action.

For macOS CocoaPods codegen failures, rerun the documented `prep` stage once
when ReactCodegen has a stale generated source list; diagnose the first
actionable error before editing configuration.
