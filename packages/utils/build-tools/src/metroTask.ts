// @ts-check
import Metro from 'metro';
import path from 'path';
import fs from 'fs';
import { logger, TaskFunction } from 'just-task';
import { AllPlatforms } from './platforms';
import { addPlatformMetroConfig } from './configureMetro';

export interface BundleDetails {
  /**
   * entry file such as './src/index.ts'
   */
  entry?: string;
  outputPath?: string;
  bundleName?: string;
  noPlatformSuffix?: boolean;
  noJSExtension?: boolean;
}

export type BundleDefinition = BundleDetails & {
  name?: string;
  targets?: AllPlatforms[];
  platforms?: {
    [K in AllPlatforms]: BundleDetails;
  };
};

export type MetroBundles = BundleDefinition | BundleDefinition[];

function asArray<T>(opt: T | T[]): T[] {
  return Array.isArray(opt) ? opt : [opt || ({} as T)];
}

/**
 * Load a bundle definition from package.json.  The bundle definition should be of type BundleDefinition and would
 * typically look something like:
 *  "metroBundles": {
 *    "targets": ["win32", "windows"],
 *    "entryFile": "./src/index.ts",
 *    "outputPath": "./dist",
 *    "outputFile": "myBundleName"
 *  }
 *
 * Platform specific overrides can be specified by using a platforms which works as a selector.  In this case
 * add:
 *  "metroBundles": {
 *    ...stuff
 *    "platforms": {
 *      "ios": {
 *        "outputFile": "myIOSName"
 *      }
 *    }
 *  }
 * @param bundleName - optional name of the bundle, use if there are multiple bundles defined in package JSON
 */
function loadBundleDefinition(bundleName?: string): BundleDefinition {
  const packageConfigPath = path.resolve(process.cwd(), 'package.json');
  const packageConfig = JSON.parse(fs.readFileSync(packageConfigPath, 'utf8'));

  const metroBundles = asArray<BundleDefinition>(packageConfig.metroBundles);
  if (bundleName) {
    return metroBundles.find(bundle => bundle.name === bundleName) || {};
  }

  if (metroBundles.length > 1) {
    logger.error('Multiple bundles are specified in the package, so bundle is ambiguous');
  } else if (metroBundles.length === 0) {
    logger.error('The package must contain a bundle definition');
  }
  return metroBundles[0];
}

/**
 * Resolves the platform selector for each bundle target
 * @param bundle - bundle definition, potentially including a platform selector
 * @param platform - current platform target
 */
function getOptionsForPlatform(bundle: BundleDefinition, platform: AllPlatforms): BundleDefinition {
  const platformValues = bundle.platforms && bundle.platforms[platform];
  return platformValues ? { ...bundle, ...platformValues } : bundle;
}

/**
 * options for the metro task
 */
export interface MetroTaskOptions {
  /**
   * name of the bundle to target, can be blank if the package.json only includes one bundle
   */
  bundleName?: string;

  /**
   * platform to bundle for, if blank will bundle for all platforms in this folder
   */
  platform?: AllPlatforms;

  /**
   * whether to bundle in development mode
   */
  dev?: boolean;

  /**
   * run metro in server mode
   */
  server?: boolean;

  /**
   * port override for server mode
   */
  port?: number;
}

export function metroTask(options: MetroTaskOptions = {}): TaskFunction {
  const { bundleName, platform, dev = false, server } = options;
  const port = options.port || (platform === 'windows' ? 8081 : 8080);

  return async function metroPack(done) {
    logger.verbose(`Starting metropack task with platform ${bundleName}...`);

    // get the bundle definition
    const definition = loadBundleDefinition(bundleName);
    const targets = (platform && [platform]) || definition.targets || [];

    for (const targetPlatform of targets) {
      // get the options specified for the platform
      const platformDefinition = getOptionsForPlatform(definition, targetPlatform);

      // set up file input and output
      const { entry = './lib/index.js', outputPath = './dist', bundleName, noJSExtension, noPlatformSuffix } = platformDefinition;
      let out = path.join(outputPath, bundleName);
      if (!noPlatformSuffix) {
        out = `${out}.${targetPlatform}`;
      }

      // get the config file, checking if there is a platform specific override
      let configName = `metro.config.${targetPlatform}.js`;
      configName = fs.existsSync(path.join(process.cwd(), configName)) ? configName : 'metro.config.js';
      const configBase = await Metro.loadConfig({ config: configName });

      // add platform specific details for bundling this config
      const config = addPlatformMetroConfig(targetPlatform, configBase) as any;
      if (server) {
        config.server = config.server || {};
        config.server.port = port;
      }

      // ensure the parent directory exists for the target output
      const parentDirectory = path.dirname(path.resolve(process.cwd(), out));
      if (!fs.existsSync(parentDirectory)) {
        fs.mkdirSync(parentDirectory);
      }

      if (server) {
        // for server start up the server, note that this is for only one platform, at least by configuration
        logger.info(`Starting metro server for ${targetPlatform} platform on port ${port}.`);

        await Metro.runServer(config, { port: port });

        // break out of the loop, doesn't make sense to run servers for multiple platforms
        break;
      } else {
        // log out what is about to happen
        logger.info(`Starting metro bundling for ${targetPlatform}.`);
        logger.info(`Entry file ${entry}.`);
        logger.info(`Output file ${out}.`);

        // now run the bundle task itself
        await Metro.runBuild(config, {
          platform: targetPlatform,
          entry,
          minify: !dev,
          out,
          optimize: !dev,
          sourceMap: dev
        });

        // optionally rename the output to remove the JS extension if requested
        if (noJSExtension && !out.endsWith('.js')) {
          const metroBundlePath = out + '.js';
          if (fs.existsSync(metroBundlePath)) {
            if (fs.existsSync(out)) {
              logger.verbose(`Deleting existing output file at ${out}...`);
              fs.unlinkSync(out);
            }

            logger.verbose(`Renaming ${metroBundlePath} to ${out}...`);
            fs.renameSync(metroBundlePath, out);
          }
        }

        logger.info(`Finished bundling ${out} for ${targetPlatform}.`);
      }
    }

    if (done) {
      done();
    }
  };
}
