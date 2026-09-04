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

`supportedPlatforms` narrows the story's generated catalog membership.
Test-level `platforms` keeps one unchanged test body on a subset.
`platformVariants` keeps one stable test ID while completely replacing
`requires` and `steps` for a specific endpoint. `traversePlatforms` keeps a
supported story out of broad render traversal and schedules its plans after
ordinary stories, which is appropriate only for destructive or teardown-
sensitive native regressions. Package-level Storybook globs remain the
loadability boundary and cannot be widened by a story declaration.

Portable selectors:

- `{ testId }` for deterministic interaction;
- `{ role, name? }` for semantic lookup;
- `{ accessibleName }`;
- `{ text }`.

Actions:

- click, double-click, deterministic native focus, clear, type, key sequences,
  and raw W3C actions;
- scroll, conditional wait, and fixed abortable `pause`;
- Storybook argument updates;
- screenshot, source, and notes.

Assertions:

- existence and count;
- role, accessible name, text, and value;
- displayed, enabled, focused, selected, checked/mixed, and expanded state.

Requirements can declare `accessibility-click`, `element-screenshot`, `focus`,
`keyboard`, `physical-click`, `screenshot`, or `wheel`. A missing requirement
produces an explicit skip. A run with no passing test reports `incomplete`
rather than green.

Use semantic assertions consistently:

| Component category | Minimum assertions                                               |
| ------------------ | ---------------------------------------------------------------- |
| Action             | role, accessible name, enabled                                   |
| Toggle             | action minimums plus checked/mixed and its activation transition |
| Text input         | role, accessible name, enabled/read-only when exposed, and value |
| Selection item     | role, accessible name, selected or checked                       |
| Disclosure         | button role, accessible name, expanded                           |
| Informational      | role, meaningful accessible name when present, displayed         |

Package Jest tests prove component-owned prop propagation. Native story plans
prove the normalized accessibility tree. Neither substitutes for manual
screen-reader validation.

Use complete platform variants for verified native mappings that legitimately
differ. For example, the current Windows and Win32 React Native hosts expose
Switch as a `button`; Windows Fabric exposes Divider as a named `group`, while
Win32 Paper and macOS expose `separator`. Win32 Paper does not currently expose
selected state for Card, MenuItem, or Tab, or checked state for Radio and
Switch. Omit those assertions in the Win32 variant rather than translating
unsupported state to `false`.

The `focus` capability means the provider can set and read keyboard focus.
Prefer the portable `focus` action for focus-visual, Tab-start, and crash
regressions because it does not require global physical input. Windows and
Win32 pointer tests may additionally assert focus after a physical click.
React Native macOS does not move keyboard focus on ordinary mouse-down, so
pointer-activation tests need a complete macOS variant rather than a copied
Windows focus expectation.

A test may carry `quarantine: { owner, issue, expires, reason? }`. Quarantined
tests have a distinct result status, are excluded from passing coverage, and
become failures after expiry.

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
`run.json` records the shared catalog digest, portable-plan digest, exact
platform digest, overall counts, and role/name/reachability assertion counts.

## Evidence

Passing `artifactsRoot` writes atomically beneath that root:

```text
artifactsRoot/
  events.ndjson
  host.json
  junit.xml
  run.json
  tests/
    <story>-<test>/
      result.json
      <named screenshots and source>
      failure.png
      failure-source.xml
      failure-tree.json
```

Names are sanitized and confined. NDJSON and JUnit are derived from the same
final result as `run.json`. Failure evidence is best effort and never replaces
the original test error. Trees and screenshots may contain sensitive
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
