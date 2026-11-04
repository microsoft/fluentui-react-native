// Native contract for the macOS application-incarnation helper mode behind createMacOSApplicationProbe. Real processes
// prove that the adapter and the helper agree on the wire format, that a live incarnation is running, and that an
// incarnation is exited only once its process is gone or its process id names a later process. Opt in with
// FURN_NATIVE_DRIVER_TEST=1: yarn test --runInBand applicationIncarnation.contract
import { spawn } from 'node:child_process';
import { once } from 'node:events';

import { createMacOSApplicationProbe } from '../../authority/macosApplicationProbe';
import { describeMacOSService } from '../../authority/macosServiceIdentity';
import { buildNativeDesktopDriver } from '../nativeDriver';

jest.setTimeout(240_000);

const macosTest = process.platform === 'darwin' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;

macosTest('proves the exit of the exact application incarnation and nothing less', async () => {
  const artifact = await buildNativeDesktopDriver({ platform: 'macos' });
  const probe = createMacOSApplicationProbe({ artifact });
  const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000);'], { stdio: 'ignore' });
  try {
    const pid = child.pid!;
    const { startedAt } = await describeMacOSService({ artifact, pid });
    // Application leases record the start time to the millisecond.
    const processStartedAt = `${startedAt.slice(0, 23)}Z`;

    await expect(probe({ processId: pid, processStartedAt })).resolves.toBe('running');
    await expect(probe({ processId: pid, processStartedAt: '1970-01-01T00:00:00.000Z' })).resolves.toBe('exited');
    await expect(probe({ processId: pid, processStartedAt: '2999-01-01T00:00:00.000Z' })).resolves.toBe('unknown');
    // Another user's process is outside what the kernel shows this user.
    await expect(probe({ processId: 1, processStartedAt })).resolves.toBe('unknown');

    child.kill();
    await once(child, 'exit');
    await expect(probe({ processId: pid, processStartedAt })).resolves.toBe('exited');
  } finally {
    child.kill();
  }
});
