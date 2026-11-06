---
id: storybook-desktop.story-tests
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Author story tests

Story tests are statically extracted CSF `wdio` callbacks. Use top-level
functions or named callback collections with literal names; callbacks must not
close over module-local values. Import Node-only helpers through literal
dynamic `import()` inside the callback. Keep test code out of the native
bundle.

```tsx
import type { StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

type Story = WdioStory<StoryObj<typeof Button>>;

export const Default: Story = {
  args: { testID: 'save-button' },
  wdio: {
    'is enabled': async ({ browser, expect }) => {
      await expect(await browser.$('~save-button')).toBeEnabled();
    },
    'supports activation': async ({ browser, platform, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features?.physicalClick) {
        skip('Physical pointer input is unavailable.');
        return;
      }
      await (await browser.$('~save-button')).click();
    },
  },
};
```

The callback receives the real WebdriverIO `browser`, `expect-webdriverio`
`expect`, typed `desktop` assertions/story commands, target `platform` (`macos`,
`windows`, or `win32`), cooperative `signal`, and explicit `skip(reason)`.
`platform` is the target endpoint, not `process.platform`; Win32 remains
distinct even though its WebDriver `platformName` is `windows`.

Each named callback executes in an isolated worker and WebDriver session with
a fresh preview. Names are discovered statically; collections must be
non-empty with unique literal names and inline function values. Spreads,
computed names, methods, nested suites, dynamic test registration, and
closures over imported helpers, args, or render state fail extraction with
source context. The older single `wdio: async (context) => ...` form remains
supported as the `default` test.
Use `WdioStory<StoryObj<...>>` and import `WdioStory` with `import type`.
Named tests can colocate endpoint-specific input requirements:

```tsx
wdio: {
  'supports activation': {
    inputModes: { win32: 'both' },
    run: async ({ browser, expect }) => {
      const button = await browser.$('~save-button');
      await button.click();
      await expect(button).toBeEnabled();
    },
  },
}
```

Descriptors require exactly `inputModes` and an inline `run` function.
`inputModes` is a nonempty literal map of `macos`, `windows`, or `win32` to
`accessibility`, `physical`, or `both`; dynamic values and duplicate or unknown
fields fail extraction. An endpoint annotation applies only when that endpoint
selects an input lane. Set `wdio.inputMode` to `accessibility` or `physical` in
the consuming app configuration: every eligible callback must then declare that
endpoint before any story, tag, or test filtering. `both` participates in each
lane. Selection does not grant native input authority or replace capability
checks. Existing bare callbacks remain supported without input-mode selection.
`test --list` includes discovered per-test `inputModes`; the shared harness
does not maintain an inventory of component test names.

Literal dynamic imports of Node-compatible helpers inside the callback resolve
from the original story file. The shared Babel config removes callbacks before
Metro resolves their dependencies.

Use native selectors and WebDriver operations; the app has no DOM or JavaScript
execution surface. Read native properties through `getProperty()` rather than
ordinary object matchers. Feature-check native actions and explicitly skip
unsupported cases; never turn unsupported state into false. For example,
`getProperty('accessibilityActions')` lists the action names an element
publishes (such as `Toggle` or `Select`) when
`browser.capabilities['furn:features']?.accessibilityActions` is true.

Tests in one story run in declaration order, each in its own Node process and
native session. The preview is navigated/remounted before each case. A
per-case timeout applies; assertion failure does not prevent independent
cases from running, while connection or cleanup failures stop execution.
No matching case is an error. Restart the driver and reload the app after
editing callbacks because their digest participates in manifest freshness.
`test --list` discovers IDs without executing callbacks; `--test <glob>`
filters names. `test` operates against an already running app/driver; smoke
owns the complete app lifecycle.

Use the component authoring contract for component-specific test assertions.
Legacy `parameters.desktopDriver` static plans remain for compatibility and
are not the preferred story-test authoring API.
