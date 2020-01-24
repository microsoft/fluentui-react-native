// @ts-check
const Metro = require('metro');

exports.metroPack = async function(done) {
  const config = await Metro.loadConfig();
  console.log(config);

  await Metro.runBuild(config, {
    platform: 'win32',
    entry: './lib/index.js',
    minify: true,
    out: './dist/bundle.js'
  });

  done();
};
