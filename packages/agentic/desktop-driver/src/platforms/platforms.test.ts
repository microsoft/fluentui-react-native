import { macos, terminateLaunchedApp } from './macos.ts';
import { windows } from './windows.ts';
import type { DesktopBrowserLike } from '../wdio/commands.ts';

function createBrowser(ownership?: 'self' | 'external'): DesktopBrowserLike {
  return {
    execute: jest.fn().mockResolvedValue(undefined),
    desktop:
      ownership === undefined
        ? undefined
        : {
            getSessionInfo: jest.fn().mockResolvedValue({ ownership }),
          },
  } as unknown as DesktopBrowserLike;
}

describe('platform ownership guards', () => {
  it.each([undefined, 'external'] as const)('refuses macOS termination for %s ownership', async (ownership) => {
    const browser = createBrowser(ownership);
    await expect(terminateLaunchedApp(browser, 'com.example.Sample')).rejects.toThrow(/positively observed self ownership/);
    expect(browser.execute).not.toHaveBeenCalled();
  });

  it('allows macOS termination for a self-owned application', async () => {
    const browser = createBrowser('self');
    await terminateLaunchedApp(browser, 'com.example.Sample');
    expect(browser.execute).toHaveBeenCalledWith('macos: terminateApp', { bundleId: 'com.example.Sample' });
  });

  it('cannot bypass macOS ownership through the generic execute helper', async () => {
    const browser = createBrowser('external');
    await expect(macos(browser, 'macos: terminateApp', { bundleId: 'com.example.Sample' })).rejects.toThrow(
      /positively observed self ownership/,
    );
    expect(browser.execute).not.toHaveBeenCalled();
  });

  it.each([undefined, 'external'] as const)('refuses Windows closeApp for %s ownership', async (ownership) => {
    const browser = createBrowser(ownership);
    await expect(windows(browser, 'windows: closeApp')).rejects.toThrow(/positively observed self ownership/);
    expect(browser.execute).not.toHaveBeenCalled();
  });

  it('allows Windows closeApp for a self-owned application', async () => {
    const browser = createBrowser('self');
    await windows(browser, 'windows: closeApp');
    expect(browser.execute).toHaveBeenCalledWith('windows: closeApp', {});
  });
});
