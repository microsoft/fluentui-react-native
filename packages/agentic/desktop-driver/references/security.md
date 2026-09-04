# Security model

Desktop Driver controls a real interactive desktop. Its V1 security boundary is
a trusted local supervisor, a loopback-only service, pre-registered targets,
verified native helpers, and confined evidence. It is not a remote automation
service.

## Service boundary

- `createDesktopDriverServer` accepts only loopback hosts.
- Browser-origin requests are rejected.
- The service has no TLS, user authentication, or remote authorization.
- Clients can select only server-registered targets.
- Capabilities cannot provide executables, arguments, environment variables,
  helper paths, lease paths, cache roots, or artifact destinations.
- One active session may own a target.

Do not proxy, tunnel, container-port-forward, or expose the listener to another
machine. A remote deployment needs a separately designed authenticated
transport and target authorization model.

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
