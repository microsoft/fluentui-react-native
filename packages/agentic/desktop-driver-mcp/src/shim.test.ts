import { connectWithDescriptor, createDesktopDriverMcpServer } from './index.js';
import { runDesktopDriverMcpCli } from './cli.js';
import {
  connectWithDescriptor as replacementConnection,
  createDesktopDriverMcpServer as replacementServer,
} from '@fluentui-react-native/desktop-mcp';
import { runDesktopDriverMcpCli as replacementCli } from '@fluentui-react-native/desktop-mcp/cli';

test('forwards the legacy driver-only APIs and executable entry to desktop-mcp', () => {
  expect(connectWithDescriptor).toBe(replacementConnection);
  expect(createDesktopDriverMcpServer).toBe(replacementServer);
  expect(runDesktopDriverMcpCli).toBe(replacementCli);
});
