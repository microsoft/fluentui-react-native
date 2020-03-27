const {
  getPackageInfo
} = require('just-repo-utils');
const fs = require('fs');

function testStuff(strategy) {
  const options = strategy ? { strategy } : {};
  return [
    getPackageInfo(options).names(),
    getPackageInfo(options).paths(),
    getPackageInfo(options).dependencies({ ...options, target: '@uifabricshared/foundation-compose' }).names(),
    getPackageInfo(options).dependencies({ ...options, target: '@uifabricshared/immutable-merge' }).names(),
    getPackageInfo(options).dependencies({ ...options, target: 'foo' }).names()
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

