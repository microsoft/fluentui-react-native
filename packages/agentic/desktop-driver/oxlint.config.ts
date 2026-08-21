import baseConfig from '@fluentui-react-native/scripts/lint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig],
  rules: {
    // The desktop test service and driver host are loopback-only by construction; they bind to
    // 127.0.0.1 and talk to NovaWindows / WebDriverAgentMac endpoints that have no TLS setup.
    '@microsoft/sdl/no-insecure-url': 'off',
  },
});
