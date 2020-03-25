const path = require('path');

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
    'module:metro-react-native-babel-preset'
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          react: require.resolve('react', {
            paths: [path.join(__dirname, './')]
          }),
          '^react-native$': require.resolve(`react-native`, {
            paths: [path.join(__dirname, './')]
          }),
          '^react-native/(.+)': ([, name]) =>
            require.resolve(`react-native/${name}`, {
              paths: [path.join(__dirname, './')]
            })
        },
        extensions: [
          '.ios.js',
          '.ios.ts',
          '.ios.tsx',
          '.android.js',
          '.android.ts',
          '.android.tsx',
          '.native.js',
          '.native.ts',
          '.native.tsx',
          '.win32.js',
          '.win32.ts',
          '.win32.tsx',
          '.windows.js',
          '.windows.ts',
          '.windows.tsx',
          '.js',
          '.ts',
          '.tsx'
        ]
      }
    ]
  ]
};
