import { processAliasTokens, transformWin32PlatformColorName } from '../processAliasTokens';

jest.mock('react-native', () => ({
  PlatformColor: (color: string) => `PlatformColor('${color}')`,
}));

const createAliasTokens = () => ({
  colors: {
    buttonFace: 'PlatformColor(ButtonFace)',
  },
});

it('preserves raw Win32 platform color names', () => {
  expect(processAliasTokens(createAliasTokens(), transformWin32PlatformColorName)).toEqual({
    colors: {
      buttonFace: "PlatformColor('ButtonFace')",
    },
  });
});
