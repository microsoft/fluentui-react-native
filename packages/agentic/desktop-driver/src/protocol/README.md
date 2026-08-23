# Desktop host protocol

`protocol/` is the React-Native-safe wire contract between the Storybook app and the desktop host.
It contains no Node, Storybook Node, WDIO, Appium, or server imports.

## Events

| Event                    | Direction  | Purpose                                                              |
| ------------------------ | ---------- | -------------------------------------------------------------------- |
| `desktopTestHostReady`   | host → app | Publish service identity, manifest, tested stories, and capabilities |
| `desktopTestHostClosing` | host → app | Invalidate the current service identity                              |
| `desktopTestRunRequest`  | app → host | Request selected or all manifest stories                             |
| `desktopTestRunStatus`   | host → app | Publish ordered progress and terminal state                          |
| `desktopTestRunCancel`   | app → host | Cancel the active run                                                |

Every run request echoes the generated manifest digest. The host rejects a stale digest before it
starts a runner. Status envelopes carry monotonic sequence numbers so apps can discard stale or
out-of-order messages.

## Codecs

The decoders accept `unknown` and return a typed payload or `undefined`. Both the host and app must
use the same decoder; do not duplicate partial guards in consumers.

When changing the protocol:

1. update payload types and codecs together;
2. add exact positive and negative tests;
3. bump `DESKTOP_PROTOCOL_VERSION` for incompatible wire behavior; and
4. update the generated React Native runtime projection and app tests.

Never include tokens, commands, module paths, environment values, backend capabilities, or stacks
in a channel payload.
