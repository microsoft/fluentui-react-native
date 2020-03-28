/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 * @format
 */
'use strict';

const path = require('path');
const { findGitRoot, normalizeToUnixPath } = require('just-repo-utils');

function createHaste(roots) {
  const ROOTS = roots;

  const IGNORE_PATTERNS /*: Array<RegExp> */ = [
    /.*[\\\/]__(mocks|tests)__[\\\/].*/,
    /^Libraries[\\\/]Animated[\\\/]src[\\\/]polyfills[\\\/].*/,
    /^Libraries[\\\/]Renderer[\\\/]fb[\\\/].*/
  ];

  const INCLUDE_PREFIXES /*: Array<string> */ = [
    'IntegrationTests',
    'Libraries',
    'lib' + path.sep + 'Libraries',
    'ReactAndroid',
    'RNTester'
  ];

  const NAME_REDUCERS /*: Array<[RegExp, string]> */ = [
    // extract basename
    [/^(?:.*[\\\/])?([a-zA-Z0-9$_.-]+)$/, '$1'],
    // strip .js/.js.flow suffix
    [/^(.*)\.js(\.flow)?$/, '$1'],
    // strip platform suffix
    [/^(.*)\.(android|ios|native|windesktop|windows|win32|macos)$/, '$1']
  ];

  const haste = {
    /*
     * @return {string|void} hasteName for module at filePath; or undefined if
     *                       filePath is not a haste module
     */
    getHasteName(filePath /*: string */, sourceCode /*: ?string */) /*: string | void */ {
      if (!isHastePath(filePath)) {
        return undefined;
      }
      const hasteName = NAME_REDUCERS.reduce((name, [pattern, replacement]) => name.replace(pattern, replacement), filePath);

      return hasteName;
    }
  };

  function isHastePath(filePath /*: string */) /*: boolean */ {
    const root = ROOTS.find(r => filePath.startsWith(r));
    if (!root) {
      return false;
    }

    filePath = filePath.substr(root.length);
    if (IGNORE_PATTERNS.some(pattern => pattern.test(filePath))) {
      return false;
    }

    return INCLUDE_PREFIXES.some(prefix => filePath.startsWith(prefix));
  }

  return haste;
}

const rnPath = path.join(require.resolve('react-native-windows'), '../../..');
console.log(rnPath);
console.log(process.argv);
module.exports = createHaste([rnPath + path.sep]);

module.exports = createHaste([
  path.dirname(require.resolve('react-native/package.json', { paths: [process.cwd(), path.resolve(__dirname, '../../..')] })) + path.sep
]);

/**
 * Borrowed from react-native/jest/hasteImpl
 * Modified to handle finding plugins from the scripts folder instead of the folder above react-native
 */

('use strict');
const hasteImplFactory = require('./jest-haste-impl-factory');

const path = require('path');
const fs = require('fs');
const findPlugins = require('react-native/local-cli/core/findPlugins');

const plugins = findPlugins([process.cwd()]);

// Detect out-of-tree platforms and add them to the whitelists
const pluginRoots = plugins.haste.providesModuleNodeModules.map(name => {
  if (name === '@office-iss/react-native-win32')
    return fs.realpathSync(path.resolve(__dirname, '../node_modules/@office-iss/react-native-win32')) + path.sep;
  if (name === 'react-native-windows') return fs.realpathSync(path.resolve(__dirname, '../../src/react-native-windows')) + path.sep;
  throw new Error(`Need to know location of ${name}`);
});

const pluginNameReducers = plugins.haste.platforms.map(name => [new RegExp(`^(.*)\.(${name})$`), '$1']);

module.exports = hasteImplFactory(pluginRoots, pluginNameReducers);
