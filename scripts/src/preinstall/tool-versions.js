/** @type {Record<string, string>} */
export const devToolVersions = {
  '@babel/core': '^7.22.5',
  '@babel/plugin-proposal-class-properties': '^7.18.6',
  '@babel/plugin-proposal-private-property-in-object': '^7.21.11',
  '@babel/plugin-transform-private-methods': '^7.27.1',
  '@babel/preset-env': '^7.8.0',
  '@babel/preset-react': '^7.8.0',
  '@babel/preset-typescript': '^7.8.0',
  '@eslint/js': '^9.0.0',
  '@microsoft/eslint-plugin-sdl': '^1.1.0',
  '@react-native-community/cli': '^13.6.4',
  '@react-native-community/cli-platform-android': '^13.6.4',
  '@react-native-community/cli-platform-ios': '^13.6.4',
  '@react-native/babel-preset': '^0.74.0',
  '@react-native/metro-babel-transformer': '^0.74.0',
  '@react-native/metro-config': '^0.74.0',
  '@rnx-kit/eslint-plugin': '^0.8.6',
  '@rnx-kit/jest-preset': '^0.2.1',
  '@rnx-kit/tools-packages': '^0.1.1',
  '@rnx-kit/tools-typescript': '^0.1.1',
  '@rnx-kit/tsconfig': '^2.1.1',
  '@types/es6-collections': '^0.5.29',
  '@types/es6-promise': '0.0.32',
  '@types/jest': '^29.0.0',
  '@types/node': '^22.0.0',
  '@types/react-test-renderer': '16.9.0',
  '@typescript-eslint/eslint-plugin': '^8.36.0',
  '@typescript-eslint/parser': '^8.36.0',
  '@uifabric/prettier-rules': '^7.0.3',
  'babel-jest': '^29.7.0',
  clipanion: '^4.0.0-rc.4',
  depcheck: '^1.0.0',
  eslint: '^9.0.0',
  'eslint-plugin-import': '^2.27.5',
  'find-up': '^5.0.0',
  'fs-extra': '^7.0.1',
  glob: '^10.0.0',
  jest: '^29.2.1',
  'jest-diff': '^27.0.0',
  jsdom: '^25.0.0',
  'markdown-link-check': '^3.8.7',
  'metro-config': '^0.80.3',
  'metro-react-native-babel-transformer': '^0.76.5',
  prettier: '^2.4.1',
  'react-test-renderer': '18.2.0',
  rimraf: '^5.0.1',
  typescript: '^4.9.4',
};

/**
 *
 * @param {string} packageName
 * @returns {string | null}
 */
export function getToolVersion(packageName) {
  return devToolVersions[packageName] || null;
}
