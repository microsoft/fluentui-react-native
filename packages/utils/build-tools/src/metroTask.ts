// @ts-check
import Metro from 'metro';
import path from 'path';
import fs from 'fs';
import { logger } from 'just-task';
import { ensurePlatform } from './platforms';

function loadOptionsFromPackagesJson(bundleName) {
  const packageConfigPath = path.resolve('.', 'package.json');
  const packageConfig = JSON.parse(fs.readFileSync(packageConfigPath, 'utf8'));

  //  bail out if this package doesn't have any native bundle instructions
  if (!packageConfig.metroBundles) {
    return {};
  }

  return packageConfig.metroBundles[bundleName];
}

export function metroTask(bundleName) {
  return async function metroPack(done) {
    logger.verbose(`Starting metropack task with platform ${bundleName}...`);

    const options = loadOptionsFromPackagesJson(bundleName);
    const platform = ensurePlatform((options && options.platform) || 'default');
    const outputBundlePath = options && options.output;
    if (!outputBundlePath) {
      throw new Error(`Couldn't find the 'metroBundles/${bundleName}/output' attribute in your packages.json file.`);
    }
    let configName = platform && `metro.config.${platform}.js`;
    configName = configName && fs.existsSync(path.join(process.cwd(), configName)) ? configName : 'metro.config.js';
    const config = await Metro.loadConfig({ config: configName });

    const parentDirectory = path.dirname(path.resolve('.', outputBundlePath));
    if (!fs.existsSync(parentDirectory)) {
      fs.mkdirSync(parentDirectory);
    }

    const entryFile = (options && options.entry) || './lib/index.js';
    logger.info(`Entry file ${entryFile}.`);
    logger.info(`Output file ${outputBundlePath}.`);

    const dev = (options && options.dev) || false;

    await Metro.runBuild(config, {
      platform: (options && options.platform) || 'win32',
      entry: entryFile,
      minify: !dev,
      out: outputBundlePath,
      optimize: !dev,
      sourceMap: dev
    });

    // if the output file's extension is not '.js', metro appends the '.js' to it (how rude!)
    // we'll rename the bundle file back to the desired name.
    if (!outputBundlePath.endsWith('.js')) {
      const metroBundlePath = outputBundlePath + '.js';
      if (fs.existsSync(metroBundlePath)) {
        if (fs.existsSync(outputBundlePath)) {
          logger.verbose(`Deleting existing output file at ${outputBundlePath}...`);
          fs.unlinkSync(outputBundlePath);
        }

        logger.verbose(`Renaming ${metroBundlePath} to ${outputBundlePath}...`);
        fs.renameSync(metroBundlePath, outputBundlePath);
      }
    }

    if (done) {
      done();
    }
  };
}
