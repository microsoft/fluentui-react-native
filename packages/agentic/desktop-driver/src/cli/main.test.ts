import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { assertKnownFlags, parseArgs } from './args.ts';
import { listRunningStories, selectRunningStory, smokeRunningStories, updateRunningStoryArgs } from './commands.ts';
import { main } from './main.ts';

describe('desktop-driver CLI parsing', () => {
  it('retains repeated options and positional story arguments', () => {
    expect(parseArgs(['stories', 'args', 'button--default', '{"appearance":"primary"}', '--story-root', 'a', '--story-root=b'])).toEqual({
      command: ['stories', 'args', 'button--default', '{"appearance":"primary"}'],
      flags: { 'story-root': 'b' },
      repeated: { 'story-root': ['a', 'b'] },
    });
  });

  it('rejects options that the selected command does not own', () => {
    expect(() => assertKnownFlags('config', 'resolve', { config: 'desktop.config.ts', port: '7007' })).toThrow(/--port/);
    expect(() => assertKnownFlags('stories', 'select', { config: 'desktop.config.ts', 'storybook-port': '7007' })).not.toThrow();
  });
});

describe('desktop-driver config CLI', () => {
  it.each(['resolve', 'print'])('prints a resolved config with provenance for config %s', async (subcommand) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-cli-config-'));
    fs.mkdirSync(path.join(root, 'src'));
    fs.writeFileSync(
      path.join(root, 'app.json'),
      JSON.stringify({ displayName: 'Sample', macos: { bundleIdentifier: 'com.example.Sample' } }),
      'utf8',
    );
    fs.writeFileSync(
      path.join(root, 'desktop.config.json'),
      JSON.stringify({
        schemaVersion: 1,
        application: { manifest: './app.json' },
        storybook: {
          configDir: './src',
          stories: [{ directory: './src', files: '**/*.stories.tsx' }],
        },
        tests: {
          generatedDirectory: './generated',
          artifactsDirectory: './artifacts',
          runner: { command: 'yarn' },
        },
        platforms: {
          fake: { backend: 'fake', target: { defaultMode: 'attach', attach: { identity: 'fake' } } },
          macos: {
            backend: 'mac2',
            target: { defaultMode: 'attach', attach: { identityFromApplicationManifest: 'macos.bundleIdentifier' } },
          },
          windows: {
            backend: 'novawindows',
            target: { defaultMode: 'attach', attach: { titleFromApplicationManifest: 'displayName' } },
          },
        },
      }),
      'utf8',
    );
    const output: string[] = [];
    const write = jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      output.push(String(chunk));
      return true;
    });
    try {
      await expect(main(['config', subcommand, '--config', path.join(root, 'desktop.config.json'), '--platform', 'macos'])).resolves.toBe(
        0,
      );
    } finally {
      write.mockRestore();
    }
    const resolved = JSON.parse(output.join('')) as { platform: string; sources: Record<string, string> };
    expect(resolved.platform).toBe('macos');
    expect(resolved.sources.platform).toBe('option:platform');
    expect(resolved.sources['target.identity']).toBe('application.manifest:macos.bundleIdentifier');
  });

  it('rejects unknown config options before loading a file', async () => {
    await expect(main(['config', 'resolve', '--unsupported'])).rejects.toThrow(/--unsupported/);
  });
});

describe('Storybook CLI commands', () => {
  function connection() {
    const selected: string[] = [];
    const events: unknown[] = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      const pathname = new URL(url).pathname;
      if (pathname === '/index.json') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            entries: {
              'button--default': { id: 'button--default', name: 'Default', title: 'Button', type: 'story' },
              docs: { id: 'docs', name: 'Docs', title: 'Button', type: 'docs' },
            },
          }),
        } as Response;
      }
      if (pathname.startsWith('/select-story-sync/')) {
        selected.push(decodeURIComponent(pathname.slice('/select-story-sync/'.length)));
        return { ok: true, status: 200, json: async () => ({}) } as Response;
      }
      if (pathname === '/send-event') {
        events.push(JSON.parse(String(init?.body)));
        return { ok: true, status: 200, json: async () => ({}) } as Response;
      }
      return { ok: false, status: 404, json: async () => ({ error: 'missing' }) } as Response;
    }) as typeof fetch;
    return {
      options: { fetchImpl },
      selected,
      events,
    };
  }

  it('lists, selects, updates args, and smokes through the packaged controller', async () => {
    const fixture = connection();

    await expect(listRunningStories(fixture.options)).resolves.toEqual([{ id: 'button--default', name: 'Default', title: 'Button' }]);
    await expect(selectRunningStory(fixture.options, 'button--default')).resolves.toEqual({
      storyId: 'button--default',
      rendered: true,
    });
    await expect(updateRunningStoryArgs(fixture.options, 'button--default', { appearance: 'primary' })).resolves.toEqual({
      storyId: 'button--default',
      updated: true,
    });
    await expect(smokeRunningStories(fixture.options)).resolves.toEqual({ success: true, stories: 1 });

    expect(fixture.selected).toEqual(['button--default', 'button--default']);
    expect(fixture.events).toEqual([
      { type: 'updateStoryArgs', args: [{ storyId: 'button--default', updatedArgs: { appearance: 'primary' } }] },
    ]);
  });
});
