module.exports = {
  preset: require('./just.config'),
  just: require('just-scripts'),
  eslintPreset: require('./eslintrc'),
  ...require('./configs/index'),
  ...require('./utils/index')
};
