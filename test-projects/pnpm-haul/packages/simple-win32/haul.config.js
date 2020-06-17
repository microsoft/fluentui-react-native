import { withPolyfills, makeConfig } from '@haul-bundler/preset-0.60';

const platformAlias = {
  win32: '@office-iss/react-native-win32',
  windows: 'react-native-windows',
  macos: 'react-native-macos',
  web: 'react-native-web'
};

export default makeConfig({
  platforms: ['android', 'ios', 'win32'],
  templates: {
    filename: {
      custom: '[bundleName].[platform].bundle' // adjust the template for your needs
    }
  },
  bundles: {
    index: {
      entry: withPolyfills('./index'),
      transform({ bundleName, env, runtime, config }) {
        const rnAlias = platformAlias[env.platform];
        if (rnAlias) {
          config.resolve.alias = {
            ...config.resolve.alias,
            'react-native': rnAlias
          };
        }
      }
    }
  },
  resolve: {}
});
