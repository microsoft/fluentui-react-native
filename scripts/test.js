const {
  getRepoPackageNames,
  getRepoPackagePaths,
  getDependentPackageNames,
  getRepoHashKey,
  findGitRoot,
  gitListFiles,
  gitHashObject
} = require('./just-repo-utils');
const fs = require('fs');

function testStuff(strategy) {
  const options = strategy ? { strategy } : {};
  return [
    getRepoPackageNames(options),
    getRepoPackagePaths(options),
    getDependentPackageNames({ ...options, target: '@uifabricshared/foundation-compose' }),
    getDependentPackageNames({ ...options, target: '@uifabricshared/immutable-merge' }),
    getDependentPackageNames({ ...options, target: 'foo' })
  ];
}

function testSet(strategy) {
  console.time('test');
  const results = testStuff(strategy);
  console.timeEnd('test');
  results.forEach(result => console.log(result));
}

testSet('no-cache');
testSet();

console.log(`Hash is ${getRepoHashKey(findGitRoot())}`);
