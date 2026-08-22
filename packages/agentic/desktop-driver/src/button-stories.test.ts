/**
 * End-to-end coverage of the story-test pipeline.
 *
 * Generates the manifest from the real Button story module, then executes the extracted plans and
 * the `browser.desktop` augmentation against the fake backend. This is the closest this package
 * gets to a full run without a built desktop application: everything except the native driver and
 * the HTTP transport is the production code path.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { ArtifactStore } from './artifacts.ts';
import { attachDesktopCommands } from './wdio/commands.ts';
import { createInProcessSession, type InProcessSession } from './testing/in-process-session.ts';
import { DesktopLifecycle } from './lifecycle.ts';
import { generateStoryTestManifest } from './storybook/manifest.ts';
import { resolveDesktopOptions } from './config.ts';
import { runInlineStoryPlan } from './wdio/story-plan-runner.ts';
import { StoryController } from './storybook/controller.ts';
import { byTestId } from './selectors.ts';
import type { InlineStoryPlan, StoryTestManifest } from './types.ts';

// Jest runs with the package root as the working directory.
const packageRoot = process.cwd();
const repoRoot = path.resolve(packageRoot, '..', '..', '..');
const buttonDirectory = path.join(repoRoot, 'packages', 'agentic', 'components', 'src', 'components', 'button');
const buttonStories = path.join(buttonDirectory, 'button.stories.tsx');
const storybookScene = path.join(repoRoot, 'apps', 'storybook', 'desktop-tests', 'fake-scene.json');

function attach(session: InProcessSession): void {
  const options = resolveDesktopOptions({ platform: 'fake', target: { mode: 'attach', identity: 'fake' } });
  attachDesktopCommands(session.browser, {
    options,
    lifecycle: new DesktopLifecycle({ platform: 'fake', ownership: 'external' }),
    artifacts: new ArtifactStore({ rootDirectory: fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-e2e-')) }),
    storyController: new StoryController({ baseUrl: 'http://127.0.0.1:0' }),
    driverHostUrl: 'http://127.0.0.1:0',
  });
}

describe('agentic-components Button story tests', () => {
  let manifest: StoryTestManifest;

  beforeAll(() => {
    manifest = generateStoryTestManifest({
      storyFiles: [buttonStories],
      specRoots: [path.join(repoRoot, 'packages', 'agentic', 'components', 'src')],
      generatedSpecPath: path.join(repoRoot, 'apps', 'storybook', 'desktop-tests', 'generated', 'story-plans.generated.spec.ts'),
    });
  });

  it('extracts both story-test kinds from the Button stories', () => {
    expect(manifest.entries.map((entry) => ({ storyId: entry.storyId, kind: entry.plan.kind }))).toEqual([
      { storyId: 'components-button--default', kind: 'inline' },
      { storyId: 'components-button--interaction', kind: 'spec' },
    ]);
  });

  it('links the interaction story to its colocated spec, which carries the story tag', () => {
    const interaction = manifest.entries.find((entry) => entry.storyId === 'components-button--interaction')!;

    expect(interaction.spec).toBe(path.join(buttonDirectory, 'button.desktop.spec.ts'));
    expect(fs.readFileSync(interaction.spec, 'utf8')).toContain(interaction.tag);
    expect(new RegExp(interaction.grep).test(`${interaction.tag} Button interaction`)).toBe(true);
  });

  it('runs the extracted Default inline plan against the fake backend', async () => {
    const session = await createInProcessSession(storybookScene, { initialStory: 'components-button--default' });
    attach(session);

    const plan = manifest.entries.find((entry) => entry.storyId === 'components-button--default')!.plan as InlineStoryPlan;
    await expect(runInlineStoryPlan(plan, { browser: session.browser, defaultTimeout: 1000 })).resolves.toBeUndefined();
  });

  it('fails the inline plan with a step-qualified message when the story does not match', async () => {
    const session = await createInProcessSession(storybookScene, { initialStory: 'components-button--interaction' });
    attach(session);

    const plan = manifest.entries.find((entry) => entry.storyId === 'components-button--default')!.plan as InlineStoryPlan;
    await expect(runInlineStoryPlan(plan, { browser: session.browser, defaultTimeout: 50 })).rejects.toThrow(
      /Story plan "button-default" failed at step 1 \(expectVisible\)/,
    );
  });

  it('rejects a step whose command is not supported by the connected backend', async () => {
    const plan: InlineStoryPlan = {
      kind: 'inline',
      id: 'unsupported-command',
      steps: [{ action: 'expectEnabled', target: { testId: 'button' } }],
    };
    const browser = { $: jest.fn() } as unknown as InProcessSession['browser'];

    await expect(runInlineStoryPlan(plan, { browser, portableCommands: ['findElement'] })).rejects.toMatchObject({
      kind: 'capability',
    });
    expect(browser.$).not.toHaveBeenCalled();
  });

  it('reproduces the interaction spec assertions: press feedback, repeats, and disabled inertness', async () => {
    const session = await createInProcessSession(storybookScene, { initialStory: 'components-button--interaction' });
    attach(session);
    const { browser } = session;

    const button = await browser.$(byTestId('agentic-storybook-button-interactive'));
    const disabled = await browser.$(byTestId('agentic-storybook-button-interactive-disabled'));

    expect(await button.isDisplayed()).toBe(true);
    expect(await button.isEnabled()).toBe(true);
    expect(await button.getText()).toBe('Press me');
    expect(await (await browser.$(byTestId('agentic-storybook-button-interactive-status'))).getText()).toBe('Not pressed');

    await button.click();
    expect(await (await browser.$(byTestId('agentic-storybook-button-interactive-status'))).getText()).toBe('Pressed 1');

    await button.click();
    await button.click();
    expect(await (await browser.$(byTestId('agentic-storybook-button-interactive-status'))).getText()).toBe('Pressed 3');

    expect(await disabled.isEnabled()).toBe(false);
    await disabled.click().catch(() => undefined);
    expect(await (await browser.$(byTestId('agentic-storybook-button-interactive-status'))).getText()).toBe('Pressed 3');
  });

  it('inspects focus through the desktop augmentation rather than a DOM script', async () => {
    const session = await createInProcessSession(storybookScene, { initialStory: 'components-button--interaction' });
    attach(session);
    const { browser } = session;

    const selector = byTestId('agentic-storybook-button-interactive');
    expect(await browser.desktop!.isFocused(selector)).toBe(false);

    await (await browser.$(selector)).click();

    expect(await browser.desktop!.isFocused(selector)).toBe(true);
    expect(await browser.desktop!.isFocused(byTestId('agentic-storybook-button-interactive-disabled'))).toBe(false);
  });

  it('scrolls through the backend execute method the portable command maps to', async () => {
    const session = await createInProcessSession(storybookScene, { initialStory: 'components-button--interaction' });
    attach(session);

    await expect(session.browser.desktop!.scrollIntoView(byTestId('agentic-storybook-button-interactive'))).resolves.toBeUndefined();
  });

  it('captures source and a screenshot artifact on demand', async () => {
    const session = await createInProcessSession(storybookScene, { initialStory: 'components-button--default' });
    attach(session);

    const artifacts = await session.browser.desktop!.captureArtifacts('button default failure');

    expect(artifacts.files).toEqual(
      expect.arrayContaining([
        expect.stringContaining('source.xml'),
        expect.stringContaining('screenshot.png'),
        expect.stringContaining('result.json'),
      ]),
    );
    expect(
      fs.readFileSync(
        path.join(
          artifacts.directory,
          artifacts.files.find((file) => file.endsWith('source.xml'))!,
        ),
        'utf8',
      ),
    ).toContain('agentic-storybook-button');
  });

  it('reports the portable matrix and ownership through getSessionInfo', async () => {
    const session = await createInProcessSession(storybookScene, { initialStory: 'components-button--default' });
    attach(session);

    const info = await session.browser.desktop!.getSessionInfo();

    expect(info.backend).toBe('fake');
    expect(info.ownership).toBe('external');
    expect(info.portableCommands).toContain('isFocused');
    expect(info.protocolVersion).toBe(1);
  });

  it('keeps the Storybook fake scene in step with the testIDs the stories declare', () => {
    const scene = JSON.parse(fs.readFileSync(storybookScene, 'utf8')) as {
      stories: Record<string, { elements: { testId: string }[] }>;
    };
    const stories = fs.readFileSync(buttonStories, 'utf8');

    for (const storyId of ['components-button--default', 'components-button--interaction']) {
      expect(Object.keys(scene.stories)).toContain(storyId);
      for (const element of scene.stories[storyId].elements) {
        expect(stories).toContain(element.testId);
      }
    }
  });
});
