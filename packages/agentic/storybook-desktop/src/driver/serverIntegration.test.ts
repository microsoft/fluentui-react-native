import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';

import type { DesktopStorybookDriverManifest } from './driverManifest.js';

jest.setTimeout(30_000);

describe('desktop Storybook server integration', () => {
  test('hosts the Storybook channel and Desktop Driver in one process', async () => {
    const [storybookPort, driverPort] = await Promise.all([getAvailablePort(), getAvailablePort()]);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-storybook-driver-'));
    const manifestPath = path.join(temporaryDirectory, 'driver-manifest.json');
    const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
    const driverManifest: DesktopStorybookDriverManifest = {
      appName: 'AgenticStorybook',
      bridgeNonce: 'integration-nonce',
      displayName: 'Agentic Components Storybook',
      driverPort,
      endpoint: 'windows',
      instanceId: 'integration',
      metroPort: 8081,
      platformManifestDigest: 'platform-digest',
      portablePlanDigest: 'portable-digest',
      renderer: 'fabric',
      schemaVersion: 1,
      storyManifest: {
        endpoint: 'windows',
        entries: [],
        platformManifestDigest: 'platform-digest',
        portablePlanDigest: 'portable-digest',
        schemaVersion: 1,
      },
      storybookPort,
      targetId: 'integration-windows',
      testIDPrefix: 'integration-storybook',
    };
    fs.writeFileSync(manifestPath, JSON.stringify(driverManifest));

    const child = spawn(process.execPath, [path.resolve(__dirname, '../../config/server-runner.cjs')], {
      env: {
        ...process.env,
        STORYBOOK_CONFIG_PATH: path.join(projectRoot, 'src'),
        STORYBOOK_DRIVER_MANIFEST: manifestPath,
        STORYBOOK_PROJECT_ROOT: projectRoot,
        STORYBOOK_WS_PORT: String(storybookPort),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const output: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => output.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => output.push(chunk));

    try {
      const [indexResponse, driverResponse] = await Promise.all([
        waitForResponse(loopbackUrl(storybookPort, '/index.json')),
        waitForResponse(loopbackUrl(driverPort, '/status')),
      ]);
      const index = (await indexResponse.json()) as { entries?: Record<string, unknown> };
      const driver = (await driverResponse.json()) as { value?: { ready?: boolean; targets?: { id?: string }[] } };

      expect(Object.keys(index.entries ?? {}).length).toBeGreaterThan(0);
      expect(driver.value).toMatchObject({
        ready: true,
        targets: [{ id: 'integration-windows' }],
      });
    } finally {
      child.kill();
      await waitForExit(child);
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }

    expect(Buffer.concat(output).toString('utf8')).toContain('WebDriver:');
  });
});

function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Could not allocate a loopback port.'));
        return;
      }
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function waitForResponse(url: string): Promise<Response> {
  const deadline = Date.now() + 20_000;
  let lastError: unknown;
  do {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      lastError = new Error(`${url} returned ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (Date.now() < deadline);
  throw new Error(`Timed out waiting for ${url}: ${(lastError as Error)?.message ?? 'not ready'}`);
}

function waitForExit(child: ReturnType<typeof spawn>): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => child.once('exit', () => resolve()));
}

function loopbackUrl(port: number, pathname: string): string {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- test-only loopback service
  return `http://127.0.0.1:${port}${pathname}`;
}
