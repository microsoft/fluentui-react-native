/**
 * Package version.
 *
 * `run.json`, the driver-host health payload, and `getSessionInfo()` all report it, so a captured
 * artifact can always be traced back to the code that produced it.
 *
 * It is a literal rather than a manifest read because this module is imported by code that runs
 * both as real ESM and under the CommonJS transform Jest applies, where `import.meta` is not
 * available. `package-version.test.ts` fails if it ever drifts from `package.json`.
 */
export const PACKAGE_VERSION = '0.1.0';
