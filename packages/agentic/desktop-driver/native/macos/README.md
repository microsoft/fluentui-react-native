# macOS native provider

The macOS provider is a source-built Swift helper for macOS 14 or later on
Apple Silicon. It implements the private FDR1 protocol over stdio and uses
public macOS APIs for application identity, accessibility, physical input, and
capture.

The helper is a minimal `LSUIElement` agent app with bundle identifier
`com.microsoft.fluentui-react-native.desktop-driver`. It is unsandboxed because
App Sandbox is incompatible with automating arbitrary applications through
Accessibility.

## Source layout

| Source                                 | Responsibility                                                              |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `Package.swift`                        | macOS 14 executable target and framework links                              |
| `Sources/DesktopDriverHost/main.swift` | Helper modes and top-level error handling                                   |
| `Host.swift`                           | FDR1 hello, request queue, framing, cancellation, and disposal              |
| `Driver.swift`                         | Command dispatch, capability reporting, and physical-input scopes           |
| `Application.swift`                    | Launch/attach leases, exact process/window identity, and ownership          |
| `Accessibility.swift`                  | AX tree walking, lookup, snapshots, focus, hit testing, actions, and source |
| `Input.swift`                          | Quartz pointer, keyboard, text, wheel, ledger, and recovery behavior        |
| `InputLock.swift`                      | Per-user cross-process physical-input lock and abandoned-owner recovery     |
| `Capture.swift`                        | ScreenCaptureKit window capture, element crop, scale, and PNG encoding      |
| `Permissions.swift`                    | TCC preflight/prompt diagnostics and Security.framework signing evidence    |
| `Session.swift`                        | Login-session lock and console diagnostics                                  |
| `Support.swift`                        | Errors, cancellation, JSON helpers, deadlines, and AX utilities             |
| `SelfTest.swift`                       | Provider-local framing, identity, AX, input, capture, and permission checks |

The Node build coordinator is
`../../src/native/macos/buildMacOSDriver.ts`; runtime adaptation is under
`../../src/hosts/native`.

## Build

Requirements:

- macOS 14 or later;
- Apple Silicon (`arm64`);
- Xcode and its Swift command-line tools;
- Node 22.19 or later for the package CLI.

Build the package and helper:

```sh
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver exec \
  desktop-driver build-driver --platform macos
```

Installed consumers can use the shorter command:

```sh
desktop-driver build-driver --platform macos
```

The coordinator:

1. hashes only `Package.swift`, optional `Package.resolved`, and Swift files
   beneath `Sources`;
2. stages those inputs into an isolated scratch root outside the package;
3. invokes `swift build` for arm64 macOS 14;
4. assembles `FurnDesktopDriverHost.app` with a generated `Info.plist`;
5. strips path-dependent local symbols from release output;
6. signs and verifies the app;
7. performs the one-shot helper handshake;
8. publishes the complete verified bundle to the immutable native cache.

SwiftPM `.build`, DerivedData, editor files, and other generated output never
participate in source identity or staging.

## Signing

### Stable development signing

Use a stable identity whenever Accessibility or Screen Recording authorization
must survive ordinary source rebuilds:

```sh
security find-identity -v -p codesigning

desktop-driver build-driver \
  --platform macos \
  --macos-signing-identity "Apple Development: Developer Name (TEAMID)"
```

The option accepts an identity name or SHA-1 hash. It can also be set through:

```sh
export FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="Apple Development: Developer Name (TEAMID)"
```

An Apple Development identity is preferred. A contributor without an Apple
account can create one reusable local self-signed **Code Signing** certificate
with Keychain Access Certificate Assistant and trust it for code signing. Do
not recreate the certificate for every build: the leaf-certificate hash is part
of the compatibility identity and authorization continuity.

Certificate-signed builds use Hardened Runtime and a secure timestamp. Artifact
verification compares the actual bundle against the recorded:

- leaf-certificate SHA-1 hash;
- signing authority and identity;
- team identifier when present;
- designated requirement;
- Hardened Runtime state;
- timestamp policy;
- executable and source identities;
- FDR1 handshake.

A helper signed by an unexpected identity fails closed.

### Ad hoc signing

If no identity is configured, the coordinator applies a deterministic ad hoc
signature with no secure timestamp and emits a warning. This path supports
contributor builds but privacy grants can bind to a changing cdhash and may
need to be granted again after a rebuild.

