const fs = require('fs');
const path = require('path');

const projectFile = path.join(
  'node_modules',
  '.generated',
  'windows',
  'ReactTestApp',
  'ReactTestApp.vcxproj',
);

module.exports = {
  project: {
    windows: fs.existsSync(projectFile) && {
      sourceDir: 'windows',
      solutionFile: 'FluentTester.sln',
      project: {
        projectFile: path.relative(
          path.join(__dirname, 'windows'),
          projectFile,
        ),
      },
    },
  },
};
