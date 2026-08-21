import { defaultBackendFor } from './config.ts';
import { detectDesktopDriver, detectHostPlatform, installDesktopDriver, resolveDriverPackageVersion } from './drivers.ts';
import { availableBackends } from './driver-host/backends.ts';
import { DesktopDriverError } from './errors.ts';
import type { DesktopPrerequisiteStatus } from './types.ts';

const windowsRuntime: readonly DesktopPrerequisiteStatus[] = [
  { id: 'windows-version', description: 'Windows version', status: 'ok', detail: '10.0.26200' },
  { id: 'powershell', description: 'Windows PowerShell', status: 'ok', detail: 'C:\\Windows\\powershell.exe' },
];

describe('embedded driver management', () => {
  it('maps the host operating system to one supported desktop platform', () => {
    expect(detectHostPlatform('darwin')).toBe('macos');
    expect(detectHostPlatform('win32')).toBe('windows');
    expect(detectHostPlatform('linux')).toBe('fake');
  });

  it('makes NovaWindows the only default Windows backend', async () => {
    expect(defaultBackendFor('windows')).toBe('novawindows');
    expect(availableBackends('win32')).toEqual(['fake', 'novawindows']);
    const detected = await detectDesktopDriver('windows', {
      hostPlatform: 'win32',
      resolvePackageVersion: () => '1.4.4',
      loadPackage: () => undefined,
      prerequisites: windowsRuntime,
    });

    expect(detected).toMatchObject({
      backend: 'novawindows',
      packageName: 'appium-novawindows-driver',
      packageVersion: '1.4.4',
      status: 'ready',
    });
    expect(detected.detail).toContain('no native driver service');
  });

  it('resolves both embedded platform driver packages without executing them', async () => {
    await expect(resolveDriverPackageVersion('appium-mac2-driver')).resolves.toMatch(/^\d+\.\d+\.\d+/);
    await expect(resolveDriverPackageVersion('appium-novawindows-driver')).resolves.toMatch(/^\d+\.\d+\.\d+/);
  });

  it('reports a corrupt package installation instead of silently falling back', async () => {
    const detected = await detectDesktopDriver('windows', {
      hostPlatform: 'win32',
      resolvePackageVersion: () => undefined,
      loadPackage: () => undefined,
      prerequisites: windowsRuntime,
    });

    expect(detected.status).toBe('missing');
    expect(detected.detail).toContain('Reinstall this package');
  });

  it('does not claim a foreign platform driver can run', async () => {
    const detected = await detectDesktopDriver('windows', {
      hostPlatform: 'darwin',
      resolvePackageVersion: () => '1.4.4',
      loadPackage: () => undefined,
      prerequisites: windowsRuntime,
    });

    expect(detected).toMatchObject({ status: 'unsupported', backend: 'novawindows' });
  });

  it('treats install as an idempotent verification of embedded dependencies', async () => {
    const result = await installDesktopDriver('windows', {
      hostPlatform: 'win32',
      resolvePackageVersion: () => '1.4.4',
      loadPackage: () => undefined,
      prerequisites: windowsRuntime,
    });

    expect(result).toMatchObject({ changed: false, driver: { status: 'ready', backend: 'novawindows' } });
  });

  it('refuses installation when a required runtime is missing', async () => {
    await expect(
      installDesktopDriver('windows', {
        hostPlatform: 'win32',
        resolvePackageVersion: () => '1.4.4',
        loadPackage: () => undefined,
        prerequisites: [{ id: 'powershell', description: 'Windows PowerShell', status: 'missing' }],
      }),
    ).rejects.toThrow(DesktopDriverError);
  });

  it('reports a driver dependency that resolves but cannot load', async () => {
    const detected = await detectDesktopDriver('windows', {
      hostPlatform: 'win32',
      resolvePackageVersion: () => '1.4.4',
      loadPackage: () => {
        throw new Error('native binding failed');
      },
      prerequisites: windowsRuntime,
    });

    expect(detected.status).toBe('missing');
    expect(detected.detail).toContain('native binding failed');
  });
});
