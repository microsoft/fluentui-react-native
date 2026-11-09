import { connectWithDescriptor } from './connection';

jest.mock('@fluentui-react-native/desktop-driver', () => {
  throw new Error('The MCP adapter must not load the desktop-driver root entry.');
});

describe('desktop-driver-mcp connection imports', () => {
  test('loads its connection implementation without the desktop-driver root entry', () => {
    expect(connectWithDescriptor).toEqual(expect.any(Function));
  });
});
