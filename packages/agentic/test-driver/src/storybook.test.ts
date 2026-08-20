import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { DesktopTestService, secretsMatch } from './storybook/test-service.ts';
import { emitGeneratedStorySpec, verifyLinkedSpecTags } from './storybook/generated-spec.ts';
import { findStoryFiles, generateStoryTestManifest, resolveLinkedSpec, validateStoryTestManifest } from './storybook/manifest.ts';
import { StoryController } from './storybook/controller.ts';
import { DesktopCancelledError } from './errors.ts';
import { DESKTOP_PROTOCOL_VERSION } from './protocol.ts';

function workspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-storybook-'));
}

const BUTTON_STORY = `
import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { testID: 'agentic-storybook-button' },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  parameters: {
    desktopTest: {
      kind: 'inline',
      id: 'button-default',
      description: 'renders and responds to a press',
      steps: [
        { action: 'expectVisible', target: { testId: 'agentic-storybook-button' } },
        { action: 'press', target: { testId: 'agentic-storybook-button' } },
        { action: 'expect', target: { testId: 'agentic-storybook-button-status' }, property: 'text', equals: 'Pressed' },
      ],
    },
  },
};

export const WithLongText: Story = {
  render: () => null,
  parameters: {
    docs: { description: { story: 'wraps' } },
    desktopTest: { kind: 'spec', id: 'button-long-text', spec: './button.desktop.spec.ts' },
  },
};

export const Untested: Story = {};
`;

function seedStoryModule(root: string): string {
  const directory = path.join(root, 'src', 'components', 'button');
  fs.mkdirSync(directory, { recursive: true });
  const storyPath = path.join(directory, 'button.stories.tsx');
  fs.writeFileSync(storyPath, BUTTON_STORY, 'utf8');
  fs.writeFileSync(
    path.join(directory, 'button.desktop.spec.ts'),
    "describe('[story:components-button--with-long-text] Button long text', () => { it('wraps', () => undefined); });\n",
    'utf8',
  );
  return storyPath;
}

