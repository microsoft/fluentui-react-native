const fs = require('fs');
const path = require('path');

const projectManifestPath = path.resolve(process.cwd(), 'package.json');
const foundProject = fs.existsSync(projectManifestPath);
const projectManifest = foundProject ? require(projectManifestPath) : null;
const platform = projectManifest?.furn?.jestPlatform ?? 'ios';

const rnPlatforms = ['ios', 'android', 'windows', 'macos', 'win32'];

/**
 * @typedef {import('jest').Config} JestConfig
 */

/**
 * @param {string | undefined} value
 * @returns {string}
 */
function asPlatformValue(value) {
  if (value && rnPlatforms.includes(value)) {
    return value;
  }
  return 'ios';
}

/**
 *
 * @param {string} [platform]
 * @returns {Record<string, unknown>}
 */
function configureReactNativeJest(platform) {
  // @ts-expect-error no types available for jest-preset
  const jestPreset = require('@rnx-kit/jest-preset');
  const config = jestPreset(asPlatformValue(platform), {
    roots: ['<rootDir>/src'],
    verbose: false,
    // React 19 requires this global to be set for act() to work properly
    globals: {
      IS_REACT_ACT_ENVIRONMENT: true,
    },
  });
  // In pnpm mode, we need to ensure that the transformIgnorePatterns
  // are set correctly to avoid issues with hoisted packages.
  config.transformIgnorePatterns = [
    '/node_modules/.store/(?!((jest-)?react-native(-macos)?|@react-native(-community)?|@office-iss-react-native-win32|@?react-native-windows))',
  ];
  // Transform configuration using babel-jest, pointing to our babel config
  config.transform = {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'babel-jest',
      {
        configFile: require.resolve('../babel.config.cjs'),
      },
    ],
  };
  return config;
}

module.exports = platform === 'react' ? require('./jest.react.config.cjs') : configureReactNativeJest(platform);
