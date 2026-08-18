module.exports = {
  dependency: {
    platforms: {
      windows: {
        sourceDir: 'windows',
        projects: [
          {
            projectFile: 'FRNFocusZone/FRNFocusZone.vcxproj',
            directDependency: true,
          },
        ],
      },
    },
  },
};