Ad hoc signing is not a distribution model. The current source does not
implement a Developer ID distribution or notarization pipeline. If an
organization-distributed helper is added, its external release infrastructure
must apply Developer ID Application signing, Hardened Runtime, a secure
timestamp, notarization, and stapling. That optional work is tracked in
[microsoft/fluentui-react-native#4345](https://github.com/microsoft/fluentui-react-native/issues/4345).

## Helper lifecycle

Supported modes:

```text
furn-desktop-driver-host --handshake --json
furn-desktop-driver-host --stdio
furn-desktop-driver-host --self-test
furn-desktop-driver-host --permissions [--prompt]
furn-desktop-driver-host --release-input [--sweep]
```

The long-lived `--stdio` process:

1. emits a verified macOS/arm64 FDR1 hello;
2. processes one command at a time on its worker queue;
3. handles correlated cancellation before accepting later side effects;
4. holds a per-user `flock` while physical input is active;
5. releases tracked keys and buttons on failure, cancellation, and disposal;
6. exits after `dispose`.

The input lock lives beneath
`~/Library/Caches/com.microsoft.fluentui-react-native.desktop-driver`, so
helpers started through different Aqua bootstrap namespaces still serialize
physical input. Restricted `--release-input` accepts only the Node-owned ledger.
`--sweep` is an operator recovery diagnostic, not normal cleanup.

## Application and window identity

The helper uses server-owned `bundleIdentifier`, `executablePath`,
`windowTitle`, and optional launch arguments. An owner-generated attach lease
can additionally carry:

- a nonce;
- endpoint identity;
- PID and process launch time;
- executable and bundle identity;
- exact window identity.

Attach validates every supplied field against the live application. Lease
timestamps allow only the bounded precision required by
`NSRunningApplication.launchDate`. Zero or ambiguous application/window matches
fail.

Launch honors an explicitly configured `launchTimeoutMs`, or uses the native
90-second default within the server's 120-second default deadline. If LaunchServices
completes after timeout or cancellation, the late completion closes only a
new application causally owned by that request, never a preexisting app.
On October 22, 2026 (UTC), the helper built, handshook, and self-tested on
macOS, and real FluentTester launches with a configured 180-second timeout
succeeded. The late-completion branch remains covered only by code review.

Leases record whether the app was launched or attached. Session deletion
preserves attached apps and closes only an exact process owned by the helper.
Opaque helper IDs represent windows and AX elements; native references never
cross the public WebDriver boundary.

An AX result must be a real `AXWindow` or `AXSheet`. The provider rejects an
`AXApplication` placeholder even if `AXIsProcessTrusted()` is true. It checks
the windows, main-window, and focused-window attributes, refreshes replaced
window identities, and uses CoreGraphics only as a uniquely correlated geometry
fallback. Listing windows requires a readable `AXWindows` result and
role-verified candidates; a focused or main window missing from `AXWindows`, as
happens briefly while key status settles after a popup closes, is listed as a
candidate instead of failing. Attaching by title still requires every fallback
window to appear in `AXWindows` so uniqueness can be proven. Transient
enumeration failures are retried for up to one second, or up to three seconds
while window notifications are still arriving, before they are reported. A
tracked window that Accessibility reports destroyed is no longer listed.

## Window events and command journal

Each observed application has an `AXObserver` on a dedicated run-loop thread,
so notifications arrive while the worker thread executes commands. The monitor
records window created, destroyed, focused-window, main-window, minimize, and
application activation notifications in a 512-entry ring. Live window events
carry a descriptor read when the notification arrives: role, subrole, role
description, identifier, title, frame, parent, child count, and the matching
WindowServer window's number, layer, alpha, on-screen state, and name.
Activation events record which application owns system-wide keyboard focus.
Destroyed notifications for tracked windows close them and publish the FDR1
`window-closed` event.

A 128-entry command journal records each helper command's start, duration,
outcome, and window or element identifiers on the same monotonic clock. It
never records text, values, or native handles. Activation annotates its entry
with the method used, elapsed time, and the previously focused application.
The `windowEvents` command returns both logs with `ageMs` values for
`furn/window-events` and failure evidence. Both are diagnostics only.

Descriptor reads set a messaging timeout on the notification's own element.
Never set one on the system-wide element: `AXUIElementSetMessagingTimeout`
applies a system-wide timeout to every Accessibility request in the process.

## Accessibility and input

The AX provider supports:

- lookup by React Native `testID`, normalized role, accessible name, and text;
- bounded tree/source generation;
- snapshots with explicit supported/unsupported state;
- active element, focus, hit testing, clear, and accessibility activation;
- the action names an element publishes (`accessibilityActions`), including authored custom actions;
- primary and secondary application windows.

AppKit omits `AXEnabled` from elements that have no disabled state, and React
Native macOS Paper views publish it only when `accessibilityState.disabled` is
set. The provider therefore reports `enabled: true` when an element's attribute
list does not contain `AXEnabled`, matching how assistive technologies treat
it. An element that lists `AXEnabled` without a readable value still reports
an unsupported enabled state. Fabric views always publish the attribute.

The `accessibilityActions` command reads `AXUIElementCopyActionNames` for a live
element; an element whose actions are unsupported yields an empty list. AppKit
lists an `NSAccessibilityCustomAction` as
`Name:<name>\nTarget:<address>\nSelector:<selector>`, so the provider returns
only `<name>` and no process address or selector leaves the helper. Standard
actions pass through unchanged. React Native macOS Fabric publishes each declared
action by `name` (`Toggle`, `Select`), whereas Paper publishes only actions that
declare a `label` and names them by it (`C-A11Y-007` in
`accessibility.action-transport-evidence`). The command lists actions only and
never performs one.

Quartz Event Services supplies physical pointer, keyboard, text, and wheel
input. Physical input requires Accessibility/PostEvent authority for the
responsible process and an unlocked interactive Aqua session. Missing authority
returns `input-unavailable`; the provider never substitutes unrelated
accessibility activation and reports physical success.

A locked screen or a login session that is not the active console prevents
applications from publishing complete accessibility windows and from receiving
physical input. Launch, attach, window discovery, and new pointer, keyboard,
text, or wheel input check the login session and fail immediately with
`input-unavailable` and a `session` diagnostic instead of retrying into a
window-enumeration error. Key and button releases remain allowed so recovery
can complete while the session is locked.

Activation sets the application's `AXFrontmost` attribute, which a trusted
client applies immediately, and falls back to `NSRunningApplication.activate`
only if that fails. Cooperative workspace activation was observed to wait about
a second for the active application to yield. Activation completes when the
application reports `AXFrontmost` and the primary window reports `AXMain`;
a timeout names the application that kept keyboard focus.

A physical click first hit-tests its target. When another element owns the
point, `element click intercepted` names the occluding element, or the external
application and process that own it.

React Native macOS does not move keyboard focus on ordinary mouse-down. Portable
tests should assert the platform's actual activation behavior rather than
copying a Windows focus expectation.

Keyboard and pointer events carry modifier flags derived from the helper's
pressed-key ledger, including left/right Shift, Control, Option, and Command.
Do not rely on the OS having processed a previously posted modifier event:
fast W3C sequences such as Shift+Tab must retain their chord deterministically.
Release and recovery paths update the ledger after each emitted keyup.
Repeated keydowns are still posted but do not add another held physical key.
Aliases for the same key share one entry; left and right modifiers remain
independent. One release must remove that physical key from later keyboard and
pointer flags.

## Capture

ScreenCaptureKit captures a uniquely correlated application window and encodes
PNG output through ImageIO. Element screenshots crop the window image using the
matched AppKit display's backing scale factor. Retina output therefore reports
pixel dimensions and `scaleFactor` separately from point geometry.

Screen Recording permission is degradable. Without it, the helper does not
advertise screenshot capabilities, while AX and input automation can continue
when their own authority is present. Capture fails explicitly when:

- Screen Recording permission is absent;
- the target is minimized or off-screen;
- ScreenCaptureKit cannot uniquely correlate the AX window;
- crop geometry is empty or outside the capture.

The provider does not implicitly restore or move a window to make capture pass.

## Privacy permissions and diagnostics

Inspect the exact verified helper without prompting:

```sh
desktop-driver doctor --platform macos --permissions
```

The versioned JSON reports:

- helper PID, parent PID, executable, and app bundle;
- Accessibility trust;
- PostEvent preflight state;
- Screen Recording preflight state;
- cdhash, signer, team identifier, and designated requirement when
  Security.framework exposes them;
- the login session: whether it is on the console, finished logging in, and
  locked, read from `CGSessionCopyCurrentDictionary`;
- whether each value is available and whether this mode can prompt for it.

Values that cannot be read are marked unavailable rather than inferred.
`PostEvent` is preflight-only in this mode and cannot be prompted.

Prompt deliberately and interactively:

```sh
desktop-driver doctor --platform macos --permissions --prompt
```

Only this mode may request Accessibility and Screen Recording access. Build,
resolve, ordinary doctor, handshake, self-test, stdio, and normal service
startup never request privacy permission. Restart the helper after changing
Screen Recording access.

V1 starts the helper directly as a child of Node. macOS can therefore attribute
privacy-sensitive work to Terminal, an IDE, or another responsible parent in
that process tree. Interpret `parentPid`, signing evidence, and all preflight
fields together. A `true` preflight value alone does not prove that the helper
bundle owns the grant.

A prior qualification experiment launched the helper app externally through
LaunchServices and gave that experimental process a distinct TCC identity. The
checked-in runtime does not use that path: it starts the helper directly from
Node. The experiment did not make AX window publication more reliable, so V1
retains direct spawn and defers a persistent broker until evidence demonstrates
an authority or reliability benefit. LaunchServices is still used normally
when the helper launches a target application.

First use `doctor --permissions` and determine which process macOS treats as the
responsible TCC subject. Only then, for manual reset-and-reprompt diagnosis of a
grant that actually belongs to the helper bundle, macOS supports:

```sh
tccutil reset Accessibility com.microsoft.fluentui-react-native.desktop-driver
tccutil reset ScreenCapture com.microsoft.fluentui-react-native.desktop-driver
tccutil reset PostEvent com.microsoft.fluentui-react-native.desktop-driver
```

Do not run these commands as a generic fix. A bundle-scoped reset affects only
the actual TCC subject; if responsibility belongs to Terminal, Node, or an IDE,
the commands above do not reset that grant. Resetting a parent application's
grant can affect unrelated automation, so follow the owning environment's
policy. Never edit `TCC.db`, disable SIP, or use undocumented responsibility
APIs.

## Tests

Run portable package checks:

```sh
yarn format
yarn lint
yarn build
yarn test
```

Run the real native build/cache/handshake/self-test contract:

```sh
FURN_NATIVE_DRIVER_TEST=1 yarn test --runInBand
```

Include stable-signature coverage:

```sh
FURN_NATIVE_DRIVER_TEST=1 \
FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="<identity>" \
  yarn test --runInBand
```

The Swift self-test covers framing, JSON, input ledger and lock recovery,
capture scaling, snapshot normalization, AX diagnostics, CoreGraphics fallback
classification, custom AX action name parsing, permission and login-session diagnostics, and hello identity. The Node native
contract additionally builds, verifies, reuses, and directly resolves the app;
starts the actual long-lived process; and exercises malformed-frame recovery.

Native contract tests do not prove TCC authority against a real app. Real
qualification must attach to a built React Native macOS application and cover
AX identity, authored interactions, secondary windows, Retina crops,
permission denial, helper restart, and ownership-safe cleanup.

## CI

Authoritative macOS automation uses a managed, self-hosted Apple Silicon Mac
with:

- an auto-logged-in Aqua user;
- a stable code-signing identity;
- Accessibility and PostEvent approval for the actual responsible process;
- an MDM PPPC policy where organization policy permits;
- serialized physical input;
- access-controlled evidence retention.

Do not run the helper through `sudo`, a daemon, or an SSH-only session.
Screen Recording can remain optional for non-capture tests when it cannot be
preauthorized; screenshot-required tests should report a capability skip.
Semantic or input tests must fail when their required authority is absent.

GitHub-hosted macOS smoke is useful regression signal, but it is not
authoritative proof of first-run or durable TCC authorization. The checked-in
package does not implement Developer ID/notarization release infrastructure or
managed PPPC deployment. Those items, clean-machine
install/upgrade/rollback, and explicit permission-revocation qualification
are tracked in
[microsoft/fluentui-react-native#4345](https://github.com/microsoft/fluentui-react-native/issues/4345).

## Troubleshooting

| Symptom                                       | Action                                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `no-verified-prebuilt`                        | Build once or restore the matching signed cache; `doctor` never builds                                   |
| Signature or designated-requirement mismatch  | Select the intended identity, rebuild, and do not mutate cached output                                   |
| Accessibility true but no real AX window      | Preserve diagnostics, restart/retry the app and helper, and do not accept an `AXApplication` placeholder |
| Physical input unavailable                    | Grant the actual responsible process Accessibility/PostEvent access and use a logged-in Aqua session     |
| Screen locked or session not on console       | Unlock or switch to the session, confirm `session` in `doctor --permissions`, and retry                  |
| Screen capture unavailable                    | Grant Screen & System Audio Recording, restart the helper, and rerun noninteractive doctor               |
| Ambiguous application or window               | Correct the registered identity or owner lease; never choose the first match                             |
| Input lock reports an abandoned owner         | Ensure the prior process is gone, use the verified helper's release mode, then retry                     |
| Element becomes stale after a Storybook reset | Resolve it again in the new preview generation                                                           |
| Unexpected extra window after a popup closes  | Read `failure-window-events.json` and `failure.png`; a focused `AXSheet` can be an app error overlay     |
| Activation is slow or fails                   | Check the `activate` journal entry's `method`, `elapsedMs`, and focused application                      |

See [Native helpers](../../references/native-helpers.md) for cache and
resolution policy, [CI integration](../../references/ci-integration.md) for
cross-platform gates, and [Security](../../references/security.md) for the
service trust boundary.

## Apple references

- [Inside Code Signing: Requirements](https://developer.apple.com/documentation/technotes/tn3127-inside-code-signing-requirements)
- [Accessibility API](https://developer.apple.com/documentation/applicationservices/axuielement)
- [Quartz Event Services](https://developer.apple.com/documentation/coregraphics/quartz-event-services)
- [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit)
- [Resetting access to protected resources](https://developer.apple.com/documentation/xcode/resetting-access-to-protected-resources-in-macos)
- [Privacy Preferences Policy Control](https://support.apple.com/guide/deployment/privacy-preferences-policy-control-payload-dep38df53c2a/web)
