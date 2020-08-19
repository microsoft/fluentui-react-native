const path = require('path');

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
    'module:metro-react-native-babel-preset',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.js',
          '.ts',
          '.tsx',
          '.json',
          '.android.js',
          '.android.ts',
          '.android.tsx',
          '.ios.js',
          '.ios.ts',
          '.ios.tsx',
          '.macos.js',
          '.macos.ts',
          '.macos.tsx',
          '.native.js',
          '.native.ts',
          '.native.tsx',
          '.web.js',
          '.web.ts',
          '.web.tsx',
          '.win32.js',
          '.win32.ts',
          '.win32.tsx',
          '.windows.js',
          '.windows.ts',
          '.windows.tsx',
        ],
      },
    ],
  ],
};
