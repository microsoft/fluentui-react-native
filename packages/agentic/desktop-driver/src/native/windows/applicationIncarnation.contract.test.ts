// Native contract for the Windows application-incarnation helper mode behind createWindowsApplicationProbe. Real processes
// prove that the adapter and the helper agree on the wire format, that a live incarnation is running, and that an
// incarnation is exited only once its process is gone or its process id names a later process. Opt in with
// FURN_NATIVE_DRIVER_TEST=1: yarn test --runInBand applicationIncarnation.contract
import { spawn } from 'node:child_process';
import { once } from 'node:events';

import { createWindowsApplicationProbe } from '../../authority/windowsApplicationProbe';
import { describeWindowsService } from '../../authority/windowsServiceIdentity';
import { buildNativeDesktopDriver } from '../nativeDriver';

jest.setTimeout(240_000);

const windowsTest = process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;

windowsTest('proves the exit of the exact application incarnation and nothing less', async () => {
  const artifact = await buildNativeDesktopDriver({ platform: 'windows' });
  const probe = createWindowsApplicationProbe({ artifact });
  const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000);'], { stdio: 'ignore' });
  try {
    const pid = child.pid!;
    // The Windows application lease records the start time to 100 ns, as the helper describes it.
    const { startedAt: processStartedAt } = await describeWindowsService({ artifact, pid });

    await expect(probe({ processId: pid, processStartedAt })).resolves.toBe('running');
    await expect(probe({ processId: pid, processStartedAt: `${processStartedAt.slice(0, 23)}Z` })).resolves.toBe('running');
    await expect(probe({ processId: pid, processStartedAt: '1970-01-01T00:00:00.000Z' })).resolves.toBe('exited');
    await expect(probe({ processId: pid, processStartedAt: '2999-01-01T00:00:00.000Z' })).resolves.toBe('unknown');
    await expect(probe({ processId: pid, processStartedAt: 'not a time' })).resolves.toBe('unknown');

    child.kill();
    await once(child, 'exit');
    await expect(probe({ processId: pid, processStartedAt })).resolves.toBe('exited');
  } finally {
    child.kill();
  }
});
