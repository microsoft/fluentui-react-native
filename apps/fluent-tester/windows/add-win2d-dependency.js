const fs = require('fs/promises');
const path = require('path');
const { Parser, Builder } = require('xml2js');

/**
 * As of this commit, the Win2D.uwp cpp package is not build transitive. Because react-native-svg consumes this as a dependency, this
 * causes issues when using react-native-test-app to build our app. To get around this, we directly add Win2D.uwp as a dependency to
 * ReactTestApp. This script automates this in the CI while Marlene Cota experiments with autolinking.
 */

const parser = new Parser();
const builder = new Builder();

const cppProjPath = path.resolve(__dirname, '..', 'node_modules', '.generated', 'windows', 'ReactTestApp', 'ReactTestApp.vcxproj');

fs.readFile(cppProjPath)
  .then((contents) => {
    return parser.parseStringPromise(contents);
  })
  .then((xmlData) => {
    const extensionTargets = xmlData.Project.ImportGroup.find((group) => group.$.Label === 'ExtensionTargets');
    if (extensionTargets.Import.find((Import) => Import.$.Project.includes('Win2D.uwp'))) {
      return 'Win2D.uwp is already included as a dependency.';
    }
    extensionTargets.Import.push({
      $: {
        Project: '$(SolutionDir)\\packages\\Win2D.uwp.1.26.0\\build\\native\\Win2D.uwp.targets',
        Condition: "Exists('$(SolutionDir)\\packages\\Win2D.uwp.1.26.0\\build\\native\\Win2D.uwp.targets')",
      },
    });
    const replacementContents = builder.buildObject(xmlData);
    return fs.writeFile(cppProjPath, replacementContents);
  })
  .then((msg) => {
    console.log(msg || "Win2D.UWP successfully added to ReactTestApp's import group.");
  })
  .catch((error) => {
    console.log(`Could not read ReactTestApp.vcxproj: ${error.message}`);
  });
