const fs = require('fs');
const path = require('path');

const windowsProjectFile = path.relative(
  path.join(__dirname, 'windows'),
  path.join(
    'node_modules',
    '.generated',
    'windows',
    'ReactTestApp',
    'ReactTestApp.vcxproj',
  ),
);

module.exports = {
  project: {
    windows: fs.existsSync(windowsProjectFile) && {
      sourceDir: 'windows',
      solutionFile: 'FluentTester.sln',
      project: {
        projectFile: windowsProjectFile,
      },
    },
  },
};
