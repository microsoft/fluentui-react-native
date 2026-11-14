const path = require('node:path');
const { driverManifestVersion } = require('../../../config/generated-contract.cjs');

function createFixtureStoredManifest(root, storyManifest) {
  const { endpoint, platformManifestDigest, portablePlanDigest } = storyManifest;
  return {
    application: { leasePath: path.join(root, '.private', `application-lease.${endpoint}.json`), windowTitle: 'Fixture' },
    appName: 'Fixture',
    credentials: { name: 'credentials-fixture.json', root: path.join(root, '.private'), runtimeModule: 'runtime-fixture.js' },
    displayName: 'Fixture',
    driverPort: 4723,
    endpoint,
    instanceId: 'fixture',
    metroPort: 8081,
    nativeDriver: {
      architecture: 'x64',
      artifactId: 'fixture',
      artifactRoot: root,
      buildFingerprint: 'fixture',
      buildId: 'fixture',
      compatibilityKey: 'fixture',
      configuration: 'release',
      endpoints: [endpoint],
      executablePath: path.join(root, 'helper'),
      features: [],
      origin: 'cache',
      provider: endpoint === 'macos' ? 'macos' : 'windows',
      schemaVersion: 1,
      signing: { mode: 'none' },
      sourceDigest: 'fixture',
      wireProtocol: { major: 1, minor: 0 },
    },
    platformManifestDigest,
    portablePlanDigest,
    renderer: endpoint === 'win32' ? 'paper' : 'fabric',
    schemaVersion: driverManifestVersion,
    storyManifest,
    storybookPort: 7007,
    targetId: 'fixture',
    testIDPrefix: 'fixture',
  };
}

module.exports = { createFixtureStoredManifest };
