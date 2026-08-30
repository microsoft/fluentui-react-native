# React Native Desktop Driver

`@fluentui-react-native/desktop-driver` is a W3C WebDriver-compatible remote end
for React Native desktop applications. It does not use Appium.

Stage 1 provides the complete platform-neutral protocol, sanctioned WebdriverIO
API, serializable story-test contract, deterministic fake host, evidence
reports, JSON CLI, and bounded agent API. Native Windows, Win32, and macOS host
providers are separate Stage 2 work described in [PLAN.md](PLAN.md).

## Package boundaries

| Surface                                 | Responsibility                                              |
| --------------------------------------- | ----------------------------------------------------------- |
| `@fluentui-react-native/desktop-driver` | Public types and common APIs                                |
| `/authoring`                            | Serializable story plans, selectors, and result types       |
| `/wdio`                                 | Sanctioned WebdriverIO connection, commands, and runner     |
| `/agent`                                | Bounded JSON-safe inspection and action API                 |
| `/client`                               | Low-level typed W3C client                                  |
| `/server`                               | Embeddable W3C remote end and target/session state          |
| `/artifacts`                            | Confined atomic evidence persistence                        |
| `/testing`                              | Fake host, fake Storybook orchestration, and test harnesses |

The protocol server remains client-neutral. WebdriverIO is a dependency of the
high-level `/wdio` surface, not an implementation primitive for routing,
capability negotiation, or native hosts.

## Authoring story tests

Plans are inline static data under `parameters.desktopDriver`. Storybook can
extract and shard them without importing a React Native story module, and
agents can explain the same steps before execution.

```tsx
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'pointer-focus',
          title: 'Responds to activation and receives focus',
          requires: ['focus', 'screenshot'],
          steps: [
            { action: 'wait', target: { testId: 'my-button' } },
            { expect: { state: 'role', target: { testId: 'my-button' }, value: 'button' } },
            { action: 'click', target: { testId: 'my-button' } },
            { expect: { state: 'focused', target: { testId: 'my-button' }, value: true } },
            { action: 'screenshot', name: 'focused-button', target: { testId: 'my-button' } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};
```

Static extraction accepts JSON literals wrapped by TypeScript `satisfies` or
`as`. Do not hide plans behind variables, functions, spreads, computed
properties, or runtime platform branches. Invalid or dynamic plans fail
manifest generation with their source file, story, and line.

Portable selectors are:

- `{ testId }` for deterministic interaction;
- `{ role, name? }` for semantic lookup;
- `{ accessibleName }`;
- `{ text }`.

Supported actions include click, double-click, clear, type, keys, W3C actions,
scroll, Storybook arg updates, waits, screenshots, source capture, and notes.
Assertions cover existence/count, role, accessible name, text/value, displayed,
enabled, focused, selected, checked/mixed, and expanded state.

Use `requires` for capabilities such as `keyboard`, `focus`, `wheel`, or
`screenshot`. Missing capabilities produce an explicit skipped result rather
than a false pass. Platform divergence belongs in declarative `platforms` or
capability requirements, not branches inside a plan.

## Sanctioned WebdriverIO API

```ts
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';

const desktop = await connectDesktopWebdriver({
  platformName: 'windows',
  targetId: 'agenticstorybook-windows',
  url: 'http://127.0.0.1:39859',
});

try {
  const manifest = await desktop.browser.desktopListStories();
  await desktop.browser.desktopOpenStory('components-button--default');
  await desktop.browser.desktopExpect({
    state: 'enabled',
    target: { testId: 'agentic-storybook-button' },
    value: true,
  });
  const result = await desktop.browser.desktopRunStoryTests({
    artifactsRoot: 'artifacts/windows/desktop-driver',
    selection: { tag: 'desktop-e2e', shardCount: 2, shardIndex: 0 },
  });
} finally {
  await desktop.delete();
}
```

Registered browser commands are:

- `desktopListStories()`;
- `desktopOpenStory(storyId, runId?)`;
- `desktopResetStory(storyId, runId?)`;
- `desktopExpect(expectation)`;
- `desktopRunStoryTests(options?)`.

The runner filters by story, test, and tag, shards the sorted
`storyId/testId` list deterministically, checks required capabilities, resets
the preview for every run, and distinguishes assertion, timeout, cancellation,
skip, and infrastructure outcomes.

The server serializes commands per session and all input globally. Timeout
paths abort host work before releasing input, while runner cancellation drains
its in-flight request before cleanup, so a later test cannot inherit a late key
or pointer action.

## Evidence

Supplying `artifactsRoot` writes atomically beneath that root:

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

Artifact names are sanitized and confined beneath the configured root.
Failures attempt screenshot, source, and compact-tree capture; evidence-capture
errors are reported without replacing the original test failure.

## JSON CLI

The CLI prints structured JSON for automation:

```sh
desktop-driver serve --manifest story-manifest.windows.json --target fake-windows

desktop-driver stories list \
  --url http://127.0.0.1:4444 \
  --target fake-windows

desktop-driver stories explain components-button--default \
  --url http://127.0.0.1:4444 \
  --target fake-windows

desktop-driver stories run \
  --url http://127.0.0.1:4444 \
  --target fake-windows \
  --tag desktop-e2e \
  --artifacts artifacts/windows/desktop-driver

desktop-driver agent describe \
  --url http://127.0.0.1:4444 \
  --target fake-windows \
  --scope story \
  --artifacts artifacts/windows/desktop-driver
```

`serve` is the Stage 1 fake target. It is not a native-provider substitute.

## Agent API

```ts
import { connectDesktopAgent } from '@fluentui-react-native/desktop-driver/agent';

const agent = await connectDesktopAgent({
  artifactsRoot: 'artifacts/windows/desktop-driver',
  platformName: 'windows',
  targetId: 'agenticstorybook-windows',
  url: 'http://127.0.0.1:39859',
});

try {
  await agent.listStories();
  await agent.openStory('components-button--default');
  await agent.describe({ scope: 'story', depth: 3, maxNodes: 100 });
  await agent.click({ testId: 'agentic-storybook-button' });
  await agent.screenshot('button');
  await agent.runStoryTest('components-button--default', 'pointer-focus');
} finally {
  await agent.delete();
}
```

The API intentionally exposes coarse operations and bounded tree projections.
It does not reveal native handles or permit arbitrary process, environment, or
artifact-path capabilities.

## MCP decision

Phase 3 does not add another MCP listener. The Storybook MCP remains the
documentation and story-metadata surface; the typed agent API and JSON CLI are
the executable native-validation surface. Reconsider a composed MCP adapter
after Stage 2 proves the native commands and their security model. A tool-schema
file without an executable adapter is not considered an MCP integration.

## Protocol and security

See [SPEC.md](SPEC.md) for implemented W3C routes, extension commands,
capabilities, device contracts, and unsupported browser behavior.

The server binds loopback, rejects browser-origin requests, accepts only
server-registered targets, permits one session per physical target, applies
host command deadlines, and preserves attached applications. Never expose it
remotely without a separately designed authentication and transport policy.
