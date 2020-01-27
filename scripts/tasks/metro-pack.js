// @ts-check
const Metro = require('metro');
const path = require('path');
const fs = require('fs');
const justTask = require('just-task');

function loadOptionsFromPackagesJson(bundleName) {
  const packageConfigPath = path.resolve('.', 'package.json');
  const packageConfig = JSON.parse(fs.readFileSync(packageConfigPath, 'utf8'));

  //  bail out if this package doesn't have any native bundle instructions
  if (!packageConfig.metroBundles) {
    return {};
  }

  return packageConfig.metroBundles[bundleName];
}

exports.metroPackTask = function(bundleName) {
  return async function metroPack(done) {
    justTask.logger.verbose(`Starting metropack task with platform ${bundleName}...`);

    const options = loadOptionsFromPackagesJson(bundleName);
    const outputBundlePath = options && options.output;
    if (!outputBundlePath) {
      throw new Error(`Couldn't find the 'metroBundles/${bundleName}/output' attribute in your packages.json file.`);
    }
    const config = await Metro.loadConfig();

    const parentDirectory = path.dirname(path.resolve('.', outputBundlePath));
    if (!fs.existsSync(parentDirectory)) {
      fs.mkdirSync(parentDirectory);
    }

    const entryFile = (options && options.entry) || './lib/index.js';
    justTask.logger.info(`Entry file ${entryFile}.`);
    justTask.logger.info(`Output file ${outputBundlePath}.`);

    await Metro.runBuild(config, {
      platform: (options && options.platform) || 'win32',
      entry: entryFile,
      minify: (options && options.minify) || true,
      out: outputBundlePath,
      optimize: true
    });

    if (done) {
      done();
    }
  };
};
