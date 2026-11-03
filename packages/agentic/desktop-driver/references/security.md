---
id: desktop-driver.security
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Security model

Desktop Driver controls a real interactive desktop. Its V1 security boundary is
a trusted local supervisor, a loopback-only service, pre-registered targets,
verified native helpers, and confined evidence. It is not a remote automation
service.

## Service boundary

- `createDesktopDriverServer` accepts only loopback hosts.
- Browser-origin requests are rejected.
- A service started without an `authority` has no authentication and relies on
  the loopback binding and its trusted supervisor. A service started with a
  `DesktopAuthority` is protected (below). One service never serves both modes.
  There is no TLS or remote authorization.
- Clients can select only server-registered targets.
- Capabilities cannot provide executables, arguments, environment variables,
  helper paths, lease paths, cache roots, or artifact destinations.
- One active session may own a target.

Do not proxy, tunnel, container-port-forward, or expose the listener to another
machine. A remote deployment needs a separately designed authenticated
transport and target authorization model.

## Protected service

A service created with a `DesktopAuthority` requires a grant on **every**
route, including ordinary WebDriver routes, routes that do not exist, and
`/status`. Protecting only new endpoints would leave an ordinary-route bypass,
so authentication runs once in the request handler, after the `Origin` check
and before the body, route, or any session is read.

- A grant is a bearer token `fdg1.<id>.<secret>`: a 128-bit id that names the
  grant in ownership records, and a 256-bit random secret that authenticates.
  The authority keeps only a SHA-256 digest of each secret and compares it in
  constant time, doing the same work for an unknown id, so a heap snapshot or an
  accidentally serialized authority holds no usable credential.
- A missing, malformed, wrong-secret, revoked, or foreign-authority token is
  indistinguishable: HTTP 401 `unauthorized` with a constant message, an empty
  stack trace, `WWW-Authenticate: Bearer realm="furn-desktop-driver"`, and a
  closed connection so an unauthenticated caller cannot hold it open while
  streaming a body.
- A grant names the registered target ids it may open, or `*`. A target outside
  the grant behaves as one that is not registered, in `/status` and in
  capability matching. The service refuses to start when a grant names a target
  it does not register.
- A session belongs to the grant that created it. Every other grant gets the
  answer for an id that does not exist, and that check runs before the command
  queues, so a grant can neither probe for another grant's session nor wait in,
  or delay, its queue.
- A grant's label (1-32 letters, digits, and `._:-`) is the only holder
  information a contending grant learns, in `session not created` data
  `{ reason: 'target-busy', holder: { label, since } }`. Grant ids, secrets,
  session ids, and the session id inside a quarantine never reach another
  grant. Choose labels that say what the holder is (`agent`, `wdio`), not who
  or where.
- Revoking a grant closes every session it owns, including one still
  launching, so a session nothing can address does not hold a target. A session
  that fails to close stays tracked, and shutdown retries it.
- Grants and the service `incarnation` that `/status` reports as
  `service.incarnation` end with the service process. A restarted service
  never honors an old token.

The boundary is other operating-system accounts and accidental cross-client
access. It does not isolate mutually hostile processes of the same account and
does not protect against administrators. The service does not publish tokens
over HTTP. The embedding supervisor delivers each over a private channel or in
an owner-validated connection descriptor, keeping it out of capabilities,
command lines, logs, and test output. Private descriptors contain plaintext
credentials; process-wide heap dumps can also contain credentials.

## Private discovery

The `/authority` entry exports a version-1 connection descriptor and a
`PrivateStorage` adapter contract. A descriptor contains one grant, a numeric
loopback HTTP endpoint, and the intended service's platform, PID, process-start
identity, executable path, interactive-session identity, and random
`incarnation`. Unknown fields, unsupported versions, non-loopback addresses,
userinfo, redirects, and records larger than 16 KiB are rejected.

