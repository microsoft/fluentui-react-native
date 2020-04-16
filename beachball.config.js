module.exports = {
  disallowedChangeTypes: ['major'],
  hooks: {
    prepublish: bumpInfo => {
      for (const pkg in bumpInfo.packageInfos) {
        const packageJson = bumpInfo.packageInfos[pkg];
        if (packageJson.main && packageJson.main.endsWith('.ts')) {
          packageJson.main = packageJson.main.replace('.ts', '.js').replace('src/', 'lib-commonjs');
        }
        if (packageJson.module && packageJson.module.endsWith('.ts')) {
          packageJson.module = packageJson.module.replace('.ts', '.js').replace('src/', 'lib');
        }
      }
    }
  }
};
