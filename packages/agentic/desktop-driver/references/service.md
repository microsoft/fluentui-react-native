# Service integration

The Desktop Driver service is an embeddable, loopback-only W3C remote end.
Integrators register controlled targets before listening; clients can select
only those targets.

## Embed a native target

```ts
import { createDesktopDriverServer, NativeDesktopHost, resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver';

const artifact = await resolveNativeDesktopDriver({
  buildPolicy: 'if-missing',
  platform: 'windows',
});

const nativeHost = new NativeDesktopHost({
  application: {
    executablePath: 'C:\\apps\\Contoso.exe',
    windowTitle: 'Contoso',
  },
  artifact,
  endpoint: 'windows',
  onStderr: (message) => process.stderr.write(message),
});

const service = await createDesktopDriverServer({
  host: '127.0.0.1',
  port: 0,
  targets: [
    {
      endpoint: 'windows',
      host: nativeHost,
      id: 'contoso-windows',
      platformName: 'windows',
      renderer: 'fabric',
    },
  ],
});

console.log(service.url);
```

`port: 0` asks the operating system for an available port. Record the returned
URL and target ID in the trusted test supervisor rather than exposing a
discovery listener.

Always close the service:

```ts
try {
  // Run clients.
} finally {
  await service.close();
}
```

Shutdown stops accepting requests, drains session creation, deletes sessions,
releases input, disposes hosts, and reports cleanup failures.

## Register targets

Each `DesktopTarget` declares:

| Field               | Meaning                                                 |
| ------------------- | ------------------------------------------------------- |
| `id`                | Stable service-local identity selected by `furn:target` |
| `platformName`      | `macos` or `windows`                                    |
| `endpoint`          | `macos`, `windows`, or `win32`                          |
| `renderer`          | `fabric` or `paper`                                     |
| `host`              | A fake or native `DesktopHost` implementation           |
| `storyOrchestrator` | Optional Storybook selection/reset adapter              |
| `storyRootTestId`   | Optional native marker verified after story readiness   |

Do not derive a target from incoming capabilities. Executable paths, app
arguments, environment variables, helper paths, lease paths, and artifact roots
are server-owned configuration.

## Describe the application

`NativeDesktopHost` receives one immutable
`NativeDesktopApplicationDescriptor`.

| Field                        | Use                                                             |
| ---------------------------- | --------------------------------------------------------------- |
| `bundleIdentifier`           | macOS application identity                                      |
| `aumid`                      | Windows packaged-app launch identity                            |
| `executablePath`             | Controlled unpackaged launch path                               |
| `arguments`                  | Fixed server-owned launch arguments                             |
| `windowTitle`                | Exact expected window title, required by the Windows helper     |
| `leasePath` and `leaseNonce` | Exact owner-generated attach lease; do not accept from a client |

Windows launch needs either `aumid` or `executablePath` plus an exact
`windowTitle`. Attach without an owner-generated lease also requires a title
that resolves to exactly one live window. Ambiguity fails instead of selecting
the first result.

For macOS descriptor and launch behavior, see
[the macOS native provider](../native/macos/README.md). Storybook supplies a
nonce-bound lease containing the exact PID, process start, executable, endpoint
identity, and app identity; the native helper independently verifies it.

## Launch and attach

Clients request one of two modes:

- `launch` asks the registered host to start the controlled application and
  records it as owned;
- `attach` resolves an already running application from the controlled
  descriptor or owner-generated lease and records it as external.

The default is `launch`. Deleting an attached session preserves the app.
Deleting a launched session may close the exact owned process. Cleanup never
kills by process name.

## Connect with WebdriverIO

```ts
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';

const desktop = await connectDesktopWebdriver({
  clickMode: 'auto',
  launchMode: 'launch',
  platformName: 'windows',
  targetId: 'contoso-windows',
  url: service.url,
});

try {
  const save = await desktop.browser.$('~save-button');
  await save.click();
  await desktop.browser.keys(['Control', 's']);
} finally {
  await desktop.delete();
}
```

The returned browser supports standard WebdriverIO APIs backed by the
implemented W3C subset plus these commands when a Storybook orchestrator is
registered:

- `desktopListStories()`;
- `desktopOpenStory(storyId, runId?)`;
- `desktopResetStory(storyId, runId?)`;
- `desktopExpect(expectation)`;
- `desktopRunStoryTests(options?)`.

`clickMode` can be `physical`, `accessibility`, or `auto`. The server returns
the negotiated features; it never claims an unsupported input mode.

## Connect with the typed client

Use `./client` for protocol integrations and conformance tests that do not want
WebdriverIO:

```ts
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';

const client = createDesktopDriverClient({ url: service.url });
const session = await client.newSession({
  alwaysMatch: {
    browserName: 'furn-native-desktop',
    platformName: 'windows',
    'furn:target': 'contoso-windows',
  },
});

try {
  const save = await session.findElement('accessibility id', 'save-button');
  await save.click();
} finally {
  await session.delete();
}
```

Use `./agent` for bounded inspection and evidence operations. It deliberately
does not expose native handles, arbitrary commands, or unrestricted paths.

## Fake service CLI

`desktop-driver serve` starts a deterministic fake target:

```sh
desktop-driver serve \
  --platform windows \
  --endpoint windows \
  --renderer fabric \
  --target fake-windows \
  --manifest story-manifest.windows.json
```

The command prints JSON containing the service URL and target ID, stays alive
until a termination signal, then closes cleanly. It is intended for package,
protocol, client, and runner integration tests. Native production integrations
must resolve a verified helper and embed the service.

## Operations

- `GET /status` probes every registered target and returns truthful endpoint
  features.
- The service accepts a maximum 1 MiB JSON request body by default; override
  `maxBodyBytes` only for a measured local integration need.
- Each target has at most one active session.
- Commands are serialized per session. Input is serialized globally.
- Browser-origin requests are rejected.
- Non-loopback hosts are rejected even when passed explicitly.
- There is no network authentication or TLS. Do not proxy or expose the service
  beyond the local trusted process boundary.

See [the WebDriver contract](protocol.md) for routes and errors and
[the security model](security.md) before adding a new service surface.
