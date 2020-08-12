function depcheckTask() {
  return function(done) {
    const { logger } = require('just-scripts');
    const depcheck = require('depcheck');
    const options = {
      ignoreMatches: ['*eslint*', '*.d.ts', '*.test.*'],
      specials: [depcheck.special.eslint, depcheck.special.webpack, depcheck.special.jest]
    };
    return depcheck(process.cwd(), options, result => {
      try {
        if (result.devDependencies.length > 0) {
          logger.warn('Unused devDependencies');
          result.devDependencies.forEach(dependency => {
            logger.warn(`-- ${dependency}`);
          });
        }
        if (result.dependencies.length > 0 || result.missing) {
          if (result.dependencies.length > 0) {
            logger.error('Unused dependencies');
            result.dependencies.forEach(dependency => {
              logger.error(`-- ${dependency}`);
            });
          }

          if (result.missing) {
            Object.keys(result.missing).forEach(dependency => {
              logger.error(`Missing dependency on ${dependency}`);
              result.missing[dependency].forEach(file => {
                logger.error(`-- ${file}`);
              });
            });
          }
          throw 'Dependency checking failed';
        }
      } catch (error) {
        done(error);
      }
    });
  };
}

module.exports.depcheckTask = depcheckTask;
