const path = require("path");

const sourceDir = "windows";
module.exports = {
  project: {
    windows: {
      sourceDir,
      solutionFile: "FluentTester.sln",
      project: {
        projectFile: path.relative(
          path.join(__dirname, sourceDir),
          path.join(
            "node_modules",
            ".generated",
            "windows",
            "ReactTestApp",
            "ReactTestApp.vcxproj"
          )
        ),
      },
    },
  },
  reactNativePath: "node_modules/react-native-windows",
};