describe('story test manifest generation', () => {
  it('extracts inline and linked plans and derives Storybook-compatible ids', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);

    const manifest = generateStoryTestManifest({
      storyFiles: [storyPath],
      specRoots: [path.join(root, 'src')],
      generatedSpecPath: path.join(root, 'desktop-tests', 'story-plans.generated.spec.ts'),
    });

    expect(manifest.entries.map((entry) => entry.storyId)).toEqual(['components-button--default', 'components-button--with-long-text']);

    const [inline, linked] = manifest.entries;
    expect(inline.plan.kind).toBe('inline');
    expect(inline.tag).toBe('[story:components-button--default]');
    expect(inline.spec.endsWith('story-plans.generated.spec.ts')).toBe(true);
    expect(linked.plan.kind).toBe('spec');
    expect(linked.spec.endsWith('button.desktop.spec.ts')).toBe(true);
    expect(manifest.digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces a stable digest that changes when a plan or linked spec changes', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    const options = {
      storyFiles: [storyPath],
      specRoots: [path.join(root, 'src')],
      generatedSpecPath: path.join(root, 'desktop-tests', 'story-plans.generated.spec.ts'),
    };

    const first = generateStoryTestManifest(options);
    const second = generateStoryTestManifest(options);
    expect(second.digest).toBe(first.digest);

    fs.writeFileSync(storyPath, BUTTON_STORY.replace("equals: 'Pressed'", "equals: 'Tapped'"), 'utf8');
    expect(generateStoryTestManifest(options).digest).not.toBe(first.digest);

    fs.writeFileSync(storyPath, BUTTON_STORY, 'utf8');
    const restored = generateStoryTestManifest(options);
    fs.appendFileSync(path.join(root, 'src', 'components', 'button', 'button.desktop.spec.ts'), '// changed\n', 'utf8');
    expect(generateStoryTestManifest(options).digest).not.toBe(restored.digest);
  });

  it('rejects a duplicate plan id across stories', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    fs.writeFileSync(storyPath, BUTTON_STORY.replace("id: 'button-long-text'", "id: 'button-default'"), 'utf8');

    expect(() =>
      generateStoryTestManifest({
        storyFiles: [storyPath],
        specRoots: [path.join(root, 'src')],
        generatedSpecPath: path.join(root, 'generated.spec.ts'),
      }),
    ).toThrow(/Duplicate desktop story-test id/);
  });

  it('rejects duplicate Storybook ids', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    fs.writeFileSync(
      storyPath,
      BUTTON_STORY.replace(
        "    docs: { description: { story: 'wraps' } },",
        "    __id: 'components-button--default',\n    docs: { description: { story: 'wraps' } },",
      ),
      'utf8',
    );

    expect(() =>
      generateStoryTestManifest({
        storyFiles: [storyPath],
        specRoots: [path.join(root, 'src')],
        generatedSpecPath: path.join(root, 'generated.spec.ts'),
      }),
    ).toThrow(/Duplicate desktop story id/);
  });

  it('rejects empty discovery instead of producing a passing no-op suite', () => {
    const root = workspace();
    const storyPath = path.join(root, 'empty.stories.tsx');
    fs.writeFileSync(storyPath, "export default { title: 'Empty' }; export const Default = {};\n", 'utf8');
    expect(() =>
      generateStoryTestManifest({ storyFiles: [storyPath], specRoots: [root], generatedSpecPath: path.join(root, 'generated.spec.ts') }),
    ).toThrow(/No desktop story tests were discovered/);
  });

  it('rejects invalid source and parameters indirection that can hide desktop tests', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    fs.writeFileSync(
      storyPath,
      `
const sharedParameters = { desktopTest: { kind: 'inline', id: 'hidden', steps: [{ action: 'wait', milliseconds: 1 }] } };
export default { title: 'Hidden' };
export const Default = { parameters: sharedParameters };
`,
      'utf8',
    );
    expect(() =>
      generateStoryTestManifest({ storyFiles: [storyPath], specRoots: [root], generatedSpecPath: path.join(root, 'generated.spec.ts') }),
    ).toThrow(/parameters must be an inline object literal/);

    fs.writeFileSync(storyPath, 'export default { title: "Broken" }; export const Default = {', 'utf8');
    expect(() =>
      generateStoryTestManifest({ storyFiles: [storyPath], specRoots: [root], generatedSpecPath: path.join(root, 'generated.spec.ts') }),
    ).toThrow(/Failed to parse story module/);
  });

  it('fails when a story root is missing or contains no tested stories', () => {
    const root = workspace();
    expect(() => findStoryFiles([path.join(root, 'missing')])).toThrow(/Cannot read story root/);
    expect(findStoryFiles([root])).toEqual([]);
  });

  it('rejects a plan that is not a JSON literal', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    fs.writeFileSync(storyPath, BUTTON_STORY.replace("id: 'button-default',", '...sharedPlan,'), 'utf8');

    expect(() =>
      generateStoryTestManifest({
        storyFiles: [storyPath],
        specRoots: [path.join(root, 'src')],
        generatedSpecPath: path.join(root, 'generated.spec.ts'),
      }),
    ).toThrow(/plain JSON object literals/);
  });

  it('rejects a linked spec outside the configured roots', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    const outside = path.join(root, 'outside.spec.ts');
    fs.writeFileSync(outside, '// outside\n', 'utf8');

    expect(() => resolveLinkedSpec(storyPath, '../../../outside.spec.ts', [path.join(root, 'src')])).toThrow(
      /escapes the configured spec roots/,
    );
  });

  it('derives the id from the export key, not from a declared display name', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    // Storybook uses `toId(meta.id || meta.title, storyNameFromExport(exportKey))`; `name` is
    // display text only, so an id derived from it would never match the running application.
    fs.writeFileSync(
      storyPath,
      BUTTON_STORY.replace('export const Default: Story = {', "export const Default: Story = {\n  name: 'Basic',"),
      'utf8',
    );

    const manifest = generateStoryTestManifest({
      storyFiles: [storyPath],
      specRoots: [path.join(root, 'src')],
      generatedSpecPath: path.join(root, 'generated.spec.ts'),
    });
    const entry = manifest.entries.find((candidate) => candidate.plan.id === 'button-default')!;

    expect(entry.storyId).toBe('components-button--default');
    expect(entry.name).toBe('Basic');
  });

  it('honours meta.id and parameters.__id when deriving story ids', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    const source = BUTTON_STORY.replace("title: 'Components/Button',", "id: 'custom-button',\n  title: 'Components/Button',").replace(
      "    desktopTest: {\n      kind: 'inline',",
      "    __id: 'totally--custom',\n    desktopTest: {\n      kind: 'inline',",
    );
    fs.writeFileSync(storyPath, source, 'utf8');

    const manifest = generateStoryTestManifest({
      storyFiles: [storyPath],
      specRoots: [path.join(root, 'src')],
      generatedSpecPath: path.join(root, 'generated.spec.ts'),
    });

    expect(manifest.entries.find((candidate) => candidate.plan.id === 'button-default')?.storyId).toBe('totally--custom');
    expect(manifest.entries.find((candidate) => candidate.plan.id === 'button-long-text')?.storyId).toBe('custom-button--with-long-text');
  });

  it('rejects a manifest whose linked executable content changed', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    const manifest = generateStoryTestManifest({
      storyFiles: [storyPath],
      specRoots: [path.join(root, 'src')],
      generatedSpecPath: path.join(root, 'generated.spec.ts'),
    });
    expect(validateStoryTestManifest(manifest, 'memory')).toEqual(manifest);

    fs.appendFileSync(path.join(root, 'src', 'components', 'button', 'button.desktop.spec.ts'), '// tampered\n', 'utf8');
    expect(() => validateStoryTestManifest(manifest, 'memory')).toThrow(/Stale or tampered/);
  });

  it('rejects duplicate story ids in a loaded manifest', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    const manifest = generateStoryTestManifest({
      storyFiles: [storyPath],
      specRoots: [path.join(root, 'src')],
      generatedSpecPath: path.join(root, 'generated.spec.ts'),
    });
    const duplicate = { ...manifest, entries: [manifest.entries[0], manifest.entries[0]] };
    expect(() => validateStoryTestManifest(duplicate, 'memory')).toThrow(/Duplicate desktop story id/);
  });
});

