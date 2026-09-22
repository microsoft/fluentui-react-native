const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { realpathSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { pathToFileURL } = require('node:url');

const { scripts } = require('./package.json');

test('Appium discovers and loads the Yarn-managed Windows driver', async () => {
  const output = execFileSync(process.execPath, [require.resolve('appium/index.js'), 'driver', 'list', '--installed', '--json'], {
    cwd: __dirname,
    encoding: 'utf8',
    timeout: 60000,
  });
  const { windows } = JSON.parse(output);
  assert.ok(windows?.installed, 'The Windows driver must be registered before E2E starts.');

  const packagePath = require.resolve('appium-windows-driver/package.json');
  const driverPackage = require(packagePath);
  assert.equal(windows.version, driverPackage.version, 'Appium must use the driver version installed by Yarn.');
  assert.equal(realpathSync(windows.installPath), realpathSync(path.dirname(packagePath)));

  // Match Appium's dynamic import so missing peer dependencies fail during preparation.
  const driver = await import(pathToFileURL(require.resolve(windows.installPath)).href);
  assert.equal(typeof driver[windows.mainClass], 'function');
});

for (const platform of ['windows', 'win32']) {
  test(`${platform} E2E uses the workspace Appium home and only the Windows driver`, () => {
    assert.match(scripts[`e2etest:${platform}`], /\bAPPIUM_HOME=\.\s/);
    const { config } = require(`./wdio.conf.${platform}.js`);
    const appiumService = config.services.find(([name]) => name === 'appium');
    assert.equal(appiumService[1].args['use-drivers'], 'windows');
  });
}
