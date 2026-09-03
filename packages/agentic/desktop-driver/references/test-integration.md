# Test integration

Desktop Driver supports three complementary test levels:

1. normal WebdriverIO automation against a registered native target;
2. serializable plans colocated with component stories;
3. deterministic package and protocol tests against the fake host.

The same W3C service and `DesktopHost` contract underpin all three.

## WebdriverIO tests

Use `connectDesktopWebdriver` when a test owns service connection and session
lifecycle:

```ts
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';

const desktop = await connectDesktopWebdriver({
  clickMode: 'auto',
  launchMode: 'attach',
  platformName: 'macos',
  targetId: 'component-storybook-macos',
  url: process.env.DESKTOP_DRIVER_URL!,
});

try {
  const input = await desktop.browser.$('~search-input');
  await input.setValue('Fluent');
  await expect(input).toHaveValue('Fluent');
} finally {
  await desktop.delete();
}
```

Use standard WebdriverIO APIs only where the
[implemented protocol](protocol.md) supports them. Browser navigation, cookies,
frames, JavaScript execution, prompts, printing, CSS values, and shadow roots
are intentionally unavailable.

For Storybook targets, the connection registers:

- `desktopListStories()`;
- `desktopOpenStory(storyId, runId?)`;
- `desktopResetStory(storyId, runId?)`;
- `desktopExpect(expectation)`;
- `desktopRunStoryTests(options?)`.

The runner resets the preview for each test, filters and shards a stable
`storyId/testId` ordering, checks required capabilities, and classifies
assertion, timeout, cancellation, skip, and infrastructure outcomes.

## Author portable story plans

Plans are static JSON under `parameters.desktopDriver`. Import only their types
from `./authoring`:

```tsx
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'activate',
          title: 'Activates from the desktop',
          requires: ['physical-click'],
          steps: [
            { action: 'wait', target: { testId: 'save-button' } },
            {
              expect: {
                state: 'role',
                target: { testId: 'save-button' },
                value: 'button',
              },
            },
            { action: 'click', target: { testId: 'save-button' } },
            {
              expect: {
                state: 'focused',
                target: { testId: 'save-button' },
                value: true,
              },
            },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};
```

Storybook extraction accepts JSON literals wrapped by TypeScript `satisfies` or
`as`. Do not hide a plan behind variables, functions, spreads, computed
properties, or runtime platform branches. Dynamic or invalid plans fail
generation with source context.

Portable selectors:

- `{ testId }` for deterministic interaction;
- `{ role, name? }` for semantic lookup;
- `{ accessibleName }`;
- `{ text }`.

Actions:

- click, double-click, clear, type, key sequences, and raw W3C actions;
- scroll and wait;
- Storybook argument updates;
- screenshot, source, and notes.

Assertions:

- existence and count;
- role, accessible name, text, and value;
- displayed, enabled, focused, selected, checked/mixed, and expanded state.

Requirements can declare `accessibility-click`, `element-screenshot`, `focus`,
`keyboard`, `physical-click`, `screenshot`, or `wheel`. A missing requirement
produces an explicit skip. Platform differences belong in `platforms` and
`requires`, not imperative branches.

## Run plans

```sh
desktop-driver stories list \
  --url http://127.0.0.1:39859 \
  --target component-storybook-windows

desktop-driver stories explain components-button--default \
  --url http://127.0.0.1:39859 \
  --target component-storybook-windows

desktop-driver stories run \
  --url http://127.0.0.1:39859 \
  --target component-storybook-windows \
  --tag desktop-e2e \
  --shard-index 0 \
  --shard-count 2 \
  --artifacts artifacts/windows/desktop-driver
```

Selectors can filter by story glob, test glob, tag, and deterministic shard.
The CLI emits JSON and exits nonzero when the run status is not `passed`.

## Evidence

Passing `artifactsRoot` writes atomically beneath that root:

```text
artifactsRoot/
  host.json
  run.json
  tests/
    <story>-<test>/
      <named screenshots and source>
      failure.png
      failure-source.xml
      failure-tree.json
```

Names are sanitized and confined. Failure evidence is best effort and never
replaces the original test error. Trees and screenshots may contain sensitive
application information; apply the retention and access policy described in
[Security](security.md).

## Fake-host contract tests

Use `./testing` for deterministic tests that do not need a desktop:

```ts
import { createDesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';

const harness = await createDesktopDriverTestHarness({
  endpoint: 'windows',
});
const client = createDesktopDriverClient({ url: harness.server.url });

try {
  const session = await client.newSession({
    alwaysMatch: {
      browserName: 'furn-native-desktop',
      platformName: 'windows',
      'furn:target': harness.target.id,
    },
  });
  await session.delete();
} finally {
  await harness.close();
}
```

`createDesktopDriverStoryHarness` adds a fake Storybook orchestrator and
manifest-derived elements. The fake provider is appropriate for protocol,
queueing, cancellation, runner, CLI, and consumer contract tests. It is not
evidence that native accessibility, input, window, or capture behavior works.

## Package tests

From this package:

```sh
yarn test
```

The default suite covers raw W3C routes, typed clients, WebdriverIO custom
commands, authored plans, fake Storybook orchestration, bounded agents,
artifacts, target concurrency, timeouts, shutdown races, framing, helper
verification, and CLI adaptation.

Run the opt-in native contract on the matching target OS:

```sh
FURN_NATIVE_DRIVER_TEST=1 yarn test --runInBand
```

PowerShell:

```powershell
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn test --runInBand
```

The native contract builds into a temporary or configured external cache,
verifies the artifact and long-lived handshake, runs the helper self-test,
checks cache reuse and resolution, and exercises malformed-frame recovery.
Stable-signed macOS coverage also requires
`FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY`.

Real-app behavior belongs in a consuming application's integration or smoke
suite. This repository uses the Storybook `stories-and-tests` lifecycle; see
[CI integration](ci-integration.md).
