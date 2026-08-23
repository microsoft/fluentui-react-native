import { DesktopDriverError } from '../errors.ts';
import type { DesktopLifecycle } from '../lifecycle.ts';
import type { StoryController } from '../server/channel/client.ts';
import type { ResolvedDesktopDriverOptions } from '../types.ts';
import type { DesktopBrowserLike } from '../core/session.ts';
import type { PublishedEndpoint } from './run-context.ts';

export async function waitForDesktopReadiness(options: {
  browser: DesktopBrowserLike;
  controller: StoryController;
  driver: ResolvedDesktopDriverOptions;
  lifecycle: DesktopLifecycle;
  endpoint?: PublishedEndpoint;
}): Promise<void> {
  const { browser, controller, driver, lifecycle, endpoint } = options;
  const deadline = Date.now() + driver.readiness.timeout;
  let lastWindowError: unknown;
  const throwIfTerminated = (): void => {
    if (lifecycle.reason) {
      throw new DesktopDriverError(`Application lifecycle ended before readiness: ${lifecycle.reason}`, {
        kind: 'lifecycle',
        detail: { state: lifecycle.current, reason: lifecycle.reason },
      });
    }
  };

  if (driver.readiness.requireWindow) {
    let observed = driver.platform === 'fake' || Boolean(endpoint?.windowHandle);
    while (Date.now() < deadline && !observed) {
      throwIfTerminated();
      if (driver.backend === 'mac2') {
        const target = driver.target;
        const application =
          target.mode === 'attach'
            ? { bundleId: target.identity }
            : target.app.endsWith('.app') || target.app.includes('/')
              ? { path: target.app }
              : { bundleId: target.app };
        try {
          observed = Number(await browser.execute('macos: queryAppState', application)) >= 3;
        } catch (error) {
          lastWindowError = error;
        }
      } else {
        if (!browser.getWindowHandles) {
          throw new DesktopDriverError('The connected backend cannot verify the required application window', {
            kind: 'capability',
          });
        }
        observed = (await browser.getWindowHandles().catch(() => [])).length > 0;
      }
      if (!observed) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    if (!observed) {
      lifecycle.observeTimeout({ gate: 'window' });
      throw new DesktopDriverError('No application window was observed within the readiness budget', {
        kind: 'lifecycle',
        cause: lastWindowError,
        detail: lastWindowError
          ? { lastError: lastWindowError instanceof Error ? lastWindowError.message : String(lastWindowError) }
          : undefined,
      });
    }
  }

  if (driver.readiness.requireStorybookChannel) {
    let connected = false;
    while (Date.now() < deadline && !connected) {
      throwIfTerminated();
      connected = await controller.isConnected();
      if (!connected) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    if (!connected) {
      lifecycle.observeTimeout({ gate: 'storybookChannel' });
      throw new DesktopDriverError(`Storybook channel at ${controller.url} did not answer within the readiness budget`, {
        kind: 'storybook',
      });
    }
  }

  if (driver.readiness.requireTestId) {
    throwIfTerminated();
    if (driver.backend === 'mac2') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const element = await browser.$(`~${driver.readiness.requireTestId}`);
    const displayed = await element
      .waitForDisplayed({
        timeout: Math.max(1000, deadline - Date.now()),
        interval: driver.backend === 'mac2' ? 1000 : undefined,
      })
      .catch(() => false);
    if (!displayed) {
      lifecycle.observeTimeout({ gate: 'testId', testId: driver.readiness.requireTestId });
      throw new DesktopDriverError(`Readiness selector "${driver.readiness.requireTestId}" never became visible`, {
        kind: 'lifecycle',
      });
    }
  }
}
