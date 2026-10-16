import type { DesktopArtifact } from '../authoring/results.js';
import type { DesktopSessionClient } from '../client/DesktopDriverClient.js';
import type { ArtifactManager } from './ArtifactManager.js';

export type DesktopFailureEvidence = {
  artifacts: DesktopArtifact[];
  errors: string[];
};

/** Bounds secondary-window evidence so a runaway popup cannot dominate failure capture. */
export const maximumSecondaryWindowEvidence = 4;

/**
 * Captures failure evidence for a live session.
 *
 * Window events are read first because tree traversal is slow enough for transient windows to change state. The
 * current window is captured next, then each other open window, so popups, sheets, and error overlays are visible
 * in the evidence even when the test's current window is the main window.
 */
export async function captureDesktopFailureEvidence(
  session: DesktopSessionClient,
  artifacts: ArtifactManager,
  directory: string,
): Promise<DesktopFailureEvidence> {
  const captured: DesktopArtifact[] = [];
  const errors: string[] = [];
  const attempt = async (label: string, capture: () => Promise<DesktopArtifact>): Promise<void> => {
    try {
      captured.push(await capture());
    } catch (error) {
      errors.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  const screenshots = supportsScreenshots(session);

  if (session.recordsWindowEvents()) {
    await attempt('window events', async () =>
      artifacts.writeWindowEvents(directory, 'failure-window-events', await session.getWindowEvents()),
    );
  }
  if (screenshots) {
    await attempt('screenshot', async () => artifacts.writeScreenshot(directory, 'failure', await session.takeScreenshot()));
  }
  await attempt('source', async () => artifacts.writeSource(directory, 'failure-source', await session.getPageSource()));
  await attempt('tree', async () => artifacts.writeTree(directory, 'failure-tree', await session.getTree()));

  let current: string;
  let handles: string[];
  try {
    [current, handles] = await Promise.all([session.getWindowHandle(), session.getWindowHandles()]);
  } catch (error) {
    errors.push(`window handles: ${error instanceof Error ? error.message : String(error)}`);
    return { artifacts: captured, errors };
  }
  const secondary = handles.filter((handle) => handle !== current);
  if (secondary.length > maximumSecondaryWindowEvidence) {
    errors.push(`window handles: captured ${maximumSecondaryWindowEvidence} of ${secondary.length} secondary windows.`);
  }
  try {
    for (const [index, handle] of secondary.slice(0, maximumSecondaryWindowEvidence).entries()) {
      const name = `failure-window-${index + 1}`;
      try {
        await session.switchToWindow(handle);
      } catch (error) {
        // Transient windows often close while evidence is captured; record the gap and continue.
        errors.push(`${name} (${handle}): ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      if (screenshots) {
        await attempt(`${name} screenshot`, async () => artifacts.writeScreenshot(directory, name, await session.takeScreenshot()));
      }
      await attempt(`${name} source`, async () => artifacts.writeSource(directory, `${name}-source`, await session.getPageSource()));
    }
  } finally {
    if (secondary.length > 0) {
      await session.switchToWindow(current).catch((error: unknown) => {
        errors.push(`restore window ${current}: ${error instanceof Error ? error.message : String(error)}`);
      });
    }
  }
  return { artifacts: captured, errors };
}

function supportsScreenshots(session: DesktopSessionClient): boolean {
  const features = session.capabilities['furn:features'];
  return !!features && typeof features === 'object' && (features as Record<string, unknown>).screenshot === true;
}
