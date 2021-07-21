const { exclusionList, makeMetroConfig } = require('@rnx-kit/metro-config');

const blockList = exclusionList([
  // Prevent Metro from crashing when closing Visual Studio
  /.*\/.vs\/.*/,
]);

module.exports = makeMetroConfig({
  projectRoot: __dirname,
  resolver: {
    blacklistRE: blockList,
    blockList,
  },
});
