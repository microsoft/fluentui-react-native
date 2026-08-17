
module.exports = {
    dependency: {
    platforms: {
      windows: {
        sourceDir: 'windows',
        projects: [
          {
            projectFile: 'Callout/Callout.vcxproj',
            directDependency: true,
          },
        ],
      },
    },
  },
}