describe('generated spec emission', () => {
  it('writes one tagged test per inline plan and a loadable manifest', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    const generatedSpecPath = path.join(root, 'desktop-tests', 'generated', 'story-plans.generated.spec.ts');
    const manifestPath = path.join(root, 'desktop-tests', 'generated', 'story-tests.manifest.json');

    const manifest = generateStoryTestManifest({
      storyFiles: [storyPath],
      specRoots: [path.join(root, 'src')],
      generatedSpecPath,
    });
    emitGeneratedStorySpec({ manifest, outputPath: generatedSpecPath, manifestPath });

    const contents = fs.readFileSync(generatedSpecPath, 'utf8');
    expect(contents).toContain('[story:components-button--default]');
    expect(contents).not.toContain('[story:components-button--with-long-text]');
    expect(contents).toContain('import manifest from "./story-tests.manifest.json"');
    expect(contents).toContain('entry.plan as InlineStoryPlan');
    expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).digest).toBe(manifest.digest);
  });

  it('fails discovery when a linked spec is missing its story tag', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    fs.writeFileSync(path.join(root, 'src', 'components', 'button', 'button.desktop.spec.ts'), "describe('untagged', () => {});\n", 'utf8');

    const manifest = generateStoryTestManifest({
      storyFiles: [storyPath],
      specRoots: [path.join(root, 'src')],
      generatedSpecPath: path.join(root, 'generated.spec.ts'),
    });

    expect(verifyLinkedSpecTags(manifest)).toEqual([
      expect.stringContaining('does not declare a runnable suite with the required tag [story:components-button--with-long-text]'),
    ]);
  });

  it('does not accept a tag in a comment, skipped suite, or suite without a test', () => {
    const root = workspace();
    const storyPath = seedStoryModule(root);
    const spec = path.join(root, 'src', 'components', 'button', 'button.desktop.spec.ts');
    const manifest = generateStoryTestManifest({
      storyFiles: [storyPath],
      specRoots: [path.join(root, 'src')],
      generatedSpecPath: path.join(root, 'generated.spec.ts'),
    });

    for (const source of [
      '// [story:components-button--with-long-text]\n',
      "describe.skip('[story:components-button--with-long-text]', () => { it('wraps', () => undefined); });\n",
      "describe('[story:components-button--with-long-text]', () => { describe.skip('disabled', () => { it('wraps', () => undefined); }); });\n",
      "describe('[story:components-button--with-long-text]', () => {});\n",
    ]) {
      fs.writeFileSync(spec, source, 'utf8');
      expect(verifyLinkedSpecTags(manifest)).toHaveLength(1);
    }
  });
});

