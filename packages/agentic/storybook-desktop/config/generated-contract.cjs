// Shared by the Node integration and Metro through the trusted parent handoff. Keep this contract independent of React.
const path = require('node:path');
const driverManifestVersion = 3;
const credentialsVersion = 1;
const handoffVersion = 1;

const text = (value) => typeof value === 'string' && value.length > 0;
const integer = (value) => Number.isSafeInteger(value) && value >= 0;
const port = (value) => integer(value) && value > 0 && value <= 65535;
const oneOf =
  (...values) =>
  (value) =>
    values.includes(value);
const optional = (check) => (value) => value === undefined || check(value);
const array = (check) => (value) => Array.isArray(value) && value.every(check);
const record = (check) => (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(check);
const object = (fields) => (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).every((key) => Object.hasOwn(fields, key)) &&
  Object.entries(fields).every(([key, check]) => check(value[key]));
const endpoint = oneOf('macos', 'windows', 'win32');
const filename = (value) => text(value) && /^[a-z][a-z0-9-]{0,100}\.(json|js)$/.test(value);
const applicationFields = {
  arguments: optional(array(text)),
  aumid: optional(text),
  bundleIdentifier: optional(text),
  executablePath: optional(text),
  windowTitle: optional(text),
  workingDirectory: optional(text),
};
const nativeArtifact = object({
  architecture: oneOf('arm64', 'x64'),
  artifactId: text,
  artifactRoot: text,
  buildFingerprint: text,
  buildId: text,
  compatibilityKey: text,
  configuration: oneOf('debug', 'release'),
  endpoints: array(endpoint),
  executablePath: text,
  features: array(text),
  origin: oneOf('built', 'cache', 'explicit-path', 'install-root'),
  provider: oneOf('macos', 'windows'),
  schemaVersion: oneOf(1),
  signing: object({
    certificateHash: optional(text),
    designatedRequirement: optional(text),
    identity: optional(text),
    mode: oneOf('adhoc', 'none', 'signed'),
    teamId: optional(text),
  }),
  sourceDigest: text,
  wireProtocol: object({ major: integer, minor: integer }),
});
const storyManifest = object({
  endpoint,
  entries: array(
    object({
      id: text,
      name: text,
      packageName: text,
      sourcePath: text,
      tags: array(text),
      title: text,
      // These are externally owned authoring contracts, validated by desktop-driver and the callback extractor.
      tests: optional(record(() => true)),
      wdio: optional(
        object({
          cases: optional(
            array(
              object({
                name: text,
                options: (value) => record(() => true)(value) && optional(oneOf('declared', 'derived'))(value.inputSource),
              }),
            ),
          ),
          digest: text,
          exportName: text,
          testNames: optional(array(text)),
        }),
      ),
    }),
  ),
  platformManifestDigest: text,
  portablePlanDigest: text,
  schemaVersion: oneOf(1),
});
const driverManifest = object({
  agent: optional(
    object({
      application: optional(object(applicationFields)),
      descriptor: text,
      readyPath: text,
      root: optional(text),
    }),
  ),
  application: object({ ...applicationFields, leasePath: text }),
  appName: text,
  credentials: object({ name: filename, root: text, runtimeModule: filename }),
  displayName: text,
  driverPort: port,
  endpoint,
  instanceId: text,
  metroPort: port,
  nativeDriver: nativeArtifact,
  platformManifestDigest: text,
  portablePlanDigest: text,
  renderer: oneOf('fabric', 'paper'),
  schemaVersion: oneOf(driverManifestVersion),
  scope: optional(object({ domains: record(array(text)), values: record(text) })),
  storyManifest,
  storybookPort: port,
  targetId: text,
  testIDPrefix: text,
  wdio: optional(
    object({
      clickMode: optional(oneOf('auto', 'accessibility', 'physical')),
      input: optional(oneOf('accessible', 'physical')),
      reporter: optional(oneOf('spec', 'tap', 'dot')),
      story: optional(text),
      tag: optional(text),
      test: optional(text),
      timeoutMs: optional((value) => integer(value) && value > 0 && value <= 2147483647),
    }),
  ),
});
const credentials = object({
  bridgeNonce: text,
  leaseNonce: text,
  manifestDigest: text,
  schemaVersion: oneOf(credentialsVersion),
});
const handoff = object({
  credentialsDigest: text,
  manifestDigest: text,
  nativeDriver: nativeArtifact,
  runtimeModuleDigest: text,
  runtimeModulePath: text,
  schemaVersion: oneOf(handoffVersion),
});

function parse(check, value, kind) {
  if (!check(value)) throw new TypeError(`Invalid or unsupported Desktop Storybook ${kind}.`);
  return value;
}

function parseDriverManifest(value) {
  const parsed = parse(driverManifest, value, 'driver manifest');
  if (
    parsed.storyManifest.endpoint !== parsed.endpoint ||
    parsed.storyManifest.platformManifestDigest !== parsed.platformManifestDigest ||
    parsed.storyManifest.portablePlanDigest !== parsed.portablePlanDigest ||
    !parsed.nativeDriver.endpoints.includes(parsed.endpoint) ||
    parsed.nativeDriver.provider !== (parsed.endpoint === 'macos' ? 'macos' : 'windows') ||
    (parsed.endpoint === 'win32' && parsed.renderer !== 'paper') ||
    (parsed.agent?.application &&
      (!parsed.agent.application.windowTitle || (!parsed.agent.application.aumid && !parsed.agent.application.executablePath)))
  ) {
    throw new TypeError('Inconsistent Desktop Storybook driver manifest identity.');
  }
  return parsed;
}

function parseCredentials(value) {
  const parsed = parse(credentials, value, 'credentials');
  if (parsed.bridgeNonce === parsed.leaseNonce) throw new TypeError('Desktop Storybook credentials must have distinct purposes.');
  return parsed;
}

function parseHandoff(value) {
  return parse(handoff, value, 'helper handoff');
}

function generatedPathIdentity(value, paths = path) {
  const normalized = paths.normalize(value);
  return paths.sep === '\\' ? normalized.toLowerCase() : normalized;
}

function sameGeneratedPath(left, right, paths = path) {
  return generatedPathIdentity(left, paths) === generatedPathIdentity(right, paths);
}

module.exports = {
  credentialsVersion,
  driverManifestVersion,
  generatedPathIdentity,
  handoffVersion,
  parseCredentials,
  parseDriverManifest,
  parseHandoff,
  sameGeneratedPath,
};
