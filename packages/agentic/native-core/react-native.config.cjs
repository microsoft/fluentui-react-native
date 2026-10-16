module.exports = {
  dependency: {
    platforms: {
      windows: {
        sourceDir: 'windows',
        projects: [
          {
            projectFile: 'NativeCore/NativeCore.vcxproj',
            directDependency: true,
          },
        ],
      },
    },
  },
};
