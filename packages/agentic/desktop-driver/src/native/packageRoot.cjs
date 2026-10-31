// A CommonJS anchor works in both the published ESM library and the source Jest host.
exports.nativeDriverPackageRoot = require('node:path').resolve(__dirname, '..', '..');
