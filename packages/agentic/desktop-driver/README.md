# React Native Desktop Driver

`@fluentui-react-native/desktop-driver` is a W3C WebDriver-compatible remote end
for React Native desktop applications. The initial implementation provides the
platform-neutral protocol, target/session model, typed client, and deterministic
fake host. Native Windows, Win32, and macOS providers are planned separately in
[PLAN.md](PLAN.md).

The server is client-neutral and does not use Appium. WebdriverIO is the
sanctioned high-level automation API; raw HTTP and the typed low-level client
are available for protocol testing and integration.

## Implemented foundation

The platform-neutral implementation includes:

- W3C capability matching with server-registered targets;
- one active session per target;
- window, element, timeout, action, screenshot, and source commands;
- stable WebDriver element IDs and stale-element detection;
- configurable `physical`, `accessibility`, and `auto` click modes;
- Storybook manifest, selection, reset, and args extension commands;
- a typed client and WebdriverIO compatibility coverage;
- a deterministic fake host for protocol and orchestration tests.

```ts
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { createDesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';

const harness = await createDesktopDriverTestHarness();
const client = createDesktopDriverClient({ url: harness.server.url });
const session = await client.newSession({
  alwaysMatch: {
    platformName: 'windows',
    'furn:target': harness.target.id,
  },
});

const button = await session.findElement('accessibility id', 'button-primary');
await button.click();
await session.delete();
await harness.close();
```

Native host providers are intentionally not part of this stage.
