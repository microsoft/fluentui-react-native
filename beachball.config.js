module.exports = {
  disallowedChangeTypes: ['major'],
  hooks: {
    prepublish: bumpInfo => {
      // iterate through the packages that are being published as part of the bump info
      for (const pkg in bumpInfo.packageInfos) {
        const packageJson = bumpInfo.packageInfos[pkg];
        if (packageJson && packageJson.onPublish && typeof packageJson.onPublish === 'object') {
          Object.assign(packageJson, packageJson.onPublish);
          delete packageJson.onPublish;
        }
      }
    }
  }
};
