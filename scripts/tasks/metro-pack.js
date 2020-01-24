// @ts-check
const Metro = require('metro');
const path = require('path');
const fs = require('fs');

exports.metroPack = async function(done) {
  const config = await Metro.loadConfig();
  console.log(config);

  const outputPath = path.resolve('.', './dist');
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  await Metro.runBuild(config, {
    platform: 'win32',
    entry: './lib/index.js',
    minify: true,
    out: './dist/bundle.js'
  });

  done();
};
