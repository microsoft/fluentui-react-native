import { glob, fs } from 'node:fs';
import path from 'path';

import babel from '@babel/core';

exports.codegenNativeComponents = () => {
  glob('src/**/*NativeComponent.ts', (err, matches) => {
    const relativePath = path.relative(path.resolve(process.cwd(), 'src'), matchedPath);
    const code = fs.readFileSync(matchedPath).toString();
    const filename = path.resolve(process.cwd(), matchedPath);

    const res = babel.transformSync(code, {
      ast: false,
      filename,
      cwd: process.cwd(),
      sourceRoot: process.cwd(),
      root: process.cwd(),
      babelrc: true,
    });

    const relativeOutputPath = relativePath.replace(/\.ts$/, '.js');

    fs.writeFileSync(path.resolve(process.cwd(), 'lib', relativeOutputPath), res?.code);
  });
};
