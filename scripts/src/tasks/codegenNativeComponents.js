// @ts-check
import * as glob from 'glob';

const fs = require('fs');
const path = require('path');

exports.codegenNativeComponents = () => {
  const babel = require("@babel/core");
  const matches = glob.sync("src/**/*NativeComponent.ts");

  matches.forEach(matchedPath => {
    const relativePath = path.relative(path.resolve(process.cwd(), 'src'), matchedPath);
    const code = fs.readFileSync(matchedPath).toString();
    const filename = path.resolve(process.cwd(), matchedPath);

    const res = babel.transformSync(code,
      {
        ast: false,
        filename,
        cwd: process.cwd(),
        sourceRoot: process.cwd(),
        root: process.cwd(),
        babelrc: true
      });

    const relativeOutputPath = relativePath.replace(/\.ts$/, '.js');

    fs.writeFileSync(path.resolve(process.cwd(), 'lib', relativeOutputPath), res?.code);
  });



};
