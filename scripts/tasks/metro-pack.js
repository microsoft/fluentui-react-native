// @ts-check
const Metro = require('metro');
const path = require('path');
const fs = require('fs');
const justTask = require('just-task');

function loadOptionsFromPackagesJson(platform) {
  const packageConfigPath = path.resolve('.', 'package.json');
  const packageConfig = JSON.parse(fs.readFileSync(packageConfigPath, 'utf8'));

  //  bail out if this package doesn't have any native bundle instructions
  if (!packageConfig.metroBundles) {
    return {};
  }

  return packageConfig.metroBundles[platform];
}

exports.metroPackTask = function(platform) {
  return async function metroPack(done) {
    justTask.logger.verbose(`Starting metropack task with platform ${platform}...`);

    const options = loadOptionsFromPackagesJson(platform);
    const outputBundlePath = options && options.output;
    if (!outputBundlePath) {
      throw new Error(`Couldn't find the 'metroBundles/${platform}/output' attribute in your packages.json file.`);
    }
    const config = await Metro.loadConfig();

    const parentDirectory = path.dirname(path.resolve('.', outputBundlePath));
    if (!fs.existsSync(parentDirectory)) {
      fs.mkdirSync(parentDirectory);
    }

    await Metro.runBuild(config, {
      platform: platform,
      entry: (options && options.entry) || './lib/index.js',
      minify: (options && options.minify) || true,
      out: outputBundlePath,
      optimize: true
    });

    done();
  };
};