`readConnectionDescriptor` requires a trusted `VerifyDesktopService` callback.
It must verify the actual listener owner, exact live process start/executable,
OS user, and current interactive session **before any credential is sent**.
Missing, false, or unavailable verification fails closed. An authenticated
status request then checks the service incarnation under a 15-second deadline.
The library supplies a [Windows verifier](#windows-private-storage-and-service-verifier)
and no macOS verifier yet, so a macOS supervisor brings its own. A callback that
unconditionally returns true is not a production verifier. Filesystem ownership
alone is not logon-session isolation or live process verification.

`createMacOSPrivateStorage` uses the owner's Application Support directory,
requiring a 0700 root and 0600 regular records owned by the current UID. It
validates ancestors, rejects symlinks and hardlinked records, checks actual
macOS ACLs rather than mode bits alone, and revalidates the root identity on
each operation. Ancestor deny-only ACLs and root-owned sticky temporary
directories are allowed; an ancestor ACL that grants access fails closed.
Existing permissions are never repaired. Publication is atomic and
non-overwriting; cleanup compares the validated record's exact contents and
file identity. Other processes of the same OS account remain outside this
boundary.

The macOS adapter rejects Windows and every other platform; Node `chmod` is not
a fallback on either. This slice does not implement cross-service claims,
process recovery, automatic discovery, or supervisor wiring.

## Windows private storage and service verifier

`createWindowsPrivateStorage({ artifact, root? })` implements the same
`PrivateStorage` contract through the verified Windows helper's one-shot
`--private-storage` mode, so the operating system judges ownership from open
handles and Node never trusts a path check. The default root is a per-user
folder under the local application data folder. An override must be a canonical
absolute local-drive path of at most 240 characters whose parent exists. A
missing root is created atomically with an owner-only protected DACL (one allow
entry giving the current user full control); an existing root is validated and
never repaired. The helper fails closed, with a fixed reason category, unless:

- every ancestor, from the volume root down, is a real directory that is not a
  reparse point and is owned by the current user, SYSTEM, Administrators, or
  TrustedInstaller, and no other principal holds a right to add a file, delete a
  child, delete the directory, or change its DACL or owner. Adding a
  subdirectory is allowed, so the default `C:\` entry that lets users create
  folders passes;
- the root and every record are owned by the current user and carry exactly the
  owner-only protected DACL, no reparse point, and (for records) one hard link
  and one regular file;
- the volume keeps persistent ACLs and is a local fixed, removable, or RAM drive,
  so network and ACL-less volumes are refused;
- the root's volume and file identity equal the identity the helper reported
  when the storage opened. The adapter sends that identity with every call, so a
  root replaced by another valid one is refused rather than adopted.

`publish` writes a temporary file under the same DACL and renames it without
replacing, so a record is never visible with a weaker descriptor and an existing
record reports `exists`. A crash between the two steps can leave a harmless
temporary file of at most 16 KiB. `remove` deletes only a validated record whose
contents match, and `read` of an absent record is the only miss. Contents cross
the process boundary as base64 on standard input, never on a command line, and
no failure carries a path or contents. Errors reuse the macOS adapter's two
messages and add a non-enumerable `reason` for diagnostics only; callers must
not depend on it.

`describeWindowsService({ artifact, pid })` returns the identity a supervisor
publishes for itself: `platform: 'windows'`, `pid`, `startedAt` (the process
creation time as UTC ISO-8601 with 100 ns precision), `executablePath`, and
`interactiveSession` (`windows-session:<id>`). The supervisor adds the
`incarnation`. It refuses a process of another user or session and a process
that has exited.

`createWindowsServiceVerifier({ artifact })` returns a `VerifyDesktopService`.
It resolves `true` only when the helper, holding the process open so its
identifier cannot be reused mid-check, verified in order: a numeric loopback
origin (exactly `http://127.0.0.1:<port>` or `http://[::1]:<port>`); a Windows
claim; a live process of the current user in the verifier's interactive session;
the exact start time; the executable path, compared case-insensitively; the
claimed session; and that every listening TCP socket able to accept a connection
to the address, including a wildcard listener on the same port, belongs to the
claimed process. Anything the helper refuses resolves `false`. A helper that is
missing, times out, or answers anything else rejects, so a verifier failure never
sends a credential. Windows and macOS identities are never compared. As on
macOS, other processes of the same account and administrators remain outside
this boundary.

## Native-helper trust

- Native source is checked in and compilation is explicit.
- Installation never downloads or builds a helper.
- Explicit paths fail verification rather than falling back.
- Managed artifacts use real-path and symlink/junction confinement.
- Immutable cache records bind source, configuration, toolchain, artifact hash,
  protocol, and signing identity.
- Invalid cache entries are quarantined.
- The selected executable completes a one-shot handshake and the actual
  long-lived process repeats the identity/protocol handshake.
- macOS signatures are checked against their recorded certificate hash,
  authority, team identifier, designated requirement, Hardened Runtime, and
  timestamp policy.

An optional organization prebuilt must be provisioned through an external
trusted channel and pinned to organization publisher policy. A hash stored next
to an artifact is integrity metadata, not publisher authentication.

## Application identity and ownership

Launch and attach configuration is server-owned. Exact application identities,
window titles, PIDs, process start times, executables, bundle IDs/AUMIDs, and
nonce-bound leases prevent attaching to a merely similar process.

Ambiguous matches fail. Cleanup preserves attached applications and terminates
only exact resources recorded as owned. Never add process-name or “first
window” fallback cleanup.

## Native protocol

The helper has no listener and receives only validated commands over inherited
stdio. FDR1 frames are bounded and correlated. Native handles remain private;
WebDriver uses session-generated UUIDs.

Every operation is cancellable. Session and global input queues remain held
until native side effects settle. Node mirrors depressed input and uses a
restricted release-only helper mode after an unexpected native exit.

## Artifacts and diagnostics

Artifact paths are sanitized and confined beneath the configured run root.
Agent tree responses are bounded by depth and node count. Public errors and
capabilities do not include unrestricted environment data or native handles.

Screenshots, accessibility trees, source, app titles, and values may contain
sensitive information. CI and local workflows must:

- collect only evidence required for the test;
- store it in access-controlled artifact systems;
- define retention and deletion;
- avoid publishing it in logs or public issues;
- redact secrets and user data before sharing.

Native build logs and private generated manifests can contain machine-local
paths. Keep them out of package output and public diagnostics.

## Platform authority

Physical input is global to the interactive desktop. Run automation only in a
dedicated logged-in session and serialize it across processes.

On Windows, use matching user sessions and integrity levels. On macOS, grant
privacy permissions only to the intended responsible process and stable
identity. Never edit `TCC.db`, disable SIP, sandbox the helper to bypass policy,
or use undocumented responsibility APIs.

## Review triggers

Require a focused security review before:

- allowing a non-loopback bind;
- adding authentication, TLS, or remote target discovery;
- accepting executable or artifact configuration from a client;
- adding automatic downloads or updates;
- publishing organization-built native artifacts;
- adding a persistent broker or per-user socket;
- exposing new arbitrary agent operations;
- changing path confinement, signature policy, ownership, or input recovery.

See [Architecture](architecture.md), [Service integration](service.md), and
[Native helpers](native-helpers.md) for implementation details.
