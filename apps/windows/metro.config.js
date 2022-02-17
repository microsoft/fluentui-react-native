const { exclusionList, makeMetroConfig } = require('@rnx-kit/metro-config');

const blockList = exclusionList([
  // Exclude other test apps
  /.*\/apps\/(?:android|ios|macos|web|win32)\/.*/,
  // Exclude build output directory
  /.*\/apps\/windows\/dist\/.*/,
]);

module.exports = makeMetroConfig({
  projectRoot: __dirname,
  resolver: {
    blacklistRE: blockList,
    blockList,
  },
});
