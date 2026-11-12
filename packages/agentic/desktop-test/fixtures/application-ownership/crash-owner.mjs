import fs from 'node:fs';
import path from 'node:path';

import { NativeDesktopHost } from '@fluentui-react-native/desktop-driver';
import { createDesktopApplicationHost } from '../../lib/applicationOwnership.js';
import { createDesktopWorkloadClaim, describeDesktopWorkloadOwner } from '../../lib/ownership.js';

const [configurationFile, phase] = process.argv.slice(2);
const { artifact, application, directory } = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
if (phase !== 'pending' && phase !== 'acquired') throw new Error('Unknown publication interruption phase.');
const processIdentity = await describeDesktopWorkloadOwner({ helperPath: artifact.executablePath });
if (!processIdentity) throw new Error('The fixture owner requires verified OS identity.');
const claim = createDesktopWorkloadClaim({
  directory,
  runId: phase,
  targetId: 'crash-fixture',
  targetInstanceId: path.basename(directory),
  processIdentity,
});
const native = new NativeDesktopHost({ artifact, application, endpoint: 'macos' });
await createDesktopApplicationHost(native, {
  target: { endpoint: 'macos', id: 'crash-fixture', platformName: 'macos', launchTimeoutMs: 15_000 },
  lifetime: 'supervisor',
  resourcePrefix: phase,
  onResource(resource) {
    if (resource.readiness !== 'ready' || phase === 'acquired') claim.updateResource(resource);
    if (resource.readiness === 'ready') {
      fs.writeFileSync(path.join(directory, 'acquired.json'), JSON.stringify({ owner: processIdentity, resource }), {
        flag: 'wx',
        mode: 0o600,
      });
      // The parent kills this exact owner while publication or startup is interrupted.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0);
    }
  },
});
