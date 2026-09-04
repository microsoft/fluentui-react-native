# Architecture

Desktop Driver separates portable WebDriver behavior from operating-system
automation. Node owns protocol, policy, sessions, tests, and evidence. A
verified native helper owns only window, accessibility, input, and capture
operations for its operating system.

## Layer model

```text
WebdriverIO / typed client / bounded agent / JSON CLI
                         |
                  W3C remote end
            target, session, element state
                         |
                    DesktopHost
                /                    \
      deterministic fake host    NativeDesktopHost
                                       |
                                framed FDR1 stdio
                                  /           \
                           Swift helper     C++ helper
                              macOS       Windows/Win32
```

Storybook is an optional consumer:

```text
component story -- type-only --> desktop-driver/authoring

storybook-desktop
  |- generates static story manifests and plan digests
  |- owns the channel/MCP server, Metro, and app lifecycle
  |- implements StoryOrchestrator
  `- embeds the Desktop Driver listener and registers a native target

storybook-desktop-runtime
  `- reports authenticated story readiness over the Storybook channel
```

The package never imports Storybook, React, or React Native. Its
`./storybook` subpath contains only serializable manifest types and the
`StoryOrchestrator` interface.

## Process boundaries

A generic native integration normally has:

1. one trusted Node process hosting the loopback W3C service;
2. one long-lived native helper child per `NativeDesktopHost`;
3. one launched or externally owned application process;
4. one or more WebDriver clients.

The helper has no listener. Node spawns it with inherited stdin/stdout, verifies
its startup hello against the resolved artifact, and exchanges correlated FDR1
frames. Binary frames carry PNG data; bounded human-readable diagnostics use
stderr.

A Storybook integration keeps the Storybook HTTP/WebSocket/MCP listener and W3C
listener on separate loopback ports because they are distinct protocols, but
runs both listeners in the same supervisor process. Metro remains a separate
child process.

## Request lifecycle

1. The service matches W3C capabilities against a server-registered
   `DesktopTarget`.
2. It reserves the target before asynchronous launch or attach work.
3. The selected `DesktopHost` probes truthful features and creates an
   application lease.
4. The session manager exposes opaque window and element IDs; native handles
   never cross the WebDriver boundary.
5. Commands run through a per-session queue. Physical input also uses a process
   mutex and an operating-system-level cross-process lock.
6. Each host call receives an `AbortSignal` and a bounded deadline.
7. On timeout or cancellation, the helper stops the operation and acknowledges
   cancellation before cleanup or later commands proceed.
8. Session deletion releases input and closes only resources owned by that
   session. Attached applications survive.
9. Service shutdown rejects new work, drains session creation, deletes
   sessions, and disposes each host.

## State and identity

The service maintains:

- registered target identity and provider policy;
- one active session reservation per target;
- application ownership (`launched` or `attached`);
- current window and opaque window IDs;
- session-generated W3C element UUIDs;
- native liveness and Storybook preview generation;
- depressed keyboard and pointer state;
- command and cleanup deadlines.

A retained element becomes stale when its native object disappears or when a
Storybook preview reset advances its generation. The service does not
reconstruct a replacement element from an index or path.

## Module ownership

| Module             | Responsibility                                                    |
| ------------------ | ----------------------------------------------------------------- |
| `src/protocol`     | W3C parsing, actions, capabilities, timeouts, and errors          |
| `src/server`       | HTTP routing, target registry, sessions, windows, and elements    |
| `src/host`         | Platform-neutral `DesktopHost` and target contracts               |
| `src/hosts/fake`   | Deterministic in-memory provider                                  |
| `src/hosts/native` | Long-lived helper process and `DesktopHost` adapter               |
| `src/native`       | Build, cache, resolution, verification, manifests, and wire types |
| `native/macos`     | Swift operating-system implementation                             |
| `native/windows`   | Shared C++ Windows and Win32 implementation                       |
| `src/client`       | Low-level typed W3C client                                        |
| `src/wdio`         | Sanctioned WebdriverIO integration and custom commands            |
| `src/authoring`    | Serializable story plans, selectors, capabilities, and results    |
| `src/runner`       | Filtering, sharding, execution, and result classification         |
| `src/artifacts`    | Confined atomic evidence                                          |
| `src/agent`        | Bounded JSON-safe operations                                      |
| `src/testing`      | Fake harnesses and Storybook test doubles                         |
| `src/cli`          | Commander parsing, JSON output, and process exit adaptation       |

## Deliberate boundaries

- The service is client-neutral; WebdriverIO is not used by routing or hosts.
- Native helpers receive validated commands and controlled descriptors, not
  WebDriver capabilities or arbitrary environment data.
- Native artifacts are source-built or operator-provided. The package never
  downloads, mutates, or silently substitutes them.
- Queries are authoritative. Native events are hints for invalidation and
  failure classification.
- Screenshots are evidence, not a visual-baseline comparison system.
- The fake host is a protocol and runner test double, not a native fallback.

See [Service integration](service.md), [Native helpers](native-helpers.md), and
[Security](security.md) for the operational contracts behind these boundaries.
