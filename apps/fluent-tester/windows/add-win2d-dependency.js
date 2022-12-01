const fs = require('fs/promises');
const path = require('path');

/**
 * As of this commit, the Win2D.uwp cpp package is not build transitive. Because react-native-svg consumes this as a dependency, this
 * causes issues when using react-native-test-app to build our app. To get around this, we directly add Win2D.uwp as a dependency to
 * ReactTestApp. This script automates this in the CI while Marlene Cota experiments with autolinking.
 *
 * This version of the script is also super fragile. If the pipeline fails for uwp, the contents of replacement.xml should be updated.
 */

console.warn('This script is prone to breaking. Should the UWP pipeline fail, this is the first place to check.');

const replacementPath = path.resolve(__dirname, 'replacement.xml');
const cppProjPath = path.resolve(__dirname, '..', 'node_modules', '.generated', 'windows', 'ReactTestApp', 'ReactTestApp.vcxproj');

fs.readFile(replacementPath)
  .then((contents) => fs.writeFile(cppProjPath, contents))
  .then(() => console.log('Updated contents of ReactTestApp.vcxproj.'))
  .catch((error) => console.log('Unable to update ReactTestApp.vcxproj: ' + error.message));