describe('story controller', () => {
  it('retries selection until the device acknowledges the render', async () => {
    let attempts = 0;
    const controller = new StoryController({
      baseUrl: 'http://127.0.0.1:7007',
      renderTimeout: 2000,
      retryIntervalMs: 1,
      fetchImpl: (async () => {
        attempts += 1;
        const ok = attempts >= 3;
        return { ok, json: async () => (ok ? { success: true } : { error: 'not rendered' }), status: ok ? 200 : 503 } as Response;
      }) as typeof fetch,
    });

    await controller.select('components-button--default');
    expect(attempts).toBe(3);
  });

  it('fails with the story id and budget when the render never arrives', async () => {
    const controller = new StoryController({
      baseUrl: 'http://127.0.0.1:7007',
      renderTimeout: 30,
      retryIntervalMs: 1,
      fetchImpl: (async () => ({ ok: false, status: 503, json: async () => ({ error: 'nope' }) }) as Response) as typeof fetch,
    });

    await expect(controller.select('components-button--default')).rejects.toThrow(
      /Story "components-button--default" did not render within 30ms/,
    );
  });
});

describe('loopback test service', () => {
  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    digest: 'abc',
    entries: [
      {
        storyId: 'components-button--default',
        title: 'Components/Button',
        name: 'Default',
        tag: '[story:components-button--default]',
        spec: '/generated.spec.ts',
        grep: '\\[story:components-button--default\\]',
        plan: { kind: 'inline' as const, id: 'button-default', steps: [{ action: 'wait' as const, milliseconds: 1 }] },
        storyPath: '/button.stories.tsx',
      },
    ],
  };

  it('refuses to bind to a non-loopback interface', () => {
    expect(() => new DesktopTestService({ manifest, execute: async () => [], host: '0.0.0.0' })).toThrow(/non-loopback/);
  });

  it('mints a per-boot token', () => {
    const first = new DesktopTestService({ manifest, execute: async () => [] });
    const second = new DesktopTestService({ manifest, execute: async () => [] });
    expect(first.token).not.toBe(second.token);
    expect(first.token.length).toBeGreaterThan(20);
  });

  it('exposes the protocol version the app must send', () => {
    expect(DESKTOP_PROTOCOL_VERSION).toBe(1);
  });

  it('compares tokens without throwing on equal-length values with different byte lengths', () => {
    const token = 'a'.repeat(31);
    // Same character length, longer in bytes. A raw `timingSafeEqual` on the strings would throw,
    // and this comparison runs before authentication.
    const lookalike = `${'a'.repeat(30)}é`;

    expect(lookalike.length).toBe(token.length);
    expect(() => secretsMatch(lookalike, token)).not.toThrow();
    expect(secretsMatch(lookalike, token)).toBe(false);
    expect(secretsMatch('', token)).toBe(false);
    expect(secretsMatch(token, token)).toBe(true);
  });

  it('awaits an active runner after aborting it during shutdown', async () => {
    let cleanupFinished = false;
    const service = new DesktopTestService({
      manifest,
      port: 0,
      token: 'test-token',
      execute: async (_storyIds, _progress, signal) => {
        await new Promise<void>((resolve) => signal.addEventListener('abort', () => setTimeout(resolve, 5), { once: true }));
        cleanupFinished = true;
        throw new DesktopCancelledError();
      },
    });
    const { url } = await service.start();
    await fetch(`${url}/v1/runs`, {
      method: 'POST',
      headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
      body: JSON.stringify({ protocolVersion: 1, mode: 'all' }),
    });

    await service.stop();
    expect(cleanupFinished).toBe(true);
  });
});
