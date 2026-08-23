import * as path from 'node:path';

import { attachIdentityPrecedence, defaultBackendFor, resolveDesktopOptions } from './config.ts';
import { DesktopValidationError } from './errors.ts';
import { hostForUrl } from './net.ts';

describe('desktop driver configuration', () => {
  it('formats IPv6 loopback addresses for HTTP URLs', () => {
    expect(hostForUrl('127.0.0.1')).toBe('127.0.0.1');
    expect(hostForUrl('localhost')).toBe('localhost');
    expect(hostForUrl('::1')).toBe('[::1]');
  });

  it('fills in defaults for a minimal launch target', () => {
    const resolved = resolveDesktopOptions({ platform: 'macos', target: { mode: 'launch', app: '/Applications/Sample.app' } });

    expect(resolved.backend).toBe('mac2');
    expect(resolved.host).toBe('127.0.0.1');
    expect(resolved.port).toBe(0);
    expect(resolved.readiness.requireWindow).toBe(true);
    expect(resolved.storybook.port).toBe(7007);
    expect(resolved.artifactsDirectory.endsWith(path.join('artifacts', 'desktop-tests'))).toBe(true);
  });

  it('rejects a non-loopback driver host', () => {
    expect(() => resolveDesktopOptions({ platform: 'macos', host: '0.0.0.0', target: { mode: 'launch', app: 'com.example.app' } })).toThrow(
      /loopback/,
    );
  });

  it('rejects a backend that does not belong to the platform', () => {
    expect(() => resolveDesktopOptions({ platform: 'macos', backend: 'novawindows', target: { mode: 'launch', app: 'a' } })).toThrow(
      DesktopValidationError,
    );
  });

  it('validates nested runtime configuration before starting a host', () => {
    expect(() =>
      resolveDesktopOptions({
        platform: 'windows',
        target: { mode: 'launch', app: 'Sample.exe', environment: { VALID: 'yes', INVALID: 42 as unknown as string } },
        readiness: { requireWindow: 'yes' as unknown as boolean, timeout: -1 },
        storybook: { host: '0.0.0.0', port: 70_000, renderTimeout: 0, specRoots: ['src', ''] },
      }),
    ).toThrow(/environment|requireWindow|timeout|storybook/);
  });

  it('accepts repeated acyclic fake-scene values', () => {
    const element = { testId: 'shared' };
    expect(() =>
      resolveDesktopOptions({
        platform: 'fake',
        target: { mode: 'attach', identity: 'fake' },
        fakeScene: {
          stories: {
            one: { elements: [element] },
            two: { elements: [element] },
          },
        },
      }),
    ).not.toThrow();
  });

  it('rejects an attach target with no identity', () => {
    expect(() => resolveDesktopOptions({ platform: 'windows', target: { mode: 'attach' } })).toThrow(
      /identity, processId, windowHandle, or title/,
    );
  });

  it('requires an identity-pinned macOS attach target', () => {
    expect(() => resolveDesktopOptions({ platform: 'macos', target: { mode: 'attach', processId: 42 } })).toThrow(
      /macOS attach requires identity/,
    );
    expect(() =>
      resolveDesktopOptions({ platform: 'macos', target: { mode: 'attach', identity: 'com.example.Sample', title: 'Sample' } }),
    ).toThrow(/does not support processId, windowHandle, or title/);
  });

  it('ranks attach identities so exact handles win over fuzzy ones', () => {
    const order = attachIdentityPrecedence({ mode: 'attach', title: 'Storybook', identity: 'com.example', processId: 42 });
    expect(order).toEqual(['processId', 'identity', 'title']);
  });

  it('defaults each platform to its documented backend', () => {
    expect(defaultBackendFor('macos')).toBe('mac2');
    expect(defaultBackendFor('windows')).toBe('novawindows');
    expect(defaultBackendFor('fake')).toBe('fake');
  });
});
